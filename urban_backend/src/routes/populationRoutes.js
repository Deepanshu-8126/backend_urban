const express = require('express');
const router = express.Router();
const controller = require('../controllers/populationController');

router.get('/', controller.getPopulation);
router.post('/', controller.createPopulation);

module.exports = router;