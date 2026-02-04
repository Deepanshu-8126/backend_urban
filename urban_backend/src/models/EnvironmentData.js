const mongoose = require('mongoose');
const envSchema = new mongoose.Schema({
  area: String,
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number] // [lng, lat]
  },
  aqi: Number, // Air Quality Index
  pm25: Number,
  pm10: Number,
  temp: Number,
  humidity: Number,
  no2: Number,
  so2: Number,
  co: Number,
  o3: Number,
  status: { type: String, enum: ['Good', 'Moderate', 'Unhealthy for Sensitive Groups', 'Unhealthy', 'Very Unhealthy', 'Hazardous'] },
  lastUpdated: { type: Date, default: Date.now }
});

envSchema.index({ "location": "2dsphere" });

module.exports = mongoose.model('EnvironmentData', envSchema);