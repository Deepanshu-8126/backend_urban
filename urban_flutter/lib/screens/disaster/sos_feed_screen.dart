import 'package:flutter/material.dart';
import '../../core/api_service.dart';
import '../../core/location_helper.dart';

class SOSFeedScreen extends StatefulWidget {
  const SOSFeedScreen({super.key});

  @override
  State<SOSFeedScreen> createState() => _SOSFeedScreenState();
}

class _SOSFeedScreenState extends State<SOSFeedScreen> {
  List<dynamic> alerts = [];
  bool isLoading = true;
  Map<String, String> locationNames = {}; 

  @override
  void initState() {
    super.initState();
    _fetchAlerts();
  }

  Future<void> _fetchAlerts() async {
    final data = await ApiService.fetchSOSAlerts();
    if (mounted) {
      setState(() {
        alerts = data;
        isLoading = false;
      });
      
      _loadLocationNames();
    }
  }

  Future<void> _loadLocationNames() async {
    for (final alert in alerts) {
      if (alert['liveLocation'] != null && alert['liveLocation']['coordinates'] != null) {
        final coords = alert['liveLocation']['coordinates'];
        final alertId = alert['_id'];
        final name = await LocationHelper.getAddressFromCoordinates(coords[1], coords[0]);
        if (mounted) {
          setState(() {
            locationNames[alertId] = name;
          });
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF101010), 
      appBar: AppBar(
        title: Row(
          children: [
            Container(
               padding: const EdgeInsets.all(6),
               decoration: BoxDecoration(color: Colors.redAccent.withOpacity(0.2), borderRadius: BorderRadius.circular(8)),
               child: const Icon(Icons.shield, color: Colors.redAccent),
            ),
            const SizedBox(width: 12),
            const Text("Live SOS Command", style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1)),
          ],
        ),
        backgroundColor: const Color(0xFF1A1A1A),
        elevation: 0,
        actions: [
          IconButton(icon: const Icon(Icons.refresh, color: Colors.white70), onPressed: _fetchAlerts),
        ],
      ),
      body: isLoading 
          ? const Center(child: CircularProgressIndicator(color: Colors.redAccent)) 
          : alerts.isEmpty 
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.check_circle_outline, size: 80, color: Colors.green.withOpacity(0.5)),
                      const SizedBox(height: 20),
                      const Text("All Systems Normal", style: TextStyle(color: Colors.white54, fontSize: 18)),
                      const SizedBox(height: 5),
                      const Text("No Active SOS Alerts", style: TextStyle(color: Colors.white30, fontSize: 14)),
                    ],
                  ),
                )
              : ListView.builder(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.all(16),
                itemCount: alerts.length,
                itemBuilder: (context, i) {
                  final alert = alerts[i];
                  final userDetails = alert['sosUserDetails'] ?? {};
                  final alertId = alert['_id'];
                  final userLocation = locationNames[alertId] ?? 'Loading location...';

                  return Container(
                    margin: const EdgeInsets.only(bottom: 16),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E1E1E),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.redAccent.withOpacity(0.3)),
                      boxShadow: [BoxShadow(color: Colors.redAccent.withOpacity(0.1), blurRadius: 15, offset: const Offset(0, 5))]
                    ),
                    child: Theme(
                      data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
                      child: ExpansionTile(
                        tilePadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                        leading: Container(
                          width: 50, height: 50,
                          decoration: BoxDecoration(
                            color: Colors.redAccent.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.redAccent.withOpacity(0.3))
                          ),
                          child: const Icon(Icons.warning_amber_rounded, color: Colors.redAccent, size: 28),
                        ),
                        title: Text(
                          "ALERT #${alert['_id'].toString().substring(alert['_id'].toString().length - 4).toUpperCase()}",
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16, letterSpacing: 1),
                        ),
                        subtitle: Padding(
                          padding: const EdgeInsets.only(top: 6),
                          child: Row(
                            children: [
                              Icon(Icons.person, size: 14, color: Colors.grey[400]),
                              const SizedBox(width: 4),
                              Text(userDetails['name'] ?? 'Unknown Citizen', style: TextStyle(color: Colors.grey[400], fontSize: 13)),
                              const SizedBox(width: 15),
                              Icon(Icons.battery_alert, size: 14, color: Colors.grey[400]),
                              const SizedBox(width: 4),
                              Text("${alert['batteryLevel'] ?? 'N/A'}%", style: TextStyle(color: Colors.grey[400], fontSize: 13)),
                            ],
                          ),
                        ),
                        children: [
                          Container(
                            padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Divider(color: Colors.white.withOpacity(0.1)),
                                const SizedBox(height: 10),
                                _buildInfoRow(Icons.message_outlined, "Message", alert['sosMessage'] ?? 'No details provided'),
                                const SizedBox(height: 12),
                                _buildInfoRow(Icons.my_location, "Live Location", userLocation),
                                const SizedBox(height: 20),
                                Row(
                                  children: [
                                    Expanded(
                                      child: ElevatedButton.icon(
                                        onPressed: () {}, 
                                        icon: const Icon(Icons.call, size: 18),
                                        label: Text("CALL ${userDetails['phone'] ?? ''}"),
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: Colors.green[700],
                                          foregroundColor: Colors.white,
                                          padding: const EdgeInsets.symmetric(vertical: 12),
                                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))
                                        )
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: ElevatedButton.icon(
                                        onPressed: () {}, 
                                        icon: const Icon(Icons.near_me, size: 18),
                                        label: const Text("DISPATCH"),
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: Colors.redAccent,
                                          foregroundColor: Colors.white,
                                          padding: const EdgeInsets.symmetric(vertical: 12),
                                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))
                                        )
                                      ),
                                    ),
                                  ],
                                )
                              ],
                            ),
                          )
                        ],
                      ),
                    ),
                  );
                },
              ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 16, color: Colors.white54),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(color: Colors.white38, fontSize: 12)),
              const SizedBox(height: 2),
              Text(value, style: const TextStyle(color: Colors.white70, fontSize: 14)),
            ],
          ),
        )
      ],
    );
  }
}