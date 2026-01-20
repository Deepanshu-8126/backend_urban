import 'package:flutter/material.dart';

class PatrolTrackerScreen extends StatelessWidget {
  const PatrolTrackerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Night Patrolling Monitor")),
      body: Column(
        children: [
          _buildCoverageStats(),
          const Padding(
            padding: EdgeInsets.all(16.0),
            child: Align(
              alignment: Alignment.centerLeft,
              child: Text("Active Patrolling Routes", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            ),
          ),
          Expanded(
            child: ListView.builder(
              itemCount: 4,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemBuilder: (context, i) => _buildPatrolCard(i),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCoverageStats() {
    return Container(
      padding: const EdgeInsets.all(20),
      color: Colors.blueGrey.withOpacity(0.1),
      child: const Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          Column(children: [Text("85%", style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.indigo)), Text("Coverage")]),
          Column(children: [Text("12", style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.indigo)), Text("Active Units")]),
          Column(children: [Text("03", style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.red)), Text("Incidents")]),
        ],
      ),
    );
  }

  Widget _buildPatrolCard(int i) {
    final routes = ["Sector 5 to 10", "Main Market Loop", "Railway Station Perimeter", "Hospital Road"];
    return Card(
      margin: const EdgeInsets.only(bottom: 15),
      child: ListTile(
        leading: const Icon(Icons.security, color: Colors.indigo),
        title: Text(routes[i]),
        subtitle: const Text("Last Check-point: 10 mins ago"),
        trailing: const Icon(Icons.check_circle, color: Colors.green),
      ),
    );
  }
}