import 'package:flutter/material.dart';

class HallBookingScreen extends StatelessWidget {
  const HallBookingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Community Hall Booking")),
      body: ListView.builder(
        padding: const EdgeInsets.all(10),
        itemCount: 5,
        itemBuilder: (context, i) => Card(
          clipBehavior: Clip.antiAlias,
          child: Column(
            children: [
              Image.network('https://picsum.photos/seed/${i+50}/400/150', fit: BoxFit.cover),
              ListTile(
                title: Text("City Hall - Zone ${i+1}"),
                subtitle: const Text("Capacity: 500 People | AC Available"),
                trailing: const Text("₹5,000/day", style: TextStyle(fontWeight: FontWeight.bold, color: Colors.green)),
              ),
              Padding(
                padding: const EdgeInsets.only(bottom: 10, right: 10),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton(onPressed: () {}, child: const Text("View Details")),
                    ElevatedButton(onPressed: () {}, child: const Text("Book Now")),
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