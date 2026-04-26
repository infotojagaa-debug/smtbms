const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const connectDB = require('./config/db');

const { initialiseSocket } = require('./socket/socket');

// Load environment variables
dotenv.config();

// Connect to MongoDB Database
connectDB();

// Initialize Automated Executive Summaries
const initCronJobs = require('./utils/cronJobs');
initCronJobs();

const app = express();
const server = http.createServer(app);

// Initialize specialised Socket.io instance
const io = initialiseSocket(server);

// Attach Socket.io to app for global accessibility
app.set('io', io);

/* =========================================
   MISSION-CRITICAL SECURITY MIDDLEWARE
   ========================================= */
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
app.use(compression());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  message: 'Too many requests from this IP node, please attempt sequence again in 15 minutes.'
});
app.use('/api', limiter);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Socket.io logic is handled in ./socket/socket.js

const path = require('path');

// Default Health Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', node: 'SMTBMS Framework v6.0', timestamp: new Date(), debug: 'ANTIGRAVITY_ACTIVE_V1' });
});

// Serve Local Uploads Vector
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Primary Enterprise Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/materials/activity', require('./routes/materialActivityRoutes'));
app.use('/api/materials', require('./routes/materialRoutes'));
app.use('/api/movements', require('./routes/movementRoutes'));

// Workforce Routes (HRMS)
app.use('/api/hr', require('./routes/hrRoutes'));
app.use('/api/erp', require('./routes/erpRoutes'));
app.use('/api/crm', require('./routes/crmRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/customer', require('./routes/customerRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/audit', require('./routes/auditRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/field-audit', require('./routes/fieldAuditRoutes'));

// Standalone Inventory Domain (ATUM Clone)
app.use('/api/inventory', require('./modules/inventory/routes/inventoryRoutes'));

// Standalone Admin Dashboard (Inven style)
app.use('/api/admin-dash', require('./modules/adminDashboard/routes/adminStatsRoutes'));

// Error handling sentinel
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Enterprise Operational Node active in ${process.env.NODE_ENV || 'development'} sequence on port ${PORT}`);
});

module.exports = { app, server, io };
