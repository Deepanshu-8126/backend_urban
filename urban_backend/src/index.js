const express = require('express');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();
const connectDB = require('./config/db');
const app = express();
const PORT = process.env.PORT || 3000;

// ✅ BODY PARSER CONFIGURATION
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
console.log('✅ Body parser configured');

// ✅ CORS CONFIGURATION
// ✅ CORS CONFIGURATION
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
console.log('✅ CORS configured');

// ✅ MULTER CONFIGURATION
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    const fs = require('fs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'upload-' + uniqueSuffix + require('path').extname(file.originalname));
  }
});
const upload = multer({ storage: storage });
console.log('✅ Multer configured');

// ✅ CONNECT TO DATABASE
connectDB();
console.log('✅ Database connection initiated');

// ✅ HEALTH CHECK ROUTES
app.get('/', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const isConnected = mongoose.connection.readyState === 1;
    let counts = { users: 0, admins: 0 };

    if (isConnected) {
      const User = require('./models/User');
      const Admin = require('./models/Admin');
      counts.users = await User.countDocuments().catch(() => 0);
      counts.admins = await Admin.countDocuments().catch(() => 0);
    }

    res.json({
      status: 'OK',
      message: 'Smart City Backend - Live and Connected',
      timestamp: new Date().toISOString(),
      db_connected: isConnected,
      db_stats: counts
    });
  } catch (error) {
    res.json({
      status: 'PARTIAL',
      message: 'Backend live, but diag failed',
      error: error.message
    });
  }
});

app.get('/test', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Test route working!',
    timestamp: new Date().toISOString()
  });
});

// ✅ DIRECT DEBUG ROUTE (Regex Match to catch EVERYTHING)
app.use((req, res, next) => {
  if (req.path.includes('/complaints/update-status/')) {
    console.log(`🔥 FORCE INTERCEPT: ${req.method} ${req.path}`);
    if (req.method === 'PATCH' || req.method === 'PUT' || req.method === 'POST') {
      const controller = require('./controllers/complaintController');
      // Extract ID manually from path
      const parts = req.path.split('/');
      const id = parts[parts.length - 1];
      req.params.id = id;
      console.log(`✅ MANUALLY EXTRACTED ID: ${id}`);
      return controller.updateComplaintStatus(req, res);
    }
  }
  next();
});

// ✅ OPERATION LOGGING MIDDLEWARE
app.use((req, res, next) => {
  const startTime = Date.now();

  // Log incoming request
  console.log(`📥 INCOMING REQUEST: ${req.method} ${req.path}`);
  console.log(`📋 Request Body:`, req.body);
  console.log(`🔑 Headers:`, {
    authorization: req.headers.authorization ? 'Bearer Token Present' : 'No Token',
    'content-type': req.headers['content-type']
  });

  // Log response
  const originalSend = res.send;
  res.send = function (data) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    try {
      const responseData = JSON.parse(data);
      console.log(`📤 RESPONSE SENT: ${req.method} ${req.path} | Status: ${res.statusCode} | Duration: ${duration}ms`);
      console.log(`✅ Response Data:`, responseData);

      // ✅ DATABASE OPERATION DETECTION
      if (responseData.success === true) {
        if (req.path.includes('/auth/sos/contacts')) {
          console.log('💾 DATABASE OPERATION: Emergency contacts added to user document');
        }
        if (req.path.includes('/sos/trigger')) {
          console.log('💾 DATABASE OPERATION: SOS record should be created in SOS collection');
        }
        if (req.path.includes('/complaints') && req.method === 'POST') {
          console.log('💾 DATABASE OPERATION: Complaint record should be created in complaints collection');
        }
      }
    } catch (e) {
      console.log(`📤 RESPONSE SENT: ${req.method} ${req.path} | Status: ${res.statusCode} | Duration: ${duration}ms`);
    }

    return originalSend.call(this, data);
  };

  next();
});

// ✅ DIRECT DEBUG ROUTE (Bypass Everything)
app.patch('/api/v1/complaints/update-status/:id', (req, res) => {
  console.log("🔥 DIRECT HIT IN INDEX.JS: ", req.params.id);
  res.json({ success: true, message: "Direct Hit Works", id: req.params.id });
});

// ✅ LOAD ROUTES FUNCTION
const loadRoutes = (routePath, basePath, routeName) => {
  try {
    console.log(`🔄 Loading ${routeName} routes...`);
    const routes = require(routePath);
    app.use(basePath, (req, res, next) => {
      console.log(`🔍 ${routeName.toUpperCase()} REQUEST: ${req.method} ${req.path}`);
      next();
    }, routes);

    // ✅ LOG REGISTERED ROUTES (Debugging)
    routes.stack.forEach((r) => {
      if (r.route && r.route.path) {
        Object.keys(r.route.methods).forEach((method) => {
          console.log(`📍 REGISTERED: ${method.toUpperCase()} ${basePath}${r.route.path}`);
        });
      }
    });

    console.log(`✅ ${routeName} routes loaded successfully`);
  } catch (error) {
    console.error(`❌ Error loading ${routeName} routes:`, error.message);
    // Create fallback route
    app.use(basePath, (req, res) => {
      res.status(500).json({
        success: false,
        error: `${routeName} routes not loaded`,
        details: error.message
      });
    });
  }
};
// Add this with your other route registrations

loadRoutes('./routes/authRoutes', '/api/v1/auth', 'auth');
loadRoutes('./routes/complaintRoutes', '/api/v1/complaints', 'complaint');
loadRoutes('./routes/adminRoutes', '/api/v1/admin', 'admin');
loadRoutes('./routes/sosRoutes', '/api/v1/sos', 'sos');
loadRoutes('./routes/hallRoutes', '/api/v1/halls', 'hall');
loadRoutes('./routes/dashboardRoutes', '/api/v1/dashboard', 'dashboard');
loadRoutes('./routes/environmentRoutes', '/api/v1/environment', 'environment');
loadRoutes('./routes/populationRoutes', '/api/v1/population', 'population');
loadRoutes('./routes/propertyRoutes', '/api/v1/property', 'property');
loadRoutes('./routes/revenueRoutes', '/api/v1/revenue', 'revenue');
loadRoutes('./routes/trafficRoutes', '/api/v1/traffic', 'traffic');
loadRoutes('./routes/utilitiesRoutes', '/api/v1/utilities', 'utilities');
loadRoutes('./routes/citizenRoutes', '/api/v1/citizen', 'citizen');
loadRoutes('./routes/officerRoutes', '/api/v1/officers', 'officer');
loadRoutes('./routes/newComplaintRoutes', '/api/v1/complaints-v2', 'complaint-v2');
loadRoutes('./routes/aiRoutes', '/api/v1/ai', 'ai');
loadRoutes('./routes/cityMonitorRoutes', '/api/v1/city', 'city-monitor');
loadRoutes('./routes/analyticsRoutes', '/api/v1/analytics', 'analytics');

// ==================== CITY INTELLIGENCE LAYER ROUTES ====================
console.log('🧠 Loading City Intelligence Layer...');
loadRoutes('./intelligence/urbanMemory/routes', '/api/v1/intelligence/memory', 'intelligence-memory');
loadRoutes('./intelligence/silentProblems/routes', '/api/v1/intelligence/silent', 'intelligence-silent');
loadRoutes('./intelligence/urbanDNA/routes', '/api/v1/intelligence/dna', 'intelligence-dna');
loadRoutes('./intelligence/adminLoad/routes', '/api/v1/intelligence/load', 'intelligence-load');
loadRoutes('./intelligence/resilience/routes', '/api/v1/intelligence/resilience', 'intelligence-resilience');
loadRoutes('./intelligence/feedbackLoop/routes', '/api/v1/intelligence/feedback', 'intelligence-feedback');
loadRoutes('./intelligence/advanced/routes', '/api/v1/intelligence/advanced', 'intelligence-advanced');
console.log('✅ City Intelligence Layer loaded successfully');
// ==================== END INTELLIGENCE LAYER ====================
// ✅ SERVE UPLOADED FILES
app.use('/uploads', express.static('uploads'));
console.log('✅ Uploads directory configured');

// ✅ GLOBAL ERROR HANDLING (JSON RESPONSE)
app.use((err, req, res, next) => {
  console.error('🔥 Global Error:', err.message);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, error: `Upload Error: ${err.message}` });
  }
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.path}`
  });
});

// ✅ START SERVER
const startServer = () => {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Health Check: http://localhost:${PORT}/`);
    console.log(`🌍 Test Route: http://localhost:${PORT}/test`);
    console.log(`🌍 Auth Routes: http://localhost:${PORT}/api/v1/auth/check-email`);
    console.log(`🌍 Complaint Routes: http://localhost:${PORT}/api/v1/complaints`);
    console.log(`🌍 SOS Routes: http://localhost:${PORT}/api/v1/sos/trigger`);
    console.log('📋 Server started successfully!');
  });

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received: shutting down gracefully');
    server.close(() => {
      console.log('✅ Process terminated');
    });
  });
};

// ✅ ERROR HANDLERS
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  process.exit(1);
});

// ✅ START THE SERVER
startServer();