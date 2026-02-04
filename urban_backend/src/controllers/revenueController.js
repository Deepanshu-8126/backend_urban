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
