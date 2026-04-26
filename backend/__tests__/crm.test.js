const request = require('supertest');
const { app } = require('../server');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const Deal = require('../models/Deal');
const Ticket = require('../models/Ticket');
const jwt = require('jsonwebtoken');

describe('CRM Stakeholder Engagement Tests', () => {
    let salesToken, salesUser;

    beforeEach(async () => {
        salesUser = await User.create({
            name: 'Sales Rep',
            email: 'sales@test.com',
            password: 'hashedpassword',
            role: 'Sales',
            isActive: true
        });
        salesToken = jwt.sign({ id: salesUser._id }, process.env.JWT_SECRET);
    });

    describe('Customer Acquisition Node', () => {
        it('should initialize a new customer stakeholder with auto-generated ID', async () => {
            const res = await request(app)
                .post('/api/crm/customers')
                .set('Authorization', `Bearer ${salesToken}`)
                .send({
                    name: 'Global Corp',
                    email: 'contact@global.com',
                    phone: '1122334455',
                    company: 'Global Industries',
                    industry: 'manufacturing',
                    customerType: 'corporate'
                });
            
            expect(res.statusCode).toBe(201);
            expect(res.body.customer).toHaveProperty('customerId');
            expect(res.body.customer.customerId).toMatch(/^CUS/);
        });
    });

    describe('Lead Discovery & Pipeline Flux', () => {
        let customer;
        beforeEach(async () => {
            customer = await Customer.create({ name: 'T', email: 'T@T.com', company: 'T' });
        });

        it('should initialize a lead artifact and verify pipeline magnitude', async () => {
            const res = await request(app)
                .post('/api/crm/leads')
                .set('Authorization', `Bearer ${salesToken}`)
                .send({
                    title: 'Strategic Expansion Project',
                    customerId: customer._id,
                    value: 500000,
                    currency: 'INR',
                    priority: 'high',
                    status: 'new'
                });
            
            expect(res.statusCode).toBe(201);
            expect(res.body.lead).toHaveProperty('leadId');
            expect(res.body.lead.leadId).toMatch(/^LED/);
        });

        it('should return aggregated pipeline telemetry', async () => {
            await Lead.create({ title: 'L1', customerId: customer._id, status: 'negotiation', value: 1000 });
            await Lead.create({ title: 'L2', customerId: customer._id, status: 'proposal-sent', value: 2000 });

            const res = await request(app)
                .get('/api/crm/leads/pipeline')
                .set('Authorization', `Bearer ${salesToken}`);
            
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('negotiation');
            expect(res.body.negotiation.count).toBe(1);
        });
    });

    describe('Deal Settlement Lifecycle', () => {
        it('should convert a won lead node into a strategic deal artifact', async () => {
            const customer = await Customer.create({ name: 'C', email: 'C@C.com' });
            const lead = await Lead.create({ 
                title: 'Target Lead', 
                customerId: customer._id, 
                status: 'qualified', 
                value: 10000 
            });

            const res = await request(app)
                .post(`/api/crm/leads/${lead._id}/convert`)
                .set('Authorization', `Bearer ${salesToken}`)
                .send({
                    dealName: 'Expansion Deal Alpha',
                    expectedCloseDate: new Date()
                });
            
            expect(res.statusCode).toBe(201);
            expect(res.body.deal).toHaveProperty('dealId');
            
            const updatedLead = await Lead.findById(lead._id);
            expect(updatedLead.status).toBe('won');
        });
    });

    describe('Service Support & Ticket Forensics', () => {
        it('should initialize a support ticket and track resolution state', async () => {
            const customer = await Customer.create({ name: 'C', email: 'C@C.com' });
            const res = await request(app)
                .post('/api/crm/tickets')
                .set('Authorization', `Bearer ${salesToken}`)
                .send({
                    customerId: customer._id,
                    subject: 'Grid Failure Protocol',
                    description: 'Primary power node unresponsive',
                    priority: 'urgent',
                    category: 'technical'
                });
            
            expect(res.statusCode).toBe(201);
            expect(res.body.ticket).toHaveProperty('ticketId');
            expect(res.body.ticket.status).toBe('open');
        });
    });
});
