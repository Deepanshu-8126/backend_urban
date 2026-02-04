const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Modern connection without deprecated options
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Error:', error.message);
    // In production, we don't want to crash the whole server if DB is temporarily down,
    // especially on Render where it causes a 502 Bad Gateway immediately.
    // process.exit(1); 
  }
};

module.exports = connectDB;