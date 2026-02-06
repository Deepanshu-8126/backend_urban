import 'package:flutter/material.dart';
import '../../core/api_service.dart';
import 'package:provider/provider.dart';
import '../../core/app_provider.dart';
import '../../core/socket_service.dart';
import 'dart:async';

class NotificationScreen extends StatefulWidget {
  const NotificationScreen({super.key});

  @override
  State<NotificationScreen> createState() => _NotificationScreenState();
}

class _NotificationScreenState extends State<NotificationScreen> {
  List<dynamic> notifications = [];
  bool isLoading = true;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _fetchNotifications();
    
    // ✅ Socket Listener for Real-Time UI Refresh
    SocketService.setNotificationListener((data) {
      if (mounted) _fetchNotifications(silent: true);
    });

    // ✅ Legacy Polling (as fallback) 
    _timer = Timer.periodic(const Duration(seconds: 30), (timer) {
      if (mounted) _fetchNotifications(silent: true);
    });
  }

  @override
  void dispose() {
    SocketService.removeNotificationListener();
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _fetchNotifications({bool silent = false}) async {
    if (!silent) setState(() => isLoading = true);
    final data = await ApiService.getNotifications();
    if (mounted) {
      setState(() {
        notifications = data['notifications'] ?? [];
        if (!silent) isLoading = false;
      });
    }
  }

  Future<void> _markAsRead(String id) async {
    await ApiService.markNotificationRead(id);
    _fetchNotifications(silent: true);
  }

  Future<void> _markAllRead() async {
    await ApiService.markAllNotificationsRead();
    _fetchNotifications(silent: true);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Notifications"),
        actions: [
          IconButton(
            icon: const Icon(Icons.done_all),
            onPressed: _markAllRead,
            tooltip: "Mark all as read",
          )
        ],
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : notifications.isEmpty
              ? const Center(child: Text("No notifications yet."))
              : ListView.builder(
                  itemCount: notifications.length,
                  itemBuilder: (context, index) {
                    final notif = notifications[index];
                    final bool isRead = notif['read'] ?? false;
                    
                    return Card(
                      color: isRead ? null : Colors.blue.withOpacity(0.1),
                      margin: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      child: ListTile(
                        leading: Icon(
                          Icons.notifications,
                          color: isRead ? Colors.grey : Colors.blue,
                        ),
                        title: Text(
                          notif['title'] ?? 'Notification',
                          style: TextStyle(
                            fontWeight: isRead ? FontWeight.normal : FontWeight.bold,
                          ),
                        ),
                        subtitle: Text(notif['message'] ?? ''),
                        trailing: Text(
                          _formatDate(notif['createdAt']),
                          style: const TextStyle(fontSize: 12, color: Colors.grey),
                        ),
                        onTap: () => _markAsRead(notif['_id']),
                      ),
                    );
                  },
                ),
    );
  }

  String _formatDate(String? dateStr) {
    if (dateStr == null) return '';
    final date = DateTime.parse(dateStr).toLocal();
    return "${date.hour}:${date.minute.toString().padLeft(2, '0')}";
  }
}
