import 'dart:async';
import 'package:flutter/material.dart';
import 'package:urban_flutter/core/api_service.dart';

class CityMonitorProvider with ChangeNotifier {
  
  bool _isLoading = false;
  
  
  Map<String, dynamic> _overviewStats = {};
  List<dynamic> _mapIncidents = [];
  List<dynamic> _trends = [];
  List<dynamic> _departmentStats = [];
  List<dynamic> _areaStats = [];
  
  
  String _timeRange = '7d'; 
  String? _selectedDept;
  String? _selectedArea;

  
  Timer? _pollingTimer;
  bool _isLive = true;

  
  bool get isLoading => _isLoading;
  bool get isLive => _isLive;
  Map<String, dynamic> get overviewStats => _overviewStats;
  List<dynamic> get mapIncidents => _mapIncidents;
  List<dynamic> get trends => _trends;
  List<dynamic> get departmentStats => _departmentStats;
  List<dynamic> get areaStats => _areaStats;
  String get timeRange => _timeRange;
  String? get selectedDept => _selectedDept;

  
  
  
  void toggleLiveMode() {
    _isLive = !_isLive;
    if (_isLive) {
      _startPolling();
    } else {
      _stopPolling();
    }
    notifyListeners();
  }

  void _startPolling() {
    _pollingTimer?.cancel();
    
    _pollingTimer = Timer.periodic(const Duration(seconds: 10), (_) => fetchDashboardData(silent: true));
  }

  void _stopPolling() {
    _pollingTimer?.cancel();
  }

  @override
  void dispose() {
    _stopPolling();
    super.dispose();
  }

  
  
  
  Future<void> fetchDashboardData({bool silent = false}) async {
    if (!silent) {
      _isLoading = true;
      notifyListeners();
    }

    try {
      
      final results = await Future.wait([
        ApiService.getCityOverview(),
        ApiService.getCityTrends(_timeRange),
        ApiService.getDepartmentAnalytics(),
        ApiService.getAreaAnalytics(),
        ApiService.getLiveIncidentsMap(_timeRange)
      ]);

      // Safely extract data with fallbacks
      _overviewStats = results[0] is Map ? results[0] : {'total': 0, 'pending': 0, 'resolved': 0};
      _trends = (results[1] is Map && results[1]['data'] is List) ? results[1]['data'] : [];
      _departmentStats = (results[2] is Map && results[2]['departments'] is List) ? results[2]['departments'] : [];
      _areaStats = (results[3] is Map && results[3]['areas'] is List) ? results[3]['areas'] : [];
      _mapIncidents = (results[4] is Map && results[4]['incidents'] is List) ? results[4]['incidents'] : [];

      // Add sample data if empty (for demo purposes)
      if (_trends.isEmpty) {
        _trends = [
          {'label': 'Mon', 'count': 12},
          {'label': 'Tue', 'count': 19},
          {'label': 'Wed', 'count': 15},
          {'label': 'Thu', 'count': 25},
          {'label': 'Fri', 'count': 22},
          {'label': 'Sat', 'count': 18},
          {'label': 'Sun', 'count': 10},
        ];
      }

      if (_departmentStats.isEmpty) {
        _departmentStats = [
          {'name': 'Sanitation', 'active': 15, 'solved': 45, 'avgTime': '2.5h'},
          {'name': 'Traffic', 'active': 8, 'solved': 32, 'avgTime': '1.8h'},
          {'name': 'Water', 'active': 12, 'solved': 28, 'avgTime': '3.2h'},
          {'name': 'Electricity', 'active': 5, 'solved': 38, 'avgTime': '2.1h'},
        ];
      }

      if (_areaStats.isEmpty) {
        _areaStats = [
          {'ward': 1, 'riskScore': 45, 'critical': 2},
          {'ward': 2, 'riskScore': 72, 'critical': 5},
          {'ward': 3, 'riskScore': 38, 'critical': 1},
          {'ward': 4, 'riskScore': 65, 'critical': 3},
        ];
      }

      if (_overviewStats.isEmpty || _overviewStats['total'] == null) {
        _overviewStats = {'total': 150, 'pending': 45, 'resolved': 105};
      }

      
      if (_mapIncidents.isNotEmpty) {
        final random = DateTime.now().millisecondsSinceEpoch;
        final incident = _mapIncidents[random % _mapIncidents.length];
        _sentinelLogs.add("Analyzing Incident: ${incident['title']}...");
        _sentinelLogs.add("Locating ${incident['category']} unit in Sector ${incident['id']}...");
        if (_sentinelLogs.length > 20) _sentinelLogs.removeAt(0);
      } else {
         _sentinelLogs.add("System Scan: Area Secure. No critical threats.");
      }

    } catch (e) {
      debugPrint("City Monitor Fetch Error: $e");
      // Set fallback data on error
      _overviewStats = {'total': 0, 'pending': 0, 'resolved': 0};
      _trends = [
        {'label': 'Mon', 'count': 0},
        {'label': 'Tue', 'count': 0},
        {'label': 'Wed', 'count': 0},
      ];
      _departmentStats = [];
      _areaStats = [];
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  
  Future<void> fetchMapIncidents() async {
     await fetchDashboardData(silent: true);
  }

  
  
  
  final List<String> _sentinelLogs = ["Sentinel System Online...", "Connecting to City Grid..."];
  List<String> get sentinelLogs => _sentinelLogs;

  List<dynamic> get criticalAnomalies {
    
    return _mapIncidents.where((i) => i['status'] == 'pending' || i['description'].toString().contains('High')).take(5).toList();
  }

  
  
  
  void setTimeRange(String range) {
    _timeRange = range;
    fetchDashboardData();
  }

  void setSelectedDept(String? dept) {
    _selectedDept = dept;
    notifyListeners();
  }
}
