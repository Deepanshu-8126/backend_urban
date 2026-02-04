const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Define User Schema inline if require fails, or require it
// We try to require it first.
const User = require('./src/models/User');

async function resetPassword() {
    try {
        const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
        if (!uri) {
            throw new Error('MONGO_URI not found in environment variables');
        }
        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB');

        const email = 'deepanshukapri4@gmail.com';
        const newPassword = '123456';

        console.log(`Hashing password '${newPassword}'...`);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        console.log(`Updating user ${email}...`);
        const result = await User.updateOne(
            { email: email },
            { $set: { password: hashedPassword } }
        );

        if (result.matchedCount === 0) {
            console.log(`❌ User with email ${email} not found.`);
        } else {
            console.log(`✅ Password updated successfully!`);
            console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
        }

        await mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error('❌ Error resetting password:', error);
        process.exit(1);
    }
}

resetPassword();
