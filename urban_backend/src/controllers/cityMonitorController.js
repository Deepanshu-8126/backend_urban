const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Admin = require('../models/Admin');

// ========================================
// 🚀 REAL-TIME CITY INTELLIGENCE SYSTEM
// ========================================

// Get Real-time City Stats
exports.getRealTimeStats = async (req, res) => {
    try {
        const { lat, lng, radius = 10000 } = req.query; // radius in meters (default 10km)

        // Base query (last 30 days for relevance)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        let query = { createdAt: { $gte: thirtyDaysAgo } };

        // If location provided, filter by proximity
        if (lat && lng) {
            query.location = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: parseInt(radius)
                }
            };
        }

        // Aggregate complaint statistics
        const [
            totalComplaints,
            pendingComplaints,
            inProgressComplaints,
            solvedComplaints,
            categoryStats,
            last24HoursCount,
            criticalComplaints
        ] = await Promise.all([
            Complaint.countDocuments(query),
            Complaint.countDocuments({ ...query, status: 'pending' }),
            Complaint.countDocuments({ ...query, status: 'in-progress' }),
            Complaint.countDocuments({ ...query, status: 'solved' }),

            // Category-wise breakdown
            Complaint.aggregate([
                { $match: query },
                { $group: { _id: '$category', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),

            // Last 24 hours activity
            Complaint.countDocuments({
                ...query,
                createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            }),

            // Critical/urgent complaints
            Complaint.countDocuments({
                ...query,
                status: { $in: ['pending', 'in-progress'] },
                priority: 'high'
            })
        ]);

        // Calculate city health score
        const healthScore = totalComplaints > 0
            ? Math.max(0, Math.min(100, 100 - Math.floor((pendingComplaints / totalComplaints) * 100)))
            : 95;

        // Department performance (based on category resolution)
        const departmentPerformance = await Promise.all(
            ['Water', 'Electricity', 'Roads', 'Garbage', 'Health', 'Security'].map(async (category) => {
                const total = await Complaint.countDocuments({ ...query, category });
                const solved = await Complaint.countDocuments({ ...query, category, status: 'solved' });
                const performance = total > 0 ? Math.floor((solved / total) * 100) : 100;

                return {
                    department: category,
                    total,
                    solved,
                    pending: total - solved,
                    performance
                };
            })
        );

        // Response time analytics
        const avgResponseTime = await Complaint.aggregate([
            { $match: { ...query, status: { $in: ['in-progress', 'solved'] } } },
            {
                $project: {
                    responseTime: {
                        $subtract: [
                            { $ifNull: ['$updatedAt', new Date()] },
                            '$createdAt'
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    avgTime: { $avg: '$responseTime' }
                }
            }
        ]);

        const avgResponseHours = avgResponseTime.length > 0
            ? Math.floor(avgResponseTime[0].avgTime / (1000 * 60 * 60))
            : 0;

        res.json({
            success: true,
            timestamp: new Date(),
            location: lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng), radius } : null,
            cityHealth: {
                score: healthScore,
                status: healthScore > 80 ? 'Excellent' : healthScore > 60 ? 'Good' : healthScore > 40 ? 'Moderate' : 'Critical',
                trend: last24HoursCount > 10 ? 'increasing' : 'stable'
            },
            complaints: {
                total: totalComplaints,
                pending: pendingComplaints,
                inProgress: inProgressComplaints,
                solved: solvedComplaints,
                critical: criticalComplaints,
                last24Hours: last24HoursCount
            },
            categories: categoryStats,
            departments: departmentPerformance,
            performance: {
                avgResponseTimeHours: avgResponseHours,
                resolutionRate: totalComplaints > 0 ? Math.floor((solvedComplaints / totalComplaints) * 100) : 0
            }
        });

    } catch (error) {
        console.error('Real-time stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch real-time statistics'
        });
    }
};

// Get Zone-wise Status
exports.getZoneStatus = async (req, res) => {
    try {
        const { ward } = req.query;

        // Base query
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        let query = { createdAt: { $gte: thirtyDaysAgo } };

        if (ward) {
            query.ward = ward;
        }

        // Aggregate by ward/zone
        const zoneStats = await Complaint.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$ward',
                    total: { $sum: 1 },
                    pending: {
                        $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                    },
                    inProgress: {
                        $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
                    },
                    solved: {
                        $sum: { $cond: [{ $eq: ['$status', 'solved'] }, 1, 0] }
                    }
                }
            },
            {
                $project: {
                    ward: '$_id',
                    total: 1,
                    pending: 1,
                    inProgress: 1,
                    solved: 1,
                    status: {
                        $cond: [
                            { $gte: ['$pending', 10] }, 'critical',
                            { $cond: [{ $gte: ['$pending', 5] }, 'warning', 'normal'] }
                        ]
                    },
                    healthScore: {
                        $subtract: [
                            100,
                            { $multiply: [{ $divide: ['$pending', '$total'] }, 100] }
                        ]
                    }
                }
            },
            { $sort: { pending: -1 } }
        ]);

        res.json({
            success: true,
            timestamp: new Date(),
            zones: zoneStats.map(zone => ({
                ward: zone.ward || 'Unknown',
                total: zone.total,
                pending: zone.pending,
                inProgress: zone.inProgress,
                solved: zone.solved,
                status: zone.status,
                healthScore: Math.floor(zone.healthScore),
                color: zone.status === 'critical' ? 'red' : zone.status === 'warning' ? 'orange' : 'green'
            }))
        });

    } catch (error) {
        console.error('Zone status error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch zone status'
        });
    }
};

// Get Live Incidents (for map visualization)
exports.getLiveIncidents = async (req, res) => {
    try {
        const {
            lat,
            lng,
            radius = 50000, // 50km default
            status,
            category,
            hours = 168 // Last 7 days default
        } = req.query;

        const timeFilter = new Date(Date.now() - parseInt(hours) * 60 * 60 * 1000);
        let query = { createdAt: { $gte: timeFilter } };

        // Add filters
        if (status) query.status = status;
        if (category) query.category = category;

        // Location filter
        if (lat && lng) {
            query.location = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: parseInt(radius)
                }
            };
        }

        // Fetch incidents
        const incidents = await Complaint.find(query)
            .select('title category status ward location createdAt priority imageUrl')
            .limit(500) // Max 500 for performance
            .sort({ createdAt: -1 });

        // Format for map
        const formattedIncidents = incidents
            .filter(inc => inc.location && inc.location.coordinates)
            .map(inc => ({
                id: inc._id,
                title: inc.title,
                category: inc.category,
                status: inc.status,
                ward: inc.ward,
                imageUrl: inc.imageUrl,
                priority: inc.priority || 'medium',
                lat: inc.location.coordinates[1],
                lng: inc.location.coordinates[0],
                color: inc.status === 'pending' ? 'red' : inc.status === 'in-progress' ? 'orange' : 'green',
                timestamp: inc.createdAt
            }));

        res.json({
            success: true,
            timestamp: new Date(),
            count: formattedIncidents.length,
            incidents: formattedIncidents
        });

    } catch (error) {
        console.error('Live incidents error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch live incidents'
        });
    }
};

// Get Heatmap Data (grid-based clustering)
exports.getHeatmapData = async (req, res) => {
    try {
        const {
            lat = 29.2183,
            lng = 79.5130,
            gridSize = 0.01, // ~1km grid cells
            hours = 168 // Last 7 days
        } = req.query;

        const timeFilter = new Date(Date.now() - parseInt(hours) * 60 * 60 * 1000);

        // Fetch all complaints with location
        const complaints = await Complaint.find({
            createdAt: { $gte: timeFilter },
            'location.coordinates': { $exists: true }
        }).select('location status category');

        // Grid-based clustering
        const grid = {};
        const gridSizeNum = parseFloat(gridSize);

        complaints.forEach(complaint => {
            if (!complaint.location || !complaint.location.coordinates) return;

            const [cLng, cLat] = complaint.location.coordinates;
            const gridLat = Math.floor(cLat / gridSizeNum) * gridSizeNum;
            const gridLng = Math.floor(cLng / gridSizeNum) * gridSizeNum;
            const key = `${gridLat},${gridLng}`;

            if (!grid[key]) {
                grid[key] = {
                    lat: gridLat + gridSizeNum / 2, // Center of grid cell
                    lng: gridLng + gridSizeNum / 2,
                    count: 0,
                    pending: 0,
                    categories: {}
                };
            }

            grid[key].count++;
            if (complaint.status === 'pending') grid[key].pending++;
            grid[key].categories[complaint.category] = (grid[key].categories[complaint.category] || 0) + 1;
        });

        // Convert to array and calculate intensity
        const heatZones = Object.values(grid).map(zone => {
            const intensity = Math.min(1, zone.count / 30); // Normalize to 0-1 (30+ = max)
            let color = 'green';
            if (zone.count > 30) color = 'red';
            else if (zone.count > 15) color = 'orange';
            else if (zone.count > 5) color = 'yellow';

            return {
                lat: zone.lat,
                lng: zone.lng,
                count: zone.count,
                pending: zone.pending,
                intensity,
                color,
                radius: Math.sqrt(zone.count) * 50, // Dynamic radius
                topCategory: Object.entries(zone.categories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Other'
            };
        });

        // Sort by intensity
        heatZones.sort((a, b) => b.intensity - a.intensity);

        res.json({
            success: true,
            timestamp: new Date(),
            gridSize: gridSizeNum,
            totalZones: heatZones.length,
            zones: heatZones
        });

    } catch (error) {
        console.error('Heatmap data error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate heatmap data'
        });
    }
};

// Get Predictive Analytics
exports.getPredictiveAnalytics = async (req, res) => {
    try {
        // Analyze patterns for predictions
        const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const [
            recurringIssues,
            trendingCategories,
            wardRiskScore
        ] = await Promise.all([
            // Recurring issues (same category + ward)
            Complaint.aggregate([
                { $match: { createdAt: { $gte: last30Days } } },
                {
                    $group: {
                        _id: { category: '$category', ward: '$ward' },
                        count: { $sum: 1 },
                        avgDuration: { $avg: '$resolvedDuration' }
                    }
                },
                { $match: { count: { $gte: 5 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]),

            // Trending (increasing in last 7 days)
            Complaint.aggregate([
                { $match: { createdAt: { $gte: last7Days } } },
                { $group: { _id: '$category', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),

            // Ward risk score
            Complaint.aggregate([
                {
                    $match: {
                        createdAt: { $gte: last30Days },
                        status: { $in: ['pending', 'in-progress'] }
                    }
                },
                {
                    $group: {
                        _id: '$ward',
                        openIssues: { $sum: 1 }
                    }
                },
                { $sort: { openIssues: -1 } }
            ])
        ]);

        // Generate predictions
        const predictions = [];

        // High-risk wards
        if (wardRiskScore.length > 0 && wardRiskScore[0].openIssues > 10) {
            predictions.push({
                type: 'critical_zone',
                title: `High Activity in ${wardRiskScore[0]._id}`,
                description: `${wardRiskScore[0].openIssues} open issues detected. Requires immediate attention.`,
                action: `Deploy additional staff to ${wardRiskScore[0]._id}`,
                priority: 'high',
                icon: 'warning'
            });
        }

        // Recurring patterns
        recurringIssues.slice(0, 3).forEach(issue => {
            predictions.push({
                type: 'recurring_pattern',
                title: `Recurring ${issue._id.category} Issues`,
                description: `${issue.count} complaints in ${issue._id.ward} in last 30 days.`,
                action: `Investigate root cause in ${issue._id.ward}`,
                priority: 'medium',
                icon: 'repeat'
            });
        });

        res.json({
            success: true,
            timestamp: new Date(),
            predictions,
            analytics: {
                recurringIssues: recurringIssues.slice(0, 5),
                trendingCategories,
                highRiskWards: wardRiskScore.slice(0, 5)
            }
        });

    } catch (error) {
        console.error('Predictive analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate predictions'
        });
    }
};

// ========================================
// 📊 TREND ANALYTICS (Hourly/Daily)
// ========================================
exports.getTrends = async (req, res) => {
    try {
        const { range = '7d' } = req.query; // 7d, 30d, 24h

        let groupBy;
        let dateFilter = new Date();

        if (range === '24h') {
            dateFilter.setHours(dateFilter.getHours() - 24);
            groupBy = {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
                day: { $dayOfMonth: "$createdAt" },
                hour: { $hour: "$createdAt" }
            };
        } else if (range === '30d') {
            dateFilter.setDate(dateFilter.getDate() - 30);
            groupBy = {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
                day: { $dayOfMonth: "$createdAt" }
            };
        } else { // Default 7d
            dateFilter.setDate(dateFilter.getDate() - 7);
            groupBy = {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
                day: { $dayOfMonth: "$createdAt" }
            };
        }

        const trends = await Complaint.aggregate([
            { $match: { createdAt: { $gte: dateFilter } } },
            {
                $group: {
                    _id: groupBy,
                    count: { $sum: 1 },
                    solved: { $sum: { $cond: [{ $eq: ["$status", "solved"] }, 1, 0] } },
                    pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.hour": 1 } }
        ]);

        // Format for Chart (ISO strings or simple labels)
        const formattedTrends = trends.map(t => {
            let label = `${t._id.day}/${t._id.month}`;
            if (range === '24h') label += ` ${t._id.hour}:00`;
            return {
                label,
                total: t.count,
                solved: t.solved,
                pending: t.pending
            };
        });

        res.json({
            success: true,
            range,
            data: formattedTrends
        });

    } catch (error) {
        console.error('Trend analytics error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch trends' });
    }
};

// ========================================
// 🏛️ DEPARTMENT INTELLIGENCE
// ========================================
exports.getDepartmentDetails = async (req, res) => {
    try {
        const stats = await Complaint.aggregate([
            {
                $group: {
                    _id: "$category",
                    total: { $sum: 1 },
                    pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
                    inProgress: { $sum: { $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0] } },
                    solved: { $sum: { $cond: [{ $eq: ["$status", "solved"] }, 1, 0] } },
                    avgResolutionTime: {
                        $avg: {
                            $cond: [
                                { $and: [{ $eq: ["$status", "solved"] }, { $gt: ["$updatedAt", "$createdAt"] }] },
                                { $subtract: ["$updatedAt", "$createdAt"] },
                                null
                            ]
                        }
                    }
                }
            },
            { $sort: { total: -1 } }
        ]);

        const enrichedStats = stats.map(dept => ({
            department: dept._id,
            total: dept.total,
            pending: dept.pending,
            solved: dept.solved,
            healthScore: Math.max(0, 100 - Math.floor((dept.pending / dept.total) * 100)),
            avgResolutionHours: dept.avgResolutionTime ? Math.floor(dept.avgResolutionTime / (1000 * 60 * 60)) : 0,
            workload: dept.pending > 20 ? 'High' : dept.pending > 10 ? 'Medium' : 'Low'
        }));

        res.json({ success: true, departments: enrichedStats });

    } catch (error) {
        console.error('Dept details error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch department stats' });
    }
};

// ========================================
// 📍 AREA INTELLIGENCE
// ========================================
exports.getAreaDetails = async (req, res) => {
    try {
        const stats = await Complaint.aggregate([
            {
                $group: {
                    _id: "$ward",
                    total: { $sum: 1 },
                    pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
                    solved: { $sum: { $cond: [{ $eq: ["$status", "solved"] }, 1, 0] } },
                    categories: { $push: "$category" }
                }
            },
            { $sort: { pending: -1 } }
        ]);

        // Calculate most common issue for each area
        const enrichedStats = stats.map(area => {
            const categoryCounts = area.categories.reduce((acc, curr) => {
                acc[curr] = (acc[curr] || 0) + 1;
                return acc;
            }, {});
            const topIssue = Object.keys(categoryCounts).reduce((a, b) => categoryCounts[a] > categoryCounts[b] ? a : b, 'None');

            return {
                area: area._id || "Unknown",
                total: area.total,
                pending: area.pending,
                solved: area.solved,
                topIssue,
                riskScore: Math.min(100, area.pending * 5) // Simple risk calculation
            };
        });

        res.json({ success: true, areas: enrichedStats });

    } catch (error) {
        console.error('Area stats error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch area stats' });
    }
};
