const mongoose = require('mongoose');
require('dotenv').config();

const propertySchema = new mongoose.Schema({
    propertyId: { type: String, required: true, unique: true },
    ward: { type: String, required: true },
    ownerName: { type: String, required: true },
    area: { type: Number, required: true },
    propertyType: {
        type: String,
        enum: ['residential', 'commercial', 'industrial', 'mixed'],
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: [Number]
    },
    circleRate: { type: Number, default: 0 },
    assessedValue: { type: Number, default: 0 },
    taxPaid: { type: Boolean, default: false },
    lastAssessmentDate: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
}, { strict: false });

const Property = mongoose.model('Property', propertySchema);

const sampleProperties = [
    // Delhi/NCR area properties
    { propertyId: 'DL-2024-001', ward: 'Ward 1', ownerName: 'Rajesh Kumar', area: 120, propertyType: 'residential', location: { type: 'Point', coordinates: [77.2090, 28.6139] }, circleRate: 5000, taxPaid: true },
    { propertyId: 'DL-2024-002', ward: 'Ward 1', ownerName: 'Priya Sharma', area: 200, propertyType: 'commercial', location: { type: 'Point', coordinates: [77.2095, 28.6145] }, circleRate: 8000, taxPaid: false },
    { propertyId: 'DL-2024-003', ward: 'Ward 2', ownerName: 'Amit Singh', area: 150, propertyType: 'residential', location: { type: 'Point', coordinates: [77.2100, 28.6150] }, circleRate: 4500, taxPaid: true },
    { propertyId: 'DL-2024-004', ward: 'Ward 2', ownerName: 'Sunita Verma', area: 300, propertyType: 'commercial', location: { type: 'Point', coordinates: [77.2080, 28.6130] }, circleRate: 9000, taxPaid: false },
    { propertyId: 'DL-2024-005', ward: 'Ward 3', ownerName: 'Vikas Gupta', area: 180, propertyType: 'residential', location: { type: 'Point', coordinates: [77.2110, 28.6155] }, circleRate: 5500, taxPaid: true },
    { propertyId: 'DL-2024-006', ward: 'Ward 1', ownerName: 'Neha Kapoor', area: 250, propertyType: 'mixed', location: { type: 'Point', coordinates: [77.2085, 28.6142] }, circleRate: 7000, taxPaid: false },
    { propertyId: 'DL-2024-007', ward: 'Ward 3', ownerName: 'Rahul Mehta', area: 400, propertyType: 'industrial', location: { type: 'Point', coordinates: [77.2120, 28.6160] }, circleRate: 6000, taxPaid: true },
    { propertyId: 'DL-2024-008', ward: 'Ward 2', ownerName: 'Pooja Jain', area: 160, propertyType: 'residential', location: { type: 'Point', coordinates: [77.2105, 28.6148] }, circleRate: 4800, taxPaid: false },
    { propertyId: 'DL-2024-009', ward: 'Ward 1', ownerName: 'Sanjay Reddy', area: 220, propertyType: 'commercial', location: { type: 'Point', coordinates: [77.2092, 28.6137] }, circleRate: 8500, taxPaid: true },
    { propertyId: 'DL-2024-010', ward: 'Ward 3', ownerName: 'Anjali Patel', area: 140, propertyType: 'residential', location: { type: 'Point', coordinates: [77.2115, 28.6158] }, circleRate: 5200, taxPaid: false },

    // More properties
    { propertyId: 'DL-2024-011', ward: 'Ward 4', ownerName: 'Deepak Chopra', area: 190, propertyType: 'residential', location: { type: 'Point', coordinates: [77.2075, 28.6125] }, circleRate: 4700, taxPaid: true },
    { propertyId: 'DL-2024-012', ward: 'Ward 4', ownerName: 'Kavita Desai', area: 280, propertyType: 'commercial', location: { type: 'Point', coordinates: [77.2125, 28.6165] }, circleRate: 9500, taxPaid: false },
    { propertyId: 'DL-2024-013', ward: 'Ward 5', ownerName: 'Arun Nair', area: 210, propertyType: 'mixed', location: { type: 'Point', coordinates: [77.2070, 28.6120] }, circleRate: 6500, taxPaid: true },
    { propertyId: 'DL-2024-014', ward: 'Ward 5', ownerName: 'Meera Iyer', area: 170, propertyType: 'residential', location: { type: 'Point', coordinates: [77.2130, 28.6170] }, circleRate: 5300, taxPaid: false },
    { propertyId: 'DL-2024-015', ward: 'Ward 1', ownerName: 'Karan Malhotra', area: 350, propertyType: 'industrial', location: { type: 'Point', coordinates: [77.2088, 28.6135] }, circleRate: 6200, taxPaid: true },
    { propertyId: 'DL-2024-016', ward: 'Ward 2', ownerName: 'Ritu Agarwal', area: 130, propertyType: 'residential', location: { type: 'Point', coordinates: [77.2098, 28.6143] }, circleRate: 4600, taxPaid: false },
    { propertyId: 'DL-2024-017', ward: 'Ward 3', ownerName: 'Vikram Bhatia', area: 240, propertyType: 'commercial', location: { type: 'Point', coordinates: [77.2108, 28.6152] }, circleRate: 8800, taxPaid: true },
    { propertyId: 'DL-2024-018', ward: 'Ward 4', ownerName: 'Simran Kaur', area: 195, propertyType: 'residential', location: { type: 'Point', coordinates: [77.2082, 28.6128] }, circleRate: 4900, taxPaid: false },
    { propertyId: 'DL-2024-019', ward: 'Ward 5', ownerName: 'Manoj Tiwari', area: 310, propertyType: 'mixed', location: { type: 'Point', coordinates: [77.2118, 28.6162] }, circleRate: 7200, taxPaid: true },
    { propertyId: 'DL-2024-020', ward: 'Ward 1', ownerName: 'Divya Shah', area: 155, propertyType: 'residential', location: { type: 'Point', coordinates: [77.2093, 28.6140] }, circleRate: 5100, taxPaid: false },
];

async function seedProperties() {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        await Property.deleteMany({});
        console.log('🗑️  Cleared existing properties');

        const properties = [];
        for (const prop of sampleProperties) {
            const assessedValue = prop.circleRate * prop.area;
            properties.push({
                ...prop,
                assessedValue,
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
                    totalValue: { $sum: '$assessedValue' }
                }
            }
        ]);

        console.log('\n📊 Property Distribution:');
        stats.forEach(s => {
            console.log(`  ${s._id}: ${s.count} properties, Total Value: ₹${(s.totalValue / 100000).toFixed(2)} Lakhs`);
        });

        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
        console.log('✅ Property seeding complete!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
}

seedProperties();
