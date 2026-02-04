const mongoose = require('mongoose');

const disasterSchema = new mongoose.Schema({
  // 🔥 FIX: unique: true hata diya ya unique ID generator laga diya
  alertId: { 
    type: String, 
    default: () => new mongoose.Types.ObjectId().toString() // Auto-generate ID
  },
  
  type: { type: String, required: true },
  severity: { type: String, enum: ['Low', 'Medium', 'Critical', 'High'], default: 'Medium' },
  location: { type: String, required: true },
  coordinates: { lat: Number, lng: Number },
  description: String,
  active: { type: Boolean, default: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DisasterAlert', disasterSchema);