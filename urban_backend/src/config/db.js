const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Supports both MONGO_URI and MONGODB_URI (for Render compatibility)
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    await mongoose.connect(uri);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Error:', error.message);
    // In production, we don't want to crash the whole server if DB is temporarily down,
    // especially on Render where it causes a 502 Bad Gateway immediately.
    // process.exit(1); 
  }
};

module.exports = connectDB;