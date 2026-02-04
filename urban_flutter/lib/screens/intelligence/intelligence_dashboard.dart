import 'package:flutter/material.dart';
import 'package:urban_flutter/services/intelligence_service.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:google_fonts/google_fonts.dart';
import 'module_detail_screen.dart';

class IntelligenceDashboardScreen extends StatefulWidget {
  const IntelligenceDashboardScreen({super.key});

  @override
  _IntelligenceDashboardScreenState createState() => _IntelligenceDashboardScreenState();
}

class _IntelligenceDashboardScreenState extends State<IntelligenceDashboardScreen> 
    with SingleTickerProviderStateMixin {
  bool isLoading = true;
  Map<String, dynamic>? dashboardData;
  String? error;
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    _fadeAnimation = CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    );
    loadDashboard();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  Future<void> loadDashboard() async {
    setState(() {
      isLoading = true;
      error = null;
    });

    try {
      final result = await IntelligenceService.getMasterDashboard();
      
      setState(() {
        if (result['success'] == false) {
          error = result['error'] ?? 'Failed to load intelligence data';
        } else {
          dashboardData = result['dashboard'];
          _animationController.forward();
        }
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        error = e.toString();
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0E21),
      body: CustomScrollView(
        slivers: [
          _buildAppBar(),
          if (isLoading)
            SliverFillRemaining(child: _buildLoadingView())
          else if (error != null)
            SliverFillRemaining(child: _buildErrorView())
          else
            _buildContent(),
        ],
      ),
    );
  }

  Widget _buildAppBar() {
    return SliverAppBar(
      expandedHeight: 120,
      floating: false,
      pinned: true,
      backgroundColor: const Color(0xFF1D1E33),
      flexibleSpace: FlexibleSpaceBar(
        title: Text(
          '🧠 City Intelligence',
          style: GoogleFonts.poppins(
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
        background: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                Color(0xFF6C63FF),
                Color(0xFF1D1E33),
              ],
            ),
          ),
        ),
      ),
      actions: [
        IconButton(
          icon: const Icon(Icons.refresh_rounded, color: Colors.white),
          onPressed: loadDashboard,
        ),
        const SizedBox(width: 8),
      ],
    );
  }

  Widget _buildLoadingView() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF6C63FF)),
            strokeWidth: 3,
          ),
          const SizedBox(height: 24),
          Text(
            'Loading Intelligence Data...',
            style: GoogleFonts.poppins(
              color: Colors.white70,
              fontSize: 16,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorView() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline, size: 80, color: Colors.redAccent),
          const SizedBox(height: 24),
          Text(
            'Failed to Load Data',
            style: GoogleFonts.poppins(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32),
            child: Text(
              error ?? 'Unknown error',
              textAlign: TextAlign.center,
              style: GoogleFonts.poppins(color: Colors.white54),
            ),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: loadDashboard,
            icon: const Icon(Icons.refresh),
            label: const Text('Retry'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF6C63FF),
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContent() {
    return SliverPadding(
      padding: const EdgeInsets.all(16),
      sliver: SliverList(
        delegate: SliverChildListDelegate([
          FadeTransition(
            opacity: _fadeAnimation,
            child: Column(
              children: [
                
                _buildConsciousnessHeroCard(),
                const SizedBox(height: 16),

                
                _buildQuickStatsGrid(),
                const SizedBox(height: 16),

                
                _buildChartsSection(),
                const SizedBox(height: 16),

                
                _buildAnomaliesCard(),
                const SizedBox(height: 16),

                
                _buildModulesSection(),
                const SizedBox(height: 80),
              ],
            ),
          ),
        ]),
      ),
    );
  }

  Widget _buildConsciousnessHeroCard() {
    final consciousness = dashboardData?['consciousness'];
    if (consciousness == null) return const SizedBox();

    final health = consciousness['health'] ?? 'Unknown';
    final summary = consciousness['summary'] ?? 'No data available';

    return Container(
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF6C63FF), Color(0xFF5A52D5)],
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF6C63FF).withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.psychology, color: Colors.white, size: 32),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'City Consciousness',
                      style: GoogleFonts.poppins(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    _buildHealthBadge(health),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            summary,
            style: GoogleFonts.poppins(
              color: Colors.white.withOpacity(0.9),
              fontSize: 15,
              height: 1.5,
            ),
          ),
          if (consciousness['metrics'] != null) ...[
            const SizedBox(height: 20),
            FittedBox(
              fit: BoxFit.scaleDown,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildMetricPill('Total', consciousness['metrics']['total'].toString(), Icons.list_alt),
                  const SizedBox(width: 8), 
                  _buildMetricPill('Pending', consciousness['metrics']['pending'].toString(), Icons.pending_actions),
                  const SizedBox(width: 8),
                  _buildMetricPill('Solved', consciousness['metrics']['solved'].toString(), Icons.check_circle),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildHealthBadge(String health) {
    Color color;
    IconData icon;
    
    switch (health.toLowerCase()) {
      case 'healthy':
      case 'excellent':
        color = const Color(0xFF4CAF50);
        icon = Icons.favorite;
        break;
      case 'good':
        color = const Color(0xFF8BC34A);
        icon = Icons.thumb_up;
        break;
      case 'stable':
        color = const Color(0xFF2196F3);
        icon = Icons.trending_flat;
        break;
      case 'stressed':
        color = const Color(0xFFFF9800);
        icon = Icons.warning;
        break;
      default:
        color = const Color(0xFF9E9E9E);
        icon = Icons.help;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.2),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color, width: 1.5),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: color, size: 16),
          const SizedBox(width: 6),
          Text(
            health,
            style: GoogleFonts.poppins(
              color: color,
              fontSize: 13,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetricPill(String label, String value, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.15),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          Icon(icon, color: Colors.white70, size: 20),
          const SizedBox(height: 6),
          Text(
            value,
            style: GoogleFonts.poppins(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            label,
            style: GoogleFonts.poppins(
              color: Colors.white70,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickStatsGrid() {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 1.5,
      children: [
        _buildStatCard(
          'Trust Score',
          '${dashboardData?['trust']?['avgTrust']?.toStringAsFixed(1) ?? '0'}%',
          Icons.verified_user,
          const Color(0xFF2196F3),
        ),
        _buildStatCard(
          'Fatigue Level',
          '${dashboardData?['fatigue']?['avgFatigue']?.toStringAsFixed(1) ?? '0'}%',
          Icons.battery_alert,
          const Color(0xFFFF9800),
        ),
        _buildStatCard(
          'Anomalies',
          '${dashboardData?['anomalies']?['count'] ?? 0}',
          Icons.warning_amber,
          const Color(0xFFF44336),
        ),
        _buildStatCard(
          'Resolution Rate',
          '${dashboardData?['consciousness']?['resolutionRate']?.toStringAsFixed(1) ?? '0'}%',
          Icons.trending_up,
          const Color(0xFF4CAF50),
        ),
      ],
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF1D1E33),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.3), width: 1),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Icon(icon, color: color, size: 24),
              Expanded(
                child: FittedBox(
                  fit: BoxFit.scaleDown,
                  alignment: Alignment.centerRight,
                  child: Text(
                    value,
                    style: GoogleFonts.poppins(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ],
          ),
          Text(
            title,
            style: GoogleFonts.poppins(
              color: Colors.white70,
              fontSize: 13,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChartsSection() {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF1D1E33),
        borderRadius: BorderRadius.circular(20),
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Trust & Fatigue Analysis',
            style: GoogleFonts.poppins(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 20),
          _buildTrustFatigueChart(),
        ],
      ),
    );
  }

  Widget _buildTrustFatigueChart() {
    final trust = (dashboardData?['trust']?['avgTrust'] as num?)?.toDouble() ?? 0.0;
    final fatigue = (dashboardData?['fatigue']?['avgFatigue'] as num?)?.toDouble() ?? 0.0;

    return SizedBox(
      height: 200,
      child: BarChart(
        BarChartData(
          alignment: BarChartAlignment.spaceAround,
          maxY: 100,
          barTouchData: const BarTouchData(enabled: false),
          titlesData: FlTitlesData(
            show: true,
            bottomTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                getTitlesWidget: (value, meta) {
                  switch (value.toInt()) {
                    case 0:
                      return const Text('Trust', style: TextStyle(color: Colors.white70, fontSize: 12));
                    case 1:
                      return const Text('Fatigue', style: TextStyle(color: Colors.white70, fontSize: 12));
                    default:
                      return const Text('');
                  }
                },
              ),
            ),
            leftTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                reservedSize: 40,
                getTitlesWidget: (value, meta) {
                  return Text(
                    '${value.toInt()}%',
                    style: const TextStyle(color: Colors.white54, fontSize: 10),
                  );
                },
              ),
            ),
            topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          ),
          gridData: FlGridData(
            show: true,
            drawVerticalLine: false,
            horizontalInterval: 25,
            getDrawingHorizontalLine: (value) {
              return FlLine(
                color: Colors.white.withOpacity(0.1),
                strokeWidth: 1,
              );
            },
          ),
          borderData: FlBorderData(show: false),
          barGroups: [
            BarChartGroupData(
              x: 0,
              barRods: [
                BarChartRodData(
                  toY: trust,
                  color: const Color(0xFF2196F3),
                  width: 40,
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(8)),
                ),
              ],
            ),
            BarChartGroupData(
              x: 1,
              barRods: [
                BarChartRodData(
                  toY: fatigue,
                  color: const Color(0xFFFF9800),
                  width: 40,
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(8)),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAnomaliesCard() {
    final anomalies = dashboardData?['anomalies'];
    if (anomalies == null) return const SizedBox();

    final count = anomalies['count'] ?? 0;

    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: count > 0 
            ? [const Color(0xFFF44336), const Color(0xFFE91E63)]
            : [const Color(0xFF4CAF50), const Color(0xFF8BC34A)],
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: (count > 0 ? const Color(0xFFF44336) : const Color(0xFF4CAF50)).withOpacity(0.3),
            blurRadius: 15,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      padding: const EdgeInsets.all(20),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              shape: BoxShape.circle,
            ),
            child: Icon(
              count > 0 ? Icons.warning_amber : Icons.check_circle,
              color: Colors.white,
              size: 32,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  count > 0 ? 'Active Anomalies Detected' : 'No Anomalies Detected',
                  style: GoogleFonts.poppins(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  count > 0 
                    ? '$count unusual patterns found in the system'
                    : 'System operating normally',
                  style: GoogleFonts.poppins(
                    color: Colors.white.withOpacity(0.9),
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: const BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
            ),
            child: Text(
              count.toString(),
              style: GoogleFonts.poppins(
                color: count > 0 ? const Color(0xFFF44336) : const Color(0xFF4CAF50),
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildModulesSection() {
    final modules = [
      {'name': 'Urban Memory Vault', 'icon': Icons.storage, 'color': const Color(0xFF2196F3)},
      {'name': 'Silent Problem Detector', 'icon': Icons.hearing_disabled, 'color': const Color(0xFFFF9800)},
      {'name': 'Urban DNA Profile', 'icon': Icons.fingerprint, 'color': const Color(0xFF9C27B0)},
      {'name': 'Admin Cognitive Load', 'icon': Icons.psychology, 'color': const Color(0xFFF44336)},
      {'name': 'City Resilience Index', 'icon': Icons.shield, 'color': const Color(0xFF4CAF50)},
      {'name': 'Feedback Loop Engine', 'icon': Icons.loop, 'color': const Color(0xFF00BCD4)},
      {'name': 'Decision Simplicity Score', 'icon': Icons.assessment, 'color': const Color(0xFF3F51B5)},
      {'name': 'Time-of-Day Intelligence', 'icon': Icons.access_time, 'color': const Color(0xFFFFEB3B)},
      {'name': 'Trust Infrastructure', 'icon': Icons.verified_user, 'color': const Color(0xFF2196F3)},
      {'name': 'System Ethics Panel', 'icon': Icons.balance, 'color': const Color(0xFF795548)},
      {'name': 'Urban Anomaly Lab', 'icon': Icons.warning, 'color': const Color(0xFFF44336)},
      {'name': 'City Nervous System', 'icon': Icons.device_hub, 'color': const Color(0xFF00BCD4)},
      {'name': 'Collective Fatigue Meter', 'icon': Icons.battery_alert, 'color': const Color(0xFFFF9800)},
      {'name': 'Future Shadow View', 'icon': Icons.trending_up, 'color': const Color(0xFF673AB7)},
      {'name': 'Urban Consciousness Mode', 'icon': Icons.psychology_outlined, 'color': const Color(0xFF6C63FF)},
    ];

    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF1D1E33),
        borderRadius: BorderRadius.circular(20),
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'All 15 Intelligence Modules',
            style: GoogleFonts.poppins(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          ...modules.asMap().entries.map((entry) {
            final index = entry.key;
            final module = entry.value;
            return _buildModuleTile(
              index + 1,
              module['name'] as String,
              module['icon'] as IconData,
              module['color'] as Color,
            );
          }),
        ],
      ),
    );
  }

  Widget _buildModuleTile(int number, String name, IconData icon, Color color) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF0A0E21),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3), width: 1),
      ),
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: color.withOpacity(0.2),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: color, size: 20),
        ),
        title: Text(
          name,
          style: GoogleFonts.poppins(
            color: Colors.white,
            fontSize: 14,
            fontWeight: FontWeight.w500,
          ),
        ),
        subtitle: Text(
          'Module $number',
          style: GoogleFonts.poppins(
            color: Colors.white54,
            fontSize: 11,
          ),
        ),
        trailing: Icon(Icons.chevron_right, color: color),
        onTap: () => _navigateToModuleDetail(number, name, icon, color),
      ),
    );
  }

  void _navigateToModuleDetail(int number, String name, IconData icon, Color color) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ModuleDetailScreen(
          moduleNumber: number,
          moduleName: name,
          icon: icon,
          color: color,
        ),
      ),
    );
  }
}
