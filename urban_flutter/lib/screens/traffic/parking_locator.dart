import 'package:flutter/material.dart';

class SmartParkingScreen extends StatelessWidget {
  const SmartParkingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Smart Parking Hub")),
      body: GridView.builder(
        padding: const EdgeInsets.all(20),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 4, mainAxisSpacing: 10, crossAxisSpacing: 10),
        itemCount: 20,
        itemBuilder: (context, i) => Container(
          decoration: BoxDecoration(
            color: i % 3 == 0 ? Colors.red.withOpacity(0.2) : Colors.green.withOpacity(0.2),
            border: Border.all(color: i % 3 == 0 ? Colors.red : Colors.green),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Center(child: Text("P-${i+1}", style: TextStyle(fontWeight: FontWeight.bold, color: i % 3 == 0 ? Colors.red : Colors.green))),
        ),
      ),
    );
  }
}