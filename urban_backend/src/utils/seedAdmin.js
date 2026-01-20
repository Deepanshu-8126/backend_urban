const mongoose = require('mongoose');
const User = require('../models/User'); // User model ka path sahi hona chahiye
const dotenv = require('dotenv');
const path = require('path');

// .env file dhoondhne ke liye (agar root folder mein hai)
dotenv.config({ path: path.join(__dirname, '../../.env') });

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('🌱 Database se connect ho gaya...');
    
    // Check kar rahe hain ki Admin pehle se hai ya nahi
    const exists = await User.findOne({ email: 'admin@urban.ai' });
    
    if (!exists) {
      // Agar nahi hai, to bana do
      await User.create({
        name: 'Super Admin',
        email: 'admin@urban.ai',
        password: 'adminmasterkey', // Ye password yaad rakhna login ke liye
        role: 'admin',
        isVerified: true
      });
      console.log('✅ Admin Create Ho Gaya!');
      console.log('📧 Email: admin@urban.ai');
      console.log('🔑 Password: adminmasterkey');
    } else {
      console.log('⚠️ Admin pehle se bana hua hai.');
    }
    process.exit();
  })
  .catch((err) => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });