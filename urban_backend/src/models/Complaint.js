const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  // Basic info
  title: { type: String, required: true },
  description: { type: String, default: '' },
  
  // Media URLs (from mobile app)
  imageUrl: { type: String, default: '' },      // Photo URL from mobile
  audioUrl: { type: String, default: '' },      // Audio URL from mobile  
  videoUrl: { type: String, default: '' },      // Video URL from mobile
  
  // Location (mandatory)
  location: {
    type: { type: String, default: 'Point' },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  
  // Status & priority
  status: { 
    type: String, 
    enum: ['pending', 'working', 'solved', 'deleted'], 
    default: 'pending' 
  },
  priorityScore: { type: Number, default: 1 },
  complaintCount: { type: Number, default: 1 },
  
  // User info (from mobile app login)
  userId: { type: String, required: true },
  userName: { type: String, default: '' },      // Deepanshu Kapri
  userContact: { type: String, default: '' },   // 8126552327
  
  // AI analysis
  category: { type: String, default: 'other' },
  department: { type: String, default: 'general' },
  aiProcessed: { type: Boolean, default: false },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: { updatedAt: 'updatedAt' }
});

// Geospatial index
complaintSchema.index({ "location": "2dsphere" });

module.exports = mongoose.model('Complaint', complaintSchema);