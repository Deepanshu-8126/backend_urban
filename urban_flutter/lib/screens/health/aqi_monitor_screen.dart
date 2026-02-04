import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import 'dart:ui';
import '../../core/api_service.dart';

class AqiMonitorScreen extends StatefulWidget {
  const AqiMonitorScreen({super.key});

  @override
  State<AqiMonitorScreen> createState() => _AqiMonitorScreenState();
}

class _AqiMonitorScreenState extends State<AqiMonitorScreen> {
  bool isLoading = true;
  Map<String, dynamic>? aqiData;
  String errorMessage = '';
  String locationName = 'Fetching location...';

  @override
  void initState() {
    super.initState();
    _fetchAQI();
  }

  Future<void> _fetchAQI() async {
    setState(() {
      isLoading = true;
      errorMessage = '';
    });

    try {
      
      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
      
      
      String fetchedLocationName = 'Current Location';
      try {
        List<Placemark> placemarks = await placemarkFromCoordinates(
          position.latitude, 
          position.longitude
        );
        
        if (placemarks.isNotEmpty) {
          Placemark place = placemarks[0];
          
          List<String> locationParts = [];
          
          if (place.locality != null && place.locality!.isNotEmpty) {
            locationParts.add(place.locality!);
          }
          if (place.subLocality != null && place.subLocality!.isNotEmpty) {
            locationParts.add(place.subLocality!);
          }
          if (place.administrativeArea != null && place.administrativeArea!.isNotEmpty) {
            locationParts.add(place.administrativeArea!);
          }
          
          fetchedLocationName = locationParts.isNotEmpty 
            ? locationParts.join(', ') 
            : place.locality ?? place.subAdministrativeArea ?? "Current Location";
        }
      } catch (e) {
        
        fetchedLocationName = "Lat: ${position.latitude.toStringAsFixed(2)}, Lng: ${position.longitude.toStringAsFixed(2)}";
      }
      
      
      final data = await ApiService.fetchAQIData(position.latitude, position.longitude);
      
      if (mounted) {
        setState(() {
          isLoading = false;
          locationName = fetchedLocationName;
          
          if (data['success'] == true) {
            aqiData = data['data'];
          } else {
            errorMessage = data['error'] ?? "Failed to fetch AQI data";
          }
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          isLoading = false;
          errorMessage = e.toString().contains('location') 
            ? "Please enable Location Services in Settings"
            : "Error: ${e.toString()}";
        });
      }
    }
  }

  Color _getStatusColor(String? status) {
    switch (status) {
      case 'Good': return Colors.teal;
      case 'Moderate': return Colors.amber;
      case 'Unhealthy for Sensitive Groups': return Colors.orange;
      case 'Unhealthy': return Colors.redAccent;
      case 'Very Unhealthy': return Colors.purpleAccent;
      case 'Hazardous': return Colors.brown;
      default: return Colors.blueGrey;
    }
  }

  @override
  Widget build(BuildContext context) {
    final status = aqiData?['status'] ?? 'Unknown';
    final color = _getStatusColor(status);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text("Air Quality Real-Time", style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white),
            onPressed: _fetchAQI,
            tooltip: 'Refresh Data',
          ),
        ],
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [color, color.withOpacity(0.6), isDark ? Colors.black : Colors.deepPurple.shade50],
            stops: const [0.0, 0.4, 1.0]
          )
        ),
        child: isLoading 
          ? const Center(child: CircularProgressIndicator(color: Colors.white)) 
          : errorMessage.isNotEmpty 
            ? _buildErrorView()
            : RefreshIndicator(
                onRefresh: _fetchAQI,
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.fromLTRB(20, 100, 20, 40),
                  child: Column(
                    children: [
                      
                      Container(
                         margin: const EdgeInsets.only(bottom: 40),
                         padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                         decoration: BoxDecoration(
                           color: Colors.white.withOpacity(0.2),
                           borderRadius: BorderRadius.circular(40),
                           border: Border.all(color: Colors.white.withOpacity(0.3))
                         ),
                         child: Row(
                           mainAxisSize: MainAxisSize.min,
                           children: [
                             const Icon(Icons.location_on, color: Colors.white, size: 20),
                             const SizedBox(width: 10),
                             Text(
                               locationName, 
                               style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16, letterSpacing: 0.5),
                             ),
                           ],
                         ),
                      ),
                      
                      
                      Stack(
                        alignment: Alignment.center,
                        children: [
                          Container(
                            width: 260, height: 260,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(color: color.withOpacity(0.4), blurRadius: 40, spreadRadius: 10)
                              ]
                            ),
                          ),
                          SizedBox(
                            width: 250, height: 250,
                            child: CircularProgressIndicator(
                              value: (aqiData?['aqi'] ?? 0) / 500,
                              strokeWidth: 20,
                              backgroundColor: Colors.white.withOpacity(0.2),
                              valueColor: const AlwaysStoppedAnimation<Color>(Colors.white),
                              strokeCap: StrokeCap.round,
                            ),
                          ),
                          Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                "${aqiData?['aqi'] ?? '-'}",
                                style: const TextStyle(color: Colors.white, fontSize: 80, fontWeight: FontWeight.bold, height: 1),
                              ),
                              const Text("US AQI", style: TextStyle(color: Colors.white70, fontSize: 16, letterSpacing: 1.5, fontWeight: FontWeight.bold)),
                            ],
                          )
                        ],
                      ),
                      const SizedBox(height: 20),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(30),
                          border: Border.all(color: Colors.white.withOpacity(0.4))
                        ),
                        child: Text(
                           status.toUpperCase(),
                           style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w900, letterSpacing: 1.2),
                        ),
                      ),
                      const SizedBox(height: 40),

                      
                      const Align(alignment: Alignment.centerLeft, child: Text("Detailed Metrics", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white, shadows: [Shadow(color: Colors.black45, blurRadius: 4)]))),
                      const SizedBox(height: 16),
                      GridView.count(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        crossAxisCount: 2,
                        childAspectRatio: 1.5,
                        crossAxisSpacing: 16,
                        mainAxisSpacing: 16,
                        children: [
                          _buildPremiumCard("PM 2.5", "${aqiData?['pm25']}", "µg/m³", Icons.blur_on, Colors.blueAccent),
                          _buildPremiumCard("PM 10", "${aqiData?['pm10']}", "µg/m³", Icons.grain, Colors.deepPurpleAccent),
                          _buildPremiumCard("NO₂", "${aqiData?['no2']}", "ppb", Icons.local_fire_department, Colors.orangeAccent),
                          _buildPremiumCard("SO₂", "${aqiData?['so2']}", "ppb", Icons.factory, Colors.pinkAccent),
                          _buildPremiumCard("CO", "${aqiData?['co']}", "ppm", Icons.cloud_queue, Colors.tealAccent),
                          _buildPremiumCard("O₃", "${aqiData?['o3']}", "ppb", Icons.wb_sunny, Colors.amberAccent),
                        ],
                      ),

                      const SizedBox(height: 24),
                      
                      
                      Container(
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.95),
                          borderRadius: BorderRadius.circular(24),
                          boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 20, offset: Offset(0, 8))]
                        ),
                        child: Row(
                          children: [
                            Container(
                               padding: const EdgeInsets.all(16),
                               decoration: BoxDecoration(color: Colors.indigo.withOpacity(0.1), borderRadius: BorderRadius.circular(20)),
                               child: const Icon(Icons.wb_cloudy_rounded, color: Colors.indigo, size: 32),
                            ),
                            const SizedBox(width: 20),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text("Weather Conditions", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.black87)),
                                const SizedBox(height: 6),
                                Text(
                                  "${aqiData?['temp']}°C  |  Humidity: ${aqiData?['humidity']}%",
                                  style: TextStyle(color: Colors.grey[800], fontSize: 16, fontWeight: FontWeight.w500),
                                )
                              ],
                            )
                          ],
                        ),
                      )
                    ],
                  ),
                ),
              ),
      ),
    );
  }

  Widget _buildErrorView() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(30),
        child: Column(
           mainAxisAlignment: MainAxisAlignment.center,
           children: [
             Icon(Icons.cloud_off, size: 100, color: Colors.white.withOpacity(0.8)),
             const SizedBox(height: 24),
             const Text("Connection Lost", style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
             const SizedBox(height: 12),
             Text(errorMessage, textAlign: TextAlign.center, style: const TextStyle(color: Colors.white70, fontSize: 16)),
             const SizedBox(height: 40),
             ElevatedButton.icon(
               onPressed: _fetchAQI,
               icon: const Icon(Icons.refresh),
               label: const Text('RETRY'),
               style: ElevatedButton.styleFrom(
                   backgroundColor: Colors.white, 
                   foregroundColor: Colors.black,
                   padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 16),
                   shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30))
               ),
             ),
           ],
        ),
      ),
    );
  }

  Widget _buildPremiumCard(String name, String value, String unit, IconData icon, Color accent) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.9),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [BoxShadow(color: accent.withOpacity(0.2), blurRadius: 12, offset: const Offset(0, 6))],
        border: Border.all(color: accent.withOpacity(0.1), width: 1.5)
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(name, style: TextStyle(color: Colors.grey[600], fontWeight: FontWeight.bold, fontSize: 13)),
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(color: accent.withOpacity(0.1), shape: BoxShape.circle),
                child: Icon(icon, size: 14, color: accent),
              )
            ],
          ),
          RichText(
            text: TextSpan(
              children: [
                TextSpan(text: value == "null" ? "-" : value, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.black87)),
                TextSpan(text: " $unit", style: TextStyle(fontSize: 11, color: Colors.grey[600], fontWeight: FontWeight.w500)),
              ]
            ),
          )
        ],
      ),
    );
  }
}

