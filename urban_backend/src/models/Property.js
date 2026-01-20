const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  propertyId: { type: String, required: true, unique: true },
  ward: { type: String, required: true },
  ownerName: { type: String, required: true },
  area: { type: Number, required: true }, // sq. meters
  propertyType: { 
    type: String, 
    enum: ['residential', 'commercial', 'industrial', 'mixed'],
    required: true 
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number] // [lng, lat]
  },
  circleRate: { type: Number, default: 0 }, // ₹ per sq.m
  assessedValue: { type: Number, default: 0 },
  taxPaid: { type: Boolean, default: false },
  lastAssessmentDate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

propertySchema.index({ "location": "2dsphere" });
module.exports = mongoose.model('Property', propertySchema);