# 🏙️ Urban OS - Smart City Management Platform

> A comprehensive digital platform for smart city governance, citizen engagement, and real-time urban monitoring.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Features & Modules](#features--modules)
5. [API Documentation](#api-documentation)
6. [Database Schema](#database-schema)
7. [Security Implementation](#security-implementation)
8. [Installation & Setup](#installation--setup)
9. [Workflow Documentation](#workflow-documentation)
10. [Project Structure](#project-structure)

---

## 🎯 Overview

**Urban OS** is a full-stack smart city management platform that bridges the gap between citizens and city administration. It provides real-time monitoring, complaint management, emergency services, and data-driven insights for urban governance.

### Key Highlights
- 🏛️ **Dual Panel System**: Separate interfaces for Citizens and Admins
- 📱 **Real-Time Tracking**: Live location updates, AQI monitoring, complaint status
- 🚨 **Emergency SOS**: Real-time location sharing with emergency contacts
- 📊 **Analytics Dashboard**: AI-powered insights and trend analysis
- 🗺️ **Interactive Maps**: Geospatial visualization of complaints, AQI zones, and incidents
- 🔐 **Secure Authentication**: JWT-based auth with OTP verification

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     URBAN OS PLATFORM                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Flutter    │    │   Node.js    │    │   Python     │  │
│  │   Frontend   │◄──►│   Backend    │◄──►│  Analytics   │  │
│  │  (Web/Mobile)│    │   (REST API) │    │   Engine     │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                    │                    │          │
│         │                    │                    │          │
│         ▼                    ▼                    ▼          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              MongoDB Database (NoSQL)                 │  │
│  │  • Users  • Complaints  • SOS  • AQI  • Analytics    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           External Services & APIs                    │  │
│  │  • Twilio (SMS/Calls)  • OpenWeatherMap (AQI)        │  │
│  │  • Geocoding API  • Email Service                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### System Flow
1. **Client Layer**: Flutter app (Web/Mobile)
2. **API Layer**: Node.js Express REST API
3. **Analytics Layer**: Python Flask for AI/ML processing
4. **Data Layer**: MongoDB for persistent storage
5. **External Services**: Third-party integrations

---

## 💻 Technology Stack

### Frontend (Flutter)
```yaml
Framework: Flutter 3.x
Language: Dart
State Management: Provider
Key Packages:
  - flutter_map: Interactive maps
  - geolocator: GPS location services
  - geocoding: Reverse geocoding
  - image_picker: Media capture
  - http: API communication
  - google_fonts: Typography
  - shared_preferences: Local storage
```

### Backend (Node.js)
```yaml
Runtime: Node.js 18+
Framework: Express.js
Language: JavaScript (ES6+)
Key Packages:
  - mongoose: MongoDB ODM
  - jsonwebtoken: JWT authentication
  - bcryptjs: Password hashing
  - multer: File uploads
  - twilio: SMS/Voice services
  - nodemailer: Email service
  - axios: HTTP client
  - cors: Cross-origin requests
```

### Analytics (Python)
```yaml
Runtime: Python 3.9+
Framework: Flask
Key Libraries:
  - pandas: Data manipulation
  - numpy: Numerical computing
  - scikit-learn: ML algorithms
  - pymongo: MongoDB driver
  - flask-cors: CORS handling
```

### Database
```yaml
Database: MongoDB 6.0+
Type: NoSQL Document Database
Collections:
  - users
  - admins
  - complaints
  - sos
  - aqi_data
  - analytics_cache
```

---

## 🎨 Features & Modules

### 1️⃣ **Authentication & User Management**

#### Features
- ✅ Email/Password Registration with OTP Verification
- ✅ Dual Role System (Citizen/Admin)
- ✅ JWT Token-based Authentication
- ✅ Profile Management with Image Upload
- ✅ Password Reset via OTP
- ✅ Session Management

#### Workflow
```
Registration Flow:
1. User enters name, email, password
2. Backend validates and sends OTP via email
3. User enters OTP
4. Backend verifies OTP and creates account
5. JWT token issued, user logged in

Login Flow:
1. User enters email, password, role
2. Backend validates credentials
3. JWT token issued with user details
4. Frontend stores token in SharedPreferences
5. Auto-login on app restart
```

#### API Endpoints
```
POST /api/v1/auth/signup          - Register new user
POST /api/v1/auth/verify-otp      - Verify OTP
POST /api/v1/auth/login           - User login
POST /api/v1/auth/forgot-password - Request password reset
POST /api/v1/auth/reset-password  - Reset password with OTP
GET  /api/v1/auth/profile         - Get user profile
PUT  /api/v1/auth/profile         - Update profile
POST /api/v1/auth/change-password - Change password
```

#### Security Measures
- 🔐 Passwords hashed with bcrypt (10 salt rounds)
- 🔑 JWT tokens with 7-day expiration
- 📧 OTP expires after 10 minutes
- 🚫 Rate limiting on auth endpoints
- ✅ Input validation and sanitization

---

### 2️⃣ **Complaint Management System**

#### Features
- 📝 Multi-category complaint filing (Roads, Water, Electricity, etc.)
- 📍 GPS-based location tagging
- 📸 Multi-image upload support
- 🎥 Video evidence upload
- 🎤 Voice note recording
- 🤖 AI-powered auto-categorization
- ⚠️ Smart conflict detection (title vs description mismatch)
- 📊 Real-time status tracking
- 🗺️ Interactive complaint map
- 📈 Department-wise analytics

#### Workflow

**Citizen Side:**
```
1. Click "File Complaint"
2. Enter title (auto-categorization triggers)
   - Example: Type "water leak" → Category auto-selects "Water"
3. Add description
4. System checks for conflicts
   - If title says "water" but description mentions "road"
   - Shows warning dialog with option to fix
5. Location auto-fetched via GPS
6. Add evidence (photos/video/voice)
7. Submit complaint
8. Receive confirmation with complaint ID
9. Track status in "My Complaints"
```

**Admin Side:**
```
1. View all complaints in "Complaint Hub"
2. Filter by:
   - Status (Pending/In Progress/Resolved)
   - Category
   - Date range
   - Location
3. Click complaint to view details
4. Update status with notes
5. Assign to department (future)
6. Mark as resolved
7. View analytics and trends
```

#### API Endpoints
```
POST   /api/v1/complaints           - Create complaint
GET    /api/v1/complaints/my        - Get user's complaints
GET    /api/v1/complaints           - Get all complaints (admin)
PATCH  /api/v1/complaints/update-status/:id - Update status
DELETE /api/v1/complaints/:id       - Delete complaint (user)
DELETE /api/v1/complaints/permanent/:id - Permanent delete (admin)
```

#### Auto-Categorization Logic
```javascript
Keywords Mapping:
{
  'Roads': ['road', 'pothole', 'asphalt', 'traffic', 'street', 'pavement'],
  'Water': ['water', 'leak', 'pipe', 'supply', 'drain', 'sewage', 'tank'],
  'Electricity': ['electricity', 'light', 'pole', 'wire', 'power', 'blackout'],
  'Garbage': ['garbage', 'trash', 'waste', 'dustbin', 'smell', 'dump'],
  'Traffic': ['traffic', 'jam', 'signal', 'congestion'],
  'Crime': ['crime', 'theft', 'fight', 'harassment', 'robbery'],
  'Street Light': ['light', 'dark', 'lamp', 'bulb'],
  'Sewerage': ['sewer', 'overflow', 'drainage', 'gutter']
}

Process:
1. User types in title field
2. On each keystroke, check title against keywords
3. If match found, auto-select category
4. Visual feedback to user
```

---

### 3️⃣ **Emergency SOS System**

#### Features
- 🚨 3-second hold-to-trigger mechanism
- 📍 Real-time GPS tracking (15-second updates)
- 📱 SMS alerts to emergency contacts
- 📞 Voice call to admin
- 🔋 Battery level monitoring
- 🗺️ Live location breadcrumb trail
- ⚡ Smart location update filtering
- 🔴 Visual SOS active indicator

#### Workflow

**Triggering SOS:**
```
1. User opens "SOS Emergency" screen
2. Holds SOS button for 3 seconds
3. App acquires high-accuracy GPS location
4. Backend creates SOS record
5. Sends initial SMS to all emergency contacts:
   
   🚨 URBANOS EMERGENCY!
   [User Name] needs help!
   📍 https://maps.google.com/?q=29.2183,79.5130
   📞 CALL: +918630623982
   🔋 85%

6. Voice call initiated to admin number
7. Location tracking starts (every 15 seconds)
```

**Real-Time Tracking:**
```
1. Every 15 seconds:
   - App gets current GPS location
   - Sends to backend via updateSOSLocation API
   
2. Backend logic:
   - Calculates distance from previous location
   - If moved >100 meters OR 5th update:
     → Send location update SMS:
     
     🔄 LOCATION UPDATE
     [User Name] is moving!
     📍 NEW LOCATION: https://maps.google.com/?q=29.2195,79.5145
     🔋 82%

3. Breadcrumb trail stored in database
4. Admin can view live location on map
```

**Canceling SOS:**
```
1. User clicks "I AM SAFE - CANCEL ALERT"
2. SOS status changed to 'resolved'
3. Location tracking stops
4. Notification sent to contacts (optional)
```

#### API Endpoints
```
POST   /api/v1/sos/trigger          - Trigger SOS alert
POST   /api/v1/sos/location         - Update live location
DELETE /api/v1/sos/cancel/:sosId    - Cancel SOS
GET    /api/v1/sos/status           - Get SOS status
GET    /api/v1/sos/all              - Get all active SOS (admin)
POST   /api/v1/auth/sos/contacts    - Add emergency contacts
```

#### Location Update Algorithm
```javascript
// Haversine Formula for distance calculation
calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}

// Smart filtering
if (distanceMoved > 0.1 || updateCount % 5 === 0) {
  sendLocationUpdate(); // Send SMS
}
```

---

### 4️⃣ **AQI Monitoring System**

#### Features
- 🌍 Real-time Air Quality Index data
- 📍 Location-based AQI fetching
- 🎨 Color-coded status indicators
- 📊 Pollutant breakdown (PM2.5, PM10, NO2, SO2, CO, O3)
- 🌡️ Weather integration
- 🗺️ City-wide AQI heatmap (Admin)
- 🏙️ Real location name display (Geocoding)

#### Workflow

**Citizen View:**
```
1. Open "AQI Monitor"
2. App fetches current GPS location
3. Reverse geocoding to get city name (e.g., "Haldwani")
4. Call OpenWeatherMap API with coordinates
5. Display:
   - AQI value with color-coded background
   - Status (Good/Moderate/Unhealthy/etc.)
   - Individual pollutant levels
   - Weather info (temp, humidity)
   - Health recommendations
6. Pull to refresh for latest data
```

**Admin View:**
```
1. Open "City Monitor" → "Environment"
2. Display central monitoring station
3. Show city name via geocoding
4. Display:
   - City-wide AQI average
   - Sensor network status
   - Pollutant grid
   - Zone-wise breakdown
5. Real-time updates every 5 minutes
```

#### API Endpoints
```
GET /api/v1/environment?lat={lat}&lng={lng} - Get AQI data
```

#### External API Integration
```javascript
OpenWeatherMap Air Pollution API:
URL: http://api.openweathermap.org/data/2.5/air_pollution
Method: GET
Params: lat, lon, appid

Response Structure:
{
  "coord": { "lon": 79.513, "lat": 29.2183 },
  "list": [{
    "main": { "aqi": 3 },
    "components": {
      "pm2_5": 25.5,
      "pm10": 45.2,
      "no2": 12.3,
      "so2": 5.1,
      "co": 230.5,
      "o3": 45.6
    }
  }]
}

AQI Scale:
1 - Good (0-50)
2 - Moderate (51-100)
3 - Unhealthy for Sensitive Groups (101-150)
4 - Unhealthy (151-200)
5 - Very Unhealthy (201-300)
```

---

### 5️⃣ **City Monitor Dashboard (Admin)**

#### Features
- 📊 Real-time city statistics
- 📈 Trend analysis (24h, 7d, 30d)
- 🗺️ Live incidents map
- 🏢 Department-wise analytics
- 📍 Area-wise breakdown
- 🔥 Hotspot detection
- 📉 Historical data visualization
- 🤖 AI-powered insights

#### Modules

**1. Overview Tab**
```
Displays:
- Total complaints (today, this week, this month)
- Active SOS alerts
- Average AQI
- Response time metrics
- Department performance
- Top complaint categories
- Citizen engagement stats
```

**2. Trends Tab**
```
Features:
- Time-series graphs
- Complaint volume trends
- Category distribution
- Resolution rate over time
- Peak hours analysis
- Seasonal patterns
```

**3. Intelligence Tab**
```
AI-Powered Insights:
- Silent problem detection
  → Areas with low complaints but high potential issues
- Predictive maintenance alerts
- Resource allocation suggestions
- Anomaly detection
- Sentiment analysis (future)
```

**4. Map Tab**
```
Interactive Features:
- Complaint markers (color-coded by status)
- SOS alert markers (pulsing red)
- AQI zones (heatmap overlay)
- Click marker for details
- Filter by category/status
- Time range selector
```

**5. Environment Tab**
```
Displays:
- Central monitoring station location
- City-wide AQI
- Sensor network status
- Pollutant grid
- Zone-wise AQI breakdown
```

#### API Endpoints
```
GET /api/v1/city/real-time-stats    - City overview
GET /api/v1/city/trends?range=7d    - Trend data
GET /api/v1/city/departments        - Department analytics
GET /api/v1/city/areas              - Area analytics
GET /api/v1/city/live-incidents?hours=24 - Map data
```

---

### 6️⃣ **Property Tax Calculator**

#### Features
- 🏠 Property type selection
- 📏 Area-based calculation
- 🗺️ Ward-wise tax rates
- 💰 Instant tax estimation
- 📄 Detailed breakdown
- 💳 Payment integration (future)

#### Workflow
```
1. Select property type (Residential/Commercial/Industrial)
2. Enter area in sq. ft.
3. Select ward/zone
4. System calculates:
   - Base tax
   - Area surcharge
   - Zone multiplier
   - Total tax
5. Display breakdown
6. Option to save/pay
```

#### API Endpoint
```
POST /api/v1/property/calculate-tax
Body: {
  "propertyType": "residential",
  "area": 1500,
  "ward": "Ward-5"
}
```

---

### 7️⃣ **Hall Booking System**

#### Features
- 📅 Date selection
- 🏛️ Hall availability check
- ⏰ Time slot booking
- 👥 Capacity information
- 💵 Pricing details
- 📝 Booking confirmation

---

### 8️⃣ **CityBrain AI Chatbot**

#### Features
- 💬 Natural language queries
- 🤖 AI-powered responses
- 📊 Data-driven answers
- 🔍 Complaint status lookup
- ℹ️ City information
- 🆘 Emergency guidance

---

## 🔌 API Documentation

### Base URL
```
Development: http://localhost:3000/api/v1
Production: https://api.urbanos.com/api/v1
```

### Authentication
All protected endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

### Complete API Reference

#### Authentication APIs
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/signup` | Register new user | ❌ |
| POST | `/auth/verify-otp` | Verify OTP | ❌ |
| POST | `/auth/login` | User login | ❌ |
| POST | `/auth/forgot-password` | Request password reset | ❌ |
| POST | `/auth/reset-password` | Reset password | ❌ |
| GET | `/auth/profile` | Get user profile | ✅ |
| PUT | `/auth/profile` | Update profile | ✅ |
| POST | `/auth/change-password` | Change password | ✅ |
| POST | `/auth/sos/contacts` | Add emergency contacts | ✅ |

#### Complaint APIs
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/complaints` | Create complaint | ✅ |
| GET | `/complaints/my` | Get user complaints | ✅ |
| GET | `/complaints` | Get all complaints | ✅ (Admin) |
| PATCH | `/complaints/update-status/:id` | Update status | ✅ (Admin) |
| DELETE | `/complaints/:id` | Delete own complaint | ✅ |
| DELETE | `/complaints/permanent/:id` | Permanent delete | ✅ (Admin) |

#### SOS APIs
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/sos/trigger` | Trigger SOS | ✅ |
| POST | `/sos/location` | Update location | ✅ |
| DELETE | `/sos/cancel/:sosId` | Cancel SOS | ✅ |
| GET | `/sos/status` | Get SOS status | ✅ |
| GET | `/sos/all` | Get all active SOS | ✅ (Admin) |

#### Environment APIs
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/environment?lat={lat}&lng={lng}` | Get AQI data | ❌ |

#### City Monitor APIs
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/city/real-time-stats` | City overview | ✅ (Admin) |
| GET | `/city/trends?range={range}` | Trend data | ✅ (Admin) |
| GET | `/city/departments` | Department analytics | ✅ (Admin) |
| GET | `/city/areas` | Area analytics | ✅ (Admin) |
| GET | `/city/live-incidents?hours={hours}` | Map incidents | ✅ (Admin) |

#### Property APIs
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/property/calculate-tax` | Calculate tax | ✅ |
| GET | `/property?lat={lat}&long={lng}` | Get nearby properties | ❌ |

---

## 🗄️ Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  password: String (hashed),
  phone: String,
  role: String (enum: ['citizen', 'admin']),
  profilePicture: String (URL),
  sosEmergencyContacts: [{
    name: String,
    phone: String,
    relationship: String,
    email: String
  }],
  sosButtonActive: Boolean,
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date,
  isVerified: Boolean,
  otp: String,
  otpExpiry: Date
}

Indexes:
- email (unique)
- role
- createdAt
```

### Admins Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  password: String (hashed),
  phone: String,
  role: String (default: 'admin'),
  department: String,
  profilePicture: String,
  sosEmergencyContacts: Array,
  sosButtonActive: Boolean,
  permissions: [String],
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- email (unique)
- department
```

### Complaints Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User'),
  userName: String,
  title: String (indexed),
  description: String,
  category: String (indexed),
  subType: String,
  status: String (enum: ['pending', 'in-progress', 'resolved'], indexed),
  priority: Number (1-10),
  location: {
    type: String (default: 'Point'),
    coordinates: [Number] (GeoJSON: [lng, lat]),
    address: String
  },
  images: [String] (URLs),
  video: String (URL),
  audio: String (URL),
  adminNotes: String,
  assignedTo: ObjectId (ref: 'Admin'),
  resolvedAt: Date,
  createdAt: Date (indexed),
  updatedAt: Date
}

Indexes:
- userId
- category
- status
- createdAt (descending)
- location (2dsphere for geospatial queries)

Geospatial Index:
db.complaints.createIndex({ "location": "2dsphere" })
```

### SOS Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User'),
  liveLocation: {
    type: String (default: 'Point'),
    coordinates: [Number] (GeoJSON: [lng, lat])
  },
  breadcrumbs: [{
    coordinates: [Number],
    timestamp: Date
  }],
  emergencyContacts: [{
    name: String,
    phone: String,
    relationship: String,
    email: String
  }],
  status: String (enum: ['active', 'resolved', 'cancelled'], indexed),
  startTime: Date,
  endTime: Date,
  batteryLevel: Number,
  deviceInfo: Object,
  panicTriggerMethod: String,
  sosType: String,
  sosMessage: String,
  priority: Number,
  sosAutoCaptureEvidence: Boolean,
  sosUserDetails: {
    name: String,
    phone: String,
    email: String
  },
  evidencePhotos: [String],
  evidenceAudio: [String],
  resolvedReason: String,
  createdAt: Date (indexed)
}

Indexes:
- userId
- status
- createdAt (descending)
- liveLocation (2dsphere)
```

### AQI Data Collection (Cache)
```javascript
{
  _id: ObjectId,
  location: {
    type: String,
    coordinates: [Number]
  },
  aqi: Number,
  status: String,
  components: {
    pm2_5: Number,
    pm10: Number,
    no2: Number,
    so2: Number,
    co: Number,
    o3: Number
  },
  weather: {
    temp: Number,
    humidity: Number,
    pressure: Number
  },
  fetchedAt: Date,
  expiresAt: Date (TTL index)
}

Indexes:
- location (2dsphere)
- expiresAt (TTL: 1 hour)
```

---

## 🔐 Security Implementation

### 1. Authentication Security

#### Password Security
```javascript
// Hashing with bcrypt
const saltRounds = 10;
const hashedPassword = await bcrypt.hash(password, saltRounds);

// Verification
const isMatch = await bcrypt.compare(inputPassword, storedHash);
```

#### JWT Token Security
```javascript
// Token generation
const token = jwt.sign(
  { 
    id: user._id, 
    email: user.email, 
    role: user.role 
  },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// Token verification middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

#### OTP Security
```javascript
// OTP generation (6-digit)
const otp = Math.floor(100000 + Math.random() * 900000).toString();

// OTP expiry (10 minutes)
const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

// Store hashed OTP
user.otp = await bcrypt.hash(otp, 10);
user.otpExpiry = otpExpiry;
```

### 2. Data Security

#### Input Validation
```javascript
// Email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  throw new Error('Invalid email format');
}

// Phone validation
const phoneRegex = /^[6-9]\d{9}$/;
if (!phoneRegex.test(phone)) {
  throw new Error('Invalid phone number');
}

// Sanitization
const sanitizedInput = input.trim().replace(/[<>]/g, '');
```

#### File Upload Security
```javascript
// Multer configuration
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'video/mp4', 'audio/mpeg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

// Size limit
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});
```

### 3. API Security

#### CORS Configuration
```javascript
const corsOptions = {
  origin: ['http://localhost:3000', 'https://urbanos.com'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
```

#### Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later'
});

app.use('/api/', limiter);

// Stricter limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later'
});

app.use('/api/v1/auth/login', authLimiter);
```

#### SQL Injection Prevention
```javascript
// Using Mongoose ODM (parameterized queries)
const user = await User.findOne({ email: email }); // Safe

// Avoid direct string concatenation
// NEVER: db.collection.find({ email: `${userInput}` }) // Vulnerable
```

### 4. Environment Variables
```bash
# .env file (never committed to git)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
MONGODB_URI=mongodb://localhost:27017/urban_os
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890
OPENWEATHER_API_KEY=your-openweather-key
EMAIL_USER=noreply@urbanos.com
EMAIL_PASS=your-email-password
```

### 5. HTTPS & Encryption
```javascript
// Production: Force HTTPS
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https' && process.env.NODE_ENV === 'production') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});

// Helmet for security headers
const helmet = require('helmet');
app.use(helmet());
```

### 6. Database Security
```javascript
// MongoDB connection with authentication
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  authSource: 'admin',
  user: process.env.DB_USER,
  pass: process.env.DB_PASS
});

// Indexes for performance & security
db.users.createIndex({ email: 1 }, { unique: true });
db.complaints.createIndex({ userId: 1, createdAt: -1 });
```

---

## 🚀 Installation & Setup

### Prerequisites
```bash
Node.js >= 18.0.0
Python >= 3.9
MongoDB >= 6.0
Flutter >= 3.0
```

### Backend Setup (Node.js)

```bash
# Navigate to backend directory
cd urban_backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials
nano .env

# Start MongoDB (if local)
mongod --dbpath /path/to/data

# Run backend
npm run dev

# Backend runs on http://localhost:3000
```

### Analytics Setup (Python)

```bash
# Navigate to analytics directory
cd urban_analytics

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run analytics server
python app.py

# Analytics runs on http://localhost:5000
```

### Frontend Setup (Flutter)

```bash
# Navigate to Flutter directory
cd urban_flutter

# Install dependencies
flutter pub get

# Update API base URL in lib/core/api_service.dart
# Change baseUrl to your backend URL

# Run on Chrome (Web)
flutter run -d chrome

# Run on Android Emulator
flutter run -d emulator-5554

# Run on iOS Simulator
flutter run -d iPhone-14

# Build for production
flutter build web
flutter build apk
flutter build ios
```

### Environment Configuration

**Backend (.env)**
```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/urban_os

# JWT
JWT_SECRET=your-super-secret-key-min-32-characters-long

# Twilio (SMS/Voice)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# OpenWeatherMap
OPENWEATHER_API_KEY=your-api-key

# Email
EMAIL_USER=noreply@urbanos.com
EMAIL_PASS=your-email-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587

# Fast2SMS (Alternative)
FAST2SMS_API_KEY=your-fast2sms-key
```

**Analytics (.env)**
```env
MONGODB_URI=mongodb://localhost:27017/urban_os
FLASK_ENV=development
FLASK_PORT=5000
```

**Flutter (lib/core/api_service.dart)**
```dart
static String _computeBaseUrl() {
  const String lanIp = "10.102.250.35"; // Your LAN IP
  const String port = "3000";

  if (kIsWeb) {
    return "http://localhost:3000/api/v1";
  }

  // For Android/iOS
  return "http://$lanIp:$port/api/v1";
}
```

---

## 📊 Workflow Documentation

### Complete User Journey

#### Citizen Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    CITIZEN JOURNEY                           │
└─────────────────────────────────────────────────────────────┘

1. REGISTRATION & ONBOARDING
   ├─ Open app → Landing page
   ├─ Click "Sign Up"
   ├─ Enter name, email, password
   ├─ Receive OTP via email
   ├─ Enter OTP
   ├─ Account created → Auto-login
   └─ Redirect to Citizen Dashboard

2. DASHBOARD
   ├─ View service cards:
   │  ├─ File Complaint
   │  ├─ Complaint Hub
   │  ├─ SOS Emergency
   │  ├─ AQI Monitor
   │  ├─ Property Tax
   │  ├─ Hall Booking
   │  └─ CityBrain AI
   └─ Profile management

3. FILE COMPLAINT
   ├─ Click "File Complaint"
   ├─ Enter title (auto-categorization)
   ├─ Add description
   ├─ System checks for conflicts
   ├─ Location auto-fetched
   ├─ Add evidence (optional)
   ├─ Submit
   └─ Receive confirmation

4. TRACK COMPLAINTS
   ├─ Click "Complaint Hub"
   ├─ View all complaints
   ├─ Filter by status
   ├─ Click for details
   ├─ View status updates
   └─ Delete if needed

5. EMERGENCY SOS
   ├─ Click "SOS Emergency"
   ├─ Add emergency contacts (first time)
   ├─ Hold button for 3 seconds
   ├─ SOS triggered
   ├─ SMS sent to contacts
   ├─ Location tracked every 15s
   ├─ View "I AM SAFE" button
   └─ Cancel when safe

6. CHECK AQI
   ├─ Click "AQI Monitor"
   ├─ View current AQI
   ├─ See pollutant breakdown
   ├─ Check health recommendations
   └─ Pull to refresh

7. CALCULATE TAX
   ├─ Click "Property Tax"
   ├─ Select property type
   ├─ Enter area
   ├─ Select ward
   ├─ View calculation
   └─ Save/Pay (future)

8. PROFILE MANAGEMENT
   ├─ Open drawer menu
   ├─ Click "My Profile"
   ├─ Update name/photo
   ├─ Change password
   ├─ Manage emergency contacts
   └─ Logout
```

#### Admin Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                     ADMIN JOURNEY                            │
└─────────────────────────────────────────────────────────────┘

1. LOGIN
   ├─ Open app → Landing page
   ├─ Click "Login"
   ├─ Toggle to "Admin"
   ├─ Enter credentials
   └─ Redirect to Admin War Room

2. ADMIN WAR ROOM (Dashboard)
   ├─ View real-time stats
   ├─ Active complaints count
   ├─ SOS alerts
   ├─ AQI overview
   └─ Quick actions

3. CITY MONITOR
   ├─ OVERVIEW TAB
   │  ├─ Total complaints
   │  ├─ Department breakdown
   │  ├─ Response metrics
   │  └─ Top categories
   │
   ├─ TRENDS TAB
   │  ├─ Select time range (24h/7d/30d)
   │  ├─ View trend graphs
   │  ├─ Category distribution
   │  └─ Resolution rate
   │
   ├─ INTELLIGENCE TAB
   │  ├─ AI insights
   │  ├─ Silent problems
   │  ├─ Predictive alerts
   │  └─ Recommendations
   │
   ├─ MAP TAB
   │  ├─ View all complaints on map
   │  ├─ Filter by status/category
   │  ├─ Click marker for details
   │  └─ View SOS alerts
   │
   └─ ENVIRONMENT TAB
      ├─ City-wide AQI
      ├─ Sensor status
      ├─ Pollutant grid
      └─ Zone breakdown

4. COMPLAINT MANAGEMENT
   ├─ Click "Complaint Hub"
   ├─ View all complaints
   ├─ Filter & search
   ├─ Click complaint
   ├─ View full details
   ├─ Update status
   ├─ Add admin notes
   ├─ Assign to department
   └─ Mark resolved

5. SOS MANAGEMENT
   ├─ View active SOS alerts
   ├─ Click for details
   ├─ View live location
   ├─ See breadcrumb trail
   ├─ Contact user
   └─ Dispatch help

6. ANALYTICS
   ├─ View department performance
   ├─ Area-wise analysis
   ├─ Time-based trends
   ├─ Export reports
   └─ Generate insights
```

---

## 📁 Project Structure

```
urban-project/
│
├── urban_backend/                 # Node.js Backend
│   ├── src/
│   │   ├── controllers/           # Business logic
│   │   │   ├── authController.js
│   │   │   ├── complaintController.js
│   │   │   ├── sosController.js
│   │   │   └── cityMonitorController.js
│   │   ├── models/                # MongoDB schemas
│   │   │   ├── User.js
│   │   │   ├── Admin.js
│   │   │   ├── Complaint.js
│   │   │   └── sosModel.js
│   │   ├── routes/                # API routes
│   │   │   ├── authRoutes.js
│   │   │   ├── complaintRoutes.js
│   │   │   ├── sosRoutes.js
│   │   │   └── cityRoutes.js
│   │   ├── middleware/            # Auth, validation
│   │   │   ├── authMiddleware.js
│   │   │   └── uploadMiddleware.js
│   │   ├── services/              # External services
│   │   │   ├── emailService.js
│   │   │   └── smsService.js
│   │   └── intelligence/          # AI modules
│   │       └── silentProblems/
│   ├── uploads/                   # File storage
│   ├── .env                       # Environment variables
│   ├── server.js                  # Entry point
│   └── package.json
│
├── urban_analytics/               # Python Analytics
│   ├── app.py                     # Flask server
│   ├── models/                    # ML models
│   ├── utils/                     # Helper functions
│   ├── requirements.txt
│   └── .env
│
├── urban_flutter/                 # Flutter Frontend
│   ├── lib/
│   │   ├── main.dart              # App entry
│   │   ├── core/                  # Core utilities
│   │   │   ├── api_service.dart   # API client
│   │   │   └── app_provider.dart  # State management
│   │   ├── screens/               # UI screens
│   │   │   ├── auth/              # Login, Register
│   │   │   ├── dashboard/         # Citizen & Admin dashboards
│   │   │   ├── complaints/        # Complaint screens
│   │   │   ├── disaster/          # SOS screens
│   │   │   ├── health/            # AQI screens
│   │   │   ├── admin/             # Admin screens
│   │   │   │   └── city_monitor/  # City monitor tabs
│   │   │   ├── property/          # Tax calculator
│   │   │   ├── ChatBot/           # AI chatbot
│   │   │   └── profile/           # User profile
│   │   └── widgets/               # Reusable widgets
│   ├── assets/                    # Images, fonts
│   ├── pubspec.yaml               # Dependencies
│   └── .env
│
└── README.md                      # This file
```

---

## 🎯 Key Achievements

### Technical Excellence
- ✅ **Full-Stack Implementation**: Flutter + Node.js + Python + MongoDB
- ✅ **Real-Time Features**: Live location tracking, instant updates
- ✅ **AI Integration**: Auto-categorization, conflict detection, insights
- ✅ **Geospatial Queries**: MongoDB 2dsphere indexes for location-based features
- ✅ **External APIs**: Twilio, OpenWeatherMap, Geocoding
- ✅ **Security**: JWT, bcrypt, OTP, input validation, rate limiting

### User Experience
- ✅ **Intuitive UI**: Clean, modern design with smooth animations
- ✅ **Smart Features**: Auto-categorization, conflict warnings
- ✅ **Real-Time Feedback**: Live status updates, location tracking
- ✅ **Accessibility**: Works on web, Android, iOS
- ✅ **Performance**: Optimized queries, caching, lazy loading

### Business Impact
- ✅ **Citizen Engagement**: Easy complaint filing, tracking
- ✅ **Admin Efficiency**: Centralized dashboard, analytics
- ✅ **Emergency Response**: Real-time SOS with location tracking
- ✅ **Data-Driven Decisions**: AI insights, trend analysis
- ✅ **Transparency**: Public complaint tracking, status updates

---

## 📈 Future Enhancements

### Phase 2 (Planned)
- [ ] Push notifications (FCM)
- [ ] Payment gateway integration
- [ ] Multi-language support (Hindi, regional languages)
- [ ] Offline mode with sync
- [ ] Advanced analytics dashboard
- [ ] Chatbot improvements (NLP)
- [ ] Social media integration
- [ ] Gamification (citizen rewards)

### Phase 3 (Vision)
- [ ] IoT sensor integration
- [ ] Predictive maintenance AI
- [ ] Blockchain for transparency
- [ ] AR for infrastructure visualization
- [ ] Voice commands
- [ ] Smart city integrations
- [ ] Public API for third-party apps

---

## 👥 Team & Credits

**Developed by:** Urban OS Team  
**Project Type:** Smart City Management Platform  
**Technology:** Flutter, Node.js, Python, MongoDB  
**Version:** 1.0.0  
**License:** Proprietary

---

## 📞 Support & Contact

For technical support or queries:
- **Email:** support@urbanos.com
- **Phone:** +91-8630623982
- **Website:** https://urbanos.com

---

## 📝 License

Copyright © 2026 Urban OS. All rights reserved.

This project is proprietary software. Unauthorized copying, distribution, or modification is strictly prohibited.

---

**Built with ❤️ for Smart Cities**
