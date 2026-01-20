const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  // Basic Info
  title: { type: String, required: true },
  description: { type: String, default: '' },
  
  // Media (Fixed to save URLs properly)
  imageUrl: { type: String, default: '' },      // Save actual URL
  audioUrl: { type: String, default: '' },
  videoUrl: { type: String, default: '' },
  
  // Location (Fixed for lat/long)
  location: {
    type: { type: String, default: 'Point' },
    coordinates: {           // [longitude, latitude] format
      type: [Number],       // Array of [lng, lat]
      required: true,
      validate: {
        validator: function(coords) {
          return coords.length === 2 && 
                 typeof coords[0] === 'number' && 
                 typeof coords[1] === 'number';
        },
        message: 'Coordinates must be [longitude, latitude]'
      }
    }
  },
  
  // User Info
  userId: { type: String, required: true },
  userName: { type: String, default: '' },
  userContact: { type: String, default: '' },
  
  // Status & Tracking
  status: { 
    type: String, 
    enum: ['pending', 'working', 'solved', 'deleted'], 
    default: 'pending' 
  },
  
  // AI & Categorization
  category: { type: String, default: 'other' },
  department: { type: String, default: 'general' },
  aiProcessed: { type: Boolean, default: false },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Ensure 2dsphere index for geospatial queries
complaintSchema.index({ "location": "2dsphere" });

module.exports = mongoose.model('Complaint', complaintSchema);