const mongoose = require('mongoose');

const complaintV2Schema = new mongoose.Schema({
  // Basic Info
  userId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  
  // Media
  image: { type: String, default: '' }, // Base64 image
  audioUrl: { type: String, default: '' },
  videoUrl: { type: String, default: '' },
  
  // Location
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  
  // AI Analysis (NEW)
  assignedDept: { type: String, default: 'other' }, // Assigned by AI
  aiConfidence: { type: Number, default: 0.1 }, // AI confidence score
  category: { type: String, default: 'other' },
  department: { type: String, default: 'general' },
  
  // Status & Admin (NEW)
  status: { 
    type: String, 
    enum: ['pending', 'working', 'solved', 'fake', 'deleted'], 
    default: 'pending' 
  },
  adminMessage: { type: String, default: '' }, // Admin response
  adminResponseAt: { type: Date, default: null },
  
  // Tracking
  priorityScore: { type: Number, default: 1 },
  complaintCount: { type: Number, default: 1 },
  aiProcessed: { type: Boolean, default: false },
  assignedOfficer: { type: String, default: '' },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for performance
complaintV2Schema.index({ "location": "2dsphere" });
complaintV2Schema.index({ "assignedDept": 1 });
complaintV2Schema.index({ "status": 1 });
complaintV2Schema.index({ "userId": 1 });

module.exports = mongoose.model('ComplaintV2', complaintV2Schema);
