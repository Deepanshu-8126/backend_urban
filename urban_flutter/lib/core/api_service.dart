import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http_parser/http_parser.dart'; // Add this to pubspec.yaml if needed

class ApiService {
  static const String baseUrl = 'http://10.0.2.2:3000/api/v1';

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

  // 2️⃣ OTP Verify & Profile Data Save Karna
  static Future<bool> verifyOtp(String contact, String otp) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/verify-otp'),
        body: jsonEncode({'contact': contact, 'otp': otp}),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        SharedPreferences prefs = await SharedPreferences.getInstance();

        // Asli Persistence Logic: Sab kuch ek jagah save
        await prefs.setString('token', data['token']);
        await prefs.setString('firstName', data['user']['firstName'] ?? "User");
        await prefs.setString('surname', data['user']['surname'] ?? "");
        await prefs.setString('contact', contact);
        await prefs.setBool('isLoggedIn', true);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
    return null;
  }

  // 3️⃣ Complaint Create Karna (With Token)
  static Future<bool> createComplaint(Map<String, dynamic> complaintData) async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');

      final response = await http.post(
        Uri.parse('$baseUrl/complaints'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(complaintData),
      );
      return response.statusCode == 201;
    } catch (e) {
      return false;
    }
  }

  // 4️⃣ Logout Logic (Clean up)
  static Future<void> logout() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }
}