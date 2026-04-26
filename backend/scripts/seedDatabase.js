require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Models
const User = require('../models/User');
const Material = require('../models/Material');
const Employee = require('../models/Employee');
const Customer = require('../models/Customer');

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Operational node linked. Initiating Enterprise Data Mock Sequence...');

    // Clear existing data (use cautiously)
    await User.deleteMany({});
    await Material.deleteMany({});
    await Employee.deleteMany({});
    await Customer.deleteMany({});

    // 1. Roles & Stakeholders
    const hashedPassword = await bcrypt.hash('Password@123', 12);
    
    const admin = await User.create({ name: 'System Admin', email: 'admin@smtbms.com', password: hashedPassword, role: 'Admin', isActive: true });
    const hrManager = await User.create({ name: 'HR Manager', email: 'hr@smtbms.com', password: hashedPassword, role: 'HR', isActive: true });
    const salesExec = await User.create({ name: 'Sales Executive', email: 'sales@smtbms.com', password: hashedPassword, role: 'Sales', isActive: true });
    
    // 2. Material Registry Mock Flux
    await Material.create([
      { name: 'Titanium Framework', code: 'TF-01', category: 'Raw Material', unit: 'pcs', quantity: 450, minStockLevel: 50, department: 'Production' },
      { name: 'Lithium Core', code: 'LC-99', category: 'Energy', unit: 'kg', quantity: 15, minStockLevel: 20, department: 'Assembly' } // Low stock logic
    ]);

    // 3. HRMS Node Initialization
    await Employee.create([
       { userId: admin._id, name: 'System Admin', employeeId: 'EMP001', email: 'admin@smtbms.com', department: 'Executive', joiningDate: new Date(), designation: 'CTO' },
       { userId: hrManager._id, name: 'HR Manager', employeeId: 'EMP002', email: 'hr@smtbms.com', department: 'Human Resources', joiningDate: new Date(), designation: 'Director of Talent' }
    ]);

    // 4. CRM Artifact Generation
    await Customer.create([
       { 
         name: 'Enterprise Apex', 
         email: 'apex@enterprise.com', 
         company: 'Apex Corporation',
         customerId: 'CUS-APEX-01',
         industry: 'manufacturing'
       }
    ]);

    console.log('\n--- SUCCESS: ENTERPRISE DATA MOCK SEQUENCE COMPLETED ---');
    console.log('The SMTBMS architecture is now hydrated with operational testing artifacts.');
    process.exit(0);
  } catch (error) {
    console.error('SYSTEM FAILURE: Unable to hydrate operational nodes.', error);
    process.exit(1);
  }
}

seedDatabase();
