import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../../core/constants.dart';

class ComplaintsHeatmap extends StatelessWidget {
  const ComplaintsHeatmap({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("City Complaint Heatmap")),
      body: Column(
        children: [
          // Map Placeholder (GIS View)
          Expanded(
            flex: 2,
            child: Container(
              margin: const EdgeInsets.all(15),
              decoration: BoxDecoration(
                color: Colors.blueGrey[900],
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.redAccent, width: 2),
              ),
              child: Stack(
                children: [
                  const Center(child: Icon(Icons.map, size: 80, color: Colors.white24)),
                  // Dummy Heatmap Circles
                  _buildHeatSpot(top: 50, left: 100, size: 60, intensity: 0.6),
                  _buildHeatSpot(top: 150, left: 200, size: 100, intensity: 0.8),
                  _buildHeatSpot(top: 80, left: 250, size: 40, intensity: 0.4),
                ],
              ),
            ),
          ),

          // Live Data from Backend
          Expanded(
            flex: 1,
            child: FutureBuilder(
              future: http.get(Uri.parse(AppConstants.heatmapEndpoint)),
              builder: (context, AsyncSnapshot<http.Response> snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) return const Center(child: CircularProgressIndicator());

                // Static dummy data agar backend abhi error de raha ho
                return ListView(
                  padding: const EdgeInsets.symmetric(horizontal: 15),
                  children: [
                    const Text("High Intensity Zones", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    _buildZoneTile("Ward 12 (Fatehpur)", "85% Issues", Colors.red),
                    _buildZoneTile("Sector 4 (Industrial)", "42% Issues", Colors.orange),
                  ],
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeatSpot({double? top, double? left, double? size, double? intensity}) {
    return Positioned(
      top: top, left: left,
      child: Container(
        width: size, height: size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: Colors.red.withOpacity(intensity!),
          boxShadow: [BoxShadow(color: Colors.red.withOpacity(0.5), blurRadius: 20, spreadRadius: 10)],
        ),
      ),
    );
  }

  Widget _buildZoneTile(String title, String subtitle, Color color) {
    return ListTile(
      leading: Icon(Icons.location_on, color: color),
      title: Text(title),
      subtitle: Text(subtitle),
      trailing: const Icon(Icons.arrow_forward_ios, size: 14),
    );
  }
}