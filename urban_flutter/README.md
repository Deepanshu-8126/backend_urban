# 📱 Urban OS Mobile App (Flutter) - Technical Documentation

**The Citizen & Admin Interface for Urban Governance**

The **Urban Flutter App** is a high-performance, cross-platform mobile application built with **Flutter 3.x**. It serves as the primary interface for Citizens to report issues and for Admins to manage the city. It features **Real-time Synchronization**, **Offline Support**, and **Deep AI Integration**.

---

## 🏗️ App Architecture

The app follows a **Feature-First Layered Architecture**:

### 1. Presentation Layer (`lib/screens`)
Contains the UI code, split by feature:
*   **`ChatBot/`**: The Conversational AI interface (`chat_bot_screen.dart`).
*   **`complaints/`**: Screens for reporting (`add_complaint_screen.dart`) and tracking (`my_complaints_screen.dart`).
*   **`dashboard/`**: The Admin "War Room" with charts and maps.
*   **`auth/`**: Login, Signup, and OTP verification flows.
*   **`safety/`**: SOS Emergency button and contact management.

### 2. Logic/State Layer (`lib/providers`)
Uses **Provider** for efficient state management:
*   **`AppProvider`**: Manages Global State (User Session, Theme, Language).
*   **`AuthProvider`**: Handles Login/Signup logic and Token storage.
*   **`ComplaintProvider`**: Caches loaded complaints to reduce API calls.

### 3. Core/Service Layer (`lib/core`)
Handles external communication:
*   **`api_service.dart`**: Singleton class for REST API calls (Dio/Http).
*   **`socket_service.dart`**: Manages the persistent WebSocket connection.
*   **`location_helper.dart`**: Wrapper for `geolocator` to fetch GPS coordinates.

---

## 📦 Key Dependencies & Technology Stack

| Package | Purpose | Why we chose it? |
| :--- | :--- | :--- |
| **`provider`** | State Management | Simple, scalable, and recommended by Google. |
| **`socket_io_client`** | Real-time Sockets | Enables live tracking and instant notifications. |
| **`geolocator`** | GPS Location | Precise location tagging for complaints. |
| **`image_picker`** | Camera Access | To capture evidence (Photos/Videos). |
| **`shared_preferences`** | Local Storage | Persists User Session (Login) across restarts. |
| **`fl_chart`** | Visualization | Renders beautiful graphs in the Admin Dashboard. |
| **`google_fonts`** | Typography | Ensures modern and consistent branding. |

---

## 📱 Feature Deep Dive

### 1. CityBrain AI Chatbot (`lib/screens/ChatBot`)
*   **Logic:** Users send text/voice. The app forwards it to `POST /citybrain`.
*   **UI:** WhatsApp-style chat interface with "Typing..." indicators.
*   **Smart Action:** If users say "File a complaint", the bot automatically opens the `AddComplaintScreen` with pre-filled data.

### 2. Admin Dashboard (`lib/screens/dashboard`)
*   **Live Heatmap:** Uses Google Maps markers to show high-density complaint areas.
*   **Department Filters:** Admins can toggle between "Water", "Road", "Electric" views.
*   **Action Center:** Admins can swipe on a complaint to mark it "Resolved".

### 3. SOS Emergency Mode (`lib/screens/safety`)
*   **Trigger:** Press big Red Button OR Shake Device.
*   **Background Process:** Uses `socket.emit('sos_trigger')` to stream location coordinates every 5 seconds.
*   **Offline Fallback:** Sends SMS if Internet is unavailable (via `url_launcher`).

---

## 🚀 Build & Deployment Guide

### Prerequisites
*   Flutter SDK (3.0+)
*   Android Studio / VS Code
*   Java JDK 11+

### 1. Setup Environment
```bash
flutter pub get
```

### 2. Run in Debug Mode
For development with Hot Reload:
```bash
flutter run
```

### 3. Build Release APK (For Judges/Demo)
This creates an optimized, signed APK:
```bash
flutter build apk --release
```
*Output Location:* `build/app/outputs/flutter-apk/app-release.apk`

---

## 🔧 Configuration (`lib/core/api_service.dart`)

Change the `baseUrl` to point to your backend:

```dart
// For Emulator
static const String baseUrl = "http://10.0.2.2:3000/api/v1"; 

// For Physical Device & Production
static const String baseUrl = "https://your-backend-url.onrender.com/api/v1"; 
```

---

**✨ UI Philosophy:**
We followed **Material 3 Design Principles**. Big buttons, high contrast for accessibility, and smooth animations using `flutter_animate`.
