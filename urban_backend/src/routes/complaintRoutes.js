const express = require('express');
const router = express.Router();
const controller = require('../controllers/complaintController');
const auth = require('../middleware/auth');

// Public routes (need authentication)
router.post('/', auth.authenticateToken, controller.submitComplaint);
router.get('/', auth.authenticateToken, controller.getComplaints);

// User specific routes (ORDER MATTERS!)
router.get('/my', auth.authenticateToken, controller.getMyComplaints);

// Admin routes
router.get('/admin', auth.authenticateToken, auth.adminOnly, controller.getAdminComplaints);

// Status update route
if (typeof controller.updateStatusAndMessage === 'function') {
  router.patch('/status/:id', auth.authenticateToken, auth.adminOnly, controller.updateStatusAndMessage);
} else if (typeof controller.updateStatus === 'function') {
  router.patch('/:id', auth.authenticateToken, auth.adminOnly, controller.updateStatus);
}

// This should be LAST (after /my)
router.get('/:id', auth.authenticateToken, controller.getComplaintById);

module.exports = router;