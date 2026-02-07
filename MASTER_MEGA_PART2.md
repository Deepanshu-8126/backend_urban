## 5. BACKEND CONTROLLER LOGIC (THE ENGINE CORE)

In this section, we dissect the internal algorithmic logic of the primary controllers that power Urban OS.

### 5.1 `authController.js`: Identity and Life Cycle
This controller is the gateway to Urban OS. It implements a non-standard 3-phase verification system to ensure zero spam.

*   **`signupInit(req, res)`**:
    - **Trigger**: User inputs email.
    - **Action**: Generates a cryptographically strong 6-digit OTP using `crypto`. Stores the OTP in the `Otp` collection with a `createdAt` index that triggers MongoDB's TTL (Time To Live) to auto-delete after 600 seconds.
    - **Logic**: Prevents multiple signup attempts by checking if an unexpired OTP already exists for that email.
*   **`verifyOtp(req, res)`**:
    - **Logic**: Compares user input with the stored hash in the DB. If successful, it returns a temporary "Registration Token".
*   **`signupComplete(req, res)`**:
    - **Logic**: Finalizes account creation. Hashes the password using `bcrypt.hash()` with 10 salt rounds. Returns a long-lived JWT (72h) to the app.

### 5.2 `complaintController.js`: The Pulse of Governance
This is the most complex logic unit in the system.

*   **`submitComplaint(req, res)`**:
    - **Logic Layer 1 (Parsing)**: Uses `multer` to extract `req.files`. It maps images, audio, and video to unique storage paths.
    - **Logic Layer 2 (Spatial)**: Converts `req.body.lat` and `req.body.long` into a GeoJSON `Point` object. This is critical for the `2dsphere` spatial indexing in MongoDB.
    - **Logic Layer 3 (AI Validation)**:
        - Forwards the `description` to the Python microservice or Groq API.
        - **Classification**: Determines if the category selected by the user matches the AI's detection.
        - **Prioritization**: Scans for "Critical" tokens (fire, blood, danger, child) and automatically elevates the `priorityScore` to 5.
    - **Logic Layer 4 (Routing)**: Based on the coordinates, it calculates which `ward` the complaint belongs to and emits a socket event to that ward's administrator.
*   **`getHeatmapData(req, res)`**:
    - **Logic**: Uses a spatial aggregation pipeline. It groups complaints by a coordinate grid (rounding lat/lng to 2 decimal places). This ensures that the map renders fast even with 10,000+ reports.

### 5.3 `sosController.js`: Zero-Latency Rescue
Logic designed for speed and reliability.

*   **`triggerSOS(req, res)`**:
    - **Action**: Creates a new record in `sosModel` with `status: 'active'`.
    - **Trigger**: Immediately fires a `socket.broadcast` to all Admin panels.
    - **Alerting**: Calls `emailService.sendSOSAltert` which uses a high-priority template.
*   **`updateLocation(req, res)`**:
    - **Logic**: Receives a fast stream of coordinates. Instead of just overwriting the location, it appends to a `breadcrumbs` array to allow admins to see the "trail" of a victim.

---

## 6. DATABASE ENCYCLOPEDIA (DATA SCHEMAS)

Below is the field-by-field breakdown of the MongoDB DNA.

### 6.1 `User` Schema (Entity Profile)
| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | auto | Unique system identifier. |
| `name` | String | required | Full name (Sanitized). |
| `email` | String | unique | Indexed field for fast search. |
| `role` | Enum | "citizen" | Options: `citizen`, `admin`, `pothole-officer`. |
| `sosContacts` | Array | [] | Sub-document containing `name`, `phone`, `email`. |
| `consent` | Boolean | false | GDPR/Digital India compliance flag. |

### 6.2 `Complaint` Schema (Governance Record)
| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `title` | String | required | User-facing header. |
| `category` | String | required | Departmental routing tag. |
| `location` | GeoJSON | required | Spatial point for 2dsphere indexing. |
| `priority` | Number | 1 | AI-calculated importance (1-5). |
| `images` | Array | [] | List of Relative URLs (`/uploads/...`). |
| `status` | Enum | "pending" | Flow: `pending` -> `working` -> `solved`. |
| `audit` | Object | {...} | Raw AI metadata for discrepancy checking. |

### 6.3 `Property` Schema (City Assets)
| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `propertyId` | String | unique | Unique physical tag (e.g. HAL-102). |
| `owner` | String | required | Name of the registered taxpayer. |
| `area` | Number | required | Square meters (Floating point). |
| `zone` | Enum | "B" | Zone A (High Rate) -> Zone C (Low Rate). |
| `taxDue` | Number | 0 | Dynamic field updated via `propertyController`. |

*(Continuing in Part 3: Frontend UX & Intelligence Detail)*
