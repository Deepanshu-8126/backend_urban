import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:animate_do/animate_do.dart';
import '../../../core/api_service.dart';
import '../../../core/app_provider.dart';
import 'package:provider/provider.dart';

class MyPropertiesScreen extends StatefulWidget {
  const MyPropertiesScreen({super.key});

  @override
  State<MyPropertiesScreen> createState() => _MyPropertiesScreenState();
}

class _MyPropertiesScreenState extends State<MyPropertiesScreen> {
  List<dynamic> properties = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchMyProperties();
  }

  Future<void> _fetchMyProperties() async {
    final token = Provider.of<AppProvider>(context, listen: false).token;
    try {
      final response = await http.get(
        Uri.parse('${ApiService.baseUrl}/property/my-properties'),
        headers: {'Authorization': 'Bearer $token'},
      );
      if (response.statusCode == 200) {
        setState(() {
          properties = jsonDecode(response.body)['data'];
          isLoading = false;
        });
      }
    } catch (e) {
      debugPrint("Fetch Properties Error: $e");
    }
  }

  Future<void> _payTax(Map property) async {
    final token = Provider.of<AppProvider>(context, listen: false).token;
    try {
      final response = await http.post(
        Uri.parse('${ApiService.baseUrl}/property/pay'),
        headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer $token'},
        body: jsonEncode({
          'propertyId': property['propertyId'],
          'amount': property['calculatedTax']
        }),
      );

      if (response.statusCode == 200) {
        final receipt = jsonDecode(response.body)['receipt'];
        _showReceiptDialog(receipt);
        _fetchMyProperties(); // Refresh
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Payment Failed")));
    }
  }

  void _showReceiptDialog(Map receipt) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        backgroundColor: Colors.transparent,
        child: FadeInUp(
          child: Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.check_circle, color: Colors.green, size: 60),
                const SizedBox(height: 16),
                const Text("Payment Successful!", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                const Divider(height: 30),
                _row("Receipt ID", receipt['receiptId']),
                _row("Property ID", receipt['propertyId']),
                _row("Amount Paid", "₹${receipt['amountPaid']}"),
                _row("Date", receipt['date'].toString().split('T')[0]),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.black, foregroundColor: Colors.white),
                  child: const Text("Download Receipt"),
                )
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _row(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      body: isLoading 
        ? const Center(child: CircularProgressIndicator())
        : ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: properties.length,
            itemBuilder: (context, index) {
              final p = properties[index];
              bool isPaid = p['status'] == 'PAID';
              
              return FadeInUp(
                delay: Duration(milliseconds: index * 100),
                child: Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10)]
                  ),
                  child: Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: isPaid ? Colors.green.withOpacity(0.1) : Colors.red.withOpacity(0.1),
                          borderRadius: const BorderRadius.vertical(top: Radius.circular(20))
                        ),
                        child: Row(
                          children: [
                            Icon(isPaid ? Icons.verified : Icons.warning, color: isPaid ? Colors.green : Colors.red),
                            const SizedBox(width: 8),
                            Text(isPaid ? "TAX PAID" : "TAX DUE", style: TextStyle(color: isPaid ? Colors.green : Colors.red, fontWeight: FontWeight.bold)),
                            const Spacer(),
                            Text("₹${p['calculatedTax']}", style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold))
                          ],
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          children: [
                            _row("Property ID", p['propertyId']),
                            _row("Owner", p['ownerName']),
                            _row("Zone", "Zone ${p['zone']}"),
                            _row("Area", "${p['area']} sq.m"),
                            const SizedBox(height: 16),
                            if (!isPaid)
                              SizedBox(
                                width: double.infinity,
                                child: ElevatedButton(
                                  onPressed: () => _payTax(p),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.indigo,
                                    foregroundColor: Colors.white,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))
                                  ),
                                  child: const Text("PAY NOW"),
                                ),
                              )
                          ],
                        ),
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
