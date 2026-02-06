const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Complaint = require('../models/Complaint'); // ✅ Standard Model

// Try loading from multiple possible locations or default
const envPath = path.resolve(__dirname, '../../.env');
console.log('📂 Loading .env from:', envPath);
dotenv.config({ path: envPath });

// Fallback: If running from root, simple config might work
if (!process.env.MONGO_URI && !process.env.MONGODB_URI) {
    console.log('⚠️ First attempt failed. Trying default dotenv.config()');
    dotenv.config();
}

// FORCE FALLBACK if still undefined (Local Dev Environment)
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/test';
process.env.MONGO_URI = mongoUri; // Set for db.js logic compatibility if needed

const sampleComplaints = [
    {
        title: "Severe Water Leakage in Connaught Place",
        description: "Main water pipe has burst near Block A inner circle. Thousands of liters wasting.",
        category: "water",
        department: "water",
        assignedDept: "water",
        status: "pending",
        priorityScore: 5,
        location: {
            type: "Point",
            coordinates: [77.2167, 28.6315], // Delhi CP
            address: "Connaught Place, New Delhi, Delhi 110001, India"
        },
        userId: "69831c0b8cce4fa43f2edd48", // Using the ID from user's snippet
        userName: "Amit Sharma",
        aiProcessed: true,
        validationStatus: "valid",
        images: ["https://example.com/water_leak.jpg"]
    },
    {
        title: "Huge Potholes on Marine Drive",
        description: "Several large potholes causing traffic jams and accidents near the promenade.",
        category: "road",
        department: "roads",
        assignedDept: "roads",
        status: "working",
        priorityScore: 4,
        location: {
            type: "Point",
            coordinates: [72.8232, 18.9440], // Mumbai Marine Drive
            address: "Marine Drive, Mumbai, Maharashtra 400020, India"
        },
        userId: "69831c0b8cce4fa43f2edd48",
        userName: "Rajesh Patil",
        aiProcessed: true,
        validationStatus: "valid",
        adminMessage: "We have deployed a team to fix this.",
        adminResponseAt: new Date()
    },
    {
        title: "Garbage Dump Not Cleared",
        description: "Garbage truck hasn't come for 3 days in Kothrud area. Smelling very bad.",
        category: "garbage",
        department: "sanitation",
        assignedDept: "garbage",
        status: "pending",
        priorityScore: 3,
        location: {
            type: "Point",
            coordinates: [73.8055, 18.5074], // Pune Kothrud
            address: "Kothrud, Pune, Maharashtra 411038, India"
        },
        userId: "69831c0b8cce4fa43f2edd48",
        userName: "Sneha Deshmukh",
        aiProcessed: true,
        validationStatus: "valid"
    },
    {
        title: "Street Lights Not Working",
        description: "Entire street is dark at night near MG Road, causing safety issues.",
        category: "electricity",
        department: "electricity",
        assignedDept: "electricity",
        status: "solved",
        priorityScore: 2,
        location: {
            type: "Point",
            coordinates: [77.5946, 12.9716], // Bangalore MG Road
            address: "MG Road, Bengaluru, Karnataka 560001, India"
        },
        userId: "69831c0b8cce4fa43f2edd48",
        userName: "Rahul Dravid",
        aiProcessed: true,
        validationStatus: "valid",
        adminMessage: "Lights replaced.",
        adminResponseAt: new Date()
    }
];

const seedDB = async () => {
    try {
        let uri = process.env.MONGO_URI || process.env.MONGODB_URI;
        if (uri && !uri.includes('test')) {
            if (uri.endsWith('/')) uri += 'test';
            else uri += '/test';
        }

        console.log('🔌 Connecting to:', uri);
        await mongoose.connect(uri);
        console.log('✅ Connected to Database');

        console.log('🌱 Seeding Complaints...');

        // Optional: Clear existing? user might not want that. Let's just append.
        // await Complaint.deleteMany({}); 

        const result = await Complaint.insertMany(sampleComplaints);

        console.log(`✅ Successfully added ${result.length} complaints to 'complaints' collection!`);
        console.log('📍 Locations: Delhi, Mumbai, Pune, Bangalore');

        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
};

seedDB();
