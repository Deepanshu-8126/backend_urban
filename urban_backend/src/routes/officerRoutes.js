const express = require('express');
const router = express.Router();
const { createOfficer, getOfficers } = require('../controllers/officerController');

router.post('/', createOfficer);
router.get('/available', getOfficers);

module.exports = router;