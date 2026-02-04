/**
 * MODULE 4: ADMIN COGNITIVE LOAD PANEL
 * Routes
 */

const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.get('/admin/:adminId', controller.calculateAdminLoad.bind(controller));
router.get('/department/:dept', controller.calculateDepartmentLoad.bind(controller));
router.get('/alerts', controller.getOverloadAlerts.bind(controller));
router.get('/history/:adminId', controller.getAdminLoadHistory.bind(controller));

module.exports = router;
