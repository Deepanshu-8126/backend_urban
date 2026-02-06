const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Property = require('./src/models/Property');

dotenv.config();

const dumpDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const properties = await Property.find().limit(5);
        console.log('📦 Sample Properties:');
        console.log(JSON.stringify(properties, null, 2));

        process.exit();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

dumpDB();
