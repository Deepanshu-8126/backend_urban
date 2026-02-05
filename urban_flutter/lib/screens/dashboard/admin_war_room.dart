import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'dart:io'; 
import 'dart:ui'; 
import '../../core/app_provider.dart';
import 'package:urban_flutter/core/api_service.dart';

import '../disaster/citizen_sos_screen.dart';
import '../health/aqi_monitor_screen.dart';
import '../property/tax_calculator_screen.dart';
import '../revenue/budget_tracker_screen.dart';
import '../ChatBot/chat_bot_screen.dart';
import '../complaints/heatmap_screen.dart';
import '../complaints/grievance_map_screen.dart';
import '../complaints/admin_view.dart';
import '../auth/login_screen.dart';
import '../profile/user_profile_screen.dart';
import '../settings/settings_screen.dart'; 
import '../notifications/notifications_screen.dart';
import '../admin/city_monitor/city_monitor_screen.dart'; 
import '../intelligence/intelligence_dashboard.dart'; 
import '../landing_page.dart';
import '../admin/traffic_control_screen.dart';
import '../admin/traffic_control_screen.dart';
import '../development/development_tracker_screen.dart'; // NEW

class AdminWarRoom extends StatefulWidget {
  const AdminWarRoom({super.key});
  @override
  State<AdminWarRoom> createState() => _AdminWarRoomState();
}

class _AdminWarRoomState extends State<AdminWarRoom> with SingleTickerProviderStateMixin {
  String selectedCategory = "All";
  String searchQuery = "";
  late AnimationController _controller;
  final List<String> categories = ["All", "Complaints", "Admin", "Disaster", "Property", "AI"];
  DateTime? currentBackPressTime;
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(milliseconds: 1000));
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  final List<Map<String, dynamic>> allFeatures = [
    
    {"title": "Complaints Hub", "cat": "Complaints", "icon": Icons.campaign, "color": Colors.indigoAccent, "page": const AdminView()},
    {"title": "Grievance Map", "cat": "Complaints", "icon": Icons.map, "color": Colors.blue, "page": const GrievanceMapScreen()},
    {"title": "Live Heatmap", "cat": "Complaints", "icon": Icons.blur_on, "color": Colors.orangeAccent, "page": const HeatmapScreen()},
    {"title": "AQI Monitor", "cat": "Admin", "icon": Icons.air, "color": Colors.teal, "page": const AqiMonitorScreen()},
    {"title": "SOS Controller", "cat": "Disaster", "icon": Icons.emergency_share, "color": Colors.redAccent, "page": const CitizenSOSScreen()},
    {"title": "Budget Tracker", "cat": "Property", "icon": Icons.account_balance_wallet, "color": Colors.blueGrey, "page": const BudgetTrackerScreen()},
    {"title": "Development Tracker", "cat": "Admin", "icon": Icons.construction, "color": Colors.orange, "page": const DevelopmentTrackerScreen()}, // NEW
    {"title": "Property Tax", "cat": "Property", "icon": Icons.payments, "color": Colors.green, "page": const TaxCalculatorScreen()},
    {"title": "Traffic Command", "cat": "Admin", "icon": Icons.traffic, "color": Colors.redAccent, "page": const TrafficControlScreen()},
    {"title": "City Intelligence", "cat": "AI", "icon": Icons.psychology_outlined, "color": Colors.purple, "page": const IntelligenceDashboardScreen()}, 
    {"title": "CityBrain AI", "cat": "AI", "icon": Icons.psychology, "color": Colors.deepPurpleAccent, "page": const CityBrainBot()},
  ];

  @override
  Widget build(BuildContext context) {
    final isDark = Provider.of<AppProvider>(context).isDarkMode;

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
                _buildSliverAppBar(innerBoxIsScrolled, isDark),
              ],
              body: _buildBody(isDark),
            ),
          ),
        ),
        endDrawer: _buildModernDrawer(isDark),
      ),
    );
  }

  Widget _buildSliverAppBar(bool innerBoxIsScrolled, bool isDark) {
    return SliverAppBar(
      expandedHeight: 280.0, 
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
              child: Text("Command Center", 
                style: TextStyle(
                  color: isDark ? Colors.white : Colors.black87, 
                  fontSize: 18, 
                  fontWeight: FontWeight.bold
                )
              ),
            ),
            background: _buildHeaderContent(isDark),
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
          onPressed: () => Provider.of<AppProvider>(context, listen: false).toggleTheme(),
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

  Widget _buildHeaderContent(bool isDark) {
    return Container(
      padding: const EdgeInsets.fromLTRB(24, 80, 24, 20), 
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.blue.withOpacity(0.2), Colors.transparent],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
                   Consumer<AppProvider>(
                    builder: (context, provider, _) {
                      ImageProvider? backgroundImage;
                      if (provider.userProfileImage != null && provider.userProfileImage!.isNotEmpty) {
                        if (provider.userProfileImage!.contains('http')) {
                           backgroundImage = NetworkImage(provider.userProfileImage!);
                        } else if (provider.userProfileImage!.contains('/') || provider.userProfileImage!.contains('\\')) {
                           
                           backgroundImage = FileImage(File(provider.userProfileImage!));
                        } else {
                           
                           backgroundImage = NetworkImage("${ApiService.baseUrl.replaceAll('/api/v1', '')}${provider.userProfileImage}?t=${DateTime.now().millisecondsSinceEpoch}");
                        }
                      }

                      return Row(
                        children: [
                           CircleAvatar(
                             radius: 26,
                             backgroundColor: Colors.blueAccent.withOpacity(0.2),
                             backgroundImage: backgroundImage,
                             child: backgroundImage == null
                               ? Text(
                                   (provider.userName ?? "A")[0].toUpperCase(), 
                                   style: const TextStyle(color: Colors.blueAccent, fontWeight: FontWeight.bold, fontSize: 16)
                                 )
                               : null,
                           ),
                   const SizedBox(width: 14),
                   Expanded(
                     child: Column(
                       crossAxisAlignment: CrossAxisAlignment.start,
                       children: [
                         Text(
                          "Welcome Admin,", 
                          style: TextStyle(
                            color: isDark ? Colors.white70 : Colors.black54, 
                            fontSize: 14, 
                            letterSpacing: 1.0
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                         Text(
                          provider.userName ?? "City Controller", 
                          style: TextStyle(
                            color: isDark ? Colors.white : Colors.black87, 
                            fontWeight: FontWeight.bold, 
                            fontSize: 20,
                            letterSpacing: -0.5
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                       ],
                     ),
                   )
                ],
              );
            },
          ),
          const SizedBox(height: 24),
          
          ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
              child: Container(
                height: 52,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  color: isDark ? Colors.white.withOpacity(0.08) : Colors.white.withOpacity(0.6),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: isDark ? Colors.white.withOpacity(0.1) : Colors.black.withOpacity(0.05)
                  ),
                  boxShadow: [
                    if (!isDark) const BoxShadow(color: Colors.black12, blurRadius: 10, offset: Offset(0, 4))
                  ]
                ),
                child: TextField(
                  onChanged: (v) => setState(() => searchQuery = v),
                  style: TextStyle(color: isDark ? Colors.white : Colors.black87),
                  cursorColor: Colors.blueAccent,
                  decoration: InputDecoration(
                    hintText: "Search System Modules...",
                    hintStyle: TextStyle(
                      color: isDark ? Colors.white.withOpacity(0.4) : Colors.black38
                    ),
                    icon: Icon(Icons.search, color: isDark ? Colors.white.withOpacity(0.4) : Colors.black38),
                    border: InputBorder.none,
                    contentPadding: const EdgeInsets.symmetric(vertical: 14), 
                  ),
                ),
              ),
            ),
          )
        ],
      ),
    );
  }

  Widget _buildBody(bool isDark) {
    final filtered = allFeatures.where((f) {
      bool matchesCat = selectedCategory == "All" || f['cat'] == selectedCategory;
      bool matchesSearch = f['title'].toLowerCase().contains(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    }).toList();

    return Column(
      children: [
        
        Container(
          height: 60,
          margin: const EdgeInsets.only(bottom: 10),
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: categories.length,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            physics: const BouncingScrollPhysics(),
            itemBuilder: (ctx, i) {
               bool isSelected = selectedCategory == categories[i];
               return AnimatedContainer(
                 duration: const Duration(milliseconds: 200),
                 margin: const EdgeInsets.only(right: 12),
                 child: FilterChip(
                   label: Text(categories[i]),
                   selected: isSelected,
                   onSelected: (bool selected) => setState(() => selectedCategory = categories[i]),
                   backgroundColor: isDark ? Colors.white.withOpacity(0.05) : Colors.white,
                   selectedColor: Colors.blueAccent,
                   checkmarkColor: Colors.white,
                   elevation: isSelected ? 4 : 0,
                   shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: BorderSide.none),
                   labelStyle: TextStyle(
                     color: isSelected ? Colors.white : (isDark ? Colors.white60 : Colors.black54),
                     fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                     fontSize: 13
                   ),
                   padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                 ),
               );
            },
          ),
        ),

        
        Expanded(
          child: filtered.isEmpty 
          ? Center(child: Text("No modules found", style: TextStyle(color: isDark ? Colors.white54 : Colors.black45)))
          : LayoutBuilder(
              builder: (context, constraints) {
                final double width = constraints.maxWidth;
                int crossAxisCount = width > 900 ? 4 : (width > 600 ? 3 : 2);
                double aspectRatio = width > 900 ? 1.25 : (width > 600 ? 1.15 : 1.1);
                
                return GridView.builder(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 40),
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: crossAxisCount, 
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                    childAspectRatio: aspectRatio,
                  ),
                  itemCount: filtered.length,
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
                child: _buildGlassCard(filtered[i], isDark),
              );
            },
          );
        }
      ),
    ),
      ],
    );
  }

  Widget _buildGlassCard(Map<String, dynamic> item, bool isDark) {
    return GestureDetector(
      onTap: () {
        if (item['page'] != null) {
          Navigator.push(context, MaterialPageRoute(builder: (c) => item['page']));
        } else {
          _showPlaceholder(context, item['title']);
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
                    fontSize: 16,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                 Text(
                  item['cat'].toString().toUpperCase(),
                  style: TextStyle(
                    color: isDark ? Colors.white38 : Colors.grey,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.2
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildModernDrawer(bool isDark) {
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
              "System Menu", 
              style: TextStyle(
                color: isDark ? Colors.white54 : Colors.grey, 
                fontSize: 12, 
                fontWeight: FontWeight.bold, 
                letterSpacing: 1.5
              )
            ),
          ),
          const SizedBox(height: 20),
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
          const Spacer(),
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
                    Text("Secure Logout", style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold)),
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

  void _showPlaceholder(BuildContext context, String title) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("$title: Module ready in next update!")));
  }
}
