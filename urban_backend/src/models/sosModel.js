const mongoose = require('mongoose');

const sosSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'responded', 'resolved', 'fake'],
    default: 'active',
    index: true
  },
  liveLocation: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  // Breadcrumbs for tracking history
  breadcrumbs: [{
    coordinates: [Number],
    timestamp: Date
  }],
  emergencyContacts: [{
    name: String,
    phone: String,
    email: String
  }],
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  batteryLevel: Number,
  deviceInfo: {
    model: String,
    os: String,
    version: String
  },
  panicTriggerMethod: {
    type: String,
    enum: ['hold_button', 'shake_device', 'voice_command', 'double_tap'],
    default: 'hold_button'
  },
  priority: {
    type: Number,
    default: 10,
    min: 1,
    max: 10
  },
  sosType: {
    type: String,
    enum: ['medical', 'crime', 'accident', 'natural_disaster', 'personal_safety', 'other'],
    default: 'other'
  },
  sosMessage: String,
  sosAutoCaptureEvidence: {
    type: Boolean,
    default: false
  },
  sosUserDetails: {
    name: String,
    phone: String,
    email: String
  }
}, {
  timestamps: true
});

// Index for location queries
sosSchema.index({ 'liveLocation.coordinates': '2dsphere' });

module.exports = mongoose.model('SOS', sosSchema);