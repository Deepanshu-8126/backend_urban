// src/routes/complaintRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/complaintController');

router.post('/', controller.submitComplaint);
router.get('/', controller.getComplaints);
router.get('/my', controller.getMyComplaints); // Will work after JWT
router.get('/admin', controller.getAdminFeed); // Will work after JWT
router.patch('/:id/status', controller.updateStatus);

module.exports = router;