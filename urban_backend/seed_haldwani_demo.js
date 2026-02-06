const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Property = require('./src/models/Property');

dotenv.config();

const haldwaniProperties = [
    // --- HALDWANI CITY ---
    {
        propertyId: "HAL-RES-001",
        ownerName: "Dr. Vineet Pant",
        address: "B-24, Civil Lines, Near Judges Court, Haldwani",
        propertyType: "residential",
        zone: "A",
        area: 250,
        ward: "Ward 1 (Civil Lines)",
        location: { type: "Point", coordinates: [79.5135, 29.2195] },
        taxDue: 4500,
        taxPaid: false
    },
    {
        propertyId: "HAL-COM-002",
        ownerName: "Basant Cinema Complex",
        address: "Tikonia Chauraha, Bareilly Road",
        propertyType: "commercial",
        zone: "A",
        area: 1500,
        ward: "Ward 5 (Tikonia)",
        location: { type: "Point", coordinates: [79.5180, 29.2150] },
        taxDue: 85000,
        taxPaid: true
    },
    {
        propertyId: "HAL-RES-003",
        ownerName: "Mrs. Kamla Devi",
        address: "Street 4, Heera Nagar, Haldwani",
        propertyType: "residential",
        zone: "B",
        area: 120,
        ward: "Ward 3 (Heera Nagar)",
        location: { type: "Point", coordinates: [79.5100, 29.2220] },
        taxDue: 1800,
        taxPaid: false
    },
    {
        propertyId: "HAL-COM-004",
        ownerName: "Mukhani Super Market",
        address: "Mukhani Chauraha, Kaladhungi Road",
        propertyType: "commercial",
        zone: "A",
        area: 450,
        ward: "Ward 8 (Mukhani)",
        location: { type: "Point", coordinates: [79.4950, 29.2150] },
        taxDue: 12500,
        taxPaid: false
    },
    {
        propertyId: "HAL-HOS-005",
        ownerName: "Ujala Hospital",
        address: "Mukhani-Kaladhungi Road, Haldwani",
        propertyType: "hospital",
        zone: "A",
        area: 2200,
        ward: "Ward 8 (Mukhani)",
        location: { type: "Point", coordinates: [79.4920, 29.2145] },
        taxDue: 0,
        taxPaid: true
    },
    {
        propertyId: "HAL-HOT-006",
        ownerName: "Hotel Saurabh Manor",
        address: "Civil Lines, Near Nainital Road",
        propertyType: "hotel",
        zone: "A",
        area: 3500,
        ward: "Ward 1 (Civil Lines)",
        location: { type: "Point", coordinates: [79.5150, 29.2205] },
        taxDue: 145000,
        taxPaid: false
    },
    {
        propertyId: "HAL-IND-007",
        ownerName: "Standard Industrial Works",
        address: "Industrial Area, Lalkuan Road",
        propertyType: "industrial",
        zone: "C",
        area: 5000,
        ward: "Ward 22 (Outer)",
        location: { type: "Point", coordinates: [79.5250, 29.1800] },
        taxDue: 55000,
        taxPaid: true
    },

    // --- LAMACHAUR AREA ---
    {
        propertyId: "LAM-RES-001",
        ownerName: "Mr. Suresh Rawat",
        address: "Lamachaur Khas, Near GIC Lamachaur",
        propertyType: "residential",
        zone: "C",
        area: 180,
        ward: "Ward 15 (Lamachaur)",
        location: { type: "Point", coordinates: [79.4670, 29.2480] },
        taxDue: 1200,
        taxPaid: false
    },
    {
        propertyId: "LAM-COM-002",
        ownerName: "Lamachaur Traders",
        address: "Main Market, Lamachaur",
        propertyType: "commercial",
        zone: "C",
        area: 120,
        ward: "Ward 15 (Lamachaur)",
        location: { type: "Point", coordinates: [79.4685, 29.2490] },
        taxDue: 3500,
        taxPaid: true
    },
    {
        propertyId: "LAM-RES-003",
        ownerName: "Army Veterans Colony",
        address: "Fatehpur Tanda, Lamachaur",
        propertyType: "residential",
        zone: "C",
        area: 300,
        ward: "Ward 16 (Fatehpur)",
        location: { type: "Point", coordinates: [79.4620, 29.2550] },
        taxDue: 2500,
        taxPaid: false
    },
    {
        propertyId: "LAM-RES-004",
        ownerName: "Green Valley Farmhouse",
        address: "Chakalwa, Lamachaur Road",
        propertyType: "residential",
        zone: "C",
        area: 800,
        ward: "Ward 17 (Chakalwa)",
        location: { type: "Point", coordinates: [79.4550, 29.2620] },
        taxDue: 15000,
        taxPaid: false
    },

    // --- KUSUMKHERA AREA ---
    {
        propertyId: "KUS-RES-001",
        ownerName: "Amitabh Bisht",
        address: "Vinayak Colony, Kusumkhera",
        propertyType: "residential",
        zone: "B",
        area: 210,
        ward: "Ward 10 (Kusumkhera)",
        location: { type: "Point", coordinates: [79.4850, 29.2250] },
        taxDue: 3200,
        taxPaid: false
    },
    {
        propertyId: "KUS-COM-002",
        ownerName: "Reliance Trends",
        address: "Kusumkhera Chauraha",
        propertyType: "commercial",
        zone: "A",
        area: 1200,
        ward: "Ward 10 (Kusumkhera)",
        location: { type: "Point", coordinates: [79.4860, 29.2245] },
        taxDue: 0,
        taxPaid: true
    }
];

const seedHaldwani = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB for Demo Seeding');

        // Optional: Delete existing test data to make it clean for judges
        // const result = await Property.deleteMany({ propertyId: { $regex: /^PID-/ } });
        // console.log(`🗑️ Deleted ${result.deletedCount} old test properties`);

        await Property.insertMany(haldwaniProperties);
        console.log(`✅ Successfully seeded ${haldwaniProperties.length} Haldwani/Lamachaur properties for demo!`);

        process.exit();
    } catch (error) {
        console.error('❌ Seeding Error:', error);
        process.exit(1);
    }
};

seedHaldwani();
