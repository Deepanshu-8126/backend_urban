import 'package:http/http.dart' as http;
import 'dart:convert';
import '../core/api_service.dart'; 

class IntelligenceService {
  
  
  static String get baseUrl => '${ApiService.baseUrl}/intelligence';

  
  
  static Future<Map<String, dynamic>> syncMemoryVault({int days = 30}) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/memory/sync'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'days': days}),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  static Future<Map<String, dynamic>> getAreaHistory(String areaId) async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/memory/area/$areaId'));
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  static Future<Map<String, dynamic>> getMemoryInsights() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/memory/insights'));
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  
  
  static Future<Map<String, dynamic>> detectSilentProblems({int days = 7, double threshold = 0.5}) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/silent/analyze'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'days': days, 'threshold': threshold}),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  static Future<Map<String, dynamic>> getActiveSilentZones() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/silent/active'));
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  
  
  static Future<Map<String, dynamic>> generateAreaDNA(String areaId, {int days = 90}) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/dna/generate/$areaId'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'days': days}),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  static Future<Map<String, dynamic>> getAreaDNA(String areaId) async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/dna/area/$areaId'));
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  static Future<Map<String, dynamic>> getCityRiskMap() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/dna/risk-map'));
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  
  
  static Future<Map<String, dynamic>> getAdminLoad(String adminId, {int days = 7}) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/load/admin/$adminId?days=$days'),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  static Future<Map<String, dynamic>> getDepartmentLoad(String department, {int days = 7}) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/load/department/$department?days=$days'),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  static Future<Map<String, dynamic>> getOverloadAlerts() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/load/alerts'));
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  
  
  static Future<Map<String, dynamic>> getAreaResilience(String areaId, {int days = 30}) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/resilience/area/$areaId?days=$days'),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  static Future<Map<String, dynamic>> getCityResilience() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/resilience/city'));
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  static Future<Map<String, dynamic>> getResilienceTrends() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/resilience/trends'));
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  
  
  static Future<Map<String, dynamic>> analyzeFeedbackLoop({int days = 30}) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/feedback/analyze'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'days': days}),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  static Future<Map<String, dynamic>> getImprovements() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/feedback/improvements'));
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  
  
  static Future<Map<String, dynamic>> analyzeDecisionComplexity({int days = 30}) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/advanced/decision/analyze'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'days': days}),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  static Future<Map<String, dynamic>> getComplexityMetrics() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/advanced/decision/metrics'));
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  
  
  static Future<Map<String, dynamic>> getPeakHours({int days = 30, String? department}) async {
    try {
      String url = '$baseUrl/advanced/time/peaks?days=$days';
      if (department != null) url += '&department=$department';
      
      final response = await http.get(Uri.parse(url));
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  
  
  static Future<Map<String, dynamic>> calculateAreaTrust(String areaId, {int days = 30}) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/advanced/trust/calculate/$areaId'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'days': days}),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  static Future<Map<String, dynamic>> getCityTrust() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/advanced/trust/city'));
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  
  
  static Future<Map<String, dynamic>> performEthicsAudit({int days = 30}) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/advanced/ethics/audit'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'days': days}),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  
  
  static Future<Map<String, dynamic>> detectAnomalies({int days = 7}) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/advanced/anomaly/detect'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'days': days}),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  static Future<Map<String, dynamic>> getActiveAnomalies() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/advanced/anomaly/active'));
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  
  
  static Future<Map<String, dynamic>> getSystemGraph({int days = 30}) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/advanced/nervous/graph?days=$days'),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  
  
  static Future<Map<String, dynamic>> measureAreaFatigue(String areaId, {int days = 30}) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/advanced/fatigue/measure/$areaId'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'days': days}),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  static Future<Map<String, dynamic>> getCityFatigue() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/advanced/fatigue/city'));
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  
  
  static Future<Map<String, dynamic>> projectTrends({int days = 30, String? department}) async {
    try {
      String url = '$baseUrl/advanced/future/trends?days=$days';
      if (department != null) url += '&department=$department';
      
      final response = await http.get(Uri.parse(url));
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  
  
  static Future<Map<String, dynamic>> getCityConsciousness({int days = 7}) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/advanced/consciousness?days=$days'),
      );
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  
  
  static Future<Map<String, dynamic>> getMasterDashboard() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/advanced/dashboard'));
      return _handleResponse(response);
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  
  
  static Map<String, dynamic> _handleResponse(http.Response response) {
    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      return {
        'success': false,
        'error': 'Status ${response.statusCode}',
        'message': response.body
      };
    }
  }

  
  

  static Future<Map<String, dynamic>> getSilentProblems() async {
    return detectSilentProblems();
  }

  static Future<Map<String, dynamic>> getRiskMap() async {
    return getCityRiskMap();
  }

  static Future<Map<String, dynamic>> getAdminLoadAlerts() async {
    return getOverloadAlerts();
  }

  static Future<Map<String, dynamic>> getFeedbackImprovements() async {
    return getImprovements();
  }

  static Future<Map<String, dynamic>> getDecisionMetrics() async {
    return getComplexityMetrics();
  }

  static Future<Map<String, dynamic>> getEthicsAudit() async {
    return performEthicsAudit();
  }

  static Future<Map<String, dynamic>> getNervousSystemGraph({int days = 30}) async {
    return getSystemGraph(days: days);
  }

  static Future<Map<String, dynamic>> getFutureTrends({int days = 30}) async {
    return projectTrends(days: days);
  }
}
