const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas...');

    const adminExists = await User.findOne({ email: 'admin@smtbms.com' });
    if (adminExists) {
      console.log('Admin user already exists. Updating password...');
      adminExists.password = 'Admin@123';
      await adminExists.save();
      console.log('Admin password updated successfully.');
    } else {
      const admin = new User({
        name: 'System Admin',
        email: 'admin@smtbms.com',
        password: 'Admin@123',
        role: 'Admin',
        status: 'Active'
      });

      await admin.save();
      console.log('Admin user created successfully.');
    }

    process.exit();
  } catch (error) {
    console.error('Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();
