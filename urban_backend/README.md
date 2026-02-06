# 🖥️ Urban Backend - Comprehensive System Documentation

**Central Intelligence Node for Urban OS Smart City Platform**

This repository hosts the **Node.js & Express** server that acts as the backbone of the Urban OS ecosystem. It orchestrates communication between the **Flutter Mobile App**, **Python AI Engine**, and **MongoDB Database**. It is built with a modular "Controller-Service-Route" architecture to ensure scalability and maintainability.

---

## 🛠️ System Architecture

The backend follows a **Layered Architecture**:
1.  **Route Layer (`src/routes`)**: The entry point for all API requests. It routes traffic to the appropriate controllers.
2.  **Middleware Layer (`src/middleware`)**: Handles **JWT Authentication**, **Role Verification (Admin/Citizen)**, and **File Upload Processing (Multer)**.
3.  **Controller Layer (`src/controllers`)**: Contains the business logic. It validates inputs, processes data, and calls the Model layer.
4.  **Model Layer (`src/models`)**: Definies the **Mongoose Schemas** for MongoDB, enforcing data structure and validation.
5.  **Service/Utils Layer (`src/utils`)**: Reusable components like **Email Service (SendGrid/Nodemailer)**, **OTP Generation**, and **Socket.io** logic.

---

## 📂 Internal Folder Structure Breakdown

| Path | Purpose | Key Files |
| :--- | :--- | :--- |
| **`src/controllers`** | Business Logic | `authController.js` (Login/Signup), `complaintController.js` (Main logic), `adminComplaint.controller.js` (Admin actions) |
| **`src/routes`** | API Endpoints | `authRoutes.js`, `complaintRoutes.js`, `adminRoutes.js`, `aiRoutes.js` |
| **`src/models`** | Database Schemas | `User.js`, `Complaint.js`, `Admin.js`, `DisasterAlert.js` |
| **`src/utils`** | Helper Functions | `emailService.js` (Templates), `socket.js` (Real-time), `otpGenerator.js` |
| **`root`** | Configuration | `.env` (Secrets), `app.js` (Entry point), `package.json` (Dependencies) |

---

## 🗄️ Database Schema Documentation

### 1. 👤 User Schema (`User.js`)
*Stores Citizen and Admin profiles.*

| Field | Type | Description |
| :--- | :--- | :--- |
| `name` | String | Full name of the user. |
| `email` | String | Unique email address (Index). |
| `phone` | String | Contact number. |
| `password` | String | **Bcrypt** hashed secure password. |
| `role` | String | `citizen` or `admin`. Controls access levels. |
| `sosEmergencyContacts` | Array | List of emergency contacts (Name, Phone, Email, Verified status). |
| `sosSettings` | Object | Preferences for SOS (SMS enabled, Email enabled). |
| `mediaConsent` | Object | Permissions for Camera/Audio/Location access. |

### 2. 📝 Complaint Schema (`Complaint.js`)
*Stores all reported issues.*

| Field | Type | Description |
| :--- | :--- | :--- |
| `title` | String | Short title of the issue. |
| `description` | String | Detailed explanation. |
| `images` | Array[String] | URLs of uploaded photo evidence (Support multiple). |
| `location` | GeoJSON | `{ type: 'Point', coordinates: [long, lat] }`. Used for geospatial queries. |
| `status` | String | `pending` ➔ `working` ➔ `solved` ➔ `rejected`. |
| `category` | String | AI-detected category (e.g., `garbage`, `pothole`). |
| `userId` | String | Link to the User who filed it. |
| `adminMessage` | String | Feedback from the admin (e.g., "Work started"). |
| `priorityScore` | Number | AI-calculated priority (1-5) based on keywords. |

---

## 🔌 API Reference Guide

### 🔐 Authentication (`/api/v1/auth`)

| Method | Endpoint | Auth? | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/signup` | ❌ | Create a new citizen account. Requires Name, Email, Password. |
| `POST` | `/login` | ❌ | Authenticate user. Returns `token` (JWT) and `user` object. |
| `POST` | `/send-otp` | ❌ | Send verification OTP to email. |
| `POST` | `/verify-otp` | ❌ | Verify email OTP. |
| `POST` | `/sos/contacts` | ✅ | Add a new SOS emergency contact. |
| `GET` | `/sos/contacts` | ✅ | Retrieve list of saved emergency contacts. |
| `GET` | `/profile` | ✅ | Get current user's full profile details. |

### 📢 Complaint Management (`/api/v1/complaints`)

| Method | Endpoint | Auth? | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | ✅ | **Multipart Form**. Submit complaint with Images/Audio. Requires `title`, `desc`, `files`. |
| `GET` | `/` | ✅ | Get all complaints (with Pagination & Filters). |
| `GET` | `/my` | ✅ | Get complaints filed by the *current* user. |
| `GET` | `/heatmap` | ❌ | Get JSON data for map visualization (Lat/Long + Severity). |
| `PATCH` | `/update-status/:id` | 👮 | **Admin Only**. Change status (`pending` -> `solved`). Triggers Notification. |
| `GET` | `/admin/stats` | 👮 | Get dashboard statistics (Total, Solved, Pending counts). |

### 👮 Admin & City Monitor (`/api/v1/admin`)

| Method | Endpoint | Auth? | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/officers` | 👮 | Create a new Field Officer account. |
| `GET` | `/complaints/:dept` | 👮 | Get complaints filtered by Department (e.g., `sanitation`). |
| `POST` | `/assign` | 👮 | Assign a specific complaint to a Field Officer. |
| `GET` | `/analytics/city-stats`| 👮 | Deep analytics data for the "War Room" dashboard. |

---

## ⚡ Real-Time Features (WebSockets)

The backend uses **Socket.io** to push updates instantly.

1.  **Events Emitted:**
    *   `status_update`: Sent to User when Admin changes complaint status.
    *   `sos_alert`: Sent to Admins when a Citizen triggers SOS.
    *   `live_location`: Streams user coordinates during an emergency.
    
2.  **Events Listened:**
    *   `join_room`: User joins their private channel (`user_{id}`).
    *   `sos_trigger`: Activates emergency mode on the server.

---

## 📧 Email Service Configuration

We use a robust email engine located in `src/utils/emailService.js`.
*   **Provider:** Supports **SendGrid** (Production) and **Nodemailer** (Development/Testing).
*   **Templates:**
    *   `OTP Verification`: HTML template with branding.
    *   `SOS Alert`: High-priority email with Google Maps link.
    *   `Complaint Resolved`: Notification with resolution details.

---

## 🚀 Environment Setup (.env)

Modify `.env` in the root directory to configure the server:

```ini
# Server Config
PORT=3000
NODE_ENV=production

# Database
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/cityos

# Security
JWT_SECRET=super_secret_key_change_this
OTP_SECRET=otp_encryption_key

# External Services
SENDGRID_API_KEY=SG.xxxx...
EMAIL_USER=admin@urbanos.com
EMAIL_PASS=secure_password
GEMINI_API_KEY=AIzaSy... (For Chatbot)
```

---

**✨ Developer Note:**
This backend is designed to be **Stateless** (REST API) but maintains **Stateful** connections via WebSockets for critical real-time features. It scales horizontally and uses efficient MongoDB indexing for fast geospatial queries.
