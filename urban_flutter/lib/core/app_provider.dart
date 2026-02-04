import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'api_service.dart'; 

class AppProvider extends ChangeNotifier {
  bool _isLoading = false;
  bool _isLoggedIn = false;
  bool _isAdmin = false;
  
  
  String? _userName;
  String? _userEmail;
  String? _userProfileImage;
  String? _token;

  
  bool _isDarkMode = false;

  bool get isLoading => _isLoading;
  bool get isLoggedIn => _isLoggedIn;
  bool get isAdmin => _isAdmin;
  bool get isDarkMode => _isDarkMode;
  String? get userName => _userName;
  String? get userEmail => _userEmail;
  String? get userProfileImage => _userProfileImage;
  String? get token => _token;
  String? get userDepartment => _userDepartment;
  
  String? _userDepartment;

  void toggleTheme() async {
    _isDarkMode = !_isDarkMode;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('isDarkMode', _isDarkMode);
    notifyListeners();
  }

  
  bool _notificationsEnabled = true;
  bool get notificationsEnabled => _notificationsEnabled;

  void toggleNotifications(bool value) async {
    _notificationsEnabled = value;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('notificationsEnabled', _notificationsEnabled);
    notifyListeners();
  }

  
  Future<void> checkLoginStatus() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('token');
    _isLoggedIn = prefs.getBool('isLoggedIn') ?? false;
    _isAdmin = prefs.getBool('isAdmin') ?? false;
    _isDarkMode = prefs.getBool('isDarkMode') ?? false;
    _notificationsEnabled = prefs.getBool('notificationsEnabled') ?? true;
    
    
    _userProfileImage = prefs.getString('profilePicturePath');
    
    if (_isLoggedIn) {
      _userName = prefs.getString('name');
      _userEmail = prefs.getString('email');
      _userDepartment = prefs.getString('department');
      
      
      _userProfileImage ??= prefs.getString('profilePicture');
      
      debugPrint("🔍 AppProvider Loaded: Name=$_userName, Email=$_userEmail, Pic=$_userProfileImage");
    } else {
      debugPrint("⚠️ AppProvider: User NOT logged in, but profile pic persists: $_userProfileImage");
    }
    notifyListeners();
  }

  
  Future<bool> updateUserProfile(String name, dynamic imageFile) async {
    _isLoading = true;
    notifyListeners();

    final success = await ApiService.updateProfile(name, imageFile);
    
    if (success) {
      final prefs = await SharedPreferences.getInstance();
      _userName = prefs.getString('name');
      _userProfileImage = prefs.getString('profilePicture');
      
      
      if (imageFile != null) {
        String localPath = imageFile is String ? imageFile : imageFile.path;
        await prefs.setString('profilePicturePath', localPath);
        _userProfileImage = localPath;
        debugPrint("💾 Saved profile picture path: $localPath");
      }
      
      _isLoading = false;
      notifyListeners();
      return true;
    }
    
    _isLoading = false;
    notifyListeners();
    return false;
  }

  void setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  
  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    
    
    await prefs.remove('token');
    await prefs.remove('isLoggedIn');
    await prefs.remove('isAdmin');
    await prefs.remove('name');
    await prefs.remove('email');
    await prefs.remove('profilePicture');
    await prefs.remove('department');
    
    
    
    _isLoggedIn = false;
    _isAdmin = false;
    _token = null;
    _userName = null;
    _userEmail = null;
    _userDepartment = null;
    
    notifyListeners();
  }
}
