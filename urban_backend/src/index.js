const express = require('express');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ CORS CONFIGURATION
app.use(cors({
  origin: '*',
  credentials: true
}));
console.log('✅ CORS configured');

// ✅ BODY PARSER
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
console.log('✅ Body parser configured');

// ✅ MULTER CONFIGURATION
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
console.log('✅ Multer configured');

// ✅ CONNECT TO DATABASE
connectDB();
console.log('✅ Database connection initiated');

// ✅ TEST ROUTES FIRST (FOR DEBUGGING)
app.get('/', (req, res) => {
  console.log('🌐 Health check requested');
  res.json({ status: 'OK', message: 'Server Health Check - Working!' });
});

// ✅ SIMPLE TEST ROUTE
app.get('/test', (req, res) => {
  console.log('🧪 Test route requested');
  res.json({ status: 'OK', message: 'Test route working!' });
});

// ✅ DETAILED AUTH ROUTES LOADING
console.log('🔄 Loading auth routes...');
try {
  const authRoutes = require('./routes/authRoutes');
  app.use('/api/v1/auth', (req, res, next) => {
    console.log(`🔐 AUTH REQUEST: ${req.method} ${req.path}`, req.body);
    next();
  }, authRoutes);
  console.log('✅ Auth routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading auth routes:', error.message);
  console.error('Stack trace:', error.stack);
  app.use('/api/v1/auth', (req, res) => {
    console.error('❌ Auth routes failed:', req.method, req.path);
    res.status(500).json({ success: false, error: 'Auth routes not loaded' });
  });
}

// ✅ FIXED COMPLAINT ROUTES LOADING (Removed multer from here)
console.log('🔄 Loading complaint routes...');
try {
  const complaintRoutes = require('./routes/complaintRoutes');
  app.use('/api/v1/complaints', (req, res, next) => {
    console.log(`📝 COMPLAINT REQUEST: ${req.method} ${req.path}`, req.body);
    next();
  }, complaintRoutes);
  console.log('✅ Complaint routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading complaint routes:', error.message);
  console.error('Stack trace:', error.stack);
  app.use('/api/v1/complaints', (req, res) => {
    console.error('❌ Complaint routes failed:', req.method, req.path);
    res.status(500).json({ success: false, error: 'Complaint routes not loaded' });
  });
}

// ✅ ADD ADMIN ROUTES
console.log('🔄 Loading admin routes...');
try {
  const adminRoutes = require('./routes/adminRoutes');
  app.use('/api/v1/admin', (req, res, next) => {
    console.log(`⚙️ ADMIN REQUEST: ${req.method} ${req.path}`, req.body);
    next();
  }, adminRoutes);
  console.log('✅ Admin routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading admin routes:', error.message);
  console.error('Stack trace:', error.stack);
  app.use('/api/v1/admin', (req, res) => {
    console.error('❌ Admin routes failed:', req.method, req.path);
    res.status(500).json({ success: false, error: 'Admin routes not loaded' });
  });
}

// ✅ DETAILED ERROR HANDLING
app.use((req, res, next) => {
  console.log(`🔍 REQUEST: ${req.method} ${req.path}`, req.body);
  next();
});

app.use((req, res) => {
  console.log(`❌ NOT FOUND: ${req.method} ${req.path}`);
  res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.path}` });
});

// ✅ ERROR HANDLING MIDDLEWARE
app.use((err, req, res, next) => {
  console.error('💥 SERVER ERROR:', err.message);
  console.error('Stack:', err.stack);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// ✅ START SERVER
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Health Check: http://localhost:${PORT}/`);
  console.log(`🌍 Test Route: http://localhost:${PORT}/test`);
  console.log(`🌍 Auth Routes: http://localhost:${PORT}/api/v1/auth/check-email`);
  console.log(`🌍 Complaint Routes: http://localhost:${PORT}/api/v1/complaints`);
  console.log(`📋 Server started successfully!`);
});

// ✅ HANDLE UNCAUGHT EXCEPTIONS
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err.message);
  console.error('Stack:', err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
});