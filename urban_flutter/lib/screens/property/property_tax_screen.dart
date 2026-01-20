import 'package:flutter/material.dart';

class PropertyTaxScreen extends StatelessWidget {
  const PropertyTaxScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Property & Revenue Hub")),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // --- Top Revenue Stats ---
            const Text("Revenue Overview", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            Row(
              children: [
                _buildStatBox("Total Tax", "₹4.2 Cr", Colors.green),
                const SizedBox(width: 10),
                _buildStatBox("Defaulters", "1,240", Colors.red),
              ],
            ),

            const SizedBox(height: 25),

            // --- GIS Map Placeholder ---
            const Text("GIS Property Mapping", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            Container(
              height: 200,
              width: double.infinity,
              decoration: BoxDecoration(
                color: Colors.blueGrey[100],
                borderRadius: BorderRadius.circular(15),
                image: const DecorationImage(
                  image: NetworkImage('https://placeholder_for_gis_map_image.png'), // Map image placeholder
                  fit: BoxFit.cover,
                ),
              ),
              child: const Center(child: Icon(Icons.location_searching, size: 50, color: Colors.blue)),
            ),

            const SizedBox(height: 25),

            // --- Recent Tax Payments ---
            const Text("Recent Transactions", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: 5,
              itemBuilder: (context, i) => Card(
                child: ListTile(
                  leading: const Icon(Icons.home, color: Colors.blue),
                  title: Text("Property ID: UP-102${i+1}"),
                  subtitle: Text("Ward 12, Sector B"),
                  trailing: const Text("₹12,450", style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatBox(String label, String value, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(15),
          border: Border.all(color: color),
        ),
        child: Column(
          children: [
            Text(value, style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: color)),
            Text(label, style: const TextStyle(fontSize: 14)),
          ],
        ),
      ),
    );
  }
}