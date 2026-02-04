import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'auth/login_screen.dart';
import 'auth/register_screen.dart';

class LandingPage extends StatefulWidget {
  const LandingPage({super.key});

  @override
  State<LandingPage> createState() => _LandingPageState();
}

class _LandingPageState extends State<LandingPage> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(milliseconds: 1500));
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOut));
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
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
          child: SingleChildScrollView(
            child: FadeTransition(
              opacity: _fadeAnimation,
              child: Column(
                children: [
                  _buildHeader(),
                  _buildHeroSection(context),
                  _buildFeaturesSection(),
                  _buildHowItWorks(),
                  _buildAllFeatures(),
                  _buildCTASection(context),
                  _buildFooter(),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFF6C63FF),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.location_city, color: Colors.white, size: 28),
              ),
              const SizedBox(width: 12),
              Text(
                "URBAN OS",
                style: GoogleFonts.poppins(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: const Color(0xFF6C63FF),
                  letterSpacing: 1.2,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildHeroSection(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 40),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: const Color(0xFF6C63FF).withOpacity(0.1),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFF6C63FF).withOpacity(0.3)),
            ),
            child: Text(
              "🚀 SMART CITY MANAGEMENT PLATFORM",
              style: GoogleFonts.poppins(
                color: const Color(0xFF6C63FF),
                fontWeight: FontWeight.bold,
                fontSize: 12,
                letterSpacing: 1.2,
              ),
            ),
          ),
          const SizedBox(height: 24),
          
          Text(
            "Urban Governance\nMade Simple",
            textAlign: TextAlign.center,
            style: GoogleFonts.poppins(
              fontSize: 42,
              fontWeight: FontWeight.bold,
              color: const Color(0xFF1E1E1E),
              height: 1.2,
            ),
          ),
          const SizedBox(height: 16),
          
          Text(
            "Complete civic management solution with real-time\ngrievance tracking, emergency SOS, and AI-powered analytics",
            textAlign: TextAlign.center,
            style: GoogleFonts.roboto(
              fontSize: 16,
              color: Colors.grey[700],
              height: 1.6,
            ),
          ),
          const SizedBox(height: 32),
          
          Wrap(
            spacing: 16,
            runSpacing: 16,
            alignment: WrapAlignment.center,
            children: [
              _buildPrimaryButton(
                "Get Started",
                Icons.arrow_forward,
                () => Navigator.push(context, MaterialPageRoute(builder: (_) => const RegisterScreen())),
              ),
              _buildSecondaryButton(
                "Login",
                Icons.login,
                () => Navigator.push(context, MaterialPageRoute(builder: (_) => const LoginScreen())),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFeaturesSection() {
    final features = [
      {
        'icon': Icons.sos,
        'title': 'SOS Emergency System',
        'short': 'Instant emergency alerts with location tracking',
        'full': 'One-tap SOS button sends instant alerts to authorities with your exact location, emergency contacts, and real-time tracking. Includes automatic photo capture and audio recording for evidence.',
        'color': const Color(0xFFFF0000),
      },
      {
        'icon': Icons.report_problem_outlined,
        'title': 'Smart Complaint System',
        'short': 'AI-powered grievance management',
        'full': 'Report civic issues with photos, automatic location tagging, and category detection. Track status in real-time, get updates via notifications, and view resolution timeline with photo evidence.',
        'color': const Color(0xFFFF6B6B),
      },
      {
        'icon': Icons.map_outlined,
        'title': 'Live Grievance Map',
        'short': 'Real-time city-wide incident visualization',
        'full': 'Interactive map showing all active complaints with heatmap view, clustering, filters by status/category/time, and tap-to-view details. See what\'s happening in your city in real-time.',
        'color': const Color(0xFF4ECDC4),
      },
      {
        'icon': Icons.dashboard_outlined,
        'title': 'Admin Dashboard',
        'short': 'Comprehensive city monitoring',
        'full': 'Complete administrative control with department-wise analytics, performance metrics, efficiency tracking, real-time activity feed, and AI-powered anomaly detection for proactive management.',
        'color': const Color(0xFF6C63FF),
      },
      {
        'icon': Icons.trending_up,
        'title': 'City Monitor & Analytics',
        'short': 'AI-powered insights and trends',
        'full': 'Advanced analytics with trend prediction, department efficiency scores, area-wise statistics, resolution rate tracking, and performance badges. Make data-driven decisions for better governance.',
        'color': const Color(0xFFFFBE0B),
      },
      {
        'icon': Icons.notifications_active_outlined,
        'title': 'Real-time Notifications',
        'short': 'Stay updated on everything',
        'full': 'Instant push notifications for complaint status updates, nearby incidents, emergency alerts, and department responses. Never miss important city updates.',
        'color': const Color(0xFFFF006E),
      },
    ];

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 40),
      child: Column(
        children: [
          Text(
            "What's in the App?",
            textAlign: TextAlign.center,
            style: GoogleFonts.poppins(
              fontSize: 28, // Reduced slightly to prevent header overflow
              fontWeight: FontWeight.bold,
              color: const Color(0xFF1E1E1E),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            "Click on any feature to learn more",
            textAlign: TextAlign.center,
            style: GoogleFonts.roboto(
              fontSize: 14,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 40),
          
          LayoutBuilder(
            builder: (context, constraints) {
              // Responsive grid calculation
              double itemWidth = (constraints.maxWidth - 20) / 2;
              if (itemWidth < 140) itemWidth = constraints.maxWidth; // Full width on very small screens

              return Wrap(
                spacing: 20,
                runSpacing: 20,
                alignment: WrapAlignment.center,
                children: List.generate(features.length, (index) {
                  final feature = features[index];
                  return TweenAnimationBuilder<double>(
                    duration: Duration(milliseconds: 600 + (index * 100)),
                    tween: Tween(begin: 0.0, end: 1.0),
                    curve: Curves.easeOutBack, // Added bounce effect
                    builder: (context, value, child) {
                      return Transform.scale(
                        scale: 0.5 + (0.5 * value), // Pop-in animation
                        child: Opacity(
                          opacity: value,
                          child: SizedBox(
                            width: itemWidth,
                            child: _buildClickableFeatureCard(
                              feature['icon'] as IconData,
                              feature['title'] as String,
                              feature['short'] as String,
                              feature['full'] as String,
                              feature['color'] as Color,
                            ),
                          ),
                        ),
                      );
                    },
                    child: const SizedBox.shrink(), // Content built in builder
                  );
                }),
              );
            }
          ),
        ],
      ),
    );
  }

  // ... (keeping _buildHowItWorks and others as is)

  // NOTE: Moving _buildClickableFeatureCard update to next method call to ensure clean replacement
  // For now, I will include the updated method here to satisfy the replacement range

  Widget _buildClickableFeatureCard(IconData icon, String title, String shortDesc, String fullDesc, Color color) {
    return MouseRegion(
      cursor: SystemMouseCursors.click,
      child: GestureDetector(
        onTap: () => _showFeatureDetail(title, fullDesc, icon, color),
        child: Container(
          // Width handled by parent now
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 10,
                offset: const Offset(0, 5),
              ),
            ],
            border: Border.all(color: Colors.white, width: 2), // Subtle border
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min, // Wrap content vertically
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: color, size: 28),
              ),
              const SizedBox(height: 12),
              Text(
                title,
                textAlign: TextAlign.center,
                style: GoogleFonts.poppins(
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                  color: const Color(0xFF1E1E1E),
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 6),
              Text(
                shortDesc,
                textAlign: TextAlign.center,
                style: GoogleFonts.roboto(
                  fontSize: 11,
                  color: Colors.grey[600],
                  height: 1.2,
                ),
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 10),
              AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(Icons.touch_app, color: color, size: 14),
              ),
            ],
          ),
        ),
      ),
    );
  }


  Widget _buildHowItWorks() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 60),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.7),
      ),
      child: Column(
        children: [
          Text(
            "How It Works",
            style: GoogleFonts.poppins(
              fontSize: 32,
              fontWeight: FontWeight.bold,
              color: const Color(0xFF1E1E1E),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            "Simple, fast, and effective",
            style: GoogleFonts.roboto(
              fontSize: 16,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 40),
          
          TweenAnimationBuilder<double>(
            duration: const Duration(milliseconds: 700),
            tween: Tween(begin: 0.0, end: 1.0),
            curve: Curves.easeOut,
            builder: (context, value, child) => Transform.translate(
              offset: Offset(-30 * (1 - value), 0),
              child: Opacity(opacity: value, child: child),
            ),
            child: _buildDetailedStep(
              1, 
              "Create Account", 
              "Register with your mobile number and basic details. Verify via OTP for secure access.",
              Icons.person_add,
              ["Quick registration", "OTP verification", "Secure login"],
            ),
          ),
          const SizedBox(height: 24),
          TweenAnimationBuilder<double>(
            duration: const Duration(milliseconds: 800),
            tween: Tween(begin: 0.0, end: 1.0),
            curve: Curves.easeOut,
            builder: (context, value, child) => Transform.translate(
              offset: Offset(-30 * (1 - value), 0),
              child: Opacity(opacity: value, child: child),
            ),
            child: _buildDetailedStep(
              2, 
              "Report Issues", 
              "Take a photo, add description, and submit. Location is automatically captured.",
              Icons.camera_alt,
              ["Photo upload", "Auto-location", "Category selection", "Priority marking"],
            ),
          ),
          const SizedBox(height: 24),
          TweenAnimationBuilder<double>(
            duration: const Duration(milliseconds: 900),
            tween: Tween(begin: 0.0, end: 1.0),
            curve: Curves.easeOut,
            builder: (context, value, child) => Transform.translate(
              offset: Offset(-30 * (1 - value), 0),
              child: Opacity(opacity: value, child: child),
            ),
            child: _buildDetailedStep(
              3, 
              "Track Progress", 
              "Get real-time updates on your complaint status. View resolution timeline and photos.",
              Icons.track_changes,
              ["Status updates", "Push notifications", "Timeline view", "Photo evidence"],
            ),
          ),
          const SizedBox(height: 24),
          TweenAnimationBuilder<double>(
            duration: const Duration(milliseconds: 1000),
            tween: Tween(begin: 0.0, end: 1.0),
            curve: Curves.easeOut,
            builder: (context, value, child) => Transform.translate(
              offset: Offset(-30 * (1 - value), 0),
              child: Opacity(opacity: value, child: child),
            ),
            child: _buildDetailedStep(
              4, 
              "Emergency SOS", 
              "In emergency, tap SOS button. Instant alert sent to authorities with your location.",
              Icons.sos,
              ["One-tap alert", "Auto location share", "Emergency contacts", "Audio recording"],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAllFeatures() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 60),
      child: Column(
        children: [
          Text(
            "Complete Feature List",
            style: GoogleFonts.poppins(
              fontSize: 32,
              fontWeight: FontWeight.bold,
              color: const Color(0xFF1E1E1E),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            "Everything you need for smart city management",
            style: GoogleFonts.roboto(
              fontSize: 16,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 40),
          
          LayoutBuilder(
            builder: (context, constraints) {
              return Wrap(
                spacing: 12,
                runSpacing: 12,
                alignment: WrapAlignment.center,
                children: [
                  "SOS Emergency System with Auto-Location",
                  "Smart Complaint Management",
                  "Live Grievance Map with Heatmap",
                  "Photo Upload & Evidence Tracking",
                  "Automatic Location Detection",
                  "Real-time Push Notifications",
                  "Admin Dashboard with Analytics",
                  "City Monitor (Trends & Intelligence)",
                  "AI-Powered Anomaly Detection",
                  "Live Activity Feed",
                  "Performance Metrics & Badges",
                  "Department Efficiency Tracking",
                  "Area-wise Logistics Management",
                  "Dark Mode Support",
                  "Secure Authentication & Authorization",
                  "Responsive Design (Mobile & Web)",
                  "Category-based Filtering",
                  "Time-range Filters (24h/7d/30d)",
                  "Pull-to-Refresh Updates",
                  "Delete Complaints",
                  "Status Tracking (Pending/Working/Solved)",
                  "Emergency Contact Integration",
                ].asMap().entries.map((entry) {
                  final index = entry.key;
                  final text = entry.value;
                  return TweenAnimationBuilder<double>(
                    duration: Duration(milliseconds: 400 + (index * 50)),
                    tween: Tween(begin: 0.0, end: 1.0),
                    curve: Curves.easeOut,
                    builder: (context, value, child) {
                      return Transform.scale(
                        scale: 0.8 + (0.2 * value),
                        child: Opacity(
                          opacity: value,
                          child: child,
                        ),
                      );
                    },
                    child: _buildCheckItem(text, constraints.maxWidth),
                  );
                }).toList(),
              );
            }
          ),
        ],
      ),
    );
  }

  Widget _buildCTASection(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 40),
      padding: const EdgeInsets.all(24), // Reduced from 40
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF6C63FF), Color(0xFF5A52E0)],
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF6C63FF).withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        children: [
          Text(
            "Ready to Make Your City Better?",
            textAlign: TextAlign.center,
            style: GoogleFonts.poppins(
              fontSize: 24, // Reduced from 28
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            "Join thousands of citizens and administrators using Urban OS",
            textAlign: TextAlign.center,
            style: GoogleFonts.roboto(
              fontSize: 14, // Reduced from 16
              color: Colors.white.withOpacity(0.9),
            ),
          ),
          const SizedBox(height: 32),
          SizedBox(
            width: double.infinity, // Ensure button does not exceed container
            child: FittedBox( // Scale down content if still too wide
              fit: BoxFit.scaleDown,
              child: ElevatedButton(
                onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const RegisterScreen())),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: const Color(0xFF6C63FF),
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16), // Reduced from 48, 20
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  elevation: 0,
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      "Create Account Now",
                      style: GoogleFonts.poppins(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Icon(Icons.arrow_forward),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFooter() {
    return Container(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          Text(
            "URBAN OS",
            style: GoogleFonts.poppins(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: const Color(0xFF6C63FF),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            "Smart City Management Platform",
            style: GoogleFonts.roboto(
              fontSize: 14,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 16),
          Text(
            "© 2024 Urban OS. All rights reserved.",
            style: GoogleFonts.roboto(
              fontSize: 12,
              color: Colors.grey[500],
            ),
          ),
        ],
      ),
    );
  }

  
  Widget _buildPrimaryButton(String label, IconData icon, VoidCallback onTap) {
    return ElevatedButton(
      onPressed: onTap,
      style: ElevatedButton.styleFrom(
        backgroundColor: const Color(0xFF6C63FF),
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 18),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        elevation: 5,
        shadowColor: const Color(0xFF6C63FF).withOpacity(0.5),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(label, style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(width: 8),
          Icon(icon),
        ],
      ),
    );
  }

  Widget _buildSecondaryButton(String label, IconData icon, VoidCallback onTap) {
    return OutlinedButton(
      onPressed: onTap,
      style: OutlinedButton.styleFrom(
        foregroundColor: const Color(0xFF6C63FF),
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 18),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        side: const BorderSide(color: Color(0xFF6C63FF), width: 2),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(label, style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(width: 8),
          Icon(icon),
        ],
      ),
    );
  }



  void _showFeatureDetail(String title, String description, IconData icon, Color color) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [Colors.white, color.withOpacity(0.05)],
            ),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: color, size: 48),
              ),
              const SizedBox(height: 20),
              Text(
                title,
                textAlign: TextAlign.center,
                style: GoogleFonts.poppins(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: const Color(0xFF1E1E1E),
                ),
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: color.withOpacity(0.2)),
                ),
                child: Text(
                  description,
                  textAlign: TextAlign.center,
                  style: GoogleFonts.roboto(
                    fontSize: 15,
                    color: Colors.grey[700],
                    height: 1.6,
                  ),
                ),
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(
                  backgroundColor: color,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: Text(
                  "Got it!",
                  style: GoogleFonts.poppins(fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFeatureDetail(String title) {
    final features = {
      'SOS Emergency System': 'One-tap SOS button sends instant alerts to authorities with your exact location, emergency contacts, and real-time tracking. Includes automatic photo capture and audio recording for evidence.',
      'Smart Complaint System': 'Report civic issues with photos, automatic location tagging, and category detection. Track status in real-time, get updates via notifications, and view resolution timeline with photo evidence.',
      'Live Grievance Map': 'Interactive map showing all active complaints with heatmap view, clustering, filters by status/category/time, and tap-to-view details. See what\'s happening in your city in real-time.',
      'Admin Dashboard': 'Complete administrative control with department-wise analytics, performance metrics, efficiency tracking, real-time activity feed, and AI-powered anomaly detection for proactive management.',
      'City Monitor & Analytics': 'Advanced analytics with trend prediction, department efficiency scores, area-wise statistics, resolution rate tracking, and performance badges. Make data-driven decisions for better governance.',
      'Real-time Notifications': 'Instant push notifications for complaint status updates, nearby incidents, emergency alerts, and department responses. Never miss important city updates.',
    };

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: const Color(0xFF6C63FF).withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF6C63FF).withOpacity(0.3)),
      ),
      child: Column(
        children: [
          Row(
            children: [
              const Icon(Icons.info_outline, color: Color(0xFF6C63FF)),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  title,
                  style: GoogleFonts.poppins(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFF1E1E1E),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            features[title] ?? '',
            style: GoogleFonts.roboto(
              fontSize: 14,
              color: Colors.grey[700],
              height: 1.6,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailedStep(int number, String title, String description, IconData icon, List<String> points) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Color(0xFF6C63FF), Color(0xFF5A52E0)],
              ),
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                "$number",
                style: GoogleFonts.poppins(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ),
          ),
          const SizedBox(width: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(icon, color: const Color(0xFF6C63FF), size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        title,
                        style: GoogleFonts.poppins(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: const Color(0xFF1E1E1E),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  description,
                  style: GoogleFonts.roboto(
                    fontSize: 14,
                    color: Colors.grey[600],
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: 12),
                ...points.map((point) => Padding(
                  padding: const EdgeInsets.only(bottom: 6),
                  child: Row(
                    children: [
                      const Icon(Icons.check_circle, color: Color(0xFF6C63FF), size: 16),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          point,
                          style: GoogleFonts.roboto(
                            fontSize: 13,
                            color: Colors.grey[700],
                          ),
                        ),
                      ),
                    ],
                  ),
                )),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCheckItem(String text, double maxWidth) {
    return Container(
      constraints: BoxConstraints(maxWidth: maxWidth),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF6C63FF).withOpacity(0.2)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.check_circle, color: Color(0xFF6C63FF), size: 18),
          const SizedBox(width: 8),
          Flexible(
            child: Text(
              text,
              style: GoogleFonts.roboto(
                fontSize: 13,
                color: const Color(0xFF1E1E1E),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
