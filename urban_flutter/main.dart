import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

void main() => runApp(MaterialApp(home: SuperAdminDashboard()));

class SuperAdminDashboard extends StatelessWidget {
  // [COMMENT: Apne dost ke laptop ka IP address yahan daalein]
  final String backendUrl = "http://192.168.1.25:3000";

  Future<void> checkConnection() async {
    try {
      final response = await http.get(Uri.parse(backendUrl));
      print("Backend Response: ${response.body}");
    } catch (e) {
      print("Connection Error: $e");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(0xFF0A0E21), // Dark Admin Theme
      appBar: AppBar(title: Text("🏛️ Urban Super System"), backgroundColor: Colors.indigo),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text("Admin Command Center", style: TextStyle(color: Colors.white, fontSize: 24)),
            SizedBox(height: 30),
            ElevatedButton(
              onPressed: checkConnection,
              child: Text("Test Backend Connection"),
            ),
          ],
        ),
      ),
    );
  }
}