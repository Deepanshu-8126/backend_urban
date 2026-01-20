const express = require('express');
const router = express.Router();
const { cityBrain } = require('../controllers/aiController');

router.post('/citybrain', cityBrain);

module.exports = router;