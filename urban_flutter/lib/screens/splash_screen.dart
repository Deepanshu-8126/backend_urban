import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:animate_do/animate_do.dart';
import '../core/app_provider.dart';
import 'landing_page.dart';
import 'dashboard/admin_war_room.dart';
import 'dashboard/citizen_dashboard.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeIn),
    );

    _scaleAnimation = Tween<double>(begin: 0.8, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOutBack),
    );

    _controller.forward();

    _navigateNext();
  }

  Future<void> _navigateNext() async {
    
    await Future.delayed(const Duration(seconds: 3));
    
    if (!mounted) return;

    final provider = Provider.of<AppProvider>(context, listen: false);
    
    
    
    
    if (provider.isLoggedIn) {
      if (provider.isAdmin) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const AdminWarRoom()),
        );
      } else {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const CitizenDashboard()),
        );
      }
    } else {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const LandingPage()),
      );
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white, 
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            
            Pulse(
              duration: const Duration(seconds: 2),
              infinite: true,
              child: Container(
                width: 150,
                height: 150,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.blue.withOpacity(0.1),
                      blurRadius: 30,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: ClipOval(
                  child: Image.asset(
                    'assets/logo.png',
                    fit: BoxFit.contain, // Changed for better logo fit
                  ),
                ),
              ),
            ),
            const SizedBox(height: 30),
            
            FadeInUp(
              duration: const Duration(milliseconds: 800),
              child: Text(
                "SMART CITY",
                style: TextStyle(
                  fontSize: 36,
                  fontWeight: FontWeight.bold,
                  color: Colors.blue[900],
                  letterSpacing: 2.0,
                ),
              ),
            ),
            const SizedBox(height: 10),
            
            FadeInUp(
              delay: const Duration(milliseconds: 300),
              duration: const Duration(milliseconds: 800),
              child: Text(
                "Chota Kadam, Badalta Bharat 🇮🇳",
                style: TextStyle(
                  fontSize: 18,
                  color: Colors.orange[800],
                  fontWeight: FontWeight.w600,
                  fontStyle: FontStyle.italic
                ),
              ),
            ),
            const SizedBox(height: 60),
            
            FadeIn(
              delay: const Duration(seconds: 1),
              child: SizedBox(
                width: 40,
                height: 40,
                child: CircularProgressIndicator(
                  strokeWidth: 3,
                  color: Colors.blue[800],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
