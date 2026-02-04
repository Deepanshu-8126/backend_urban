/**
 * MODULE 3: URBAN DNA PROFILE
 * Routes
 */

const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.post('/generate/:areaId', controller.generateAreaDNA.bind(controller));
router.get('/area/:areaId', controller.getAreaDNA.bind(controller));
router.get('/all', controller.getAllProfiles.bind(controller));
router.get('/risk-map', controller.getRiskMap.bind(controller));

module.exports = router;
