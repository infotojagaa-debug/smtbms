import { rest } from 'msw';

const API_URL = 'http://localhost:5000/api';

export const handlers = [
  // Authentication Mock Protocols
  rest.post(`${API_URL}/auth/login`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        token: 'mock_jwt_artifact_sequence',
        user: { name: 'Julian Vance', role: 'Admin', email: 'admin@test.com' }
      })
    );
  }),

  // Material Registry Mock Protocols
  rest.get(`${API_URL}/materials`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        materials: [
          { _id: '1', name: 'Chrome Alloy Rod', code: 'MAT-001', quantity: 100, unit: 'pcs', category: 'Raw' },
          { _id: '2', name: 'Steel Sheet', code: 'MAT-002', quantity: 50, unit: 'kg', category: 'Raw' }
        ],
        pages: 1
      })
    );
  }),

  // Workforce Hub Mock Protocols
  rest.get(`${API_URL}/employees`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { _id: 'e1', name: 'Sarah Jenkins', employeeId: 'EMP001', department: 'IT', photo: '' },
        { _id: 'e2', name: 'Mark Sterling', employeeId: 'EMP002', department: 'HR', photo: '' }
      ])
    );
  }),

  // CRM Stakeholder Mock Protocols
  rest.get(`${API_URL}/crm/customers`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { _id: 'c1', name: 'Global Corp', company: 'Global Industries', industry: 'manufacturing' },
        { _id: 'c2', name: 'Tech Solutions', company: 'TS Inc', industry: 'IT' }
      ])
    );
  })
];
