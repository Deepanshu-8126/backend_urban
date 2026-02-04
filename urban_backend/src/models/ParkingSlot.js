const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema({
  slotId: { type: String, required: true, unique: true },
  ward: { type: String, required: true },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number]
  },
  type: { 
    type: String, 
    enum: ['car', 'bike', 'truck', 'ev'],
    default: 'car'
  },
  status: { 
    type: String, 
    enum: ['available', 'occupied', 'reserved', 'maintenance'],
    default: 'available'
  },
  pricing: { type: Number, default: 0 }, // per hour
  isSmart: { type: Boolean, default: true }, // sensor-enabled
  lastUpdated: { type: Date, default: Date.now },
  occupancyHistory: [{
    timestamp: Date,
    duration: Number // minutes
  }]
});

parkingSlotSchema.index({ "location": "2dsphere" });
module.exports = mongoose.model('ParkingSlot', parkingSlotSchema);