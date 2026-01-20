const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  employeeId: String,
  name: String,
  department: String,
  position: String,
  currentLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number]
  },
  lastPing: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'on-break', 'offline'], default: 'active' }
});

staffSchema.index({ "currentLocation": "2dsphere" });
module.exports = mongoose.model('StaffMember', staffSchema);