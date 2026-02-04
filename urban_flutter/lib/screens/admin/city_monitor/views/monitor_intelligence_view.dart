import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:urban_flutter/core/providers/city_monitor_provider.dart';

class MonitorIntelligenceView extends StatelessWidget {
  const MonitorIntelligenceView({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<CityMonitorProvider>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    
    final totalDepts = provider.departmentStats.length;
    final totalActive = provider.departmentStats.fold<int>(0, (sum, dept) => sum + ((dept['active'] as int?) ?? 0));
    final totalSolved = provider.departmentStats.fold<int>(0, (sum, dept) => sum + ((dept['solved'] as int?) ?? 0));
    final avgEfficiency = totalDepts > 0 
        ? provider.departmentStats.fold<double>(0.0, (sum, dept) {
            final active = (dept['active'] as int?) ?? 0;
            final solved = (dept['solved'] as int?) ?? 0;
            final total = active + solved;
            return sum + (total > 0 ? solved / total : 0.0);
          }) / totalDepts * 100
        : 0.0;
    
    return DefaultTabController(
      length: 2,
      child: Column(
        children: [
          
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: isDark 
                    ? [const Color(0xFF1E1E1E), const Color(0xFF2D2D2D)]
                    : [const Color(0xFF6C63FF), const Color(0xFF5A52E0)],
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 10,
                  offset: const Offset(0, 5),
                ),
              ],
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                Flexible(child: _buildSummaryStat("Departments", "$totalDepts", Icons.business, isDark)),
                Container(width: 1, height: 40, color: Colors.white24),
                Flexible(child: _buildSummaryStat("Active Cases", "$totalActive", Icons.pending_actions, isDark)),
                Container(width: 1, height: 40, color: Colors.white24),
                Flexible(child: _buildSummaryStat("Efficiency", "${avgEfficiency.toStringAsFixed(0)}%", Icons.trending_up, isDark)),
              ],
            ),
          ),
          
          
          Container(
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, 5),
                ),
              ],
            ),
            child: TabBar(
              labelColor: const Color(0xFF6C63FF),
              unselectedLabelColor: isDark ? Colors.grey[400] : Colors.grey,
              indicatorColor: const Color(0xFF6C63FF),
              indicatorWeight: 3,
              labelStyle: GoogleFonts.poppins(
                fontWeight: FontWeight.bold,
                fontSize: 14,
              ),
              unselectedLabelStyle: GoogleFonts.poppins(
                fontWeight: FontWeight.w500,
                fontSize: 14,
              ),
              tabs: const [
                Tab(icon: Icon(Icons.business_rounded), text: "Departments"),
                Tab(icon: Icon(Icons.location_city_rounded), text: "Area Logistics"),
              ],
            ),
          ),
          const Expanded(
            child: TabBarView(
              children: [
                DepartmentStatsList(),
                AreaStatsList(),
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget _buildSummaryStat(String label, String value, IconData icon, bool isDark) {
    return Column(
      children: [
        Icon(icon, color: Colors.white, size: 24),
        const SizedBox(height: 8),
        Text(
          value,
          style: GoogleFonts.poppins(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
          overflow: TextOverflow.ellipsis,
          maxLines: 1,
        ),
        Text(
          label,
          style: GoogleFonts.poppins(
            fontSize: 11,
            color: Colors.white70,
          ),
          overflow: TextOverflow.ellipsis,
          maxLines: 1,
        ),
      ],
    );
  }
}

class DepartmentStatsList extends StatelessWidget {
  const DepartmentStatsList({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<CityMonitorProvider>(context);
    final stats = provider.departmentStats;

    if (stats.isEmpty) {
      return _buildEmptyState("No Department Data", Icons.analytics_outlined);
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: stats.length,
      itemBuilder: (context, index) {
        final dept = stats[index];
        final active = dept['active'] ?? 0;
        final solved = dept['solved'] ?? 0;
        final total = active + solved;
        final efficiency = total > 0 ? (solved / total * 100).toInt() : 0;
        
        final healthColor = active > 50 ? Colors.redAccent : (active > 20 ? Colors.orangeAccent : Colors.green);

        return GestureDetector(
          onTap: () => _showDepartmentDetails(context, dept),
          child: Container(
            margin: const EdgeInsets.only(bottom: 16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.withOpacity(0.1),
                  blurRadius: 15,
                  spreadRadius: 2,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: healthColor.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Icon(Icons.business, color: healthColor, size: 28),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _formatDeptName(dept['name']?.toString() ?? 'DEPT'),
                              style: GoogleFonts.poppins(
                                fontWeight: FontWeight.bold, 
                                fontSize: 16,
                                color: const Color(0xFF2D3436),
                              ),
                              overflow: TextOverflow.ellipsis,
                              maxLines: 1,
                            ),

                            const SizedBox(height: 4),
                            Text(
                              "Avg Resolution: ${dept['avgTime'] ?? 'N/A'}",
                              style: GoogleFonts.poppins(fontSize: 12, color: Colors.grey),
                            ),
                          ],
                        ),
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            "$active Active", 
                            style: GoogleFonts.poppins(
                              color: healthColor, 
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            )
                          ),
                          Text(
                            "$solved Solved", 
                            style: GoogleFonts.poppins(
                              color: Colors.grey, 
                              fontSize: 12,
                            )
                          ),
                        ],
                      )
                    ],
                  ),
                  const SizedBox(height: 20),
                  
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text("Efficiency Score", style: GoogleFonts.poppins(fontSize: 12, color: Colors.grey[600])),
                          Text(
                            "$efficiency%", 
                            style: GoogleFonts.poppins(
                              fontSize: 14, 
                              fontWeight: FontWeight.bold, 
                              color: healthColor
                            )
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: LinearProgressIndicator(
                          value: efficiency / 100,
                          backgroundColor: Colors.grey[200],
                          valueColor: AlwaysStoppedAnimation<Color>(healthColor),
                          minHeight: 8,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  void _showDepartmentDetails(BuildContext context, Map<String, dynamic> dept) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        maxChildSize: 0.9,
        builder: (_, controller) => Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          padding: const EdgeInsets.all(24),
          child: ListView(
            controller: controller,
            children: [
              Center(
                child: Container(
                  width: 40, height: 4, 
                  decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2))
                )
              ),
              const SizedBox(height: 24),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.indigo.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.business, color: Colors.indigo, size: 32),
                  ),
                  const SizedBox(width: 16),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(_formatDeptName(dept['name'] ?? 'Department'), style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.bold)),
                      Text("Operational Metrics & Staffing", style: GoogleFonts.poppins(color: Colors.grey)),
                    ],
                  )
                ],
              ),
              const SizedBox(height: 32),
              const Text("Staff Allocation", style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(child: _buildStatBox("Field Agents", "${(dept['active'] ?? 0) * 2}", Colors.blue)),
                  const SizedBox(width: 16),
                  Expanded(child: _buildStatBox(" Supervisors", "4", Colors.orange)),
                ],
              ),
              const SizedBox(height: 24),
              const Text("Performance Metrics", style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              _buildMetricRow("Resolution Rate", "94%", Colors.green),
              _buildMetricRow("Avg Response", "24m", Colors.indigo),
              _buildMetricRow("Customer Satisfaction", "4.8/5.0", Colors.amber),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatBox(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
       child: Column(
        children: [
           FittedBox(fit: BoxFit.scaleDown, child: Text(value, style: GoogleFonts.poppins(fontSize: 20, fontWeight: FontWeight.bold, color: color))),
           Text(label, style: GoogleFonts.poppins(fontSize: 12, color: Colors.black54), textAlign: TextAlign.center, overflow: TextOverflow.ellipsis, maxLines: 2),
        ],
      ),
    );
  }

  Widget _buildMetricRow(String label, String value, Color color) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey.shade200),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
           Text(label, style: GoogleFonts.poppins(fontWeight: FontWeight.w500)),
           Flexible(child: Text(value, style: GoogleFonts.poppins(fontWeight: FontWeight.bold, color: color), overflow: TextOverflow.ellipsis)),
        ],
      ),
    );
  }

  Widget _buildEmptyState(String message, IconData icon) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 80, color: Colors.grey[300]),
          const SizedBox(height: 16),
          Text(
            message, 
            style: GoogleFonts.poppins(
              color: Colors.grey, 
              fontSize: 16,
              fontWeight: FontWeight.w500
            )
          ),
        ],
      ),
    );
  }

  String _formatDeptName(String raw) {
      if (raw.toLowerCase().contains('sanitation')) return 'Sanitation';
      if (raw.toLowerCase().contains('health')) return 'Health';
      if (raw.toLowerCase().contains('police') || raw.toLowerCase().contains('security')) return 'Police';
      if (raw.toLowerCase().contains('fire')) return 'Fire';
      if (raw.toLowerCase().contains('transport') || raw.toLowerCase().contains('traffic')) return 'Traffic';
      if (raw.toLowerCase().contains('water')) return 'Water';
      if (raw.toLowerCase().contains('power') || raw.toLowerCase().contains('electric')) return 'Energy';
      
      
      if (raw.isEmpty) return 'Department';
      return raw.split('_').map((word) {
          if (word.isEmpty) return '';
          return "${word[0].toUpperCase()}${word.substring(1).toLowerCase()}";
      }).join(' ');
  }
}

class AreaStatsList extends StatelessWidget {
  const AreaStatsList({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<CityMonitorProvider>(context);
    final stats = provider.areaStats;

    if (stats.isEmpty) {
      return _buildEmptyState("No Area Data", Icons.map_outlined);
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: stats.length,
      itemBuilder: (context, index) {
        final area = stats[index];
        final risk = area['riskScore'] ?? 0;
        final riskColor = risk > 70 ? Colors.redAccent : (risk > 40 ? Colors.orangeAccent : Colors.teal);
        final fleetActive = (risk * 0.8).toInt(); 
        const maxFleet = 100;

        return Container(
          margin: const EdgeInsets.only(bottom: 20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 15, offset: const Offset(0, 5))],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: riskColor.withOpacity(0.05),
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                  border: Border(bottom: BorderSide(color: riskColor.withOpacity(0.1))),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(color: Colors.white, shape: BoxShape.circle, border: Border.all(color: riskColor)),
                          child: Text("${area['ward']}", style: GoogleFonts.poppins(fontWeight: FontWeight.bold, color: riskColor)),
                        ),
                        const SizedBox(width: 12),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text("Ward Logistics", style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold), overflow: TextOverflow.ellipsis),
                            Text("Zone Beta • Sector ${area['ward']}", style: GoogleFonts.poppins(fontSize: 12, color: Colors.grey), overflow: TextOverflow.ellipsis),
                          ],
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(color: riskColor, borderRadius: BorderRadius.circular(20)),
                      child: Text("Risk: $risk/100", style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                    )
                  ],
                ),
              ),
              
              Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text("Fleet Deployment", style: TextStyle(color: Colors.grey, fontSize: 12)),
                        Text("$fleetActive / $maxFleet Units", style: const TextStyle(fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: fleetActive / maxFleet,
                        minHeight: 8,
                        backgroundColor: Colors.grey[100],
                        valueColor: AlwaysStoppedAnimation(riskColor),
                      ),
                    ),
                    const SizedBox(height: 20),
                    
                    
                    Row(
                      children: [
                        Expanded(child: _buildDetailCard(Icons.local_shipping, "$fleetActive Active", "Trucks", Colors.blue)),
                        const SizedBox(width: 12),
                        Expanded(child: _buildDetailCard(Icons.warning, "${area['critical'] ?? 0} Critical", "Alerts", Colors.red)),
                        const SizedBox(width: 12),
                        Expanded(child: _buildDetailCard(Icons.people, "24 Staff", "On Site", Colors.orange)),
                      ],
                    )
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildDetailCard(IconData icon, String title, String subtitle, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: color),
          const SizedBox(height: 8),
          Text(title, style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 13, color: color), overflow: TextOverflow.ellipsis, maxLines: 1),
          Text(subtitle, style: GoogleFonts.poppins(color: Colors.black54, fontSize: 11), overflow: TextOverflow.ellipsis, maxLines: 1),
        ],
      ),
    );
  }

  Widget _buildEmptyState(String message, IconData icon) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 80, color: Colors.grey[300]),
          const SizedBox(height: 16),
          Text(
            message, 
            style: GoogleFonts.poppins(
              color: Colors.grey, 
              fontSize: 16,
              fontWeight: FontWeight.w500
            )
          ),
        ],
      ),
    );
  }
}
