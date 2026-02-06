const express = require('express');
const router = express.Router();
const controller = require('../controllers/complaintController');
const auth = require('../middleware/auth');

// Photo upload middleware
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'complaint-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// ✅ FIXED: MULTIPART UPLOAD CONFIGURATION
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    fields: 20, // Maximum number of fields
    parts: 30  // Maximum number of parts (including files)
  },
  fileFilter: (req, file, cb) => {
    // Allow images, audio, video
    if (file.mimetype.startsWith('image/') ||
      file.mimetype.startsWith('audio/') ||
      file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images, audio, and video files are allowed'));
    }
  }
});

// ✅ FIXED: CORRECT MIDDLEWARE ORDER FOR MULTIPART
router.post('/',
  auth.authenticateToken,
  upload.fields([
    { name: 'image', maxCount: 1 }, // Legacy
    { name: 'images', maxCount: 5 }, // ✅ Multiple images
    { name: 'audio', maxCount: 1 },
    { name: 'video', maxCount: 1 }
  ]),
  controller.submitComplaint
);

// ✅ OTHER ROUTES (Preserved)
router.get('/', auth.authenticateToken, controller.getComplaints);
router.get('/my', auth.authenticateToken, controller.getMyComplaints);
router.get('/admin', auth.authenticateToken, auth.adminOnly, controller.getAdminComplaints);

// ✅ STATUS UPDATE ROUTES (Renamed to avoid conflicts)
router.patch('/update-status/:id', auth.authenticateToken, auth.adminOnly, controller.updateComplaintStatus);
router.put('/update-status/:id', auth.authenticateToken, auth.adminOnly, controller.updateComplaintStatus);


// ✅ ADDITIONAL ADMIN ROUTES
router.patch('/bulk-status', auth.authenticateToken, auth.adminOnly, controller.bulkUpdateComplaints);
router.get('/admin/status', auth.authenticateToken, auth.adminOnly, controller.getComplaintsByStatus);
router.delete('/permanent/:id', auth.authenticateToken, auth.adminOnly, controller.deleteComplaintPermanently);
router.get('/admin/stats', auth.authenticateToken, auth.adminOnly, controller.getAdminStatistics);

// ✅ HEATMAP ROUTE
router.get('/heatmap', controller.getComplaintHeatmap);

// ✅ LIVE INCIDENTS ROUTE (For Public/City Monitor)
router.get('/public/live', auth.optionalAuthenticateToken, controller.getLiveComplaints);

// ✅ FILE SERVING ROUTE
router.get('/uploads/:filePath', (req, res) => {
  const filePath = req.params.filePath;
  const fullPath = path.join(__dirname, '..', 'uploads', filePath);

  // Check if file exists
  fs.access(fullPath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }
    res.sendFile(fullPath);
  });
});

// ✅ USER DELETE OWN COMPLAINT
router.delete('/:id', auth.authenticateToken, controller.deleteUserComplaint);

// ✅ COMPLAINT BY ID (Must be last to avoid conflicts)
router.get('/:id', auth.authenticateToken, controller.getComplaintById);

module.exports = router;