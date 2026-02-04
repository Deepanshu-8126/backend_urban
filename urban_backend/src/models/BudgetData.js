const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  fiscalYear: String,
  totalBudget: Number,
  allocated: Number,
  spent: Number,
  department: String,
  category: String,
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BudgetData', budgetSchema);