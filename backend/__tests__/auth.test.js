const request = require('supertest');
const { app } = require('../server');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('Auth Matrix Protocols', () => {
    let testUser;

    beforeEach(async () => {
        const hashedPassword = await bcrypt.hash('Password@123', 12);
        testUser = await User.create({
            name: 'Test Operational Node',
            email: 'test@smtbms.com',
            password: hashedPassword,
            role: 'Admin',
            isActive: true
        });
    });

    describe('POST /api/auth/login', () => {
        it('should verify valid credentials and return JWT token', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@smtbms.com',
                    password: 'Password@123'
                });
            
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('token');
            expect(res.body.user).toHaveProperty('email', 'test@smtbms.com');
        });

        it('should reject wrong password with 401 unauthorized', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@smtbms.com',
                    password: 'WrongPassword'
                });
            
            expect(res.statusCode).toBe(401);
            expect(res.body.message).toMatch(/Invalid email or password/i);
        });

        it('should reject non-existent email with 401 unauthorized', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'ghost@smtbms.com',
                    password: 'Password@123'
                });
            
            expect(res.statusCode).toBe(401);
        });

        it('should reject missing fields with 400 validation error', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@smtbms.com'
                });
            
            expect(res.statusCode).toBe(400);
        });
    });

    describe('JWT Middleware & RBAC Protocols', () => {
        it('should grant ingress with valid token', async () => {
            const token = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            
            // Assuming /api/auth/me is a protected route
            const res = await request(app)
                .get('/api/auth/profile')
                .set('Authorization', `Bearer ${token}`);
            
            expect(res.statusCode).toBe(200);
        });

        it('should reject requests without a token hub', async () => {
            const res = await request(app).get('/api/auth/profile');
            expect(res.statusCode).toBe(401);
        });

        it('should reject expired tokens', async () => {
            const token = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET, { expiresIn: '-1h' });
            const res = await request(app)
                .get('/api/auth/profile')
                .set('Authorization', `Bearer ${token}`);
            
            expect(res.statusCode).toBe(401);
        });
    });

    describe('POST /api/auth/change-password', () => {
        it('should update password with correct current credentials', async () => {
            const token = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            const res = await request(app)
                .post('/api/auth/change-password')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    currentPassword: 'Password@123',
                    newPassword: 'NewPassword@456'
                });
            
            expect(res.statusCode).toBe(200);
            
            const updatedUser = await User.findById(testUser._id);
            const isMatch = await bcrypt.compare('NewPassword@456', updatedUser.password);
            expect(isMatch).toBe(true);
        });

        it('should reject incorrect current password with 400 error', async () => {
            const token = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            const res = await request(app)
                .post('/api/auth/change-password')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    currentPassword: 'WrongPassword',
                    newPassword: 'NewPassword@456'
                });
            
            expect(res.statusCode).toBe(400);
        });
    });
});
