import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:urban_flutter/services/intelligence_service.dart';

class ModuleDetailScreen extends StatefulWidget {
  final int moduleNumber;
  final String moduleName;
  final IconData icon;
  final Color color;

  const ModuleDetailScreen({
    super.key,
    required this.moduleNumber,
    required this.moduleName,
    required this.icon,
    required this.color,
  });

  @override
  _ModuleDetailScreenState createState() => _ModuleDetailScreenState();
}

class _ModuleDetailScreenState extends State<ModuleDetailScreen> {
  bool isLoading = true;
  Map<String, dynamic>? moduleData;
  String? error;

  @override
  void initState() {
    super.initState();
    loadModuleData();
  }

  Future<void> loadModuleData() async {
    setState(() {
      isLoading = true;
      error = null;
    });

    try {
      Map<String, dynamic> result;

      
      switch (widget.moduleNumber) {
        case 1: 
          result = await IntelligenceService.getMemoryInsights();
          break;
        case 2: 
          result = await IntelligenceService.getSilentProblems();
          break;
        case 3: 
          result = await IntelligenceService.getRiskMap();
          break;
        case 4: 
          result = await IntelligenceService.getAdminLoadAlerts();
          break;
        case 5: 
          result = await IntelligenceService.getCityResilience();
          break;
        case 6: 
          result = await IntelligenceService.getFeedbackImprovements();
          break;
        case 7: 
          result = await IntelligenceService.getDecisionMetrics();
          break;
        case 8: 
          result = await IntelligenceService.getPeakHours(days: 30);
          break;
        case 9: 
          result = await IntelligenceService.getCityTrust();
          break;
        case 10: 
          result = await IntelligenceService.getEthicsAudit();
          break;
        case 11: 
          result = await IntelligenceService.getActiveAnomalies();
          break;
        case 12: 
          result = await IntelligenceService.getNervousSystemGraph(days: 30);
          break;
        case 13: 
          result = await IntelligenceService.getCityFatigue();
          break;
        case 14: 
          result = await IntelligenceService.getFutureTrends(days: 30);
          break;
        case 15: 
          result = await IntelligenceService.getCityConsciousness(days: 7);
          break;
        default:
          result = {'success': false, 'error': 'Invalid module'};
      }

      setState(() {
        if (result['success'] == false) {
          error = result['error'] ?? 'Failed to load module data';
        } else {
          moduleData = result;
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
      appBar: AppBar(
        backgroundColor: widget.color,
        elevation: 0,
        title: Row(
          children: [
            Icon(widget.icon, size: 24),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                widget.moduleName,
                style: GoogleFonts.poppins(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: loadModuleData,
          ),
        ],
      ),
      body: isLoading
          ? _buildLoadingView()
          : error != null
              ? _buildErrorView()
              : _buildContent(),
    );
  }

  Widget _buildLoadingView() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation<Color>(widget.color),
          ),
          const SizedBox(height: 24),
          Text(
            'Loading ${widget.moduleName}...',
            style: GoogleFonts.poppins(color: Colors.white70),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorView() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
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
            Text(
              error ?? 'Unknown error',
              textAlign: TextAlign.center,
              style: GoogleFonts.poppins(color: Colors.white54),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: loadModuleData,
              icon: const Icon(Icons.refresh),
              label: const Text('Retry'),
              style: ElevatedButton.styleFrom(
                backgroundColor: widget.color,
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContent() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildModuleHeader(),
          const SizedBox(height: 24),
          _buildDataSection(),
          const SizedBox(height: 80),
        ],
      ),
    );
  }

  Widget _buildModuleHeader() {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [widget.color, widget.color.withOpacity(0.7)],
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: widget.color.withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      padding: const EdgeInsets.all(24),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(widget.icon, color: Colors.white, size: 40),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Module ${widget.moduleNumber}',
                  style: GoogleFonts.poppins(
                    color: Colors.white70,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  widget.moduleName,
                  style: GoogleFonts.poppins(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDataSection() {
    if (moduleData == null) return const SizedBox();

    final data = moduleData!['data'] ?? moduleData;

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
            'Real-Time Analytics',
            style: GoogleFonts.poppins(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 20),
          _buildDataCards(data),
        ],
      ),
    );
  }

  Widget _buildDataCards(dynamic data) {
    if (data is Map<String, dynamic>) {
      return Column(
        children: data.entries.map((entry) {
          return _buildDataCard(entry.key, entry.value);
        }).toList(),
      );
    }
    return Text(
      'No data available',
      style: GoogleFonts.poppins(color: Colors.white54),
    );
  }

  Widget _buildDataCard(String key, dynamic value) {
    String displayValue = value.toString();
    
    if (value is double) {
      displayValue = value.toStringAsFixed(2);
    } else if (value is List) {
      displayValue = '${value.length} items';
    } else if (value is Map) {
      displayValue = '${value.length} entries';
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF0A0E21),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: widget.color.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            flex: 2,
            child: Text(
              _formatKey(key),
              style: GoogleFonts.poppins(
                color: Colors.white70,
                fontSize: 14,
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            flex: 3,
            child: Text(
              displayValue,
              textAlign: TextAlign.right,
              style: GoogleFonts.poppins(
                color: widget.color,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _formatKey(String key) {
    
    return key
        .replaceAllMapped(
          RegExp(r'([A-Z])'),
          (match) => ' ${match.group(0)}',
        )
        .trim()
        .split(' ')
        .map((word) => word[0].toUpperCase() + word.substring(1))
        .join(' ');
  }
}
