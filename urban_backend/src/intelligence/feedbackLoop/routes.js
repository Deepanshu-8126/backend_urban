/**
 * MODULE 6: FEEDBACK LOOP ENGINE
 * Controller & Routes
 */

const feedbackLoopService = require('./service');
const express = require('express');

class FeedbackLoopController {
    async analyzeLearningPatterns(req, res) {
        try {
            const { days } = req.body;
            const options = {};
            if (days) options.days = parseInt(days);
            const result = await feedbackLoopService.analyzeLearningPatterns(options);
            res.json(result);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getImprovementMetrics(req, res) {
        try {
            const { department } = req.query;
            const options = {};
            if (department) options.department = department;
            const result = await feedbackLoopService.getImprovementMetrics(options);
            res.json(result);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getDepartmentLearning(req, res) {
        try {
            const { dept } = req.params;
            const result = await feedbackLoopService.getDepartmentLearning(dept);
            res.json(result);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

const controller = new FeedbackLoopController();
const router = express.Router();

router.post('/analyze', controller.analyzeLearningPatterns.bind(controller));
router.get('/improvements', controller.getImprovementMetrics.bind(controller));
router.get('/department/:dept', controller.getDepartmentLearning.bind(controller));

module.exports = router;
