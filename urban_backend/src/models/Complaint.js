const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  // Basic Info
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, default: '' },        // Legacy support
  images: { type: [String], default: [] },        // ✅ Multiple images support
  audioUrl: { type: String, default: '' },
  videoUrl: { type: String, default: '' },
  
  // Location
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true }, // [longitude, latitude]
    address: { type: String, default: '' } // NEW FIELD for human-readable address
  },
  
  // User Info
  userId: { type: String, required: true },
  userName: { type: String, default: '' },
  userContact: { type: String, default: '' },
  
  // Status & Tracking
  status: { 
    type: String, 
    enum: ['pending', 'working', 'solved', 'fake', 'deleted'], 
    default: 'pending' 
  },
  
  // Admin Communication (NEW)
  adminMessage: { type: String, default: '' },  // NEW FIELD
  adminResponseAt: { type: Date, default: null }, // NEW FIELD
  
  // AI & Categorization
  category: { type: String, default: 'other' },
  subType: { type: String, default: '' }, // NEW FIELD
  department: { type: String, default: 'general' },
  assignedDept: { type: String, default: 'general' }, // NEW FIELD for AI routing
  priorityScore: { type: Number, default: 1 },
  complaintCount: { type: Number, default: 1 },
  aiProcessed: { type: Boolean, default: false },
  assignedOfficer: { type: String, default: '' },
  
  // Validation Status
  validationStatus: { 
    type: String, 
    enum: ['valid', 'mismatch', 'uncertain'], 
    default: 'uncertain' 
  }, // NEW FIELD
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes
complaintSchema.index({ "location": "2dsphere" });
complaintSchema.index({ "department": 1 });
complaintSchema.index({ "status": 1 });
complaintSchema.index({ "userId": 1 });
complaintSchema.index({ "assignedDept": 1 }); // NEW INDEX

module.exports = mongoose.model('Complaint', complaintSchema);