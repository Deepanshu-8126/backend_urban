const express = require('express');
const router = express.Router();
const { getMyProperties, payPropertyTax, calculatePropertyTax, getNearbyProperties, getRevenueStats } = require('../controllers/propertyController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, getNearbyProperties); // Matches GET /api/v1/property
router.get('/revenue-stats', authenticateToken, getRevenueStats); // Matches GET /api/v1/property/revenue-stats
router.get('/my-properties', authenticateToken, getMyProperties);
router.post('/pay', authenticateToken, payPropertyTax);
router.post('/calculate-tax', authenticateToken, calculatePropertyTax);

module.exports = router;