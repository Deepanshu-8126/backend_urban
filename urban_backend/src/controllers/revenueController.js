const BudgetData = require('../models/BudgetData');

exports.getRevenue = async (req, res) => {
  try {
    const { department, fiscalYear } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (fiscalYear) filter.fiscalYear = fiscalYear;
    const records = await BudgetData.find(filter).sort({ lastUpdated: -1 });
    const totalBudget = records.reduce((sum, r) => sum + (r.totalBudget || 0), 0);
    const allocated = records.reduce((sum, r) => sum + (r.allocated || 0), 0);
    const spent = records.reduce((sum, r) => sum + (r.spent || 0), 0);
    res.json({ success: true, summary: { totalBudget, allocated, spent }, records });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch budget data' });
  }
};

exports.createRevenue = async (req, res) => {
  try {
    const { fiscalYear, totalBudget, allocated, spent, department, category } = req.body;
    const record = new BudgetData({ fiscalYear, totalBudget, allocated, spent, department, category });
    await record.save();
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(400).json({ success: false, error: 'Failed to create budget record' });
  }
};

exports.getBudgetAnalytics = async (req, res) => {
  try {
    const { fiscalYear } = req.query;
    const filter = fiscalYear ? { fiscalYear } : {};

    // Get latest data per department
    // In a real app, this should aggregate. Here we fetch all and process in JS for simplicity or use Mongo aggregation.
    // Let's use aggregation for "killer" performance.

    const analytics = await BudgetData.aggregate([
      { $match: filter },
      { $sort: { lastUpdated: -1 } },
      {
        $group: {
          _id: "$department",
          totalBudget: { $first: "$totalBudget" },
          allocated: { $first: "$allocated" },
          spent: { $first: "$spent" },
          category: { $first: "$category" }
        }
      }
    ]);

    const totalBudget = analytics.reduce((sum, r) => sum + (r.totalBudget || 0), 0);
    const totalSpent = analytics.reduce((sum, r) => sum + (r.spent || 0), 0);
    const utilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    // Identify high spending departments
    const dangerZone = analytics.filter(r => {
      const deptUtil = r.allocated > 0 ? (r.spent / r.allocated) * 100 : 0;
      return deptUtil > 85;
    });

    res.json({
      success: true,
      data: {
        totalBudget,
        totalSpent,
        utilization,
        breakdown: analytics,
        dangerZone: dangerZone.map(d => d._id)
      }
    });

  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ success: false, error: 'Failed to generate analytics' });
  }
};
