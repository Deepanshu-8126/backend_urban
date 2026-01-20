import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AppProvider extends ChangeNotifier {
  bool _isLoading = false;
  bool _isLoggedIn = false;
  bool _isAdmin = false;
  
  // User Data
  String? _userName;
  String? _userEmail;
  String? _token;

  bool get isLoading => _isLoading;
  bool get isLoggedIn => _isLoggedIn;
  bool get isAdmin => _isAdmin;
  String? get userName => _userName;
  String? get userEmail => _userEmail;

  // 🔄 App Start hone pe check karo
  Future<void> checkLoginStatus() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('token');
    _isLoggedIn = prefs.getBool('isLoggedIn') ?? false;
    _isAdmin = prefs.getBool('isAdmin') ?? false;
    
    if (_isLoggedIn) {
      _userName = prefs.getString('name');
      _userEmail = prefs.getString('email');
    }
    notifyListeners();
  }

  void setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  // 🚪 Logout
  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear(); // Sab udda do
    _isLoggedIn = false;
    _isAdmin = false;
    _token = null;
    _userName = null;
    notifyListeners();
  }
}