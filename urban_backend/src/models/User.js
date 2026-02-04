const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  role: {
    type: String,
    enum: ['citizen', 'admin'],
    default: 'citizen'
  },
  department: {
    type: String,
    default: 'general'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  profilePicture: {
    type: String,
    default: ''
  },
  
  // ✅ SOS EMERGENCY CONTACTS - UPDATED WITH EMAIL SUPPORT
  sosEmergencyContacts: [{
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: false // Made optional
    },
    email: {
      type: String,
      required: false,
      lowercase: true,
      trim: true
    },
    relationship: String,
    primary: {
      type: Boolean,
      default: false
    },
    verified: {
      type: Boolean,
      default: false
    },
    verifiedAt: Date,
    
    // ✅ Contact method preference
    contactMethod: {
      type: String,
      enum: ['sms', 'email', 'both'],
      default: 'sms'
    }
  }]
}, {
  timestamps: true
});

// ✅ CORRECT PASSWORD HASHING (NO next() in async function)
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model('User', userSchema);