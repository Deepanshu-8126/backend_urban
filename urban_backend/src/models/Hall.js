const mongoose = require('mongoose');

const hallSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  address: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  pricePerDay: {
    type: Number,
    required: true,
    min: 0
  },
  images: [{
    type: String, // URLs to images
    required: true
  }],
  amenities: [{
    type: String,
    enum: ['AC', 'Parking', 'Catering', 'Sound System', 'Decoration', 'Security']
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  source: {
    type: String,
    enum: ['google_places', 'government', 'manual'],
    default: 'manual'
  },
  googlePlaceId: String, // For Google Places API reference
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create 2dsphere index for geospatial queries
hallSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Hall', hallSchema);