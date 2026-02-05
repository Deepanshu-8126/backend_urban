import 'dart:io'; 
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../../core/api_service.dart';

class CitizenForm extends StatefulWidget {
  final String? initialTitle;
  final String? initialDescription;
  final String? initialCategory;

  const CitizenForm({
    super.key, 
    this.initialTitle, 
    this.initialDescription, 
    this.initialCategory
  });

  @override
  State<CitizenForm> createState() => _CitizenFormState();
}

class _CitizenFormState extends State<CitizenForm> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _titleController;
  late TextEditingController _descController;
  
  
  String _selectedCategory = 'Roads';
  String? _subType;

  

  @override
  void initState() {
    super.initState();
    _titleController = TextEditingController(text: widget.initialTitle ?? '');
    _descController = TextEditingController(text: widget.initialDescription ?? '');
    
    
    _titleController.addListener(_onTitleChanged);
    
    if (widget.initialCategory != null && _categories.contains(widget.initialCategory)) {
      _selectedCategory = widget.initialCategory!;
    }
    _getLocation();
  }

  void _onTitleChanged() {
    final title = _titleController.text.toLowerCase();
    
    
    for (var entry in _categoryKeywords.entries) {
      String category = entry.key;
      List<String> keywords = entry.value;
      
      for (var word in keywords) {
        if (title.contains(word.toLowerCase())) {
          
          if (_selectedCategory != category) {
            setState(() {
              _selectedCategory = category;
            });
          }
          return; 
        }
      }
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    super.dispose();
  }

  
  Position? _currentPosition;
  String? _currentAddress;
  bool _isLocating = false;
  final MapController _mapController = MapController();
  bool _mapReady = false; 

  
  final List<XFile> _selectedImages = [];
  XFile? _selectedVideo;
  XFile? _selectedAudio;
  bool _isRecording = false;

  final List<String> _categories = [
    'Roads', 'Garbage', 'Water', 'Electricity', 'Traffic', 'Crime', 'Street Light', 'Sewerage', 'Other'
  ];

  
  final Map<String, List<String>> _categoryKeywords = {
    'Roads': ['road', 'pothole', 'asphalt', 'traffic', 'street', 'pavement'],
    'Water': ['water', 'leak', 'pipe', 'supply', 'drain', 'sewage', 'tank'],
    'Electricity': ['electricity', 'light', 'pole', 'wire', 'power', 'blackout', 'current', 'voltage'],
    'Garbage': ['garbage', 'trash', 'waste', 'dustbin', 'smell', 'dump', 'cleaning'],
    'Traffic': ['traffic', 'jam', 'signal', 'congestion'],
    'Crime': ['crime', 'theft', 'fight', 'harassment', 'robbery'],
    'Street Light': ['light', 'dark', 'lamp', 'bulb'],
    'Sewerage': ['sewer', 'overflow', 'drainage', 'gutter'],
  };

  Future<void> _getLocation() async {
    setState(() => _isLocating = true);
    
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        throw 'Location services are disabled. Please enable location in your browser.';
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          throw 'Location permissions denied. Please allow location access in your browser settings.';
        }
      }

      if (permission == LocationPermission.deniedForever) {
        throw 'Location permissions are permanently denied. Please enable them in browser settings.';
      }

      Position? position;

      try {
        position = await Geolocator.getLastKnownPosition();
      } catch (e) {
        position = null;
      }

      if (position == null) {
        position = await Geolocator.getCurrentPosition(
            desiredAccuracy: LocationAccuracy.high,
            timeLimit: const Duration(seconds: 30)
        );
      }

      List<Placemark> placemarks = await placemarkFromCoordinates(position.latitude, position.longitude);
      String address = "Unknown Location";
      if (placemarks.isNotEmpty) {
        Placemark place = placemarks[0];
        address = [place.street, place.subLocality, place.locality, place.postalCode]
            .where((e) => e != null && e.isNotEmpty)
            .join(', ');
      }

      if (mounted) {
        setState(() {
          _currentPosition = position;
          _currentAddress = address;
          _isLocating = false;
        });


        if (_mapReady) {
          _mapController.move(LatLng(position.latitude, position.longitude), 15);
        }
      }
    } on PlatformException catch (e) {
      if (mounted) {
        setState(() => _isLocating = false);

        _showManualLocationDialog();
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLocating = false);

        if (errorMsg.contains('timeout') || errorMsg.contains('time')) {
          errorMsg = 'Location request timed out. Please check your GPS and try again.';
        }
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(errorMsg),
            duration: const Duration(seconds: 5),
            action: SnackBarAction(
              label: "Retry",
              onPressed: _getLocation
            ),
          )
        );
      }
    }
  }

  // Removed default location fallback as requested

  // Removed manual location dialog as requested

  Future<void> _pickImages() async {
    final ImagePicker picker = ImagePicker();
    // Direct Camera Access (No Gallery Option)
    try {
      final XFile? image = await picker.pickImage(
        source: ImageSource.camera,
        imageQuality: 50, // Optimize for faster upload
      );
      if (image != null) {
        setState(() => _selectedImages.add(image));
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Could not access camera")),
      );
    }
  }

  Future<void> _pickVideo() async {
    final ImagePicker picker = ImagePicker();
    final XFile? video = await picker.pickVideo(source: ImageSource.camera);
    if (video != null) setState(() => _selectedVideo = video);
  }

  void _recordVoice() {
    setState(() => _isRecording = !_isRecording);
    if (!_isRecording) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Voice Note Recorded (Simulated)")));
    }
  }

  
  void _showCategoryPicker() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (context) {
        return DraggableScrollableSheet(
          initialChildSize: 0.5,
          minChildSize: 0.3,
          maxChildSize: 0.9,
          expand: false,
          builder: (_, controller) {
            return Column(
              children: [
                 Container(
                   margin: const EdgeInsets.symmetric(vertical: 10),
                   width: 40, height: 5,
                   decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(10)),
                 ),
                 const Padding(
                   padding: EdgeInsets.all(16),
                   child: Text("Select Category", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                 ),
                 Expanded(
                   child: ListView.builder(
                     controller: controller,
                     itemCount: _categories.length,
                     itemBuilder: (ctx, i) => ListTile(
                       title: Text(_categories[i], style: const TextStyle(fontSize: 16)),
                       leading: CircleAvatar(
                         backgroundColor: Colors.indigo.withOpacity(0.1),
                         child: const Icon(Icons.category, color: Colors.indigo, size: 20),
                       ),
                       onTap: () {
                         setState(() {
                           _selectedCategory = _categories[i];
                           _subType = null;
                         });
                         Navigator.pop(context);
                       },
                     ),
                   ),
                 ),
              ],
            );
          },
        );
      },
    );
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_currentPosition == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Location is required and must be real. Please enable GPS and allow permissions."),
          backgroundColor: Colors.red,
        )
      );
      _getLocation();
      return;
    }

    
    bool proceed = await _validateCategory();
    if (!proceed) return;

    showDialog(context: context, barrierDismissible: false, builder: (c) => const Center(child: CircularProgressIndicator()));

    final error = await ApiService.createComplaint(
      title: _titleController.text,
      description: _descController.text,
      lat: _currentPosition!.latitude,
      lng: _currentPosition!.longitude,
      address: _currentAddress,
      imageFiles: _selectedImages,
      videoFile: _selectedVideo,
      audioFile: _selectedAudio,
      category: _selectedCategory,
      subType: _subType,
    );

    if (!mounted) return;
    Navigator.pop(context);

    if (error == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Complaint Submitted Successfully!")));
      Navigator.pop(context);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error)));
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.grey[50],
      appBar: AppBar(
        title: const Text("File New Complaint"),
        backgroundColor: isDark ? Colors.grey[900] : Colors.white,
        foregroundColor: isDark ? Colors.white : Colors.black,
        elevation: 0,
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            
            _buildSectionHeader("Title"),
            TextFormField(
              controller: _titleController,
              decoration: InputDecoration(
                hintText: "e.g., Pothole on Main St",
                hintStyle: TextStyle(color: isDark ? Colors.grey[400] : Colors.grey[600]),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                filled: true, 
                fillColor: isDark ? Colors.grey[900] : Colors.white
              ),
              style: TextStyle(color: isDark ? Colors.white : Colors.black),
              validator: (v) => v!.isEmpty ? "Required" : null,
            ),
            const SizedBox(height: 20),

            
            _buildSectionHeader("Description"),
            TextFormField(
              controller: _descController,
              maxLines: 5,
              decoration: InputDecoration(
                hintText: "Describe the issue in detail...",
                hintStyle: TextStyle(color: isDark ? Colors.grey[400] : Colors.grey[600]),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                filled: true,
                fillColor: isDark ? Colors.grey[900] : Colors.white,
              ),
              style: TextStyle(color: isDark ? Colors.white : Colors.black),
              validator: (v) => v!.isEmpty ? "Required" : null,
            ),
            const SizedBox(height: 20),

            
            _buildSectionHeader("Category"),
            InkWell(
              onTap: _showCategoryPicker,
              borderRadius: BorderRadius.circular(12),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                decoration: BoxDecoration(
                  color: isDark ? Colors.grey[900] : Colors.white,
                  border: Border.all(color: Colors.grey),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.category, color: Colors.grey),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        _selectedCategory,
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500, color: isDark ? Colors.white : Colors.black),
                      ),
                    ),
                    const Icon(Icons.arrow_drop_down),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            
            _buildSectionHeader("Location"),
            Card(
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade300)),
              child: Column(
                children: [
                  SizedBox(
                    height: 200,
                    child: ClipRRect(
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                      child: Stack(
                        children: [
                          if (_currentPosition != null && !_isLocating)
                            FlutterMap(
                              mapController: _mapController,
                              options: MapOptions(
                                initialCenter: LatLng(_currentPosition!.latitude, _currentPosition!.longitude),
                                initialZoom: 15.0,
                                interactionOptions: const InteractionOptions(flags: InteractiveFlag.none),
                                onMapReady: () { 
                                  _mapReady = true;
                                },
                              ),
                              children: [
                                TileLayer(
                                  urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                                  userAgentPackageName: 'com.example.urban_flutter',
                                ),
                                MarkerLayer(
                                  markers: [
                                    Marker(
                                      point: LatLng(_currentPosition!.latitude, _currentPosition!.longitude),
                                      width: 40,
                                      height: 40,
                                      child: const Icon(Icons.location_on, color: Colors.red, size: 40),
                                    ),
                                  ],
                                ),
                              ],
                            )
                          else
                            Container(
                              color: Colors.grey[200], 
                              child: Center(
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    if (_isLocating) const CircularProgressIndicator() else const Icon(Icons.location_disabled, color: Colors.grey),
                                    const SizedBox(height: 8),
                                    Text(_isLocating ? "Fetching location..." : "Waiting for location..."),
                                  ],
                                ),
                              )
                            ),
                            
                          Positioned(
                            bottom: 10,
                            right: 10,
                            child: FloatingActionButton.small(
                              heroTag: "refresh_loc",
                              onPressed: _getLocation,
                              child: const Icon(Icons.my_location),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  ListTile(
                    leading: const Icon(Icons.place, color: Colors.blue),
                    title: Text(_currentAddress ?? "Fetching...", style: const TextStyle(fontSize: 13)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            
            _buildSectionHeader("Evidence"),
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: [
                ActionChip(
                  avatar: const Icon(Icons.camera_alt),
                  label: const Text("Photo"),
                  onPressed: _pickImages,
                ),
                ActionChip(
                  avatar: const Icon(Icons.videocam),
                  label: const Text("Video"),
                  onPressed: _pickVideo,
                ),
                ActionChip(
                  avatar: Icon(_isRecording ? Icons.stop : Icons.mic, color: _isRecording ? Colors.red : null),
                  label: Text(_isRecording ? "Stop" : "Voice"),
                  onPressed: _recordVoice,
                  backgroundColor: _isRecording ? Colors.red.withOpacity(0.1) : null,
                ),
              ],
            ),
            const SizedBox(height: 12),
            if (_selectedImages.isNotEmpty)
              SizedBox(
                height: 100,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  itemCount: _selectedImages.length,
                  itemBuilder: (ctx, i) => Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: Stack(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: Image.file(File(_selectedImages[i].path), width: 100, height: 100, fit: BoxFit.cover),
                        ),
                        Positioned(
                          top: 0, right: 0,
                          child: InkWell(
                            onTap: () => setState(() => _selectedImages.removeAt(i)),
                            child: const CircleAvatar(radius: 10, backgroundColor: Colors.black54, child: Icon(Icons.close, size: 12, color: Colors.white)),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),

            const SizedBox(height: 30),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.indigo, 
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text("SUBMIT REPORT", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.blueAccent)),
    );
  }

  
  Future<bool> _validateCategory() async {
    final desc = _descController.text.toLowerCase();
    
    String? potentialCategory;
    
    
    _categoryKeywords.forEach((category, keywords) {
      if (category == _selectedCategory) return; 

      for (var word in keywords) {
        if (desc.contains(word.toLowerCase())) {
          potentialCategory = category;
          break; 
        }
      }
    });

    if (potentialCategory != null) {
      
      return await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
          title: const Row(children: [Icon(Icons.warning, color: Colors.orange), SizedBox(width: 8), Text("Category Mismatch?")]),
          content: Text.rich(
            TextSpan(
              children: [
                const TextSpan(text: "You selected "),
                TextSpan(text: _selectedCategory, style: const TextStyle(fontWeight: FontWeight.bold)),
                const TextSpan(text: ", but your description mentions keywords related to "),
                TextSpan(text: potentialCategory, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.blue)),
                const TextSpan(text: ".\n\nDo you want to change the category to ensure faster resolution?"),
              ]
            )
          ),
          actions: [
            TextButton(
              onPressed: () {
                
                Navigator.pop(context, true); 
              },
              child: const Text("Submit Anyway", style: TextStyle(color: Colors.grey)),
            ),
            ElevatedButton(
              onPressed: () {
                
                setState(() => _selectedCategory = potentialCategory!);
                Navigator.pop(context, false); 
              },
              style: ElevatedButton.styleFrom(backgroundColor: Colors.indigo),
              child: Text("Switch to $potentialCategory"),
            ),
          ],
        ),
      ) ?? false;
    }

    return true; 
  }
}
