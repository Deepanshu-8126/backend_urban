import 'package:provider/provider.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/api_service.dart';
import '../../core/app_provider.dart';
import 'register_screen.dart';
import '../dashboard/citizen_dashboard.dart';
import '../dashboard/admin_war_room.dart';
import 'forgot_password_screen.dart';
import '../landing_page.dart';

class LoginScreen extends StatefulWidget {
  final VoidCallback? onLoginSuccess;
  const LoginScreen({super.key, this.onLoginSuccess});
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> with SingleTickerProviderStateMixin {
  bool isAdmin = false;
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  bool _isPasswordVisible = false;
  bool _isLoading = false;
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(milliseconds: 800));
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOut));
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _handleLogin() async {
    setState(() => _isLoading = true);
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();

    if (email.isEmpty || password.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please fill all fields"), backgroundColor: Colors.red)
      );
      setState(() => _isLoading = false);
      return;
    }

    final error = await ApiService.login(email, password, role: isAdmin ? 'admin' : 'citizen');
    
    setState(() => _isLoading = false);

    if (error == null) {
      if (mounted) {
        await Provider.of<AppProvider>(context, listen: false).checkLoginStatus();
      }

      if (widget.onLoginSuccess != null) {
        widget.onLoginSuccess!();
      } else if (mounted) {
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (c) => isAdmin ? const AdminWarRoom() : const CitizenDashboard()),
          (route) => false,
        );
      }
    } else {
      if (mounted) {
        String msg = error;
        if (error.contains("Invalid citizen credentials") || error.contains("Invalid admin credentials")) {
          msg = "Incorrect Email or Password";
        } else if (error.contains("not found")) {
          msg = "Account does not exist. Please Sign Up.";
        }
        
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(msg), backgroundColor: Colors.red)
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Color(0xFFFFFFFF),
              Color(0xFFF0F4FF),
              Color(0xFFE3EEFF),
              Color(0xFF6C63FF),
            ],
            stops: [0.0, 0.3, 0.6, 1.0],
          ),
        ),
        child: SafeArea(
          child: FadeTransition(
            opacity: _fadeAnimation,
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  
                  Align(
                    alignment: Alignment.topLeft,
                    child: IconButton(
                      icon: const Icon(Icons.arrow_back, color: Color(0xFF6C63FF)),
                      onPressed: () {
                        if (Navigator.canPop(context)) {
                          Navigator.pop(context);
                        } else {
                          // ✅ Fallback to LandingPage if no previous route (prevents black screen)
                          Navigator.pushReplacement(
                            context,
                            MaterialPageRoute(builder: (_) => const LandingPage()),
                          );
                        }
                      },
                    ),
                  ),
                  const SizedBox(height: 20),
                  
                  
                  Container(
                    width: 120,
                    height: 120,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF6C63FF).withOpacity(0.2),
                          blurRadius: 15,
                          offset: const Offset(0, 5),
                        ),
                      ],
                      border: Border.all(color: const Color(0xFF6C63FF).withOpacity(0.3), width: 2),
                    ),
                    child: ClipOval(
                      child: Image.asset(
                        'assets/logo.png',
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  
                  
                  Text(
                    "Welcome Back",
                    style: GoogleFonts.poppins(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: const Color(0xFF1E1E1E),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    "Sign in to continue to Urban OS",
                    style: GoogleFonts.roboto(
                      fontSize: 16,
                      color: Colors.grey[600],
                    ),
                  ),
                  const SizedBox(height: 40),
                  
                  
                  Container(
                    constraints: const BoxConstraints(maxWidth: 400),
                    padding: const EdgeInsets.all(32),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF6C63FF).withOpacity(0.1),
                          blurRadius: 20,
                          offset: const Offset(0, 10),
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        
                        Container(
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(
                            color: Colors.grey[100],
                            borderRadius: BorderRadius.circular(30),
                            border: Border.all(color: const Color(0xFF6C63FF).withOpacity(0.2)),
                          ),
                          child: Row(
                            children: [
                              Expanded(child: _roleButton("Citizen", !isAdmin)),
                              Expanded(child: _roleButton("Admin", isAdmin)),
                            ],
                          ),
                        ),
                        const SizedBox(height: 24),

                        
                        _buildTextField(_emailController, "Email Address", Icons.email_outlined),
                        const SizedBox(height: 20),
                        
                        
                        _buildTextField(_passwordController, "Password", Icons.lock_outline, isPassword: true),
                        const SizedBox(height: 16),
                        
                        
                        Align(
                          alignment: Alignment.centerRight,
                          child: TextButton(
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(builder: (context) => const ForgotPasswordScreen()),
                              );
                            },
                            child: Text(
                              "Forgot Password?",
                              style: GoogleFonts.roboto(
                                color: const Color(0xFF6C63FF),
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ),

                        const SizedBox(height: 24),
                        
                        
                        SizedBox(
                          width: double.infinity,
                          height: 56,
                          child: ElevatedButton(
                            onPressed: _isLoading ? null : _handleLogin,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: isAdmin ? Colors.red : const Color(0xFF6C63FF),
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                              elevation: 5,
                              shadowColor: (isAdmin ? Colors.red : const Color(0xFF6C63FF)).withOpacity(0.5),
                            ),
                            child: _isLoading 
                              ? const SizedBox(
                                  width: 24, 
                                  height: 24, 
                                  child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)
                                )
                              : Text(
                                  isAdmin ? "LOGIN AS ADMIN" : "LOGIN AS CITIZEN",
                                  style: GoogleFonts.poppins(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                    letterSpacing: 1,
                                  ),
                                ),
                          ),
                        ),
                        
                        const SizedBox(height: 24),
                        
                        
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              "Don't have an account?",
                              style: GoogleFonts.roboto(color: Colors.grey[600]),
                            ),
                            TextButton(
                              onPressed: () => Navigator.pushReplacement(
                                context, 
                                MaterialPageRoute(builder: (_) => const RegisterScreen())
                              ),
                              child: Text(
                                "Sign Up",
                                style: GoogleFonts.poppins(
                                  color: const Color(0xFF6C63FF),
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _roleButton(String text, bool isSelected) {
    return GestureDetector(
      onTap: () => setState(() => isAdmin = text == "Admin"),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isSelected 
              ? (isAdmin ? Colors.red : const Color(0xFF6C63FF)) 
              : Colors.transparent,
          borderRadius: BorderRadius.circular(25),
        ),
        alignment: Alignment.center,
        child: Text(
          text,
          style: GoogleFonts.poppins(
            color: isSelected ? Colors.white : Colors.grey[600],
            fontWeight: FontWeight.bold,
            fontSize: 14,
          ),
        ),
      ),
    );
  }

  Widget _buildTextField(
    TextEditingController controller, 
    String label, 
    IconData icon, 
    {bool isPassword = false}
  ) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF6C63FF).withOpacity(0.2)),
      ),
      child: TextField(
        controller: controller,
        obscureText: isPassword && !_isPasswordVisible,
        style: GoogleFonts.roboto(color: const Color(0xFF1E1E1E)),
        decoration: InputDecoration(
          prefixIcon: Icon(icon, color: const Color(0xFF6C63FF)),
          suffixIcon: isPassword 
            ? IconButton(
                icon: Icon(
                  _isPasswordVisible ? Icons.visibility : Icons.visibility_off, 
                  color: Colors.grey[600]
                ),
                onPressed: () => setState(() => _isPasswordVisible = !_isPasswordVisible),
              )
            : null,
          labelText: label,
          labelStyle: GoogleFonts.roboto(color: Colors.grey[600]),
          filled: true,
          fillColor: Colors.transparent,
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
        ),
      ),
    );
  }
}
