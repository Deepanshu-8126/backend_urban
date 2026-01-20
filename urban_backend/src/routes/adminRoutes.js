const express = require('express');
const router = express.Router();
const { getStaffMonitor } = require('../controllers/adminController');

router.get('/staff', getStaffMonitor);

module.exports = router;