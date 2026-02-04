import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'dart:ui';
import 'package:urban_flutter/core/api_service.dart';
import '../../core/app_provider.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  List<Map<String, dynamic>> _notifications = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchNotifications();
  }

  Future<void> _fetchNotifications() async {
    try {
      
      final response = await ApiService.getLiveIncidents(hours: 48); 
      if (mounted) {
        setState(() {
          if (response.containsKey('incidents')) {
             
             _notifications = List<Map<String, dynamic>>.from(response['incidents']).map((incident) {
               return {
                 "title": "New Complaint: ${incident['category']}",
                 "body": incident['title'] ?? incident['description'] ?? 'Complaint filed near you.',
                 "time": incident['timestamp'] ?? DateTime.now().toString(),
                 "type": incident['category'] ?? 'general',
                 "isRead": false,
               };
             }).toList();
          }
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Provider.of<AppProvider>(context).isDarkMode;

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: Text("Notifications", style: TextStyle(color: isDark ? Colors.white : Colors.black87, fontWeight: FontWeight.bold)),
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
        actions: [
          IconButton(
            icon: const Icon(Icons.done_all),
            onPressed: () {
              setState(() {
                _notifications.clear();
              });
            },
          )
        ],
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
        child: _isLoading 
          ? Center(child: CircularProgressIndicator(color: isDark ? Colors.white : Colors.blueAccent))
          : _notifications.isEmpty 
            ? _buildEmptyState(isDark)
            : ListView.builder(
              padding: const EdgeInsets.fromLTRB(16, 120, 16, 20),
              itemCount: _notifications.length,
              itemBuilder: (context, index) {
                return _buildNotificationCard(_notifications[index], isDark);
              },
            ),
      ),
    );
  }

  Widget _buildEmptyState(bool isDark) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.notifications_off_outlined, size: 60, color: isDark ? Colors.white30 : Colors.black26),
          const SizedBox(height: 16),
          Text(
            "No New Notifications",
            style: TextStyle(color: isDark ? Colors.white54 : Colors.grey, fontSize: 16),
          ),
        ],
      ),
    );
  }

  Widget _buildNotificationCard(Map<String, dynamic> item, bool isDark) {
    Color iconColor;
    IconData icon;
    
    switch (item['type'].toString().toLowerCase()) {
      case 'water': icon = Icons.water_drop; iconColor = Colors.cyan; break;
      case 'electricity': icon = Icons.bolt; iconColor = Colors.yellow; break;
      case 'garbage': icon = Icons.delete; iconColor = Colors.orange; break;
      case 'health': icon = Icons.local_hospital; iconColor = Colors.red; break;
      default: icon = Icons.info; iconColor = Colors.blue;
    }

    return Dismissible(
      key: Key(item.toString()),
      onDismissed: (d) {},
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isDark ? Colors.white.withOpacity(0.05) : Colors.white.withOpacity(0.7),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: isDark ? Colors.white10 : Colors.white),
                boxShadow: [
                  if (!isDark) BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4))
                ]
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: iconColor.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(icon, color: iconColor, size: 24),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(child: Text(item['title'], style: TextStyle(color: isDark ? Colors.white : Colors.black87, fontWeight: FontWeight.bold, fontSize: 14))),
                            Text(_formatTime(item['time']), style: TextStyle(color: isDark ? Colors.white30 : Colors.grey, fontSize: 10)),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          item['body'],
                          style: TextStyle(color: isDark ? Colors.white70 : Colors.black54, fontSize: 12),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
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

  String _formatTime(String time) {
    try {
      final dt = DateTime.parse(time);
      final diff = DateTime.now().difference(dt);
      if (diff.inMinutes < 60) return "${diff.inMinutes}m ago";
      if (diff.inHours < 24) return "${diff.inHours}h ago";
      return "${diff.inDays}d ago";
    } catch (e) {
      return "Now";
    }
  }
}
