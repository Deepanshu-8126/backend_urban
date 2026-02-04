/**
 * MODULE 2: SILENT PROBLEM DETECTOR
 * Model: Detect abnormal absence of complaints
 */

const mongoose = require('mongoose');

const silentFlagSchema = new mongoose.Schema({
    areaId: {
        type: String,
        required: true,
        index: true
    },

    department: {
        type: String,
        index: true
    },

    // Expected vs actual complaint rates
    expectedComplaintRate: {
        type: Number, // complaints per day
        required: true
    },

    actualComplaintRate: {
        type: Number,
        required: true
    },

    // Silence metrics
    silenceDuration: {
        type: Number, // hours
        required: true
    },

    deviationPercentage: {
        type: Number // percentage below expected
    },

    // Severity classification
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'low',
        index: true
    },

    // Detection metadata
    detectedAt: {
        type: Date,
        default: Date.now,
        index: true
    },

    resolved: {
        type: Boolean,
        default: false,
        index: true
    },

    resolvedAt: {
        type: Date
    },

    // Analysis window
    analysisWindow: {
        start: Date,
        end: Date
    }
});

silentFlagSchema.index({ areaId: 1, resolved: 1 });
silentFlagSchema.index({ detectedAt: -1 });

module.exports = mongoose.model('SilentFlag', silentFlagSchema);
