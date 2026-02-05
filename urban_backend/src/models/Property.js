const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  propertyId: { type: String, required: true, unique: true },
  ward: { type: String, required: true },
  ownerName: { type: String, required: true },
  area: { type: Number, required: true }, // sq. meters
  propertyType: {
    type: String,
    enum: ['residential', 'commercial', 'industrial', 'mixed', 'hospital', 'hotel', 'open_land'],
    required: true
  },
  constructionType: {
    type: String,
    enum: ['rcc', 'simple', 'patra_shed'],
    default: 'rcc'
  },
  occupancyType: {
    type: String,
    enum: ['self', 'tenanted'],
    default: 'self'
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
  marketValue: { type: Number, default: 0 },
  taxDue: { type: Number, default: 0 },
  zone: { type: String, enum: ['A', 'B', 'C'], default: 'B' }, // A=Posh, B=Normal, C=Outer
  lastTaxPaidDate: { type: Date },
  receiptId: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { strict: false });

propertySchema.index({ "location": "2dsphere" });
module.exports = mongoose.model('Property', propertySchema);