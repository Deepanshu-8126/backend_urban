const express = require('express');
const router = express.Router();
const controller = require('../controllers/adminComplaint.controller');
const auth = require('../middleware/auth');

// Admin complaint routes
router.get('/admin', auth.authenticateToken, auth.adminOnly, controller.getAdminComplaints);
router.patch('/status/:id', auth.authenticateToken, auth.adminOnly, controller.updateComplaintStatus);
router.get('/my', auth.authenticateToken, controller.getUserComplaints);
router.post('/', auth.authenticateToken, controller.submitComplaint);

module.exports = router;