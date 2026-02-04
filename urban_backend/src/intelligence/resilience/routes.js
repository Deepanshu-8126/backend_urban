/**
 * MODULE 5: CITY RESILIENCE INDEX
 * Routes
 */

const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.get('/area/:areaId', controller.calculateAreaResilience.bind(controller));
router.get('/city', controller.getCityResilience.bind(controller));
router.get('/trends', controller.getResilienceTrends.bind(controller));

module.exports = router;
