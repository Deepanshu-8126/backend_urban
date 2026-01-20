const express = require('express');
const router = express.Router();
const { createOfficer, getAvailableOfficers } = require('../controllers/officerController');

router.post('/', createOfficer);
router.get('/available', getAvailableOfficers);

module.exports = router;