const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Complaint = require('../models/Complaint');

// Load env vars or fallback
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/test';

const verify = async () => {
    try {
        console.log('🔍 Connecting to:', mongoUri);
        await mongoose.connect(mongoUri);

        const count = await Complaint.countDocuments();
        console.log(`\n📊 DATABASE STATUS REPORT:`);
        console.log(`--------------------------------`);
        console.log(`🗄️  Database Name:   ${mongoose.connection.name}`);
        console.log(`📂 Collection Name: complaints`); // Mongoose model is strict
        console.log(`🔢 Total Complaints: ${count}`);

        if (count > 0) {
            const latest = await Complaint.find().sort({ _id: -1 }).limit(1);
            console.log(`\n🆕 Latest Complaint ID: ${latest[0]._id}`);
            console.log(`📝 Title: "${latest[0].title}"`);
        } else {
            console.log('⚠️ Collection is empty!');
        }

        console.log(`\n👉 PLEASE CHECK DATABASE: "${mongoose.connection.name}" IN YOUR VIEWER`);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

verify();
