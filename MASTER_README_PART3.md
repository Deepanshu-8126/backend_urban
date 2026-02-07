## 🔌 API Registry (The REST Interface)

All endpoints are prefixed with `/api/v1/`.

### 🔐 Authentication (`/auth`)
| Method | Endpoint | Description | Auth? |
| :--- | :--- | :--- | :--- |
| `POST` | `/signup-init` | Triggers OTP sending to email. | ❌ |
| `POST` | `/signup-complete` | Validates OTP and creates user account. | ❌ |
| `POST` | `/login` | Returns JWT token + User object. | ❌ |
| `POST` | `/forgot-password` | Initiates reset loop. | ❌ |
| `GET` | `/profile` | Returns full profile of authenticated user. | ✅ |

### 📝 Complaint Handling (`/complaints`)
| Method | Endpoint | Description | Auth? |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | **Multipart**. Submit complaint with Images/Audio/Video. | ✅ |
| `GET` | `/` | Returns filtered list of all complaints. | ✅ |
| `GET` | `/my` | Returns complaints filed by the current user. | ✅ |
| `GET` | `/heatmap` | Returns clustered geospatial data for mapping. | ❌ |
| `PATCH` | `/update-status/:id` | **Admin Only**. Change status and send notifications. | 👮 |
| `GET` | `/admin/stats` | **Admin Only**. Aggregate counts for dashboard. | 👮 |

### 🚨 SOS Response (`/sos`)
| Method | Endpoint | Description | Auth? |
| :--- | :--- | :--- | :--- |
| `POST` | `/trigger` | Activates SOS mode and notifies contacts. | ✅ |
| `GET` | `/active` | Fetches the current user's active SOS record. | ✅ |
| `PATCH` | `/:id/location` | Updates breadcrumb coordinates for live tracking. | ✅ |
| `POST` | `/resolve` | Closes an emergency incident with a security PIN. | ✅ |

---

## 🚀 Deployment & DevOps

Urban OS is architected for cloud-native deployment but can also be hosted on-premise.

### 1. Backend Deployment (Render/Heroku/AWS)
*   **Environment Variables:** You MUST set `MONGO_URI`, `JWT_SECRET`, and `SENDGRID_API_KEY`.
*   **Build Command:** `npm install`
*   **Start Command:** `node src/index.js`
*   **Scaling:** The server is stateless (using JWT). You can spin up multiple instances behind a load balancer easily.

### 2. Frontend Deployment (Mobile)
*   **Debug Build:** `flutter run`
*   **Release APK:** `flutter build apk --release`
*   **Store Deployment:** Follow standard Play Store/App Store procedures for a code-signed application.
*   **IP Mapping:** Always set the `baseUrl` in `lib/core/api_service.dart` to the production URL before building the APK.

### 3. Analytics Deployment (Python Microservice)
*   **Dockerization:** Recommended for the Python engine due to dependency complexity.
*   **FastAPI Instance:** Run using `uvicorn app:app --host 0.0.0.0 --port 8001`.

---

## 🧪 Demo & Seeding Guide

To ensure the application looks data-rich and functional during a live demo, we have provided two critical seeding scripts in the `urban_backend/` directory:

1.  **`node seed_haldwani_demo.js`**:
    *   Adds 13+ high-quality properties in the Haldwani and Lamachaur regions.
    *   Populates the "Nearby Properties" list for admin testing.
2.  **`node seed_heatmap_data.js`**:
    *   Seeds 12+ simulated complaints across key landmarks.
    *   Instantly populates the "Live Heat Map" with Red, Orange, and Green hotspots.

---

**✨ Building Smarter Cities, One Line of Code at a Time.**
**Copyright © 2026 Team Urban OS**
