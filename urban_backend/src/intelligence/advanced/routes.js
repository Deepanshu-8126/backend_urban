/**
 * UNIFIED ROUTES FOR MODULES 7-15
 * Consolidated routing for all advanced intelligence modules
 */

const express = require('express');
const router = express.Router();

// Import services
const {
    DecisionScoreService,
    TimeIntelligenceService,
    TrustService,
    EthicsService,
    AnomalyService
} = require('./services');

const {
    NervousSystemService,
    FatigueService,
    FutureShadowService,
    ConsciousnessService
} = require('./finalServices');

// ==================== MODULE 7: DECISION SIMPLICITY ====================
router.post('/decision/analyze', async (req, res) => {
    try {
        const { days } = req.body;
        const result = await DecisionScoreService.analyzeComplexity({ days: parseInt(days) || 30 });
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/decision/metrics', async (req, res) => {
    try {
        const { department } = req.query;
        const result = await DecisionScoreService.getComplexityMetrics(department);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== MODULE 8: TIME INTELLIGENCE ====================
router.get('/time/peaks', async (req, res) => {
    try {
        const { days, department } = req.query;
        const result = await TimeIntelligenceService.analyzePeakHours({
            days: parseInt(days) || 30,
            department
        });
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== MODULE 9: TRUST ====================
router.post('/trust/calculate/:areaId', async (req, res) => {
    try {
        const { areaId } = req.params;
        const { days } = req.body;
        const result = await TrustService.calculateTrust(areaId, { days: parseInt(days) || 30 });
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/trust/city', async (req, res) => {
    try {
        const result = await TrustService.getCityTrust();
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== MODULE 10: ETHICS ====================
router.post('/ethics/audit', async (req, res) => {
    try {
        const { days } = req.body;
        const result = await EthicsService.performAudit({ days: parseInt(days) || 30 });
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== MODULE 11: ANOMALY ====================
router.post('/anomaly/detect', async (req, res) => {
    try {
        const { days } = req.body;
        const result = await AnomalyService.detectAnomalies({ days: parseInt(days) || 7 });
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/anomaly/active', async (req, res) => {
    try {
        const result = await AnomalyService.getActiveAnomalies();
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== MODULE 12: NERVOUS SYSTEM ====================
router.get('/nervous/graph', async (req, res) => {
    try {
        const { days } = req.query;
        const result = await NervousSystemService.generateSystemGraph({ days: parseInt(days) || 30 });
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== MODULE 13: FATIGUE ====================
router.post('/fatigue/measure/:areaId', async (req, res) => {
    try {
        const { areaId } = req.params;
        const { days } = req.body;
        const result = await FatigueService.measureFatigue(areaId, { days: parseInt(days) || 30 });
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/fatigue/city', async (req, res) => {
    try {
        const result = await FatigueService.getCityFatigue();
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== MODULE 14: FUTURE SHADOW ====================
router.get('/future/trends', async (req, res) => {
    try {
        const { days, department } = req.query;
        const result = await FutureShadowService.projectTrends({
            days: parseInt(days) || 30,
            department
        });
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== MODULE 15: CONSCIOUSNESS ====================
router.get('/consciousness', async (req, res) => {
    try {
        const { days } = req.query;
        const result = await ConsciousnessService.generateCityHealth({ days: parseInt(days) || 7 });
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== MASTER DASHBOARD ====================
router.get('/dashboard', async (req, res) => {
    try {
        const [consciousness, trust, fatigue, anomalies] = await Promise.all([
            ConsciousnessService.generateCityHealth({ days: 7 }),
            TrustService.getCityTrust(),
            FatigueService.getCityFatigue(),
            AnomalyService.getActiveAnomalies()
        ]);

        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            dashboard: {
                consciousness: consciousness.data,
                trust: trust.data,
                fatigue: fatigue.data,
                anomalies: anomalies.data
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
