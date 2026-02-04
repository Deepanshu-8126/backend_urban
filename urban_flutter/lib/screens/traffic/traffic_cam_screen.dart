import 'package:flutter/material.dart';

class TrafficCamScreen extends StatelessWidget {
  const TrafficCamScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("City Surveillance")),
      body: GridView.builder(
        padding: const EdgeInsets.all(10),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: 1.5,
          mainAxisSpacing: 10,
          crossAxisSpacing: 10,
        ),
        itemCount: 8, 
        itemBuilder: (context, i) => Container(
          decoration: BoxDecoration(
            color: Colors.black,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Stack(
            children: [
              const Center(child: Icon(Icons.videocam_off, color: Colors.white30)),
              Positioned(
                bottom: 5, left: 5,
                child: Text("CAM-0${i+1} Sector 4", style: const TextStyle(color: Colors.white, fontSize: 10)),
              ),
              const Positioned(
                top: 5, right: 5,
                child: CircleAvatar(radius: 4, backgroundColor: Colors.red), 
              )
            ],
          ),
        ),
      ),
    );
  }
}