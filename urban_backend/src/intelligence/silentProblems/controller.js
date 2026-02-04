/**
 * MODULE 2: SILENT PROBLEM DETECTOR
 * Controller: HTTP handlers
 */

const silentProblemService = require('./service');

class SilentProblemController {
    /**
     * Trigger silent zone analysis
     * POST /api/v1/intelligence/silent/analyze
     */
    async analyzeSilentZones(req, res) {
        try {
            const { days, threshold } = req.body;

            const options = {};
            if (days) options.days = parseInt(days);
            if (threshold) options.threshold = parseFloat(threshold);

            const result = await silentProblemService.detectSilentZones(options);
            res.json(result);
        } catch (error) {
            console.error('❌ SilentProblemController.analyzeSilentZones error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Get active silent zones
     * GET /api/v1/intelligence/silent/active
     */
    async getActiveSilentZones(req, res) {
        try {
            const { severity, limit } = req.query;

            const options = {};
            if (severity) options.severity = severity;
            if (limit) options.limit = parseInt(limit);

            const result = await silentProblemService.getActiveSilentZones(options);
            res.json(result);
        } catch (error) {
            console.error('❌ SilentProblemController.getActiveSilentZones error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Get historical silent periods
     * GET /api/v1/intelligence/silent/history
     */
    async getHistory(req, res) {
        try {
            const { days, areaId } = req.query;

            const options = {};
            if (days) options.days = parseInt(days);
            if (areaId) options.areaId = areaId;

            const result = await silentProblemService.getHistory(options);
            res.json(result);
        } catch (error) {
            console.error('❌ SilentProblemController.getHistory error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Resolve silent flag
     * PATCH /api/v1/intelligence/silent/resolve/:flagId
     */
    async resolveSilentFlag(req, res) {
        try {
            const { flagId } = req.params;
            const result = await silentProblemService.resolveSilentFlag(flagId);
            res.json(result);
        } catch (error) {
            console.error('❌ SilentProblemController.resolveSilentFlag error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = new SilentProblemController();
