import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart' hide Path;
import 'dart:ui'; 
import 'package:google_fonts/google_fonts.dart';
import '../../core/api_service.dart';

class HeatmapScreen extends StatefulWidget {
  const HeatmapScreen({super.key});

  @override
  State<HeatmapScreen> createState() => _HeatmapScreenState();
}

class _HeatmapScreenState extends State<HeatmapScreen> with SingleTickerProviderStateMixin {
  bool _isLoading = true;
  List<dynamic> _heatZones = [];
  Timer? _timer;
  int _selectedHours = 168; 
  
  final MapController _mapController = MapController();
  late AnimationController _pulseController;

  
  final List<Map<String, dynamic>> _timeRanges = [
    {'label': '24h', 'hours': 24, 'name': 'Last 24 Hours'},
    {'label': '7d', 'hours': 168, 'name': 'Last 7 Days'},
    {'label': '30d', 'hours': 720, 'name': 'Last 30 Days'},
  ];

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
    
    _fetchHeatmapData();
    _timer = Timer.periodic(const Duration(seconds: 60), (_) => _fetchHeatmapData(silent: true));
  }

  @override
  void dispose() {
    _timer?.cancel();
    _pulseController.dispose();
    super.dispose();
  }

  Future<void> _fetchHeatmapData({bool silent = false}) async {
    if (!silent) setState(() => _isLoading = true);
    try {
      final response = await ApiService.getHeatmapData(hours: _selectedHours);
      if (mounted) {
        setState(() {
          if (response.containsKey('success') && response['success'] == true && response.containsKey('zones')) {
            _heatZones = List<dynamic>.from(response['zones'] ?? []);
          } else {
            _heatZones = [];
          }
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
        _heatZones = [];
        _isLoading = false;
      });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA), 
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.white.withOpacity(0.8),
        elevation: 0,
        flexibleSpace: ClipRect(
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
            child: Container(color: Colors.transparent),
          ),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("ADVANCED HEATMAP", 
              style: GoogleFonts.montserrat(
                fontWeight: FontWeight.w800, 
                fontSize: 18, 
                color: const Color(0xFF1E293B),
                letterSpacing: 1.2
              )
            ),
            Text("Thermal Density Analysis • Real-time", 
              style: GoogleFonts.inter(fontSize: 11, color: Colors.blueGrey, fontWeight: FontWeight.w600)
            ),
          ],
        ),
        actions: [
           Container(
             margin: const EdgeInsets.only(right: 16),
             padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
             decoration: BoxDecoration(
               color: Colors.green.withOpacity(0.1),
               borderRadius: BorderRadius.circular(20),
               border: Border.all(color: Colors.green.withOpacity(0.3))
             ),
             child: Row(
               children: [
                 FadeTransition(
                   opacity: _pulseController,
                   child: const Icon(Icons.circle, size: 8, color: Colors.green),
                 ),
                 const SizedBox(width: 8),
                 Text("LIVE", style: GoogleFonts.inter(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 10))
               ],
             ),
           )
        ],
        iconTheme: const IconThemeData(color: Color(0xFF1E293B)),
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator(color: Colors.blueAccent))
        : Stack(
            children: [
              
              FlutterMap(
                mapController: _mapController,
                options: const MapOptions(
                  initialCenter: LatLng(29.2183, 79.5130),
                  initialZoom: 13.0,
                  maxZoom: 18.0,
                  keepAlive: true,
                ),
                children: [
                   TileLayer(
                    urlTemplate: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', // Light Mode
                    subdomains: const ['a','b','c'], 
                    userAgentPackageName: 'com.urban.admin',
                    retinaMode: true, 
                  ),
                  
                  
                  CircleLayer(
                    circles: _heatZones.where((zone) {
                      return zone['lat'] != null && zone['lng'] != null;
                    }).map((zone) {
                       Color color = _getHeatColor(zone['color']);
                       final lat = (zone['lat'] as num?)?.toDouble() ?? 29.2183;
                       final lng = (zone['lng'] as num?)?.toDouble() ?? 79.5130;
                       
                       final radius = (zone['radius'] as num?)?.toDouble() ?? 100.0;
                       
                       return CircleMarker(
                         point: LatLng(lat, lng),
                         radius: 120, 
                         useRadiusInMeter: true,
                         color: color.withOpacity(0.25),
                         borderColor: Colors.transparent,
                         borderStrokeWidth: 0,
                       );
                    }).toList(),
                  ),

                   
                  CircleLayer(
                    circles: _heatZones.where((zone) {
                      return zone['lat'] != null && zone['lng'] != null;
                    }).map((zone) {
                       Color color = _getHeatColor(zone['color']);
                       final lat = (zone['lat'] as num?)?.toDouble() ?? 29.2183;
                       final lng = (zone['lng'] as num?)?.toDouble() ?? 79.5130;
                       
                       return CircleMarker(
                         point: LatLng(lat, lng),
                         radius: 40, 
                         useRadiusInMeter: true,
                         color: color.withOpacity(0.5),
                         borderColor: Colors.white.withOpacity(0.8),
                         borderStrokeWidth: 1,
                       );
                    }).toList(),
                  ),
                ],
              ),

              
              Positioned(
                top: 120,
                right: 16,
                child: _buildGlassStatsPanel(),
              ),

              
              Positioned(
                bottom: 30,
                left: 20, 
                right: 20,
                child: SafeArea(
                  child: _buildFloatingFilterDock(),
                ),
              ),

              
              Positioned(
                right: 16,
                bottom: 120,
                child: Column(
                  children: [
                    _buildMapControl(Icons.add, () {
                      final zoom = _mapController.camera.zoom;
                      _mapController.move(_mapController.camera.center, zoom + 1);
                    }),
                    const SizedBox(height: 12),
                    _buildMapControl(Icons.remove, () {
                      final zoom = _mapController.camera.zoom;
                      _mapController.move(_mapController.camera.center, zoom - 1);
                    }),
                     const SizedBox(height: 12),
                    _buildMapControl(Icons.my_location, () {
                      _mapController.move(const LatLng(29.2183, 79.5130), 15);
                    }),
                  ],
                ),
              ),
            ],
          ),
    );
  }

  Widget _buildGlassStatsPanel() {
    final totalZones = _heatZones.length;
    final critical = _heatZones.where((z) => z['color'] == 'red').length;
    
    return ClipRRect(
      borderRadius: BorderRadius.circular(20),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 15, sigmaY: 15),
        child: Container(
          padding: const EdgeInsets.all(20),
          width: 200,
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.7),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: Colors.white),
            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 20, offset: const Offset(0, 10))],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text("ANALYSIS", style: GoogleFonts.inter(color: Colors.blueGrey, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.1)),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: Column(
                       crossAxisAlignment: CrossAxisAlignment.start,
                       children: [
                         Text("$totalZones", style: GoogleFonts.montserrat(fontSize: 24, fontWeight: FontWeight.bold, color: const Color(0xFF1E293B))),
                         Text("Zones", style: GoogleFonts.inter(fontSize: 12, color: Colors.grey)),
                       ],
                    ),
                  ),
                  Container(width: 1, height: 30, color: Colors.grey[300]),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                       crossAxisAlignment: CrossAxisAlignment.start,
                       children: [
                         Text("$critical", style: GoogleFonts.montserrat(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.redAccent)),
                         Text("Critical", style: GoogleFonts.inter(fontSize: 12, color: Colors.redAccent.withOpacity(0.7))),
                       ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              LinearProgressIndicator(
                value: totalZones > 0 ? critical / totalZones : 0,
                backgroundColor: Colors.grey[200],
                valueColor: const AlwaysStoppedAnimation<Color>(Colors.redAccent),
                minHeight: 4,
                borderRadius: BorderRadius.circular(2),
              ),
              const SizedBox(height: 8),
              Text("Critical Density Ratio", style: GoogleFonts.inter(fontSize: 10, color: Colors.grey)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFloatingFilterDock() {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 20,
            offset: const Offset(0, 10)
          )
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: _timeRanges.map((range) {
          final isSelected = _selectedHours == range['hours'];
          return GestureDetector(
            onTap: () {
              setState(() => _selectedHours = range['hours']);
              _fetchHeatmapData();
            },
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              margin: const EdgeInsets.symmetric(horizontal: 4),
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              decoration: BoxDecoration(
                color: isSelected ? const Color(0xFF1E293B) : Colors.transparent,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Text(
                range['label'],
                style: GoogleFonts.inter(
                  color: isSelected ? Colors.white : Colors.blueGrey,
                  fontWeight: FontWeight.bold,
                  fontSize: 13
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildMapControl(IconData icon, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          shape: BoxShape.circle,
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 10)],
        ),
        child: Icon(icon, color: const Color(0xFF1E293B), size: 24),
      ),
    );
  }

  Color _getHeatColor(dynamic colorStr) {
    final color = colorStr?.toString().toLowerCase() ?? 'green';
    switch (color) {
      case 'red': return Colors.red;
      case 'orange': return Colors.orange;
      case 'green': return Colors.green;
      default: return Colors.blue;
    }
  }

  void _showZoneDetails(Map<String, dynamic> zone) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        height: 380,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 20)],
        ),
        padding: const EdgeInsets.all(24),
        child: Column(
           crossAxisAlignment: CrossAxisAlignment.start,
           children: [
             Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2)))),
             const SizedBox(height: 24),
             Row(
               children: [
                 Container(
                   padding: const EdgeInsets.all(12),
                   decoration: BoxDecoration(
                     color: _getHeatColor(zone['color']).withOpacity(0.1),
                     borderRadius: BorderRadius.circular(12),
                   ),
                   child: Icon(Icons.local_fire_department, color: _getHeatColor(zone['color']), size: 28),
                 ),
                 const SizedBox(width: 16),
                 Text("Hotspot Zone", style: GoogleFonts.montserrat(fontSize: 18, fontWeight: FontWeight.bold, color: const Color(0xFF1E293B))),
               ],
             ),
             const SizedBox(height: 24),
             _buildStatRow("Zone Name", zone['name'] ?? 'Unknown', Icons.location_city),
             _buildStatRow("Intensity", zone['intensity'] ?? 'N/A', Icons.whatshot),
             _buildStatRow("Total Reports", "${zone['count'] ?? 0}", Icons.file_copy),
             const Spacer(),
             SizedBox(
               width: double.infinity,
               child: ElevatedButton(
                 onPressed: () => Navigator.pop(context),
                 style: ElevatedButton.styleFrom(
                   backgroundColor: const Color(0xFF1E293B),
                   foregroundColor: Colors.white,
                   padding: const EdgeInsets.symmetric(vertical: 16),
                   elevation: 0,
                   shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                 ),
                 child: Text("CLOSE", style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
               ),
             ),
           ],
        ),
      ),
    );
  }

  Widget _buildStatRow(String label, String value, IconData icon) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        children: [
          Icon(icon, color: Colors.blueGrey, size: 20),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: GoogleFonts.inter(color: Colors.grey, fontSize: 11)),
              Text(value, style: GoogleFonts.inter(color: const Color(0xFF1E293B), fontSize: 16, fontWeight: FontWeight.bold)),
            ],
          ),
        ],
      ),
    );
  }
}