const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'water-admin', 'electricity-admin', 'garbage-admin', 'roads-admin', 'sanitation-admin', 'health-admin'],
    required: true 
  },
  department: { 
    type: String, 
    enum: ['water', 'electricity', 'garbage', 'roads', 'health', 'sanitation', 'general'],
    required: true 
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Admin', adminSchema);