const express = require('express');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();
const connectDB = require('./config/db');
const app = express();
const PORT = process.env.PORT || 10000;
const path = require('path');
const fs = require('fs');

// ✅ STARTUP DIAGNOSTICS
console.log('🚀 Starting Smart City Backend [SECURE MODE]...');
console.log('📅 Time:', new Date().toISOString());
console.log('📂 Directory:', process.cwd());
console.log('🔑 Port:', PORT);
console.log('📦 Node version:', process.version);

// ✅ SECURITY MIDDLEWARE
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression'); // ✅ New GZIP Compression

app.use(compression()); // ✅ COMPRESS ALL RESPONSES

app.use(helmet());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: 'Too many requests from this IP'
}));

if (process.env.RENDER) {
  console.log('🌐 Environment: Render Cloud Deployment');
  console.log('📬 Email Logic: ' + (process.env.BREVO_API_KEY ? 'BREVO API (Primary)' : 'SMTP FALLBACK'));
}

// ✅ BODY PARSER CONFIGURATION
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
console.log('✅ Body parser configured');

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
    const path = require('path');
    const uploadDir = path.join(__dirname, '../uploads');
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

// ✅ CONNECT TO DATABASE & START SERVER
const startApp = async () => {
  try {
    console.log('🔄 Connecting to database...');
    await connectDB();
    console.log('✅ Database connection established');

    startServer();
  } catch (error) {
    console.error('❌ Failed to start application:', error.message);
    process.exit(1);
  }
};

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

// ✅ LOGGING MIDDLEWARE
app.use((req, res, next) => {
  console.log(`📥 [${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ✅ OPERATION LOGGING MIDDLEWARE
// ✅ OPERATION LOGGING MIDDLEWARE (ENHANCED LIVE TAIL)
app.use((req, res, next) => {
  const startTime = Date.now();

  // 1. Log Incoming Request
  console.log(`\n📥 [${new Date().toISOString()}] ${req.method} ${req.path}`);

  // 2. Log Body for Debugging (Skip for simple GETs to keep clean)
  if (req.method !== 'GET' && req.body && Object.keys(req.body).length > 0) {
    console.log('📦 BODY:', JSON.stringify(req.body, null, 2));
  }

  // 3. Capture Response Details
  const originalSend = res.send;
  res.send = function (data) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    // Determine Status Icon
    let statusIcon = '✅';
    if (res.statusCode >= 400) statusIcon = '⚠️';
    if (res.statusCode >= 500) statusIcon = '❌';

    console.log(`${statusIcon} OUTGOING: ${req.method} ${req.path} | Status: ${res.statusCode} | Time: ${duration}ms`);

    // 4. Log Error Details if Status is 500
    if (res.statusCode >= 500) {
      console.log('🔥 SERVER ERROR DATA:', data);
    }

    return originalSend.call(this, data);
  };

  next();
});

// ✅ DIRECT DEBUG ROUTE (REMOVED)

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
loadRoutes('./routes/disasterRoutes', '/api/v1/disaster', 'disaster');
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
// loadRoutes('./routes/newComplaintRoutes', '/api/v1/complaints-v2', 'complaint-v2'); // ❌ REMOVED: LEGACY V2 ROUTE
loadRoutes('./routes/aiRoutes', '/api/v1/ai', 'ai');
loadRoutes('./routes/cityMonitorRoutes', '/api/v1/city', 'city-monitor');
loadRoutes('./routes/analyticsRoutes', '/api/v1/analytics', 'analytics');
loadRoutes('./routes/notificationRoutes', '/api/v1/notifications', 'notifications');

loadRoutes('./routes/citizenImpactRoutes', '/api/v1/citizen-impact', 'citizen-impact');
loadRoutes('./routes/projectRoutes', '/api/v1/projects', 'projects'); // NEW: Smart Development Tracker

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
// ✅ PRODUCTION HEALTH CHECK & DIAGNOSTICS
app.get('/api/v1/health', async (req, res) => {
  const mongoose = require('mongoose');
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    diagnostics: {
      database: dbStatus,
      emailMode: process.env.BREVO_API_KEY ? 'Brevo API' : (process.env.SENDGRID_API_KEY ? 'SendGrid' : 'SMTP Fallback'),
      hasBrevoKey: !!process.env.BREVO_API_KEY,
      brevoSender: process.env.BREVO_SENDER_EMAIL || 'not set',
      uploadsWriteable: fs.existsSync(path.join(__dirname, '../uploads')),
      platform: process.platform
    }
  });
});

// ✅ SERVE UPLOADED FILES (Strict Absolute Pathing)
const uploadPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
app.use('/uploads', express.static(uploadPath));
console.log('✅ Uploads directory secured:', uploadPath);

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
  const http = require('http');
  const server = http.createServer(app);
  const io = require('socket.io')(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Global socket attachment
  app.set('socketio', io);

  io.on('connection', (socket) => {
    console.log('🔌 New Client Connected:', socket.id);

    socket.on('join', (data) => {
      // Data can be a string (userId) or an object { userId, department }
      const userId = typeof data === 'string' ? data : data.userId;
      const department = typeof data === 'object' ? data.department : null;

      if (userId) {
        socket.join(userId);
        console.log(`👤 User ${userId} joined their room`);
      }

      if (department) {
        socket.join(`admin_${department}`);
        console.log(`💼 Admin joined department room: admin_${department}`);
      }
    });

    socket.on('disconnect', () => {
      console.log('🔌 Client Disconnected');
    });
  });

  server.listen(PORT, '0.0.0.0', () => {
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
startApp();
