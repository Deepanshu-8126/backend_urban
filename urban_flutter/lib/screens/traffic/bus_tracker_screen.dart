import 'package:flutter/material.dart';

class BusTrackerScreen extends StatelessWidget {
  const BusTrackerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("City Bus Live Tracker")),
      body: Column(
        children: [
          // Route Map Placeholder
          Container(
            height: 250,
            margin: const EdgeInsets.all(15),
            decoration: BoxDecoration(
              color: Colors.grey[200],
              borderRadius: BorderRadius.circular(20),
              image: const DecorationImage(
                image: NetworkImage('https://maps.googleapis.com/maps/api/staticmap?center=Fatehpur&zoom=13&size=600x300&key=YOUR_KEY'),
                fit: BoxFit.cover,
              ),
            ),
            child: const Center(child: Icon(Icons.directions_bus, size: 50, color: Colors.blue)),
          ),

          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 15),
            child: Align(alignment: Alignment.centerLeft, child: Text("Active Routes", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold))),
          ),

          Expanded(
            child: ListView.builder(
              itemCount: 5,
              itemBuilder: (context, i) => Card(
                margin: const EdgeInsets.symmetric(horizontal: 15, vertical: 8),
                child: ListTile(
                  leading: const CircleAvatar(backgroundColor: Colors.blue, child: Icon(Icons.bus_alert, color: Colors.white)),
                  title: Text("Bus Route #${100 + i}"),
                  subtitle: Text("Next Stop: Ward ${i + 5} | ETA: ${5 + i} mins"),
                  trailing: const Text("ON TIME", style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}