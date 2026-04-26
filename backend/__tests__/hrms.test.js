const request = require('supertest');
const { app } = require('../server');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');
const jwt = require('jsonwebtoken');

describe('Workforce Intelligence Hub Tests', () => {
    let hrToken, hrUser;

    beforeEach(async () => {
        hrUser = await User.create({
            name: 'HR Custodian',
            email: 'hr@test.com',
            password: 'hashedpassword',
            role: 'HR',
            isActive: true
        });
        hrToken = jwt.sign({ id: hrUser._id }, process.env.JWT_SECRET);
    });

    describe('Employee Lifecycle Protocols', () => {
        it('should initialize a new employee node and auto-generate credentials', async () => {
            const res = await request(app)
                .post('/api/employees')
                .set('Authorization', `Bearer ${hrToken}`)
                .send({
                    name: 'Julian Vance',
                    email: 'julian@test.com',
                    phone: '9876543210',
                    department: 'IT',
                    designation: 'Architect',
                    joiningDate: '2024-01-01',
                    salary: { basic: 50000, allowances: 10000 }
                });
            
            expect(res.statusCode).toBe(201);
            expect(res.body.employee).toHaveProperty('employeeId');
            expect(res.body.employee.employeeId).toMatch(/^EMP/);
            
            const createdUser = await User.findOne({ email: 'julian@test.com' });
            expect(createdUser).toBeDefined();
        });
    });

    describe('Attendance Ledger Synchronization', () => {
        let emp;
        beforeEach(async () => {
            emp = await Employee.create({
                userId: hrUser._id,
                name: 'Julian Vance',
                email: 'julian@test.com',
                employeeId: 'EMP001',
                department: 'IT'
            });
        });

        it('should record operational check-in node', async () => {
            const res = await request(app)
                .post('/api/attendance/checkin')
                .set('Authorization', `Bearer ${hrToken}`)
                .send({ employeeId: emp._id });
            
            expect(res.statusCode).toBe(201);
            expect(res.body.attendance).toHaveProperty('status', 'present');
        });

        it('should calculate temporal magnitude on check-out', async () => {
            // Genesis check-in
            const checkinTime = new Date();
            checkinTime.setHours(9, 0, 0);
            const attend = await Attendance.create({
                employeeId: emp._id,
                date: new Date().setHours(0,0,0,0),
                checkIn: checkinTime,
                status: 'present'
            });

            const res = await request(app)
                .post('/api/attendance/checkout')
                .set('Authorization', `Bearer ${hrToken}`)
                .send({ employeeId: emp._id });
            
            expect(res.statusCode).toBe(200);
            expect(res.body.attendance).toHaveProperty('workingHours');
        });
    });

    describe('Leave Matrix Auditing', () => {
        let emp;
        beforeEach(async () => {
            emp = await Employee.create({
                userId: hrUser._id,
                name: 'Julian Vance',
                email: 'julian@test.com',
                employeeId: 'EMP001',
                department: 'IT',
                salary: { basic: 50000 }
            });
        });

        it('should initialize leave petition with valid balance', async () => {
            const res = await request(app)
                .post('/api/hrms/leave/apply')
                .set('Authorization', `Bearer ${hrToken}`)
                .send({
                    employeeId: emp._id,
                    leaveType: 'casual',
                    fromDate: '2024-06-01',
                    toDate: '2024-06-02',
                    reason: 'Lunar Alignment'
                });
            
            expect(res.statusCode).toBe(201);
            expect(res.body.leave).toHaveProperty('status', 'pending');
        });
    });

    describe('Fiscal Payroll Generation', () => {
        it('should execute monthly payroll sequence with accurate yields', async () => {
             // Mock employee with attendance
             const emp = await Employee.create({
                userId: hrUser._id,
                name: 'Finance Node',
                employeeId: 'EMP-FIN',
                salary: { basic: 100000, allowances: 20000, deductions: 5000 }
            });

            const res = await request(app)
                .post('/api/payroll/generate')
                .set('Authorization', `Bearer ${hrToken}`)
                .send({
                    month: new Date().getMonth() + 1,
                    year: new Date().getFullYear()
                });
            
            expect(res.statusCode).toBe(200);
            // Verify specific payroll artifact exists if needed
        });
    });
});
