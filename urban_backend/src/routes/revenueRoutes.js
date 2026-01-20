const express = require('express');
const router = express.Router();
const { getBudgetTracker } = require('../controllers/revenueController');

router.get('/budget', getBudgetTracker);

module.exports = router;