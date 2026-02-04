import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:urban_flutter/core/providers/city_monitor_provider.dart';
import 'package:urban_flutter/core/api_service.dart';
import 'dart:async';

class MonitorMapView extends StatefulWidget {
  const MonitorMapView({super.key});

  @override
  State<MonitorMapView> createState() => _MonitorMapViewState();
}

class _MonitorMapViewState extends State<MonitorMapView> with TickerProviderStateMixin {
  final MapController _mapController = MapController();
  bool _isDarkMap = false;
  bool _showHeatmap = false;
  bool _showActiveAlerts = false;
  late AnimationController _pulseController;
  
  
  String _selectedStatus = 'all';
  String _selectedCategory = 'all';
  
  
  late ScrollController _tickerScrollController;
  Timer? _tickerTimer;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(vsync: this, duration: const Duration(seconds: 2))..repeat(reverse: true);
    _tickerScrollController = ScrollController();
    
    
    WidgetsBinding.instance.addPostFrameCallback((_) => _startTicker());
  }

  void _startTicker() {
    _tickerTimer = Timer.periodic(const Duration(milliseconds: 50), (timer) {
      if (_tickerScrollController.hasClients) {
        if (_tickerScrollController.offset >= _tickerScrollController.position.maxScrollExtent) {
          _tickerScrollController.jumpTo(0);
        } else {
          _tickerScrollController.animateTo(
            _tickerScrollController.offset + 1, 
            duration: const Duration(milliseconds: 50), 
            curve: Curves.linear
          );
        }
      }
    });
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _tickerTimer?.cancel();
    _tickerScrollController.dispose();
    super.dispose();
  }

  List<dynamic> _getFilteredIncidents(List<dynamic> incidents) {
    return incidents.where((incident) {
      bool statusMatch = _selectedStatus == 'all' || incident['status'] == _selectedStatus;
      bool categoryMatch = _selectedCategory == 'all' || incident['category'] == _selectedCategory;
      return statusMatch && categoryMatch;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<CityMonitorProvider>(context);
    final filteredIncidents = _getFilteredIncidents(provider.mapIncidents);

    return Scaffold(
      body: Stack(
        children: [
          
          FlutterMap(
            mapController: _mapController,
            options: const MapOptions(
              center: LatLng(29.2183, 79.5130), 
              zoom: 13.0,
            ),
            children: [
              TileLayer(
                urlTemplate: _isDarkMap 
                    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' 
                    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
                subdomains: const ['a', 'b', 'c'],
              ),
              
              if (_showHeatmap)
                 CircleLayer(
                    circles: _buildHeatmapCircles(filteredIncidents),
                 ),

              if (!_showHeatmap)
                MarkerLayer(
                  markers: _buildMarkersWithClustering(filteredIncidents),
                ),
            ],
          ),

          
          Positioned(
            top: 20, left: 16, right: 16,
            child: Container(
              height: 40,
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.8),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 10)]
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: Colors.redAccent,
                      borderRadius: BorderRadius.circular(20)
                    ),
                    height: 40,
                    child: const Center(child: Text("LIVE", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 10))),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: ListView.builder(
                      controller: _tickerScrollController,
                      scrollDirection: Axis.horizontal,
                      itemCount: filteredIncidents.length * 10, 
                      itemBuilder: (context, index) {
                        final i = filteredIncidents[index % filteredIncidents.length];
                        return Container(
                          margin: const EdgeInsets.only(right: 20),
                          alignment: Alignment.center,
                          child: Text(
                             "${i['category'].toString().toUpperCase()}: ${i['title']} • ",
                             style: GoogleFonts.robotoMono(color: Colors.greenAccent, fontSize: 12)
                          ),
                        );
                      },
                    ),
                  )
                ],
              ),
            ),
          ),

          
          Positioned(
            top: 70, right: 16,
            child: _buildFilterChips(provider.mapIncidents),
          ),

          
          Positioned(
            bottom: _showActiveAlerts ? 350 : 100,
            left: 20, right: 20,
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: _isDarkMap ? const Color(0xFF1E1E1E).withOpacity(0.95) : Colors.white.withOpacity(0.95),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.15), blurRadius: 12)],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  Expanded(child: _buildStatItem("Total", "${filteredIncidents.length}", Colors.blue)),
                  Container(width: 1, height: 30, color: Colors.grey[300]),
                  Expanded(child: _buildStatItem("Pending", "${filteredIncidents.where((i) => i['status'] == 'pending').length}", Colors.red)),
                  Container(width: 1, height: 30, color: Colors.grey[300]),
                  Expanded(child: _buildStatItem("Resolved", "${filteredIncidents.where((i) => i['status'] == 'resolved').length}", Colors.green)),
                ],
              ),
            ),
          ),

          
          Positioned(
            bottom: _showActiveAlerts ? 280 : 30, 
            left: 20, right: 20,
            child: Center(
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: _isDarkMap ? const Color(0xFF1E1E1E).withOpacity(0.9) : Colors.white.withOpacity(0.9),
                  borderRadius: BorderRadius.circular(30),
                  boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 15, offset: const Offset(0,5))],
                  border: Border.all(color: _isDarkMap ? Colors.grey[800]! : Colors.white)
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _buildControlBtn(Icons.map, "Map", !_showHeatmap, () => setState(() => _showHeatmap = false)),
                    const SizedBox(width: 8),
                    _buildControlBtn(Icons.local_fire_department, "Heatmap", _showHeatmap, () => setState(() => _showHeatmap = true)),
                    Container(height: 20, width: 1, color: Colors.grey[300], margin: const EdgeInsets.symmetric(horizontal: 12)),
                    _buildIconToggle(Icons.dark_mode, _isDarkMap, () => setState(() => _isDarkMap = !_isDarkMap)),
                    const SizedBox(width: 8),
                    _buildIconToggle(Icons.refresh, false, () => provider.fetchMapIncidents()),
                  ],
                ),
              ),
            ),
          ),

          
          _buildActiveAlertsSheet(filteredIncidents),
        ],
      ),
    );
  }

  

  Widget _buildFilterChips(List<dynamic> incidents) {
    final categories = ['all', ...{...incidents.map((i) => i['category'] as String)}];
    
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 200),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.end,
        mainAxisSize: MainAxisSize.min,
        children: [
          
          Wrap(
            spacing: 6,
            runSpacing: 6,
            alignment: WrapAlignment.end,
            children: ['all', 'pending', 'in-progress', 'resolved'].map((status) {
              bool isSelected = _selectedStatus == status;
              return GestureDetector(
                onTap: () => setState(() => _selectedStatus = status),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: isSelected ? Colors.indigoAccent : (_isDarkMap ? Colors.grey[850] : Colors.white),
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 4)]
                  ),
                  child: Text(
                    status.toUpperCase(),
                    style: TextStyle(
                      color: isSelected ? Colors.white : (_isDarkMap ? Colors.white70 : Colors.black87),
                      fontSize: 9,
                      fontWeight: FontWeight.bold
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 6),
          
          Wrap(
            spacing: 6,
            runSpacing: 6,
            alignment: WrapAlignment.end,
            children: categories.take(4).map((category) {
              bool isSelected = _selectedCategory == category;
              return GestureDetector(
                onTap: () => setState(() => _selectedCategory = category),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: isSelected ? Colors.orangeAccent : (_isDarkMap ? Colors.grey[850] : Colors.white),
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 4)]
                  ),
                  child: Text(
                    category.toString().toUpperCase(),
                    style: TextStyle(
                      color: isSelected ? Colors.white : (_isDarkMap ? Colors.white70 : Colors.black87),
                      fontSize: 9,
                      fontWeight: FontWeight.bold
                    ),
                    overflow: TextOverflow.ellipsis,
                    maxLines: 1,
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildActiveAlertsSheet(List<dynamic> incidents) {
    return AnimatedPositioned(
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
      bottom: 0,
      left: 0,
      right: 0,
      height: _showActiveAlerts ? 250 : 70,
      child: GestureDetector(
        onTap: () => setState(() => _showActiveAlerts = !_showActiveAlerts),
        child: Container(
          decoration: BoxDecoration(
            color: _isDarkMap ? const Color(0xFF1E1E1E) : Colors.white,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(30)),
            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 20, offset: const Offset(0, -5))]
          ),
          child: Column(
            children: [
              
              Container(
                padding: const EdgeInsets.symmetric(vertical: 16),
                child: Column(
                  children: [
                    Container(
                      width: 40, height: 4,
                      decoration: BoxDecoration(
                        color: Colors.grey,
                        borderRadius: BorderRadius.circular(2)
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.redAccent,
                            borderRadius: BorderRadius.circular(20)
                          ),
                          child: Text(
                            "${incidents.length} ACTIVE ALERTS",
                            style: GoogleFonts.poppins(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                              letterSpacing: 1.2
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Icon(
                          _showActiveAlerts ? Icons.expand_more : Icons.expand_less,
                          color: _isDarkMap ? Colors.white : Colors.black87,
                        )
                      ],
                    ),
                  ],
                ),
              ),
              
              
              if (_showActiveAlerts)
                Expanded(
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: incidents.length,
                    itemBuilder: (context, index) {
                      final incident = incidents[index];
                      return GestureDetector(
                        onTap: () {
                          _mapController.move(LatLng(incident['lat'], incident['lng']), 16.0);
                          _showTopSecretDetails(incident);
                        },
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: _isDarkMap ? Colors.grey[850] : Colors.grey[100],
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: _getStatusColor(incident['status']).withOpacity(0.3),
                              width: 2
                            )
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 8, height: 8,
                                decoration: BoxDecoration(
                                  color: _getStatusColor(incident['status']),
                                  shape: BoxShape.circle
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      incident['title'] ?? 'Unknown',
                                      style: GoogleFonts.poppins(
                                        fontWeight: FontWeight.w600,
                                        fontSize: 13,
                                        color: _isDarkMap ? Colors.white : Colors.black87
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      incident['category']?.toString().toUpperCase() ?? 'OTHER',
                                      style: TextStyle(
                                        fontSize: 10,
                                        color: _isDarkMap ? Colors.white54 : Colors.black54,
                                        fontWeight: FontWeight.w500
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              Icon(
                                Icons.location_on,
                                size: 20,
                                color: _getStatusColor(incident['status']),
                              )
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildControlBtn(IconData icon, String label, bool isActive, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isActive ? (_isDarkMap ? Colors.indigoAccent : Colors.black87) : Colors.transparent,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Row(
          children: [
            Icon(icon, size: 16, color: isActive ? Colors.white : (_isDarkMap ? Colors.white70 : Colors.black87)),
            const SizedBox(width: 6),
            Text(label, style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 12, color: isActive ? Colors.white : (_isDarkMap ? Colors.white70 : Colors.black87))),
          ],
        ),
      ),
    );
  }

  Widget _buildIconToggle(IconData icon, bool isActive, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: isActive ? Colors.indigoAccent : (_isDarkMap ? Colors.grey[800] : Colors.grey[100]),
          shape: BoxShape.circle,
        ),
        child: Icon(icon, size: 18, color: isActive ? Colors.white : (_isDarkMap ? Colors.white70 : Colors.grey)),
      ),
    );
  }

  List<Marker> _buildMarkersWithClustering(List<dynamic> incidents) {
    Map<String, List<dynamic>> clusters = {};
    
    for (var incident in incidents) {
      String key = "${incident['lat'].toStringAsFixed(4)}_${incident['lng'].toStringAsFixed(4)}";
      clusters[key] = [...(clusters[key] ?? []), incident];
    }

    return clusters.entries.map((entry) {
      final clusterIncidents = entry.value;
      final firstIncident = clusterIncidents.first;
      
      return Marker(
        point: LatLng(firstIncident['lat'], firstIncident['lng']),
        width: 60,
        height: 60,
        child: GestureDetector(
          onTap: () {
            if (clusterIncidents.length > 1) {
              _showClusterList(clusterIncidents);
            } else {
              _showTopSecretDetails(firstIncident);
            }
          },
          child: Stack(
            alignment: Alignment.center,
            children: [
              
              ScaleTransition(
                scale: Tween(begin: 0.5, end: 1.0).animate(_pulseController),
                child: Container(
                  width: 60, height: 60,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: _getStatusColor(firstIncident['status']).withOpacity(0.3),
                  ),
                ),
              ),
              
              Container(
                width: 16, height: 16,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: _getStatusColor(firstIncident['status']),
                  border: Border.all(color: Colors.white, width: 2),
                  boxShadow: [BoxShadow(color: _getStatusColor(firstIncident['status']), blurRadius: 6)]
                ),
              ),
              
              if (clusterIncidents.length > 1)
                Positioned(
                  top: 0, right: 0,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: Colors.redAccent,
                      shape: BoxShape.circle,
                    ),
                    child: Text(
                      '${clusterIncidents.length}',
                      style: const TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
            ],
          ),
        ),
      );
    }).toList();
  }

  void _showClusterList(List<dynamic> incidents) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => Container(
        height: 400,
        decoration: BoxDecoration(
          color: _isDarkMap ? const Color(0xFF1E1E1E) : Colors.white,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(30))
        ),
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey, borderRadius: BorderRadius.circular(2)))),
            const SizedBox(height: 16),
            Text(
              "${incidents.length} Incidents at this location",
              style: GoogleFonts.poppins(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: _isDarkMap ? Colors.white : Colors.black87
              ),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: ListView.builder(
                itemCount: incidents.length,
                itemBuilder: (context, index) {
                  final incident = incidents[index];
                  return GestureDetector(
                    onTap: () {
                      Navigator.pop(context);
                      _showTopSecretDetails(incident);
                    },
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: _isDarkMap ? Colors.grey[850] : Colors.grey[100],
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: _getStatusColor(incident['status']).withOpacity(0.3),
                          width: 2
                        )
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 8, height: 8,
                            decoration: BoxDecoration(
                              color: _getStatusColor(incident['status']),
                              shape: BoxShape.circle
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  incident['title'] ?? 'Unknown',
                                  style: GoogleFonts.poppins(
                                    fontWeight: FontWeight.w600,
                                    fontSize: 13,
                                    color: _isDarkMap ? Colors.white : Colors.black87
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  "${incident['category']} • ${incident['status']}",
                                  style: TextStyle(
                                    fontSize: 11,
                                    color: _isDarkMap ? Colors.white54 : Colors.black54
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const Icon(Icons.chevron_right, size: 20)
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  List<CircleMarker> _buildHeatmapCircles(List<dynamic> incidents) {
    return incidents.map((i) {
      return CircleMarker(
        point: LatLng(i['lat'], i['lng']),
        radius: 120,
        useRadiusInMeter: true,
        color: Colors.red.withOpacity(0.15),
        borderStrokeWidth: 0,
      );
    }).toList();
  }

  Color _getStatusColor(String? status) {
    if (status == 'pending') return const Color(0xFFFF5252);
    if (status == 'in-progress') return const Color(0xFFFFB74D);
    return const Color(0xFF69F0AE);
  }

  void _showTopSecretDetails(Map<String, dynamic> incident) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => Container(
        height: 400,
        decoration: BoxDecoration(
           color: _isDarkMap ? const Color(0xFF1E1E1E) : Colors.white,
           borderRadius: const BorderRadius.vertical(top: Radius.circular(30))
        ),
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey, borderRadius: BorderRadius.circular(2)))),
            const SizedBox(height: 24),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    border: Border.all(color: _getStatusColor(incident['status'])),
                    borderRadius: BorderRadius.circular(6)
                  ),
                  child: Text(incident['status']?.toUpperCase() ?? 'UNKNOWN', style: TextStyle(color: _getStatusColor(incident['status']), letterSpacing: 1.2, fontSize: 10, fontWeight: FontWeight.bold)),
                ),
                const Spacer(),
                Text(incident['timestamp'] ?? 'NOW', style: TextStyle(color: _isDarkMap ? Colors.white54 : Colors.grey)),
              ],
            ),
            const SizedBox(height: 16),
            Text(incident['title'] ?? 'INCIDENT REPORT', style: GoogleFonts.oswald(fontSize: 28, fontWeight: FontWeight.bold, color: _isDarkMap ? Colors.white : Colors.black87)),
            const SizedBox(height: 8),
            Text("Category: ${incident['category']}", style: TextStyle(color: _isDarkMap ? Colors.white70 : Colors.black54)),
            const SizedBox(height: 24),
            
            
            if (incident['imageUrl'] != null && incident['imageUrl'].isNotEmpty)
               ClipRRect(
                 borderRadius: BorderRadius.circular(16),
                 child: Image.network(
                   "${ApiService.baseUrl.replaceAll('/api/v1', '')}${incident['imageUrl']}",
                   height: 150,
                   width: double.infinity,
                   fit: BoxFit.cover,
                 ),
               )
             else 
               Container(
                 height: 100, width: double.infinity,
                 decoration: BoxDecoration(color: Colors.grey[200], borderRadius: BorderRadius.circular(16)),
                 child: const Center(child: Icon(Icons.image_not_supported, color: Colors.grey)),
               )
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(String label, String value, Color color) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(value, style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.bold, color: color)),
        const SizedBox(height: 4),
        Text(label, style: GoogleFonts.poppins(fontSize: 10, color: _isDarkMap ? Colors.white70 : Colors.grey[600])),
      ],
    );
  }
}

