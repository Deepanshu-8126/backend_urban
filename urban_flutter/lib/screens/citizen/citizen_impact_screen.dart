import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:animate_do/animate_do.dart';
import '../../core/api_service.dart';

class CitizenImpactScreen extends StatefulWidget {
  const CitizenImpactScreen({super.key});

  @override
  State<CitizenImpactScreen> createState() => _CitizenImpactScreenState();
}

class _CitizenImpactScreenState extends State<CitizenImpactScreen> {
  Map<String, dynamic>? data;
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchImpactData();
  }

  Future<void> _fetchImpactData() async {
    try {
      final response = await http.get(Uri.parse('${ApiService.baseUrl}/citizen-impact'));
      if (response.statusCode == 200) {
        setState(() {
          data = jsonDecode(response.body)['data'];
          isLoading = false;
        });
      }
    } catch (e) {
      debugPrint("Impact Data Error: $e");
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) return const Scaffold(body: Center(child: CircularProgressIndicator()));

    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F7), // Apple-like grey
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 280,
            floating: false,
            pinned: true,
            backgroundColor: Colors.deepPurple,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Colors.deepPurple.shade800, Colors.deepPurple.shade400],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight
                  )
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const SizedBox(height: 40),
                    Stack(
                      alignment: Alignment.center,
                      children: [
                        SizedBox(
                          height: 120,
                          width: 120,
                          child: CircularProgressIndicator(
                            value: (data!['xp'] % 1000) / 1000, 
                            color: Colors.amberAccent,
                            backgroundColor: Colors.white24,
                            strokeWidth: 8,
                          ),
                        ),
                        Column(
                          children: [
                            Text("LEVEL", style: TextStyle(color: Colors.white70, fontSize: 12, letterSpacing: 2)),
                            Text("${data!['level']}", style: const TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.bold)),
                          ],
                        )
                      ],
                    ),
                    const SizedBox(height: 20),
                    Text("Total Impact XP: ${data!['xp']}", style: const TextStyle(color: Colors.white, fontSize: 16)),
                    const SizedBox(height: 5),
                    Text("Next Level in ${data!['nextLevelXp'] - data!['xp']} XP", style: const TextStyle(color: Colors.white70, fontSize: 12)),
                  ],
                ),
              ),
            ),
            title: const Text("My Civic Impact"),
          ),

          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  FadeInLeft(child: const Text("Earned Badges", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold))),
                  const SizedBox(height: 15),
                  SizedBox(
                    height: 100,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      itemCount: (data!['badges'] as List).length,
                      itemBuilder: (context, index) {
                        final badge = data!['badges'][index];
                        return Container(
                          width: 100,
                          margin: const EdgeInsets.only(right: 15),
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 4)]
                          ),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(badge['icon'], style: const TextStyle(fontSize: 32)),
                              const SizedBox(height: 8),
                              Text(badge['name'], textAlign: TextAlign.center, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold), maxLines: 2)
                            ],
                          ),
                        );
                      },
                    ),
                  ),

                  const SizedBox(height: 30),
                  FadeInLeft(delay: const Duration(milliseconds: 200), child: const Text("Ward Leaderboard", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold))),
                  const SizedBox(height: 15),
                  
                  ...((data!['leaderboard'] as List).map((user) {
                    bool isMe = user['name'] == 'Demo User';
                    return Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      padding: const EdgeInsets.all(15),
                      decoration: BoxDecoration(
                        color: isMe ? Colors.deepPurple.shade50 : Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: isMe ? Border.all(color: Colors.deepPurple.shade200) : null,
                        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 5)]
                      ),
                      child: Row(
                        children: [
                          Text("#${user['rank']}", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.grey[600])),
                          const SizedBox(width: 15),
                          CircleAvatar(
                            backgroundColor: Colors.primaries[user['name'].length % Colors.primaries.length].shade100,
                            child: Text(user['avatar'], style: const TextStyle(fontWeight: FontWeight.bold)),
                          ),
                          const SizedBox(width: 15),
                          Expanded(child: Text(user['name'], style: TextStyle(fontWeight: isMe ? FontWeight.bold : FontWeight.normal))),
                          Text("${user['points']} XP", style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.deepPurple))
                        ],
                      ),
                    );
                  }).toList())
                ],
              ),
            ),
          )
        ],
      ),
    );
  }
}
