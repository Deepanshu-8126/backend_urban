const express = require('express');
const router = express.Router();
const { getActiveAlerts, triggerSOS } = require('../controllers/disasterController');

router.get('/', getActiveAlerts);
router.post('/sos', triggerSOS);

module.exports = router;