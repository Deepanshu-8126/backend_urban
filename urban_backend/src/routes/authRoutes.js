// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');
console.log('Controller functions:', Object.keys(controller));

router.post('/check-email', controller.checkEmail);
router.post('/signup', controller.signup);
router.post('/verify-otp', controller.verifyOtp);        // ✅ Handles both signup & login
router.post('/login', controller.login);
router.post('/forgot-password', controller.forgotPassword);
router.post('/reset-password', controller.resetPassword);

module.exports = router;