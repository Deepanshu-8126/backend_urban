/**
 * MODULE 1: URBAN MEMORY VAULT
 * Model: Long-term city experience storage
 * Stores resolved complaint metadata for historical analysis
 */

const mongoose = require('mongoose');

const urbanMemorySchema = new mongoose.Schema({
    // Area identification
    areaId: {
        type: String,
        required: true,
        index: true
    },

    // Department and categorization
    department: {
        type: String,
        required: true,
        index: true
    },

    issueType: {
        type: String,
        required: true
    },

    category: {
        type: String,
        default: 'other'
    },

    // Resolution metrics
    resolutionTime: {
        type: Number, // in hours
        required: true
    },

    outcome: {
        type: String,
        enum: ['solved', 'fake', 'deleted'],
        required: true,
        index: true
    },

    // Severity and priority
    severity: {
        type: Number,
        min: 1,
        max: 10,
        default: 5
    },

    priorityScore: {
        type: Number,
        default: 1
    },

    // Original complaint reference (read-only)
    originalComplaintId: {
        type: String,
        required: true
    },

    // Location data
    location: {
        coordinates: [Number],
        address: String
    },

    // Timestamps
    complaintCreatedAt: {
        type: Date,
        required: true
    },

    complaintResolvedAt: {
        type: Date,
        required: true
    },

    recordedAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});

// Compound indexes for efficient queries
urbanMemorySchema.index({ areaId: 1, department: 1 });
urbanMemorySchema.index({ department: 1, outcome: 1 });
urbanMemorySchema.index({ recordedAt: -1 });

module.exports = mongoose.model('UrbanMemory', urbanMemorySchema);
