const mongoose = require('mongoose');

const citizenSchema = new mongoose.Schema({
  citizenId: { type: String, required: true, unique: true },
  ward: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  householdSize: { type: Number, default: 1 },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number] // [lng, lat]
  },
  createdAt: { type: Date, default: Date.now }
});

citizenSchema.index({ "location": "2dsphere" });
module.exports = mongoose.model('Citizen', citizenSchema);