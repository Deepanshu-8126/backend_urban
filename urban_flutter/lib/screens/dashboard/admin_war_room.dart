import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart'; // ✅ Persistence ke liye
import '../../widgets/kpi_card.dart';
import '../citizen/certificate_screen.dart';
import '../citizen/hall_booking_screen.dart';
import '../disaster/disaster_control_screen.dart';
import '../health/aqi_monitor_screen.dart';
import '../property/property_tax_screen.dart';
import '../traffic/traffic_cam_screen.dart';
import '../traffic/parking_locator.dart';
import '../complaints/war_room_screen.dart';
import '../ChatBot/chat_bot_screen.dart';
import '../traffic/traffic_prediction_screen.dart';
import '../revenue/budget_tracker_screen.dart';
import '../disaster/sos_feed_screen.dart';
import '../complaints/heatmap_screen.dart';
import '../admin/staff_monitor_screen.dart';
import '../traffic/bus_tracker_screen.dart';
import '../utilities/smart_grid_screen.dart';
import '../safety/crime_analytics_screen.dart';
import '../safety/patrol_tracker_screen.dart';
import '../health/blood_bank_screen.dart';
import '../complaints/complaints_main.dart';
import 'package:urban_flutter/core/api_service.dart';

class AdminWarRoom extends StatefulWidget {
  const AdminWarRoom({super.key});
  @override
  State<AdminWarRoom> createState() => _AdminWarRoomState();
}

class _AdminWarRoomState extends State<AdminWarRoom> {
  String selectedCategory = "All";
  String searchQuery = "";
  final List<String> categories = ["All", "Complaints", "Disaster", "Property", "Traffic", "Health", "Citizen", "Safety", "Admin"];

  // ✅ LOGIC: Profile aur Logout ka popup
  void _showProfile(BuildContext context) async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    String name = prefs.getString('firstName') ?? "Guest";
    String surname = prefs.getString('surname') ?? "User";
    String phone = prefs.getString('contact') ?? "N/A";
    bool isLoggedIn = prefs.getBool('isLoggedIn') ?? false;

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (context) => Padding(
        padding: const EdgeInsets.all(25),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text("ACCOUNT PROFILE", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, letterSpacing: 1)),
            const Divider(),
            ListTile(
              leading: const CircleAvatar(backgroundColor: Colors.blue, child: Icon(Icons.person, color: Colors.white)),
              title: Text("$name $surname", style: const TextStyle(fontWeight: FontWeight.bold)),
              subtitle: Text(phone),
            ),
            const SizedBox(height: 20),
            if (isLoggedIn)
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(backgroundColor: Colors.red, minimumSize: const Size(double.infinity, 50)),
                icon: const Icon(Icons.logout, color: Colors.white),
                label: const Text("LOGOUT", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                onPressed: () async {
                  await ApiService.logout();
                  Navigator.pop(context);
                  Navigator.pushReplacement(context, MaterialPageRoute(builder: (c) => const AdminWarRoom()));
                },
              )
            else
              ElevatedButton(
                onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (c) => const ComplaintsMain())),
                child: const Text("GO TO LOGIN"),
              ),
          ],
        ),
      ),
    );
  }

  final List<Map<String, dynamic>> allFeatures = [
    {"title": "Complaints Hub", "cat": "Complaints", "icon": Icons.campaign, "color": Colors.red, "page": const ComplaintsMain()},
    {"title": "Grievance Map", "cat": "Complaints", "icon": Icons.map, "color": Colors.redAccent, "page": const ComplaintsHeatmap()},
    {"title": "Resolution Stats", "cat": "Complaints", "icon": Icons.bar_chart, "color": Colors.red, "page": null},
    {"title": "SOS Center", "cat": "Disaster", "icon": Icons.emergency_share, "color": Colors.red, "page": const SOSFeedScreen()},
    {"title": "Flood Alert", "cat": "Disaster", "icon": Icons.flood, "color": Colors.blue, "page": const DisasterControlScreen()},
    {"title": "Budget Tracker", "cat": "Property", "icon": Icons.account_balance_wallet, "color": Colors.blueGrey, "page": const BudgetTrackerScreen()},
    {"title": "Property Tax", "cat": "Property", "icon": Icons.payments, "color": Colors.green, "page": const PropertyTaxScreen()},
    {"title": "Traffic Cam Live", "cat": "Traffic", "icon": Icons.videocam, "color": Colors.indigo, "page": const TrafficCamScreen()},
    {"title": "Smart Parking", "cat": "Traffic", "icon": Icons.local_parking, "color": Colors.indigoAccent, "page": const SmartParkingScreen()},
    {"title": "Bus Tracker", "cat": "Traffic", "icon": Icons.directions_bus, "color": Colors.blueGrey, "page": const BusTrackerScreen()},
    {"title": "AI Traffic Forecast", "cat": "Traffic", "icon": Icons.auto_graph, "color": Colors.deepPurple, "page": const TrafficPredictionScreen()},
    {"title": "AQI Monitor", "cat": "Health", "icon": Icons.air, "color": Colors.teal, "page": const AqiMonitorScreen()},
    {"title": "Blood Bank", "cat": "Health", "icon": Icons.bloodtype, "color": Colors.red, "page": const BloodBankScreen()},
    {"title": "Crime Analytics", "cat": "Safety", "icon": Icons.security, "color": Colors.redAccent, "page": const CrimeAnalyticsScreen()},
    {"title": "Patrol Track", "cat": "Safety", "icon": Icons.nightlight_round, "color": Colors.indigo, "page": const PatrolTrackerScreen()},
    {"title": "Certificates", "cat": "Citizen", "icon": Icons.assignment, "color": Colors.amber, "page": const CertificateScreen()},
    {"title": "Hall Booking", "cat": "Citizen", "icon": Icons.home_work, "color": Colors.deepOrange, "page": const HallBookingScreen()},
    {"title": "CityBrain AI", "cat": "All", "icon": Icons.psychology, "color": Colors.deepPurple, "page": const CityBrainBot()},
    {"title": "Staff Monitor", "cat": "Admin", "icon": Icons.groups, "color": Colors.indigo, "page": const StaffMonitorScreen()},
    {"title": "Energy Grid", "cat": "All", "icon": Icons.bolt, "color": Colors.yellow[800], "page": const SmartGridScreen()},
  ];

  @override
  Widget build(BuildContext context) {
    final filtered = allFeatures.where((f) {
      bool matchesCat = selectedCategory == "All" || f['cat'] == selectedCategory;
      bool matchesSearch = f['title'].toLowerCase().contains(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    }).toList();

    return Scaffold(
      appBar: AppBar(
          actions: [
            IconButton(
              icon: const Icon(Icons.account_circle, size: 30),
              onPressed: () => _showProfile(context), // ✅ Profile show karne ka logic
            ),
          ],
          title: const Text("URBAN OS COMMAND CENTER"),
          centerTitle: true
      ),
      body: Column(
        children: [
          _buildSOSAlert(),
          _buildSearchAndFilters(),
          Expanded(
            child: GridView.builder(
              padding: const EdgeInsets.all(12),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                crossAxisSpacing: 8,
                mainAxisSpacing: 8,
                childAspectRatio: 0.85,
              ),
              itemCount: filtered.length,
              itemBuilder: (context, i) => KpiCard(
                title: filtered[i]['title'],
                icon: filtered[i]['icon'],
                color: filtered[i]['color'],
                onTap: () {
                  if (filtered[i]['page'] != null) {
                    Navigator.push(context, MaterialPageRoute(builder: (c) => filtered[i]['page']));
                  } else {
                    _showPlaceholder(context, filtered[i]['title']);
                  }
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSOSAlert() {
    return Container(
      margin: const EdgeInsets.all(12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: Colors.red.shade900, borderRadius: BorderRadius.circular(15)),
      child: Row(
        children: [
          const Icon(Icons.emergency_share, color: Colors.white, size: 30),
          const SizedBox(width: 12),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text("LIVE SOS ALERT", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                Text("Medical: Ward 15 | 2m ago", style: TextStyle(color: Colors.white70, fontSize: 12)),
              ],
            ),
          ),
          ElevatedButton(
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (c) => const SOSFeedScreen())),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.white, foregroundColor: Colors.red),
            child: const Text("VIEW"),
          )
        ],
      ),
    );
  }

  Widget _buildSearchAndFilters() {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12.0),
          child: TextField(
            onChanged: (v) => setState(() => searchQuery = v),
            decoration: InputDecoration(
              hintText: "Search 200+ Features...",
              prefixIcon: const Icon(Icons.search),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(30)),
              filled: true,
              fillColor: Colors.grey.withOpacity(0.1),
            ),
          ),
        ),
        const SizedBox(height: 10),
        SizedBox(
          height: 40,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: categories.length,
            padding: const EdgeInsets.symmetric(horizontal: 10),
            itemBuilder: (ctx, i) => Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              child: ChoiceChip(
                label: Text(categories[i]),
                selected: selectedCategory == categories[i],
                onSelected: (bool selected) => setState(() => selectedCategory = categories[i]),
              ),
            ),
          ),
        ),
      ],
    );
  }

  void _showPlaceholder(BuildContext context, String title) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("$title: Module ready in next update!")));
  }
}