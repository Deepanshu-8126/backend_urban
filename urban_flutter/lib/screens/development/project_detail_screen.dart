import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

class ProjectDetailScreen extends StatelessWidget {
  final dynamic project;

  const ProjectDetailScreen({super.key, required this.project});

  @override
  Widget build(BuildContext context) {
    Color statusColor = project['status'] == 'Completed' ? Colors.green : (project['status'] == 'In-Progress' ? Colors.orange : Colors.grey);
    double progress = (project['progress'] ?? 0) / 100.0;
    final currencyFormat = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black),
        title: Text("Project Details", style: GoogleFonts.poppins(color: Colors.black, fontWeight: FontWeight.bold)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Image Placeholder (or Category Icon)
            Container(
              height: 180,
              width: double.infinity,
              decoration: BoxDecoration(
                color: Colors.grey[100],
                borderRadius: BorderRadius.circular(20),
                image: project['images'] != null && (project['images'] as List).isNotEmpty 
                  ? DecorationImage(image: AssetImage("assets/images/${project['images'][0]}"), fit: BoxFit.cover)
                  : null,
              ),
              child: project['images'] == null || (project['images'] as List).isEmpty 
                ? Center(child: Icon(Icons.construction, size: 60, color: Colors.blue[300])) 
                : null,
            ),
            const SizedBox(height: 24),

            // Title & Status
            Row(
              children: [
                Expanded(
                  child: Text(
                    project['title'],
                    style: GoogleFonts.poppins(fontSize: 22, fontWeight: FontWeight.bold, height: 1.2),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(color: statusColor.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(20)),
              child: Text(
                project['status'].toUpperCase(), 
                style: GoogleFonts.roboto(color: statusColor, fontWeight: FontWeight.bold, fontSize: 12)
              ),
            ),
            const SizedBox(height: 24),

            // Progress Section
            Text("Work Progress", style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w600)),
            const SizedBox(height: 12),
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: LinearProgressIndicator(
                value: progress,
                minHeight: 12,
                backgroundColor: Colors.grey[200],
                color: statusColor,
              ),
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text("0%", style: GoogleFonts.roboto(color: Colors.grey)),
                Text("${project['progress']}% Completed", style: GoogleFonts.roboto(fontWeight: FontWeight.bold)),
                Text("100%", style: GoogleFonts.roboto(color: Colors.grey)),
              ],
            ),
            const SizedBox(height: 24),

            // Financial Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFFF4F7FC), // Soft blue-grey
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.blue.withValues(alpha: 0.1))
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _financialColumn("Allocated Budget", currencyFormat.format(project['financials']['allocated'])),
                      Container(height: 40, width: 1, color: Colors.grey[300]),
                      _financialColumn("Amount Spent", currencyFormat.format(project['financials']['spent'])),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const Divider(),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      const Icon(Icons.engineering, color: Colors.grey),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text("Contractor", style: GoogleFonts.roboto(color: Colors.grey, fontSize: 12)),
                          Text(project['financials']['contractor'] ?? "N/A", style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
                        ],
                      )
                    ],
                  )
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Details
            _detailRow(Icons.location_on, "Location", project['location']['address']),
            _detailRow(Icons.calendar_today, "Timeline", "${project['dates']['start']} - ${project['dates']['end']}"),
            _detailRow(Icons.info_outline, "Description", project['description']),

          ],
        ),
      ),
    );
  }

  Widget _financialColumn(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: GoogleFonts.roboto(fontSize: 12, color: Colors.grey[600])),
        const SizedBox(height: 4),
        Text(value, style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black87)),
      ],
    );
  }

  Widget _detailRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: Colors.grey[100], shape: BoxShape.circle),
            child: Icon(icon, size: 20, color: Colors.grey[700]),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: GoogleFonts.roboto(color: Colors.grey, fontSize: 12, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text(value, style: GoogleFonts.poppins(color: Colors.black87, fontSize: 14)),
              ],
            ),
          )
        ],
      ),
    );
  }
}
