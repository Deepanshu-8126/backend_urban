const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');

// ✅ Email check
router.post('/check-email', controller.checkEmail);

// ✅ OTP flow
router.post('/verify-otp', controller.verifyOtp);

// ✅ Auth flows

router.post('/signup', controller.signup);
router.post('/login', controller.login);
router.post('/forgot-password', controller.forgotPassword);
router.post('/reset-password', controller.resetPassword);
router.get('/profile', require('../middleware/auth').authenticateToken, controller.getProfile);

module.exports = router;