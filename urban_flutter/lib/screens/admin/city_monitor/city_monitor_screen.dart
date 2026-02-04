import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:urban_flutter/core/providers/city_monitor_provider.dart';
import 'views/monitor_trends_view.dart';
import 'views/monitor_intelligence_view.dart';
import 'views/monitor_environmental_view.dart';

class CityMonitorScreen extends StatefulWidget {
  const CityMonitorScreen({super.key});

  @override
  State<CityMonitorScreen> createState() => _CityMonitorScreenState();
}

class _CityMonitorScreenState extends State<CityMonitorScreen> {
  int _selectedIndex = 0;

  @override
  void initState() {
    super.initState();
    
    // Fetch real data from analytics backend
    Future.microtask(() => 
      Provider.of<CityMonitorProvider>(context, listen: false).fetchDashboardData()
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<CityMonitorProvider>(context);

    
    final isDesktop = MediaQuery.of(context).size.width > 800;

    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("CITY ANALYTICS", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
            Text("Trends & Intelligence Dashboard", style: TextStyle(fontSize: 12, color: Colors.grey)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: provider.isLoading ? null : () => provider.fetchDashboardData(),
          ),
          const SizedBox(width: 16),
        ],
      ),
      body: Row(
        children: [
          if (isDesktop) _buildSidebar(),
          Expanded(
            child: _buildContent(_selectedIndex),
          ),
        ],
      ),
      bottomNavigationBar: isDesktop ? null : NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (idx) => setState(() => _selectedIndex = idx),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.show_chart), label: 'Trends'),
          NavigationDestination(icon: Icon(Icons.analytics), label: 'Intelligence'),
          NavigationDestination(icon: Icon(Icons.public), label: 'Environment'),
        ],
      ),
    );
  }

  Widget _buildSidebar() {
    return Container(
      width: 250,
      color: Colors.white,
      child: Column(
        children: [
          const SizedBox(height: 20),
          _buildSidebarItem(0, Icons.show_chart, "Time & Trends"),
          _buildSidebarItem(1, Icons.analytics, "Intelligence"),
          _buildSidebarItem(2, Icons.public, "Environment"),
          const Spacer(),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.exit_to_app, color: Colors.red),
            title: const Text("Exit Analytics"),
            onTap: () => Navigator.pop(context),
          )
        ],
      ),
    );
  }

  Widget _buildSidebarItem(int index, IconData icon, String label) {
    final isSelected = _selectedIndex == index;
    return ListTile(
      leading: Icon(icon, color: isSelected ? Colors.blue : Colors.grey),
      title: Text(label, style: TextStyle(
        color: isSelected ? Colors.blue : Colors.black87,
        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal
      )),
      selected: isSelected,
      selectedTileColor: Colors.blue.withOpacity(0.1),
      onTap: () => setState(() => _selectedIndex = index),
    );
  }

  Widget _buildContent(int index) {
    switch (index) {
      case 0: return const MonitorTrendsView();
      case 1: return const MonitorIntelligenceView();
      case 2: return const MonitorEnvironmentalView(); 
      default: return const Center(child: Text("Select a View"));
    }
  }
}
