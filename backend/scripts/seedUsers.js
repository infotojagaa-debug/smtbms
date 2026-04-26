/**
 * SMTBMS - Database Seeder Script
 * Seeds test users for all roles into MongoDB
 * Usage: node scripts/seedUsers.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars from backend root
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const users = [
  {
    name: 'Super Admin',
    email: 'admin@smtbms.com',
    password: 'Admin@123',
    role: 'Admin',
  },
  {
    name: 'HR Manager',
    email: 'hr@smtbms.com',
    password: 'Hr@123456',
    role: 'HR',
  },
  {
    name: 'Sales Executive',
    email: 'sales@smtbms.com',
    password: 'Sales@123',
    role: 'Sales Team',
  },
  {
    name: 'Store Manager',
    email: 'manager@smtbms.com',
    password: 'Manager@123',
    role: 'Manager',
  },
  {
    name: 'Field Employee',
    email: 'employee@smtbms.com',
    password: 'Employee@123',
    role: 'Employee',
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Remove existing test users before re-seeding
    for (const u of users) {
      await User.deleteOne({ email: u.email });
    }
    console.log('🧹 Cleared previous seed users');

    // Use create() in a loop so that the pre-save bcrypt hook fires for each user
    const created = [];
    for (const u of users) {
      const newUser = await User.create(u);
      created.push(newUser);
    }
    console.log(`🌱 Seeded ${created.length} users successfully!\n`);

    console.log('============================================');
    console.log('  SMTBMS TEST CREDENTIALS');
    console.log('============================================');
    users.forEach(u => {
      console.log(`  Role: ${u.role.padEnd(12)} | Email: ${u.email.padEnd(25)} | Password: ${u.password}`);
    });
    console.log('============================================\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seedDB();
