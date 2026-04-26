const mongoose = require('mongoose');
const Attendance = require('./backend/models/Attendance');
const Employee = require('./backend/models/Employee');
require('dotenv').config({ path: './backend/.env' });

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smtbm');
    console.log('Connected to DB');
    
    const employees = await Employee.find();
    console.log(`Found ${employees.length} employees`);
    
    for (const emp of employees) {
      const records = await Attendance.find({ employeeId: emp._id }).sort({ date: -1 }).limit(10);
      console.log(`Employee: ${emp.name} (${emp._id}) - ${records.length} records`);
      records.forEach(r => {
        console.log(` - Date: ${r.date.toISOString()}, Status: ${r.status}, CheckIn: ${r.checkIn}`);
      });
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkData();
