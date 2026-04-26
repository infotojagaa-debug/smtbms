const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const User = require('../backend/models/User');

async function checkUserRole() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smtbm');
    console.log('Connected to DB');
    
    const user = await User.findOne({ email: 'employee@smtbms.com' });
    if (user) {
      console.log('User Account:', user.email);
      console.log('Role found in DB:', `'${user.role}'`); // Wrapped in quotes to see spaces
    } else {
      console.log('User not found!');
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkUserRole();
