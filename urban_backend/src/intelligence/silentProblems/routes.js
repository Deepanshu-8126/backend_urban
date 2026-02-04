/**
 * MODULE 2: SILENT PROBLEM DETECTOR
 * Routes
 */

const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.post('/analyze', controller.analyzeSilentZones.bind(controller));
router.get('/active', controller.getActiveSilentZones.bind(controller));
router.get('/history', controller.getHistory.bind(controller));
router.patch('/resolve/:flagId', controller.resolveSilentFlag.bind(controller));

module.exports = router;
