const mongoose = require('mongoose');

const connectDB = async () => {
  // Supports both MONGO_URI and MONGODB_URI (for Render compatibility)
  let uri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ FATAL: No MongoDB URI found in environment variables (MONGO_URI / MONGODB_URI)');
    process.exit(1);
  }

  // Ensure database name is present
  if (uri.endsWith('/')) {
    uri = uri + 'cityos';
    console.log('🔧 Appending "cityos" database to connection string');
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log('✅ MongoDB Connected to:', mongoose.connection.name);
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    // Retry once after 3s before giving up
    await new Promise(r => setTimeout(r, 3000));
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
      console.log('✅ MongoDB Connected (retry) to:', mongoose.connection.name);
    } catch (retryError) {
      console.error('❌ MongoDB Retry Failed — server will run WITHOUT database');
    }
  }
};

module.exports = connectDB;