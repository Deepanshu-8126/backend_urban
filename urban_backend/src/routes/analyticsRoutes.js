const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken } = require('../middleware/auth');

// All analytics routes require authentication
router.use(authenticateToken);

// City Overview Stats
router.get('/city-overview', analyticsController.getCityOverview);

// Complaint Trends (7d, 30d, 90d)
router.get('/trends', analyticsController.getTrends);

// Department Analytics
router.get('/departments', analyticsController.getDepartmentAnalytics);

// Area/Ward Risk Analysis
router.get('/areas', analyticsController.getAreaAnalytics);

// Live Incidents for Map
router.get('/live-incidents', analyticsController.getLiveIncidents);

module.exports = router;
