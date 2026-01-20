const mongoose = require('mongoose');
const trafficSchema = new mongoose.Schema({
  locationName: String,
  congestionLevel: { type: String, enum: ['Low', 'Moderate', 'High', 'Jam'] },
  vehicleCount: Number,
  cameraUrl: String, // Dummy URL for video feed
  coordinates: { lat: Number, lng: Number },
  lastUpdated: { type: Date, default: Date.now }
});
module.exports = mongoose.model('TrafficData', trafficSchema);