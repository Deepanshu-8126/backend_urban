import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:async';
import 'dart:math';

class CityBrainView extends StatefulWidget {
  const CityBrainView({super.key});

  @override
  _CityBrainViewState createState() => _CityBrainViewState();
}

class _CityBrainViewState extends State<CityBrainView> with TickerProviderStateMixin {
  late AnimationController _pulseController;
  Timer? _metricsTimer;
  List<FlSpot> _stressPoints = [];
  final List<String> _systemLogs = []; 
  final ScrollController _logScrollController = ScrollController();
  double _timeTravelValue = 0; 

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 1500)) 
      ..repeat(reverse: true);
    
    
    _initLiveFeed();
  }

  void _initLiveFeed() {
    
    for (int i = 0; i < 20; i++) {
      _stressPoints.add(FlSpot(i.toDouble(), 30 + Random().nextDouble() * 10));
    }

    _metricsTimer = Timer.periodic(const Duration(milliseconds: 1000), (timer) {
      if (!mounted) return;
      setState(() {
        
        _stressPoints.removeAt(0);
        
        List<FlSpot> newPoints = [];
        for (int i = 0; i < _stressPoints.length; i++) {
          newPoints.add(FlSpot(i.toDouble(), _stressPoints[i].y));
        }
        
        newPoints.add(FlSpot(19.0, 30 + Random().nextDouble() * 20));
        _stressPoints = newPoints;
        
        
        if (Random().nextDouble() > 0.6) {
          _addSystemLog();
        }
      });
    });
  }

  void _addSystemLog() {
    final messages = [
      "Optimizing traffic flow in Sector 7...",
      "Node 0x4F detected latency spike",
      "Re-routing emergency services...",
      "Analyzing water pressure deviation...",
      "Citizen feedback received: Batch #902",
      "Neural link established with regional grid",
      "Predicting congestion pattern: High confid.",
      "Syncing with IOT sensors...",
    ];
    setState(() {
      _systemLogs.insert(0, "> ${messages[Random().nextInt(messages.length)]}");
      if (_systemLogs.length > 20) _systemLogs.removeLast();
    });
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _metricsTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        
        final isMobile = constraints.maxWidth < 800;
        final screenHeight = MediaQuery.of(context).size.height;
        final isShortScreen = screenHeight < 600;

        
        if (isMobile || isShortScreen) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildHeader(),
                const SizedBox(height: 20),
                
                SizedBox(
                  height: 300, 
                  child: RepaintBoundary(child: _buildNeuralNetwork()),
                ),
                const SizedBox(height: 16),
                _buildRightPanel(isMobile: true),
                const SizedBox(height: 20),
                const SizedBox(height: 20),
                _buildTimeTravelControl(),
                
                
                SizedBox(height: MediaQuery.of(context).padding.bottom + 40), 
              ],
            ),
          );
        }

        
        return Container(
          color: const Color(0xFF0F111A), 
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeader(),
              const SizedBox(height: 20),
              Expanded(
                child: Row(
                  children: [
                    Expanded(
                      flex: 2, 
                      child: RepaintBoundary(child: _buildNeuralNetwork()),
                    ),
                    const SizedBox(width: 24),
                    Expanded(
                      flex: 1, 
                      child: _buildRightPanel(),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              _buildTimeTravelControl(),
            ],
          ),
        );
      }
    );
  }

  Widget _buildHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            
            const Icon(Icons.psychology, color: Colors.purpleAccent, size: 32),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text("CITY INTELLIGENCE",
                    style: GoogleFonts.orbitron(
                        color: Colors.white,
                        fontSize: 24,
                        fontWeight: FontWeight.bold)),
                Text("Advanced Neural Core • Online",
                    style:
                        GoogleFonts.robotoMono(color: Colors.greenAccent, fontSize: 12)),
              ],
            ),
          ],
        ),
        RepaintBoundary(child: _buildLiveIndicator()),
      ],
    );
  }

  Widget _buildLiveIndicator() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.redAccent.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.redAccent.withOpacity(0.5)),
        boxShadow: [
          BoxShadow(
            color: Colors.redAccent.withOpacity(0.2),
            blurRadius: 10,
            spreadRadius: 1,
          )
        ]
      ),
      child: Row(
        children: [
          FadeTransition(
            opacity: _pulseController,
            child: const Icon(Icons.circle, color: Colors.redAccent, size: 10),
          ),
          const SizedBox(width: 8),
          Text("LIVE FEED",
              style: GoogleFonts.robotoMono(
                  color: Colors.redAccent, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildNeuralNetwork() {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF1A1D2E),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.purpleAccent.withOpacity(0.3)),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFF1A1D2E),
            Color(0xFF131624),
          ]
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.purpleAccent.withOpacity(0.1),
            blurRadius: 20,
            spreadRadius: 2,
          ),
        ],
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text("CEREBRAL ACTIVITY",
              style: GoogleFonts.robotoMono(color: Colors.white60, fontSize: 12)),
          const SizedBox(height: 10),
          Expanded(
            child: LineChart(
              LineChartData(
                gridData: FlGridData(
                  show: true,
                  drawVerticalLine: true,
                  getDrawingHorizontalLine: (value) => FlLine(
                    color: Colors.white.withOpacity(0.05),
                    strokeWidth: 1,
                  ),
                  getDrawingVerticalLine: (value) => FlLine(
                    color: Colors.white.withOpacity(0.05),
                    strokeWidth: 1,
                  ),
                ),
                titlesData: const FlTitlesData(show: false), 
                borderData: FlBorderData(
                  show: true,
                  border: Border.all(color: const Color(0xff37434d), width: 1),
                ),
                minX: 0,
                maxX: 19,
                minY: 0,
                maxY: 80, 
                lineBarsData: [
                  LineChartBarData(
                    spots: _stressPoints,
                    isCurved: true,
                    curveSmoothness: 0.35, 
                    gradient: const LinearGradient(
                      colors: [Colors.purpleAccent, Colors.cyanAccent],
                    ),
                    barWidth: 3,
                    isStrokeCapRound: true,
                    dotData: const FlDotData(show: false),
                    belowBarData: BarAreaData(
                      show: true,
                      gradient: LinearGradient(
                        colors: [
                          Colors.purpleAccent.withOpacity(0.2),
                          Colors.cyanAccent.withOpacity(0.0),
                        ],
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                      ),
                    ),
                  ),
                ],
              ),
              duration: Duration.zero, 
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRightPanel({bool isMobile = false}) {
    
    List<Widget> children = [
      _buildStatCard("SYSTEM LOAD", "84%", Colors.orangeAccent, Icons.memory),
      const SizedBox(height: 16, width: 16),
      _buildStatCard("THREAT LEVEL", "LOW", Colors.greenAccent, Icons.security),
      const SizedBox(height: 16, width: 16),
      _buildStatCard("ACTIVE NODES", "1,240", Colors.blueAccent, Icons.hub),
    ];

    if (isMobile) {
      return Column(children: [
        ...children,
        const SizedBox(height: 16),
        _buildLogPanel(height: 150), 
      ]);
    }
    
    
    return Column(
      children: [
        ...children.map((c) => (c is SizedBox) ? c : Expanded(flex: 2, child: c)),
        const SizedBox(height: 16),
        Expanded(flex: 3, child: _buildLogPanel()), 
      ],
    );
  }

  Widget _buildLogPanel({double? height}) {
    return Container(
      height: height,
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.3),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.greenAccent.withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text("SYSTEM LOGS", style: GoogleFonts.robotoMono(color: Colors.greenAccent, fontSize: 10, fontWeight: FontWeight.bold)),
          const Divider(color: Colors.greenAccent, height: 8),
          Expanded(
            child: ListView.builder(
              controller: _logScrollController,
              itemCount: _systemLogs.length,
              itemBuilder: (context, index) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 4.0),
                  child: Text(
                    _systemLogs[index],
                    style: GoogleFonts.firaCode(
                      color: index == 0 ? Colors.white : Colors.white54,
                      fontSize: 10,
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(String label, String value, Color color, IconData icon) {
    return Container(
      width: double.infinity,
      height: 100, 
      decoration: BoxDecoration(
        color: const Color(0xFF1A1D2E),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.3)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.2),
            blurRadius: 8,
            offset: const Offset(0, 4),
          )
        ]
      ),
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Row( 
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(value,
                    style: GoogleFonts.orbitron(
                        color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
                Text(label,
                    style: GoogleFonts.robotoMono(color: Colors.white60, fontSize: 12),
                    overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          Icon(icon, color: color, size: 36),
        ],
      ),
    );
  }

  Widget _buildTimeTravelControl() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
         color: const Color(0xFF1A1D2E),
         borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.blueAccent.withOpacity(0.3)),
          gradient: const LinearGradient(
            colors: [Color(0xFF1A1D2E), Color(0xFF151825)]
          )
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
           Row(
             mainAxisAlignment: MainAxisAlignment.spaceBetween,
             children: [
               Text("PREDICTIVE TIME TRAVEL",
              style: GoogleFonts.orbitron(color: Colors.blueAccent, fontSize: 16)),
               Container(
                 padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                 decoration: BoxDecoration(
                   color: Colors.blueAccent.withOpacity(0.2),
                   borderRadius: BorderRadius.circular(8),
                   border: Border.all(color: Colors.blueAccent.withOpacity(0.5))
                 ),
                 child: Text(
                   _timeTravelValue == 0 ? "NOW" : "+${_timeTravelValue.toInt()} DAYS",
                    style: GoogleFonts.robotoMono(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)
                 ),
               )
             ],
           ),
           const SizedBox(height: 16),
           SliderTheme(
             data: SliderTheme.of(context).copyWith(
               activeTrackColor: Colors.blueAccent,
               inactiveTrackColor: Colors.grey[800],
               thumbColor: Colors.cyanAccent,
               overlayColor: Colors.cyanAccent.withOpacity(0.2),
               trackHeight: 4,
               thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 8),
             ),
             child: Slider(
               value: _timeTravelValue,
               min: 0,
               max: 30,
               divisions: 30,
               onChanged: (val) {
                 setState(() {
                   _timeTravelValue = val;
                 });
               },
             ),
           ),
           const SizedBox(height: 8),
           AnimatedSwitcher(
             duration: const Duration(milliseconds: 300),
             child: Text(
               "Projected Risk Analysis: ${_timeTravelValue > 10 ? 'HIGH PROBABILITY OF TRAFFIC CONGESTION' : 'STABLE PREDICTION'}",
               key: ValueKey(_timeTravelValue > 10),
               style: GoogleFonts.robotoMono(
                 color: _timeTravelValue > 10 ? Colors.orangeAccent : Colors.greenAccent,
                 fontWeight: FontWeight.bold
               ),
             ),
           )
        ],
      ),
    );
  }
}
