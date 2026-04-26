require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function createAdmin() {
  try {
    // Establish Database Uplink
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Operational node linked to Enterprise database sequence.');

    // Check if Admin Custodian already exists
    const existingAdmin = await User.findOne({ email: 'admin@smtbms.com' });
    if (existingAdmin) {
       console.log('WARNING: Admin node already initialized.');
       process.exit(0);
    }

    // Initialize Primary Strategic Artifact
    await User.create({
      name: 'System Admin',
      email: 'admin@smtbms.com',
      password: 'Admin@123',
      role: 'Admin',
      isActive: true
    });
    
    console.log('\n--- SUCCESS: PRIMARY ADMIN NODE ESTABLISHED ---');
    console.log('Email: admin@smtbms.com');
    console.log('Password: Admin@123');
    console.log('SECURITY DIRECTIVE: CHANGE PASSWORD IMMEDIATELY AFTER INGRESS');
    console.log('-----------------------------------------------\n');
    
    process.exit(0);
  } catch (err) {
    console.error('SYSTEM FAILURE: Unable to deploy Operational Admin', err);
    process.exit(1);
  }
}

createAdmin();
