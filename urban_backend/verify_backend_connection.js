const mongoose = require('mongoose');
require('dotenv').config();

async function checkConnection(uri, name) {
    if (!uri) {
        console.log(`⚠️  ${name}: Not defined in .env`);
        return;
    }
    // Check for placeholders
    if (uri.includes('user:pass') || uri.includes('xxxxx')) {
        console.log(`⚠️  ${name}: Contains placeholders, skipping (URI: ${uri})`);
        return;
    }

    console.log(`\nTesting ${name}...`);
    try {
        await mongoose.connect(uri);
        console.log(`✅ ${name}: SUCCESS - Connected`);
        const connection = mongoose.connection;
        console.log(`   Host: ${connection.host}`);
        console.log(`   Internal DB Name: ${connection.name}`);
        await mongoose.disconnect();
    } catch (error) {
        console.error(`❌ ${name}: FAILED`);
        console.error(`   Error: ${error.message}`);
    }
}

async function runChecks() {
    console.log("=== LIVE DATABASE CHECK REPORT ===");
    console.log(`Time: ${new Date().toISOString()}`);

    await checkConnection(process.env.MONGO_URI, "Local MongoDB (MONGO_URI)");
    await checkConnection(process.env.CITIZENS_DB_URI, "Citizens DB (Cloud)");
    await checkConnection(process.env.ADMINS_DB_URI, "Admins DB (Cloud)");

    console.log("\n=== CHECK COMPLETE ===");
}

runChecks();
