// src/index.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');


require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 3000;

// ✅ FINAL CORS FIX - ALLOW ALL ORIGINS FOR FLUTTER
app.use(cors({
  origin: '*', // This allows Flutter Web, Mobile, and all origins
  credentials: true
}));

// Body parser middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// MULTER MIDDLEWARE FOR FILE UPLOADS
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// MongoDB connection
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// Routes
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/complaints', upload.single('image'), complaintRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'Urban Super System Ready' });
});

// Error handlers
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, error: 'Server error' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});