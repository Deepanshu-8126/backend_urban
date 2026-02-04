import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_map_cancellable_tile_provider/flutter_map_cancellable_tile_provider.dart';
import 'package:latlong2/latlong.dart' hide Path;
import 'dart:async';
import 'package:geolocator/geolocator.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:ui'; 
import '../../core/api_service.dart';

class GrievanceMapScreen extends StatefulWidget {
  const GrievanceMapScreen({super.key});

  @override
  State<GrievanceMapScreen> createState() => _GrievanceMapScreenState();
}

class _GrievanceMapScreenState extends State<GrievanceMapScreen> with TickerProviderStateMixin {
  
  bool _isLoading = true;
  List<dynamic> _incidents = [];
  Timer? _timer;
  
  
  String? _selectedStatus; 
  String? _selectedCategory;
  int _selectedHours = 168; 

  
  bool _showHeatmap = false; 
  bool _isDarkMap = false; 
  bool _showActiveAlerts = false;

  
  
  LatLng _userLocation = const LatLng(29.2183, 79.5130);
  final MapController _mapController = MapController();
  
  
  late AnimationController _pulseController;
  late ScrollController _tickerScrollController;
  Timer? _tickerTimer;

  
  final List<Map<String, dynamic>> _categories = [
    {'name': 'All', 'value': null, 'icon': Icons.apps, 'color': Colors.blue},
    {'name': 'Garbage', 'value': 'garbage', 'icon': Icons.delete, 'color': Colors.orange},
    {'name': 'Water', 'value': 'water', 'icon': Icons.water_drop, 'color': Colors.cyan},
    {'name': 'Roads', 'value': 'road', 'icon': Icons.route, 'color': Colors.brown},
    {'name': 'Electricity', 'value': 'electricity', 'icon': Icons.bolt, 'color': Colors.yellow},
    {'name': 'Health', 'value': 'health', 'icon': Icons.local_hospital, 'color': Colors.red},
  ];

  final List<Map<String, dynamic>> _statuses = [
    {'name': 'All', 'value': null},
    {'name': 'Pending', 'value': 'pending'},
    {'name': 'In Progress', 'value': 'in-progress'},
    {'name': 'Resolved', 'value': 'resolved'},
  ];

  final List<Map<String, dynamic>> _timeFilters = [
    {'name': '24 Hours', 'value': 24, 'icon': Icons.access_time},
    {'name': '7 Days', 'value': 168, 'icon': Icons.calendar_today},
    {'name': '30 Days', 'value': 720, 'icon': Icons.calendar_month},
  ];
  
  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(vsync: this, duration: const Duration(seconds: 2))..repeat(reverse: true);
    _tickerScrollController = ScrollController();
    
    _determinePosition(); 
    _fetchIncidents();
    _timer = Timer.periodic(const Duration(seconds: 60), (_) => _fetchIncidents(silent: true));
    
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
    _timer?.cancel();
    _pulseController.dispose();
    _tickerTimer?.cancel();
    _tickerScrollController.dispose();
    super.dispose();
  }

  Future<void> _determinePosition() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) return;

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) return;
    }

    if (permission == LocationPermission.deniedForever) return;

    Position position = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.best);
    
    if (mounted) {
      setState(() {
        _userLocation = LatLng(position.latitude, position.longitude);
      });
    }
  }

  Future<void> _fetchIncidents({bool silent = false}) async {
    if (!silent) setState(() => _isLoading = true);

    try {
      final response = await ApiService.getLiveIncidents(
        hours: _selectedHours,
        status: _selectedStatus,
        category: _selectedCategory,
      ).catchError((e) {
        debugPrint('Incidents API error: $e');
        return <String, dynamic>{'success': false, 'incidents': []};
      });

      if (mounted) {
        setState(() {
          if (response.containsKey('incidents')) {
            _incidents = List<dynamic>.from(response['incidents'] ?? []);
          } else {
            _incidents = [];
          }
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  Widget build(BuildContext context) {
    
    final bottomPadding = _showActiveAlerts ? 270.0 : 90.0;
    
    return Scaffold(
      key: _scaffoldKey,
      endDrawer: _buildFilterDrawer(),
      body: Stack(
        children: [
          
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              center: _userLocation,
              zoom: 14.0,
            ),
            children: [
              TileLayer(
                
                urlTemplate: _isDarkMap 
                    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' 
                    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
                subdomains: const ['a', 'b', 'c'],
                userAgentPackageName: 'com.urban.app',
                retinaMode: true,
                tileProvider: CancellableNetworkTileProvider(),
                
              ),
              
              
              if (_showHeatmap)
                CircleLayer(
                  circles: _incidents.where((incident) {
                    return incident['lat'] != null && incident['lng'] != null;
                  }).map((incident) {
                    final lat = (incident['lat'] as num?)?.toDouble() ?? 29.2183;
                    final lng = (incident['lng'] as num?)?.toDouble() ?? 79.5130;
                    return CircleMarker(
                      point: LatLng(lat, lng),
                      radius: 80, 
                      useRadiusInMeter: true,
                      color: _isDarkMap 
                          ? Colors.cyanAccent.withOpacity(0.2) 
                          : Colors.orange.withOpacity(0.3),
                      borderStrokeWidth: 0,
                    );
                  }).toList(),
                ),

              
              MarkerLayer(
                markers: [
                  Marker(
                    point: _userLocation,
                    width: 100, height: 100, 
                    child: _buildUserLocationMarker(),
                  ),
                ],
              ),

              
              if (!_showHeatmap)
                MarkerLayer(
                  markers: _buildClusteredMarkers(),
                ),
            ],
          ),

          
          Positioned(
            top: 50, left: 16, right: 16,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(30),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 5.0, sigmaY: 5.0),
                child: Container(
                  height: 48,
                  decoration: BoxDecoration(
                    color: _isDarkMap ? Colors.black.withOpacity(0.4) : Colors.white.withOpacity(0.7),
                    borderRadius: BorderRadius.circular(30),
                    border: Border.all(
                      color: _isDarkMap ? Colors.white.withOpacity(0.1) : Colors.white.withOpacity(0.5)
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1), 
                        blurRadius: 20,
                        offset: const Offset(0, 10)
                      )
                    ]
                  ),
                  clipBehavior: Clip.hardEdge,
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        margin: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(colors: [Colors.redAccent, Colors.deepOrange]),
                          borderRadius: BorderRadius.circular(24),
                          boxShadow: [BoxShadow(color: Colors.redAccent.withOpacity(0.4), blurRadius: 8)]
                        ),
                        alignment: Alignment.center,
                        child: Text("LIVE ALERT", style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11, letterSpacing: 1)),
                      ),
                      Expanded(
                        child: _incidents.isEmpty 
                          ? Padding(
                              padding: const EdgeInsets.only(left: 12),
                              child: Text(
                                "City status normal. No active alerts.", 
                                style: TextStyle(
                                  color: _isDarkMap ? Colors.white70 : Colors.black54, 
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500
                                )
                              )
                            )
                          : ListView.builder(
                              controller: _tickerScrollController,
                              scrollDirection: Axis.horizontal,
                              itemCount: _incidents.length * 10,
                              itemBuilder: (context, index) {
                                final i = _incidents[index % _incidents.length];
                                return Container(
                                  margin: const EdgeInsets.only(right: 24),
                                  alignment: Alignment.center,
                                  child: Row(
                                    children: [
                                      Icon(_getCategoryIcon(i['category'] ?? ''), size: 14, color: _getCategoryColor(i['category'] ?? '')),
                                      const SizedBox(width: 6),
                                      Text(
                                         "${i['category'].toString().toUpperCase()}: ",
                                         style: GoogleFonts.robotoMono(
                                           color: _getCategoryColor(i['category'] ?? ''), 
                                           fontSize: 12, 
                                           fontWeight: FontWeight.bold
                                         )
                                      ),
                                      Text(
                                         i['title'],
                                         style: GoogleFonts.roboto(
                                           color: _isDarkMap ? Colors.white : Colors.black87, 
                                           fontSize: 12
                                         )
                                      ),
                                    ],
                                  ),
                                );
                              },
                            ),
                      )
                    ],
                  ),
                ),
              ),
            ),
          ),

          
          Positioned(
            top: 110, right: 16,
            child: GestureDetector(
              onTap: () => _scaffoldKey.currentState?.openEndDrawer(),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [Colors.indigoAccent, Colors.blueAccent]),
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.indigoAccent.withOpacity(0.4), 
                      blurRadius: 10,
                      offset: const Offset(0, 4)
                    )
                  ],
                  border: Border.all(color: Colors.white.withOpacity(0.1))
                ),
                child: const Icon(
                  Icons.tune_rounded,
                  color: Colors.white,
                  size: 24,
                ),
              ),
            ),
          ),

          
          Positioned(
            bottom: bottomPadding + 20, 
            left: 0,
            right: 0,
            child: Center(
              child: ClipRRect(
                borderRadius: BorderRadius.circular(40),
                child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 5.0, sigmaY: 5.0),
                  child: Container(
                    constraints: const BoxConstraints(maxWidth: 380), 
                    margin: const EdgeInsets.symmetric(horizontal: 20),
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                    decoration: BoxDecoration(
                      color: _isDarkMap ? Colors.black.withOpacity(0.6) : Colors.white.withOpacity(0.8),
                      borderRadius: BorderRadius.circular(40),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.2), 
                          blurRadius: 30, 
                          spreadRadius: 5,
                          offset: const Offset(0, 10)
                        )
                      ],
                      border: Border.all(
                        color: Colors.white.withOpacity(0.1), 
                        width: 1
                      )
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        _buildIconToggle(Icons.map_rounded, !_showHeatmap, () => setState(() => _showHeatmap = false)),
                        const SizedBox(width: 8),
                        _buildIconToggle(Icons.local_fire_department_rounded, _showHeatmap, () => setState(() => _showHeatmap = true)),
                        Container(
                          height: 24, 
                          width: 1, 
                          color: _isDarkMap ? Colors.white24 : Colors.black12, 
                          margin: const EdgeInsets.symmetric(horizontal: 12)
                        ),
                        _buildIconToggle(
                          _isDarkMap ? Icons.light_mode_rounded : Icons.dark_mode_rounded, 
                          true, 
                          () => setState(() => _isDarkMap = !_isDarkMap),
                          colorOverride: _isDarkMap ? Colors.amber : Colors.indigo
                        ),
                        const SizedBox(width: 8),
                        _buildIconToggle(Icons.my_location_rounded, false, () {
                          _determinePosition();
                          _mapController.move(_userLocation, 15);
                        }),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),

          
          _buildActiveAlertsSheet(),

          if (_isLoading)
            const Center(child: CircularProgressIndicator(color: Colors.indigo)),
        ],
      ),
    );
  }

  Widget _buildFilterDrawer() {
    return Drawer(
      width: 300,
      backgroundColor: _isDarkMap ? const Color(0xFF0F172A) : Colors.white,
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.fromLTRB(20, 50, 20, 20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: _isDarkMap 
                  ? [Colors.blueGrey[900]!, Colors.blueGrey[800]!] 
                  : [Colors.blueAccent, Colors.indigoAccent]
              )
            ),
            child: Row(
              children: [
                const Icon(Icons.tune, color: Colors.white, size: 28),
                const SizedBox(width: 12),
                Text(
                  "FILTERS", 
                  style: GoogleFonts.robotoMono(
                    fontWeight: FontWeight.bold, 
                    fontSize: 20, 
                    color: Colors.white,
                    letterSpacing: 2
                  )
                ),
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.close, color: Colors.white),
                  onPressed: () => Navigator.pop(context),
                )
              ],
            ),
          ),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text("TIME RANGE", style: GoogleFonts.robotoMono(fontWeight: FontWeight.bold, fontSize: 12, color: _isDarkMap ? Colors.white54 : Colors.grey[600], letterSpacing: 1.5)),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 12,
                    runSpacing: 12,
                    children: _timeFilters.map((time) {
                      final isSelected = _selectedHours == time['value'];
                      return GestureDetector(
                        onTap: () {
                          setState(() => _selectedHours = time['value']);
                          _fetchIncidents();
                        },
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                          decoration: BoxDecoration(
                            gradient: isSelected 
                              ? const LinearGradient(colors: [Colors.blueAccent, Colors.indigoAccent])
                              : null,
                            color: isSelected ? null : (_isDarkMap ? Colors.white.withOpacity(0.05) : Colors.grey[100]),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: isSelected ? Colors.transparent : Colors.grey.withOpacity(0.2))
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(time['icon'], size: 14, color: isSelected ? Colors.white : (_isDarkMap ? Colors.white70 : Colors.black54)),
                              const SizedBox(width: 8),
                              Text(time['name'], style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w600, color: isSelected ? Colors.white : (_isDarkMap ? Colors.white70 : Colors.black87))),
                            ],
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 30),
                  Text("STATUS", style: GoogleFonts.robotoMono(fontWeight: FontWeight.bold, fontSize: 12, color: _isDarkMap ? Colors.white54 : Colors.grey[600], letterSpacing: 1.5)),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 12,
                    runSpacing: 12,
                    children: _statuses.map((status) {
                      final isSelected = _selectedStatus == status['value'];
                      return GestureDetector(
                        onTap: () {
                          setState(() => _selectedStatus = status['value']);
                          _fetchIncidents();
                        },
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                          decoration: BoxDecoration(
                            gradient: isSelected 
                              ? const LinearGradient(colors: [Colors.orangeAccent, Colors.deepOrange])
                              : null,
                            color: isSelected ? null : (_isDarkMap ? Colors.white.withOpacity(0.05) : Colors.grey[100]),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: isSelected ? Colors.transparent : Colors.grey.withOpacity(0.2))
                          ),
                          child: Text(status['name'], style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w600, color: isSelected ? Colors.white : (_isDarkMap ? Colors.white70 : Colors.black87))),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 30),
                  Text("CATEGORY", style: GoogleFonts.robotoMono(fontWeight: FontWeight.bold, fontSize: 12, color: _isDarkMap ? Colors.white54 : Colors.grey[600], letterSpacing: 1.5)),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 12,
                    runSpacing: 12,
                    children: _categories.map((cat) {
                      final isSelected = _selectedCategory == cat['value'];
                      return GestureDetector(
                        onTap: () {
                          setState(() => _selectedCategory = cat['value']);
                          _fetchIncidents();
                        },
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                          decoration: BoxDecoration(
                            color: isSelected ? cat['color'].withOpacity(0.2) : (_isDarkMap ? Colors.white.withOpacity(0.05) : Colors.grey[100]),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: isSelected ? cat['color'] : Colors.grey.withOpacity(0.2),
                              width: isSelected ? 1.5 : 1
                            )
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(cat['icon'], size: 16, color: isSelected ? cat['color'] : (_isDarkMap ? Colors.white70 : Colors.black54)),
                              const SizedBox(width: 8),
                              Text(cat['name'], style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w600, color: isSelected ? cat['color'] : (_isDarkMap ? Colors.white70 : Colors.black87))),
                            ],
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),
          )
        ],
      ),
    );
  }

  Widget _buildActiveAlertsSheet() {
    return AnimatedPositioned(
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
      bottom: 0,
      left: 0,
      right: 0,
      height: _showActiveAlerts ? 250 : 65,
      child: GestureDetector(
        onTap: () => setState(() => _showActiveAlerts = !_showActiveAlerts),
        child: Container(
          decoration: BoxDecoration(
            color: _isDarkMap ? const Color(0xFF1E1E1E) : Colors.white,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(30)),
            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 20, offset: const Offset(0, -5))]
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              
              Container(
                padding: const EdgeInsets.symmetric(vertical: 12),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 40, height: 4,
                      decoration: BoxDecoration(
                        color: Colors.grey,
                        borderRadius: BorderRadius.circular(2)
                      ),
                    ),
                    const SizedBox(height: 8),
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
                            "${_incidents.length} ACTIVE ALERTS",
                            style: GoogleFonts.poppins(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 11,
                              letterSpacing: 1.2
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Icon(
                          _showActiveAlerts ? Icons.expand_more : Icons.expand_less,
                          color: _isDarkMap ? Colors.white : Colors.black87,
                          size: 20,
                        )
                      ],
                    ),
                  ],
                ),
              ),
              
              
              if (_showActiveAlerts)
                Expanded(
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    itemCount: _incidents.length,
                    itemBuilder: (context, index) {
                      final incident = _incidents[index];
                      return GestureDetector(
                        onTap: () {
                          _mapController.move(LatLng(incident['lat'], incident['lng']), 16.0);
                          _showIncidentCard(incident);
                        },
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 10),
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: _isDarkMap ? Colors.grey[850] : Colors.grey[100],
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: _getCategoryColor(incident['category'] ?? '').withOpacity(0.3),
                              width: 2
                            )
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 8, height: 8,
                                decoration: BoxDecoration(
                                  color: _getCategoryColor(incident['category'] ?? ''),
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
                                        fontSize: 12,
                                        color: _isDarkMap ? Colors.white : Colors.black87
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      incident['category']?.toString().toUpperCase() ?? 'OTHER',
                                      style: TextStyle(
                                        fontSize: 9,
                                        color: _isDarkMap ? Colors.white54 : Colors.black54,
                                        fontWeight: FontWeight.w500
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              Icon(
                                Icons.location_on,
                                size: 18,
                                color: _getCategoryColor(incident['category'] ?? ''),
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

  List<Marker> _buildClusteredMarkers() {
    Map<String, List<dynamic>> clusters = {};
    
    
    for (var incident in _incidents) {
      if (incident['lat'] == null || incident['lng'] == null) continue;
      
      final lat = (incident['lat'] as num?)?.toDouble() ?? 29.2183;
      final lng = (incident['lng'] as num?)?.toDouble() ?? 79.5130;
      
      String key = "${lat.toStringAsFixed(4)}_${lng.toStringAsFixed(4)}";
      clusters[key] = [...(clusters[key] ?? []), incident];
    }

    return clusters.entries.map((entry) {
      final clusterIncidents = entry.value;
      final firstIncident = clusterIncidents.first;
      
      
      final lat = (firstIncident['lat'] as num?)?.toDouble() ?? 29.2183;
      final lng = (firstIncident['lng'] as num?)?.toDouble() ?? 79.5130;
      
      return Marker(
        point: LatLng(lat, lng),
        width: 60, 
        height: 60,
        child: GestureDetector(
          onTap: () {
            if (clusterIncidents.length > 1) {
              _showClusterList(clusterIncidents);
            } else {
              _showIncidentCard(firstIncident);
            }
          },
          child: Stack(
            alignment: Alignment.center,
            children: [
              _buildAnimatedMarker(firstIncident),
              if (clusterIncidents.length > 1)
                Positioned(
                  top: 0, right: 0,
                  child: Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(colors: [Colors.redAccent, Colors.deepOrange]),
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 2),
                      boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 4)]
                    ),
                    child: Text(
                      '${clusterIncidents.length}',
                      style: GoogleFonts.poppins(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
            ],
          ),
        ),
      );
    }).toList();
  }

  Widget _buildAnimatedMarker(dynamic incident) {
    Color color = _getCategoryColor(incident['category'] ?? '');
    IconData icon = _getCategoryIcon(incident['category'] ?? '');
    
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0.0, end: 1.0),
      duration: const Duration(milliseconds: 500),
      curve: Curves.elasticOut,
      builder: (context, value, child) {
        return Transform.scale(
          scale: value,
          child: Container(
            width: 48, height: 48,
            decoration: BoxDecoration(
              color: color.withOpacity(0.9),
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white, width: 3),
              boxShadow: [
                BoxShadow(
                  color: color.withOpacity(0.4),
                  blurRadius: 12,
                  offset: const Offset(0, 4)
                )
              ]
            ),
            child: Icon(icon, color: Colors.white, size: 24),
          ),
        );
      },
    );
  }

  void _showClusterList(List<dynamic> incidents) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => Container(
        constraints: BoxConstraints(
          maxHeight: MediaQuery.of(context).size.height * 0.7,
        ),
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
                      _showIncidentCard(incident);
                    },
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: _isDarkMap ? Colors.grey[850] : Colors.grey[100],
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: _getCategoryColor(incident['category'] ?? '').withOpacity(0.3),
                          width: 2
                        )
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 8, height: 8,
                            decoration: BoxDecoration(
                              color: _getCategoryColor(incident['category'] ?? ''),
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
                                  style: GoogleFonts.robotoMono(
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

  Widget _buildIconToggle(IconData icon, bool isActive, VoidCallback onTap, {Color? colorOverride}) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeOut, 
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isActive 
            ? (colorOverride ?? (_isDarkMap ? Colors.indigoAccent : Colors.black87)) 
            : Colors.transparent, 
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: (colorOverride ?? (_isDarkMap ? Colors.indigoAccent : Colors.black87)).withOpacity(isActive ? 0.4 : 0.0),
              blurRadius: isActive ? 12.0 : 0.0, 
              offset: const Offset(0, 4)
            )
          ],
          border: Border.all(
            color: isActive ? Colors.transparent : (_isDarkMap ? Colors.white24 : Colors.black12),
            width: 1.5
          )
        ),
        child: Icon(
          icon, 
          size: 24, 
          color: isActive 
            ? Colors.white 
            : (_isDarkMap ? Colors.white70 : Colors.black54)
        ),
      ),
    );
  }

  Widget _buildUserLocationMarker() {
    return Stack(
      alignment: Alignment.center,
      children: [
        
        ScaleTransition(
          scale: Tween(begin: 1.0, end: 2.5).animate(_pulseController),
          child: FadeTransition(
            opacity: Tween(begin: 0.5, end: 0.0).animate(_pulseController),
            child: Container(
              width: 100, height: 100,
              decoration: BoxDecoration(
                shape: BoxShape.circle, 
                color: Colors.blueAccent.withOpacity(0.3)
              ),
            ),
          ),
        ),
        
        Container(
          width: 24, height: 24,
          decoration: BoxDecoration(
            color: Colors.blueAccent,
            shape: BoxShape.circle,
            border: Border.all(color: Colors.white, width: 3),
            boxShadow: [
              BoxShadow(
                color: Colors.blueAccent.withOpacity(0.5), 
                blurRadius: 10,
                spreadRadius: 2
              )
            ],
          ),
          child: const Center(
            child: Icon(Icons.navigation, size: 12, color: Colors.white)
          ),
        ),
      ],
    );
  }

  Color _getCategoryColor(String category) {
    switch (category.toLowerCase()) {
      case 'garbage': return Colors.orange;
      case 'water': return Colors.cyan;
      case 'road': return Colors.brown;
      case 'electricity': return Colors.yellow[700]!;
      case 'health': return Colors.red;
      default: return Colors.blue;
    }
  }

  IconData _getCategoryIcon(String category) {
     switch (category.toLowerCase()) {
      case 'garbage': return Icons.delete;
      case 'water': return Icons.water_drop;
      case 'road': return Icons.add_road;
      case 'electricity': return Icons.bolt;
      case 'health': return Icons.local_hospital;
      default: return Icons.report_problem;
    }
  }

  void _showIncidentCard(Map<String, dynamic> incident) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        constraints: BoxConstraints(
          maxHeight: MediaQuery.of(context).size.height * 0.7,
        ),
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
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: _getCategoryColor(incident['category']?.toString() ?? 'other').withOpacity(0.1), 
                    borderRadius: BorderRadius.circular(12)
                  ),
                  child: Icon(
                    _getCategoryIcon(incident['category']?.toString() ?? 'other'), 
                    color: _getCategoryColor(incident['category']?.toString() ?? 'other')
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        (incident['category']?.toString() ?? 'OTHER').toUpperCase(), 
                        style: GoogleFonts.poppins(
                          color: Colors.grey, 
                          fontSize: 12, 
                          fontWeight: FontWeight.bold
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      Text(
                        incident['title']?.toString() ?? 'Incident', 
                        style: GoogleFonts.poppins(
                          fontSize: 20, 
                          fontWeight: FontWeight.bold, 
                          color: _isDarkMap ? Colors.white : Colors.black
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                )
              ],
            ),
            Expanded(
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 20),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.location_on, size: 16, color: Colors.grey),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            incident['address']?.toString() ?? 'Unknown Location', 
                            style: GoogleFonts.roboto(color: _isDarkMap ? Colors.white70 : Colors.black87),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          )
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Text(
                      "Description",
                      style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.grey),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      incident['description']?.toString() ?? 'No description available for this incident.',
                      style: GoogleFonts.roboto(color: _isDarkMap ? Colors.white60 : Colors.black87),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(
                   backgroundColor: _getCategoryColor(incident['category'] ?? ''),
                   shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                   padding: const EdgeInsets.symmetric(vertical: 16)
                ),
                child: Text("CLOSE", style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
            )
          ],
        ),
      ),
    );
  }
}
