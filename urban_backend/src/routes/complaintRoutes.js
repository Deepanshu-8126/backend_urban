const express = require('express');
const router = express.Router();
const controller = require('../controllers/complaintController');
const auth = require('../middleware/auth');

// Public routes (need authentication)
router.post('/', auth.authenticateToken, controller.submitComplaint);
router.get('/', auth.authenticateToken, controller.getComplaints);
router.get('/:id', auth.authenticateToken, controller.getComplaintById);

// User specific routes
router.get('/my', auth.authenticateToken, controller.getMyComplaints);

// Admin routes
router.get('/admin', auth.authenticateToken, auth.adminOnly, controller.getAdminComplaints);
router.patch('/:id', auth.authenticateToken, auth.adminOnly, controller.updateStatus);

// Export router
module.exports = router;