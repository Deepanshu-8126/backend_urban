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