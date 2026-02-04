/**
 * MODULE 1: URBAN MEMORY VAULT
 * Routes: API endpoints for memory vault
 */

const express = require('express');
const router = express.Router();
const controller = require('./controller');

// Sync resolved complaints to memory vault
router.post('/sync', controller.syncMemory.bind(controller));

// Get area history
router.get('/area/:areaId', controller.getAreaHistory.bind(controller));

// Get department history
router.get('/department/:dept', controller.getDepartmentHistory.bind(controller));

// Get pattern insights
router.get('/insights', controller.getInsights.bind(controller));

module.exports = router;
