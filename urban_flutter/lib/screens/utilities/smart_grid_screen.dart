import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../../core/constants.dart';

class SmartGridScreen extends StatelessWidget {
  const SmartGridScreen({super.key});

  // Backend se Energy Data mangwane ka function
  Future<Map<String, dynamic>> fetchEnergyData() async {
    try {
      final response = await http.get(Uri.parse(AppConstants.energyEndpoint));
      if (response.statusCode == 200) {
        return json.decode(response.body);
      }
      throw Exception('Server Error');
    } catch (e) {
      // Fake data agar backend offline ho (Prototype ke liye)
      return {
        "total_load": "485 MW",
        "status": "Stable",
        "sectors": [
          {"name": "Industrial Area", "usage": 0.85},
          {"name": "Residential North", "usage": 0.45},
          {"name": "City Streetlights", "usage": 0.15}
        ]
      };
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("City Power Grid Monitor")),
      body: FutureBuilder<Map<String, dynamic>>(
        future: fetchEnergyData(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          final data = snapshot.data!;
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildMainCounter(data['total_load'], data['status']),
                const SizedBox(height: 30),
                const Text("Sector-wise Consumption",
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 15),
                // Sector bars software-based monitoring
                ...(data['sectors'] as List).map((s) => _buildUsageBar(s['name'], s['usage'])).toList(),
                const SizedBox(height: 30),
                _buildEfficiencyCard(),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildMainCounter(String load, String status) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(25),
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [Colors.yellow, Colors.orange]),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: Colors.orange.withOpacity(0.3), blurRadius: 10)],
      ),
      child: Column(
        children: [
          const Icon(Icons.bolt, size: 50, color: Colors.white),
          Text(load, style: const TextStyle(fontSize: 40, fontWeight: FontWeight.bold, color: Colors.white)),
          Text("Current Grid Load ($status)", style: const TextStyle(color: Colors.white70)),
        ],
      ),
    );
  }

  Widget _buildUsageBar(String label, double val) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label),
          const SizedBox(height: 5),
          LinearProgressIndicator(
            value: val,
            color: val > 0.8 ? Colors.red : Colors.green,
            backgroundColor: Colors.grey[200],
            minHeight: 12,
            borderRadius: BorderRadius.circular(10),
          ),
        ],
      ),
    );
  }

  Widget _buildEfficiencyCard() {
    return Card(
      child: ListTile(
        leading: const Icon(Icons.eco, color: Colors.green),
        title: const Text("Renewable Energy Contribution"),
        subtitle: const Text("12% of current load is from Solar Farms."),
        trailing: TextButton(onPressed: () {}, child: const Text("VIEW")),
      ),
    );
  }
}