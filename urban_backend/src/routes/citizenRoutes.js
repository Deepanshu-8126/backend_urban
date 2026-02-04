const express = require('express');
const router = express.Router();
const { getCitizens, createCitizen } = require('../controllers/citizenController');

router.get('/certificates', getCitizens);
router.post('/certificates', createCitizen);

module.exports = router;