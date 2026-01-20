import 'package:flutter/material.dart';

class BloodBankScreen extends StatelessWidget {
  const BloodBankScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Live Blood Inventory")),
      body: GridView.count(
        crossAxisCount: 2,
        padding: const EdgeInsets.all(16),
        mainAxisSpacing: 10,
        crossAxisSpacing: 10,
        children: [
          _buildBloodTile("A+", "12 Units", Colors.red),
          _buildBloodTile("B+", "08 Units", Colors.redAccent),
          _buildBloodTile("O-", "02 Units", Colors.orange), // Low stock alert
          _buildBloodTile("AB+", "15 Units", Colors.red),
        ],
      ),
    );
  }

  Widget _buildBloodTile(String type, String qty, Color col) {
    return Card(
      color: col.withOpacity(0.1),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(type, style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: col)),
          Text(qty, style: const TextStyle(fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}