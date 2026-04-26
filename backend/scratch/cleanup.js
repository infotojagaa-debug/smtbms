const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const User = require('../models/User');

async function cleanData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/smtbms_prod');
    console.log('Connected to DB');

    const user = await User.findOne({ name: /Field/i });
    if (!user) {
      console.log('User Field not found');
      process.exit(0);
    }

    const emp = await Employee.findOne({ userId: user._id });
    if (!emp) {
      console.log('Employee profile not found');
      process.exit(0);
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const res = await Attendance.deleteMany({
      employeeId: emp._id,
      $or: [
        { date: { $gte: todayStart } },
        { createdAt: { $gte: todayStart } }
      ]
    });

    console.log(`Successfully deleted ${res.deletedCount} attendance records for today.`);
    process.exit(0);
  } catch (err) {
    console.error('Cleanup Error:', err);
    process.exit(1);
  }
}

cleanData();
