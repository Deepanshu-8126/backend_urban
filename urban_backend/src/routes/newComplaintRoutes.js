const express = require('express');
const router = express.Router();
const controller = require('../controllers/newComplaintController');
const auth = require('../middleware/auth');

// Public routes (need authentication)
router.post('/', auth.authenticateToken, controller.submitComplaint);
router.get('/', auth.authenticateToken, controller.getComplaints);
router.get('/:id', auth.authenticateToken, controller.getComplaintById);

// User specific routes
router.get('/my', auth.authenticateToken, controller.getMyComplaints);

// Admin routes (NEW - with AI routing)
router.get('/admin', auth.authenticateToken, auth.adminOnly, controller.getAdminComplaints);
router.patch('/status/:id', auth.authenticateToken, auth.adminOnly, controller.updateStatusAndMessage);

module.exports = router;