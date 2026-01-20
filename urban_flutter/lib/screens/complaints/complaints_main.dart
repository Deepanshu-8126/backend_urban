import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:urban_flutter/core/app_provider.dart';
import 'package:urban_flutter/core/voice_service.dart';
import 'citizen_auth.dart';
import 'citizen_form.dart';
import 'admin_view.dart';

class ComplaintsMain extends StatefulWidget {
  const ComplaintsMain({super.key});
  @override
  State<ComplaintsMain> createState() => _ComplaintsMainState();
}

class _ComplaintsMainState extends State<ComplaintsMain> {
  String view = "loading";

  @override
  void initState() {
    super.initState();
    _checkLoginStatus();
  }

  // Persistent Login Logic
  Future<void> _checkLoginStatus() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    bool isLoggedIn = prefs.getBool('isLoggedIn') ?? false;
    setState(() {
      view = isLoggedIn ? "citizen_form" : "role_selection";
    });
  }

  @override
  Widget build(BuildContext context) {
    if (view == "loading") return const Scaffold(body: Center(child: CircularProgressIndicator()));
    if (view == "role_selection") return _buildRoleSelection();
    if (view == "citizen_auth") return CitizenAuth(onLoginSuccess: () => setState(() => view = "citizen_form"));
    if (view == "admin_login") return _buildAdminLogin();
    if (view == "citizen_form") return const CitizenForm();
    return const AdminView();
  }

  Widget _buildRoleSelection() {
    return Scaffold(
      appBar: AppBar(title: const Text("Complaints Access")),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _btn("Login as Citizen", Colors.blue, () => setState(() => view = "citizen_auth")),
            const SizedBox(height: 20),
            _btn("Login as Admin", Colors.red, () => setState(() => view = "admin_login")),
          ],
        ),
      ),
    );
  }

  Widget _btn(String t, Color c, VoidCallback p) => ElevatedButton(
    style: ElevatedButton.styleFrom(backgroundColor: c, minimumSize: const Size(250, 55)),
    onPressed: p, child: Text(t, style: const TextStyle(color: Colors.white)),
  );

  Widget _buildAdminLogin() {
    return Scaffold(
      appBar: AppBar(title: const Text("Admin Access")),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            const TextField(decoration: InputDecoration(labelText: "Admin ID", border: OutlineInputBorder())),
            const SizedBox(height: 15),
            const TextField(decoration: InputDecoration(labelText: "Password", border: OutlineInputBorder()), obscureText: true),
            const SizedBox(height: 20),
            _btn("Verify Admin", Colors.red, () => setState(() => view = "admin_view")),
          ],
        ),
      ),
    );
  }
}