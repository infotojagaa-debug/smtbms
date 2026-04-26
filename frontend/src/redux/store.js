import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import materialReducer from './slices/materialSlice';
import hrmsReducer from './slices/hrmsSlice';
import hrReducer from './slices/hrSlice';
import erpReducer from './slices/erpSlice';
import crmReducer from './slices/crmSlice';
import analyticsReducer from './slices/analyticsSlice';
import notificationReducer from './slices/notificationSlice';
import socketReducer from './slices/socketSlice';
import activityReducer from './slices/activitySlice';
import customerReducer from './slices/customerSlice';
import leadReducer from './slices/leadSlice';
import dealReducer from './slices/dealSlice';
import ticketReducer from './slices/ticketSlice';
import vendorReducer from './slices/vendorSlice';
import purchaseOrderReducer from './slices/purchaseOrderSlice';
import invoiceReducer from './slices/invoiceSlice';
import paymentReducer from './slices/paymentSlice';
import budgetReducer from './slices/budgetSlice';
import communicationReducer from './slices/communicationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    material: materialReducer,
    hrms: hrmsReducer,
    hr: hrReducer,
    erp: erpReducer,
    crm: crmReducer,
    analytics: analyticsReducer,
    notifications: notificationReducer,
    socket: socketReducer,
    activities: activityReducer,
    customers: customerReducer,
    leads: leadReducer,
    deals: dealReducer,
    tickets: ticketReducer,
    vendors: vendorReducer,
    purchaseOrders: purchaseOrderReducer,
    invoices: invoiceReducer,
    payments: paymentReducer,
    budgets: budgetReducer,
    communications: communicationReducer,
  },
});
