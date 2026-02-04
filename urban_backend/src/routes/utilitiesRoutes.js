const express = require('express');
const router = express.Router();
const { getUtilities } = require('../controllers/utilitiesController');

router.get('/energy', getUtilities);

module.exports = router;