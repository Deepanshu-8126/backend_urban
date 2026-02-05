import 'package:provider/provider.dart';
import 'package:flutter/material.dart';
import 'dart:ui';
import '../../core/app_provider.dart';
import '../../core/api_service.dart';
 
import '../complaints/admin_view.dart';
import '../citizen/hall_booking_screen.dart';
import '../disaster/citizen_sos_screen.dart';
import '../complaints/citizen_form.dart';
import '../complaints/my_complaints_screen.dart';

import '../auth/login_screen.dart';
import '../property/tax_calculator_screen.dart';
import '../health/aqi_monitor_screen.dart';

import '../ChatBot/chat_bot_screen.dart';
import '../profile/user_profile_screen.dart';
import '../admin/city_monitor_screen.dart';
import '../settings/settings_screen.dart';
import '../notifications/notifications_screen.dart';
import '../landing_page.dart';

class CitizenDashboard extends StatefulWidget {
  const CitizenDashboard({super.key});

  @override
  State<CitizenDashboard> createState() => _CitizenDashboardState();
}

class _CitizenDashboardState extends State<CitizenDashboard> with SingleTickerProviderStateMixin {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  late AnimationController _controller;
  DateTime? currentBackPressTime;
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        Provider.of<AppProvider>(context, listen: false).checkLoginStatus();
      }
    });
    _controller = AnimationController(vsync: this, duration: const Duration(milliseconds: 1000));
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<AppProvider>(context);
    final isDark = provider.isDarkMode;
    final bool isAdmin = provider.isAdmin;

    final List<Map<String, dynamic>> services = [
      if (!isAdmin)
        {"title": "File Complaint", "icon": Icons.report_problem, "color": Colors.redAccent, "page": const CitizenForm()},
      {
        "title": "Complaint Hub", 
        "icon": Icons.history, 
        "color": Colors.orangeAccent, 
        "page": isAdmin ? const AdminView() : const MyComplaintsScreen()
      },
      {"title": "SOS Emergency", "icon": Icons.emergency, "color": Colors.red, "page": const CitizenSOSScreen()},
      {"title": "AQI Monitor", "icon": Icons.air, "color": Colors.tealAccent, "page": const AqiMonitorScreen()},
      {"title": "Property Tax", "icon": Icons.payments, "color": Colors.green, "page": const TaxCalculatorScreen()},
      {"title": "Hall Booking", "icon": Icons.event_seat, "color": Colors.purpleAccent, "page": const HallBookingScreen()},
      {"title": "CityBrain AI", "icon": Icons.psychology, "color": Colors.deepPurpleAccent, "page": const CityBrainBot()},
    ];

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) async {
        if (didPop) return;
        final now = DateTime.now();
        if (currentBackPressTime == null || 
            now.difference(currentBackPressTime!) > const Duration(seconds: 2)) {
          currentBackPressTime = now;
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Press back again to exit app'), duration: Duration(seconds: 1)),
          );
          return;
        }
        Navigator.of(context).pop(); 
      },
      child: Scaffold(
        key: _scaffoldKey,
        body: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: isDark 
                ? [
                    const Color(0xFF0F172A), 
                    const Color(0xFF1E293B), 
                    const Color(0xFF000000), 
                  ]
                : [
                    const Color(0xFFF1F5F9), 
                    const Color(0xFFE2E8F0), 
                    const Color(0xFFFFFFFF), 
                  ],
            ),
          ),
          child: SafeArea(
            bottom: false,
            child: NestedScrollView(
              controller: _scrollController,
              headerSliverBuilder: (context, innerBoxIsScrolled) => [
                _buildSliverAppBar(innerBoxIsScrolled, isDark, provider),
              ],
              body: _buildBody(services, isDark),
            ),
          ),
        ),
        endDrawer: _buildModernDrawer(isDark, provider),
      ),
    );
  }

  Widget _buildSliverAppBar(bool innerBoxIsScrolled, bool isDark, AppProvider provider) {
    return SliverAppBar(
      expandedHeight: 220.0,
      collapsedHeight: 80,
      toolbarHeight: 80,
      floating: false,
      pinned: true,
      backgroundColor: Colors.transparent,
      elevation: 0,
      stretch: true,
      flexibleSpace: ClipRRect(
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: FlexibleSpaceBar(
            titlePadding: const EdgeInsets.only(left: 20, bottom: 16),
            centerTitle: false,
            title: AnimatedOpacity(
              opacity: innerBoxIsScrolled ? 1.0 : 0.0,
              duration: const Duration(milliseconds: 300),
              child: Text(
                "Urban Services", 
                style: TextStyle(
                  color: isDark ? Colors.white : Colors.black87, 
                  fontSize: 18, 
                  fontWeight: FontWeight.bold
                )
              ),
            ),
            background: _buildHeaderContent(isDark, provider),
          ),
        ),
      ),
      actions: [
        IconButton(
          icon: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              shape: BoxShape.circle, 
              color: isDark ? Colors.white.withOpacity(0.1) : Colors.black.withOpacity(0.05)
            ),
            child: Icon(
              isDark ? Icons.wb_sunny : Icons.nightlight_round, 
              color: isDark ? Colors.cyanAccent : Colors.indigo, 
              size: 20
            ),
          ),
          onPressed: () => provider.toggleTheme(),
        ),
        const SizedBox(width: 8),
        Builder(
          builder: (context) => IconButton(
            icon: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                shape: BoxShape.circle, 
                color: isDark ? Colors.white.withOpacity(0.1) : Colors.black.withOpacity(0.05)
              ),
              child: Icon(Icons.grid_view_rounded, color: isDark ? Colors.white : Colors.black87, size: 20),
            ),
            onPressed: () => Scaffold.of(context).openEndDrawer(),
          ),
        ),
        const SizedBox(width: 16),
      ],
    );
  }

  Widget _buildHeaderContent(bool isDark, AppProvider provider) {
    return Container(
      padding: const EdgeInsets.fromLTRB(24, 80, 24, 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
                CircleAvatar(
                  radius: 30,
                  backgroundColor: Colors.blueAccent.withOpacity(0.2),
                  backgroundImage: provider.userProfileImage != null && provider.userProfileImage != ''
                    ? NetworkImage("${ApiService.baseUrl.replaceAll('/api/v1', '')}${provider.userProfileImage}?t=${DateTime.now().millisecondsSinceEpoch}")
                    : null,
                  child: provider.userProfileImage == null || provider.userProfileImage == ''
                    ? Text((provider.userName ?? "C")[0].toUpperCase(), style: const TextStyle(color: Colors.blueAccent, fontWeight: FontWeight.bold, fontSize: 18))
                    : null,
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "Welcome Back,", 
                        style: TextStyle(
                          color: isDark ? Colors.white70 : Colors.black54, 
                          fontSize: 14, 
                          letterSpacing: 0.5
                        )
                      ),
                      const SizedBox(height: 4),
                      Text(
                        provider.userName ?? "Citizen", 
                        style: TextStyle(
                          color: isDark ? Colors.white : Colors.black87, 
                          fontWeight: FontWeight.bold, 
                          fontSize: 20, 
                          letterSpacing: -0.5
                        ),
                        maxLines: 1, 
                        overflow: TextOverflow.ellipsis
                      ),
                    ],
                  ),
                )
            ],
          ),
          const SizedBox(height: 20),
          Container(
             padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
             decoration: BoxDecoration(
               color: isDark ? Colors.blueAccent.withOpacity(0.1) : Colors.blue.withOpacity(0.05),
               borderRadius: BorderRadius.circular(12),
               border: Border.all(color: Colors.blueAccent.withOpacity(0.2)),
             ),
             child: Row(
               mainAxisSize: MainAxisSize.min,
               children: [
                 const Icon(Icons.location_on, color: Colors.blueAccent, size: 16),
                 const SizedBox(width: 8),
                 Text(
                   "Smart City · Connected", 
                   style: TextStyle(color: isDark ? Colors.blueAccent.shade100 : Colors.blueAccent.shade700, fontWeight: FontWeight.w600, fontSize: 12)
                 ),
               ],
             ),
          ),
        ],
      ),
    );
  }

  Widget _buildBody(List<Map<String, dynamic>> services, bool isDark) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final double width = constraints.maxWidth;
        int crossAxisCount = width > 900 ? 4 : (width > 600 ? 3 : 2);
        double aspectRatio = width > 900 ? 1.2 : (width > 600 ? 1.1 : 1.05);

        return GridView.builder(
          padding: const EdgeInsets.fromLTRB(16, 10, 16, 40), 
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: crossAxisCount,
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
            childAspectRatio: aspectRatio, 
          ),
          itemCount: services.length,
          physics: const BouncingScrollPhysics(),
          itemBuilder: (context, i) {
        return AnimatedBuilder(
          animation: _controller,
          builder: (context, child) {
            return Transform.translate(
              offset: Offset(0, 50 * (1 - _controller.value)),
              child: Opacity(
                opacity: _controller.value,
                child: child,
              ),
            );
          },
          child: _buildGlassCard(services[i], isDark),
        );
      },
    );
  }
);
  }

  Widget _buildGlassCard(Map<String, dynamic> item, bool isDark) {
    return GestureDetector(
      onTap: () {
        if (item['page'] != null) {
          Navigator.push(context, MaterialPageRoute(builder: (c) => item['page']));
        }
      },
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: Container(
            decoration: BoxDecoration(
              color: isDark ? Colors.white.withOpacity(0.05) : Colors.white.withOpacity(0.7),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(
                color: isDark ? Colors.white.withOpacity(0.1) : Colors.white,
                width: 1.5
              ),
              boxShadow: [
                 BoxShadow(
                   color: item['color'].withOpacity(isDark ? 0.1 : 0.2), 
                   blurRadius: 20, 
                   spreadRadius: -5,
                   offset: const Offset(0, 10)
                 )
              ]
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: item['color'].withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(item['icon'], color: item['color'], size: 36),
                ),
                const SizedBox(height: 16),
                Text(
                  item['title'],
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: isDark ? Colors.white : Colors.black87,
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildModernDrawer(bool isDark, AppProvider provider) {
    return Container(
      width: 280,
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F172A) : Colors.white,
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 30)],
        border: Border(left: BorderSide(color: isDark ? Colors.white10 : Colors.black12)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 60),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Text(
              "Citizen Menu", 
              style: TextStyle(
                color: isDark ? Colors.white54 : Colors.grey, 
                fontSize: 12, 
                fontWeight: FontWeight.bold, 
                letterSpacing: 1.5
              )
            ),
          ),
          const SizedBox(height: 20),
          if (provider.isLoggedIn) ...[
            _buildDrawerItem(Icons.person_outline, "My Profile", isDark, () {
               Navigator.pop(context);
               Navigator.push(context, MaterialPageRoute(builder: (c) => const UserProfileScreen()));
            }),
            _buildDrawerItem(Icons.settings_outlined, "Settings", isDark, () {
               Navigator.pop(context);
               Navigator.push(context, MaterialPageRoute(builder: (c) => const SettingsScreen()));
            }),
            _buildDrawerItem(Icons.notifications_outlined, "Notifications", isDark, () {
               Navigator.pop(context);
               Navigator.push(context, MaterialPageRoute(builder: (c) => const NotificationsScreen()));
            }),
          ] else ...[
             _buildDrawerItem(Icons.login, "Login / Sign Up", isDark, () {
                Navigator.pop(context);
                Navigator.push(context, MaterialPageRoute(builder: (c) => const LoginScreen()));
             }),
          ],
          
          const Spacer(),
          if (provider.isLoggedIn)
            Padding(
              padding: const EdgeInsets.all(24),
              child: InkWell(
                onTap: () async {
                   await Provider.of<AppProvider>(context, listen: false).logout();
                   if (context.mounted) {
                     Navigator.pushAndRemoveUntil(
                      context,
                      MaterialPageRoute(builder: (c) => const LandingPage()), // ✅ Changed to LandingPage
                      (route) => false,
                     );
                   }
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  decoration: BoxDecoration(
                    color: Colors.redAccent.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.redAccent.withOpacity(0.3)),
                  ),
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.logout_rounded, color: Colors.redAccent, size: 20),
                      SizedBox(width: 8),
                      Text("Logout", style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildDrawerItem(IconData icon, String title, bool isDark, VoidCallback onTap) {
    return ListTile(
      leading: Icon(icon, color: Colors.blueAccent),
      title: Text(title, style: TextStyle(color: isDark ? Colors.white : Colors.black87, fontSize: 15)),
      contentPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 4),
      onTap: onTap,
    );
  }
}
