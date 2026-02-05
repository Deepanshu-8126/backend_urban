import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:fl_chart/fl_chart.dart';
import 'package:animate_do/animate_do.dart';
import '../../core/api_service.dart';
import '../../core/app_provider.dart'; // Ensure correct import logic if needed
import 'package:provider/provider.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import 'project_detail_screen.dart'; // NEW Details Screen

class DevelopmentTrackerScreen extends StatefulWidget {
  const DevelopmentTrackerScreen({super.key});

  @override
  State<DevelopmentTrackerScreen> createState() => _DevelopmentTrackerScreenState();
}

class _DevelopmentTrackerScreenState extends State<DevelopmentTrackerScreen> {
  bool isLoading = true;
  List<dynamic> projects = [];
  Map<String, dynamic> stats = {
    "totalFunds": 0,
    "totalSpent": 0,
    "count": 0
  };
  Map<String, dynamic> summary = {}; // MPLADS Summary
  Map<String, dynamic> charts = {}; // Charts Data

  String currentCity = "Fetching Location..."; 
  String currentState = "";

  @override
  void initState() {
    super.initState();
    _fetchProjects();
    _determinePosition();
  }

  Future<void> _determinePosition() async {
    bool serviceEnabled;
    LocationPermission permission;

    // Test for location services
    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      setState(() { currentCity = "Haldwani"; currentState = "Uttarakhand"; }); // Fallback
      return;
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        setState(() { currentCity = "Haldwani"; currentState = "Uttarakhand"; });
        return;
      }
    }
    
    // Get Location
    try {
      Position position = await Geolocator.getCurrentPosition();
      List<Placemark> placemarks = await placemarkFromCoordinates(position.latitude, position.longitude);
      if (placemarks.isNotEmpty) {
        Placemark place = placemarks[0];
        setState(() {
          currentCity = place.locality ?? "Haldwani";
          currentState = place.administrativeArea ?? "Uttarakhand";
        });
      }
    } catch (e) {
      setState(() { currentCity = "Haldwani"; currentState = "Uttarakhand"; });
    }
  }

  Future<void> _fetchProjects() async {
    try {
      // Fetch Projects
      final response = await http.get(Uri.parse('${ApiService.baseUrl}/projects'));
      // Fetch Analytics
      final analyticsResponse = await http.get(Uri.parse('${ApiService.baseUrl}/projects/analytics'));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          projects = data['data'];
          stats = data['meta']; // Basic Stats
        });
      }
      
      if (analyticsResponse.statusCode == 200) {
          final aData = jsonDecode(analyticsResponse.body);
          setState(() {
              summary = aData['data']['summary'];
              charts = aData['data']['charts'];
              isLoading = false;
          });
      } else {
          setState(() => isLoading = false);
      }
    } catch (e) {
      debugPrint("Error fetching projects: $e");
      setState(() => isLoading = false);
    }
  }

  String _formatCurrency(num amount) {
    if (amount >= 10000000) {
      return "₹${(amount / 10000000).toStringAsFixed(2)} Cr";
    } else if (amount >= 100000) {
      return "₹${(amount / 100000).toStringAsFixed(2)} L";
    }
    return "₹$amount";
  }

  @override
  Widget build(BuildContext context) {
    final isDark = false; // Simplified for now, or fetch from provider

    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: Text("Development Tracker", style: GoogleFonts.poppins(color: Colors.black, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black),
        actions: [
          IconButton(onPressed: _fetchProjects, icon: const Icon(Icons.refresh))
        ],
      ),
      body: isLoading
        ? const Center(child: CircularProgressIndicator())
        : ListView(
            padding: const EdgeInsets.all(16),
            children: [
              _buildLocationHeader(),
              const SizedBox(height: 20),
              if (summary.isNotEmpty) _buildMpladsSummaryCard(), // NEW Summary
              const SizedBox(height: 20),
              _buildStatsCards(),
              const SizedBox(height: 24),
              Text("Active Projects", style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              ...projects.map((p) => _buildProjectCard(p)).toList(),
            ],
          ),
    );
  }

  Widget _buildLocationHeader() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [Color(0xFF6C63FF), Color(0xFF4834D4)]),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: const Color(0xFF6C63FF).withValues(alpha: 0.3), blurRadius: 10, offset: const Offset(0, 5))]
      ),
      child: Row(
        children: [
          const Icon(Icons.location_on, color: Colors.white, size: 30),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text("PROJECTS IN", style: GoogleFonts.roboto(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold)),
              Text("$currentCity, $currentState", style: GoogleFonts.poppins(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
            ],
          ),
          const Spacer(),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(20)),
            child: Text("${stats['count']} Active", style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          )
        ],
      ),
    );
  }

  Widget _buildStatsCards() {
    double utilization = stats['totalFunds'] > 0 ? (stats['totalSpent'] / stats['totalFunds']) * 100 : 0;
    
    return SizedBox(
      height: 140,
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: [
          _statCard("Total Funds", _formatCurrency(stats['totalFunds']), Icons.account_balance, Colors.blue),
          const SizedBox(width: 12),
          _statCard("Funds Utilized", _formatCurrency(stats['totalSpent']), Icons.construction, Colors.orange),
          const SizedBox(width: 12),
          _statCard("Utilization", "${utilization.toStringAsFixed(1)}%", Icons.pie_chart, utilization > 50 ? Colors.green : Colors.red),
        ],
      ),
    );
  }

  Widget _statCard(String title, String value, IconData icon, Color color) {
    return Container(
      width: 150,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, 2))]
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: color.withValues(alpha: 0.1), shape: BoxShape.circle),
            child: Icon(icon, color: color, size: 20),
          ),
          const Spacer(),
          Text(value, style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black87)),
          Text(title, style: GoogleFonts.roboto(fontSize: 12, color: Colors.grey)),
        ],
      ),
    );
  }

  Widget _buildProjectCard(dynamic p) {
    double progress = (p['progress'] ?? 0) / 100.0;
    Color statusColor = p['status'] == 'Completed' ? Colors.green : (p['status'] == 'In-Progress' ? Colors.orange : Colors.grey);

    return FadeInUp(
      duration: const Duration(milliseconds: 500),
      child: GestureDetector(
        onTap: () {
          Navigator.push(context, MaterialPageRoute(builder: (_) => ProjectDetailScreen(project: p)));
        },
        child: Container(
          margin: const EdgeInsets.only(bottom: 16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 5, offset: const Offset(0, 2))]
          ),
          child: Column(
            children: [
              // Header with Category & Status
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: Colors.grey[50],
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                  border: Border(bottom: BorderSide(color: Colors.grey[200]!))
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(color: Colors.blue.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(4)),
                      child: Text(p['category'], style: const TextStyle(fontSize: 10, color: Colors.blue, fontWeight: FontWeight.bold)),
                    ),
                    const Spacer(),
                    Container(
                      width: 8, height: 8,
                      decoration: BoxDecoration(color: statusColor, shape: BoxShape.circle),
                    ),
                    const SizedBox(width: 6),
                    Text(p['status'], style: TextStyle(fontSize: 12, color: statusColor, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
              
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(p['title'], style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(Icons.location_on_outlined, size: 14, color: Colors.grey),
                        const SizedBox(width: 4),
                        Expanded(child: Text(p['location']['address'], style: const TextStyle(color: Colors.grey, fontSize: 12))),
                      ],
                    ),
                    const SizedBox(height: 16),
                    
                    // Progress Bar
                    Row(
                      children: [
                        Expanded(
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(4),
                            child: LinearProgressIndicator(
                              value: progress,
                              backgroundColor: Colors.grey[200],
                              color: statusColor,
                              minHeight: 6,
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Text("${p['progress']}%", style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                      ],
                    ),
                    const SizedBox(height: 16),
                    
                    // Financial Mini Stats
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _financialItem("Allocated", _formatCurrency(p['financials']['allocated'])),
                        _financialItem("Spent", _formatCurrency(p['financials']['spent'])),
                        _financialItem("Contractor", p['financials']['contractor'] ?? "Local"),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _financialItem(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 10, color: Colors.grey)),
        Text(value, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
      ],
    );
  }

  Widget _buildMpladsSummaryCard() {
      return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.blue.withValues(alpha: 0.1)),
              boxShadow: [BoxShadow(color: Colors.blue.withValues(alpha: 0.05), blurRadius: 10)]
          ),
          child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                  Text("Financial Overview (MPLADS)", style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.blue[800])),
                  const Divider(),
                  const SizedBox(height: 10),
                  _summaryRow("Allocated Limit", summary['allocatedLimit']),
                  _summaryRow("Works Sanctioned", summary['worksSanctioned']['cost']),
                  _summaryRow("Expenditure", summary['expenditureOnDate']),
                  const SizedBox(height: 10),
                  Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                          Text("Works Completed: ${summary['worksCompleted']['count']}", style: GoogleFonts.roboto(color: Colors.green, fontWeight: FontWeight.bold)),
                          Text("Sanctioned: ${summary['worksSanctioned']['count']}", style: GoogleFonts.roboto(color: Colors.blue, fontWeight: FontWeight.bold)),
                      ],
                  )
              ],
          ),
      );
  }

  Widget _summaryRow(String label, num value) {
      return Padding(
          padding: const EdgeInsets.only(bottom: 8.0),
          child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                  Text(label, style: GoogleFonts.roboto(color: Colors.grey[700])),
                  Text(_formatCurrency(value), style: GoogleFonts.poppins(fontWeight: FontWeight.bold)),
              ],
          ),
      );
  }
}
