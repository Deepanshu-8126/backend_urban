const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, default: 'N/A' },
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
  profilePicture: { type: String, default: '' },

  // ✅ SOS EMERGENCY CONTACTS (Same as User model)
  sosEmergencyContacts: [{
    name: { type: String, required: true },
    phone: { type: String, required: false },
    email: { type: String, required: false, lowercase: true, trim: true },
    relationship: String,
    primary: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    contactMethod: { type: String, enum: ['sms', 'email', 'both'], default: 'sms' }
  }],

  // ✅ SOS SETTINGS
  sosSettings: {
    sosActive: { type: Boolean, default: false },
    smsEnabled: { type: Boolean, default: true },
    emailEnabled: { type: Boolean, default: true },
    policeAlert: { type: Boolean, default: false }
  },

  // ✅ MEDIA CONSENT
  mediaConsent: {
    cameraAccess: { type: Boolean, default: false },
    audioAccess: { type: Boolean, default: false },
    locationAccess: { type: Boolean, default: true }
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// ✅ PASSWORD HASHING (Consistent with User model)
adminSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model('Admin', adminSchema);