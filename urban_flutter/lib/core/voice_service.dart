// import 'package:flutter/material.dart';
// import 'package:record/record.dart'; // pubspec.yaml mein 'record' package hona chahiye
// import 'package:path_provider/path_provider.dart';
// import 'dart:io';
//
// class VoiceService extends ChangeNotifier {
//   final AudioRecorder _audioRecorder = AudioRecorder();
//   bool _isRecording = false;
//   String? _latestPath;
//
//   bool get isRecording => _isRecording;
//   String? get latestPath => _latestPath;
//
//   // 🎙️ Recording Shuru Karne ka Function
//   Future<void> startRecording() async {
//     try {
//       if (await _audioRecorder.hasPermission()) {
//         final directory = await getApplicationDocumentsDirectory();
//         String filePath = '${directory.path}/complaint_${DateTime.now().millisecondsSinceEpoch}.m4a';
//
//         const config = RecordConfig(); // Default quality settings
//
//         await _audioRecorder.start(config, path: filePath);
//         _isRecording = true;
//         notifyListeners(); // UI ko update karne ke liye (Red Mic dikhane ke liye)
//       }
//     } catch (e) {
//       debugPrint("Error starting record: $e");
//     }
//   }
//
//   // ⏹️ Recording Stop Karne ka Function
//   Future<String?> stopRecording() async {
//     try {
//       final path = await _audioRecorder.stop();
//       _isRecording = false;
//       _latestPath = path;
//       notifyListeners();
//       return path; // Ye path hum backend par bhejenge
//     } catch (e) {
//       debugPrint("Error stopping record: $e");
//       return null;
//     }
//   }
//
//   @override
//   void dispose() {
//     _audioRecorder.dispose();
//     super.dispose();
//   }
// }