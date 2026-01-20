import 'package:flutter/material.dart';
import '../dashboard/admin_war_room.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  bool isAdmin = false; // Role Selector

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(25.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.location_city, size: 80, color: Colors.blue),
            const Text("URBAN OS", style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
            const SizedBox(height: 40),

            // Role Selection Toggle
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text("Citizen"),
                Switch(
                  value: isAdmin,
                  onChanged: (v) => setState(() => isAdmin = v),
                  activeColor: Colors.red,
                ),
                const Text("Admin"),
              ],
            ),

            TextField(decoration: InputDecoration(labelText: "Email/Username", border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)))),
            const SizedBox(height: 15),
            TextField(obscureText: true, decoration: InputDecoration(labelText: "Password", border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)))),
            const SizedBox(height: 25),

            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: isAdmin ? Colors.red : Colors.blue),
                onPressed: () {
                  // Yahan baad mein dost ki Auth API lagegi
                  Navigator.pushReplacement(context, MaterialPageRoute(builder: (c) => const AdminWarRoom()));
                },
                child: Text(isAdmin ? "Login as Admin" : "Login as Citizen", style: const TextStyle(color: Colors.white)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}