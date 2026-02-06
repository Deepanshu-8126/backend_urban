import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:shimmer/shimmer.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/api_service.dart';
import 'admin_complaint_detail_screen.dart';

class AdminView extends StatefulWidget {
  const AdminView({super.key});

  @override
  State<AdminView> createState() => _AdminViewState();
}

class _AdminViewState extends State<AdminView> {
  List<dynamic> _allComplaints = [];
  List<dynamic> _filteredComplaints = [];
  bool _isLoading = true;
  String _searchQuery = "";
  String? _statusFilter;

  
  int _total = 0;
  int _pending = 0;
  int _critical = 0;

  @override
  void initState() {
    super.initState();
    fetchComplaints();
  }

  Future<void> fetchComplaints() async {
    setState(() => _isLoading = true);
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      String? token = prefs.getString('token');
      String? userDepartment = prefs.getString('department') ?? 'general';

      final response = await http.get(
        Uri.parse('${ApiService.baseUrl}/admin/complaints/$userDepartment'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (mounted) {
          final list = data['complaints'] ?? [];
          setState(() {
            _allComplaints = list;
            _calculateStats();
            _filterComplaints();
            _isLoading = false;
          });
        }
      } else {
        if (mounted) setState(() => _isLoading = false);
      }
    } catch (e) {
      print('Error fetching complaints: $e');
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _calculateStats() {
    _total = _allComplaints.length;
    _pending = _allComplaints.where((c) => c['status'] == 'pending').length;
    _critical = _allComplaints.where((c) => (c['priorityScore'] ?? 0) > 8).length;
  }

  void _filterComplaints() {
    setState(() {
      _filteredComplaints = _allComplaints.where((item) {
        final title = (item['title'] ?? '').toString().toLowerCase();
        final desc = (item['description'] ?? '').toString().toLowerCase();
        final matchesSearch = title.contains(_searchQuery.toLowerCase()) || desc.contains(_searchQuery.toLowerCase());
        
        final status = (item['status'] ?? 'pending').toString().toLowerCase();
        final matchesStatus = _statusFilter == null || status == _statusFilter;

        return matchesSearch && matchesStatus;
      }).toList();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      body: CustomScrollView(
        slivers: [
          
          SliverAppBar(
            floating: true,
            pinned: true,
            elevation: 0,
            backgroundColor: Colors.white,
            title: Text("COMMAND CENTER", style: GoogleFonts.montserrat(fontWeight: FontWeight.w800, color: const Color(0xFF1E293B), letterSpacing: 1.0)),
            actions: [
              IconButton(icon: const Icon(Icons.refresh, color: Colors.blueGrey), onPressed: fetchComplaints),
            ],
            bottom: PreferredSize(
              preferredSize: const Size.fromHeight(80), 
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: TextField(
                  onChanged: (val) {
                    _searchQuery = val;
                    _filterComplaints();
                  },
                  decoration: InputDecoration(
                    hintText: "Search complaints...",
                    hintStyle: GoogleFonts.inter(color: Colors.grey[400]),
                    prefixIcon: const Icon(Icons.search, color: Colors.blueGrey),
                    filled: true,
                    fillColor: Colors.grey[100],
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(30), borderSide: BorderSide.none),
                    contentPadding: const EdgeInsets.symmetric(vertical: 0),
                  ),
                ),
              ),
            ),
          ),

          
          SliverToBoxAdapter(
            child: _buildAnalyticsDashboard(),
          ),

          
          SliverToBoxAdapter(
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                children: [
                   _buildFilterChip("All", null),
                   _buildFilterChip("Pending", "pending"),
                   _buildFilterChip("In Progress", "working"),
                   _buildFilterChip("Solved", "solved"),
                ],
              ),
            ),
          ),

          
          _isLoading 
            ? SliverToBoxAdapter(child: _buildSkeletonLoader())
            : _buildComplaintsList(),
        ],
      ),
    );
  }

  Widget _buildAnalyticsDashboard() {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B), 
        borderRadius: BorderRadius.circular(24),
        boxShadow: [BoxShadow(color: Colors.blue.withOpacity(0.2), blurRadius: 20, offset: const Offset(0, 10))],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(child: _buildStatCard("Total", "$_total", Colors.white)),
          Container(width: 1, height: 40, color: Colors.white24),
          Expanded(child: _buildStatCard("Pending", "$_pending", Colors.orangeAccent)),
          Container(width: 1, height: 40, color: Colors.white24),
          Expanded(child: _buildStatCard("Urgent", "$_critical", Colors.redAccent)),
        ],
      ),
    );
  }

  Widget _buildStatCard(String label, String value, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(value, style: GoogleFonts.montserrat(color: color, fontSize: 24, fontWeight: FontWeight.bold)),
        Text(label, style: GoogleFonts.inter(color: Colors.white70, fontSize: 12)),
      ],
    );
  }

  Widget _buildFilterChip(String label, String? value) {
    final isSelected = _statusFilter == value;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (v) {
          setState(() {
            _statusFilter = isSelected ? null : value;
            _filterComplaints();
          });
        },
        backgroundColor: Colors.white,
        selectedColor: Colors.blue.withOpacity(0.1),
        labelStyle: TextStyle(color: isSelected ? Colors.blue : Colors.black87, fontWeight: isSelected ? FontWeight.bold : FontWeight.normal),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: BorderSide(color: isSelected ? Colors.blue : Colors.grey[300]!)),
        showCheckmark: false,
      ),
    );
  }

  Widget _buildComplaintsList() {
    if (_filteredComplaints.isEmpty) {
      return SliverFillRemaining(
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.inbox_outlined, size: 60, color: Colors.grey[300]),
              const SizedBox(height: 16),
              Text("No complaints found", style: GoogleFonts.inter(color: Colors.grey)),
            ],
          ),
        ),
      );
    }

    return SliverList(
      delegate: SliverChildBuilderDelegate(
        (context, index) {
          final item = _filteredComplaints[index];
          return AnimationConfiguration.staggeredList(
            position: index,
            duration: const Duration(milliseconds: 500),
            child: SlideAnimation(
              verticalOffset: 50.0,
              child: FadeInAnimation(
                child: _buildComplaintCard(item),
              ),
            ),
          );
        },
        childCount: _filteredComplaints.length,
      ),
    );
  }

  Widget _buildComplaintCard(dynamic item) {
    final user = item['user'] ?? {};
    final userName = user['name'] ?? item['userName'] ?? 'Unknown Citizen';
    final category = (item['category'] ?? 'General').toString();
    final hasImage = item['imageUrl'] != null && item['imageUrl'].toString().isNotEmpty;
    final imageUrl = hasImage ? '${ApiService.baseUrl.replaceAll('/api/v1', '')}${item['imageUrl']}' : null;
    final isCritical = (item['priorityScore'] ?? 0) > 8;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () async {
            final result = await Navigator.push(context, MaterialPageRoute(builder: (_) => AdminComplaintDetailScreen(complaint: item)));
            if (result == true) fetchComplaints();
          },
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Hero(
                  tag: 'img-${item['_id']}',
                  child: Container(
                    width: 70, height: 70,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12),
                      color: Colors.grey[100],
                      image: hasImage ? DecorationImage(image: CachedNetworkImageProvider(imageUrl!), fit: BoxFit.cover) : null,
                    ),
                    child: !hasImage ? Icon(Icons.image_not_supported_outlined, color: Colors.grey[400]) : null,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(color: Colors.blue[50], borderRadius: BorderRadius.circular(6)),
                            child: Text(category.toUpperCase(), style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.blue[800])),
                          ),
                          const Spacer(),
                          if (isCritical) const Icon(Icons.flash_on, size: 14, color: Colors.red),
                          if (isCritical) const SizedBox(width: 4),
                          Text(item['createdAt'].toString().substring(0, 10), style: GoogleFonts.inter(fontSize: 10, color: Colors.grey)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(item['title'] ?? 'No Title', style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 15), maxLines: 1, overflow: TextOverflow.ellipsis),
                      const SizedBox(height: 4),
                      Text(item['location']?['address'] ?? 'Unknown Location', style: GoogleFonts.inter(fontSize: 12, color: Colors.grey[600]), maxLines: 1, overflow: TextOverflow.ellipsis),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          _buildStatusBadge(item['status']),
                          const Spacer(),
                          Flexible(
                            child: Text(userName, style: GoogleFonts.inter(fontSize: 11, color: Colors.grey[500]), overflow: TextOverflow.ellipsis),
                          ),
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

  Widget _buildStatusBadge(String? status) {
    Color color;
    switch (status?.toLowerCase()) {
      case 'pending': color = Colors.orange; break;
      case 'working': color = Colors.blue; break;
      case 'solved': color = Colors.green; break;
      case 'fake': color = Colors.red; break;
      default: color = Colors.grey;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
      child: Text((status ?? 'PENDING').toUpperCase(), style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.bold, color: color)),
    );
  }

  Widget _buildSkeletonLoader() {
    return Column(
      children: List.generate(6, (index) => 
        Shimmer.fromColors(
          baseColor: Colors.grey[300]!,
          highlightColor: Colors.grey[100]!,
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            height: 100,
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
          ),
        )
      ),
    );
  }
}
