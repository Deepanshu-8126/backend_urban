import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../auth/login_screen.dart';
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

  
  Future<void> _checkLoginStatus() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    if (!mounted) return;
    bool isLoggedIn = prefs.getBool('isLoggedIn') ?? false;
    bool isAdmin = prefs.getBool('isAdmin') ?? false;
    
    setState(() {
      if (isLoggedIn) {
        view = isAdmin ? "admin_view" : "citizen_form";
      } else {
        view = "role_selection";
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    if (view == "loading") return const Scaffold(body: Center(child: CircularProgressIndicator()));
    if (view == "role_selection") return _buildRoleSelection();
    
    
    if (view == "citizen_form") return const CitizenForm();
    if (view == "admin_view") return const AdminView();
    return const AdminView(); 
  }

  Widget _buildRoleSelection() {
    return Scaffold(
      appBar: AppBar(title: const Text("Complaints Access")),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _btn("Login to Continue", Colors.blue, () {
               Navigator.push(
                 context, 
                 MaterialPageRoute(builder: (c) => LoginScreen(
                   onLoginSuccess: () {
                     Navigator.pop(context);
                     _checkLoginStatus();
                   }
                 ))
               );
            }),
          ],
        ),
      ),
    );
  }

  Widget _btn(String t, Color c, VoidCallback p) => ElevatedButton(
    style: ElevatedButton.styleFrom(backgroundColor: c, minimumSize: const Size(250, 55)),
    onPressed: p, child: Text(t, style: const TextStyle(color: Colors.white)),
  );
}