// lib/screens/complaints/citizen_form.dart
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:geolocator/geolocator.dart';

class CitizenForm extends StatefulWidget {
  const CitizenForm({super.key});
  @override
  State<CitizenForm> createState() => _CitizenFormState();
}

class _CitizenFormState extends State<CitizenForm> {
  final nameCont = TextEditingController();
  XFile? photo;
  Position? currentPos;

  // Logic: Camera Trigger
  Future<void> _takePhoto() async {
    final res = await ImagePicker().pickImage(source: ImageSource.camera);
    if (res != null) setState(() => photo = res);
  }

  // Logic: Mandatory GPS Access
  Future<void> _getLocation() async {
    LocationPermission permission = await Geolocator.requestPermission();
    if (permission == LocationPermission.always || permission == LocationPermission.whileInUse) {
      Position pos = await Geolocator.getCurrentPosition();
      setState(() => currentPos = pos);
    }
  }

  void _submit() {
    // Bina data ke submit block kiya gaya hai
    if (nameCont.text.isEmpty || photo == null || currentPos == null) {
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Naam, Photo aur Location teeno zaroori hain!"), backgroundColor: Colors.red)
      );
    } else {
      // Yahan data backend pe jayega jo Admin ko dikhega
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Complaint Sent to Admin! ✅"), backgroundColor: Colors.green));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Citizen Portal")),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(children: [
          TextField(controller: nameCont, decoration: const InputDecoration(labelText: "Aapka Naam")),
          const SizedBox(height: 20),
          Row(mainAxisAlignment: MainAxisAlignment.spaceEvenly, children: [
            IconButton(icon: Icon(Icons.camera_alt, color: photo != null ? Colors.green : Colors.grey), onPressed: _takePhoto),
            IconButton(icon: Icon(Icons.location_on, color: currentPos != null ? Colors.green : Colors.grey), onPressed: _getLocation),
          ]),
          const Spacer(),
          ElevatedButton(onPressed: _submit, child: const Text("SUBMIT COMPLAINT")),
        ]),
      ),
    );
  }
}