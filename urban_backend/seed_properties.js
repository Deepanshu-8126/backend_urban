const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Property = require('./src/models/Property');

dotenv.config();

const properties = [
    {
        propertyId: "PID-001",
        ownerName: "Rajesh Kumar",
        address: "12, Civil Lines, Haldwani",
        propertyType: "residential",
        zone: "A",
        area: 120,
        ward: "Ward 1",
        location: {
            type: "Point",
            coordinates: [79.5110, 29.2190] // Approx Haldwani coords
        },
        taxDue: 1500,
        taxPaid: false
    },
    {
        propertyId: "PID-002",
        ownerName: "Amit Singh",
        address: "45, Market Road, Haldwani",
        propertyType: "commercial",
        zone: "A",
        area: 250,
        ward: "Ward 2",
        location: {
            type: "Point",
            coordinates: [79.5130, 29.2183]
        },
        taxDue: 5600,
        taxPaid: true
    },
    {
        propertyId: "PID-003",
        ownerName: "Sita Devi",
        address: "78, Rampur Road, Haldwani",
        propertyType: "residential",
        zone: "B",
        area: 80,
        ward: "Ward 3",
        location: {
            type: "Point",
            coordinates: [79.5150, 29.2200]
        },
        taxDue: 800,
        taxPaid: false
    },
    {
        propertyId: "PID-004",
        ownerName: "Urban Hotel",
        address: "Civic Center",
        propertyType: "hotel",
        zone: "A",
        area: 1200,
        ward: "Ward 4",
        location: {
            type: "Point",
            coordinates: [79.5120, 29.2170]
        },
        taxDue: 45000,
        taxPaid: false
    },
    {
        propertyId: "PID-005",
        ownerName: "City Hospital",
        address: "Nainital Road",
        propertyType: "hospital",
        zone: "B",
        area: 5000,
        ward: "Ward 1",
        location: {
            type: "Point",
            coordinates: [79.5100, 29.2210]
        },
        taxDue: 120000,
        taxPaid: true
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');

        // Check if properties exist
        const count = await Property.countDocuments();
        if (count > 0) {
            console.log(`ℹ️ Database already has ${count} properties. Skipping seed.`);
            process.exit();
        }

        await Property.insertMany(properties);
        console.log('✅ Specific Properties Seeded Successfully!');
        process.exit();
    } catch (error) {
        console.error('❌ Seeding Error:', error);
        process.exit(1);
    }
};

seedDB();
