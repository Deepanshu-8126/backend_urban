## 7. FRONTEND SCREEN INVENTORY (UX BLUEPRINTS)

The `urban_flutter` application is divided into logical feature clusters. Below is a detailed inventory of the primary screens and their technical purposes.

### 7.1 Authentication Suite (`lib/screens/auth`)
*   **`landing_page.dart`**:
    - **UX**: High-fidelity glassmorphic design using `BackdropFilter`.
    - **Logic**: Initial entry point. Checks `AppProvider` for an existing JWT. If found, auto-routes to Dashboard.
*   **`login_screen.dart`**:
    - **Logic**: Implements a `GlobalKey<FormState>` for validation. Calls `authProvider.login()`.
    - **Feedback**: Uses `AwesomeDialog` for error reporting (Invalid credentials).
*   **`otp_verification_screen.dart`**:
    - **UX**: 6-digit pin-entry fields with auto-focus.
    - **Logic**: Listens to the `OtpProvider` for verification events.

### 7.2 Complaint Management (`lib/screens/complaints`)
*   **`add_complaint_screen.dart`**:
    - **Complexity**: A multi-step stepper form.
    - **Logic**: Uses `ImagePicker` for camera/gallery. Integrates `speech_to_text` for voice-based descriptions.
    - **Payload**: Builds a `MultipartRequest` using `dio`.
*   **`my_complaints_screen.dart`**:
    - **UX**: List View with Shimmer effects for loading states.
    - **Logic**: Implements a `PullToRefresh` pattern. Filters locally using keywords in the search bar.
*   **`heatmap_screen.dart`**:
    - **Technology**: `flutter_map` with a custom `MarkerLayer`.
    - **Logic**: Fetches clustered grid data from `/api/v1/complaints/heatmap`. Uses `AnimationController` for the "Pulse" glow effect on heat-markers.

### 7.3 Admin War Room (`lib/screens/admin`)
*   **`city_monitor_screen.dart`**:
    - **UX**: Dashboard with `fl_chart` integration for real-time bar and pie charts.
    - **Logic**: Aggregates total city stats (Complaints vs. Resolved).
*   **`intelligence_dashboard.dart`**:
    - **Logic**: Displays the output of the Python AI engine. Shows "Predictive Hotspots" (areas likely to have issues next).

---

## 8. CITY INTELLIGENCE LAYER (G8 ANALYTICS)

The `urban_backend/src/intelligence` directory is the most advanced part of the system. It consists of 8 modules.

1.  **Urban DNA**: Uses Census and Complaint data to create a "Vulnerability Score" for every ward.
2.  **Urban Memory**: A longitudinal database that tracks if a patch of road has been repaired multiple times within a short window.
3.  **Silent Problems**: A statistical deviation detector. It finds wards with suspiciously low reporting levels, indicating a lack of citizen engagement or fear.
4.  **Admin Load**: An HR-tech module. It tracks which department (Water, Road, Sanitation) is overwhelmed and needs more staffing.
5.  **Resilience**: A disaster-management module. It identifies "Bottlenecks" in evacuation routes based on population density.
6.  **Feedback Loop**: Analyzes citizen reviews using Sentiment Analysis to provide a "Qualitative Score" to mayors.
7.  **Advanced Pulse**: A "City Consciousness" simulator that calculates a single number representing the city's overall health.
8.  **Shared Hub**: A synchronization layer that allows different municipal departments to see overlapping data.

---

## 9. API & SOCKET.IO REGISTRY

The communication layer uses standard JSON REST for CRUD and WebSockets for real-time pulses.

### 9.1 RESTful Endpoints (`/api/v1`)

#### 🔐 IDENTITY
*   `POST /auth/login`: `{email, password}` -> `{token, user}`.
*   `POST /auth/send-otp`: Sends 6-digit code.
*   `GET /auth/profile`: Returns full profile + emergency contacts.

#### 📢 COMPLAINTS
*   `POST /complaints/`: Multipart submission.
*   `GET /complaints/my`: User-specific history.
*   `PATCH /complaints/update-status/:id`: Admin update.
*   `GET /complaints/heatmap`: Map visualization data.

#### 🏠 PROPERTY & REVENUE
*   `GET /property/nearby`: List properties within 500m.
*   `POST /property/calculate-tax`: Returns ₹ amount based on area.

### 9.2 Socket.io Events
| Event Name | Direction | Payload |
| :--- | :--- | :--- |
| `sos_trigger` | App -> Server | `userId, lat, lng` |
| `admin_alert` | Server -> Admin | `sosRecord` |
| `status_change`| Server -> App | `newStatus` |
| `live_location`| App -> Server | `[longitude, latitude]` |

---

## 10. DEPLOYMENT, SECURITY & MAINTENANCE

### 10.1 Production Deployment
1.  **Server**: Deploy `urban_backend` to a VPS (AWS EC2/Render).
2.  **Environment**: Set all `.env` keys.
3.  **App**: Compile via `flutter build apk --release`. Ensure `core/api_service.dart` points to the production URL.

### 10.2 Security Hardening
*   **Rate Limiting**: `express-rate-limit` prevents brute-force attacks on OTP endpoints.
*   **Helmet**: Protects headers from cross-site scripting (XSS).
*   **Compression**: GZIP compression on all JSON responses to save bandwidth for field officers on slow 4G.
*   **Stateless JWT**: No session state is stored on the server, making it horizontally scalable.

---

**✨ Document End: Building Smarter Cities, One Line of Code at a Time.**
**Copyright © 2026 Team Urban OS**
