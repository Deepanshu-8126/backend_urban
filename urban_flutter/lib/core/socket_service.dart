import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/foundation.dart';
import 'api_service.dart';
import 'local_notification_service.dart';

class SocketService {
  static IO.Socket? _socket;
  static bool _isInitialized = false;

  static void init() async {
    if (_isInitialized) return;

    final prefs = await SharedPreferences.getInstance();
    final String? token = prefs.getString('token');
    final String? userId = prefs.getString('userId');
    final bool isAdmin = prefs.getBool('isAdmin') ?? false;

    if (token == null) return;

    // Use baseUrl from ApiService but strip /api/v1
    String socketUrl = ApiService.baseUrl.replaceAll('/api/v1', '');
    
    debugPrint('🔌 Connecting to Socket: $socketUrl');

    _socket = IO.io(socketUrl, IO.OptionBuilder()
      .setTransports(['websocket'])
      .setAuth({'token': token})
      .enableAutoConnect()
      .build());

    _socket!.onConnect((_) {
      debugPrint('✅ Socket Connected');
      
      final String? department = prefs.getString('department');

      _socket!.emit('join', {
        'userId': userId,
        'department': isAdmin ? department : null
      });
      
      if (isAdmin) {
        debugPrint('💼 Joining Admin Room: $department');
      }
    });

    _socket!.on('notification', (data) {
      debugPrint('🔔 New Notification Received: $data');
      LocalNotificationService.showNotification(
        title: data['title'] ?? 'Smart City Update',
        body: data['message'] ?? '',
      );
      
      // ✅ Trigger Global Refresh if listener exists
      if (_onNotificationReceived != null) {
        _onNotificationReceived!(data);
      }
    });

    _socket!.onDisconnect((_) => debugPrint('❌ Socket Disconnected'));
    _socket!.onConnectError((err) => debugPrint('⚠️ Socket Connection Error: $err'));

    _isInitialized = true;
  }

  static Function(dynamic)? _onNotificationReceived;
  static void setNotificationListener(Function(dynamic) listener) {
    _onNotificationReceived = listener;
  }
  static void removeNotificationListener() {
    _onNotificationReceived = null;
  }

  static void disconnect() {
    _socket?.disconnect();
    _socket = null;
    _isInitialized = false;
  }
}
