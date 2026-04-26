const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const User = require('../backend/models/User');
const Employee = require('../backend/models/Employee');

async function debugAccess() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smtbm');
    console.log('Connected to DB');
    
    const targetEmpId = '69e46b4d258b71ac7ce38846';
    const employee = await Employee.findById(targetEmpId);
    
    if (!employee) {
       console.log('Employee not found!');
    } else {
       console.log('Target Employee:', employee.name, 'userId:', employee.userId);
       const user = await User.findById(employee.userId);
       if (user) {
         console.log('User role:', user.role, 'email:', user.email);
       } else {
         console.log('Linked User not found!');
       }
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

debugAccess();
