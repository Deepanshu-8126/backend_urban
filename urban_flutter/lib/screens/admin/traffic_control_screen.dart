import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:async';
import 'package:animate_do/animate_do.dart';
import '../../core/api_service.dart';

class TrafficControlScreen extends StatefulWidget {
  const TrafficControlScreen({super.key});

  @override
  State<TrafficControlScreen> createState() => _TrafficControlScreenState();
}

class _TrafficControlScreenState extends State<TrafficControlScreen> {
  List<dynamic> signals = [];
  bool isLoading = true;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _fetchSignals();
    // Auto-refresh every 5 seconds to show "Live" nature
    _timer = Timer.periodic(const Duration(seconds: 5), (timer) {
      _fetchSignals(background: true);
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _fetchSignals({bool background = false}) async {
    try {
      final response = await http.get(Uri.parse('${ApiService.baseUrl}/traffic'));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (mounted) {
          setState(() {
            signals = data['data'];
            isLoading = false;
          });
        }
      }
    } catch (e) {
      debugPrint("Traffic Fetch Error: $e");
    }
  }

  Future<void> _toggleSignal(String id) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiService.baseUrl}/traffic/toggle'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'id': id}),
      );
      
      if (response.statusCode == 200) {
        // Immediate refresh to show change
        _fetchSignals(background: true);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Signal Override Success!"), backgroundColor: Colors.green),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Failed to toggle signal"), backgroundColor: Colors.red),
      );
    }
  }

  Color _getStatusColor(String status) {
    return status == 'RED' ? Colors.redAccent : Colors.greenAccent.shade400;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black, // War Room Vibes
      appBar: AppBar(
        title: const Text("TRAFFIC COMMAND CENTER", style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1.5)),
        backgroundColor: Colors.grey[900],
        elevation: 0,
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.greenAccent),
              borderRadius: BorderRadius.circular(20)
            ),
            child: Row(
              children: const [
                Icon(Icons.circle, color: Colors.greenAccent, size: 10),
                SizedBox(width: 8),
                Text("LIVE FEED", style: TextStyle(color: Colors.greenAccent, fontSize: 12, fontWeight: FontWeight.bold))
              ],
            ),
          )
        ],
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator(color: Colors.cyan))
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: GridView.builder(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  childAspectRatio: 0.85,
                ),
                itemCount: signals.length,
                itemBuilder: (context, index) {
                  return _buildSignalCard(signals[index], index);
                },
              ),
            ),
    );
  }

  Widget _buildSignalCard(Map signal, int index) {
    bool isRed = signal['status'] == 'RED';
    
    return FadeInUp(
      delay: Duration(milliseconds: index * 100),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.grey[900],
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: isRed ? Colors.red.withOpacity(0.3) : Colors.green.withOpacity(0.3)),
          boxShadow: [
            BoxShadow(
              color: isRed ? Colors.red.withOpacity(0.1) : Colors.green.withOpacity(0.1),
              blurRadius: 10,
              spreadRadius: 2
            )
          ]
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.black,
                border: Border.all(color: _getStatusColor(signal['status']), width: 2),
                boxShadow: [
                  BoxShadow(color: _getStatusColor(signal['status']), blurRadius: 15)
                ]
              ),
              child: Icon(
                Icons.traffic,
                color: _getStatusColor(signal['status']),
                size: 32,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              signal['location'],
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              "Density: ${signal['density']}",
              style: TextStyle(color: Colors.white70, fontSize: 12),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => _toggleSignal(signal['id']),
              style: ElevatedButton.styleFrom(
                backgroundColor: isRed ? Colors.green.withOpacity(0.2) : Colors.red.withOpacity(0.2),
                foregroundColor: isRed ? Colors.green : Colors.red,
                side: BorderSide(color: isRed ? Colors.green : Colors.red),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20))
              ),
              child: Text(isRed ? "SWITCH GREEN" : "SWITCH RED"),
            )
          ],
        ),
      ),
    );
  }
}
