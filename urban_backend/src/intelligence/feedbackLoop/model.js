/**
 * MODULE 6: FEEDBACK LOOP ENGINE
 * Model: System learning and improvement tracking
 */

const mongoose = require('mongoose');

const feedbackLoopSchema = new mongoose.Schema({
    issueType: {
        type: String,
        required: true,
        index: true
    },

    department: {
        type: String,
        required: true,
        index: true
    },

    resolutionOutcome: {
        type: String,
        enum: ['solved', 'fake', 'deleted', 'pending'],
        required: true
    },

    frequency: {
        type: Number,
        default: 1
    },

    avgResolutionTime: {
        type: Number, // hours
        default: 0
    },

    improvementRate: {
        type: Number, // percentage change
        default: 0
    },

    learningScore: {
        type: Number, // 0-100
        min: 0,
        max: 100,
        default: 0
    },

    patterns: {
        type: [String],
        default: []
    },

    recordedAt: {
        type: Date,
        default: Date.now,
        index: true
    },

    analysisWindow: {
        start: Date,
        end: Date
    }
});

feedbackLoopSchema.index({ issueType: 1, department: 1 });
feedbackLoopSchema.index({ recordedAt: -1 });

module.exports = mongoose.model('FeedbackLoop', feedbackLoopSchema);
