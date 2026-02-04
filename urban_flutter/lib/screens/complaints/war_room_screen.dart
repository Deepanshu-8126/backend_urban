import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../../core/constants.dart';

class ComplaintsWarRoom extends StatefulWidget {
  const ComplaintsWarRoom({super.key});

  @override
  State<ComplaintsWarRoom> createState() => _ComplaintsWarRoomState();
}

class _ComplaintsWarRoomState extends State<ComplaintsWarRoom> {
  
  Future<http.Response> _fetchComplaints() {
    return http.get(Uri.parse(AppConstants.complaintsEndpoint));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Live Complaints Feed")),
      body: RefreshIndicator(
        onRefresh: () async => setState(() {}),
        child: FutureBuilder(
          future: _fetchComplaints(),
          builder: (context, AsyncSnapshot<http.Response> snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            }
            if (snapshot.hasError || snapshot.data?.statusCode != 200) {
              return const Center(
                child: Text("Server Error: Check if ${AppConstants.baseUrl} is live"),
              );
            }

            final List data = json.decode(snapshot.data!.body);

            if (data.isEmpty) {
              return const Center(child: Text("No active complaints in the city."));
            }

            return ListView.builder(
              itemCount: data.length,
              itemBuilder: (context, i) => Card(
                margin: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: _getStatusColor(data[i]['status']),
                    child: const Icon(Icons.priority_high, color: Colors.white),
                  ),
                  title: Text(data[i]['title'] ?? "Complaint Title"),
                  subtitle: Text("${data[i]['location'] ?? 'Ward'} • ${data[i]['status'] ?? 'Pending'}"),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 14),
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  Color _getStatusColor(String? status) {
    if (status == "Resolved") return Colors.green;
    if (status == "In Progress") return Colors.orange;
    return Colors.red;
  }
}