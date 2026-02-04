/**
 * MODULE 1: URBAN MEMORY VAULT
 * Service: Historical complaint data archival and analysis
 * SAFETY: Read-only access to complaints, writes only to UrbanMemory collection
 */

const BaseService = require('../shared/baseService');
const SafeQuery = require('../shared/safeQuery');
const UrbanMemory = require('./model');

class UrbanMemoryService extends BaseService {
    constructor() {
        super('UrbanMemory');
    }

    /**
     * Sync resolved complaints to memory vault
     * Called periodically to archive resolved complaints
     */
    async syncResolvedComplaints(timeRange = {}) {
        return this.safeExecute(async () => {
            // ✅ SAFETY: Read-only query for resolved complaints
            const result = await SafeQuery.getResolvedComplaints(timeRange);

            if (!result.success || result.data.length === 0) {
                return { synced: 0, message: 'No new resolved complaints to sync' };
            }

            const complaints = result.data;
            const memoryRecords = [];

            for (const complaint of complaints) {
                // Check if already recorded
                const exists = await UrbanMemory.findOne({
                    originalComplaintId: complaint._id.toString()
                });

                if (exists) continue;

                // Calculate resolution time
                const resolutionTime = SafeQuery.calculateHoursDiff(
                    complaint.createdAt,
                    complaint.updatedAt
                );

                // Extract area ID from address
                const areaId = this.extractAreaId(complaint.location?.address || 'unknown');

                // Create memory record
                const memoryRecord = {
                    areaId,
                    department: complaint.department || complaint.assignedDept || 'general',
                    issueType: complaint.category || 'other',
                    category: complaint.category || 'other',
                    resolutionTime,
                    outcome: complaint.status,
                    severity: complaint.priorityScore || 5,
                    priorityScore: complaint.priorityScore || 1,
                    originalComplaintId: complaint._id.toString(),
                    location: {
                        coordinates: complaint.location?.coordinates || [],
                        address: complaint.location?.address || ''
                    },
                    complaintCreatedAt: complaint.createdAt,
                    complaintResolvedAt: complaint.updatedAt
                };

                memoryRecords.push(memoryRecord);
            }

            // ✅ SAFETY: Write only to UrbanMemory collection
            if (memoryRecords.length > 0) {
                await UrbanMemory.insertMany(memoryRecords);
            }

            return {
                synced: memoryRecords.length,
                message: `Synced ${memoryRecords.length} complaints to memory vault`
            };
        }, 'syncResolvedComplaints');
    }

    /**
     * Get area history
     */
    async getAreaHistory(areaId, options = {}) {
        return this.safeExecute(async () => {
            const { limit = 100, department = null } = options;

            const filter = { areaId };
            if (department) filter.department = department;

            const memories = await UrbanMemory
                .find(filter)
                .sort({ recordedAt: -1 })
                .limit(limit)
                .lean();

            const stats = this.analyzeMemories(memories);

            return {
                areaId,
                totalRecords: memories.length,
                memories,
                statistics: stats
            };
        }, 'getAreaHistory');
    }

    /**
     * Get department history
     */
    async getDepartmentHistory(department, options = {}) {
        return this.safeExecute(async () => {
            const { limit = 100, outcome = null } = options;

            const filter = { department };
            if (outcome) filter.outcome = outcome;

            const memories = await UrbanMemory
                .find(filter)
                .sort({ recordedAt: -1 })
                .limit(limit)
                .lean();

            const stats = this.analyzeMemories(memories);

            return {
                department,
                totalRecords: memories.length,
                memories,
                statistics: stats
            };
        }, 'getDepartmentHistory');
    }

    /**
     * Get pattern insights from memory vault
     */
    async getInsights(options = {}) {
        return this.safeExecute(async () => {
            const { days = 30 } = options;
            const timeRange = SafeQuery.getDefaultTimeRange(days);

            // Aggregate insights
            const pipeline = [
                {
                    $match: {
                        recordedAt: { $gte: timeRange.start, $lte: timeRange.end }
                    }
                },
                {
                    $group: {
                        _id: {
                            areaId: '$areaId',
                            department: '$department',
                            outcome: '$outcome'
                        },
                        count: { $sum: 1 },
                        avgResolutionTime: { $avg: '$resolutionTime' },
                        avgSeverity: { $avg: '$severity' }
                    }
                },
                {
                    $sort: { count: -1 }
                },
                {
                    $limit: 50
                }
            ];

            const insights = await UrbanMemory.aggregate(pipeline);

            return {
                timeRange,
                insights,
                totalPatterns: insights.length
            };
        }, 'getInsights');
    }

    /**
     * Analyze memories and generate statistics
     */
    analyzeMemories(memories) {
        if (memories.length === 0) {
            return {
                count: 0,
                avgResolutionTime: 0,
                avgSeverity: 0,
                outcomeDistribution: {}
            };
        }

        const resolutionTimes = memories.map(m => m.resolutionTime);
        const severities = memories.map(m => m.severity);

        const outcomeDistribution = memories.reduce((acc, m) => {
            acc[m.outcome] = (acc[m.outcome] || 0) + 1;
            return acc;
        }, {});

        return {
            count: memories.length,
            avgResolutionTime: this.calculateStats(resolutionTimes).avg,
            avgSeverity: this.calculateStats(severities).avg,
            outcomeDistribution,
            departmentDistribution: this.groupBy(memories, 'department')
        };
    }

    /**
     * Extract area ID from address
     */
    extractAreaId(address) {
        // Simple extraction - can be enhanced with geocoding
        const parts = address.split(',');
        return parts[0]?.trim() || 'unknown';
    }
}

module.exports = new UrbanMemoryService();
