import 'package:flutter/material.dart';

class AqiMonitorScreen extends StatelessWidget {
  const AqiMonitorScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Air Quality Index")),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(30),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [Colors.orange, Colors.red]),
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Column(
                children: [
                  Text("MODERATE", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  Text("154", style: TextStyle(color: Colors.white, fontSize: 60, fontWeight: FontWeight.bold)),
                  Text("Main Pollutant: PM 2.5", style: TextStyle(color: Colors.white70)),
                ],
              ),
            ),
            const SizedBox(height: 20),
            const Align(alignment: Alignment.centerLeft, child: Text("Ward-wise AQI", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold))),
            Expanded(
              child: ListView.builder(
                itemCount: 10,
                itemBuilder: (context, i) => ListTile(
                  leading: const Icon(Icons.location_on, color: Colors.teal),
                  title: Text("Ward No. ${i+1}"),
                  trailing: Text("${120 + i}", style: const TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            )
          ],
        ),
      ),
    );
  }
}