/**
 * MODULE 6: FEEDBACK LOOP ENGINE
 * Service: Track system learning and improvements
 * SAFETY: Read-only complaint analysis
 */

const BaseService = require('../shared/baseService');
const SafeQuery = require('../shared/safeQuery');
const FeedbackLoop = require('./model');

class FeedbackLoopService extends BaseService {
    constructor() {
        super('FeedbackLoop');
    }

    /**
     * Analyze learning patterns
     */
    async analyzeLearningPatterns(options = {}) {
        return this.safeExecute(async () => {
            const { days = 30 } = options;
            const timeRange = SafeQuery.getDefaultTimeRange(days);

            // ✅ SAFETY: Read-only aggregation
            const pipeline = [
                {
                    $match: {
                        createdAt: { $gte: timeRange.start, $lte: timeRange.end }
                    }
                },
                {
                    $group: {
                        _id: {
                            issueType: '$category',
                            department: '$department',
                            outcome: '$status'
                        },
                        count: { $sum: 1 },
                        avgTime: {
                            $avg: {
                                $divide: [
                                    { $subtract: ['$updatedAt', '$createdAt'] },
                                    3600000
                                ]
                            }
                        }
                    }
                }
            ];

            const result = await SafeQuery.aggregate(pipeline);
            if (!result.success) {
                return { patterns: [], message: 'Analysis failed' };
            }

            const patterns = result.data;
            const feedbackRecords = [];

            for (const pattern of patterns) {
                const issueType = pattern._id.issueType || 'other';
                const department = pattern._id.department || 'general';
                const outcome = pattern._id.outcome;

                // Calculate improvement rate
                const improvementRate = await this.calculateImprovementRate(issueType, department);
                const learningScore = this.calculateLearningScore(pattern, improvementRate);

                const record = await FeedbackLoop.findOneAndUpdate(
                    { issueType, department, resolutionOutcome: outcome },
                    {
                        issueType,
                        department,
                        resolutionOutcome: outcome,
                        frequency: pattern.count,
                        avgResolutionTime: pattern.avgTime || 0,
                        improvementRate,
                        learningScore,
                        analysisWindow: timeRange
                    },
                    { upsert: true, new: true }
                );

                feedbackRecords.push(record);
            }

            return {
                analyzed: patterns.length,
                feedbackRecords,
                insights: this.generateInsights(feedbackRecords)
            };
        }, 'analyzeLearningPatterns');
    }

    /**
     * Get improvement metrics
     */
    async getImprovementMetrics(options = {}) {
        return this.safeExecute(async () => {
            const { department = null } = options;

            const filter = {};
            if (department) filter.department = department;

            const records = await FeedbackLoop
                .find(filter)
                .sort({ learningScore: -1 })
                .lean();

            const metrics = {
                totalPatterns: records.length,
                avgLearningScore: this.calculateStats(records.map(r => r.learningScore)).avg,
                improving: records.filter(r => r.improvementRate > 0).length,
                declining: records.filter(r => r.improvementRate < 0).length,
                topLearners: records.slice(0, 10)
            };

            return metrics;
        }, 'getImprovementMetrics');
    }

    /**
     * Get department learning
     */
    async getDepartmentLearning(department) {
        return this.safeExecute(async () => {
            const records = await FeedbackLoop
                .find({ department })
                .sort({ recordedAt: -1 })
                .lean();

            const analysis = {
                department,
                totalPatterns: records.length,
                avgLearningScore: this.calculateStats(records.map(r => r.learningScore)).avg,
                avgImprovementRate: this.calculateStats(records.map(r => r.improvementRate)).avg,
                patterns: records,
                recommendations: this.generateDepartmentRecommendations(records)
            };

            return analysis;
        }, 'getDepartmentLearning');
    }

    /**
     * Calculate improvement rate
     */
    async calculateImprovementRate(issueType, department) {
        const historicalRecords = await FeedbackLoop
            .find({ issueType, department })
            .sort({ recordedAt: -1 })
            .limit(5)
            .lean();

        if (historicalRecords.length < 2) return 0;

        const times = historicalRecords.map(r => r.avgResolutionTime).reverse();
        const trend = this.calculateTrend(times);

        // Negative trend in resolution time = positive improvement
        return -trend * 10;
    }

    /**
     * Calculate learning score
     */
    calculateLearningScore(pattern, improvementRate) {
        let score = 50; // Base score

        // Frequency factor (more data = better learning)
        score += Math.min(pattern.count / 10, 20);

        // Improvement factor
        score += Math.min(Math.max(improvementRate, -20), 20);

        // Resolution time factor
        if (pattern.avgTime < 24) score += 10;
        else if (pattern.avgTime > 72) score -= 10;

        return Math.min(Math.max(Math.round(score), 0), 100);
    }

    /**
     * Generate insights
     */
    generateInsights(records) {
        const insights = [];

        const avgImprovement = this.calculateStats(records.map(r => r.improvementRate)).avg;
        if (avgImprovement > 5) {
            insights.push('📈 System is learning and improving overall');
        } else if (avgImprovement < -5) {
            insights.push('📉 System performance is declining - review needed');
        }

        const highLearners = records.filter(r => r.learningScore > 80);
        if (highLearners.length > 0) {
            insights.push(`✨ ${highLearners.length} patterns showing excellent learning`);
        }

        return insights;
    }

    /**
     * Generate department recommendations
     */
    generateDepartmentRecommendations(records) {
        const recommendations = [];

        const declining = records.filter(r => r.improvementRate < -5);
        if (declining.length > 0) {
            recommendations.push(`Review ${declining.length} declining patterns`);
        }

        const slowResolvers = records.filter(r => r.avgResolutionTime > 72);
        if (slowResolvers.length > 0) {
            recommendations.push(`Optimize ${slowResolvers.length} slow resolution patterns`);
        }

        return recommendations;
    }
}

module.exports = new FeedbackLoopService();
