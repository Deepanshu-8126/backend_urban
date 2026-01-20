const mongoose = require('mongoose');

const officerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  department: { 
    type: String, 
    enum: ['sanitation', 'water-works', 'power', 'public-works', 'drainage', 'general'],
    required: true 
  },
  ward: { type: String, required: true },
  currentWorkload: { type: Number, default: 0 }, // Active complaints
  maxCapacity: { type: Number, default: 10 },   // Max they can handle
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
    enum: ['available', 'busy', 'on-leave'],
    default: 'available'
  },
  createdAt: { type: Date, default: Date.now }
});

officerSchema.index({ "location": "2dsphere" });
module.exports = mongoose.model('Officer', officerSchema);