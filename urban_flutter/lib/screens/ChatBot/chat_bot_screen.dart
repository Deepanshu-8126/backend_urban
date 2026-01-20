import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../../../core/constants.dart';

class CityBrainBot extends StatefulWidget {
  const CityBrainBot({super.key});
  @override
  State<CityBrainBot> createState() => _CityBrainBotState();
}

class _CityBrainBotState extends State<CityBrainBot> {
  final TextEditingController _ctrl = TextEditingController();
  final List<Map<String, String>> messages = [];
  bool isTyping = false;

  Future<void> askAI() async {
    if (_ctrl.text.isEmpty) return;

    String query = _ctrl.text;
    setState(() {
      messages.add({"sender": "user", "text": query});
      isTyping = true;
    });
    _ctrl.clear();

    try {
      final res = await http.post(
        Uri.parse(AppConstants.aiEndpoint),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({"question": query}), // Dost ki API check karein (query ya question)
      );

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        setState(() {
          messages.add({"sender": "bot", "text": data['answer'] ?? "I'm not sure about that."});
        });
      } else {
        throw Exception("Server Error");
      }
    } catch (e) {
      setState(() {
        messages.add({"sender": "bot", "text": "Sorry, I'm having trouble connecting to the CityBrain server."});
      });
    } finally {
      setState(() => isTyping = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("CityBrain AI Assistant")),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(10),
              itemCount: messages.length,
              itemBuilder: (ctx, i) {
                bool isUser = messages[i]['sender'] == "user";
                return Align(
                  alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.symmetric(vertical: 5),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: isUser ? Colors.blue : Colors.grey[300],
                      borderRadius: BorderRadius.circular(15),
                    ),
                    child: Text(
                      messages[i]['text']!,
                      style: TextStyle(color: isUser ? Colors.white : Colors.black),
                    ),
                  ),
                );
              },
            ),
          ),
          if (isTyping) const Padding(padding: EdgeInsets.all(8.0), child: LinearProgressIndicator()),
          _buildInputArea(),
        ],
      ),
    );
  }

  Widget _buildInputArea() {
    return Padding(
      padding: const EdgeInsets.all(10.0),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _ctrl,
              decoration: InputDecoration(
                hintText: "Ask about city issues...",
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(30)),
                contentPadding: const EdgeInsets.symmetric(horizontal: 20),
              ),
            ),
          ),
          const SizedBox(width: 8),
          CircleAvatar(
            backgroundColor: Colors.blue,
            child: IconButton(
              icon: const Icon(Icons.send, color: Colors.white),
              onPressed: askAI,
            ),
          ),
        ],
      ),
    );
  }
}