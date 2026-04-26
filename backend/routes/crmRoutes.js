const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

const {
  createCustomer,
  getAllCustomers,
  getCustomerStats,
  getCustomerById,
  getCustomerTimeline,
  updateCustomer,
} = require('../controllers/customerController');

const {
  createLead,
  getAllLeads,
  getLeadPipeline,
  getLeadStats,
  getLeadById,
  updateLeadStatus,
  convertLead
} = require('../controllers/leadController');

const {
  logCommunication,
  getAllCommunications,
  getSummary: getCommSummary
} = require('../controllers/communicationController');

const {
  createDeal,
  updateDeal,
  getAllDeals,
  getDealStats,
  getDealById,
  updateDealStage,
  closeDeal
} = require('../controllers/dealController');

const {
  createActivity,
  getAllActivities,
  getTodayActivities,
  getOverdueActivities,
  completeActivity
} = require('../controllers/activityController');

const {
  createTicket,
  getAllTickets,
  getTicketStats,
  getTicketById,
  addComment,
  resolveTicket
} = require('../controllers/ticketController');

// --- Customers ---
router.post('/customers', protect, createCustomer);
router.get('/customers', protect, getAllCustomers);
router.get('/customers/stats', protect, authorize('Admin', 'Manager'), getCustomerStats);
router.get('/customers/:id', protect, getCustomerById);
router.get('/customers/:id/timeline', protect, getCustomerTimeline);
router.put('/customers/:id', protect, updateCustomer);

// --- Leads ---
router.post('/leads', protect, createLead);
router.get('/leads', protect, getAllLeads);
router.get('/leads/pipeline', protect, getLeadPipeline);
router.get('/leads/stats', protect, getLeadStats);
router.get('/leads/:id', protect, getLeadById);
router.put('/leads/:id/status', protect, updateLeadStatus);
router.post('/leads/:id/convert', protect, convertLead);

// --- Communications ---
router.post('/communications', protect, logCommunication);
router.get('/communications', protect, getAllCommunications);
router.get('/communications/summary', protect, getCommSummary);

// --- Deals ---
router.post('/deals', protect, createDeal);
router.get('/deals', protect, getAllDeals);
router.get('/deals/stats', protect, getDealStats);
router.get('/deals/:id', protect, getDealById);
router.put('/deals/:id', protect, updateDeal);
router.put('/deals/:id/stage', protect, updateDealStage);
router.put('/deals/:id/close', protect, closeDeal);

// --- Activities ---
router.post('/activities', protect, createActivity);
router.get('/activities', protect, getAllActivities);
router.get('/activities/today', protect, getTodayActivities);
router.get('/activities/overdue', protect, getOverdueActivities);
router.put('/activities/:id/complete', protect, completeActivity);

// --- Tickets ---
router.post('/tickets', protect, createTicket);
router.get('/tickets', protect, getAllTickets);
router.get('/tickets/stats', protect, getTicketStats);
router.get('/tickets/:id', protect, getTicketById);
router.post('/tickets/:id/comment', protect, addComment);
router.put('/tickets/:id/resolve', protect, resolveTicket);

module.exports = router;
