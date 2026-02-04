const express = require('express');
const router = express.Router();
const { getCityDashboard, getWardDashboard } = require('../controllers/dashboardController');

router.get('/', getCityDashboard);
router.get('/ward/:ward', getWardDashboard);

module.exports = router;