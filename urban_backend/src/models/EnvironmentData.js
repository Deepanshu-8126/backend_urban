const mongoose = require('mongoose');
const envSchema = new mongoose.Schema({
  area: String,
  aqi: Number, // Air Quality Index
  pm25: Number,
  no2: Number,
  status: { type: String, enum: ['Good', 'Moderate', 'Unhealthy', 'Hazardous'] },
  lastUpdated: { type: Date, default: Date.now }
});
module.exports = mongoose.model('EnvironmentData', envSchema);