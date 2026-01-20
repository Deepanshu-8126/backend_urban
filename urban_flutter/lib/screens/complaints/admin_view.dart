import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class AdminViewScreen extends StatefulWidget {
  @override
  _AdminViewScreenState createState() => _AdminViewScreenState();
}

class _AdminViewScreenState extends State<AdminViewScreen> {
  // 🔥 Apna Laptop IP daal yahan
  static const String baseUrl = 'http://192.168.1.5:3000/api/v1'; 
  List<dynamic> complaints = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    fetchComplaints();
  }

  Future<void> fetchComplaints() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/complaints/admin'));
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          complaints = data['data']; // Backend se { data: [...] } aa raha hai
          isLoading = false;
        });
      }
    } catch (e) {
      print("Error fetching admin data: $e");
      setState(() => isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Admin War Room 🚨"),
        backgroundColor: Colors.red[800],
      ),
      body: isLoading
          ? Center(child: CircularProgressIndicator())
          : complaints.isEmpty
              ? Center(child: Text("No Complaints Found!"))
              : ListView.builder(
                  padding: EdgeInsets.all(10),
                  itemCount: complaints.length,
                  itemBuilder: (context, index) {
                    final item = complaints[index];
                    final user = item['userId'] ?? {};
                    bool isCritical = item['priority'] == 'critical' || (item['mergeCount'] ?? 1) > 3;

                    return Card(
                      elevation: 5,
                      margin: EdgeInsets.only(bottom: 15),
                      // 🔥 Red Border Logic for Critical Issues
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                        side: isCritical 
                          ? BorderSide(color: Colors.red, width: 2) 
                          : BorderSide.none,
                      ),
                      child: Padding(
                        padding: EdgeInsets.all(12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // 1. Header (Category + Priority)
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Chip(
                                  label: Text(item['category'].toString().toUpperCase()),
                                  backgroundColor: Colors.blue[100],
                                ),
                                if (isCritical)
                                  Chip(
                                    label: Text("🔥 ${item['mergeCount']} REPORTS"),
                                    backgroundColor: Colors.red[100],
                                    labelStyle: TextStyle(color: Colors.red),
                                  ),
                              ],
                            ),

                            SizedBox(height: 10),

                            // 2. Main Content (Image + Description)
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // Photo
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(8),
                                  child: item['imageUrl'] != null && item['imageUrl'] != ""
                                      ? Image.memory(
                                          base64Decode(item['imageUrl'].split(',').last),
                                          width: 100,
                                          height: 100,
                                          fit: BoxFit.cover,
                                        )
                                      : Container(
                                          width: 100,
                                          height: 100,
                                          color: Colors.grey[200],
                                          child: Icon(Icons.image_not_supported),
                                        ),
                                ),
                                SizedBox(width: 15),
                                // Description
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        item['title'] ?? "No Title",
                                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                                      ),
                                      SizedBox(height: 5),
                                      Text(
                                        item['description'] ?? "No Description",
                                        maxLines: 3,
                                        overflow: TextOverflow.ellipsis,
                                        style: TextStyle(color: Colors.grey[600]),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),

                            Divider(height: 20),

                            // 3. Citizen Profile (Letter View)
                            Text("Reported By:", style: TextStyle(fontWeight: FontWeight.bold)),
                            ListTile(
                              contentPadding: EdgeInsets.zero,
                              leading: CircleAvatar(child: Text(user['name']?[0] ?? "U")),
                              title: Text(user['name'] ?? "Anonymous"),
                              subtitle: Text("📞 ${user['phone'] ?? 'N/A'} | 📧 ${user['email'] ?? 'N/A'}"),
                            ),

                            // 4. Action Buttons
                            Row(
                              mainAxisAlignment: MainAxisAlignment.end,
                              children: [
                                if (item['audioUrl'] != null && item['audioUrl'] != "")
                                  IconButton(
                                    icon: Icon(Icons.volume_up, color: Colors.blue),
                                    onPressed: () {
                                      // Play Audio Logic Here
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        SnackBar(content: Text("Playing Audio..."))
                                      );
                                    },
                                  ),
                                ElevatedButton(
                                  onPressed: () {},
                                  child: Text("Resolve"),
                                  style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
                                ),
                              ],
                            )
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}