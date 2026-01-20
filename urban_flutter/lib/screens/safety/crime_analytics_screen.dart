import 'package:flutter/material.dart';

class CrimeAnalyticsScreen extends StatelessWidget {
  const CrimeAnalyticsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Crime Hotspot Analytics")),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Analytics Chart Placeholder
            Container(
              height: 220,
              decoration: BoxDecoration(
                color: Colors.red.withOpacity(0.05),
                borderRadius: BorderRadius.circular(15),
                border: Border.all(color: Colors.redAccent.withOpacity(0.3)),
              ),
              child: const Center(child: Icon(Icons.analytics, size: 80, color: Colors.redAccent)),
            ),
            const SizedBox(height: 20),
            _buildSafetyTile("High Risk Zone", "Sector 12", "Increased theft reports", Colors.red),
            _buildSafetyTile("Moderate Risk", "Civil Lines", "Vandalism alerts", Colors.orange),
            _buildSafetyTile("Safe Zone", "Fatehpur Park Area", "Zero reports", Colors.green),
          ],
        ),
      ),
    );
  }

  Widget _buildSafetyTile(String status, String area, String desc, Color col) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 8),
      child: ListTile(
        leading: Icon(Icons.security, color: col),
        title: Text("$area ($status)"),
        subtitle: Text(desc),
        trailing: const Icon(Icons.arrow_forward_ios, size: 14),
      ),
    );
  }
}