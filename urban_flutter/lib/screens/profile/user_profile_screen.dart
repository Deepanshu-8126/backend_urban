import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart'; 
import '../../core/api_service.dart';
import '../../core/app_provider.dart'; 
import '../auth/login_screen.dart';
import 'dart:io'; 

class UserProfileScreen extends StatefulWidget {
  const UserProfileScreen({super.key});

  @override
  State<UserProfileScreen> createState() => _UserProfileScreenState();
}

class _UserProfileScreenState extends State<UserProfileScreen> {
  Map<String, dynamic>? user;
  bool isLoading = true;
  bool isUpdating = false;
  final TextEditingController nameController = TextEditingController();
  File? _localImage; 

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    final profile = await ApiService.getProfile();
    if (mounted) {
      setState(() {
        user = profile;
        if (user != null) {
          nameController.text = user!['name'] ?? '';
        }
        isLoading = false;
      });
    }
  }

  Future<void> _updateProfile(XFile? image) async {
    if (image != null) {
      setState(() {
        _localImage = File(image.path); 
      });
    }

    setState(() => isUpdating = true);
    
    
    final success = await Provider.of<AppProvider>(context, listen: false)
        .updateUserProfile(nameController.text, image);

    if (success) {
      await _loadProfile();
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Profile Updated!")));
    } else {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Update Failed")));
    }
    setState(() => isUpdating = false);
  }

  Future<void> _pickImage() async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: ImageSource.gallery);
    if (image != null) {
      _updateProfile(image);
    }
  }

  void _logout() async {
    await Provider.of<AppProvider>(context, listen: false).logout(); 
    if (mounted) {
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (c) => const LoginScreen()),
        (route) => false,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("My Profile")),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : user == null
              ? const Center(child: Text("Failed to load profile"))
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    children: [
                      Center(
                        child: Stack(
                          children: [
                            CircleAvatar(
                              radius: 60,
                              
                              backgroundImage: _localImage != null
                                  ? FileImage(_localImage!) as ImageProvider
                                  : (user!['profilePicture'] != null && user!['profilePicture'] != ''
                                      ? NetworkImage('${ApiService.baseUrl.replaceAll('/api/v1', '')}${user!['profilePicture']}?t=${DateTime.now().millisecondsSinceEpoch}')
                                      : null),
                              child: (_localImage == null && (user!['profilePicture'] == null || user!['profilePicture'] == ''))
                                  ? const Icon(Icons.person, size: 60)
                                  : null,
                            ),
                            Positioned(
                              bottom: 0,
                              right: 0,
                              child: CircleAvatar(
                                backgroundColor: Colors.blue,
                                radius: 20,
                                child: IconButton(
                                  icon: const Icon(Icons.camera_alt, color: Colors.white, size: 20),
                                  onPressed: _pickImage,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 30),
                      TextField(
                        controller: nameController,
                        decoration: const InputDecoration(
                          labelText: "Full Name",
                          border: OutlineInputBorder(),
                          prefixIcon: Icon(Icons.person),
                        ),
                      ),
                      const SizedBox(height: 20),
                      TextField(
                        readOnly: true,
                        controller: TextEditingController(text: user!['email']),
                        decoration: const InputDecoration(
                          labelText: "Email",
                          border: OutlineInputBorder(),
                          prefixIcon: Icon(Icons.email),
                          filled: true,
                          fillColor: Colors.black12
                        ),
                      ),
                      const SizedBox(height: 30),
                      if (isUpdating) const CircularProgressIndicator(),
                      if (!isUpdating)
                        ElevatedButton(
                          onPressed: () => _updateProfile(null),
                          style: ElevatedButton.styleFrom(
                            minimumSize: const Size(double.infinity, 50),
                            backgroundColor: Colors.blue,
                            foregroundColor: Colors.white
                          ),
                          child: const Text("Save Changes"),
                        ),
                      const SizedBox(height: 20),
                      OutlinedButton.icon(
                        onPressed: _logout,
                        icon: const Icon(Icons.logout, color: Colors.red),
                        label: const Text("Logout", style: TextStyle(color: Colors.red)),
                        style: OutlinedButton.styleFrom(
                          minimumSize: const Size(double.infinity, 50),
                          side: const BorderSide(color: Colors.red),
                        ),
                      ),
                    ],
                  ),
                ),
    );
  }
}
