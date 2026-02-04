/**
 * MODULE 4: ADMIN COGNITIVE LOAD PANEL
 * Controller
 */

const adminLoadService = require('./service');

class AdminLoadController {
    async calculateAdminLoad(req, res) {
        try {
            const { adminId } = req.params;
            const { days } = req.query;

            const options = {};
            if (days) options.days = parseInt(days);

            const result = await adminLoadService.calculateAdminLoad(adminId, options);
            res.json(result);
        } catch (error) {
            console.error('❌ AdminLoadController.calculateAdminLoad error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async calculateDepartmentLoad(req, res) {
        try {
            const { dept } = req.params;
            const { days } = req.query;

            const options = {};
            if (days) options.days = parseInt(days);

            const result = await adminLoadService.calculateDepartmentLoad(dept, options);
            res.json(result);
        } catch (error) {
            console.error('❌ AdminLoadController.calculateDepartmentLoad error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getOverloadAlerts(req, res) {
        try {
            const { severity } = req.query;

            const options = {};
            if (severity) options.severity = severity;

            const result = await adminLoadService.getOverloadAlerts(options);
            res.json(result);
        } catch (error) {
            console.error('❌ AdminLoadController.getOverloadAlerts error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getAdminLoadHistory(req, res) {
        try {
            const { adminId } = req.params;
            const { days } = req.query;

            const options = {};
            if (days) options.days = parseInt(days);

            const result = await adminLoadService.getAdminLoadHistory(adminId, options);
            res.json(result);
        } catch (error) {
            console.error('❌ AdminLoadController.getAdminLoadHistory error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = new AdminLoadController();
