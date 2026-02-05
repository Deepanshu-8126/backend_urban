import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show defaultTargetPlatform, TargetPlatform, kIsWeb;
import 'package:image_picker/image_picker.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:http_parser/http_parser.dart'; 

class ApiService {
  
  // 🔧 TOGGLE THIS FOR PRODUCTION vs DEVELOPMENT
  // Set to false: Uses local backend (192.168.1.18:3000)
  // Set to true: Uses Render backend (for APK builds)
  static const bool IS_PRODUCTION = true; // ✅ SET TO TRUE FOR APK BUILD
  
  static final String baseUrl = _computeBaseUrl(); 

  static String _computeBaseUrl() {
    // Production Render URL
    const String renderUrl = "https://urban-backend-28dc.onrender.com/api/v1";
    
    // Local development URLs
    const String localUrl = "http://localhost:3000/api/v1";
    const String localNetworkUrl = "http://192.168.1.18:3000/api/v1";
    
    // Use production URL if IS_PRODUCTION is true
    if (IS_PRODUCTION) {
      return renderUrl;
    }
    
    // Otherwise use local URLs based on platform
    if (kIsWeb) {
      return localUrl;
    }

    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
      case TargetPlatform.iOS:
        return localNetworkUrl;
      default:
        return localUrl;
    }
  }

  

  static Future<Map<String, dynamic>> getCityOverview() async {
    return _authenticatedGet('/analytics/city-overview');
  }

  static Future<Map<String, dynamic>> getCityTrends(String range) async {
    return _authenticatedGet('/analytics/trends?range=$range');
  }

  static Future<Map<String, dynamic>> getDepartmentAnalytics() async {
    return _authenticatedGet('/analytics/departments');
  }

  static Future<Map<String, dynamic>> getAreaAnalytics() async {
    return _authenticatedGet('/analytics/areas');
  }

  static Future<Map<String, dynamic>> getLiveIncidentsMap(String range) async {
    return _authenticatedGet('/analytics/live-incidents');
  }

  
  static Future<Map<String, dynamic>> _authenticatedGet(String endpoint) async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');
      
      final response = await http.get(
        Uri.parse('$baseUrl$endpoint'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return {'success': false, 'error': 'Status ${response.statusCode}'};
    } catch (e) {
      debugPrint("API Error [$endpoint]: $e");
      return {'success': false, 'error': e.toString()};
    }
  }

  
  static Future<Map<String, dynamic>> getCityRealTimeStats({String timeRange = '24h', double? lat, double? lng}) async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');
      if (token == null) return {'success': false};

      final response = await http.get(
        Uri.parse('$baseUrl/admin/analytics/city-stats?timeRange=$timeRange&lat=$lat&lng=$lng'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return {'success': false};
    } catch (e) {
      debugPrint('City Stats Error: $e');
      return {'success': false, 'error': e.toString()};
    }
  }

  static Future<String?> login(String email, String password, {String role = 'citizen'}) async {
    try {
      
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password, 'role': role}),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        final prefs = await SharedPreferences.getInstance();
        
        await prefs.setString('token', data['token']);
        await prefs.setBool('isLoggedIn', true);
        
        final userType = data['user']['userType'] ?? 'citizen';
        final userRole = data['user']['role'] ?? 'citizen';
        
        await prefs.setBool('isAdmin', userType == 'admin' || userRole.contains('admin'));
        await prefs.setString('userId', data['user']['id'] ?? data['user']['_id'] ?? ''); // ✅ Added userId persistence
        await prefs.setString('name', data['user']['name']); 
        await prefs.setString('email', data['user']['email']); 
        await prefs.setString('role', userRole);
        
        if (data['user']['department'] != null) {
          await prefs.setString('department', data['user']['department']);
        }
        
        if (data['user']['profilePicture'] != null && data['user']['profilePicture'].toString().isNotEmpty) {
          await prefs.setString('profilePicture', data['user']['profilePicture']); 
        } else {
           await prefs.remove('profilePicture');
        }
        
        return null; 
      }
      return data['error'] ?? 'Login failed';
    } catch (e) {
      debugPrint("Login Error: $e");
      return "Network error: $e";
    }
  }

  static Future<Map<String, dynamic>> signup(String name, String email, String password) async {
    try {
      
      final otpResponse = await http.post(
        Uri.parse('$baseUrl/auth/signup'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'name': name, 'email': email, 'password': password}),
      );
      
      final data = jsonDecode(otpResponse.body);

      
      if (otpResponse.statusCode == 200) {
        return {'success': true};
      }
      
      
      return {
        'success': false, 
        'error': data['error'] ?? 'Registration failed'
      };

    } catch (e) {
      debugPrint("Register Error: $e");
      return {'success': false, 'error': 'Network connection error'};
    }
  }

  static Future<bool> verifyOtp(String email, String otp, {String? name, String? password, String role = 'citizen', String? department}) async {
    try {
      final body = {
        'email': email,
        'otp': otp,
        'role': role,
        if (name != null) 'name': name,
        if (password != null) 'password': password,
        if (department != null) 'department': department,
      };

      final response = await http.post(
        Uri.parse('$baseUrl/auth/verify-otp'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(body),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        SharedPreferences prefs = await SharedPreferences.getInstance();
        
        await prefs.setString('token', data['token']);
        await prefs.setBool('isLoggedIn', true);
        
        final userType = data['user']['userType'] ?? 'citizen';
        final userRole = data['user']['role'] ?? 'citizen';
        
        await prefs.setBool('isAdmin', userType == 'admin' || userRole.contains('admin'));
        await prefs.setString('userId', data['user']['id']);
        await prefs.setString('name', data['user']['name']);
        await prefs.setString('email', data['user']['email']);
        await prefs.setString('role', userRole);
        
        if (data['user']['department'] != null) {
          await prefs.setString('department', data['user']['department']);
        }
        
        return true;
      }
      return false;
    } catch (e) {
      debugPrint("Verify OTP Error: $e");
      return false;
    }
  }

  static Future<Map<String, dynamic>> createAdmin({
    required String name, 
    required String email, 
    required String password, 
    required String department
  }) async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');

      if (token == null) {
        return {'success': false, 'error': 'Not authorized. Admin login required.'};
      }

      final response = await http.post(
        Uri.parse('$baseUrl/admin/officers'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'name': name,
          'email': email,
          'password': password,
          'department': department,
        }),
      );

      final Map<String, dynamic> data = jsonDecode(response.body);
      
      if (response.statusCode == 201) {
        return {'success': true, 'admin': data['admin']};
      } else {
        return {'success': false, 'error': data['error'] ?? 'Admin creation failed'};
      }
    } catch (e) {
      debugPrint("Create Admin Error: $e");
      return {'success': false, 'error': 'Network error creating admin'};
    }
  }

  static Future<bool> forgotPassword(String email) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/forgot-password'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email}),
      );
      
      return response.statusCode == 200;
    } catch (e) {
      debugPrint("Forgot Password Error: $e");
      return false;
    }
  }

  static Future<bool> resetPassword(String email, String otp, String newPassword) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/reset-password'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'otp': otp,
          'newPassword': newPassword
        }),
      );
      
      return response.statusCode == 200;
    } catch (e) {
      debugPrint("Reset Password Error: $e");
      return false;
    }
  }

  static Future<Map<String, dynamic>> changePassword(String oldPassword, String newPassword) async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');

      if (token == null) return {'success': false, 'error': 'Not logged in'};

      final response = await http.post(
        Uri.parse('$baseUrl/auth/change-password'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'oldPassword': oldPassword,
          'newPassword': newPassword
        }),
      );
      
      return jsonDecode(response.body);
    } catch (e) {
      debugPrint("Change Password Error: $e");
      return {'success': false, 'error': 'Network error'};
    }
  }

  static Future<void> logout() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }

  static Future<String?> createComplaint({
    required String title,
    required String description,
    required double lat,
    required double lng,
    String? address, 
    List<XFile>? imageFiles, 
    XFile? audioFile,
    XFile? videoFile,
    String category = 'other',
    String? subType 
  }) async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');
      String? userId = prefs.getString('userId');
      String? userName = prefs.getString('name');

      var request = http.MultipartRequest('POST', Uri.parse('$baseUrl/complaints'));
      request.headers['Authorization'] = 'Bearer $token';

      request.fields['title'] = title;
      request.fields['description'] = description;
      request.fields['location'] = jsonEncode({
        'coordinates': [lng, lat],
        'address': address ?? ''
      }); 
      request.fields['userId'] = userId ?? '';
      request.fields['userName'] = userName ?? 'Anonymous';
      request.fields['category'] = category;
      if (subType != null) request.fields['subType'] = subType; 
      
      
      if (imageFiles != null) {
        for (var image in imageFiles) {
          if (kIsWeb) {
              request.files.add(http.MultipartFile.fromBytes(
                  'images', 
                  await image.readAsBytes(),
                  filename: image.name,
                  contentType: MediaType('image', 'jpeg'),
              ));
          } else {
              request.files.add(await http.MultipartFile.fromPath(
                'images', 
                image.path,
                contentType: MediaType('image', 'jpeg'),
              ));
          }
        }
      }

      
      if (audioFile != null) {
        if (kIsWeb) {
            request.files.add(http.MultipartFile.fromBytes(
                'audio',
                await audioFile.readAsBytes(),
                filename: audioFile.name,
                contentType: MediaType('audio', 'mpeg'),
            ));
        } else {
            request.files.add(await http.MultipartFile.fromPath(
              'audio', 
              audioFile.path,
              contentType: MediaType('audio', 'mpeg'),
            ));
        }
      }

      
      if (videoFile != null) {
        if (kIsWeb) {
            request.files.add(http.MultipartFile.fromBytes(
                'video',
                await videoFile.readAsBytes(),
                filename: videoFile.name,
                contentType: MediaType('video', 'mp4'),
            ));
        } else {
            request.files.add(await http.MultipartFile.fromPath(
              'video', 
              videoFile.path,
              contentType: MediaType('video', 'mp4'),
            ));
        }
      }

      final response = await request.send();
      final respStr = await response.stream.bytesToString();

      if (response.statusCode == 201) {
        return null; 
      } else {
        return "Failed: $respStr";
      }
    } catch (e) {
      return "Error: $e";
    }
  }

  static Future<bool> updateComplaintStatus(String id, String status) async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');
      
      
      if (token == null) {
        debugPrint("Update Status Failed: No Token");
        return false;
      }

      final response = await http.patch(
        Uri.parse('$baseUrl/complaints/update-status/$id'), 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({'status': status}),
      );
      
      debugPrint("Update Response: ${response.statusCode} - ${response.body}");

      return response.statusCode == 200;
    } catch (e) {
      debugPrint("Update Status Error: $e");
      return false;
    }
  }

  static Future<bool> deleteComplaint(String id) async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');
      
      if (token == null) return false;

      final response = await http.delete(
        Uri.parse('$baseUrl/complaints/permanent/$id'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      return response.statusCode == 200;
    } catch (e) {
      debugPrint("Delete Complaint Error: $e");
      return false;
    }
  }

  static Future<bool> deleteUserComplaint(String id) async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');
      
      if (token == null) return false;

      final response = await http.delete(
        Uri.parse('$baseUrl/complaints/$id'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      return response.statusCode == 200;
    } catch (e) {
      debugPrint("Delete User Complaint Error: $e");
      return false;
    }
  }

  static Future<List<dynamic>> fetchComplaints() async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');
      
      final response = await http.get(
        Uri.parse('$baseUrl/complaints/my'), 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['complaints'] ?? [];
      }
      return [];
    } catch (e) {
      debugPrint("Fetch Complaints Error: $e");
      return [];
    }
  }

  

  static Future<Map<String, dynamic>?> getProfile() async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');
      
      final response = await http.get(
        Uri.parse('$baseUrl/auth/profile'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body)['user'];
      }
      return null;
    } catch (e) {
      debugPrint("Get Profile Error: $e");
      return null;
    }
  }

  static Future<bool> updateProfile(String name, XFile? imageFile) async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');

      var request = http.MultipartRequest('PUT', Uri.parse('$baseUrl/auth/profile'));
      request.headers['Authorization'] = 'Bearer $token';

      request.fields['name'] = name;

      if (imageFile != null) {
        if (kIsWeb) {
            request.files.add(http.MultipartFile.fromBytes(
                'profilePicture',
                await imageFile.readAsBytes(),
                filename: imageFile.name,
                contentType: MediaType('image', 'jpeg'),
            ));
        } else {
            
            request.files.add(await http.MultipartFile.fromPath(
              'profilePicture', 
              imageFile.path,
              contentType: MediaType('image', 'jpeg'),
            ));
        }
      }

      final response = await request.send();
      final respStr = await response.stream.bytesToString();
      debugPrint("Update Profile Response: ${response.statusCode} - $respStr");
      
      if (response.statusCode == 200) {
        
        final data = jsonDecode(respStr);
        await prefs.setString('name', data['user']['name']);
        
        if (data['user']['profilePicture'] != null) {
          await prefs.setString('profilePicture', data['user']['profilePicture']);
        }
        
        return true;
      }
      return false;
    } catch (e) {
      debugPrint("Update Profile Error: $e");
      return false;
    }
  }

  
  static Future<Map<String, dynamic>> triggerSOS({
    required double lat,
    required double lng,
    String type = 'other',
    String message = '',
    int battery = 100
  }) async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');
      
      final response = await http.post(
        Uri.parse('$baseUrl/sos/trigger'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'latitude': lat,
          'longitude': lng,
          'sosType': type,
          'sosMessage': message,
          'batteryLevel': battery,
          'deviceInfo': {'model': 'Flutter App', 'os': 'Android/iOS'}
        }),
      );

      return jsonDecode(response.body);
    } catch (e) {
      debugPrint("Trigger SOS Error: $e");
      return {'success': false, 'error': e.toString()};
    }
  }

  
  static Future<bool> updateSOSLocation(String sosId, double lat, double lng, int battery) async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');
      
      final response = await http.post(
        Uri.parse('$baseUrl/sos/location'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'sosId': sosId,
          'latitude': lat,
          'longitude': lng,
          'batteryLevel': battery
        }),
      );

      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  
  static Future<bool> cancelSOS(String sosId) async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');
      
      final response = await http.delete(
        Uri.parse('$baseUrl/sos/cancel/$sosId'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  
  static Future<Map<String, dynamic>> getSOSStatus() async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');
      
      final response = await http.get(
        Uri.parse('$baseUrl/sos/status'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return {'success': false};
    } catch (e) {
      return {'success': false};
    }
  }

  
  static Future<Map<String, dynamic>> calculatePropertyTax({
    required String propertyType,
    required double area,
    required String ward,
    String? propertyId
  }) async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');
      
      final response = await http.post(
        Uri.parse('$baseUrl/property/calculate-tax'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'propertyType': propertyType,
          'area': area,
          'ward': ward,
          'propertyId': propertyId
        }),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return {'success': false, 'error': 'Calculation failed'};
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  
  static Future<Map<String, dynamic>> fetchAQIData(double lat, double lng) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/environment?lat=$lat&lng=$lng'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return {'success': false, 'error': 'Failed to fetch AQI'};
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  
  static Future<bool> sendOtp(String contact) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/send-otp'),
        body: jsonEncode({'contact': contact}),
        headers: {'Content-Type': 'application/json'},
      );
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  
  static Future<bool> addSOSContact(String name, String phone, String relationship) async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');
      
      
      final profileResponse = await http.get(
        Uri.parse('$baseUrl/auth/profile'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      List<dynamic> existingContacts = [];
      if (profileResponse.statusCode == 200) {
        final profileData = jsonDecode(profileResponse.body);
        existingContacts = profileData['user']['sosEmergencyContacts'] ?? [];
      }

      
      existingContacts.add({
        'name': name,
        'phone': phone,
        'relationship': relationship
      });

      
      final response = await http.post(
        Uri.parse('$baseUrl/auth/sos/contacts'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'emergencyContacts': existingContacts
        }),
      );
      return response.statusCode == 200;
    } catch (e) {
      debugPrint('Add SOS Contact Error: $e');
      return false;
    }
  }

  
  static Future<List<dynamic>> fetchSOSAlerts() async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');
      
      final response = await http.get(
        Uri.parse('$baseUrl/sos/all'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['activeSOS'] ?? [];
      }
      return [];
    } catch (e) {
      debugPrint("Error fetching SOS alerts: $e");
      return [];
    }
  }

  
  static Future<Map<String, dynamic>> getCityStats(String timeRange) async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');
      
      final response = await http.get(
        Uri.parse('$baseUrl/admin/analytics/city-stats?timeRange=$timeRange'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return {'success': false, 'error': 'Failed to fetch stats'};
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  
  static Future<Map<String, dynamic>> getLiveIncidents({
    double? lat, 
    double? lng, 
    int? radius,
    int? hours,
    String? status,
    String? category
  }) async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');
      
      
      String query = '?hours=${hours ?? 168}'; 
      if (status != null) query += '&status=$status';
      if (category != null) query += '&category=$category';
      if (lat != null && lng != null) query += '&lat=$lat&lng=$lng&radius=${radius ?? 50000}';

      final response = await http.get(
        Uri.parse('$baseUrl/complaints/public/live$query'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        
        return {
          'success': data['success'] ?? true,
          'incidents': List<Map<String, dynamic>>.from(data['complaints'] ?? [])
        };
      }
      debugPrint("Live Incidents API returned ${response.statusCode}");
      return {'success': false, 'incidents': []};
    } catch (e) {
       debugPrint("Get Live Incidents Error: $e");
       return {'success': false, 'incidents': []};
    }
  }

  
  static Future<Map<String, dynamic>> getZoneStatus() async {
    
    
    await Future.delayed(const Duration(milliseconds: 500));
    return {
      'success': true,
      'zones': [
        {'ward': '01', 'status': 'critical', 'pending': 45, 'total': 120, 'healthScore': 45, 'hotspot': 'Market Area'},
        {'ward': '04', 'status': 'warning', 'pending': 22, 'total': 89, 'healthScore': 65, 'hotspot': 'Bus Stand'},
        {'ward': '07', 'status': 'good', 'pending': 5, 'total': 67, 'healthScore': 92, 'hotspot': 'Park Street'},
        {'ward': '12', 'status': 'warning', 'pending': 18, 'total': 95, 'healthScore': 70, 'hotspot': 'Railway Station'},
      ]
    };
  }

  
  
  

  
  static Future<Map<String, dynamic>> chatWithCityBrain({
    required String question,
    String? context,
  }) async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');
      String? userId = prefs.getString('userId');
      String? userEmail = prefs.getString('email');
      String? userName = prefs.getString('name');

      final response = await http.post(
        Uri.parse('$baseUrl/ai/chat'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'question': question,
          'context': context ?? '',
          'userId': userId,
          'userEmail': userEmail,
          'userName': userName,
        }),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return {
        'success': false,
        'error': 'Failed to get response from City Brain',
        'answer': 'Sorry, I am having trouble connecting right now.'
      };
    } catch (e) {
      debugPrint('Chat with City Brain Error: $e');
      return {
        'success': false,
        'error': e.toString(),
        'answer': 'Network error. Please check your connection.'
      };
    }
  }

  
  static Future<bool> saveChatSession({
    required String sessionId,
    required String title,
    required List<Map<String, dynamic>> messages,
  }) async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');
      String? userId = prefs.getString('userId');
      String? userEmail = prefs.getString('email');
      String? userName = prefs.getString('name');

      if (token == null || userId == null) {
        debugPrint('Save chat: No token or userId');
        return false;
      }

      final response = await http.post(
        Uri.parse('$baseUrl/ai/chat/save'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'sessionId': sessionId,
          'title': title,
          'messages': messages,
          'userId': userId,
          'userEmail': userEmail,
          'userName': userName,
        }),
      );

      return response.statusCode == 200;
    } catch (e) {
      debugPrint('Save chat session error: $e');
      return false;
    }
  }

  
  static Future<List<dynamic>> getChatHistory() async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');
      String? userId = prefs.getString('userId');

      if (token == null || userId == null) {
        debugPrint('Get history: No token or userId');
        return [];
      }

      final response = await http.get(
        Uri.parse('$baseUrl/ai/chat/history?userId=$userId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['sessions'] ?? [];
      }
      return [];
    } catch (e) {
      debugPrint('Get chat history error: $e');
      return [];
    }
  }

  
  static Future<Map<String, dynamic>?> loadChatSession(String sessionId) async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');
      String? userId = prefs.getString('userId');

      if (token == null || userId == null) {
        debugPrint('Load session: No token or userId');
        return null;
      }

      final response = await http.get(
        Uri.parse('$baseUrl/ai/chat/session/$sessionId?userId=$userId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['session'];
      }
      return null;
    } catch (e) {
      debugPrint('Load chat session error: $e');
      return null;
    }
  }

  
  static Future<bool> deleteChatSession(String sessionId) async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');
      String? userId = prefs.getString('userId');

      if (token == null || userId == null) {
        debugPrint('Delete session: No token or userId');
        return false;
      }

      final response = await http.delete(
        Uri.parse('$baseUrl/ai/chat/session/$sessionId?userId=$userId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      return response.statusCode == 200;
    } catch (e) {
      debugPrint('Delete chat session error: $e');
      return false;
    }
  }

  
  static Future<Map<String, dynamic>> getAdminChatAnalytics() async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');

      if (token == null) return {'success': false};

      final response = await http.get(
        Uri.parse('$baseUrl/ai/admin/chat-analytics'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return {'success': false};
    } catch (e) {
      debugPrint('Get admin chat analytics error: $e');
      return {'success': false, 'error': e.toString()};
    }
  }

  
  static Future<Map<String, dynamic>> getHeatmapData({
    double lat = 29.2183,
    double lng = 79.5130,
    double gridSize = 0.01,
    int hours = 168
  }) async {
    try {
      final url = '$baseUrl/complaints/heatmap?lat=$lat&lng=$lng&gridSize=$gridSize&hours=$hours';

      final response = await http.get(
        Uri.parse(url),
        headers: {'Content-Type': 'application/json'},
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return {
          'success': data['success'] ?? true,
          'zones': List<Map<String, dynamic>>.from(data['zones'] ?? []),
          'total': data['total'] ?? 0
        };
      }
      debugPrint("Heatmap API returned ${response.statusCode}");
      return {'success': false, 'zones': [], 'total': 0};
    } catch (e) {
      debugPrint('Heatmap data error: $e');
      return {'success': false, 'zones': [], 'total': 0};
    }
  }

  
  static Future<Map<String, dynamic>> getPredictiveAnalytics() async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');

      if (token == null) return {'success': false};

      final response = await http.get(
        Uri.parse('$baseUrl/city/predictive-analytics'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return {'success': false};
    } catch (e) {
      debugPrint('Predictive analytics error: $e');
      return {'success': false, 'error': e.toString()};
    }
  }

  // Property Tax APIs
  static Future<List<dynamic>> getNearbyProperties(double lat, double lng, {int radius = 5000}) async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');

      final response = await http.get(
        Uri.parse('$baseUrl/property?lat=$lat&long=$lng&radius=$radius'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true) {
          return List<dynamic>.from(data['data'] ?? []);
        }
      }
      return [];
    } catch (e) {
      debugPrint('Get nearby properties error: $e');
      return [];
    }
  }

  static Future<Map<String, dynamic>> getRevenueStats() async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');

      final response = await http.get(
        Uri.parse('$baseUrl/property/revenue-stats'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true) {
          return data['stats'] ?? {};
        }
      }
      return {};
    } catch (e) {
      debugPrint('Get revenue stats error: $e');
      return {};
    }
  }
}
