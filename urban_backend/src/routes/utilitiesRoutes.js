const express = require('express');
const router = express.Router();
const { getEnergyData } = require('../controllers/utilitiesController');

router.get('/energy', getEnergyData);

module.exports = router;