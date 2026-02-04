const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const fix = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const email = 'uday69999@gmail.com';
    const result = await User.deleteOne({ email });
    
    console.log('Delete result:', result);
    
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

fix();