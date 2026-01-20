import 'package:flutter/material.dart';

class DisasterControlScreen extends StatelessWidget {
  const DisasterControlScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Flood & Disaster Control")),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          children: [
            const Card(
              color: Colors.blueAccent,
              child: ListTile(
                title: Text("Flood Alert Level: Normal", style: TextStyle(color: Colors.white)),
                trailing: Icon(Icons.check_circle, color: Colors.white),
              ),
            ),
            const SizedBox(height: 20),
            Expanded(
              child: GridView.count(
                crossAxisCount: 2,
                children: [
                  _statTile("Sensors Online", "142"),
                  _statTile("Rescue Teams", "12"),
                ],
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _statTile(String label, String value) {
    return Card(
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(value, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            Text(label),
          ],
        ),
      ),
    );
  }
}