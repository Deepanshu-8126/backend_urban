/**
 * MODULE 3: URBAN DNA PROFILE
 * Controller
 */

const urbanDNAService = require('./service');

class UrbanDNAController {
    async generateAreaDNA(req, res) {
        try {
            const { areaId } = req.params;
            const { days } = req.body;

            const options = {};
            if (days) options.days = parseInt(days);

            const result = await urbanDNAService.generateAreaDNA(areaId, options);
            res.json(result);
        } catch (error) {
            console.error('❌ UrbanDNAController.generateAreaDNA error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getAreaDNA(req, res) {
        try {
            const { areaId } = req.params;
            const result = await urbanDNAService.getAreaDNA(areaId);
            res.json(result);
        } catch (error) {
            console.error('❌ UrbanDNAController.getAreaDNA error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getAllProfiles(req, res) {
        try {
            const { riskLevel, limit } = req.query;

            const options = {};
            if (riskLevel) options.riskLevel = riskLevel;
            if (limit) options.limit = parseInt(limit);

            const result = await urbanDNAService.getAllProfiles(options);
            res.json(result);
        } catch (error) {
            console.error('❌ UrbanDNAController.getAllProfiles error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getRiskMap(req, res) {
        try {
            const result = await urbanDNAService.getRiskMap();
            res.json(result);
        } catch (error) {
            console.error('❌ UrbanDNAController.getRiskMap error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = new UrbanDNAController();
