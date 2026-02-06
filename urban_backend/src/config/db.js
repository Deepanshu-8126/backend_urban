const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Supports both MONGO_URI and MONGODB_URI (for Render compatibility)
    let uri = process.env.MONGO_URI || process.env.MONGODB_URI;

    // ✅ Fix: Ensure we connect to 'test' database if path is empty
    if (uri && uri.endsWith('/') && !uri.includes('test')) {
      uri = uri + 'test';
      console.log('🔧 Appending "test" database to connection string');
    }

    await mongoose.connect(uri);
    console.log('✅ MongoDB Connected to:', mongoose.connection.name);
  } catch (error) {
    console.error('❌ MongoDB Error:', error.message);
    // In production, we don't want to crash the whole server if DB is temporarily down,
    // especially on Render where it causes a 502 Bad Gateway immediately.
    // process.exit(1); 
  }
};

module.exports = connectDB;