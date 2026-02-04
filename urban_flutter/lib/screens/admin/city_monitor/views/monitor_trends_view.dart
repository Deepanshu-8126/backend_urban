import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:urban_flutter/core/providers/city_monitor_provider.dart';
import 'dart:math';

class MonitorTrendsView extends StatefulWidget {
  const MonitorTrendsView({super.key});

  @override
  State<MonitorTrendsView> createState() => _MonitorTrendsViewState();
}

class _MonitorTrendsViewState extends State<MonitorTrendsView> with TickerProviderStateMixin {
  late TabController _nestedTabController;
  int _selectedChartIndex = 0; 
  
  
  final List<String> _sentinelLogs = []; 
  
  @override
  void initState() {
    super.initState();
    _nestedTabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _nestedTabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<CityMonitorProvider>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    // Show loading indicator while data is being fetched
    if (provider.isLoading) {
      return Scaffold(
        backgroundColor: isDark ? const Color(0xFF121212) : const Color(0xFFF8F9FE),
        body: const Center(
          child: CircularProgressIndicator(),
        ),
      );
    }
    
    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF121212) : const Color(0xFFF8F9FE),
      body: SingleChildScrollView(
        padding: const EdgeInsets.only(bottom: 100),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            
            _buildHeader(provider),

            
            _buildLiveTicker(context, provider),
            

            
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: _buildAdvancedKPIGrid(provider),
            ),
            
            const SizedBox(height: 24),

            
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: _buildAIInsightBanner(provider),
            ),

            const SizedBox(height: 24),

            
            _buildMainAnalyticsSection(provider),

            const SizedBox(height: 24),

            
            Padding(
               padding: const EdgeInsets.symmetric(horizontal: 16),
               child: _build3DSpatialMap(isDark),
            ),

            const SizedBox(height: 24),

            
            _buildSentinelTerminal(isDark, provider),

            const SizedBox(height: 24),

            
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: _buildLiveActivityFeed(),
            ),

            const SizedBox(height: 24),

            
            _buildDepartmentDeepDive(provider),

            const SizedBox(height: 24),
            
            
             _buildAnomalyList(provider),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
            provider.toggleLiveMode();
            ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(provider.isLive ? "🔴 Live Data Enabled" : "⏸ Live Data Paused"))
            );
        },
        backgroundColor: provider.isLive ? Colors.redAccent : Colors.black87,
        icon: Icon(provider.isLive ? Icons.pause : Icons.play_arrow, color: Colors.white),
        label: Text(provider.isLive ? "Live Mode" : "Resume", style: const TextStyle(color: Colors.white)),
      ),
    );
  }

  
  
  
  Widget _buildLiveTicker(BuildContext context, CityMonitorProvider provider) {
    if (provider.mapIncidents.isEmpty) return const SizedBox();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      width: double.infinity,
      height: 36,
      margin: const EdgeInsets.only(bottom: 16),
      color: isDark ? const Color(0xFF1E1E1E) : Colors.black87,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(), 
        itemCount: provider.mapIncidents.length * 10,
        itemBuilder: (ctx, index) {
          final i = provider.mapIncidents[index % provider.mapIncidents.length];
          return Center(
             child: Padding(
               padding: const EdgeInsets.symmetric(horizontal: 16),
               child: Row(
                 mainAxisSize: MainAxisSize.min,
                 children: [
                   const Icon(Icons.emergency_recording, color: Colors.redAccent, size: 14),
                   const SizedBox(width: 8),
                   Text(
                     "ALERT: ${i['title']} in ${i['category']}".toUpperCase(),
                     
                     style: GoogleFonts.robotoMono(
                       color: Colors.white, 
                       fontSize: 11, 
                       fontWeight: FontWeight.bold
                     )
                   ),
                 ],
               ),
             )
          );
        }
      ),
    );
  }

  
  
  
  Widget _build3DSpatialMap(bool isDark) {
    return Container(
      height: 200,
      decoration: BoxDecoration(
         borderRadius: BorderRadius.circular(24),
         gradient: LinearGradient(colors: isDark ? [Colors.black, Colors.blueGrey.shade900] : [Colors.blue.shade900, Colors.indigo.shade900]),
         boxShadow: [BoxShadow(color: Colors.blue.withOpacity(0.3), blurRadius: 20, offset: const Offset(0, 10))]
      ),
      child: Stack(
        children: [
          
          Positioned.fill(
             child: CustomPaint(painter: GridPainter())
          ),
          
          
          Positioned(
             left: 50, top: 40,
             child: _buildHoloMarker(Icons.water_drop, Colors.cyan),
          ),
          Positioned(
             right: 80, bottom: 60,
             child: _buildHoloMarker(Icons.local_fire_department, Colors.orange),
          ),
           Positioned(
             left: 120, bottom: 40,
             child: _buildHoloMarker(Icons.bolt, Colors.yellow),
          ),

          
          Positioned(
            top: 16, left: 16,
            child: Row(
              children: [
                const Icon(Icons.public, color: Colors.white54, size: 16),
                const SizedBox(width: 8),
                Text("SPATIAL HEATMAP (BETA)", style: GoogleFonts.robotoMono(color: Colors.white54, fontSize: 10, letterSpacing: 2))
              ],
            ),
          )
        ],
      ),
    );
  }

  
  
  
  
  
  
  Widget _buildSentinelTerminal(bool isDark, CityMonitorProvider provider) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(20),
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.black, 
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.greenAccent.withOpacity(0.5), width: 1.5),
        boxShadow: const [BoxShadow(color: Colors.greenAccent, blurRadius: 10, offset: Offset(0, 0), blurStyle: BlurStyle.outer)]
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Row(
                  children: [
                    const Icon(Icons.terminal, color: Colors.greenAccent, size: 20),
                    const SizedBox(width: 10),
                    Flexible(
                      child: Text(
                        "SENTINEL COMMAND TERMINAL", 
                        style: GoogleFonts.robotoMono(
                          color: Colors.greenAccent, 
                          fontWeight: FontWeight.bold, 
                          fontSize: 12, 
                          letterSpacing: 1.5
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2), 
                decoration: BoxDecoration(
                  color: Colors.green.withOpacity(0.2), 
                  borderRadius: BorderRadius.circular(4)
                ), 
                child: Text(
                  "ONLINE", 
                  style: GoogleFonts.robotoMono(
                    color: Colors.greenAccent, 
                    fontSize: 10
                  )
                )
              ),
            ],
          ),
          const SizedBox(height: 16),
          Container(height: 1, color: Colors.green.withOpacity(0.3)),
          const SizedBox(height: 16),
          
          
          SizedBox(
            height: 120,
            child: ListView.builder(
               physics: const NeverScrollableScrollPhysics(), 
               reverse: true, 
               itemCount: provider.sentinelLogs.length,
               itemBuilder: (ctx, index) {
                 return Padding(
                   padding: const EdgeInsets.only(bottom: 6),
                   child: Row(
                     crossAxisAlignment: CrossAxisAlignment.start,
                     children: [
                       Text(">> ", style: GoogleFonts.robotoMono(color: Colors.greenAccent, fontSize: 12)),
                       Expanded(
                         child: Text(provider.sentinelLogs[provider.sentinelLogs.length - 1 - index], 
                           style: GoogleFonts.robotoMono(color: Colors.greenAccent.withOpacity(0.8), fontSize: 12)),
                       ),
                       Text((DateTime.now().subtract(Duration(seconds: index * 5))).toString().substring(11, 19), 
                           style: GoogleFonts.robotoMono(color: Colors.green.withOpacity(0.4), fontSize: 10))
                     ],
                   ),
                 );
               }
            ),
          ),
          
          const SizedBox(height: 12),
          
          Row(
            children: [
              Text("> Processing Real-Time Data...", style: GoogleFonts.robotoMono(color: Colors.greenAccent, fontSize: 12)),
              const SizedBox(width: 8),
              const SizedBox(width: 10, height: 10, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.greenAccent))
            ],
          )
        ],
      ),
    );
  }

  Widget _buildHoloMarker(IconData icon, Color color) {
     return Column(
       mainAxisSize: MainAxisSize.min,
       children: [
         Container(
           padding: const EdgeInsets.all(8),
           decoration: BoxDecoration(
             color: color.withOpacity(0.2),
             border: Border.all(color: color, width: 2),
             shape: BoxShape.circle,
             boxShadow: [BoxShadow(color: color.withOpacity(0.6), blurRadius: 10, spreadRadius: 2)]
           ),
           child: Icon(icon, color: Colors.white, size: 16),
         ),
         Container(
           width: 2, height: 20,
           decoration: BoxDecoration(
             gradient: LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter, colors: [color, Colors.transparent])
           ),
         ),
         Container(
           width: 30, height: 10,
           decoration: BoxDecoration(
             color: color.withOpacity(0.2),
             shape: BoxShape.circle
           ),
         )
       ],
     );
  }

  
  
  
  Widget _buildAIInsightBanner(CityMonitorProvider provider) {
    if (provider.mapIncidents.isEmpty) return const SizedBox();
    
    
    final highRisk = provider.mapIncidents.where((i) => i['status'] == 'pending').length;
    final insight = highRisk > 5 
        ? "Surge in pending reports detected. Recommend deploying extra staff to Sector 4."
        : "Operational efficiency is optimal. No critical anomalies detected.";
    
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [Colors.black87, Colors.black54]),
        borderRadius: BorderRadius.circular(24),
        boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 15, offset: Offset(0, 8))]
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: Colors.white.withOpacity(0.1), borderRadius: BorderRadius.circular(16)),
            child: const Icon(Icons.auto_awesome, color: Colors.yellowAccent, size: 28),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text("AI Anomaly Detected", style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                const SizedBox(height: 4),
                Text(insight, 
                  style: GoogleFonts.poppins(color: Colors.white70, fontSize: 12, height: 1.4)),
              ],
            ),
          ),
          Container(
             padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
             decoration: BoxDecoration(
               border: Border.all(color: Colors.white30),
               borderRadius: BorderRadius.circular(20)
             ),
             child: const Text("View Details", style: TextStyle(color: Colors.white, fontSize: 12)),
          )
        ],
      ),
    );
  }

  Widget _buildHeader(CityMonitorProvider provider) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 40, 20, 20),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
        border: Border(bottom: BorderSide(color: isDark ? Colors.grey[800]! : const Color(0xFFEEEEEE))),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Flexible(
                      child: Row(
                        children: [
                          Flexible(
                            child: Text("Analytics Hub", 
                              style: GoogleFonts.poppins(fontSize: 20, fontWeight: FontWeight.w600, color: isDark ? Colors.white : Colors.black87),
                              overflow: TextOverflow.ellipsis, maxLines: 1
                            ),
                          ),
                          const SizedBox(width: 12),
                          
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.green.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: Colors.green.withOpacity(0.3))
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(
                                  width: 6, height: 6,
                                  decoration: const BoxDecoration(
                                    color: Colors.green,
                                    shape: BoxShape.circle
                                  ),
                                ),
                                const SizedBox(width: 6),
                                Text("LIVE", style: GoogleFonts.poppins(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.green)),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    Text("Real-time monitoring & AI Predictions", 
                      style: GoogleFonts.poppins(fontSize: 14, color: isDark ? Colors.grey[400] : Colors.grey[500]),
                      overflow: TextOverflow.ellipsis, maxLines: 1
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 16),
              
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: BorderRadius.circular(30),
                  border: Border.all(color: Colors.grey[300]!)
                ),
                child: Row(
                  children: [
                    const Icon(Icons.calendar_today, size: 14, color: Colors.black54),
                    const SizedBox(width: 8),
                    DropdownButton<String>(
                      value: provider.timeRange,
                      underline: const SizedBox(),
                      isDense: true,
                      style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.black87),
                      icon: const Icon(Icons.arrow_drop_down, color: Colors.black54),
                      items: ['24h', '7d', '30d'].map((e) => DropdownMenuItem(value: e, child: Text(e.toUpperCase()))).toList(),
                      onChanged: (val) {
                        if (val != null) provider.setTimeRange(val);
                      },
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              
              Container(
                decoration: BoxDecoration(color: Colors.black87, borderRadius: BorderRadius.circular(30)),
                child: IconButton(
                  icon: const Icon(Icons.download_rounded, color: Colors.white, size: 20),
                  tooltip: "Export Report",
                  onPressed: () {
                     ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text("Generating PDF Report..."))
                     );
                  },
                ),
              )
            ],
          ),
        ],
      ),
    );
  }

  
  
  
  Widget _buildAdvancedKPIGrid(CityMonitorProvider provider) {
    int total = provider.mapIncidents.length;
    int resolved = provider.mapIncidents.where((i) => i['status'] == 'solved').length;
    int pending = total - resolved;
    double resolutionRate = total == 0 ? 0 : (resolved / total) * 100;

    return LayoutBuilder(
      builder: (context, constraints) {
        bool isSmall = constraints.maxWidth < 600;
        
        if (isSmall) {
          return Column(
            children: [
              _buildKillerKPICard("Total Reports", "$total", "+18.5%", Colors.indigoAccent, Icons.assignment_ind_outlined, isChart: true),
              const SizedBox(height: 16),
              _buildKillerKPICard("Resolution Rate", "${resolutionRate.toStringAsFixed(1)}%", "+2.4%", Colors.green, Icons.verified_user_outlined, isChart: true),
              const SizedBox(height: 16),
              _buildKillerKPICard("Avg Response", "2.4h", "-15m", Colors.orange, Icons.timer_outlined),
              const SizedBox(height: 16),
              _buildKillerKPICard("Critical Alerts", "5", "+1", Colors.redAccent, Icons.warning_amber_rounded),
            ],
          );
        }

        return Column(
          children: [
            Row(
              children: [
                Expanded(child: _buildKillerKPICard(
                    "Total Reports", 
                    "$total", 
                    "+18.5%", 
                    Colors.indigoAccent, 
                    Icons.assignment_ind_outlined,
                    isChart: true
                )),
                const SizedBox(width: 16),
                Expanded(child: _buildKillerKPICard(
                    "Resolution Rate", 
                    "${resolutionRate.toStringAsFixed(1)}%", 
                    "+2.4%", 
                    Colors.green, 
                    Icons.verified_user_outlined,
                    isChart: true
                )),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                 Expanded(child: _buildKillerKPICard(
                    "Avg Response", 
                    "2.4h", 
                    "-15m", 
                    Colors.orange, 
                    Icons.timer_outlined
                )),
                const SizedBox(width: 16),
                 Expanded(child: _buildKillerKPICard(
                    "Critical Alerts", 
                    "5", 
                    "+1", 
                    Colors.redAccent, 
                    Icons.warning_amber_rounded
                )),
              ],
            )
          ],
        );
      },
    );
  }

  Widget _buildKillerKPICard(String title, String value, String change, Color color, IconData icon, {bool isChart = false}) {
    bool isPositive = !change.startsWith('-');
    
    return Container(
      constraints: const BoxConstraints(minHeight: 160),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: const [BoxShadow(color: Color(0x0A000000), blurRadius: 20, offset: Offset(0, 10))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
           Row(
             mainAxisAlignment: MainAxisAlignment.spaceBetween,
             children: [
               Container(
                 padding: const EdgeInsets.all(10),
                 decoration: BoxDecoration(color: color.withOpacity(0.1), shape: BoxShape.circle),
                 child: Icon(icon, color: color, size: 20),
               ),
               _buildTrendBadge(change, isPositive),
             ],
           ),
           
           Column(
             crossAxisAlignment: CrossAxisAlignment.start,
             children: [
               Text(value, style: GoogleFonts.poppins(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.black87, height: 1.0), overflow: TextOverflow.ellipsis, maxLines: 1),
               const SizedBox(height: 4),
               Text(title, style: GoogleFonts.poppins(fontSize: 13, color: Colors.grey[500]), overflow: TextOverflow.ellipsis, maxLines: 1),
             ],
           ),

           if (isChart)
             SizedBox(
               height: 30,
               child: LineChart(
                 LineChartData(
                   gridData: const FlGridData(show: false),
                   titlesData: const FlTitlesData(show: false),
                   borderData: FlBorderData(show: false),
                   lineBarsData: [
                     LineChartBarData(
                       spots: [
                         const FlSpot(0, 3), const FlSpot(1, 1), const FlSpot(2, 4), const FlSpot(3, 2), const FlSpot(4, 5), const FlSpot(5, 7)
                       ],
                       isCurved: true,
                       color: color,
                       barWidth: 2,
                       dotData: const FlDotData(show: false),
                       belowBarData: BarAreaData(show: true, color: color.withOpacity(0.1))
                     )
                   ]
                 )
               ),
             )
        ],
      ),
    );
  }

  Widget _buildTrendBadge(String text, bool isPositive) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: isPositive ? const Color(0xFFE8F5E9) : const Color(0xFFFFEBEE),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(isPositive ? Icons.arrow_upward_rounded : Icons.arrow_downward_rounded, 
             size: 14, color: isPositive ? Colors.green[700] : Colors.red[700]),
          const SizedBox(width: 4),
          Text(text, style: TextStyle(
            fontSize: 11, fontWeight: FontWeight.bold, color: isPositive ? Colors.green[700] : Colors.red[700]
          )),
        ],
      ),
    );
  }

  
  
  
  Widget _buildMainAnalyticsSection(CityMonitorProvider provider) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: const [BoxShadow(color: Color(0x0A000000), blurRadius: 20, offset: Offset(0, 10))],
      ),
      child: Column(
        children: [
          
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text("Traffic & Incidents", style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.bold)),
              
              
              Container(
                height: 32,
                padding: const EdgeInsets.all(2),
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: BorderRadius.circular(8)
                ),
                child: Row(
                  children: [
                    _buildChartTabIcon(Icons.show_chart, 0),
                    _buildChartTabIcon(Icons.bar_chart_rounded, 1),
                  ],
                ),
              )
            ],
          ),
          const SizedBox(height: 30),
          
          
          SizedBox(
            height: 300,
            child: IndexedStack(
              index: _selectedChartIndex,
              children: [
                 _buildSmoothLineChart(provider.trends),
                 _buildDepartmentBarChart(provider.departmentStats),
              ],
            ),
          )

        ],
      ),
    );
  }

  Widget _buildChartTabIcon(IconData icon, int index) {
    bool isSelected = _selectedChartIndex == index;
    return GestureDetector(
      onTap: () => setState(() => _selectedChartIndex = index),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 12),
        decoration: BoxDecoration(
          color: isSelected ? Colors.white : Colors.transparent,
          borderRadius: BorderRadius.circular(6),
          boxShadow: isSelected ? [const BoxShadow(color: Colors.black12, blurRadius: 4)] : [],
        ),
        child: Center(
          child: Icon(icon, size: 18, color: isSelected ? Colors.black87 : Colors.grey),
        ),
      ),
    );
  }

  Widget _buildSmoothLineChart(List<dynamic> trends) {
    if (trends.isEmpty) return const Center(child: Text("No Data Available"));

    List<FlSpot> spots = [];
    for (int i=0; i<trends.length; i++) {
       spots.add(FlSpot(i.toDouble(), (trends[i]['count'] ?? 0).toDouble()));
    }

    return LineChart(
      LineChartData(
        gridData: FlGridData(
          show: true,
          drawVerticalLine: true,
          getDrawingHorizontalLine: (value) => FlLine(color: Colors.grey[100], strokeWidth: 1),
          getDrawingVerticalLine: (value) => FlLine(color: Colors.grey[100], strokeWidth: 1),
        ),
        titlesData: FlTitlesData(
          bottomTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, getTitlesWidget: (val, meta) {
             if (val.toInt() >= 0 && val.toInt() < trends.length) {
                
                String raw = trends[val.toInt()]['label'] ?? '';
                return Text(raw.length > 3 ? raw.substring(0,3) : raw, style: const TextStyle(fontSize: 10, color: Colors.grey));
             }
             return const SizedBox();
          }, interval: 1)),
          leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: true, reservedSize: 30)),
          topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
        ),
        borderData: FlBorderData(show: false),
        lineBarsData: [
          LineChartBarData(
            spots: spots,
            isCurved: true,
            color: const Color(0xFF6C63FF),
            barWidth: 3,
            isStrokeCapRound: true,
            dotData: const FlDotData(show: false),
            belowBarData: BarAreaData(show: true, color: const Color(0xFF6C63FF).withOpacity(0.1))
          )
        ]
      )
    );
  }
  
  
  
  
  Widget _buildDepartmentDeepDive(CityMonitorProvider provider) {
    final stats = provider.departmentStats;
    if (stats.isEmpty) return const SizedBox();

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("Department Efficiency", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          LayoutBuilder(builder: (ctx, constraints) {
             return Wrap(
                spacing: 16,
                runSpacing: 16,
                children: List.generate(stats.length, (index) {
                   final dept = stats[index];
                   final width = (constraints.maxWidth / 2) - 8;
                   return Container(
                     width: width,
                     padding: const EdgeInsets.all(16),
                     decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
                     child: Column(
                       crossAxisAlignment: CrossAxisAlignment.start,
                       children: [
                         Row(
                           children: [
                             CircleAvatar(
                               backgroundColor: _getDeptColor(index).withOpacity(0.1),
                               radius: 16,
                               child: Icon(Icons.business, size: 16, color: _getDeptColor(index)),
                             ),
                             const SizedBox(width: 8),
                             Expanded(child: Text(dept['name'] ?? '', overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w600))),
                           ],
                         ),
                         const SizedBox(height: 12),
                         LinearProgressIndicator(
                           value: 0.7 + (Random().nextDouble() * 0.2), 
                           backgroundColor: Colors.grey[100],
                           color: _getDeptColor(index),
                           minHeight: 6,
                           borderRadius: BorderRadius.circular(10),
                         ),
                         const SizedBox(height: 8),
                         Text("${dept['active']} Active Cases", style: TextStyle(fontSize: 12, color: Colors.grey[500]))
                       ],
                     ),
                   );
                }),
             );
          })
        ],
      ),
    );
  }

  
  Widget _buildDepartmentBarChart(List<dynamic> stats) {
    return BarChart(
      BarChartData(
        alignment: BarChartAlignment.spaceAround,
        barTouchData: const BarTouchData(enabled: true),
        titlesData: const FlTitlesData(
           leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, reservedSize: 30)),
           bottomTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)), 
           topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
           rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
        ),
        gridData: const FlGridData(show: false),
        borderData: FlBorderData(show: false),
        barGroups: stats.asMap().entries.map((e) {
             return BarChartGroupData(
                x: e.key,
                barRods: [
                  BarChartRodData(
                     toY: (e.value['active'] ?? 0).toDouble(),
                     color: _getDeptColor(e.key),
                     width: 14,
                     borderRadius: BorderRadius.circular(4)
                  )
                ]
             );
        }).toList(),
      )
    );
  }
  
  
  
  
  Widget _buildAnomalyList(CityMonitorProvider provider) {
    final anomalies = provider.criticalAnomalies;
    
    if (anomalies.isEmpty) {
      return Container(
        margin: const EdgeInsets.symmetric(horizontal: 16),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
        child: const Center(child: Text("No critical anomalies detected in the last scan.", style: TextStyle(color: Colors.grey))),
      );
    }

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("Recent Anomalies", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          ...anomalies.map((a) => Container(
             margin: const EdgeInsets.only(bottom: 12),
             padding: const EdgeInsets.all(16),
             decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
             child: Row(
               children: [
                 Container(
                   padding: const EdgeInsets.all(12),
                   decoration: BoxDecoration(color: Colors.red[50], borderRadius: BorderRadius.circular(12)),
                   child: const Icon(Icons.warning_amber_rounded, color: Colors.redAccent),
                 ),
                 const SizedBox(width: 16),
                 Expanded(
                   child: Column(
                     crossAxisAlignment: CrossAxisAlignment.start,
                     children: [
                       Text(a['title'] ?? 'Unknown Issue', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                       Text(a['description'] ?? 'No Description', style: const TextStyle(color: Colors.grey, fontSize: 13), maxLines: 2, overflow: TextOverflow.ellipsis),
                     ],
                   ),
                 ),
                 Container(
                   padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                   decoration: BoxDecoration(color: Colors.redAccent, borderRadius: BorderRadius.circular(8)),
                   child: const Text("CRITICAL", style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                 )
               ],
             ),
          ))
        ],
      )
    );
  }

  
  
  
  Widget _buildLiveActivityFeed() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    final activities = [
      {"icon": Icons.check_circle, "title": "Case #4521 Resolved", "dept": "Sanitation", "time": "2m ago", "color": Colors.green, "badge": "🏆"},
      {"icon": Icons.warning_amber, "title": "High Priority Alert", "dept": "Traffic", "time": "5m ago", "color": Colors.orange, "badge": "⚡"},
      {"icon": Icons.trending_up, "title": "Response Time Improved", "dept": "Health", "time": "8m ago", "color": Colors.blue, "badge": "📈"},
      {"icon": Icons.people, "title": "New Team Deployed", "dept": "Fire", "time": "12m ago", "color": Colors.red, "badge": "🚒"},
    ];

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: const [BoxShadow(color: Color(0x0A000000), blurRadius: 20, offset: Offset(0, 10))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.greenAccent.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.bolt, color: Colors.greenAccent, size: 20),
                  ),
                  const SizedBox(width: 12),
                  Text("Live Activity", style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.bold, color: isDark ? Colors.white : Colors.black87)),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.greenAccent.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.greenAccent.withOpacity(0.3))
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 6, height: 6,
                      decoration: const BoxDecoration(
                        color: Colors.greenAccent,
                        shape: BoxShape.circle
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text("UPDATING", style: GoogleFonts.poppins(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.greenAccent)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          ...activities.map((activity) => Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: isDark ? Colors.grey[850] : Colors.grey[50],
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: (activity['color'] as Color).withOpacity(0.2), width: 1.5)
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: (activity['color'] as Color).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(activity['icon'] as IconData, color: activity['color'] as Color, size: 20),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              activity['title'] as String,
                              style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 13, color: isDark ? Colors.white : Colors.black87),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Text(
                            activity['badge'] as String,
                            style: const TextStyle(fontSize: 16),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: (activity['color'] as Color).withOpacity(0.1),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              activity['dept'] as String,
                              style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: activity['color'] as Color),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            activity['time'] as String,
                            style: TextStyle(fontSize: 11, color: isDark ? Colors.grey[400] : Colors.grey[600]),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          )),
        ],
      ),
    );
  }

  Color _getDeptColor(int index) {
      final colors = [Colors.blue, Colors.orange, Colors.green, Colors.purple, Colors.red];
      return colors[index % colors.length];
  }
}

class GridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = Colors.white.withOpacity(0.05)..strokeWidth = 1;
    
    
    double step = 30;
    for(double i=0; i<size.width; i+=step) {
       canvas.drawLine(Offset(i, 0), Offset(i, size.height), paint);
    }
     for(double i=0; i<size.height; i+=step) {
       canvas.drawLine(Offset(0, i), Offset(size.width, i), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
