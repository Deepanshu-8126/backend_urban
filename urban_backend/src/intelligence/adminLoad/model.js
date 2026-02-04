/**
 * MODULE 4: ADMIN COGNITIVE LOAD PANEL
 * Model: Track admin workload and mental capacity
 */

const mongoose = require('mongoose');

const adminLoadSchema = new mongoose.Schema({
    adminId: {
        type: String,
        required: true,
        index: true
    },

    department: {
        type: String,
        required: true,
        index: true
    },

    // Workload metrics
    activeIssues: {
        type: Number,
        default: 0
    },

    pendingIssues: {
        type: Number,
        default: 0
    },

    workingIssues: {
        type: Number,
        default: 0
    },

    // Response metrics
    avgResponseTime: {
        type: Number, // hours
        default: 0
    },

    avgResolutionTime: {
        type: Number, // hours
        default: 0
    },

    // Load assessment
    workloadScore: {
        type: Number, // 0-100
        min: 0,
        max: 100,
        default: 0
    },

    burnoutRisk: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'low',
        index: true
    },

    // Performance indicators
    resolutionRate: {
        type: Number, // percentage
        default: 0
    },

    qualityScore: {
        type: Number, // 0-100
        default: 0
    },

    // Time tracking
    measuredAt: {
        type: Date,
        default: Date.now,
        index: true
    },

    measurementWindow: {
        start: Date,
        end: Date
    }
});

adminLoadSchema.index({ adminId: 1, measuredAt: -1 });
adminLoadSchema.index({ department: 1, burnoutRisk: 1 });

module.exports = mongoose.model('AdminLoad', adminLoadSchema);
