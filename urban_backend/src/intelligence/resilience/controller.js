/**
 * MODULE 5: CITY RESILIENCE INDEX
 * Controller
 */

const resilienceService = require('./service');

class ResilienceController {
    async calculateAreaResilience(req, res) {
        try {
            const { areaId } = req.params;
            const { days } = req.query;

            const options = {};
            if (days) options.days = parseInt(days);

            const result = await resilienceService.calculateAreaResilience(areaId, options);
            res.json(result);
        } catch (error) {
            console.error('❌ ResilienceController.calculateAreaResilience error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getCityResilience(req, res) {
        try {
            const { days } = req.query;

            const options = {};
            if (days) options.days = parseInt(days);

            const result = await resilienceService.getCityResilience(options);
            res.json(result);
        } catch (error) {
            console.error('❌ ResilienceController.getCityResilience error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getResilienceTrends(req, res) {
        try {
            const { areaId, days } = req.query;

            const options = {};
            if (areaId) options.areaId = areaId;
            if (days) options.days = parseInt(days);

            const result = await resilienceService.getResilienceTrends(options);
            res.json(result);
        } catch (error) {
            console.error('❌ ResilienceController.getResilienceTrends error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = new ResilienceController();
