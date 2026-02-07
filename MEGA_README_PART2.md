# 🧠 INTELLIGENCE LAYER (8 MODULES)

Urban OS doesn't just store data; it listens to the city. The `src/intelligence` directory contains 8 specialized modules that perform deep behavioral and systemic analysis.

## 1. 🧬 Urban DNA (`urbanDNA/`)
*   **Purpose:** Analyzes the "genetic" makeup of a neighborhood.
*   **Logic:** Combines demographics, infrastructure density, and historic complaint volume to create a "Neighbor Profile".
*   **Outcome:** Predicts which wards will need extra sanitation or security resources next month.

## 2. 🧠 Urban Memory (`urbanMemory/`)
*   **Purpose:** Identifies recurring patterns and "stubborn" problems.
*   **Logic:** If the same bridge has been reported for structural issues 5 times in 2 years, it escalates from a "Complaint" to a "Critical Systemic Failure".
*   **Outcome:** Prevents band-aid solutions for deep structural problems.

## 3. 📉 Silent Problems (`silentProblems/`)
*   **Purpose:** Detects issues in areas where citizens AREN'T reporting.
*   **Logic:** Compares similar wards. If Ward A has 50 reports and Ward B has 0, but both have the same infrastructure age, Ward B might have a "Democratic Deficit"—meaning citizens have given up reporting.
*   **Outcome:** Ensures governance reaches everyone, not just the loudest.

## 4. 💼 Admin Load (`adminLoad/`)
*   **Purpose:** Monitors staff efficiency and burnout.
*   **Logic:** Tracks "Time to Resolution" vs "Incoming Volume" for every department.
*   **Outcome:** Recommends staff transfers from low-load to high-load departments.

## 5. 🏗️ Resilience Layer (`resilience/`)
*   **Purpose:** Disaster preparedness and emergency stability.
*   **Logic:** Cross-references active Disaster Alerts with the availability of safe-zones (Community Halls).
*   **Outcome:** Real-time evacuation routing.

## 6. 🔄 Feedback Loop (`feedbackLoop/`)
*   **Purpose:** Citizen Satisfaction analysis.
*   **Logic:** Performs sentiment analysis on complaint resolution comments.
*   **Outcome:** Grades departments based on "Citizen Trust" instead of just "Solved Count".

## 7. ⚡ Advanced Pulse (`advanced/`)
*   **Purpose:** "City Consciousness" simulation.
*   **Logic:** Aggregates data from 20+ sensors and complaint feeds into a single "Health Score" (0.0 - 1.0).
*   **Outcome:** Provides the "Dashboard Summary" that administrators see every morning.

## 8. 🤝 Shared Intelligence (`shared/`)
*   **Purpose:** Cross-departmental data synchronization.
*   **Logic:** Ensures that a "Water Leak" (Water Dept) report also triggers an alert for the "Road Dept" (potential sinkhole).

---

# 🗄️ DATABASE REFERENCE (THE DATA DNA)

Urban OS uses a strictly typed Mongoose architecture. Below are the technical field definitions.

## 👤 User Schema (`models/User.js`)
| Field | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `name` | String | required | Full legal name. |
| `email` | String | required/unique| Login identifier. |
| `role` | String | "citizen" | `citizen` | `admin`. |
| `sosEmergencyContacts` | Array | [] | Objects with Name, Phone, Email. |
| `sosSettings` | Object | {...} | Toggle email/SMS alerts. |
| `mediaConsent` | Object | {...} | Camera/Mic/Location permissions. |

## 📝 Complaint Schema (`models/Complaint.js`)
| Field | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `title` | String | required | Short summary. |
| `description` | String | required | Detailed textual description. |
| `images` | Array | [] | Multimedia storage IDs. |
| `location` | GeoJSON | required | `type: Point, coordinates: [lng, lat]`. |
| `status` | String | "pending" | Status sequence: pending -> working -> solved. |
| `priorityScore` | Number | 1 | AI-assigned priority (1-5). |
| `validationStatus` | String | "uncertain" | System-generated audit status. |

## 🚨 SOS Model (`models/sosModel.js`)
| Field | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `userId` | ObjectId | required | Link to User record. |
| `liveLocation` | GeoJSON | required | Periodic breadcrumb coordinates. |
| `batteryLevel` | Number | 0 | Device battery at trigger. |
| `sosMessage` | String | "" | Optional custom distress note. |
| `status` | String | "active" | `active` | `resolved`. |

---

# 🔌 API REGISTRY (REST & WEBSOCKETS)

Urban OS exposes a secure endpoint layer protected by JWT and rate-limiting.

## 🔓 PUBLIC / AUTH ENDPOINTS
*   `POST /auth/signup-init`: Sends OTP.
*   `POST /auth/signup-complete`: Verifies OTP and registers account.
*   `POST /auth/login`: Returns JWT and User profile.
*   `POST /auth/forgot-password`: Password reset sequence.

## 📢 CITIZEN FEATURES
*   `POST /complaints/submit`: (Multipart) Submit with media and GPS.
*   `GET /complaints/my`: View personal report history.
*   `POST /sos/trigger`: Initiate emergency mode.
*   `PATCH /sos/:id/location`: Stream breadcrumbs to server.

## 👮 ADMIN COMMANDS (Gated by AdminMiddleware)
*   `GET /complaints/admin/stats`: Global city-wide counters.
*   `GET /complaints/heatmap`: Clustered spatial dataset.
*   `PATCH /complaints/update-status/:id`: Change status + push notification.
*   `POST /admin/officers`: Provision new staff accounts.

## 🔌 SOCKET.IO EVENT MAP
| Event Name | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `join` | App -> Server | `userId` | Registers device in a private room. |
| `sos_alert` | Server -> Admin | `sosRecord` | Flash emergency alert on dash. |
| `status_update`| Server -> App | `complaintId` | Push status change to citizen. |
| `update_location`| App -> Server | `[lat, lng]` | Heartbeat coordinate stream. |

---

# ⚙️ DEVELOPER HANDBOOK

## 1. Environment Setup (.env)
You must populate these variables for the system to function.
```bash
# Core
PORT=3000
MONGO_URI=mongodb+srv://...
JWT_SECRET=...

# Third-Party
SENDGRID_API_KEY=...
GROQ_API_KEY=...
GEMINI_API_KEY=...
```

## 2. Installation Pipeline
Follow this sequence exactly:
1.  `npm install` (Backend & Frontend).
2.  `pip install -r requirements.txt` (Analytics).
3.  `python train_all_models.py` (Generate AI brains).
4.  `node seed_database.js` (Optional demo data).

## 3. Deployment Checklist
*   [ ] Ensure `uploads/` directory is writeable.
*   [ ] Verify `MONGO_URI` connectivity.
*   [ ] Update Flutter `baseUrl` in `api_service.dart`.
*   [ ] Register all department rooms in Socket.io.

---

**✨ Building Smarter Cities, One Line of Code at a Time. 🏁**
