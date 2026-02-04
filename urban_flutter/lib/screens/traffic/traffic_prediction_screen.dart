import 'package:flutter/material.dart';

class TrafficPredictionScreen extends StatelessWidget {
  const TrafficPredictionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("AI Traffic Forecaster")),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text("Next 2 Hours Forecast", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 15),

            
            Container(
              height: 200,
              decoration: BoxDecoration(
                color: Colors.indigo.withOpacity(0.1),
                borderRadius: BorderRadius.circular(15),
                border: Border.all(color: Colors.indigo),
              ),
              child: const Center(
                child: Icon(Icons.show_chart, size: 80, color: Colors.indigo),
              ),
            ),

            const SizedBox(height: 25),
            const Text("Predicted Congestion Points", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),

            _buildPredictionTile("Civil Lines Intersection", "High Risk (90%)", "Expected Jam: 05:30 PM", Colors.red),
            _buildPredictionTile("Main Market Road", "Moderate (45%)", "Slow moving traffic", Colors.orange),
            _buildPredictionTile("Fatehpur Bypass", "Low Risk (10%)", "Clear route", Colors.green),

            const SizedBox(height: 20),
            _buildAdviceCard(),
          ],
        ),
      ),
    );
  }

  Widget _buildPredictionTile(String title, String risk, String desc, Color col) {
    return Card(
      child: ListTile(
        leading: Icon(Icons.trending_up, color: col),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text(desc),
        trailing: Text(risk, style: TextStyle(color: col, fontWeight: FontWeight.bold)),
      ),
    );
  }

  Widget _buildAdviceCard() {
    return Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(color: Colors.blue.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
      child: const Row(
        children: [
          Icon(Icons.lightbulb, color: Colors.blue),
          SizedBox(width: 10),
          Expanded(child: Text("AI Suggestion: Re-route heavy vehicles to the bypass to avoid upcoming jam at Civil Lines.")),
        ],
      ),
    );
  }
}