const request = require('supertest');
const { app } = require('../server');
const User = require('../models/User');
const Material = require('../models/Material');
const MaterialMovement = require('../models/MaterialMovement');
const jwt = require('jsonwebtoken');

describe('Material Ledger Protocols', () => {
    let adminToken, employeeToken, adminUser, employeeUser;

    beforeEach(async () => {
        adminUser = await User.create({
            name: 'Admin Custodian',
            email: 'admin@test.com',
            password: 'hashedpassword',
            role: 'Admin',
            isActive: true
        });
        employeeUser = await User.create({
            name: 'Employee Node',
            email: 'worker@test.com',
            password: 'hashedpassword',
            role: 'Employee',
            isActive: true
        });

        adminToken = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET);
        employeeToken = jwt.sign({ id: employeeUser._id }, process.env.JWT_SECRET);
    });

    describe('POST /api/materials', () => {
        it('should allow Admin to initialize new material nodes', async () => {
            const res = await request(app)
                .post('/api/materials')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Chrome Alloy Rod',
                    code: 'MAT-CR-001',
                    category: 'Raw Material',
                    unit: 'pcs',
                    quantity: 100,
                    minStockLevel: 20,
                    department: 'Production',
                    location: 'Shelf A1'
                });
            
            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('qrCode');
            expect(res.body).toHaveProperty('barcodeImage');
        });

        it('should forbid Employee from material node initialization', async () => {
            const res = await request(app)
                .post('/api/materials')
                .set('Authorization', `Bearer ${employeeToken}`)
                .send({ name: 'Illegal Node' });
            
            expect(res.statusCode).toBe(403);
        });
    });

    describe('GET /api/materials', () => {
        beforeEach(async () => {
            await Material.create([
                { name: 'Steel Sheet', code: 'ST-01', category: 'Raw', unit: 'kg', quantity: 50, minStockLevel: 10, department: 'Production' },
                { name: 'Copper Wire', code: 'CW-02', category: 'Electrical', unit: 'm', quantity: 200, minStockLevel: 50, department: 'Maintenance' }
            ]);
        });

        it('should return paginated material registries', async () => {
            const res = await request(app)
                .get('/api/materials')
                .set('Authorization', `Bearer ${adminToken}`);
            
            expect(res.statusCode).toBe(200);
            expect(res.body.materials).toHaveLength(2);
            expect(res.body).toHaveProperty('pages');
        });

        it('should filter registries by categorical node', async () => {
            const res = await request(app)
                .get('/api/materials?category=Raw')
                .set('Authorization', `Bearer ${adminToken}`);
            
            expect(res.body.materials).toHaveLength(1);
            expect(res.body.materials[0].name).toBe('Steel Sheet');
        });
    });

    describe('POST /api/materials/transfer', () => {
        let mat;
        beforeEach(async () => {
            mat = await Material.create({
                name: 'Fuel Cell',
                code: 'FC-99',
                category: 'Equipment',
                unit: 'units',
                quantity: 10,
                minStockLevel: 2,
                department: 'Logistics'
            });
        });

        it('should execute valid material flux between departments', async () => {
            const res = await request(app)
                .post('/api/materials/transfer')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    materialId: mat._id,
                    quantity: 5,
                    fromDepartment: 'Logistics',
                    toDepartment: 'Production',
                    reason: 'Operational Requirement'
                });
            
            expect(res.statusCode).toBe(200);
            
            const updatedMat = await Material.findById(mat._id);
            expect(updatedMat.quantity).toBe(5);
            
            const movement = await MaterialMovement.findOne({ materialId: mat._id });
            expect(movement).toBeDefined();
            expect(movement.toDepartment).toBe('Production');
        });

        it('should reject flux exceeding available magnitude', async () => {
            const res = await request(app)
                .post('/api/materials/transfer')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    materialId: mat._id,
                    quantity: 100,
                    fromDepartment: 'Logistics',
                    toDepartment: 'Production'
                });
            
            expect(res.statusCode).toBe(400);
        });
    });
});
