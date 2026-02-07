# PART III: SAFETY & REVENUE SYSTEMS

## 8. The Emergency SOS Network (Rescue-First Logic)

### 8.1 SOS Architecture & Protocol
Located at: `urban_backend/src/controllers/sosController.js` | `urban_flutter/lib/screens/safety/sos_screen.dart`

The SOS system is the high-gravity core of Urban OS safety. It uses a **Multipath Alerting Protocol** to ensure that help is notified even if one communication channel fails.

**The Trigger Sequence (`triggerSOS`)**:
1.  **Device-Side**: Citizen holds the SOS button.
2.  **Socket Pulse**: App emits an `emergency_trigger` event.
3.  **API Fallback**: Parallel to the socket, an HTTP `POST /sos/trigger` is sent.
4.  **Database Write**: A record is created with `status: active`.
5.  **Multi-Alert Dispatch**:
    - **Email (via SendGrid)**: Immediate high-priority HTML email with a Google Maps link to the victim's location.
    - **Admin Dashboard**: A "RED ALERT" modal freezes the admin screen with siren sound and victim details.
    - **System Broadcast**: All admins in the `sos_responders` department receive a push notification.

### 8.2 Real-Time Telemetry & Breadcrumbs
Once active, the system maintains a "Lifeline":
- **Breadcrumb Logic**: The app streams coordinates every 5 seconds.
- **Backend Persistence**: Coordinates are appended to the `locationHistory` array in the `sosModel`. This allows rescuers to see not just where the victim IS, but where they have BEEN.
- **Battery Monitoring**: The app sends `batteryLevel` percent. The backend uses this to estimate "Time to Power-off" and triggers a FINAL ALERT if the battery drops below 5% to the emergency contacts.

---

## 9. Smart Property & Tax Governance

### 9.1 Property Registry Logic
Located at: `urban_backend/src/controllers/propertyController.js`

Governance requires revenue. Urban OS automates property tax calculation using geodata logic to prevent corruption and human error.

**Property Discovery (`getNearbyProperties`)**:
- Uses the geospatial `$nearSphere` operator.
- **Goal**: Allows city assessors in the field to stand in front of a house, tap "Find Property", and instantly see if it is registered and if tax is paid.

### 9.2 The Tax Calculation Heuristic
The `calculateTax` function implements a recursive multiplier logic:
- **Base Rate**: Based on `propertyType` (Commercial > Residential > Industrial).
- **Zone Scalar**: 
    - Zone A (Central/Posh): 1.5x
    - Zone B (Developed): 1.0x
    - Zone C (Fringe/Developing): 0.8x
- **Structural Factor**: Adjusts tax based on `constructionType` (RCC vs Simple).

---

# PART IV: THE BRAIN & THE DATABASE

## 10. The G8 Intelligence Layer (Sub-Module Deep Dives)

The intelligence layer (`urban_backend/src/intelligence/`) is the predictive brain of the system.

### 10.1 💎 Urban DNA (`urbanDNA`)
- **Logic**: Analyzes the correlation between `population_density` and `complaint_frequency`.
- **Purpose**: It determines the "Baseline Health" of a ward. If a ward deviates from its DNA (e.g., sudden trash complaints in a historically clean ward), it triggers a "Neighborhood Stress Alert".

### 10.2 🎞️ Urban Memory (`urbanMemory`)
- **Logic**: A time-series analysis engine.
- **Purpose**: It looks for "Stubborn Problems". If a road patch is repaired every 6 months, `Urban Memory` flags the contractor for using low-quality materials. It moves beyond "fixes" to "resolutions".

### 10.3 🌫️ Silent Problems (`silentProblems`)
- **Logic**: Uses deviation from the mean across 26 wards.
- **Purpose**: It finds areas where there are ZERO complaints but high infrastructure age. This identifies "Silenced Wards" where the community has lost faith in reporting or lacks digital access.

### 10.4 📈 Admin Load (`adminLoad`)
- **Logic**: Measures `Resolution_Time / Case_Volume`.
- **Purpose**: Provides a "Heat Map of Workload" for the mayor. It suggests moving officers from the under-utilized "Electricity Dept" to the over-burdened "Waste Dept" based on live trends.

### 10.5 🏗️ Resilience Layer (`resilience`)
- **Logic**: Cross-references `DisasterAlert` severity with `population_outflow` data.
- **Purpose**: It simulates the city's ability to survive a crisis. It identifies "Bottleneck Wards" that would trap citizens during a flood or fire.

### 10.6 🔄 Feedback Loop (`feedbackLoop`)
- **Logic**: Aggregates `citizen_satisfaction_score`.
- **Purpose**: It provides a "Trust Index". Departments aren't graded on just closing tickets, but on HOW MUCH the citizen trusts the fix.

### 10.7 ⚡ Advanced Pulse (`advanced`)
- **Logic**: A weighted average of 40+ indicators (AQI, Traffic, Complaints, Tax, SOS).
- **Purpose**: The "City Pulse Score" (0-1.0). If the score drops below 0.6, the system sends an automated SMS to the Commissioner.

---

## 11. The Data DNA (Full Schema Encyclopedia)

### 👤 11.1 `User` Schema Details
The foundation of identity.
- **`sosEmergencyContacts`**: An array of objects. Crucial field: `verified`. Verified contacts receive SMS; unverified only receive Email.
- **`mediaConsent`**: Privacy-first design. Stores explicit user permission for Camera/Location usage.
- **`role`**: Implemented using Mongoose string enums to prevent role-injection attacks.

### 📝 11.2 `Complaint` Schema Details
A 50+ field schema designed for maximum data capture.
- **`validationStatus`**: `valid` | `fake` | `discrepancy`.
- **`priorityHistory`**: Tracks how the priority changed over time.
- **`coordinates`**: Strictly `[longitude, latitude]` (MongoDB Standard).

---

*(This represents the second 1000 lines. See Part 3 for the Master API Registry, Codebase Index, and Deployment Manifesto.)*
