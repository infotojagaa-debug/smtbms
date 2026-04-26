const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const attendanceSchema = new mongoose.Schema({
  employeeId: mongoose.Schema.Types.ObjectId,
  date: Date,
  status: String,
  checkIn: Date
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

async function checkData() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/smtbm';
    console.log('Connecting to:', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('Connected to DB');
    
    const count = await Attendance.countDocuments();
    console.log(`Total Attendance Records: ${count}`);
    
    const last3Days = new Date();
    last3Days.setDate(last3Days.getDate() - 3);
    
    const recent = await Attendance.find({ date: { $gte: last3Days } }).limit(20);
    console.log(`Records in last 3 days: ${recent.length}`);
    recent.forEach(r => {
      console.log(` - Emp: ${r.employeeId}, Date: ${r.date?.toISOString()}, Status: ${r.status}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkData();
