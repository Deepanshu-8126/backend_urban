# PART V: OPERATIONS & APPENDIX

## 12. Master API Registry (The REST/Socket Atlas)

Urban OS follows a strict REST architecture. Every request MUST contain a `Content-Type: application/json` header.

### 🔌 12.1 Authentication & Profile (`/api/v1/auth`)
| Method | Endpoint | Request Payload Example | Response Example |
| :--- | :--- | :--- | :--- |
| `POST` | `/login` | `{"email": "", "password": ""}` | `{"token": "...", "user": {...}}` |
| `POST` | `/send-otp` | `{"email": "user@city.com"}` | `{"success": true, "msg": "OTP Sent"}` |
| `GET` | `/profile` | None (Requires Auth) | `{"name": "Deepanshu", "role": "admin"}` |

### 📢 12.2 Complaint Management (`/api/v1/complaints`)
| Method | Endpoint | Description | JSON Specification |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | Submit with Media | `Multipart/Form: title, desc, images, lat, long` |
| `GET` | `/my` | History | `Array of Complaint Objects` |
| `GET` | `/heatmap` | Clustered Mapping | `[{ "lat": 29.21, "lng": 79.51, "count": 12 }, ...]` |

### 🚨 12.3 Emergency SOS (`/api/v1/sos`)
| Method | Endpoint | Purpose | Event Context |
| :--- | :--- | :--- | :--- |
| `POST` | `/trigger` | Activate SOS | Triggers SendGrid Email + Admin Socket alert. |
| `PATCH` | `/:id/location` | Breadcrumb Stream | Receives: `{"latitude": 29.2, "longitude": 79.5}` |
| `POST` | `/resolve` | Close Case | Requires verification PIN. |

---

## 13. Master Folder Index (Exhaustive Technical Audit)

### 🗄️ BACKEND DIRECTORY: `urban_backend/`
*   `src/index.js`: The system kernel. Initializes parallel event loops for HTTP and WebSockets. Sets up GZIP compression and Helmet security headers.
*   `src/config/db.js`: Mongoose connection manager with reconnection retry logic.
*   `src/middleware/auth.js`: JWT signature validator and role-gatekeeper.
*   `src/utils/socket.js`: The central broadcast station for real-time notifications.
*   `src/controllers/authController.js`: Manages the 3-phase signup and login crypto-logic.
*   `src/controllers/complaintController.js`: Handles binary media ingestion and AI routing.
*   `src/controllers/sosController.js`: Real-time emergency trigger and telemetry logic.
*   `src/controllers/propertyController.js`: Smart tax calculation and geospatial discovery.
*   `src/controllers/aiController.js`: Bridge for Groq, Gemini, and Local NLP inference.
*   `src/controllers/cityMonitorController.js`: Aggregator for the "War Room" metrics.
*   `src/models/User.js`: Schema for Citizen, Admin, and Emergency contact data.
*   `src/models/Complaint.js`: Ground-truth record with AI validation metadata.
*   `src/models/Property.js`: Spatial asset registry with 2dsphere indexing.
*   `src/models/sosModel.js`: High-frequency breadcrumb telemetry log.

### 📱 FRONTEND DIRECTORY: `urban_flutter/`
*   `lib/main.dart`: App bootstrap with MultiProvider configuration.
*   `lib/core/api_service.dart`: The global network layer with auto-token injection.
*   `lib/core/socket_service.dart`: Keeps the city connection alive in background mode.
*   `lib/core/providers/app_provider.dart`: Global reactive state for user session and theme.
*   `lib/core/providers/auth_provider.dart`: Logic for signup, login, and secure logout.
*   `lib/screens/dashboard/city_monitor_screen.dart`: Data-rich admin dashboard with fl_chart visualization.
*   `lib/screens/complaints/heatmap_screen.dart`: GL-accelerated maps with animated pulses.
*   `lib/screens/safety/sos_screen.dart`: The stress-optimized emergency интерфейс.

---

## 14. Deployment, DevOps & Reliability

### 🛡️ 14.1 Security Manifesto
- **Statelessness**: No session data is stored on Node.js ram; all state is within the JWT. This allows for instant horizontal scaling.
- **Payload Sanitization**: `Express.json()` is limited to 50MB to prevent memory-buffer overflow attacks.
- **GZIP Compression**: All outgoing JSON is compressed, saving up to 80% on payload size for mobile users on weak network signals.

### 🚀 14.2 Deployment Checklists
- **Database**: Ensure MongoDB Atlas allows access from your production IP.
- **Analytics**: Both `train_disaster_model.py` and `train_population_model.py` must be run once before starting the FastAPI server to generate the `.pkl` binary brains.
- **Flutter**: Update `baseUrl` in `lib/core/api_service.dart` and use `flutter build apk --release`.

---

## 15. The Developer Manifesto

Urban OS is built on the principle of **Documented Sovereignty**.

1.  **Code is Truth**: Comments are kept minimal; the code is written in a self-documenting, clean-room style.
2.  **Logic is Central**: Business logic lives in controllers; routes only handle routing.
3.  **Real-time is Mandatory**: If an event has a physical impact (SOS, Fire, Road Block), it MUST be broadcast via Socket.io.
4.  **Spatial is Standard**: No generic coordinates; all location data must use the GeoJSON standard for future GIS integration.

---

**✨ Document Finalized: Building Smarter Cities, One Line of Code at a Time. 🏁**
**Copyright © 2026 Team Urban OS. All Rights Reserved.**
