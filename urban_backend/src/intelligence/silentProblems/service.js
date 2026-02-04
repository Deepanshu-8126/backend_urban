/**
 * MODULE 2: SILENT PROBLEM DETECTOR
 * Service: Detect areas with abnormal silence (missing complaints)
 * SAFETY: Read-only complaint analysis
 */

const BaseService = require('../shared/baseService');
const SafeQuery = require('../shared/safeQuery');
const SilentFlag = require('./model');

class SilentProblemService extends BaseService {
    constructor() {
        super('SilentProblemDetector');
    }

    /**
     * Analyze complaint patterns and detect silent zones
     */
    async detectSilentZones(options = {}) {
        return this.safeExecute(async () => {
            const { days = 7, threshold = 0.5 } = options;
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
                            area: { $substr: ['$location.address', 0, 50] },
                            department: '$department'
                        },
                        count: { $sum: 1 },
                        lastComplaint: { $max: '$createdAt' }
                    }
                }
            ];

            const result = await SafeQuery.aggregate(pipeline);
            if (!result.success) {
                return { silentZones: [], message: 'Analysis failed' };
            }

            const areaStats = result.data;

            // Calculate expected rates
            const avgRate = areaStats.reduce((sum, stat) => sum + stat.count, 0) / areaStats.length;

            const silentZones = [];
            const now = new Date();

            for (const stat of areaStats) {
                const areaId = stat._id.area || 'unknown';
                const department = stat._id.department || 'general';
                const actualRate = stat.count / days;
                const expectedRate = avgRate / days;

                // Calculate silence duration
                const silenceDuration = (now - new Date(stat.lastComplaint)) / (1000 * 60 * 60);

                // Detect if significantly below average
                const deviationPercentage = ((expectedRate - actualRate) / expectedRate) * 100;

                if (deviationPercentage > threshold * 100 || silenceDuration > 48) {
                    const severity = this.calculateSilenceSeverity(deviationPercentage, silenceDuration);

                    // Check if already flagged
                    const existingFlag = await SilentFlag.findOne({
                        areaId,
                        department,
                        resolved: false
                    });

                    if (!existingFlag) {
                        const flag = await SilentFlag.create({
                            areaId,
                            department,
                            expectedComplaintRate: expectedRate,
                            actualComplaintRate: actualRate,
                            silenceDuration,
                            deviationPercentage,
                            severity,
                            analysisWindow: {
                                start: timeRange.start,
                                end: timeRange.end
                            }
                        });

                        silentZones.push(flag);
                    }
                }
            }

            return {
                analyzed: areaStats.length,
                silentZonesDetected: silentZones.length,
                silentZones,
                threshold: threshold * 100 + '%'
            };
        }, 'detectSilentZones');
    }

    /**
     * Get active silent zones
     */
    async getActiveSilentZones(options = {}) {
        return this.safeExecute(async () => {
            const { severity = null, limit = 50 } = options;

            const filter = { resolved: false };
            if (severity) filter.severity = severity;

            const flags = await SilentFlag
                .find(filter)
                .sort({ severity: -1, detectedAt: -1 })
                .limit(limit)
                .lean();

            return {
                count: flags.length,
                flags,
                severityBreakdown: this.groupBy(flags, 'severity')
            };
        }, 'getActiveSilentZones');
    }

    /**
     * Get historical silent periods
     */
    async getHistory(options = {}) {
        return this.safeExecute(async () => {
            const { days = 30, areaId = null } = options;
            const timeRange = SafeQuery.getDefaultTimeRange(days);

            const filter = {
                detectedAt: { $gte: timeRange.start, $lte: timeRange.end }
            };
            if (areaId) filter.areaId = areaId;

            const history = await SilentFlag
                .find(filter)
                .sort({ detectedAt: -1 })
                .lean();

            return {
                timeRange,
                totalFlags: history.length,
                history,
                statistics: this.analyzeHistory(history)
            };
        }, 'getHistory');
    }

    /**
     * Resolve a silent flag
     */
    async resolveSilentFlag(flagId) {
        return this.safeExecute(async () => {
            const flag = await SilentFlag.findByIdAndUpdate(
                flagId,
                {
                    resolved: true,
                    resolvedAt: new Date()
                },
                { new: true }
            );

            return {
                resolved: true,
                flag
            };
        }, 'resolveSilentFlag');
    }

    /**
     * Calculate silence severity
     */
    calculateSilenceSeverity(deviationPercentage, silenceDuration) {
        const score = (deviationPercentage / 100) * 50 + (silenceDuration / 168) * 50; // 168 hours = 1 week

        if (score > 75) return 'critical';
        if (score > 50) return 'high';
        if (score > 25) return 'medium';
        return 'low';
    }

    /**
     * Analyze historical flags
     */
    analyzeHistory(history) {
        if (history.length === 0) return {};

        const severityDist = history.reduce((acc, flag) => {
            acc[flag.severity] = (acc[flag.severity] || 0) + 1;
            return acc;
        }, {});

        const avgSilenceDuration = history.reduce((sum, flag) => sum + flag.silenceDuration, 0) / history.length;

        return {
            totalFlags: history.length,
            severityDistribution: severityDist,
            avgSilenceDuration,
            resolvedCount: history.filter(f => f.resolved).length
        };
    }
}

module.exports = new SilentProblemService();
