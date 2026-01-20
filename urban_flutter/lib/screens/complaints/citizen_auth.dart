import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class CitizenAuth extends StatefulWidget {
  final VoidCallback onLoginSuccess;
  const CitizenAuth({super.key, required this.onLoginSuccess});
  @override
  State<CitizenAuth> createState() => _CitizenAuthState();
}

class _CitizenAuthState extends State<CitizenAuth> {
  int step = 1;
  final emailCont = TextEditingController();
  final passCont = TextEditingController();

  Future<void> _handleLogin() async {
    if (emailCont.text.isEmpty || passCont.text.isEmpty) {
      _showMsg("Email aur Password bharna zaroori hai!");
      return;
    }
    // Save Login State
    SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.setBool('isLoggedIn', true);
    widget.onLoginSuccess();
  }

  void _showMsg(String m) => ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(m), backgroundColor: Colors.red));

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(step == 1 ? "Citizen Login" : "Register")),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: step == 1 ? Column(children: [
          TextField(controller: emailCont, decoration: const InputDecoration(labelText: "Gmail / Phone", border: OutlineInputBorder())),
          const SizedBox(height: 15),
          TextField(controller: passCont, decoration: const InputDecoration(labelText: "Password", border: OutlineInputBorder()), obscureText: true),
          const SizedBox(height: 20),
          ElevatedButton(onPressed: _handleLogin, child: const Text("LOGIN")),
          TextButton(onPressed: () => setState(() => step = 2), child: const Text("Create Account")),
        ]) : _signupUI(),
      ),
    );
  }

  Widget _signupUI() {
    return Column(children: [
      const TextField(decoration: InputDecoration(labelText: "First Name")),
      const TextField(decoration: InputDecoration(labelText: "Surname")),
      const TextField(decoration: InputDecoration(labelText: "DOB")),
      const SizedBox(height: 20),
      ElevatedButton(onPressed: () => setState(() => step = 1), child: const Text("Register")),
    ]);
  }
}