## 🧠 Feature Deep Dives (Logic & Code)

In this section, we pull back the curtain on the "How" behind our most complex features.

### 🔐 1. Smart Authentication & Security
*   **Location:** `src/controllers/authController.js` | `lib/core/providers/auth_provider.dart`
*   **Logic:**
    *   **JWT Handshake:** On login, the server generates a cryptographically signed token with a 72-hour expiry. This token is stored in the app's `shared_preferences` for persistence.
    *   **Password Hashing:** Uses `bcryptjs` with a salt factor of 10. Direct passwords are never stored.
    *   **Role-Based Access (RBAC):** Middleware checks the `role` field on every admin-guarded route. If a Citizen attempts to hit `POST /api/v1/sos/toggle`, they receive a 403 Forbidden.

### 📢 2. AI-Validated Complaint Reporting
*   **Location:** `src/controllers/complaintController.js` | `lib/screens/complaints/add_complaint_screen.dart`
*   **Logic:**
    *   **Geospatial Indexing:** Uses MongoDB's `2dsphere` index to tag every complaint with a physical location.
    *   **Validation Intelligence:** The system compares the user's selected category with the textual description. If a discrepancy is found (e.g., Cat: "Sanitation" | Desc: "Broken Pipe"), it flags the issue for manual review to prevent departmental misdirection.
    *   **Multi-Media Pipeline:** Uses `multer` to handle parallel uploads of up to 5 photos, 1 audio note, and 1 video clip, ensuring the admin has 360-degree context.

### 🏷️ 3. Dynamic Property Tax & Geospatial Discovery
*   **Location:** `src/controllers/propertyController.js` | `lib/screens/property/nearby_properties.dart`
*   **Logic:**
    *   **Tax Formula:** `TAX = (Area in SQM) * (CircleRate per Zone) * (TypeFactor)`. This formula is computed purely on the backend to prevent frontend tampering.
    *   **Zone Weights:** Zone A (Posh) has a 1.5x multiplier, Zone B (Normal) 1.0x, and Zone C (Outer) 0.8x.
    *   **Proximity Search:** Uses `$nearSphere` with a `maxDistance` parameter to find properties within the user's immediate vicinity (Geofencing).

### 🚨 4. High-Reliability SOS Engine
*   **Location:** `src/controllers/sosController.js` | `lib/core/socket_service.dart`
*   **Logic:**
    *   **Trigger Mechanism:** Supports discrete triggers (Shake OR Long-press). 
    *   **Socket.io Rooms:** Every SOS triggers the creation of a private "Emergency Room". The server emits GPS breadcrumbs only to subscribed Admins and the specific User's room to ensure privacy and low latency.
    *   **Battery Monitoring:** The SOS payload includes `batteryLevel`. If the user's phone is dying, the system triggers a "Final Known Location" broadcast to all emergency contacts instantly.

---

## 🗄️ Database Schema Mastery

The data architecture is the "Truth Layer" of Urban OS. Below are the primary models.

### 👤 User Model (`models/User.js`)
| Field | Data Type | Notes |
| :--- | :--- | :--- |
| `name` | String | User's full name. |
| `email` | String | Unique, indexed, used for login. |
| `phone` | String | Contact for SMS/Contact. |
| `role` | String | Either `citizen` or `admin`. |
| `sosEmergencyContacts` | Array[Object] | Stores Name, Phone, and Email for alerts. |
| `mediaConsent` | Object | Stores permissions for Location/Camera. |

### 📝 Complaint Model (`models/Complaint.js`)
| Field | Data Type | Notes |
| :--- | :--- | :--- |
| `title` | String | Short subject. |
| `description` | String | Detailed issue explanation. |
| `images` | Array[String] | Paths to `/uploads/` folder. |
| `location` | GeoJSON Point | `[longitude, latitude]` for mapping. |
| `status` | String | `pending` | `working` | `solved` | `fake`. |
| `priorityScore` | Number | 1-5, calculated by AI. |
| `validationStatus` | String | `valid` | `mismatch` | `uncertain`. |

### 🏠 Property Model (`models/Property.js`)
| Field | Data Type | Notes |
| :--- | :--- | :--- |
| `propertyId` | String | Unique ID like "HAL-RES-001". |
| `ownerName` | String | Registered owner. |
| `area` | Number | Total plot size in sqm. |
| `zone` | String | A, B, or C (for tax calculation). |
| `taxDue` | Number | Calculated outstanding amount. |
| `location` | GeoJSON Point | For "Find My Property" features. |

### 🚨 SOS Model (`models/sosModel.js`)
| Field | Data Type | Notes |
| :--- | :--- | :--- |
| `userId` | Reference | Link to the victim. |
| `liveLocation` | GeoJSON Point | Latest known coordinates. |
| `status` | String | `active` or `resolved`. |
| `batteryLevel` | Number | Critical for rescue endurance planning. |
| `startTime` | Date | Precise moment of trigger. |

---

*(Continuing in Part 3: API Registry & Developer Guide)*
