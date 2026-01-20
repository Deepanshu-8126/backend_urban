const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const auth = require('../controllers/authController');
const comp = require('../controllers/complaintController');
const { protect, adminOnly } = require('../middleware/auth'); // (Pichla wala auth middleware use kar)

// --- AUTH FLOW ---
router.post('/auth/signup-init', auth.signupInit);       // 1. Email -> OTP
router.post('/auth/signup-complete', auth.signupComplete); // 2. OTP -> Password
router.post('/auth/login', auth.login);                  // 3. Login
router.post('/auth/forgot-password', auth.forgotPasswordInit);
router.post('/auth/reset-password', auth.resetPassword);
router.get('/auth/profile', protect, auth.getProfile);

// --- COMPLAINT FLOW ---
router.post('/complaint/submit', protect, upload.fields([{ name: 'image' }]), comp.submitComplaint);
router.get('/complaint/status', protect, comp.getMyStatus);

// --- ADMIN FLOW ---
router.get('/admin/feed', protect, adminOnly, comp.getAdminFeed);
router.post('/admin/action', protect, adminOnly, comp.adminAction);

module.exports = router;