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
      console.log('Admin user exists. Overwriting password to "admin123"...');
      adminExists.password = 'admin123';
      await adminExists.save();
      console.log('Admin password reset successfully.');
    } else {
      const admin = new User({
        name: 'System Admin',
        email: 'admin@smtbms.com',
        password: 'admin123',
        role: 'Admin',
        status: 'Active'
      });
      await admin.save();
      console.log('New Admin user created with password "admin123".');
    }

    process.exit();
  } catch (error) {
    console.error('Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();
