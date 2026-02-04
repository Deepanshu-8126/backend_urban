/**
 * MODULE 1: URBAN MEMORY VAULT
 * Controller: HTTP handlers for memory vault endpoints
 */

const urbanMemoryService = require('./service');

class UrbanMemoryController {
    /**
     * Sync resolved complaints to memory vault
     * POST /api/v1/intelligence/memory/sync
     */
    async syncMemory(req, res) {
        try {
            const { startDate, endDate } = req.body;

            const timeRange = {};
            if (startDate) timeRange.start = new Date(startDate);
            if (endDate) timeRange.end = new Date(endDate);

            const result = await urbanMemoryService.syncResolvedComplaints(timeRange);

            res.json(result);
        } catch (error) {
            console.error('❌ UrbanMemoryController.syncMemory error:', error);
            res.status(500).json({
                success: false,
                error: error.message,
                module: 'UrbanMemory'
            });
        }
    }

    /**
     * Get area history
     * GET /api/v1/intelligence/memory/area/:areaId
     */
    async getAreaHistory(req, res) {
        try {
            const { areaId } = req.params;
            const { limit, department } = req.query;

            const options = {};
            if (limit) options.limit = parseInt(limit);
            if (department) options.department = department;

            const result = await urbanMemoryService.getAreaHistory(areaId, options);

            res.json(result);
        } catch (error) {
            console.error('❌ UrbanMemoryController.getAreaHistory error:', error);
            res.status(500).json({
                success: false,
                error: error.message,
                module: 'UrbanMemory'
            });
        }
    }

    /**
     * Get department history
     * GET /api/v1/intelligence/memory/department/:dept
     */
    async getDepartmentHistory(req, res) {
        try {
            const { dept } = req.params;
            const { limit, outcome } = req.query;

            const options = {};
            if (limit) options.limit = parseInt(limit);
            if (outcome) options.outcome = outcome;

            const result = await urbanMemoryService.getDepartmentHistory(dept, options);

            res.json(result);
        } catch (error) {
            console.error('❌ UrbanMemoryController.getDepartmentHistory error:', error);
            res.status(500).json({
                success: false,
                error: error.message,
                module: 'UrbanMemory'
            });
        }
    }

    /**
     * Get pattern insights
     * GET /api/v1/intelligence/memory/insights
     */
    async getInsights(req, res) {
        try {
            const { days } = req.query;

            const options = {};
            if (days) options.days = parseInt(days);

            const result = await urbanMemoryService.getInsights(options);

            res.json(result);
        } catch (error) {
            console.error('❌ UrbanMemoryController.getInsights error:', error);
            res.status(500).json({
                success: false,
                error: error.message,
                module: 'UrbanMemory'
            });
        }
    }
}

module.exports = new UrbanMemoryController();
