import 'package:flutter/material.dart';

class BudgetTrackerScreen extends StatelessWidget {
  const BudgetTrackerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Municipal Financial Hub")),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text("City Financial Health", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 15),

            // Summary Cards
            Row(
              children: [
                _buildFinanceCard("Total Budget", "₹500 Cr", Colors.blue),
                const SizedBox(width: 10),
                _buildFinanceCard("Utilized", "₹342 Cr", Colors.orange),
              ],
            ),

            const SizedBox(height: 25),
            const Text("Department-wise Spending", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),

            // Budget Bars
            _buildBudgetBar("Infrastructure", 0.85, "₹120 Cr", Colors.indigo),
            _buildBudgetBar("Public Health", 0.60, "₹80 Cr", Colors.teal),
            _buildBudgetBar("Education", 0.45, "₹50 Cr", Colors.amber),
            _buildBudgetBar("Sanitation", 0.92, "₹90 Cr", Colors.red),

            const SizedBox(height: 25),
            _buildRevenueHighlight(),
          ],
        ),
      ),
    );
  }

  Widget _buildFinanceCard(String title, String amount, Color col) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(15),
        decoration: BoxDecoration(
          color: col.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: col),
        ),
        child: Column(
          children: [
            Text(title, style: TextStyle(color: col, fontWeight: FontWeight.bold)),
            const SizedBox(height: 5),
            Text(amount, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }

  Widget _buildBudgetBar(String dept, double percent, String val, Color col) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(dept, style: const TextStyle(fontWeight: FontWeight.w500)),
              Text(val, style: TextStyle(color: col, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 5),
          LinearProgressIndicator(
            value: percent,
            color: col,
            backgroundColor: col.withOpacity(0.1),
            minHeight: 10,
            borderRadius: BorderRadius.circular(10),
          ),
        ],
      ),
    );
  }

  Widget _buildRevenueHighlight() {
    return Card(
      color: Colors.green.shade50,
      child: const ListTile(
        leading: Icon(Icons.trending_up, color: Colors.green),
        title: Text("Revenue Surplus: +12%", style: TextStyle(fontWeight: FontWeight.bold, color: Colors.green)),
        subtitle: Text("Property tax collection exceeded targets for Q3."),
      ),
    );
  }
}