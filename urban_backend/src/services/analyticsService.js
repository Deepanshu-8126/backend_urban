const Complaint = require('../models/Complaint');

/**
 * Get city overview statistics
 * Returns total, pending, resolved counts and avg resolution time
 */
exports.getCityOverviewStats = async () => {
    try {
        const [stats] = await Complaint.aggregate([
            {
                $facet: {
                    total: [{ $count: 'count' }],
                    pending: [
                        { $match: { status: { $in: ['pending', 'working'] } } },
                        { $count: 'count' }
                    ],
                    resolved: [
                        { $match: { status: 'solved' } },
                        { $count: 'count' }
                    ],
                    critical: [
                        { $match: { priorityScore: { $gte: 8 } } },
                        { $count: 'count' }
                    ],
                    avgResolutionTime: [
                        {
                            $match: {
                                status: 'solved',
                                resolvedAt: { $exists: true },
                                createdAt: { $exists: true }
                            }
                        },
                        {
                            $project: {
                                resolutionTime: {
                                    $divide: [
                                        { $subtract: ['$resolvedAt', '$createdAt'] },
                                        1000 * 60 * 60 // Convert to hours
                                    ]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                avgTime: { $avg: '$resolutionTime' }
                            }
                        }
                    ]
                }
            }
        ]);

        return {
            total: stats.total[0]?.count || 0,
            pending: stats.pending[0]?.count || 0,
            resolved: stats.resolved[0]?.count || 0,
            criticalCount: stats.critical[0]?.count || 0,
            avgResolutionTime: stats.avgResolutionTime[0]?.avgTime
                ? `${stats.avgResolutionTime[0].avgTime.toFixed(1)}h`
                : 'N/A'
        };
    } catch (error) {
        console.error('Error in getCityOverviewStats:', error);
        throw error;
    }
};

/**
 * Get complaint trends for specified time range
 * @param {string} range - '7d', '30d', or '90d'
 */
exports.getComplaintTrends = async (range) => {
    try {
        const days = range === '30d' ? 30 : range === '90d' ? 90 : 7;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const trends = await Complaint.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            },
            {
                $project: {
                    _id: 0,
                    date: '$_id',
                    count: 1,
                    label: {
                        $dateToString: {
                            format: '%a',
                            date: { $dateFromString: { dateString: '$_id' } }
                        }
                    }
                }
            }
        ]);

        return trends;
    } catch (error) {
        console.error('Error in getComplaintTrends:', error);
        throw error;
    }
};

/**
 * Get department-wise analytics
 * Returns active, solved counts and avg resolution time per department
 */
exports.getDepartmentStats = async () => {
    try {
        const stats = await Complaint.aggregate([
            {
                $facet: {
                    byDepartment: [
                        {
                            $group: {
                                _id: '$department',
                                total: { $sum: 1 },
                                active: {
                                    $sum: {
                                        $cond: [
                                            { $in: ['$status', ['pending', 'working']] },
                                            1,
                                            0
                                        ]
                                    }
                                },
                                solved: {
                                    $sum: {
                                        $cond: [{ $eq: ['$status', 'solved'] }, 1, 0]
                                    }
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                name: '$_id',
                                active: 1,
                                solved: 1,
                                efficiency: {
                                    $cond: [
                                        { $eq: ['$total', 0] },
                                        0,
                                        {
                                            $multiply: [
                                                { $divide: ['$solved', '$total'] },
                                                100
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    ],
                    avgTimes: [
                        {
                            $match: {
                                status: 'solved',
                                resolvedAt: { $exists: true }
                            }
                        },
                        {
                            $group: {
                                _id: '$department',
                                avgTime: {
                                    $avg: {
                                        $divide: [
                                            { $subtract: ['$resolvedAt', '$createdAt'] },
                                            1000 * 60 * 60
                                        ]
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        ]);

        // Merge department stats with avg times
        const departments = stats[0].byDepartment.map(dept => {
            const avgTimeData = stats[0].avgTimes.find(t => t._id === dept.name);
            return {
                ...dept,
                avgTime: avgTimeData?.avgTime
                    ? `${avgTimeData.avgTime.toFixed(1)}h`
                    : 'N/A'
            };
        });

        return departments;
    } catch (error) {
        console.error('Error in getDepartmentStats:', error);
        throw error;
    }
};

/**
 * Get area/ward risk analysis
 * Risk score = (critical complaints * 10) + (pending complaints * 2)
 */
exports.getAreaRiskAnalysis = async () => {
    try {
        // Extract ward from location.address or use a default grouping
        const areas = await Complaint.aggregate([
            {
                $addFields: {
                    ward: {
                        $cond: [
                            { $regexMatch: { input: '$location.address', regex: /ward\s*(\d+)/i } },
                            {
                                $toInt: {
                                    $arrayElemAt: [
                                        {
                                            $regexFindAll: {
                                                input: '$location.address',
                                                regex: /ward\s*(\d+)/i
                                            }
                                        },
                                        0
                                    ]
                                }
                            },
                            0
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: '$ward',
                    total: { $sum: 1 },
                    critical: {
                        $sum: {
                            $cond: [{ $gte: ['$priorityScore', 8] }, 1, 0]
                        }
                    },
                    pending: {
                        $sum: {
                            $cond: [
                                { $in: ['$status', ['pending', 'working']] },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    ward: '$_id',
                    name: { $concat: ['Ward ', { $toString: '$_id' }] },
                    critical: 1,
                    pending: 1,
                    riskScore: {
                        $add: [
                            { $multiply: ['$critical', 10] },
                            { $multiply: ['$pending', 2] }
                        ]
                    }
                }
            },
            {
                $sort: { riskScore: -1 }
            },
            {
                $limit: 10
            }
        ]);

        return areas;
    } catch (error) {
        console.error('Error in getAreaRiskAnalysis:', error);
        throw error;
    }
};

/**
 * Get live incidents for map display
 * Returns active complaints with valid coordinates
 */
exports.getLiveIncidentsForMap = async () => {
    try {
        const incidents = await Complaint.find({
            status: { $in: ['pending', 'working'] },
            'location.coordinates': { $exists: true, $ne: [] }
        })
            .select('title category location.coordinates priorityScore status createdAt')
            .sort({ priorityScore: -1, createdAt: -1 })
            .limit(50)
            .lean();

        return incidents.map(incident => ({
            id: incident._id.toString(),
            title: incident.title,
            category: incident.category,
            latitude: incident.location.coordinates[1],
            longitude: incident.location.coordinates[0],
            priority: incident.priorityScore >= 8 ? 'high' : incident.priorityScore >= 5 ? 'medium' : 'low',
            status: incident.status
        }));
    } catch (error) {
        console.error('Error in getLiveIncidentsForMap:', error);
        throw error;
    }
};
