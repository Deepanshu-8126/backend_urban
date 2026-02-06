const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Complaint = require('../models/Complaint');

// Load env vars
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

// Data Pools
const cities = [
    { name: "Mumbai", lat: 19.0760, lng: 72.8777, state: "Maharashtra" },
    { name: "Delhi", lat: 28.7041, lng: 77.1025, state: "Delhi" },
    { name: "Bangalore", lat: 12.9716, lng: 77.5946, state: "Karnataka" },
    { name: "Hyderabad", lat: 17.3850, lng: 78.4867, state: "Telangana" },
    { name: "Ahmedabad", lat: 23.0225, lng: 72.5714, state: "Gujarat" },
    { name: "Chennai", lat: 13.0827, lng: 80.2707, state: "Tamil Nadu" },
    { name: "Kolkata", lat: 22.5726, lng: 88.3639, state: "West Bengal" },
    { name: "Pune", lat: 18.5204, lng: 73.8567, state: "Maharashtra" },
    { name: "Jaipur", lat: 26.9124, lng: 75.7873, state: "Rajasthan" },
    { name: "Lucknow", lat: 26.8467, lng: 80.9462, state: "Uttar Pradesh" }
];

const firstNames = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayan", "Krishna", "Ishaan", "Diya", "Saanvi", "Ananya", "Aadya", "Pari", "Anika", "Navya", "Angel", "Myra", "Riya"];
const lastNames = ["Sharma", "Verma", "Gupta", "Malhotra", "Bhatnagar", "Saxena", "Kapur", "Singh", "Yadav", "Das", "Patel", "Shah", "Reddy", "Nair", "Menon", "Pillai", "Iyer", "Kumar", "Mishra", "Jha"];

const waterIssues = [
    "Pipeline burst causing flooding",
    "No water supply for 2 days",
    "Dirty/Contaminated water supply",
    "Low water pressure",
    "Water leakage on main road",
    "Sewer water mixing with drinking water"
];

const electricityIssues = [
    "Frequent power cuts",
    "Transformer sparks and noise",
    "Electric pole leaning dangerously",
    "Voltage fluctuation damaging appliances",
    "Street light pole current leakage",
    "Meter burnt due to overload"
];

// Helper to get random item
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInRange = (min, max) => Math.random() * (max - min) + min;

const generateComplaint = (category, index) => {
    const city = getRandom(cities);
    const isWater = category === 'water';
    const issue = getRandom(isWater ? waterIssues : electricityIssues);

    // Randomize location slightly around city center
    const lat = city.lat + getRandomInRange(-0.05, 0.05);
    const lng = city.lng + getRandomInRange(-0.05, 0.05);

    const name = `${getRandom(firstNames)} ${getRandom(lastNames)}`;

    // Status Distribution: 50% Pending, 30% Working, 20% Solved
    const rand = Math.random();
    let status = 'pending';
    let adminMessage = '';

    if (rand > 0.5 && rand < 0.8) {
        status = 'working';
        adminMessage = 'Team assigned. Work in progress.';
    } else if (rand >= 0.8) {
        status = 'solved';
        adminMessage = 'Issue resolved. Verified by officer.';
    }

    return {
        title: `${issue} in ${city.name}`,
        description: `We are facing ${issue.toLowerCase()} in our area (${city.name}). Please resolve this urgency as it is affecting many residents.`,
        category: category,
        department: category, // water -> water, electricity -> electricity
        assignedDept: category,
        subType: isWater ? 'pipeline' : 'outage',
        status: status,
        priorityScore: Math.floor(Math.random() * 5) + 1, // 1 to 5
        location: {
            type: "Point",
            coordinates: [lng, lat],
            address: `${city.name}, ${city.state}, India`
        },
        userId: "69831c0b8cce4fa43f2edd48", // Using the common test user ID
        userName: name,
        userContact: "9876543210",
        aiProcessed: true,
        validationStatus: "valid",
        images: [],
        adminMessage: adminMessage,
        adminResponseAt: status !== 'pending' ? new Date() : null,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 10 * 24 * 60 * 60 * 1000)), // Random time in last 10 days
        updatedAt: new Date()
    };
};

const seed = async () => {
    try {
        console.log('🔌 Connecting to Cloud Datbase...');
        await mongoose.connect(mongoUri);
        console.log('✅ Connected.');

        const complaints = [];

        // Generate 20 Water Complaints
        console.log('💧 Generating 20 Water Complaints...');
        for (let i = 0; i < 20; i++) {
            complaints.push(generateComplaint('water', i));
        }

        // Generate 20 Electricity Complaints
        console.log('⚡ Generating 20 Electricity Complaints...');
        for (let i = 0; i < 20; i++) {
            complaints.push(generateComplaint('electricity', i));
        }

        // Insert
        await Complaint.insertMany(complaints);

        console.log(`\n🎉 SUCCESS! Added ${complaints.length} new records.`);
        console.log('📂 Collection: complaints');
        console.log('🌍 Locations: Mumbai, Delhi, Bangalore, Kolkata, etc.');

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
};

seed();
