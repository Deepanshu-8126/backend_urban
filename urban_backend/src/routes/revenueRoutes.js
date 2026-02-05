const express = require('express');
const router = express.Router();
const { getRevenue, getBudgetAnalytics } = require('../controllers/revenueController');

router.get('/budget', getRevenue);
router.get('/analytics', getBudgetAnalytics);

module.exports = router;