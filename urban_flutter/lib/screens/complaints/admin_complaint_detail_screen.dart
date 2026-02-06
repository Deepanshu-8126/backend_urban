import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:video_player/video_player.dart';
import 'package:chewie/chewie.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/api_service.dart';

class AdminComplaintDetailScreen extends StatefulWidget {
  final Map<String, dynamic> complaint;
  final VoidCallback? onStatusChanged;

  const AdminComplaintDetailScreen({super.key, required this.complaint, this.onStatusChanged});

  @override
  State<AdminComplaintDetailScreen> createState() => _AdminComplaintDetailScreenState();
}

class _AdminComplaintDetailScreenState extends State<AdminComplaintDetailScreen> {
  late String currentStatus;
  bool isUpdating = false;
  
  VideoPlayerController? _videoController;
  ChewieController? _chewieController;
  bool _isVideoInitialized = false;

  @override
  void initState() {
    super.initState();
    currentStatus = widget.complaint['status'] ?? 'pending';
    _initVideo();
  }

  void _initVideo() async {
    final videoUrl = widget.complaint['videoUrl'];
    if (videoUrl != null && videoUrl.isNotEmpty) {
      try {
        final fullUrl = '${ApiService.baseUrl.replaceAll('/api/v1', '')}$videoUrl';
        _videoController = VideoPlayerController.networkUrl(Uri.parse(fullUrl));
        await _videoController!.initialize();
        
        _chewieController = ChewieController(
          videoPlayerController: _videoController!,
          autoPlay: false,
          looping: false,
          aspectRatio: _videoController!.value.aspectRatio,
          errorBuilder: (context, errorMessage) {
            return Center(child: Text("Error: $errorMessage", style: const TextStyle(color: Colors.white)));
          },
        );

        if (mounted) setState(() => _isVideoInitialized = true);
      } catch (e) {
        debugPrint("Video Init Error: $e");
      }
    }
  }

  @override
  void dispose() {
    _videoController?.dispose();
    _chewieController?.dispose();
    super.dispose();
  }

  Future<void> _deleteComplaint() async {
    bool? confirm = await showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text("Confirm Delete"),
        content: const Text("Mark as Fake & Delete Permanently? This cannot be undone."),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text("Cancel")),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true), 
            child: const Text("DELETE", style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold))
          ),
        ],
      ),
    );

    if (confirm == true) {
      if (!mounted) return;
      setState(() => isUpdating = true);
      bool success = await ApiService.deleteComplaint(widget.complaint['_id']);
      if (!mounted) return;
      setState(() => isUpdating = false);

      if (success) {
        widget.onStatusChanged?.call();
        Navigator.pop(context); 
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Complaint Deleted & Marked as Fake")));
      } else {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Failed to delete complaint")));
      }
    }
  }

  Future<void> _updateStatus(String newStatus) async {
    // Show dialog to get remark
    TextEditingController remarkController = TextEditingController();
    
    bool? confirm = await showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text("Mark as ${newStatus.toUpperCase()}?"),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text("Add a remark for the user (optional):"),
            const SizedBox(height: 10),
            TextField(
              controller: remarkController,
              decoration: const InputDecoration(
                hintText: "e.g., Technician assigned, Leak fixed...",
                border: OutlineInputBorder(),
              ),
              maxLines: 2,
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text("Cancel")),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true), 
            child: const Text("Update Status"),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    setState(() => isUpdating = true);
    
    // Pass the remark to the API service
    bool success = await ApiService.updateComplaintStatus(
      widget.complaint['_id'], 
      newStatus, 
      remark: remarkController.text.trim()
    );
    
    if (!mounted) return;
    setState(() => isUpdating = false);

    if (success) {
      if (mounted) {
        setState(() => currentStatus = newStatus);
        widget.onStatusChanged?.call();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Status updated to $newStatus")),
        );
      }
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Failed to update status")),
      );
    }
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'solved': return Colors.green;
      case 'working': return Colors.orange;
      case 'fake': return Colors.red;
      default: return Colors.blue;
    }
  }

  void _viewImage(String url) {
    Navigator.push(context, MaterialPageRoute(builder: (c) => Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(backgroundColor: Colors.black, iconTheme: const IconThemeData(color: Colors.white)),
      body: Center(child: InteractiveViewer(child: Image.network(url))),
    )));
  }

  @override
  Widget build(BuildContext context) {
    final item = widget.complaint;
    final user = item['user'] ?? {};
    final userName = user['name'] ?? item['userName'] ?? 'Unknown';
    final userEmail = user['email'] ?? item['userId'] ?? 'No Email';
    
    
    List<String> images = [];
    if (item['images'] != null && (item['images'] as List).isNotEmpty) {
      images = List<String>.from(item['images']);
    } else if (item['imageUrl'] != null && item['imageUrl'].isNotEmpty) {
      images.add(item['imageUrl']);
    }
    
    
    final headerImage = images.isNotEmpty ? '${ApiService.baseUrl.replaceAll('/api/v1', '')}${images.first}' : null;

    return PopScope(
      canPop: false,
      onPopInvoked: (didPop) {
        if (didPop) return;
        Navigator.pop(context, currentStatus != widget.complaint['status']);
      },
      child: Scaffold(
        backgroundColor: const Color(0xFFF8F9FA),
        extendBodyBehindAppBar: true, 
        body: CustomScrollView( 
          slivers: [
            _buildSliverAppBar(headerImage, item),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 100), 
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                     _buildStatusHeader(item),
                     const SizedBox(height: 24),
                     _buildSectionTitle("Description"),
                     const SizedBox(height: 8),
                     Text(
                       item['description'] ?? "No description provided.",
                       style: GoogleFonts.inter(fontSize: 16, color: Colors.blueGrey[800], height: 1.6),
                     ),
                     const SizedBox(height: 32),
                     _buildSectionTitle("Location & Map"),
                     const SizedBox(height: 12),
                     _buildLocationCard(item),
                     const SizedBox(height: 32),
                     if (_isVideoInitialized && _chewieController != null) ...[
                        _buildSectionTitle("Video Evidence"),
                        const SizedBox(height: 12),
                        _buildVideoPlayer(),
                        const SizedBox(height: 32),
                     ],
                     if (images.length > 1) ...[ 
                        _buildSectionTitle("Gallery"),
                        const SizedBox(height: 12),
                        _buildGallery(images),
                        const SizedBox(height: 32),
                     ],
                     _buildSectionTitle("Reported By"),
                     const SizedBox(height: 12),
                     _buildUserCard(userName, userEmail),
                  ],
                ),
              ),
            )
          ],
        ),
        bottomNavigationBar: _buildGlassActionDock(),
      ),
    );
  }

  Widget _buildSliverAppBar(String? imageUrl, dynamic item) {
    return SliverAppBar(
      expandedHeight: 300,
      pinned: true,
      stretch: true,
      backgroundColor: const Color(0xFF1E293B),
      elevation: 0,
       iconTheme: const IconThemeData(color: Colors.white), 
      
      leading: Container(
        margin: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: Colors.black.withOpacity(0.3),
          shape: BoxShape.circle,
        ),
        child: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context), // ✅ Simple pop, relying on callback
        ),
      ),
      flexibleSpace: FlexibleSpaceBar(
        background: Stack(
          fit: StackFit.expand,
          children: [
            if (imageUrl != null)
              CachedNetworkImage(
                imageUrl: imageUrl, 
                fit: BoxFit.cover,
                placeholder: (c, u) => Container(color: Colors.grey[800]),
              )
            else
              Container(color: Colors.blueGrey[900], child: const Icon(Icons.broken_image, size: 60, color: Colors.white38)),
            
            
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Colors.transparent, Colors.black.withOpacity(0.8)],
                ),
              ),
            ),

            Positioned(
              bottom: 20, left: 20, right: 20,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                   Container(
                     padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                     decoration: BoxDecoration(color: Colors.blueAccent, borderRadius: BorderRadius.circular(8)),
                     child: Text((item['category'] ?? 'GENERAL').toString().toUpperCase(), style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 10, color: Colors.white)),
                   ),
                   const SizedBox(height: 8),
                   Text(
                     item['title'] ?? 'No Title',
                     style: GoogleFonts.montserrat(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                     maxLines: 2, overflow: TextOverflow.ellipsis,
                   ),
                ],
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildStatusHeader(dynamic item) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(color: _getStatusColor(currentStatus), borderRadius: BorderRadius.circular(20)),
          child: Row(
            children: [
              const Icon(Icons.info_outline, color: Colors.white, size: 16),
              const SizedBox(width: 6),
              Text(currentStatus.toUpperCase(), style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
            ],
          ),
        ),
        const Spacer(),
        Icon(Icons.calendar_today, size: 14, color: Colors.grey[500]),
        const SizedBox(width: 6),
        Text(item['createdAt']?.substring(0, 10) ?? 'Today', style: GoogleFonts.inter(color: Colors.grey[600], fontSize: 13)),
      ],
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(title.toUpperCase(), style: GoogleFonts.montserrat(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey[500], letterSpacing: 1.1));
  }

  Widget _buildLocationCard(dynamic item) {
    return InkWell(
      onTap: () async {
        final lat = item['location']?['coordinates']?[1] ?? item['location']?['lat'];
        final lng = item['location']?['coordinates']?[0] ?? item['location']?['lng'];
        if (lat != null && lng != null) {
          final url = Uri.parse("https://www.google.com/maps/search/?api=1&query=$lat,$lng");
          launchUrl(url, mode: LaunchMode.externalApplication);
        }
      },
      child: Container(
        
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 5))],
          image: const DecorationImage(image: AssetImage('assets/images/map_placeholder.png'), fit: BoxFit.cover, opacity: 0.1), 
        ),
        child: IntrinsicHeight( 
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Container(
                width: 80, 
                
                decoration: const BoxDecoration(
                  color: Colors.blueAccent, 
                  borderRadius: BorderRadius.horizontal(left: Radius.circular(16))
                ),
                child: const Icon(Icons.map, color: Colors.white, size: 30),
              ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text("View on Google Maps", style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 15)),
                    const SizedBox(height: 4),
                    Text(item['location']?['address'] ?? "Unknown Location", style: GoogleFonts.inter(color: Colors.grey, fontSize: 13), maxLines: 1, overflow: TextOverflow.ellipsis),
                  ],
                ),
              ),
            ),
            const Padding(
              padding: EdgeInsets.only(right: 16),
              child: Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey),
            ),
          ],
        ),
      ),
     ),
    );
  }

  Widget _buildVideoPlayer() {
    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: AspectRatio(
        aspectRatio: _videoController!.value.aspectRatio,
        child: Chewie(controller: _chewieController!),
      ),
    );
  }

  Widget _buildGallery(List<String> images) {
    return SizedBox(
      height: 100,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: images.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (ctx, idx) {
          final url = '${ApiService.baseUrl.replaceAll('/api/v1', '')}${images[idx]}';
          return GestureDetector(
            onTap: () => _viewImage(url),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: CachedNetworkImage(imageUrl: url, width: 100, height: 100, fit: BoxFit.cover),
            ),
          );
        },
      ),
    );
  }

  Widget _buildUserCard(String name, String email) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: Colors.grey[100],
            radius: 24,
            child: Text(name[0], style: GoogleFonts.montserrat(fontWeight: FontWeight.bold, color: Colors.black87)),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 15), overflow: TextOverflow.ellipsis),
                Text(email, style: GoogleFonts.inter(color: Colors.grey, fontSize: 12), overflow: TextOverflow.ellipsis),
              ],
            ),
          ),
        ],
      ),
    );
  }

  
  Widget _buildGlassActionDock() {
    return Container(
       padding: const EdgeInsets.all(16),
       decoration: BoxDecoration(
         color: Colors.white.withOpacity(0.9),
         border: const Border(top: BorderSide(color: Colors.black12)),
         boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 15, offset: const Offset(0, -5))]
       ),
       child: SafeArea(
         child: Row(
           children: [
             Expanded(
               child: _buildActionButton(
                 "WORKING", Colors.orangeAccent, Icons.construction, 
                 () => _updateStatus("working")
               ),
             ),
             const SizedBox(width: 12),
             Expanded(
               child: _buildActionButton(
                 "SOLVED", Colors.green, Icons.check_circle, 
                 () => _updateStatus("solved")
               ),
             ),
             const SizedBox(width: 8),
             _buildActionButton(
               "FAKE", Colors.redAccent, Icons.delete_forever, 
               _deleteComplaint, isSmall: true
             ),
           ],
         ),
       ),
    );
  }

  Widget _buildActionButton(String label, Color color, IconData icon, VoidCallback onTap, {bool isSmall = false}) {
    return ElevatedButton(
      onPressed: onTap,
      style: ElevatedButton.styleFrom(
        backgroundColor: color,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(vertical: 16),
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
      child: isSmall 
        ? Icon(icon, color: Colors.white, size: 20)
        : Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 18, color: Colors.white),
              const SizedBox(width: 8),
              Text(label, style: GoogleFonts.montserrat(fontWeight: FontWeight.bold, fontSize: 13)),
            ],
          ),
    );
  }
}
