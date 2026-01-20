import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

// --- Core Imports ---
import 'core/app_provider.dart';
import 'core/voice_service.dart'; // ✅ Make sure this file exists

// --- Dashboard Import ---
import 'screens/dashboard/admin_war_room.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AppProvider()),
        // ✅ Agar VoiceService error de raha hai toh check karein ki
        // class 'ChangeNotifier' ko extend kar rahi hai ya nahi.
        // ChangeNotifierProvider(create: (_) => VoiceService()),
      ],
      child: const UrbanApp(),
    ),
  );
}

class UrbanApp extends StatelessWidget {
  const UrbanApp({super.key});

  @override
  Widget build(BuildContext context) {
    // Provider se current theme uthana
    final appState = Provider.of<AppProvider>(context);

    return MaterialApp(
      title: 'Urban Super System',
      debugShowCheckedModeBanner: false,
      theme: appState.isDarkMode
          ? ThemeData.dark().copyWith(
        primaryColor: Colors.blueAccent,
        scaffoldBackgroundColor: const Color(0xFF121212),
      )
          : ThemeData.light().copyWith(
        primaryColor: Colors.blue,
      ),
      home: const AdminWarRoom(),
    );
  }
}