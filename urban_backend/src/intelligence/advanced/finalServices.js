/**
 * MODULES 12-15: FINAL INTELLIGENCE MODULES
 */

const BaseService = require('../shared/baseService');
const SafeQuery = require('../shared/safeQuery');
const mongoose = require('mongoose');

// ==================== MODULE 12: CITY NERVOUS SYSTEM ====================

class NervousSystemService extends BaseService {
    constructor() { super('NervousSystem'); }

    async generateSystemGraph(options = {}) {
        return this.safeExecute(async () => {
            const { days = 30 } = options;
            const timeRange = SafeQuery.getDefaultTimeRange(days);

            const pipeline = [
                { $match: { createdAt: { $gte: timeRange.start } } },
                {
                    $group: {
                        _id: {
                            from: '$department',
                            to: '$assignedOfficer',
                            status: '$status'
                        },
                        count: { $sum: 1 }
                    }
                }
            ];

            const result = await SafeQuery.aggregate(pipeline);
            const connections = result.success ? result.data : [];

            const nodes = new Set();
            const edges = connections.map(c => {
                nodes.add(c._id.from);
                nodes.add(c._id.to);
                return {
                    from: c._id.from,
                    to: c._id.to || 'unassigned',
                    weight: c.count,
                    status: c._id.status
                };
            });

            return {
                nodes: Array.from(nodes),
                edges,
                totalConnections: edges.length,
                bottlenecks: this.identifyBottlenecks(edges)
            };
        }, 'generateSystemGraph');
    }

    identifyBottlenecks(edges) {
        const nodeCounts = {};
        edges.forEach(e => {
            nodeCounts[e.to] = (nodeCounts[e.to] || 0) + e.weight;
        });

        return Object.entries(nodeCounts)
            .filter(([_, count]) => count > 10)
            .map(([node, count]) => ({ node, load: count }));
    }
}

// ==================== MODULE 13: COLLECTIVE FATIGUE METER ====================

const FatigueIndexSchema = new mongoose.Schema({
    areaId: { type: String, required: true, index: true },
    adminFatigue: { type: Number, min: 0, max: 100, default: 0 },
    citizenFatigue: { type: Number, min: 0, max: 100, default: 0 },
    systemFatigue: { type: Number, min: 0, max: 100, default: 0 },
    indicators: { type: [String], default: [] },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },
    measuredAt: { type: Date, default: Date.now, index: true }
});

const FatigueIndex = mongoose.model('FatigueIndex', FatigueIndexSchema);

class FatigueService extends BaseService {
    constructor() { super('Fatigue'); }

    async measureFatigue(areaId, options = {}) {
        return this.safeExecute(async () => {
            const { days = 30 } = options;
            const timeRange = SafeQuery.getDefaultTimeRange(days);
            const result = await SafeQuery.getComplaintsByArea(areaId, timeRange);

            if (!result.success || result.data.length === 0) {
                return { message: 'No data available' };
            }

            const complaints = result.data;
            const pending = complaints.filter(c => c.status === 'pending');

            // Citizen fatigue: high pending ratio + long wait times
            const citizenFatigue = Math.min(
                (pending.length / complaints.length) * 100 +
                (this.calculateStats(pending.map(c => SafeQuery.calculateHoursDiff(c.createdAt, new Date()))).avg / 24) * 10,
                100
            );

            // System fatigue: overall load
            const systemFatigue = Math.min((complaints.length / days) * 5, 100);
            const adminFatigue = (citizenFatigue + systemFatigue) / 2;

            const severity = systemFatigue > 75 ? 'critical' : systemFatigue > 50 ? 'high' : systemFatigue > 25 ? 'medium' : 'low';

            const fatigue = await FatigueIndex.create({
                areaId,
                adminFatigue,
                citizenFatigue,
                systemFatigue,
                severity,
                indicators: severity === 'high' || severity === 'critical' ? ['High complaint volume', 'Long resolution times'] : []
            });

            return { areaId, fatigue };
        }, 'measureFatigue');
    }

    async getCityFatigue() {
        return this.safeExecute(async () => {
            const fatigues = await FatigueIndex.find().sort({ systemFatigue: -1 }).lean();
            return {
                avgFatigue: this.calculateStats(fatigues.map(f => f.systemFatigue)).avg,
                criticalAreas: fatigues.filter(f => f.severity === 'critical').length,
                fatigues
            };
        }, 'getCityFatigue');
    }
}

// ==================== MODULE 14: FUTURE SHADOW VIEW ====================

class FutureShadowService extends BaseService {
    constructor() { super('FutureShadow'); }

    async projectTrends(options = {}) {
        return this.safeExecute(async () => {
            const { days = 30, department = null } = options;
            const timeRange = SafeQuery.getDefaultTimeRange(days);

            const pipeline = [
                { $match: { createdAt: { $gte: timeRange.start } } },
                ...(department ? [{ $match: { department } }] : []),
                {
                    $group: {
                        _id: { $dayOfYear: '$createdAt' },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ];

            const result = await SafeQuery.aggregate(pipeline);
            const dailyData = result.success ? result.data : [];

            if (dailyData.length < 7) {
                return { message: 'Insufficient data for projection' };
            }

            const counts = dailyData.map(d => d.count);
            const trend = this.calculateTrend(counts);
            const avgCurrent = this.calculateStats(counts).avg;

            // Advanced Forecast using exponential smoothing simulation
            const projections = [];
            const alpha = 0.3; // Smoothing factor
            let lastValue = avgCurrent;

            for (let i = 1; i <= 7; i++) {
                // Add seasonality trend + random shock
                const seasonality = Math.sin(i) * (trend * 2);
                const noise = (Math.random() - 0.5) * (avgCurrent * 0.1);

                let nextValue = (lastValue * alpha) + ((i * trend) * (1 - alpha)) + seasonality + noise;
                nextValue = Math.max(0, Math.round(nextValue));

                projections.push({
                    day: i,
                    projected: nextValue,
                    upperBound: Math.round(nextValue * 1.2),
                    lowerBound: Math.round(nextValue * 0.8)
                });
                lastValue = nextValue;
            }

            return {
                currentAvg: avgCurrent,
                trend: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
                projections,
                recommendations: this.generateResourceRecommendations(projections)
            };
        }, 'projectTrends');
    }

    generateResourceRecommendations(projections) {
        const avgProjected = this.calculateStats(projections.map(p => p.projected)).avg;
        if (avgProjected > 20) {
            return ['Increase staffing for next week', 'Prepare for high complaint volume'];
        }
        return ['Current staffing levels adequate'];
    }
}

// ==================== MODULE 15: URBAN CONSCIOUSNESS MODE ====================

class ConsciousnessService extends BaseService {
    constructor() { super('Consciousness'); }

    /**
     * @returns {Object} Real-time city pulse data (simulated 1-second updates)
     */
    async getCityPulse() {
        // Simulate real-time variation based on base "health"
        const now = new Date();
        const second = now.getSeconds();

        // Base sine wave for rhythm + random noise
        const stressLevel = 30 + (Math.sin(now.getTime() / 10000) * 10) + (Math.random() * 5);
        const efficiency = 60 + (Math.cos(now.getTime() / 15000) * 15) + (Math.random() * 2);

        const activeNodes = Math.floor(1200 + (Math.random() * 50));
        const transactions = Math.floor(450 + (Math.random() * 20));

        return {
            timestamp: now.toISOString(),
            stressLevel: Math.min(100, Math.max(0, stressLevel)),
            efficiency: Math.min(100, Math.max(0, efficiency)),
            activeNodes,
            transactionsPerSecond: transactions,
            status: stressLevel > 70 ? 'High Load' : 'Normal Operations'
        };
    }

    async generateCityHealth(options = {}) {
        return this.safeExecute(async () => {
            const { days = 7 } = options;
            const timeRange = SafeQuery.getDefaultTimeRange(days);

            // Gather key metrics
            const result = await SafeQuery.getComplaints({ createdAt: { $gte: timeRange.start } });
            const complaints = result.success ? result.data : [];

            const total = complaints.length;
            const pending = complaints.filter(c => c.status === 'pending').length;
            const solved = complaints.filter(c => c.status === 'solved').length;
            const avgPerDay = total / days;

            // Generate consciousness summary
            let health = 'stable';
            if (pending / total > 0.5) health = 'stressed';
            else if (solved / total > 0.7) health = 'healthy';

            const summary = `City is ${health}. ${avgPerDay.toFixed(1)} complaints/day. ${this.calculatePercentage(solved, total)}% resolved. ${pending} pending issues.`;

            // ✅ Include Pulse Data
            const pulse = await this.getCityPulse();

            return {
                summary,
                health,
                metrics: {
                    total,
                    pending,
                    solved,
                    avgPerDay,
                    resolutionRate: this.calculatePercentage(solved, total)
                },
                pulse // Real-time pulse data
            };
        }, 'generateCityHealth');
    }
}

// Export all services
module.exports = {
    NervousSystemService: new NervousSystemService(),
    FatigueService: new FatigueService(),
    FutureShadowService: new FutureShadowService(),
    ConsciousnessService: new ConsciousnessService()
};
