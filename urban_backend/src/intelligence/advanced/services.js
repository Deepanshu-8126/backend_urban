/**
 * MODULES 7-15: STREAMLINED IMPLEMENTATIONS
 * All modules follow the same safety pattern: Read-only complaint access
 */

const BaseService = require('../shared/baseService');
const SafeQuery = require('../shared/safeQuery');
const mongoose = require('mongoose');

// ==================== MODULE 7: DECISION SIMPLICITY SCORE ====================

const DecisionScoreSchema = new mongoose.Schema({
    complaintId: { type: String, required: true, index: true },
    issueType: { type: String, required: true },
    stepCount: { type: Number, default: 1 },
    timeToDecision: { type: Number, default: 0 }, // hours
    complexityScore: { type: Number, min: 0, max: 100, default: 50 },
    simplificationPotential: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    recordedAt: { type: Date, default: Date.now, index: true }
});

const DecisionScore = mongoose.model('DecisionScore', DecisionScoreSchema);

class DecisionScoreService extends BaseService {
    constructor() { super('DecisionScore'); }

    async analyzeComplexity(options = {}) {
        return this.safeExecute(async () => {
            const { days = 30 } = options;
            const timeRange = SafeQuery.getDefaultTimeRange(days);
            const result = await SafeQuery.getResolvedComplaints(timeRange);

            if (!result.success) return { analyzed: 0 };

            const scores = [];
            for (const complaint of result.data.slice(0, 100)) {
                const timeToDecision = SafeQuery.calculateHoursDiff(complaint.createdAt, complaint.updatedAt);
                const complexityScore = Math.min(Math.round((timeToDecision / 24) * 20 + 30), 100);
                const simplificationPotential = complexityScore > 70 ? 'high' : complexityScore > 50 ? 'medium' : 'low';

                const score = await DecisionScore.create({
                    complaintId: complaint._id.toString(),
                    issueType: complaint.category || 'other',
                    stepCount: 1,
                    timeToDecision,
                    complexityScore,
                    simplificationPotential
                });
                scores.push(score);
            }

            return { analyzed: scores.length, scores, avgComplexity: this.calculateStats(scores.map(s => s.complexityScore)).avg };
        }, 'analyzeComplexity');
    }

    async getComplexityMetrics(department) {
        return this.safeExecute(async () => {
            const scores = await DecisionScore.find().sort({ complexityScore: -1 }).limit(100).lean();
            return {
                totalAnalyzed: scores.length,
                avgComplexity: this.calculateStats(scores.map(s => s.complexityScore)).avg,
                highComplexity: scores.filter(s => s.complexityScore > 70).length,
                simplificationOpportunities: scores.filter(s => s.simplificationPotential === 'high').length
            };
        }, 'getComplexityMetrics');
    }
}

// ==================== MODULE 8: TIME-OF-DAY INTELLIGENCE ====================

class TimeIntelligenceService extends BaseService {
    constructor() { super('TimeIntelligence'); }

    async analyzePeakHours(options = {}) {
        return this.safeExecute(async () => {
            const { days = 30, department = null } = options;
            const timeRange = SafeQuery.getDefaultTimeRange(days);

            const pipeline = [
                { $match: { createdAt: { $gte: timeRange.start, $lte: timeRange.end } } },
                ...(department ? [{ $match: { department } }] : []),
                {
                    $group: {
                        _id: { $hour: '$createdAt' },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } }
            ];

            const result = await SafeQuery.aggregate(pipeline);
            const hourlyData = result.success ? result.data : [];

            const peakHours = hourlyData.slice(0, 3).map(h => ({ hour: h._id, count: h.count }));

            return {
                peakHours,
                hourlyDistribution: hourlyData,
                insights: this.generateTimeInsights(hourlyData)
            };
        }, 'analyzePeakHours');
    }

    generateTimeInsights(hourlyData) {
        if (hourlyData.length === 0) return [];
        const peak = hourlyData[0];
        return [
            `Peak hour: ${peak._id}:00 with ${peak.count} complaints`,
            `Recommend staffing adjustments for peak periods`
        ];
    }
}

// ==================== MODULE 9: TRUST INFRASTRUCTURE ====================

const TrustScoreSchema = new mongoose.Schema({
    areaId: { type: String, required: true, unique: true, index: true },
    trustIndex: { type: Number, min: 0, max: 100, default: 50 },
    delayFactor: { type: Number, default: 0 },
    resolutionRate: { type: Number, default: 0 },
    citizenSatisfaction: { type: Number, default: 0 },
    trend: { type: String, enum: ['improving', 'stable', 'declining'], default: 'stable' },
    calculatedAt: { type: Date, default: Date.now, index: true }
});

const TrustScore = mongoose.model('TrustScore', TrustScoreSchema);

class TrustService extends BaseService {
    constructor() { super('Trust'); }

    async calculateTrust(areaId, options = {}) {
        return this.safeExecute(async () => {
            const { days = 30 } = options;
            const timeRange = SafeQuery.getDefaultTimeRange(days);
            const result = await SafeQuery.getComplaintsByArea(areaId, timeRange);

            if (!result.success || result.data.length === 0) {
                return { message: 'No data available' };
            }

            const complaints = result.data;
            const resolved = complaints.filter(c => c.status === 'solved');
            const resolutionRate = this.calculatePercentage(resolved.length, complaints.length);

            const avgDelay = this.calculateStats(
                resolved.map(c => SafeQuery.calculateHoursDiff(c.createdAt, c.updatedAt))
            ).avg;

            const delayFactor = Math.min(avgDelay / 24, 10);
            const trustIndex = Math.max(0, Math.min(100, resolutionRate - delayFactor * 5));

            const trust = await TrustScore.findOneAndUpdate(
                { areaId },
                { areaId, trustIndex, delayFactor, resolutionRate, citizenSatisfaction: trustIndex },
                { upsert: true, new: true }
            );

            return { areaId, trust };
        }, 'calculateTrust');
    }

    async getCityTrust() {
        return this.safeExecute(async () => {
            const scores = await TrustScore.find().lean();
            return {
                avgTrust: this.calculateStats(scores.map(s => s.trustIndex)).avg,
                scores
            };
        }, 'getCityTrust');
    }
}

// ==================== MODULE 10: SYSTEM ETHICS PANEL ====================

const EthicsAuditSchema = new mongoose.Schema({
    issueType: { type: String, required: true, index: true },
    areaComparison: { type: Map, of: Number, default: {} },
    resolutionVariance: { type: Number, default: 0 },
    biasScore: { type: Number, min: 0, max: 100, default: 0 },
    fairnessIndex: { type: Number, min: 0, max: 100, default: 100 },
    recommendations: { type: [String], default: [] },
    auditedAt: { type: Date, default: Date.now, index: true }
});

const EthicsAudit = mongoose.model('EthicsAudit', EthicsAuditSchema);

class EthicsService extends BaseService {
    constructor() { super('Ethics'); }

    async performAudit(options = {}) {
        return this.safeExecute(async () => {
            const { days = 30 } = options;
            const timeRange = SafeQuery.getDefaultTimeRange(days);

            const pipeline = [
                { $match: { createdAt: { $gte: timeRange.start }, status: 'solved' } },
                {
                    $group: {
                        _id: { issueType: '$category', area: { $substr: ['$location.address', 0, 30] } },
                        avgTime: { $avg: { $divide: [{ $subtract: ['$updatedAt', '$createdAt'] }, 3600000] } }
                    }
                }
            ];

            const result = await SafeQuery.aggregate(pipeline);
            const data = result.success ? result.data : [];

            const issueTypes = [...new Set(data.map(d => d._id.issueType))];
            const audits = [];

            for (const issueType of issueTypes) {
                const typeData = data.filter(d => d._id.issueType === issueType);
                const times = typeData.map(d => d.avgTime);
                const variance = this.calculateStats(times).max - this.calculateStats(times).min;
                const biasScore = Math.min(variance / 24 * 20, 100);
                const fairnessIndex = Math.max(0, 100 - biasScore);

                const audit = await EthicsAudit.create({
                    issueType,
                    resolutionVariance: variance,
                    biasScore,
                    fairnessIndex,
                    recommendations: biasScore > 50 ? ['Review resolution processes for fairness'] : []
                });
                audits.push(audit);
            }

            return { audits, avgFairness: this.calculateStats(audits.map(a => a.fairnessIndex)).avg };
        }, 'performAudit');
    }
}

// ==================== MODULE 11: URBAN ANOMALY LAB ====================

const AnomalyLogSchema = new mongoose.Schema({
    areaId: { type: String, required: true, index: true },
    department: { type: String, index: true },
    normalRate: { type: Number, default: 0 },
    currentRate: { type: Number, default: 0 },
    deviationScore: { type: Number, default: 0 },
    anomalyType: { type: String, enum: ['spike', 'drop', 'pattern_break'], default: 'spike' },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low', index: true },
    detectedAt: { type: Date, default: Date.now, index: true },
    resolved: { type: Boolean, default: false, index: true }
});

const AnomalyLog = mongoose.model('AnomalyLog', AnomalyLogSchema);

class AnomalyService extends BaseService {
    constructor() { super('Anomaly'); }

    async detectAnomalies(options = {}) {
        return this.safeExecute(async () => {
            const { days = 7 } = options;
            const timeRange = SafeQuery.getDefaultTimeRange(days);

            const pipeline = [
                { $match: { createdAt: { $gte: timeRange.start } } },
                {
                    $group: {
                        _id: { area: { $substr: ['$location.address', 0, 30] }, department: '$department' },
                        count: { $sum: 1 }
                    }
                }
            ];

            const result = await SafeQuery.aggregate(pipeline);
            const data = result.success ? result.data : [];

            const avgRate = data.reduce((sum, d) => sum + d.count, 0) / data.length;
            const anomalies = [];

            for (const item of data) {
                const deviation = Math.abs(item.count - avgRate);
                if (deviation > avgRate * 0.5) {
                    const anomaly = await AnomalyLog.create({
                        areaId: item._id.area || 'unknown',
                        department: item._id.department || 'general',
                        normalRate: avgRate,
                        currentRate: item.count,
                        deviationScore: deviation,
                        anomalyType: item.count > avgRate ? 'spike' : 'drop',
                        severity: deviation > avgRate ? 'high' : 'medium'
                    });
                    anomalies.push(anomaly);
                }
            }

            return { detected: anomalies.length, anomalies };
        }, 'detectAnomalies');
    }

    async getActiveAnomalies() {
        return this.safeExecute(async () => {
            const anomalies = await AnomalyLog.find({ resolved: false }).sort({ severity: -1 }).lean();
            return { count: anomalies.length, anomalies };
        }, 'getActiveAnomalies');
    }
}

// Export all services
module.exports = {
    DecisionScoreService: new DecisionScoreService(),
    TimeIntelligenceService: new TimeIntelligenceService(),
    TrustService: new TrustService(),
    EthicsService: new EthicsService(),
    AnomalyService: new AnomalyService()
};
