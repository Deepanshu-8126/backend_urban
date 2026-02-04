import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'dart:async';
import '../../core/api_service.dart';

class CitizenSOSScreen extends StatefulWidget {
  const CitizenSOSScreen({super.key});

  @override
  State<CitizenSOSScreen> createState() => _CitizenSOSScreenState();
}

class _CitizenSOSScreenState extends State<CitizenSOSScreen> with SingleTickerProviderStateMixin {
  bool isSOSActive = false;
  String? activeSOSId;
  String statusMessage = "Press & Hold for 3s to Trigger SOS";
  late AnimationController _controller;
  Timer? _timer;
  int _secondsPressed = 0;

  @override
  void initState() {
    super.initState();
    _checkSOSStatus();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 1),
      lowerBound: 0.8,
      upperBound: 1.0,
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _checkSOSStatus() async {
    final status = await ApiService.getSOSStatus();
    if (status['success'] == true && status['hasActiveSOS'] == true) {
      setState(() {
        isSOSActive = true;
        activeSOSId = status['sosId'];
        statusMessage = "SOS ACTIVE! Help is on the way.";
      });
      _startLocationUpdates();
    }
  }

  void _handleSOSPressDown() {
    if (isSOSActive) return;
    _secondsPressed = 0;
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        _secondsPressed++;
        statusMessage = "Hold for ${3 - _secondsPressed}s...";
      });
      if (_secondsPressed >= 3) {
        _triggerSOS();
        timer.cancel();
      }
    });
  }

  void _handleSOSPressUp() {
    if (isSOSActive) return;
    _timer?.cancel();
    if (_secondsPressed < 3) {
      setState(() {
        statusMessage = "Press & Hold for 3s to Trigger SOS";
        _secondsPressed = 0;
      });
    }
  }

  Future<void> _triggerSOS() async {
    try {
      setState(() {
        statusMessage = "Acquiring Location...";
      });

      Position position = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
      
      final result = await ApiService.triggerSOS(
        lat: position.latitude,
        lng: position.longitude,
        message: "Emergency! User needs help immediately.",
      );

      if (result['success'] == true) {
        setState(() {
          isSOSActive = true;
          activeSOSId = result['sosId'];
          statusMessage = "SOS SENT! Tracking Live Location...";
        });
        _startLocationUpdates();
      } else {
        _showError(result['error'] ?? "Failed to send SOS");
      }
    } catch (e) {
      _showError("Location Error: Please enable GPS");
    }
  }

  Future<void> _cancelSOS() async {
    if (activeSOSId == null) return;
    
    final success = await ApiService.cancelSOS(activeSOSId!);
    if (success) {
      setState(() {
        isSOSActive = false;
        activeSOSId = null;
        statusMessage = "SOS Cancelled";
      });
    }
  }

  void _startLocationUpdates() {
    
    Timer.periodic(const Duration(seconds: 15), (timer) async {
      if (!isSOSActive || activeSOSId == null) {
        timer.cancel();
        return;
      }
      try {
        
        Position position = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.high,
          timeLimit: const Duration(seconds: 10)
        );
        
        
        await ApiService.updateSOSLocation(
          activeSOSId!, 
          position.latitude, 
          position.longitude, 
          80 
        );
        
        
        if (mounted) {
          setState(() {
            statusMessage = "SOS ACTIVE! Location Updated ${DateTime.now().hour}:${DateTime.now().minute.toString().padLeft(2, '0')}";
          });
        }
      } catch (e) {
        debugPrint("Location update failed: $e");
      }
    });
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message), backgroundColor: Colors.red));
    setState(() {
      statusMessage = "Press & Hold for 3s to Trigger SOS";
    });
  }

  void _addEmergencyContact(BuildContext context) async {
    
    final profile = await ApiService.getProfile();
    final existingContacts = profile?['user']?['sosEmergencyContacts'] ?? [];

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("Emergency Contacts"),
        content: SizedBox(
          width: double.maxFinite,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (existingContacts.isNotEmpty) ...[
                const Text("Existing Contacts:", style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                ...existingContacts.map((contact) => ListTile(
                  leading: const Icon(Icons.person, color: Colors.blue),
                  title: Text(contact['name'] ?? 'Unknown'),
                  subtitle: Text('${contact['phone']} (${contact['relationship'] ?? 'N/A'})'),
                  dense: true,
                )).toList(),
                const Divider(),
              ],
              const SizedBox(height: 8),
              ElevatedButton.icon(
                onPressed: () {
                  Navigator.pop(context);
                  _showAddContactDialog(context);
                },
                icon: const Icon(Icons.add),
                label: const Text("Add New Contact"),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text("Close")),
        ],
      ),
    );
  }

  void _showAddContactDialog(BuildContext context) {
    TextEditingController nameController = TextEditingController();
    TextEditingController phoneController = TextEditingController();
    TextEditingController relationController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("Add Emergency Contact"),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: nameController, decoration: const InputDecoration(labelText: "Name")),
            TextField(controller: phoneController, decoration: const InputDecoration(labelText: "Phone"), keyboardType: TextInputType.phone),
            TextField(controller: relationController, decoration: const InputDecoration(labelText: "Relationship")),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text("Cancel")),
          ElevatedButton(
            onPressed: () async {
              if (nameController.text.isNotEmpty && phoneController.text.isNotEmpty) {
                 final success = await ApiService.addSOSContact(nameController.text, phoneController.text, relationController.text);
                 if (context.mounted) {
                   Navigator.pop(context);
                   ScaffoldMessenger.of(context).showSnackBar(
                     SnackBar(
                       content: Text(success ? "Contact Added Successfully!" : "Failed to add contact"),
                       backgroundColor: success ? Colors.green : Colors.red,
                     )
                   );
                 }
              }
            },
            child: const Text("Save"),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: isSOSActive ? const Color(0xFF1B0000) : Colors.grey.shade900,
      appBar: AppBar(
        title: const Text("Emergency SOS", style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1.2)),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: Stack(
        alignment: Alignment.center,
        children: [
          
          if (isSOSActive)
            Positioned.fill(
              child: Container(
                decoration: BoxDecoration(
                  gradient: RadialGradient(
                    colors: [Colors.red.withOpacity(0.4), Colors.transparent],
                    radius: 1.5,
                  )
                ),
              ),
            ),

          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (isSOSActive)
                ScaleTransition(
                  scale: _controller,
                  child: _buildSOSButton(true),
                )
              else
                GestureDetector(
                  onTapDown: (_) => _handleSOSPressDown(),
                  onTapUp: (_) => _handleSOSPressUp(),
                  child: _buildSOSButton(false),
                ),
              const SizedBox(height: 60),
              
              
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                decoration: BoxDecoration(
                  color: Colors.black45,
                  borderRadius: BorderRadius.circular(30),
                  border: Border.all(color: Colors.white24)
                ),
                child: Text(
                  statusMessage.toUpperCase(),
                  style: TextStyle(
                    color: isSOSActive ? Colors.redAccent : Colors.white, 
                    fontSize: 16, 
                    fontWeight: FontWeight.bold, 
                    letterSpacing: 1
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
              
              if (isSOSActive) ...[
                const SizedBox(height: 40),
                SlideTransition(
                  position: Tween<Offset>(begin: const Offset(0, 1), end: Offset.zero).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOut)),
                  child: ElevatedButton.icon(
                    onPressed: _cancelSOS,
                    icon: const Icon(Icons.shield_outlined),
                    label: const Text("I AM SAFE - CANCEL ALERT"),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: Colors.red[900],
                      padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 20),
                      elevation: 10,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(40))
                    ),
                  ),
                )
              ],
              
              if (!isSOSActive) ...[
                const SizedBox(height: 30),
                TextButton.icon(
                  onPressed: () => _addEmergencyContact(context),
                  icon: const Icon(Icons.add_circle_outline, color: Colors.white60),
                  label: const Text("Manage Emergency Contacts", style: TextStyle(color: Colors.white60)),
                  style: TextButton.styleFrom(foregroundColor: Colors.white)
                )
              ]
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSOSButton(bool active) {
    return Container(
      width: 240,
      height: 240,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: active 
             ? [Colors.redAccent, Colors.red.shade900]
             : [Colors.red, Colors.red.shade800],
        ),
        boxShadow: [
          BoxShadow(
             color: active ? Colors.redAccent.withOpacity(0.6) : Colors.red.withOpacity(0.3), 
             blurRadius: active ? 60 : 30, 
             spreadRadius: active ? 20 : 5
          ),
          const BoxShadow(color: Colors.black26, blurRadius: 10, offset: Offset(5, 5))
        ],
        border: Border.all(color: Colors.white.withOpacity(0.2), width: 8),
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          
          Container(
             margin: const EdgeInsets.all(20),
             decoration: BoxDecoration(
               shape: BoxShape.circle,
               border: Border.all(color: Colors.white.withOpacity(0.1), width: 2)
             ),
          ),
          
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(active ? Icons.warning_amber_rounded : Icons.fingerprint, size: 50, color: Colors.white.withOpacity(0.8)),
              const SizedBox(height: 8),
              Text(
                active ? "HELP" : "SOS",
                style: const TextStyle(
                   color: Colors.white, 
                   fontSize: 42, 
                   fontWeight: FontWeight.w900, 
                   letterSpacing: 2,
                   shadows: [Shadow(color: Colors.black26, blurRadius: 10, offset: Offset(2, 2))]
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
