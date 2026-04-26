require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function resetAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Linked to Enterprise Database...');

    const user = await User.findOne({ email: 'admin@smtbms.com' });
    
    if (!user) {
      console.log('Admin node not found. Running creator...');
      require('./createAdmin');
      return;
    }

    // Force set the password - the pre-save hook will handle the hashing correctly now
    user.password = 'Admin@123';
    await user.save();

    console.log('\n--- SUCCESS: ADMIN ACCESS RESTORED ---');
    console.log('Email: admin@smtbms.com');
    console.log('Temporary Password: Admin@123');
    console.log('---------------------------------------\n');
    
    process.exit(0);
  } catch (err) {
    console.error('FAILURE:', err);
    process.exit(1);
  }
}

resetAdmin();
