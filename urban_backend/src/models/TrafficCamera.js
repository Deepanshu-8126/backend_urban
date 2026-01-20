const mongoose = require('mongoose');

const trafficCameraSchema = new mongoose.Schema({
  cameraId: { type: String, required: true, unique: true },
  ward: { type: String, required: true },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number] // [lng, lat]
  },
  status: { 
    type: String, 
    enum: ['online', 'offline', 'maintenance'],
    default: 'online'
  },
  lastPing: { type: Date, default: Date.now },
  congestionLevel: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  avgSpeed: { type: Number, default: 0 }, // km/h
  vehicleCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

trafficCameraSchema.index({ "location": "2dsphere" });
module.exports = mongoose.model('TrafficCamera', trafficCameraSchema);