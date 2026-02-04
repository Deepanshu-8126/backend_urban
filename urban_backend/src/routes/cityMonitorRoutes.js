const express = require('express');
const router = express.Router();
const {
    getRealTimeStats,
    getZoneStatus,
    getLiveIncidents,
    getHeatmapData,
    getPredictiveAnalytics,
    getTrends,
    getDepartmentDetails,
    getAreaDetails
} = require('../controllers/cityMonitorController');
const { authenticateToken, adminOnly } = require('../middleware/auth');

// ==========================================
// 🔓 PUBLIC / SEMI-PUBLIC ENDPOINTS
// ==========================================
router.get('/real-time-stats', getRealTimeStats);
router.get('/zone-status', getZoneStatus);
router.get('/live-incidents', getLiveIncidents);
router.get('/heatmap-data', getHeatmapData);

// ==========================================
// 🔒 ADMIN ONLY ANALYTICS
// ==========================================
router.get('/predictive-analytics', authenticateToken, adminOnly, getPredictiveAnalytics);
router.get('/trends', authenticateToken, adminOnly, getTrends);
router.get('/departments', authenticateToken, adminOnly, getDepartmentDetails);
router.get('/areas', authenticateToken, adminOnly, getAreaDetails);

module.exports = router;
