const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const BudgetData = require('./src/models/BudgetData');

// Try manual env load
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) process.env[key.trim()] = value.trim();
    });
}

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/urban_db';
console.log('🔌 Using Mongo URI:', mongoUri);

const seedData = [
    // 2025-2026 Data
    { fiscalYear: '2025-2026', department: 'Infrastructure', category: 'Roads & Bridges', totalBudget: 1500000000, allocated: 1200000000, spent: 1020000000 },
    { fiscalYear: '2025-2026', department: 'Infrastructure', category: 'Public Buildings', totalBudget: 800000000, allocated: 600000000, spent: 450000000 },
    { fiscalYear: '2025-2026', department: 'Health', category: 'Hospitals', totalBudget: 1000000000, allocated: 900000000, spent: 480000000 },
    { fiscalYear: '2025-2026', department: 'Health', category: 'Clinics', totalBudget: 500000000, allocated: 400000000, spent: 390000000 },
    { fiscalYear: '2025-2026', department: 'Education', category: 'Schools', totalBudget: 1200000000, allocated: 1100000000, spent: 850000000 },
    { fiscalYear: '2025-2026', department: 'Sanitation', category: 'Waste Management', totalBudget: 900000000, allocated: 900000000, spent: 828000000 },
    { fiscalYear: '2025-2026', department: 'Transport', category: 'Metro', totalBudget: 2000000000, allocated: 1500000000, spent: 350000000 },

    // 2024-2025 Data
    { fiscalYear: '2024-2025', department: 'Infrastructure', category: 'Roads', totalBudget: 1400000000, allocated: 1400000000, spent: 1350000000 },
    { fiscalYear: '2024-2025', department: 'Health', category: 'General', totalBudget: 900000000, allocated: 900000000, spent: 880000000 }
];

const seedDB = async () => {
    try {
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to DB');

        await BudgetData.deleteMany({});
        console.log('🗑️  Cleared old data');

        await BudgetData.insertMany(seedData);
        console.log('✅ Seeded new budget data');

        process.exit();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

seedDB();
