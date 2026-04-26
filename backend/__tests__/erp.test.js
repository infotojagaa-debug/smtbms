const request = require('supertest');
const { app } = require('../server');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const PurchaseOrder = require('../models/PurchaseOrder');
const Invoice = require('../models/Invoice');
const Material = require('../models/Material');
const jwt = require('jsonwebtoken');

describe('ERP Operational Matrix Tests', () => {
    let managerToken, managerUser;

    beforeEach(async () => {
        managerUser = await User.create({
            name: 'Procurement Manager',
            email: 'procure@test.com',
            password: 'hashedpassword',
            role: 'Manager',
            isActive: true
        });
        managerToken = jwt.sign({ id: managerUser._id }, process.env.JWT_SECRET);
    });

    describe('Vendor Stakeholder Management', () => {
        it('should initialize a new vendor node with unique tax credentials', async () => {
            const res = await request(app)
                .post('/api/erp/vendors')
                .set('Authorization', `Bearer ${managerToken}`)
                .send({
                    name: 'Steel Industries Ltd',
                    email: 'sales@steel.com',
                    phone: '1234567890',
                    gstNumber: '29AAAAA0000A1Z5',
                    category: 'raw-material',
                    address: { city: 'Bangalore', state: 'Karnataka' }
                });
            
            expect(res.statusCode).toBe(201);
            expect(res.body.vendor).toHaveProperty('vendorId');
            expect(res.body.vendor.vendorId).toMatch(/^VEN/);
        });
    });

    describe('Procurement Lifecycle (PO)', () => {
        let vendor, material;
        beforeEach(async () => {
            vendor = await Vendor.create({ name: 'Test Vendor', email: 'v@t.com', vendorId: 'VEN001', gstNumber: 'X' });
            material = await Material.create({ name: 'Steel', code: 'S1', quantity: 0, minStockLevel: 10 });
        });

        it('should initialize a Purchase Order with accurate fiscal calculations', async () => {
            const res = await request(app)
                .post('/api/erp/po')
                .set('Authorization', `Bearer ${managerToken}`)
                .send({
                    vendorId: vendor._id,
                    items: [{
                        materialId: material._id,
                        itemName: 'Steel',
                        quantity: 100,
                        unit: 'kg',
                        unitPrice: 50
                    }],
                    taxPercentage: 18,
                    shippingCharges: 500
                });
            
            expect(res.statusCode).toBe(201);
            // Verify total: (100*50) + 18% + 500 = 5000 + 900 + 500 = 6400
            expect(res.body.po.totalAmount).toBe(6400);
        });
    });

    describe('Inventory Ingress (GRN)', () => {
        let po, material;
        beforeEach(async () => {
            const vendor = await Vendor.create({ name: 'V', email: 'V@V.com' });
            material = await Material.create({ name: 'S', code: 'S', quantity: 10 });
            po = await PurchaseOrder.create({
                poNumber: 'PO-001',
                vendorId: vendor._id,
                items: [{ materialId: material._id, itemName: 'S', quantity: 50, unit: 'kg', unitPrice: 10 }],
                totalAmount: 500,
                status: 'sent'
            });
        });

        it('should update material inventory upon goods reception (GRN)', async () => {
            const res = await request(app)
                .post(`/api/erp/po/${po._id}/receive`)
                .set('Authorization', `Bearer ${managerToken}`)
                .send({
                    receivedItems: [{
                        materialId: material._id,
                        quantityReceived: 50
                    }],
                    receivedDate: new Date()
                });
            
            expect(res.statusCode).toBe(200);
            
            const updatedMat = await Material.findById(material._id);
            expect(updatedMat.quantity).toBe(60); // 10 original + 50 received
        });
    });

    describe('Fiscal Fulfillment (Invoice & Payment)', () => {
        it('should record payment and update invoice state auditing', async () => {
            const inv = await Invoice.create({
                invoiceNumber: 'INV-001',
                totalAmount: 1000,
                status: 'pending',
                dueDate: new Date(Date.now() + 86400000)
            });

            const res = await request(app)
                .post(`/api/erp/invoices/${inv._id}/payments`)
                .set('Authorization', `Bearer ${managerToken}`)
                .send({
                    amount: 1000,
                    paymentMethod: 'Bank Transfer'
                });
            
            expect(res.statusCode).toBe(200);
            expect(res.body.invoice.status).toBe('paid');
        });
    });
});
