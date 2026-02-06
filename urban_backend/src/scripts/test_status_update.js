const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Complaint = require('../models/Complaint');
const controller = require('../controllers/complaintController');

// Mock Req/Res
const req = {
    params: { id: '' },
    body: { status: 'working', adminMessage: 'Technician assigned via Test Script' },
    app: { get: () => null } // Mock socketio
};

const res = {
    json: (data) => console.log('✅ Response:', data),
    status: (code) => {
        console.log('⚠️ Status:', code);
        return { json: (data) => console.log('❌ Error:', data) };
    }
};

// Load env
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const runTest = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/test';
        await mongoose.connect(uri);
        console.log('🔌 Connected to DB');

        // Get a complaint
        const complaint = await Complaint.findOne();
        if (!complaint) {
            console.log('❌ No complaints found to test.');
            process.exit(1);
        }

        console.log(`🧪 Testing Update on Complaint: ${complaint._id} (${complaint.title})`);

        req.params.id = complaint._id;

        // Call Controller Function Directly
        await controller.updateStatusAndMessage(req, res);

        console.log('✅ Test Complete');
        process.exit(0);

    } catch (err) {
        console.error('❌ Test Failed:', err);
        process.exit(1);
    }
};

runTest();
