const mongoose = require('mongoose');

const officerSchema = new mongoose.Schema({
  // Personal Info
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  
  // Role & Permissions
  role: { 
    type: String, 
    enum: ['admin', 'officer', 'staff'], 
    default: 'officer' 
  },
  
  // Department & Ward
  department: { 
    type: String, 
    enum: ['water', 'electricity', 'roads', 'sanitation', 'health', 'general'],
    required: true 
  },
  
  wardId: { type: String, required: true }, // Ward number
  assignedArea: { type: String, default: '' }, // Specific area
  
  // Performance Tracking
  complaintsAssigned: { type: Number, default: 0 },
  complaintsResolved: { type: Number, default: 0 },
  avgResolutionTime: { type: Number, default: 0 }, // in hours
  
  // Status
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date, default: null },
  
  // Audit
  createdBy: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Officer', officerSchema);