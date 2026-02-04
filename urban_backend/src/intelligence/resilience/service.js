/**
 * MODULE 5: CITY RESILIENCE INDEX
 * Service: Calculate recovery metrics and resilience scores
 * SAFETY: Read-only complaint analysis
 */

const BaseService = require('../shared/baseService');
const SafeQuery = require('../shared/safeQuery');
const ResilienceScore = require('./model');

class ResilienceService extends BaseService {
    constructor() {
        super('CityResilience');
    }

    /**
     * Calculate resilience for an area
     */
    async calculateAreaResilience(areaId, options = {}) {
        return this.safeExecute(async () => {
            const { days = 30 } = options;
            const timeRange = SafeQuery.getDefaultTimeRange(days);

            // ✅ SAFETY: Read-only query
            const result = await SafeQuery.getComplaintsByArea(areaId, timeRange);

            if (!result.success || result.data.length === 0) {
                return { message: 'No data available for this area' };
            }

            const complaints = result.data;

            // Calculate recovery metrics
            const recoveryMetrics = this.calculateRecoveryMetrics(complaints);
            const resilienceIndex = this.calculateResilienceIndex(recoveryMetrics);
            const trend = await this.calculateTrendForArea(areaId);

            // Department breakdown
            const departmentScores = this.calculateDepartmentScores(complaints);

            // Create or update resilience score
            const score = await ResilienceScore.findOneAndUpdate(
                { areaId },
                {
                    areaId,
                    ...recoveryMetrics,
                    resilienceIndex,
                    trend,
                    departmentScores,
                    analysisWindow: timeRange,
                    dataPoints: complaints.length
                },
                { upsert: true, new: true }
            );

            return {
                areaId,
                resilience: score,
                interpretation: this.interpretResilience(score)
            };
        }, 'calculateAreaResilience');
    }

    /**
     * Get city-wide resilience
     */
    async getCityResilience(options = {}) {
        return this.safeExecute(async () => {
            const { days = 30 } = options;

            // Get all area resilience scores
            const scores = await ResilienceScore
                .find()
                .sort({ resilienceIndex: -1 })
                .lean();

            if (scores.length === 0) {
                return { message: 'No resilience data available. Calculate area resilience first.' };
            }

            const cityStats = {
                totalAreas: scores.length,
                avgResilience: this.calculateStats(scores.map(s => s.resilienceIndex)).avg,
                avgRecoveryTime: this.calculateStats(scores.map(s => s.avgRecoveryTime)).avg,
                avgSuccessRate: this.calculateStats(scores.map(s => s.resolutionSuccessRate)).avg,
                trendDistribution: this.groupBy(scores, 'trend'),
                topResilientAreas: scores.slice(0, 10),
                weakestAreas: scores.slice(-10).reverse()
            };

            return {
                cityStats,
                scores,
                overallHealth: this.assessCityHealth(cityStats)
            };
        }, 'getCityResilience');
    }

    /**
     * Get resilience trends
     */
    async getResilienceTrends(options = {}) {
        return this.safeExecute(async () => {
            const { areaId = null, days = 90 } = options;
            const timeRange = SafeQuery.getDefaultTimeRange(days);

            const filter = {
                calculatedAt: { $gte: timeRange.start, $lte: timeRange.end }
            };
            if (areaId) filter.areaId = areaId;

            const history = await ResilienceScore
                .find(filter)
                .sort({ calculatedAt: 1 })
                .lean();

            const trendAnalysis = this.analyzeTrends(history);

            return {
                timeRange,
                history,
                trends: trendAnalysis
            };
        }, 'getResilienceTrends');
    }

    /**
     * Calculate recovery metrics from complaints
     */
    calculateRecoveryMetrics(complaints) {
        const resolved = complaints.filter(c => c.status === 'solved');
        const total = complaints.length;

        // Calculate recovery times
        const recoveryTimes = resolved.map(c =>
            SafeQuery.calculateHoursDiff(c.createdAt, c.updatedAt)
        );
        const avgRecoveryTime = this.calculateStats(recoveryTimes).avg || 0;

        // Calculate reopen ratio (fake/deleted as proxy for reopened)
        const reopened = complaints.filter(c => c.status === 'fake' || c.status === 'deleted').length;
        const reopenRatio = this.calculatePercentage(reopened, total);

        // Resolution success rate
        const resolutionSuccessRate = this.calculatePercentage(resolved.length, total);

        // First response time (time from creation to first status change)
        const working = complaints.filter(c => c.status === 'working' || c.status === 'solved');
        const responseTimes = working.map(c =>
            SafeQuery.calculateHoursDiff(c.createdAt, c.updatedAt)
        );
        const firstResponseTime = this.calculateStats(responseTimes).avg || 0;

        // Adaptability score (how well system adapts to different issue types)
        const issueTypes = [...new Set(complaints.map(c => c.category))];
        const adaptabilityScore = Math.min(issueTypes.length * 10, 100);

        return {
            avgRecoveryTime,
            reopenRatio,
            resolutionSuccessRate,
            firstResponseTime,
            adaptabilityScore
        };
    }

    /**
     * Calculate resilience index (0-100)
     */
    calculateResilienceIndex(metrics) {
        const {
            avgRecoveryTime,
            reopenRatio,
            resolutionSuccessRate,
            firstResponseTime,
            adaptabilityScore
        } = metrics;

        let score = 0;

        // Fast recovery = higher resilience (max 30 points)
        score += Math.max(0, 30 - (avgRecoveryTime / 24) * 5);

        // Low reopen ratio = higher resilience (max 20 points)
        score += Math.max(0, 20 - reopenRatio * 0.5);

        // High success rate = higher resilience (max 30 points)
        score += resolutionSuccessRate * 0.3;

        // Fast response = higher resilience (max 10 points)
        score += Math.max(0, 10 - (firstResponseTime / 12) * 5);

        // Adaptability (max 10 points)
        score += adaptabilityScore * 0.1;

        return Math.min(Math.round(score), 100);
    }

    /**
     * Calculate trend for area
     */
    async calculateTrendForArea(areaId) {
        const recentScores = await ResilienceScore
            .find({ areaId })
            .sort({ calculatedAt: -1 })
            .limit(5)
            .lean();

        if (recentScores.length < 2) return 'stable';

        const trend = this.calculateTrend(recentScores.map(s => s.resilienceIndex).reverse());

        if (trend > 0.5) return 'improving';
        if (trend < -0.5) return 'declining';
        return 'stable';
    }

    /**
     * Calculate department scores
     */
    calculateDepartmentScores(complaints) {
        const departments = this.groupBy(complaints, 'department');
        const scores = {};

        Object.keys(departments).forEach(dept => {
            const deptComplaints = departments[dept];
            const metrics = this.calculateRecoveryMetrics(deptComplaints);
            scores[dept] = this.calculateResilienceIndex(metrics);
        });

        return scores;
    }

    /**
     * Interpret resilience score
     */
    interpretResilience(score) {
        const insights = [];

        if (score.resilienceIndex >= 80) {
            insights.push('🟢 Excellent resilience - area recovers quickly from issues');
        } else if (score.resilienceIndex >= 60) {
            insights.push('🟡 Good resilience - moderate recovery capability');
        } else if (score.resilienceIndex >= 40) {
            insights.push('🟠 Fair resilience - improvement needed');
        } else {
            insights.push('🔴 Poor resilience - requires immediate attention');
        }

        if (score.avgRecoveryTime < 24) {
            insights.push('⚡ Fast recovery time');
        } else if (score.avgRecoveryTime > 72) {
            insights.push('🐌 Slow recovery time - optimize workflows');
        }

        if (score.reopenRatio > 20) {
            insights.push('⚠️ High reopen ratio - quality issues detected');
        }

        if (score.trend === 'improving') {
            insights.push('📈 Resilience is improving over time');
        } else if (score.trend === 'declining') {
            insights.push('📉 Resilience is declining - investigate causes');
        }

        return insights;
    }

    /**
     * Assess city health
     */
    assessCityHealth(cityStats) {
        const { avgResilience, avgRecoveryTime, avgSuccessRate } = cityStats;

        let health = 'Good';

        if (avgResilience < 50 || avgRecoveryTime > 72 || avgSuccessRate < 60) {
            health = 'Poor';
        } else if (avgResilience < 70 || avgRecoveryTime > 48 || avgSuccessRate < 75) {
            health = 'Fair';
        } else if (avgResilience >= 80 && avgRecoveryTime < 24 && avgSuccessRate >= 85) {
            health = 'Excellent';
        }

        return health;
    }

    /**
     * Analyze trends
     */
    analyzeTrends(history) {
        if (history.length < 2) return {};

        const resilienceValues = history.map(h => h.resilienceIndex);
        const recoveryTimes = history.map(h => h.avgRecoveryTime);

        return {
            resilienceTrend: this.calculateTrend(resilienceValues) > 0 ? 'improving' : 'declining',
            recoveryTimeTrend: this.calculateTrend(recoveryTimes) > 0 ? 'increasing' : 'decreasing',
            avgResilience: this.calculateStats(resilienceValues).avg
        };
    }
}

module.exports = new ResilienceService();
