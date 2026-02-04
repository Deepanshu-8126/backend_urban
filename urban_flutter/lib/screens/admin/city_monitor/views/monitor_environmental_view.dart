import 'package:flutter/material.dart';
import 'package:geocoding/geocoding.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:urban_flutter/core/api_service.dart';
import 'package:urban_flutter/core/providers/city_monitor_provider.dart';
import 'dart:ui';

class MonitorEnvironmentalView extends StatefulWidget {
  const MonitorEnvironmentalView({super.key});

  @override
  State<MonitorEnvironmentalView> createState() => _MonitorEnvironmentalViewState();
}

class _MonitorEnvironmentalViewState extends State<MonitorEnvironmentalView> {
  bool isLoading = true;
  Map<String, dynamic>? aqiData;
  String _locationName = "Haldwani"; 

  @override
  void initState() {
    super.initState();
    _fetchCityAQI();
  }

  Future<void> _fetchCityAQI() async {
    const lat = 29.2183;
    const lng = 79.5130;
    
    
    final data = await ApiService.fetchAQIData(lat, lng);
    
    
    try {
      List<Placemark> placemarks = await placemarkFromCoordinates(lat, lng);
      if (placemarks.isNotEmpty) {
        _locationName = placemarks[0].locality ?? placemarks[0].administrativeArea ?? "Haldwani";
      }
    } catch (_) {}

    if (mounted) {
      setState(() {
        isLoading = false;
        if (data['success'] == true) {
          aqiData = data['data'];
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final aqi = aqiData?['aqi'] ?? 0;
    
    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF121212) : const Color(0xFFF8F9FE),
      body: isLoading 
        ? const Center(child: CircularProgressIndicator())
        : SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildHeader(isDark),
                const SizedBox(height: 24),
                
                
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: _getAqiColor(aqi).withOpacity(0.3))
                  ),
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 18,
                        backgroundColor: _getAqiColor(aqi).withOpacity(0.1),
                        child: Icon(Icons.location_on, color: _getAqiColor(aqi), size: 18),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text("Central Monitoring Station", 
                              style: GoogleFonts.poppins(color: Colors.grey, fontSize: 10),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            Text(_locationName, 
                              style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.bold, color: isDark ? Colors.white : Colors.black87), 
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.green.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(16)
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.circle, color: Colors.green, size: 8),
                            const SizedBox(width: 6),
                            Text("Online", style: GoogleFonts.poppins(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.green[800]))
                          ],
                        ),
                      )
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                
                LayoutBuilder(
                  builder: (context, constraints) {
                    bool isSmall = constraints.maxWidth < 600;
                    
                    if (isSmall) {
                      return Column(
                        children: [
                          _buildAqiHeroCard(aqi, isDark),
                          const SizedBox(height: 16),
                          _buildPollutantGrid(isDark),
                        ],
                      );
                    }
                    
                    return Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(flex: 3, child: _buildAqiHeroCard(aqi, isDark)),
                        const SizedBox(width: 24),
                        Expanded(flex: 4, child: _buildPollutantGrid(isDark))
                      ],
                    );
                  },
                ),
                const SizedBox(height: 30),

                
                Text("Sensor Zones Status", style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.bold, color: isDark ? Colors.white : Colors.black87)),
                const SizedBox(height: 16),
                SizedBox(
                  height: 180,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    children: [
                      _buildZoneCard("Zone A (Industrial)", 156, "Unhealthy", Colors.red, isDark),
                      const SizedBox(width: 16),
                      _buildZoneCard("Zone B (Residential)", 45, "Good", Colors.green, isDark),
                      const SizedBox(width: 16),
                      _buildZoneCard("Zone C (City Center)", 89, "Moderate", Colors.amber, isDark),
                      const SizedBox(width: 16),
                      _buildZoneCard("Zone D (IT Park)", 60, "Moderate", Colors.amber, isDark),
                    ],
                  ),
                )
              ],
            ),
          ),
    );
  }

  Widget _buildHeader(bool isDark) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(color: Colors.teal.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
          child: const Icon(Icons.public, color: Colors.teal, size: 24),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text("Environmental Monitor", 
                style: GoogleFonts.poppins(fontSize: 20, fontWeight: FontWeight.bold, color: isDark ? Colors.white : Colors.black87),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              Text("Real-time AQI & Weather Intelligence", 
                style: GoogleFonts.poppins(color: Colors.grey, fontSize: 11),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        )
      ],
    );
  }

  Widget _buildAqiHeroCard(int aqi, bool isDark) {
    Color color = _getAqiColor(aqi);
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        gradient: LinearGradient(colors: [color, color.withOpacity(0.7)], begin: Alignment.topLeft, end: Alignment.bottomRight),
        boxShadow: [BoxShadow(color: color.withOpacity(0.4), blurRadius: 20, offset: const Offset(0, 10))]
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text("CITY AVERAGE", style: GoogleFonts.poppins(color: Colors.white70, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
              const Icon(Icons.waves, color: Colors.white54)
            ],
          ),
          const SizedBox(height: 20),
          Text("$aqi", style: GoogleFonts.poppins(fontSize: 72, fontWeight: FontWeight.bold, color: Colors.white, height: 1)),
          Text("US AQI", style: GoogleFonts.poppins(color: Colors.white)),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(20)),
            child: Text(
               _getStatus(aqi).toUpperCase(),
               style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold)
            ),
          )
        ],
      ),
    );
  }

  Widget _buildPollutantGrid(bool isDark) {
     return GridView.count(
       crossAxisCount: 2,
       shrinkWrap: true,
       physics: const NeverScrollableScrollPhysics(),
       crossAxisSpacing: 12,
       mainAxisSpacing: 12,
       childAspectRatio: 1.8,
       children: [
         _buildPill("PM 2.5", "${aqiData?['pm25']}", Colors.purple, isDark),
         _buildPill("PM 10", "${aqiData?['pm10']}", Colors.blue, isDark),
         _buildPill("NO2", "${aqiData?['no2']}", Colors.orange, isDark),
         _buildPill("O3", "${aqiData?['o3']}", Colors.teal, isDark),
       ],
     );
  }

  Widget _buildPill(String label, String value, Color color, bool isDark) {
     return Container(
       padding: const EdgeInsets.all(12),
       decoration: BoxDecoration(
         color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
         borderRadius: BorderRadius.circular(16),
         border: Border.all(color: color.withOpacity(0.2)),
       ),
       child: Column(
         crossAxisAlignment: CrossAxisAlignment.start,
         mainAxisAlignment: MainAxisAlignment.center,
         children: [
           Text(label, 
             style: GoogleFonts.poppins(color: Colors.grey, fontWeight: FontWeight.bold, fontSize: 11),
             maxLines: 1,
             overflow: TextOverflow.ellipsis,
           ),
           const SizedBox(height: 4),
           Flexible(
             child: FittedBox(
               fit: BoxFit.scaleDown,
               alignment: Alignment.centerLeft,
               child: Text(
                 value == "null" ? "-" : value, 
                 style: GoogleFonts.poppins(fontSize: 20, fontWeight: FontWeight.bold, color: isDark ? Colors.white : Colors.black87)
               ),
             ),
           ),
         ],
       ),
     );
  }

  Widget _buildZoneCard(String name, int zoneAqi, String status, Color color, bool isDark) {
    return Container(
      width: 160,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border(top: BorderSide(color: color, width: 4))
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Icon(Icons.location_on, size: 14, color: Colors.grey[400]),
              const SizedBox(width: 4),
              Expanded(child: Text(name, overflow: TextOverflow.ellipsis, style: TextStyle(color: Colors.grey[500], fontSize: 10, fontWeight: FontWeight.bold)))
            ],
          ),
          Text("$zoneAqi", style: GoogleFonts.poppins(fontSize: 32, fontWeight: FontWeight.bold, color: isDark ? Colors.white : Colors.black87)),
          Container(
             padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
             decoration: BoxDecoration(
               color: color.withOpacity(0.1),
               borderRadius: BorderRadius.circular(8)
             ),
             child: Text(status, style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold))
          )
        ],
      ),
    );
  }

  Color _getAqiColor(int aqi) {
    if (aqi <= 50) return Colors.green;
    if (aqi <= 100) return Colors.amber;
    if (aqi <= 150) return Colors.orange;
    if (aqi <= 200) return Colors.red;
    return Colors.purple;
  }
  
  String _getStatus(int aqi) {
    if (aqi <= 50) return "Good";
    if (aqi <= 100) return "Moderate";
    if (aqi <= 150) return "Unhealthy (Sens.)";
    if (aqi <= 200) return "Unhealthy";
    return "Hazardous";
  }
}
