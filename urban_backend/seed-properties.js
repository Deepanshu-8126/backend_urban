const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const Property = require('./src/models/Property');

// Manual Env Load
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

const sampleProperties = [
    // Delhi/NCR area properties (Updated with Zone & Value)
    { propertyId: 'DL-2024-001', ward: 'Ward 1', ownerName: 'Rajesh Kumar', area: 120, propertyType: 'residential', zone: 'A', marketValue: 12000000, taxDue: 12000, location: { type: 'Point', coordinates: [77.2090, 28.6139] }, circleRate: 5000, taxPaid: true },
    { propertyId: 'DL-2024-002', ward: 'Ward 1', ownerName: 'Priya Sharma', area: 200, propertyType: 'commercial', zone: 'A', marketValue: 25000000, taxDue: 60000, location: { type: 'Point', coordinates: [77.2095, 28.6145] }, circleRate: 8000, taxPaid: false },
    { propertyId: 'DL-2024-003', ward: 'Ward 2', ownerName: 'Amit Singh', area: 150, propertyType: 'residential', zone: 'B', marketValue: 8000000, taxDue: 10500, location: { type: 'Point', coordinates: [77.2100, 28.6150] }, circleRate: 4500, taxPaid: true },
    { propertyId: 'DL-2024-004', ward: 'Ward 2', ownerName: 'Sunita Verma', area: 300, propertyType: 'commercial', zone: 'B', marketValue: 18000000, taxDue: 63000, location: { type: 'Point', coordinates: [77.2080, 28.6130] }, circleRate: 9000, taxPaid: false },
    { propertyId: 'DL-2024-005', ward: 'Ward 3', ownerName: 'Vikas Gupta', area: 180, propertyType: 'residential', zone: 'C', marketValue: 6000000, taxDue: 7200, location: { type: 'Point', coordinates: [77.2110, 28.6155] }, circleRate: 5500, taxPaid: true },
    { propertyId: 'DL-2024-006', ward: 'Ward 1', ownerName: 'Neha Kapoor', area: 250, propertyType: 'mixed', zone: 'A', marketValue: 20000000, taxDue: 37500, location: { type: 'Point', coordinates: [77.2085, 28.6142] }, circleRate: 7000, taxPaid: false },
    { propertyId: 'DL-2024-007', ward: 'Ward 3', ownerName: 'Rahul Mehta', area: 400, propertyType: 'industrial', zone: 'C', marketValue: 15000000, taxDue: 32000, location: { type: 'Point', coordinates: [77.2120, 28.6160] }, circleRate: 6000, taxPaid: true },
    { propertyId: 'DL-2024-008', ward: 'Ward 2', ownerName: 'Pooja Jain', area: 160, propertyType: 'residential', zone: 'B', marketValue: 8500000, taxDue: 11200, location: { type: 'Point', coordinates: [77.2105, 28.6148] }, circleRate: 4800, taxPaid: false },
    { propertyId: 'DL-2024-009', ward: 'Ward 1', ownerName: 'Sanjay Reddy', area: 220, propertyType: 'commercial', zone: 'A', marketValue: 28000000, taxDue: 66000, location: { type: 'Point', coordinates: [77.2092, 28.6137] }, circleRate: 8500, taxPaid: true },
    { propertyId: 'DL-2024-010', ward: 'Ward 3', ownerName: 'Anjali Patel', area: 140, propertyType: 'residential', zone: 'C', marketValue: 5000000, taxDue: 5600, location: { type: 'Point', coordinates: [77.2115, 28.6158] }, circleRate: 5200, taxPaid: false },
];

async function seedProperties() {
    try {
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        await Property.deleteMany({});
        console.log('🗑️  Cleared existing properties');

        const properties = [];
        for (const prop of sampleProperties) {
            properties.push({
                ...prop,
                lastAssessmentDate: new Date()
            });
        }

        await Property.insertMany(properties);
        console.log(`✅ Inserted ${properties.length} sample properties`);

        const stats = await Property.aggregate([
            {
                $group: {
                    _id: '$propertyType',
                    count: { $sum: 1 },
                    totalValue: { $sum: '$marketValue' }
                }
            }
        ]);

        console.log('\n📊 Property Distribution:');
        stats.forEach(s => {
            console.log(`  ${s._id}: ${s.count} props, Value: ₹${(s.totalValue / 10000000).toFixed(2)} Cr`);
        });

        process.exit(0);

    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
}

seedProperties();
