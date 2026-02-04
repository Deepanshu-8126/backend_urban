const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth'); // ✅ Import correct middleware
const sosController = require('../controllers/sosController');

// ✅ Apply auth middleware to all SOS routes
router.use(authenticateToken);

router.post('/trigger', sosController.triggerSOS);
router.get('/active', sosController.getUserSOS);
router.delete('/cancel/:sosId', sosController.cancelSOS);
router.get('/all', sosController.getAllActiveSOS);
router.post('/location', sosController.updateLiveLocation);
router.get('/status', sosController.getSOSStatus);

module.exports = router;