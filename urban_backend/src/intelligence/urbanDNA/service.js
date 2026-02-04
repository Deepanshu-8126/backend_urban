/**
 * MODULE 3: URBAN DNA PROFILE
 * Service: Generate behavioral fingerprints for areas
 * SAFETY: Read-only complaint analysis
 */

const BaseService = require('../shared/baseService');
const SafeQuery = require('../shared/safeQuery');
const UrbanDNA = require('./model');

class UrbanDNAService extends BaseService {
    constructor() {
        super('UrbanDNA');
    }

    /**
     * Generate or update DNA profile for an area
     */
    async generateAreaDNA(areaId, options = {}) {
        return this.safeExecute(async () => {
            const { days = 90 } = options;
            const timeRange = SafeQuery.getDefaultTimeRange(days);

            // ✅ SAFETY: Read-only query
            const result = await SafeQuery.getComplaintsByArea(areaId, timeRange);

            if (!result.success || result.data.length === 0) {
                return { message: 'No data available for this area' };
            }

            const complaints = result.data;

            // Analyze patterns
            const issueDistribution = this.calculateIssueDistribution(complaints);
            const seasonalPattern = this.calculateSeasonalPattern(complaints);
            const peakHours = this.calculatePeakHours(complaints);
            const riskMetrics = this.calculateRiskMetrics(complaints);

            const dominantIssue = Object.entries(issueDistribution)
                .sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown';

            const avgComplaintsPerDay = complaints.length / days;

            // Calculate resolution metrics
            const resolvedComplaints = complaints.filter(c => c.status === 'solved');
            const resolutionSuccessRate = this.calculatePercentage(resolvedComplaints.length, complaints.length);

            const resolutionTimes = resolvedComplaints.map(c =>
                SafeQuery.calculateHoursDiff(c.createdAt, c.updatedAt)
            );
            const avgResolutionTime = this.calculateStats(resolutionTimes).avg;

            // Create or update DNA profile
            const dnaProfile = await UrbanDNA.findOneAndUpdate(
                { areaId },
                {
                    areaId,
                    dominantIssue,
                    issueDistribution,
                    seasonalPattern,
                    peakHours,
                    riskLevel: riskMetrics.level,
                    riskScore: riskMetrics.score,
                    avgComplaintsPerDay,
                    avgResolutionTime,
                    resolutionSuccessRate,
                    dataPoints: complaints.length,
                    lastUpdated: new Date()
                },
                { upsert: true, new: true }
            );

            return {
                areaId,
                profile: dnaProfile,
                analysis: {
                    complaintsAnalyzed: complaints.length,
                    timeRange
                }
            };
        }, 'generateAreaDNA');
    }

    /**
     * Get DNA profile for an area
     */
    async getAreaDNA(areaId) {
        return this.safeExecute(async () => {
            const profile = await UrbanDNA.findOne({ areaId }).lean();

            if (!profile) {
                return {
                    message: 'No DNA profile found. Generate one first.',
                    areaId
                };
            }

            return {
                areaId,
                profile,
                interpretation: this.interpretDNA(profile)
            };
        }, 'getAreaDNA');
    }

    /**
     * Get all area profiles
     */
    async getAllProfiles(options = {}) {
        return this.safeExecute(async () => {
            const { riskLevel = null, limit = 100 } = options;

            const filter = {};
            if (riskLevel) filter.riskLevel = riskLevel;

            const profiles = await UrbanDNA
                .find(filter)
                .sort({ riskScore: -1 })
                .limit(limit)
                .lean();

            return {
                count: profiles.length,
                profiles,
                riskDistribution: this.groupBy(profiles, 'riskLevel')
            };
        }, 'getAllProfiles');
    }

    /**
     * Get city-wide risk map
     */
    async getRiskMap() {
        return this.safeExecute(async () => {
            const profiles = await UrbanDNA.find().lean();

            const riskMap = profiles.map(p => ({
                areaId: p.areaId,
                riskLevel: p.riskLevel,
                riskScore: p.riskScore,
                dominantIssue: p.dominantIssue,
                avgComplaintsPerDay: p.avgComplaintsPerDay
            }));

            const cityStats = {
                totalAreas: profiles.length,
                avgRiskScore: this.calculateStats(profiles.map(p => p.riskScore)).avg,
                riskDistribution: this.groupBy(profiles, 'riskLevel'),
                topRiskAreas: riskMap.slice(0, 10)
            };

            return {
                riskMap,
                cityStats
            };
        }, 'getRiskMap');
    }

    /**
     * Calculate issue distribution
     */
    calculateIssueDistribution(complaints) {
        const distribution = {};
        const total = complaints.length;

        complaints.forEach(c => {
            const issue = c.category || c.department || 'other';
            distribution[issue] = (distribution[issue] || 0) + 1;
        });

        // Convert to percentages
        Object.keys(distribution).forEach(key => {
            distribution[key] = this.calculatePercentage(distribution[key], total);
        });

        return distribution;
    }

    /**
     * Calculate seasonal pattern
     */
    calculateSeasonalPattern(complaints) {
        const pattern = {};

        complaints.forEach(c => {
            const month = new Date(c.createdAt).getMonth();
            pattern[month] = (pattern[month] || 0) + 1;
        });

        return pattern;
    }

    /**
     * Calculate peak hours
     */
    calculatePeakHours(complaints) {
        const hourCounts = {};

        complaints.forEach(c => {
            const hour = new Date(c.createdAt).getHours();
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });

        // Get top 3 peak hours
        return Object.entries(hourCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([hour]) => parseInt(hour));
    }

    /**
     * Calculate risk metrics
     */
    calculateRiskMetrics(complaints) {
        const avgPerDay = complaints.length / 90;
        const pendingCount = complaints.filter(c => c.status === 'pending').length;
        const pendingRatio = this.calculatePercentage(pendingCount, complaints.length);

        // Risk score calculation
        let score = 0;
        score += Math.min(avgPerDay * 5, 40); // Volume factor (max 40)
        score += Math.min(pendingRatio * 0.6, 30); // Pending factor (max 30)
        score += Math.min(complaints.filter(c => c.priorityScore > 5).length / complaints.length * 100, 30); // Priority factor (max 30)

        const level = this.calculateSeverity(score, { low: 30, medium: 60 });

        return { score: Math.round(score), level };
    }

    /**
     * Interpret DNA profile
     */
    interpretDNA(profile) {
        const insights = [];

        if (profile.riskLevel === 'high' || profile.riskLevel === 'critical') {
            insights.push(`High risk area requiring immediate attention`);
        }

        if (profile.avgComplaintsPerDay > 5) {
            insights.push(`High complaint volume: ${profile.avgComplaintsPerDay.toFixed(1)} per day`);
        }

        if (profile.resolutionSuccessRate < 50) {
            insights.push(`Low resolution rate: ${profile.resolutionSuccessRate}%`);
        }

        insights.push(`Primary issue: ${profile.dominantIssue}`);
        insights.push(`Peak hours: ${profile.peakHours.join(', ')}`);

        return insights;
    }
}

module.exports = new UrbanDNAService();
