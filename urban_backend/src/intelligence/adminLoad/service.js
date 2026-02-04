/**
 * MODULE 4: ADMIN COGNITIVE LOAD PANEL
 * Service: Measure admin workload and burnout risk
 * SAFETY: Read-only complaint analysis
 */

const BaseService = require('../shared/baseService');
const SafeQuery = require('../shared/safeQuery');
const AdminLoad = require('./model');
const Admin = require('../../models/Admin');

class AdminLoadService extends BaseService {
    constructor() {
        super('AdminCognitiveLoad');
    }

    /**
     * Calculate load for a specific admin
     */
    async calculateAdminLoad(adminId, options = {}) {
        return this.safeExecute(async () => {
            const { days = 7 } = options;
            const timeRange = SafeQuery.getDefaultTimeRange(days);

            // Get admin info
            const admin = await Admin.findById(adminId).lean();
            if (!admin) {
                return { message: 'Admin not found' };
            }

            // ✅ SAFETY: Read-only query for admin's complaints
            const pipeline = [
                {
                    $match: {
                        assignedOfficer: adminId,
                        createdAt: { $gte: timeRange.start, $lte: timeRange.end }
                    }
                },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                        avgTime: {
                            $avg: {
                                $divide: [
                                    { $subtract: ['$updatedAt', '$createdAt'] },
                                    3600000 // Convert to hours
                                ]
                            }
                        }
                    }
                }
            ];

            const result = await SafeQuery.aggregate(pipeline);
            const statusGroups = result.success ? result.data : [];

            // Calculate metrics
            const activeIssues = statusGroups.find(g => g._id === 'pending')?.count || 0;
            const workingIssues = statusGroups.find(g => g._id === 'working')?.count || 0;
            const solvedIssues = statusGroups.find(g => g._id === 'solved')?.count || 0;
            const totalIssues = statusGroups.reduce((sum, g) => sum + g.count, 0);

            const pendingIssues = activeIssues;
            const avgResolutionTime = statusGroups.find(g => g._id === 'solved')?.avgTime || 0;

            // Calculate workload score
            const workloadScore = this.calculateWorkloadScore({
                activeIssues,
                pendingIssues,
                workingIssues,
                avgResolutionTime
            });

            const burnoutRisk = this.calculateBurnoutRisk(workloadScore, activeIssues);
            const resolutionRate = this.calculatePercentage(solvedIssues, totalIssues);

            // Save load record
            const loadRecord = await AdminLoad.create({
                adminId,
                department: admin.department || 'general',
                activeIssues,
                pendingIssues,
                workingIssues,
                avgResponseTime: 0, // Can be calculated with more data
                avgResolutionTime,
                workloadScore,
                burnoutRisk,
                resolutionRate,
                qualityScore: this.calculateQualityScore(resolutionRate, avgResolutionTime),
                measurementWindow: timeRange
            });

            return {
                adminId,
                adminName: admin.name || 'Unknown',
                department: admin.department,
                load: loadRecord,
                recommendations: this.generateRecommendations(loadRecord)
            };
        }, 'calculateAdminLoad');
    }

    /**
     * Calculate load for entire department
     */
    async calculateDepartmentLoad(department, options = {}) {
        return this.safeExecute(async () => {
            const { days = 7 } = options;

            // Get all admins in department
            const admins = await Admin.find({ department }).lean();

            const loadRecords = [];
            for (const admin of admins) {
                const result = await this.calculateAdminLoad(admin._id.toString(), { days });
                if (result.success && result.data.load) {
                    loadRecords.push(result.data.load);
                }
            }

            const departmentStats = this.analyzeDepartmentLoad(loadRecords);

            return {
                department,
                adminCount: admins.length,
                loads: loadRecords,
                statistics: departmentStats,
                alerts: this.generateDepartmentAlerts(loadRecords)
            };
        }, 'calculateDepartmentLoad');
    }

    /**
     * Get overload alerts
     */
    async getOverloadAlerts(options = {}) {
        return this.safeExecute(async () => {
            const { severity = 'high' } = options;

            const filter = {
                burnoutRisk: { $in: ['high', 'critical'] }
            };

            const alerts = await AdminLoad
                .find(filter)
                .sort({ workloadScore: -1, measuredAt: -1 })
                .limit(50)
                .lean();

            return {
                count: alerts.length,
                alerts,
                criticalCount: alerts.filter(a => a.burnoutRisk === 'critical').length
            };
        }, 'getOverloadAlerts');
    }

    /**
     * Get admin load history
     */
    async getAdminLoadHistory(adminId, options = {}) {
        return this.safeExecute(async () => {
            const { days = 30 } = options;
            const timeRange = SafeQuery.getDefaultTimeRange(days);

            const history = await AdminLoad
                .find({
                    adminId,
                    measuredAt: { $gte: timeRange.start, $lte: timeRange.end }
                })
                .sort({ measuredAt: -1 })
                .lean();

            const trend = this.calculateTrend(history.map(h => h.workloadScore));

            return {
                adminId,
                history,
                trend: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
                avgWorkload: this.calculateStats(history.map(h => h.workloadScore)).avg
            };
        }, 'getAdminLoadHistory');
    }

    /**
     * Calculate workload score (0-100)
     */
    calculateWorkloadScore(metrics) {
        const { activeIssues, pendingIssues, workingIssues, avgResolutionTime } = metrics;

        let score = 0;
        score += Math.min(activeIssues * 5, 30); // Active issues factor
        score += Math.min(pendingIssues * 3, 25); // Pending factor
        score += Math.min(workingIssues * 2, 20); // Working factor
        score += Math.min(avgResolutionTime / 24 * 25, 25); // Resolution time factor

        return Math.min(Math.round(score), 100);
    }

    /**
     * Calculate burnout risk
     */
    calculateBurnoutRisk(workloadScore, activeIssues) {
        if (workloadScore > 80 || activeIssues > 20) return 'critical';
        if (workloadScore > 60 || activeIssues > 15) return 'high';
        if (workloadScore > 40 || activeIssues > 10) return 'medium';
        return 'low';
    }

    /**
     * Calculate quality score
     */
    calculateQualityScore(resolutionRate, avgResolutionTime) {
        const rateScore = resolutionRate * 0.6;
        const timeScore = Math.max(0, 40 - (avgResolutionTime / 24) * 10);
        return Math.round(rateScore + timeScore);
    }

    /**
     * Generate recommendations
     */
    generateRecommendations(loadRecord) {
        const recommendations = [];

        if (loadRecord.burnoutRisk === 'critical' || loadRecord.burnoutRisk === 'high') {
            recommendations.push('⚠️ High burnout risk - consider workload redistribution');
        }

        if (loadRecord.activeIssues > 15) {
            recommendations.push('📊 High active issue count - prioritize critical cases');
        }

        if (loadRecord.avgResolutionTime > 48) {
            recommendations.push('⏱️ Slow resolution time - review workflow efficiency');
        }

        if (loadRecord.resolutionRate < 50) {
            recommendations.push('✅ Low resolution rate - provide additional support');
        }

        if (recommendations.length === 0) {
            recommendations.push('✨ Workload is manageable - maintain current pace');
        }

        return recommendations;
    }

    /**
     * Analyze department load
     */
    analyzeDepartmentLoad(loadRecords) {
        if (loadRecords.length === 0) return {};

        const workloadScores = loadRecords.map(l => l.workloadScore);
        const burnoutDist = this.groupBy(loadRecords, 'burnoutRisk');

        return {
            avgWorkload: this.calculateStats(workloadScores).avg,
            maxWorkload: Math.max(...workloadScores),
            burnoutDistribution: burnoutDist,
            overloadedAdmins: loadRecords.filter(l => l.burnoutRisk === 'high' || l.burnoutRisk === 'critical').length
        };
    }

    /**
     * Generate department alerts
     */
    generateDepartmentAlerts(loadRecords) {
        const alerts = [];

        const criticalCount = loadRecords.filter(l => l.burnoutRisk === 'critical').length;
        if (criticalCount > 0) {
            alerts.push(`🚨 ${criticalCount} admin(s) at critical burnout risk`);
        }

        const avgWorkload = this.calculateStats(loadRecords.map(l => l.workloadScore)).avg;
        if (avgWorkload > 70) {
            alerts.push(`⚠️ Department average workload is high: ${avgWorkload.toFixed(1)}/100`);
        }

        return alerts;
    }
}

module.exports = new AdminLoadService();
