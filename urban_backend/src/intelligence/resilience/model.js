/**
 * MODULE 5: CITY RESILIENCE INDEX
 * Model: Measure recovery speed and system resilience
 */

const mongoose = require('mongoose');

const resilienceScoreSchema = new mongoose.Schema({
    areaId: {
        type: String,
        required: true,
        index: true
    },

    // Recovery metrics
    avgRecoveryTime: {
        type: Number, // hours
        required: true
    },

    reopenRatio: {
        type: Number, // percentage
        default: 0
    },

    resolutionSuccessRate: {
        type: Number, // percentage
        required: true
    },

    // Resilience scoring
    resilienceIndex: {
        type: Number, // 0-100
        min: 0,
        max: 100,
        required: true
    },

    trend: {
        type: String,
        enum: ['improving', 'stable', 'declining'],
        default: 'stable',
        index: true
    },

    // Additional metrics
    firstResponseTime: {
        type: Number, // hours
        default: 0
    },

    adaptabilityScore: {
        type: Number, // 0-100
        default: 0
    },

    // Department breakdown
    departmentScores: {
        type: Map,
        of: Number,
        default: {}
    },

    // Timestamps
    calculatedAt: {
        type: Date,
        default: Date.now,
        index: true
    },

    analysisWindow: {
        start: Date,
        end: Date
    },

    dataPoints: {
        type: Number,
        default: 0
    }
});

resilienceScoreSchema.index({ areaId: 1, calculatedAt: -1 });
resilienceScoreSchema.index({ resilienceIndex: -1 });

module.exports = mongoose.model('ResilienceScore', resilienceScoreSchema);
