import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:video_player/video_player.dart';
import 'package:chewie/chewie.dart';
import '../../core/api_service.dart';

class CitizenComplaintDetailScreen extends StatefulWidget {
  final Map<String, dynamic> complaint;

  const CitizenComplaintDetailScreen({super.key, required this.complaint});

  @override
  State<CitizenComplaintDetailScreen> createState() => _CitizenComplaintDetailScreenState();
}

class _CitizenComplaintDetailScreenState extends State<CitizenComplaintDetailScreen> {
  VideoPlayerController? _videoController;
  ChewieController? _chewieController;
  bool _isVideoInitialized = false;

  @override
  void initState() {
    super.initState();
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

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'solved': return Colors.green;
      case 'working': return Colors.orange;
      case 'deleted': return Colors.red;
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
    final adminMessage = item['adminMessage'];
    final adminResponseAt = item['adminResponseAt'];
    final status = item['status'] ?? 'Pending';

    
    List<String> images = [];
    if (item['images'] != null && (item['images'] as List).isNotEmpty) {
      images = List<String>.from(item['images']);
    } else if (item['imageUrl'] != null && item['imageUrl'].isNotEmpty) {
      images.add(item['imageUrl']);
    }

    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text("Complaint Details"),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.only(bottom: 50),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            
            if (images.isNotEmpty)
              SizedBox(
                height: 300,
                child: PageView.builder(
                  itemCount: images.length,
                  itemBuilder: (context, index) {
                    final imgUrl = '${ApiService.baseUrl.replaceAll('/api/v1', '')}${images[index]}';
                    return GestureDetector(
                      onTap: () => _viewImage(imgUrl),
                      child: Stack(
                        fit: StackFit.expand,
                        children: [
                          Image.network(imgUrl, fit: BoxFit.cover),
                          Positioned(
                            bottom: 10,
                            right: 10,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(color: Colors.black54, borderRadius: BorderRadius.circular(12)),
                              child: Text("${index + 1}/${images.length}", style: const TextStyle(color: Colors.white)),
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),

            
            if (_isVideoInitialized && _chewieController != null)
              Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text("Video Evidence", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 10),
                    AspectRatio(
                      aspectRatio: _videoController!.value.aspectRatio,
                      child: Chewie(controller: _chewieController!),
                    ),
                  ],
                ),
              ),

            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: _getStatusColor(status),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          status.toUpperCase(),
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                        ),
                      ),
                      const Spacer(),
                      Text(item['createdAt']?.substring(0, 10) ?? "Today", style: TextStyle(color: Colors.grey[600])),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    item['title'] ?? "No Title",
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    item['category'] ?? "General",
                    style: TextStyle(color: Colors.grey[600], fontWeight: FontWeight.w500),
                  ),

                  const SizedBox(height: 24),
                  
                  
                  if (adminMessage != null && adminMessage.isNotEmpty) ...[
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.blue[50],
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.blue[100]!),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.admin_panel_settings, color: Colors.blue),
                              const SizedBox(width: 8),
                              const Text("Admin Response", style: TextStyle(fontWeight: FontWeight.bold, color: Colors.blue)),
                              const Spacer(),
                              if (adminResponseAt != null)
                                Text(
                                  adminResponseAt.substring(0, 10),
                                  style: TextStyle(fontSize: 12, color: Colors.blue[700]),
                                ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            adminMessage,
                            style: const TextStyle(color: Colors.black87),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],

                  
                  const Text("Description", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Text(
                    item['description'] ?? "No description available.",
                    style: TextStyle(fontSize: 16, color: Colors.grey[700], height: 1.6),
                  ),
                  const SizedBox(height: 32),

                  
                  const Text("Location", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  InkWell(
                    onTap: () async {
                      final lat = item['location']?['coordinates']?[1] ?? item['location']?['lat'];
                      final lng = item['location']?['coordinates']?[0] ?? item['location']?['lng'];
                      if (lat != null && lng != null) {
                        final url = Uri.parse("https://www.google.com/maps/search/?api=1&query=$lat,$lng");
                        launchUrl(url, mode: LaunchMode.externalApplication);
                      }
                    },
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.grey[200]!),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.location_on, color: Colors.red),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              item['location']?['address'] ?? "Unknown Location",
                              style: const TextStyle(fontWeight: FontWeight.bold),
                            ),
                          ),
                          const Icon(Icons.open_in_new, size: 16, color: Colors.grey),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
