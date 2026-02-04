const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');

router.post('/officers', auth.authenticateToken, auth.adminOnly, adminController.createOfficer);

router.get('/officers', auth.authenticateToken, auth.adminOnly, adminController.getAllAdmins);

router.get('/complaints/:department', auth.authenticateToken, adminController.getDepartmentComplaints);

router.post('/assign', auth.authenticateToken, auth.adminOnly, adminController.assignComplaint);

router.get('/analytics/city-stats', auth.authenticateToken, auth.adminOnly, adminController.getCityMonitorData);

module.exports = router;