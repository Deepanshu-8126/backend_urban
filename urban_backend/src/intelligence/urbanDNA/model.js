/**
 * MODULE 3: URBAN DNA PROFILE
 * Model: Behavioral pattern fingerprint per area
 */

const mongoose = require('mongoose');

const urbanDNASchema = new mongoose.Schema({
    areaId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    // Dominant characteristics
    dominantIssue: {
        type: String,
        required: true
    },

    // Issue distribution (percentage breakdown)
    issueDistribution: {
        type: Map,
        of: Number, // percentage
        default: {}
    },

    // Seasonal patterns (monthly trends)
    seasonalPattern: {
        type: Map,
        of: Number, // average complaints per month
        default: {}
    },

    // Peak activity hours
    peakHours: {
        type: [Number], // array of hours (0-23)
        default: []
    },

    // Risk assessment
    riskLevel: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'low',
        index: true
    },

    riskScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },

    // Behavioral metrics
    avgComplaintsPerDay: {
        type: Number,
        default: 0
    },

    avgResolutionTime: {
        type: Number, // hours
        default: 0
    },

    resolutionSuccessRate: {
        type: Number, // percentage
        default: 0
    },

    // Metadata
    lastUpdated: {
        type: Date,
        default: Date.now,
        index: true
    },

    dataPoints: {
        type: Number, // number of complaints analyzed
        default: 0
    }
});

module.exports = mongoose.model('UrbanDNA', urbanDNASchema);
