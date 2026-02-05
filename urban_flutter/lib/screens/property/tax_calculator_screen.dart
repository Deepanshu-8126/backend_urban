import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:animate_do/animate_do.dart';
import '../../core/api_service.dart';
import 'package:url_launcher/url_launcher.dart';
import 'my_properties_screen.dart';

class TaxCalculatorScreen extends StatefulWidget {
  const TaxCalculatorScreen({super.key});

  @override
  State<TaxCalculatorScreen> createState() => _TaxCalculatorScreenState();
}

class _TaxCalculatorScreenState extends State<TaxCalculatorScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  
  
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _areaController = TextEditingController();
  final TextEditingController _propertyIdController = TextEditingController();
  String selectedType = 'residential';
  String selectedWard = 'Ward 1';
  Map<String, dynamic>? result;
  bool isCalcLoading = false;

  final List<String> propertyTypes = ['residential', 'commercial', 'industrial', 'mixed'];
  final List<String> wards = ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4'];

  
  List<dynamic> nearbyProperties = [];
  bool isNearbyLoading = false;
  Position? currentPosition;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _getCurrentLocation();
  }

  Future<void> _getCurrentLocation() async {
    setState(() => isNearbyLoading = true);
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      
      if (permission == LocationPermission.whileInUse || permission == LocationPermission.always) {
        Position position = await Geolocator.getCurrentPosition();
        setState(() => currentPosition = position);
        _fetchNearbyProperties();
      }
    } catch (e) {
      debugPrint("Location Error: $e");
    } finally {
      setState(() => isNearbyLoading = false);
    }
  }

  Future<void> _fetchNearbyProperties() async {
    if (currentPosition == null) return;
    setState(() => isNearbyLoading = true);
    
    try {
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      final props = await ApiService.getNearbyProperties(currentPosition!.latitude, currentPosition!.longitude);
      setState(() {
        nearbyProperties = props;
      });
    } catch (e) {
      debugPrint("Fetch Error: $e");
    } finally {
      setState(() => isNearbyLoading = false);
    }
  }

  Future<void> _calculateTax() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => isCalcLoading = true);

    final data = await ApiService.calculatePropertyTax(
      propertyType: selectedType,
      area: double.parse(_areaController.text),
      ward: selectedWard,
      propertyId: _propertyIdController.text.isNotEmpty ? _propertyIdController.text : null,
    );

    setState(() {
      isCalcLoading = false;
      if (data['success'] == true) {
        result = data['taxDetails'];
      } else {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(data['error'] ?? "Calculation Failed")));
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Property Tax & Valuation"),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
        bottom: TabBar(
          controller: _tabController,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          indicatorColor: Colors.white,
          tabs: const [
            Tab(icon: Icon(Icons.calculate), text: "Calculator"),
            Tab(icon: Icon(Icons.near_me), text: "Nearby Properties"),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildCalculatorTab(),
          _buildNearbyTab(),
        ],
      ),
    );
  }

  Widget _buildCalculatorTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: [Colors.green.shade700, Colors.green.shade400], begin: Alignment.topLeft, end: Alignment.bottomRight),
              borderRadius: BorderRadius.circular(24),
              boxShadow: [BoxShadow(color: Colors.green.withOpacity(0.3), blurRadius: 15, offset: const Offset(0, 10))],
            ),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("Property Valuation", style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white)),
                  const SizedBox(height: 8),
                  const Text("Calculate accurate property tax instantly.", style: TextStyle(color: Colors.white70)),
                  const SizedBox(height: 24),
                  
                  Container(
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
                    child: TextFormField(
                      controller: _propertyIdController,
                      decoration: const InputDecoration(
                        labelText: "Property ID (Optional)", 
                        border: InputBorder.none,
                        contentPadding: EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                        prefixIcon: Icon(Icons.qr_code, color: Colors.green),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  
                  Container(
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
                    child: DropdownButtonFormField<String>(
                      initialValue: selectedType,
                      decoration: const InputDecoration(labelText: "Property Type", border: InputBorder.none, prefixIcon: Icon(Icons.domain, color: Colors.green), contentPadding: EdgeInsets.symmetric(horizontal: 20, vertical: 10)),
                      items: propertyTypes.map((t) => DropdownMenuItem(value: t, child: Text(t.toUpperCase()))).toList(),
                      onChanged: (v) => setState(() => selectedType = v!),
                    ),
                  ),
                  const SizedBox(height: 16),
                  
                  Container(
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
                    child: DropdownButtonFormField<String>(
                      initialValue: selectedWard,
                      decoration: const InputDecoration(labelText: "Ward / Zone", border: InputBorder.none, prefixIcon: Icon(Icons.location_on, color: Colors.green), contentPadding: EdgeInsets.symmetric(horizontal: 20, vertical: 10)),
                      items: wards.map((w) => DropdownMenuItem(value: w, child: Text(w))).toList(),
                      onChanged: (v) => setState(() => selectedWard = v!),
                    ),
                  ),
                  const SizedBox(height: 16),
                  
                  Container(
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
                    child: TextFormField(
                      controller: _areaController,
                      keyboardType: TextInputType.number,
                      validator: (v) => v!.isEmpty ? "Enter Area" : null,
                      decoration: const InputDecoration(
                        labelText: "Area (Sq. Meters)", 
                        border: InputBorder.none,
                        contentPadding: EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                        prefixIcon: Icon(Icons.square_foot, color: Colors.green),
                      ),
                    ),
                  ),
                  const SizedBox(height: 30),
                  
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton(
                      onPressed: isCalcLoading ? null : _calculateTax,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: Colors.green.shade800,
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      child: isCalcLoading 
                        ? const CircularProgressIndicator(color: Colors.green) 
                        : const Text("CALCULATE VALUATION", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    ),
                  )
                ],
              ),
            ),
          ),
          
          if (result != null) ...[
            const SizedBox(height: 24),
            FadeInUp(
              duration: const Duration(milliseconds: 500),
              child: Container(
                padding: const EdgeInsets.all(24.0),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [BoxShadow(color: Colors.grey.withOpacity(0.1), blurRadius: 20, offset: const Offset(0, 10))],
                  border: Border.all(color: Colors.green.withOpacity(0.1)),
                ),
                child: Column(
                  children: [
                    const Text("Estimated Annual Tax", style: TextStyle(fontSize: 16, color: Colors.grey)),
                    const SizedBox(height: 8),
                    Text(
                      "₹${result!['totalTax']}",
                      style: const TextStyle(fontSize: 42, fontWeight: FontWeight.bold, color: Colors.green),
                    ),
                    const Divider(height: 40),
                    _row("Base Rate", "₹${result!['ratePerSqM']} / sq.m"),
                    _row("Ward Multiplier", "${result!['wardMultiplier']}x"),
                    _row("Total Area", "${result!['area']} sq.m"),
                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: () {},
                        icon: const Icon(Icons.payment),
                        label: const Text("PAY TAX NOW"),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        ),
                      ),
                    )
                  ],
                ),
              ),
            )
          ]
        ],
      ),
    );
  }

  Widget _buildNearbyTab() {
    if (currentPosition == null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.location_disabled, size: 64, color: Colors.grey),
            const SizedBox(height: 16),
            const Text("Location access needed to find properties"),
            TextButton(onPressed: _getCurrentLocation, child: const Text("Enable Location")),
          ],
        ),
      );
    }

    if (isNearbyLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (nearbyProperties.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.home_work_outlined, size: 64, color: Colors.grey),
            const SizedBox(height: 16),
            const Text("No registered properties found nearby"),
            TextButton(onPressed: _fetchNearbyProperties, child: const Text("Refresh")),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: nearbyProperties.length,
      itemBuilder: (context, index) {
        final prop = nearbyProperties[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: Colors.green.withOpacity(0.1),
              child: const Icon(Icons.home, color: Colors.green),
            ),
            title: Text(prop['ownerName'] ?? 'Unknown Owner', style: const TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text("${prop['ward']} • ${prop['propertyType']?.toUpperCase()}"),
            trailing: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text("₹${prop['assessedValue'] ?? 0}", style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.green)),
                const Text("Valuation", style: TextStyle(fontSize: 10, color: Colors.grey)),
              ],
            ),
            onTap: () {
              
              if (prop['location']?['coordinates'] != null) {
                final lng = prop['location']['coordinates'][0];
                final lat = prop['location']['coordinates'][1];
                final url = Uri.parse("https://www.google.com/maps/search/?api=1&query=$lat,$lng");
                launchUrl(url, mode: LaunchMode.externalApplication);
              }
            },
          ),
        );
      },
    );
  }

  Widget _row(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontWeight: FontWeight.w500, color: Colors.black87)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
