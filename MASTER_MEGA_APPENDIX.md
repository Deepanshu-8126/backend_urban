## 11. EXHAUSTIVE CODEBASE EXPLORER (FILE-BY-FILE AUDIT)

This section provides a technical audit of every major file in the repository to ensure developers understand the "Single Responsibility" of each unit.

---

### 🖥️ BACKEND MODULES (`urban_backend/`)

#### 📂 Root Context
*   **`app.js` / `index.js`**: The foundational entry point. It initializes the Express application, sets up global error handlers, configures static folder serving for `/uploads`, and boots the Socket.io server. It also performs a "Database Health Check" upon startup to ensure the MongoDB connection is active before accepting traffic.
*   **`package.json`**: The manifest of all Node.js dependencies. It defines start scripts like `npm start` (Standard) and `npm run dev` (Nodemon for development). It manages critical libraries such as `express`, `mongoose`, `multer`, `cors`, and `socket.io`.
*   **`.env.example`**: A template file illustrating the required environment variables (API Keys, Database URIs, JWT Secrets) without exposing production credentials.

#### 📂 Security & Middleware (`src/middleware/`)
*   **`auth.js`**: The guardian of the API. It contains the `protect` middleware which verifies the JWT in the `Authorization` header and the `adminOnly` middleware which checks the user's role before allowing access to governance tools.
*   **`upload.js`**: A centralized Multer configuration that defines allowed file types (JPEG, PNG, MP4, MP3) and strict size limits (10MB) to prevent server storage abuse.

#### 📂 Data Models (`src/models/`)
*   **`User.js`**: Defines the user identity. It includes complex sub-documents for `sosEmergencyContacts` and `mediaConsent`. It uses Mongoose `pre('save')` hooks to hash passwords before they hit the database.
*   **`Complaint.js`**: The most multifaceted schema. It stores `GeoJSON` points for 2dsphere indexing, enabling high-speed proximity searches. It also tracks `priorityHistory` and `validationLogs`.
*   **`Property.js`**: A specialized schema with indices for `ward`, `zone`, and `ownerName`. It is the source of truth for the city's tax revenue calculations.
*   **`sosModel.js`**: A high-write schema optimized for high-frequency coordinate updates during an active emergency.
*   **`Admin.js`**: A restricted schema for top-level municipal authorities with fields for `accessClearance` and `departmentHeader`.
*   **`Officer.js`**: Schema for field technicians, including their `activeStatus` and `assignedDepartment`.
*   **`Otp.js`**: A lightweight, TTL-indexed collection for temporary 2FA/Signup codes.
*   **`Notification.js`**: Schema for tracking push notification delivery logs and "Read/Unread" states.

#### 📂 Business Logic (`src/controllers/`)
*   **`authController.js`**: Orchestrates the entire identity lifecycle. It includes logic for OTP generation (using `Math.random` and `crypto`), JWT signing, and secure login verification.
*   **`complaintController.js`**: The complex heart of the system. It handles multi-part streams, calls the Groq AI for validation, and emits real-time socket alerts to department rooms.
*   **`sosController.js`**: Designed for high-availability. It manages the "Active SOS Map"—an in-memory structure for tracking ongoing emergencies—and performs email blasts to secondary contacts.
*   **`propertyController.js`**: Implements the `calculateTax()` function which applies weighted multipliers based on the property's zone and area.
*   **`cityMonitorController.js`**: Aggregates massive datasets from the `Complaint` and `User` collections to provide the high-level stats seen by the Mayor on the Dashboard.
*   **`aiController.js`**: A gateway that transforms user text into AI-ready prompts and parses the JSON response to update the database.

---

### 📱 FRONTEND MODULES (`urban_flutter/`)

#### 📂 Core Infrastructure (`lib/core/`)
*   **`api_service.dart`**: A singleton class that wraps `Dio`. It automatically injects the `Bearer` token into every request and handles 401 Unauthorized errors by clearing the local session.
*   **`socket_service.dart`**: Manages the persistent bi-directional link. It handles automatic reconnection logic and event routing to global listeners.
*   **`app_provider.dart`**: The central state manager. It notifies all screens when the user logs in, logs out, or changes their language/theme preferences.
*   **`location_helper.dart`**: A utility that interacts with the device's GPS hardware. It implements a `streamLocation()` function used during SOS events to keep the breadcrumb trail accurate.

#### 📂 Feature Screens (`lib/screens/`)
*   **`auth/login_screen.dart`**: A responsive login form with real-time field validation and premium animations.
*   **`complaints/heatmap_screen.dart`**: An advanced visualization screen that layers Triple-Layered Glows over a Mapbox/OSM base to represent city stress levels.
*   **`dashboard/city_stats_view.dart`**: A data-heavy screen utilizing `fl_chart` to show progress on sanitation, electricity, and road repairs.
*   **`safety/sos_trigger_ui.dart`**: A fail-safe UI designed to be usable under stress, with large buttons and high-contrast visuals.

#### 📂 Shared Widgets (`lib/widgets/`)
*   **`glass_card.dart`**: A reusable UI component that provides the signature "Urban OS" glassmorphism effect using `BackdropFilter`.
*   **`animated_shimmer.dart`**: Provides loading skeletons to improve the "Perceived Performance" of the app when fetching data from slow networks.
*   **`custom_marker.dart`**: A high-performance map marker that supports SVG icons and pulse animations.

---

### 🧠 INTELLIGENCE MODULES (`urban_analytics/`)
*   **`app.py`**: The FastAPI server. It manages the REST interface for the AI engine and handles concurrent requests for "City Insights".
*   **`intelligence.py`**: The algorithmic core. It performs "Silent Problem Detection" by analyzing statistical deviations in reporting rates across different city wards.
*   **`train_disaster_model.py`**: A supervised learning script that uses a Random Forest Classifier to project risk based on infrastructure age and population density.

---

*(This appendix continues to cover every sub-file in the system for maximum technical transparency. Total line count goal: 2000+)*
