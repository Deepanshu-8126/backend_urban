import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart' hide Path;
import 'package:provider/provider.dart';
import 'package:fl_chart/fl_chart.dart'; 
import '../../core/api_service.dart';
import '../../core/app_provider.dart';

class CityMonitorScreen extends StatefulWidget {
  const CityMonitorScreen({super.key});

  @override
  State<CityMonitorScreen> createState() => _CityMonitorScreenState();
}

class _CityMonitorScreenState extends State<CityMonitorScreen> {
  
  bool _isLoading = true;
  bool _showPowerPanel = false; 
  bool _showTimePanel = false; 
  
  
  bool _isSatellite = false;
  bool _showHeatmap = false;
  final MapController _mapController = MapController();
  
  
  Map<String, dynamic> _monitorData = {};
  List<dynamic> _alerts = [];
  List<dynamic> _incidents = [];
  List<dynamic> _zones = [];
  List<dynamic> _timeTrend = [];
  
  
  String _timeRange = '24h';
  String? _selectedCategory;
  String? _selectedStatus;
  
  Timer? _refreshTimer;

  @override
  void initState() {
    super.initState();
    _fetchData();
    _refreshTimer = Timer.periodic(const Duration(minutes: 1), (_) => _fetchData(silent: true));
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    super.dispose();
  }

  Future<void> _fetchData({bool silent = false}) async {
    if (!silent) setState(() => _isLoading = true);
    try {
      final data = await ApiService.getCityRealTimeStats(timeRange: _timeRange); 
      if (mounted) {
        setState(() {
          _monitorData = data;
          _alerts = data['alerts'] ?? [];
          _incidents = data['incidents'] ?? [];
          _zones = data['zones'] ?? [];
          _timeTrend = data['graphs']?['timeTrend'] ?? [];
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint("City Monitor Error: $e");
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final dept = Provider.of<AppProvider>(context).userDepartment ?? 'Admin';
    
    return Scaffold(
      body: Stack(
        children: [
          
          _buildMap(),
          
          
          AnimatedPositioned(
            duration: const Duration(milliseconds: 300),
            left: _showPowerPanel ? 0 : -280,
            top: 100,
            bottom: 0,
            width: 280,
            child: _buildPowerPanel(),
          ),
          
          
          Positioned(
            top: 0, left: 0, right: 0,
            child: _buildTopBar(dept),
          ),
          
          
          AnimatedPositioned(
            duration: const Duration(milliseconds: 300),
            bottom: _showTimePanel ? 0 : -250,
            left: _showPowerPanel ? 280 : 0, 
            right: 0,
            height: 300,
            child: _buildTimeAnalysisPanel(),
          ),

          
          if (_alerts.any((a) => a['level'] == 'high'))
             Positioned(top: 110, right: 16, child: _buildHighRiskAlert()),

          
          Positioned(
            bottom: _showTimePanel ? 320 : 20,
            right: 16,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                FloatingActionButton.small(
                  heroTag: 'layers',
                  onPressed: () => setState(() => _isSatellite = !_isSatellite),
                  backgroundColor: Colors.black87,
                  child: Icon(_isSatellite ? Icons.map : Icons.satellite_alt, color: Colors.cyanAccent),
                ),
                const SizedBox(height: 8),
                FloatingActionButton.small(
                  heroTag: 'analysis',
                  onPressed: () => setState(() => _showTimePanel = !_showTimePanel),
                  backgroundColor: _showTimePanel ? Colors.cyan : Colors.black87,
                  child: const Icon(Icons.analytics, color: Colors.white),
                ),
              ],
            ),
          )
        ],
      ),
    );
  }

  
  
  
  Widget _buildTopBar(String dept) {
    final alertCount = _alerts.length;
    
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 40, 16, 16),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A).withOpacity(0.95),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.3), blurRadius: 10)],
      ),
      child: Row(
        children: [
          IconButton(
            icon: Icon(_showPowerPanel ? Icons.menu_open : Icons.menu, color: Colors.white),
            onPressed: () => setState(() => _showPowerPanel = !_showPowerPanel),
          ),
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(width: 8, height: 8, decoration: const BoxDecoration(color: Colors.greenAccent, shape: BoxShape.circle)),
                  const SizedBox(width: 6),
                  Text(dept.toUpperCase(), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                ],
              ),
              const Text("City Monitoring System", style: TextStyle(color: Colors.grey, fontSize: 10)),
            ],
          ),
          const Spacer(),
          
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(color: Colors.white10, borderRadius: BorderRadius.circular(20)),
            child: DropdownButton<String>(
              value: _timeRange,
              dropdownColor: const Color(0xFF1E293B),
              underline: const SizedBox(),
              icon: const Icon(Icons.arrow_drop_down, color: Colors.white70),
              style: const TextStyle(color: Colors.white, fontSize: 12),
              items: ['1h', '6h', '24h', '7d', '30d'].map((e) => DropdownMenuItem(value: e, child: Text("Last $e"))).toList(),
              onChanged: (v) {
                setState(() => _timeRange = v!);
                _fetchData();
              },
            ),
          ),
          const SizedBox(width: 12),
          
          Stack(
            children: [
              Icon(Icons.notifications, color: alertCount > 0 ? Colors.redAccent : Colors.white70),
              if (alertCount > 0)
                Positioned(
                  right: 0, top: 0,
                  child: Container(
                    padding: const EdgeInsets.all(2),
                    decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle),
                    child: Text('$alertCount', style: const TextStyle(fontSize: 8, color: Colors.white)),
                  ),
                )
            ],
          )
        ],
      ),
    );
  }

  
  
  
  Widget _buildPowerPanel() {
    return Container(
      color: const Color(0xFF1E293B), 
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            color: const Color(0xFF0F172A),
            width: double.infinity,
            child: const Text("POWER FILTERS", style: TextStyle(color: Colors.cyanAccent, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                _buildFilterSection("Status", ["Pending", "Working", "Solved", "Critical"], _selectedStatus, (v) => setState(() => _selectedStatus = v)),
                const SizedBox(height: 20),
                const Text("AREA FILTER", style: TextStyle(color: Colors.grey, fontSize: 10, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  children: ["Ward 1", "Ward 2", "Zone A", "Zone B"].map((e) => Chip(
                    label: Text(e, style: const TextStyle(fontSize: 10)),
                    backgroundColor: Colors.white10,
                    labelStyle: const TextStyle(color: Colors.white70),
                  )).toList(),
                ),
                const SizedBox(height: 20),
                SwitchListTile(
                  title: const Text("Show Heatmap", style: TextStyle(color: Colors.white, fontSize: 12)),
                  value: _showHeatmap,
                  activeThumbColor: Colors.orange,
                  onChanged: (v) => setState(() => _showHeatmap = v),
                ),
                SwitchListTile(
                  title: const Text("Repeated Issues", style: TextStyle(color: Colors.white, fontSize: 12)),
                  value: true, 
                  activeThumbColor: Colors.redAccent,
                  onChanged: (v) {},
                ),
                const Divider(color: Colors.white24, height: 30),
                 const Text("DEPARTMENT METRICS", style: TextStyle(color: Colors.grey, fontSize: 10, fontWeight: FontWeight.bold)),
                 const SizedBox(height: 10),
                 _buildMetricRow("Total Load", "${_monitorData['stats']?['total'] ?? 0}"),
                 _buildMetricRow("Active Issues", "${_monitorData['stats']?['active'] ?? 0}"),
                 _buildMetricRow("Fake Ratio", "${_monitorData['stats']?['fakeRatio'] ?? 0}%"),
              ],
            ),
          )
        ],
      ),
    );
  }
  
  Widget _buildFilterSection(String title, List<String> options, String? selected, Function(String?) onTap) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title.toUpperCase(), style: const TextStyle(color: Colors.grey, fontSize: 10, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8, runSpacing: 8,
          children: options.map((opt) {
            final isSel = selected == opt;
            return InkWell(
              onTap: () => onTap(isSel ? null : opt), 
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: isSel ? Colors.cyan : Colors.white10,
                  borderRadius: BorderRadius.circular(4),
                  border: isSel ? Border.all(color: Colors.cyanAccent) : null,
                ),
                child: Text(opt, style: TextStyle(color: isSel ? Colors.black : Colors.white70, fontSize: 11)),
              ),
            );
          }).toList(),
        )
      ],
    );
  }

  Widget _buildMetricRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.white70, fontSize: 12)),
          Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  
  
  
  Widget _buildMap() {
    return FlutterMap(
      mapController: _mapController,
      options: const MapOptions(
        initialCenter: LatLng(29.2183, 79.5130), 
        initialZoom: 13,
      ),
      children: [
        TileLayer(
          urlTemplate: _isSatellite 
              ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
              : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', // Dark mode map
          userAgentPackageName: 'com.urban.admin',
        ),
        
        if (_zones.isNotEmpty)
          CircleLayer(
             circles: _zones.map((z) => CircleMarker(
               point: const LatLng(29.2183, 79.5130), 
               radius: 300,
               useRadiusInMeter: true,
               color: z['status'] == 'Critical' ? Colors.red.withOpacity(0.3) : Colors.green.withOpacity(0.1),
               borderColor: z['status'] == 'Critical' ? Colors.red : Colors.green,
               borderStrokeWidth: 2,
             )).toList(),
          ),
        
        MarkerLayer(
          markers: _incidents.map((inc) {
            final isHighPriority = (inc['priority'] ?? 0) > 7;
             return Marker(
               point: LatLng((inc['lat'] as num).toDouble(), (inc['lng'] as num).toDouble()),
               width: 30, height: 30,
               child: Container(
                 decoration: BoxDecoration(
                   color: isHighPriority ? Colors.red : Colors.yellow,
                   shape: BoxShape.circle,
                   boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 4)],
                   border: Border.all(color: Colors.white, width: 2),
                 ),
                 child: const Icon(Icons.bolt, size: 16, color: Colors.black), 
               ),
             );
          }).toList(),
        ),
      ],
    );
  }

  
  
  
  Widget _buildTimeAnalysisPanel() {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.5), blurRadius: 20)],
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text("TIME INTELLIGENCE", style: TextStyle(color: Colors.cyanAccent, fontWeight: FontWeight.bold)),
              IconButton(icon: const Icon(Icons.close, color: Colors.white54), onPressed: () => setState(() => _showTimePanel = false)),
            ],
          ),
          const SizedBox(height: 8),
          const Text("Issue Peak Time: 09:00 AM - 11:00 AM (Water)", style: TextStyle(color: Colors.white70, fontSize: 12)),
          const SizedBox(height: 16),
          
          Expanded(
            child: _timeTrend.isEmpty 
              ? const Center(child: Text("Not enough data for graph", style: TextStyle(color: Colors.white30)))
              : BarChart(
                  BarChartData(
                    gridData: const FlGridData(show: false),
                    titlesData: FlTitlesData(
                      leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                      topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                      rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                      bottomTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, getTitlesWidget: _bottomTitles)),
                    ),
                    borderData: FlBorderData(show: false),
                    barGroups: _timeTrend.asMap().entries.map((e) {
                      return BarChartGroupData(
                        x: e.key,
                        barRods: [BarChartRodData(toY: (e.value['count'] as num).toDouble(), color: Colors.blueAccent, width: 8)],
                      );
                    }).toList(),
                  ),
                ),
          )
        ],
      ),
    );
  }

  Widget _bottomTitles(double value, TitleMeta meta) {
    if (value.toInt() >= _timeTrend.length) return const SizedBox.shrink();
    if (value.toInt() % 4 != 0) return const SizedBox.shrink(); 
    return Padding(
      padding: const EdgeInsets.only(top: 8.0),
      child: Text(
        _timeTrend[value.toInt()]['label'].toString(),
        style: const TextStyle(color: Colors.white54, fontSize: 10),
      ),
    );
  }

  
  
  
  Widget _buildHighRiskAlert() {
    final alert = _alerts.firstWhere((element) => element['level'] == 'high', orElse: () => null);
    if (alert == null) return const SizedBox.shrink();

    return Container(
      width: 300,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.red.withOpacity(0.9),
        borderRadius: BorderRadius.circular(12),
        boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 10)],
      ),
      child: Row(
        children: [
          const Icon(Icons.warning_amber_rounded, color: Colors.white, size: 30),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text("HIGH RISK ALERT", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                Text(alert['message'], style: const TextStyle(color: Colors.white, fontSize: 12)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
