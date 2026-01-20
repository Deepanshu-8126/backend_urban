import 'package:flutter/material.dart';

class CertificateScreen extends StatelessWidget {
  const CertificateScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Digital Certificate Center")),
      body: Padding(
        padding: const EdgeInsets.all(15.0),
        child: Column(
          children: [
            _buildActionCard("Birth Certificate", Icons.child_care, Colors.blue),
            _buildActionCard("Death Certificate", Icons.person_off, Colors.grey),
            _buildActionCard("Marriage Certificate", Icons.favorite, Colors.pink),
            const SizedBox(height: 20),
            const Text("Recent Applications", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            Expanded(
              child: ListView(
                children: const [
                  ListTile(
                    leading: Icon(Icons.check_circle, color: Colors.green),
                    title: Text("Birth Cert - #BR9921"),
                    subtitle: Text("Approved & Ready to Download"),
                  ),
                ],
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildActionCard(String title, IconData icon, Color color) {
    return Card(
      elevation: 4,
      margin: const EdgeInsets.only(bottom: 15),
      child: ListTile(
        leading: Icon(icon, color: color, size: 30),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
        trailing: ElevatedButton(onPressed: () {}, child: const Text("Apply")),
      ),
    );
  }
}