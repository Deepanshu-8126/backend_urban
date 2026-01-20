const express = require('express');
const router = express.Router();
const { getEnvData } = require('../controllers/environmentController');

router.get('/', getEnvData);

module.exports = router;