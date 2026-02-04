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
  
  // ✅ SOS EMERGENCY CONTACTS
  sosEmergencyContacts: [{
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true,
      validate: {
        validator: function(phone) {
          return /^[\+]?[0-9]{10,15}$/.test(phone);
        },
        message: 'Invalid phone number'
      }
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
    verifiedAt: Date
  }],
  
  // ✅ SOS BUTTON STATUS
  sosButtonActive: {
    type: Boolean,
    default: false
  },
  
  // ✅ CAMERA & MICROPHONE PERMISSIONS
  cameraPermission: {
    type: Boolean,
    default: false
  },
  microphonePermission: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// ✅ PASSWORD HASHING
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);