const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');
const auth = require('../middleware/auth'); // ✅ Make sure this is imported

// ✅ CORRECT ROUTES WITH PROPER AUTH MIDDLEWARE
router.post('/check-email', controller.checkEmail);
router.post('/send-otp', controller.sendOtp);
router.post('/signup', controller.signup);
router.post('/verify-otp', controller.verifyOtp);
router.post('/login', controller.login);
router.post('/forgot-password', controller.forgotPassword);
router.post('/reset-password', controller.resetPassword);
router.post('/change-password', auth.authenticateToken, controller.changePassword);

// ✅ SOS CONTACTS ROUTES
router.post('/sos/contacts', auth.authenticateToken, controller.addSOSContacts);
router.get('/sos/contacts', auth.authenticateToken, controller.getSOSContacts);
router.put('/sos/contacts', auth.authenticateToken, controller.updateSOSContacts);

// ✅ EMERGENCY CONTACTS ROUTES
router.post('/emergency-contacts', auth.authenticateToken, controller.updateEmergencyContacts);
router.get('/emergency-contacts', auth.authenticateToken, controller.getEmergencyContacts);

// ✅ PROFILE AND SESSION ROUTES
router.get('/profile', auth.authenticateToken, controller.getProfile);
router.put('/profile', auth.authenticateToken, controller.uploadProfilePicture, controller.updateProfile);
router.get('/session/validate', auth.authenticateToken, controller.validateSession);

module.exports = router;