const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');

// Create officer
router.post('/officers', auth.authenticateToken, auth.adminOnly, adminController.createOfficer);

// Get department complaints
router.get('/complaints/:department', auth.authenticateToken, adminController.getDepartmentComplaints);

// Assign complaint
router.post('/assign', auth.authenticateToken, auth.adminOnly, adminController.assignComplaint);

module.exports = router;