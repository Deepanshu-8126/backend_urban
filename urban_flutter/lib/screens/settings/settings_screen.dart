import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'dart:ui';
import '../../core/app_provider.dart';
import '../../core/api_service.dart'; 

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Provider.of<AppProvider>(context).isDarkMode;
    
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: Text("Settings", style: TextStyle(color: isDark ? Colors.white : Colors.black87, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        iconTheme: IconThemeData(color: isDark ? Colors.white : Colors.black87),
        flexibleSpace: ClipRRect(
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
            child: Container(color: (isDark ? Colors.black : Colors.white).withOpacity(0.5)),
          ),
        ),
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: isDark 
              ? [const Color(0xFF0F172A), const Color(0xFF000000)]
              : [const Color(0xFFF1F5F9), const Color(0xFFFFFFFF)],
          ),
        ),
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 120, 16, 20),
          children: [
            _buildSectionHeader("Apperance", isDark),
            _buildGlassCard(
              context, isDark,
              children: [
                _buildSwitchTile(context, "Dark Mode", Icons.dark_mode, isDark, (val) {
                  Provider.of<AppProvider>(context, listen: false).toggleTheme();
                }),
              ]
            ),
            const SizedBox(height: 24),

            _buildSectionHeader("General", isDark),
            _buildGlassCard(
              context, isDark,
              children: [
                _buildTile("Push Notifications", Icons.notifications_active, isDark, trailing: Switch(
                  value: Provider.of<AppProvider>(context).notificationsEnabled, 
                  onChanged: (v) => Provider.of<AppProvider>(context, listen: false).toggleNotifications(v)
                )),
                _buildDivider(isDark),
                _buildTile("Language", Icons.language, isDark, trailing: Text("English", style: TextStyle(color: isDark?Colors.white70:Colors.black54))),
                _buildDivider(isDark),
                _buildTile("Location Services", Icons.location_on, isDark, trailing: const Text("Always On", style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold))),
              ]
            ),
             const SizedBox(height: 24),

            _buildSectionHeader("Security", isDark),
            _buildGlassCard(
              context, isDark,
              children: [
                _buildTile("Change Password", Icons.lock_outline, isDark, onTap: () => _showChangePasswordDialog(context)),
              ]
            ),

             const SizedBox(height: 24),
            _buildSectionHeader("About", isDark),
             _buildGlassCard(
              context, isDark,
              children: [
                _buildTile("Privacy Policy", Icons.privacy_tip_outlined, isDark, onTap: () => _showTextDialog(context, "Privacy Policy", _privacyPolicyText)),
                _buildDivider(isDark),
                _buildTile("Terms of Service", Icons.description_outlined, isDark, onTap: () => _showTextDialog(context, "Terms of Service", _termsText)),
                _buildDivider(isDark),
                _buildTile("App Version", Icons.info_outline, isDark, trailing: const Text("v1.2.0 (Beta)", style: TextStyle(color: Colors.grey))),
              ]
            ),
          ],
        ),
      ),
    );
  }

  void _showChangePasswordDialog(BuildContext context) {
    final oldController = TextEditingController();
    final newController = TextEditingController();
    bool isLoading = false;

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setState) {
            return AlertDialog(
              title: const Text("Change Password"),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextField(
                    controller: oldController,
                    obscureText: true,
                    decoration: const InputDecoration(labelText: "Old Password"),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: newController,
                    obscureText: true,
                    decoration: const InputDecoration(labelText: "New Password"),
                  ),
                  if (isLoading) const Padding(padding: EdgeInsets.only(top: 10), child: CircularProgressIndicator())
                ],
              ),
              actions: [
                TextButton(onPressed: () => Navigator.pop(context), child: const Text("Cancel")),
                ElevatedButton(
                  onPressed: isLoading ? null : () async {
                    setState(() => isLoading = true);
                    final result = await ApiService.changePassword(oldController.text, newController.text);
                    setState(() => isLoading = false);
                    
                    if (context.mounted) {
                      Navigator.pop(context);
                      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                        content: Text(result['success'] ? "Password Changed Successfully" : result['error'] ?? "Failed"),
                        backgroundColor: result['success'] ? Colors.green : Colors.red,
                      ));
                    }
                  }, 
                  child: const Text("Update")
                ),
              ],
            );
          },
        );
      },
    );
  }

  void _showTextDialog(BuildContext context, String title, String content) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: SingleChildScrollView(child: Text(content)),
        actions: [TextButton(onPressed: () => Navigator.pop(context), child: const Text("Close"))],
      ),
    );
  }

  Widget _buildSectionHeader(String title, bool isDark) {
    return Padding(
      padding: const EdgeInsets.only(left: 8, bottom: 8),
      child: Text(
        title.toUpperCase(),
        style: TextStyle(color: isDark ? Colors.white54 : Colors.grey[700], fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1.2),
      ),
    );
  }

  Widget _buildGlassCard(BuildContext context, bool isDark, {required List<Widget> children}) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(20),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Container(
          decoration: BoxDecoration(
            color: isDark ? Colors.white.withOpacity(0.05) : Colors.white.withOpacity(0.6),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: isDark ? Colors.white10 : Colors.white),
            boxShadow: [
              if (!isDark) BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4))
            ]
          ),
          child: Column(children: children),
        ),
      ),
    );
  }

  Widget _buildTile(String title, IconData icon, bool isDark, {Widget? trailing, VoidCallback? onTap}) {
    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: isDark ? Colors.white10 : Colors.blue.withOpacity(0.1),
          shape: BoxShape.circle,
        ),
        child: Icon(icon, color: isDark ? Colors.white : Colors.blueAccent, size: 20),
      ),
      title: Text(title, style: TextStyle(color: isDark ? Colors.white : Colors.black87, fontWeight: FontWeight.w500)),
      trailing: trailing ?? Icon(Icons.arrow_forward_ios, size: 14, color: isDark ? Colors.white30 : Colors.black26),
      onTap: onTap,
    );
  }

  Widget _buildSwitchTile(BuildContext context, String title, IconData icon, bool isDark, Function(bool) onChanged) {
    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: isDark ? Colors.white10 : Colors.orange.withOpacity(0.1),
          shape: BoxShape.circle,
        ),
        child: Icon(icon, color: isDark ? Colors.orangeAccent : Colors.orange, size: 20),
      ),
      title: Text(title, style: TextStyle(color: isDark ? Colors.white : Colors.black87, fontWeight: FontWeight.w500)),
      trailing: Switch(
        value: isDark,
        onChanged: onChanged,
        activeThumbColor: Colors.blueAccent,
      ),
    );
  }

  Widget _buildDivider(bool isDark) {
    return Divider(height: 1, indent: 60, color: isDark ? Colors.white10 : Colors.black.withOpacity(0.05));
  }
}

const String _privacyPolicyText = """
Privacy Policy

1. Introduction
Welcome to Urban OS. We value your privacy and are committed to protecting your personal data.

2. Data Collection
We collect personal information such as name, email, and location data to provide smart city services.

3. Data Usage
Your data is used to improve city services, send notifications, and ensure safety via SOS features.

4. Data Security
We implement robust security measures to protect your data from unauthorized access.

5. Contact Us
For any privacy concerns, please contact our support team.
""";

const String _termsText = """
Terms of Service

1. Acceptance of Terms
By using Urban OS, you agree to these Terms of Service.

2. User Responsibilities
You are responsible for maintaining the confidentiality of your account credentials.

3. Prohibited Activities
You agree not to misuse the app or engage in unlawful activities.

4. Service Availability
We strive to provide 24/7 service but do not guarantee uninterrupted access.

5. Changes to Terms
We verify the right to modify these terms at any time.
""";
