const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Property = require('./src/models/Property');

dotenv.config();

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const total = await Property.countDocuments();
        const haldwani = await Property.countDocuments({ propertyId: { $regex: /^HAL-/ } });
        const lamachaur = await Property.countDocuments({ propertyId: { $regex: /^LAM-/ } });

        console.log('--- DB STATS ---');
        console.log('Total Properties:', total);
        console.log('Haldwani (HAL-):', haldwani);
        console.log('Lamachaur (LAM-):', lamachaur);

        if (total > 0) {
            const sample = await Property.findOne();
            console.log('Sample Property ID:', sample.propertyId);
            console.log('Sample Location:', JSON.stringify(sample.location));
        }
        console.log('----------------');

        process.exit();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

checkData();
