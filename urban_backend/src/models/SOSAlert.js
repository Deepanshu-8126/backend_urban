const mongoose = require('mongoose');

const sosAlertSchema = new mongoose.Schema({
  alertId: { type: String, unique: true },
  ward: String,
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number]
  },
  type: { type: String, enum: ['medical', 'fire', 'accident', 'crime'] },
  status: { type: String, enum: ['pending', 'assigned', 'resolved'], default: 'pending' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'high' },
  timestamp: { type: Date, default: Date.now }
});

sosAlertSchema.index({ "location": "2dsphere" });
module.exports = mongoose.model('SOSAlert', sosAlertSchema);