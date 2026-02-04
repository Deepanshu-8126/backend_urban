const express = require('express');
const router = express.Router();
const { getRevenue } = require('../controllers/revenueController');

router.get('/budget', getRevenue);

module.exports = router;