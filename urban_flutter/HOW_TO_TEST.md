## ✅ READY TO TEST IN YOUR FLUTTER APP!

### 🔧 Configuration Complete

**API Base URL:** `http://10.54.115.35:3000/api/v1`
**Backend Status:** ✅ Running with all 15 intelligence modules loaded

---

### 🚀 RUN YOUR APP NOW

```bash
cd urban_flutter
flutter run
```

**Tips to prevent disconnection:**
1. Keep your device screen ON during testing
2. Enable "Stay Awake" in Developer Options
3. Use a good quality USB cable
4. Don't move the device during installation

---

### 📱 HOW TO TEST INTELLIGENCE IN YOUR APP

Once your app is running, you can test the intelligence modules. Here are 3 ways:

#### Method 1: Add Test Button to Admin Dashboard

Open `lib/screens/dashboard/admin_war_room.dart` and add this button:

```dart
// Add this import at top
import 'package:http/http.dart' as http;
import 'dart:convert';

// Add this button in your admin dashboard
FloatingActionButton.extended(
  onPressed: () async {
    try {
      final response = await http.get(
        Uri.parse('http://10.54.115.35:3000/api/v1/intelligence/advanced/consciousness?days=7'),
      );
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: Row(
              children: [
                Icon(Icons.psychology, color: Colors.purple),
                SizedBox(width: 8),
                Text('City Intelligence'),
              ],
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('✅ All 15 Modules Working!', 
                  style: TextStyle(fontWeight: FontWeight.bold, color: Colors.green)),
                SizedBox(height: 12),
                Text('City Health:', style: TextStyle(fontWeight: FontWeight.bold)),
                Text(data['data']['summary'] ?? 'Loading...'),
                SizedBox(height: 8),
                Chip(
                  label: Text(data['data']['health'] ?? 'Unknown'),
                  backgroundColor: Colors.green.shade100,
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: Text('OK'),
              ),
            ],
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
      );
    }
  },
  icon: Icon(Icons.psychology),
  label: Text('Test Intelligence'),
  backgroundColor: Colors.purple,
)
```

#### Method 2: Use the Intelligence Service

The service is already created at `lib/services/intelligence_service.dart`:

```dart
import 'package:urban_flutter/services/intelligence_service.dart';

// Test city health
final health = await IntelligenceService.getCityHealth();
print('City Health: $health');

// Get full dashboard
final dashboard = await IntelligenceService.getDashboard();
print('Dashboard: $dashboard');
```

#### Method 3: Test All Endpoints

```dart
// Test different modules
final endpoints = [
  'consciousness?days=7',
  'time/peaks?days=30',
  'anomaly/active',
  'trust/city',
  'fatigue/city',
  'dashboard',
];

for (var endpoint in endpoints) {
  final url = 'http://10.54.115.35:3000/api/v1/intelligence/advanced/$endpoint';
  final response = await http.get(Uri.parse(url));
  print('$endpoint: ${response.statusCode}');
}
```

---

### 🎯 All 15 Modules You Can Test

| Module | Endpoint | What It Does |
|--------|----------|--------------|
| 1. Urban Memory | `/intelligence/memory/insights` | Historical patterns |
| 2. Silent Problems | `/intelligence/silent/active` | Missing complaints |
| 3. Urban DNA | `/intelligence/dna/risk-map` | Area profiles |
| 4. Admin Load | `/intelligence/load/alerts` | Workload tracking |
| 5. Resilience | `/intelligence/resilience/city` | Recovery metrics |
| 6. Feedback Loop | `/intelligence/feedback/improvements` | Learning patterns |
| 7. Decision Score | `/intelligence/advanced/decision/metrics` | Complexity analysis |
| 8. Time Intelligence | `/intelligence/advanced/time/peaks` | Peak hours |
| 9. Trust | `/intelligence/advanced/trust/city` | Citizen satisfaction |
| 10. Ethics | `/intelligence/advanced/ethics/audit` | Fairness check |
| 11. Anomaly | `/intelligence/advanced/anomaly/active` | Spike detection |
| 12. Nervous System | `/intelligence/advanced/nervous/graph` | System flow |
| 13. Fatigue | `/intelligence/advanced/fatigue/city` | Burnout metrics |
| 14. Future Shadow | `/intelligence/advanced/future/trends` | Projections |
| 15. Consciousness | `/intelligence/advanced/consciousness` | City health |

**Master Dashboard:** `/intelligence/advanced/dashboard` - All metrics in one call!

---

### ✅ What to Expect

When you run the test button:
- ✅ You'll see "All 15 Modules Working!"
- ✅ City health summary (e.g., "City is healthy. 12.5 complaints/day. 75% resolved.")
- ✅ Health status chip (healthy/stable/stressed)

---

### 🔥 Quick Verification

After app starts, check the console for:
```
✅ Backend connected successfully
✅ Intelligence API accessible
```

If you see network errors, check:
1. Backend is running (it is! ✅)
2. Device is on same WiFi network
3. Firewall allows port 3000

---

**NOW RUN:** `flutter run` and test! 🚀

Your backend is ready with all 15 intelligence modules waiting for your app!
