import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/app_provider.dart';
import 'core/providers/city_monitor_provider.dart';
import 'screens/splash_screen.dart'; 

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AppProvider()..checkLoginStatus()),
        ChangeNotifierProvider(create: (_) => CityMonitorProvider()),
      ],
      child: const UrbanOS(),
    ),
  );
}

class UrbanOS extends StatelessWidget {
  const UrbanOS({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AppProvider>(
      builder: (context, provider, child) {
        return MaterialApp(
          debugShowCheckedModeBanner: false,
          title: 'Urban OS',
          themeMode: provider.isDarkMode ? ThemeMode.dark : ThemeMode.light,
          theme: ThemeData(
            primarySwatch: Colors.blue,
            brightness: Brightness.light,
            useMaterial3: true,
            scaffoldBackgroundColor: Colors.grey[100],
          ),
          darkTheme: ThemeData(
            brightness: Brightness.dark,
            useMaterial3: true,
            primarySwatch: Colors.blue,
          ),
          
          home: const SplashScreen(),
        );
      },
    );
  }
}