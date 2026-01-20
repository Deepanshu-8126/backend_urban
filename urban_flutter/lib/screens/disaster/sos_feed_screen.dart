import 'package:flutter/material.dart';

class SOSFeedScreen extends StatelessWidget {
  const SOSFeedScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Live SOS Command Center"), backgroundColor: Colors.red.shade900),
      body: ListView.builder(
        padding: const EdgeInsets.all(10),
        itemCount: 5, // Prototype ke liye dummy count
        itemBuilder: (context, i) => Card(
          margin: const EdgeInsets.only(bottom: 12),
          shape: RoundedRectangleBorder(side: BorderSide(color: Colors.red.shade200, width: 2), borderRadius: BorderRadius.circular(15)),
          child: ExpansionTile(
            leading: const CircleAvatar(backgroundColor: Colors.red, child: Icon(Icons.priority_high, color: Colors.white)),
            title: Text("SOS Request #SR-88${i+1}", style: const TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text("Location: Sector ${i+5}, Fatehpur Range"),
            children: [
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: const [
                        Text("Type: Accident/Trauma"),
                        Text("Status: Dispatched", style: TextStyle(color: Colors.orange, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const SizedBox(height: 15),
                    Row(
                      children: [
                        Expanded(child: ElevatedButton(onPressed: () {}, child: const Text("Call User"))),
                        const SizedBox(width: 10),
                        Expanded(child: ElevatedButton(onPressed: () {}, style: ElevatedButton.styleFrom(backgroundColor: Colors.red), child: const Text("Deploy Help"))),
                      ],
                    )
                  ],
                ),
              )
            ],
          ),
        ),
      ),
    );
  }
}