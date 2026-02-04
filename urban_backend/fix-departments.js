const mongoose = require('mongoose');
require('dotenv').config();

const complaintSchema = new mongoose.Schema({}, { strict: false });
const Complaint = mongoose.model('Complaint', complaintSchema);

async function fixComplaintDepartments() {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const waterResult = await Complaint.updateMany(
            { department: 'water-works' },
            { $set: { department: 'water' } }
        );
        console.log(`✅ Fixed ${waterResult.modifiedCount} water complaints`);

        const powerResult = await Complaint.updateMany(
            { department: 'power' },
            { $set: { department: 'electricity' } }
        );
        console.log(`✅ Fixed ${powerResult.modifiedCount} electricity complaints`);

        const roadsResult = await Complaint.updateMany(
            { department: 'public-works' },
            { $set: { department: 'roads' } }
        );
        console.log(`✅ Fixed ${roadsResult.modifiedCount} roads complaints`);

        const sanitationResult = await Complaint.updateMany(
            { department: 'sanitation' },
            { $set: { department: 'garbage' } }
        );
        console.log(`✅ Fixed ${sanitationResult.modifiedCount} sanitation/garbage complaints`);

        console.log('\n📊 Current complaint distribution by department:');
        const distribution = await Complaint.aggregate([
            { $group: { _id: '$department', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        distribution.forEach(d => {
            console.log(`  - ${d._id}: ${d.count} complaints`);
        });

        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
        console.log('✅ All complaints fixed!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error fixing complaints:', error);
        process.exit(1);
    }
}

fixComplaintDepartments();
