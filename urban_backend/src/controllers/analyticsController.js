const analyticsService = require('../services/analyticsService');

/**
 * Get city overview statistics
 * GET /api/v1/analytics/city-overview
 */
exports.getCityOverview = async (req, res) => {
    try {
        const stats = await analyticsService.getCityOverviewStats();
        res.json(stats);
    } catch (error) {
        console.error('Error fetching city overview:', error);
        res.status(500).json({ error: 'Failed to fetch city overview statistics' });
    }
};

/**
 * Get complaint trends
 * GET /api/v1/analytics/trends?range=7d
 */
exports.getTrends = async (req, res) => {
    try {
        const range = req.query.range || '7d';
        const trends = await analyticsService.getComplaintTrends(range);
        res.json({ data: trends });
    } catch (error) {
        console.error('Error fetching trends:', error);
        res.status(500).json({ error: 'Failed to fetch complaint trends' });
    }
};

/**
 * Get department analytics
 * GET /api/v1/analytics/departments
 */
exports.getDepartmentAnalytics = async (req, res) => {
    try {
        const departments = await analyticsService.getDepartmentStats();
        res.json({ departments });
    } catch (error) {
        console.error('Error fetching department analytics:', error);
        res.status(500).json({ error: 'Failed to fetch department analytics' });
    }
};

/**
 * Get area/ward risk analysis
 * GET /api/v1/analytics/areas
 */
exports.getAreaAnalytics = async (req, res) => {
    try {
        const areas = await analyticsService.getAreaRiskAnalysis();
        res.json({ areas });
    } catch (error) {
        console.error('Error fetching area analytics:', error);
        res.status(500).json({ error: 'Failed to fetch area analytics' });
    }
};

/**
 * Get live incidents for map
 * GET /api/v1/analytics/live-incidents
 */
exports.getLiveIncidents = async (req, res) => {
    try {
        const incidents = await analyticsService.getLiveIncidentsForMap();
        res.json({ incidents });
    } catch (error) {
        console.error('Error fetching live incidents:', error);
        res.status(500).json({ error: 'Failed to fetch live incidents' });
    }
};
