const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');
// src/middleware/auth.js
exports.authenticateToken = (req, res, next) => { /* Verify JWT */ };
exports.adminOnly = (req, res, next) => { /* Check admin role */ };
// ✅ Email check
router.post('/check-email', controller.checkEmail);

// ✅ OTP flow
router.post('/send-otp', controller.sendOtp);
router.post('/verify-otp', controller.verifyOtp);
router.post('/reset-password', controller.resetPassword);

// ✅ Signup
router.post('/signup', controller.signup);

module.exports = router;