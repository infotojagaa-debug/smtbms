const cron = require('node-cron');
const Attendance = require('../models/Attendance');
const { Leave } = require('../models/Leave');
const Material = require('../models/Material');
const { notifyRole } = require('../controllers/notificationController');

const initCronJobs = () => {
  // 1. DAILY SUMMARY (Every day at 6:00 PM)
  cron.schedule('0 18 * * *', async () => {
    try {
      console.log('Running Daily Executive Summary Cron...');
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const lateCount = await Attendance.countDocuments({ date: today, status: 'Late' });
      const absentCount = await Attendance.countDocuments({ date: today, status: 'Absent' });
      const leaveCount = await Leave.countDocuments({ 
        status: 'Approved',
        fromDate: { $lte: today },
        toDate: { $gte: today }
      });

      await notifyRole('Admin', {
        title: 'Daily Protocol: Workforce Summary',
        message: `Status: ${lateCount} Late, ${absentCount} Absent, ${leaveCount} on Leave today.`,
        type: 'info',
        priority: 'medium',
        module: 'hrms',
        link: '/hr/attendance'
      });
    } catch (error) {
      console.error('Daily Summary Cron Failed:', error.message);
    }
  });

  // 2. STOCK CRITICALITY SCAN (Every day at 9:00 AM)
  cron.schedule('0 9 * * *', async () => {
    try {
      console.log('Running Critical Stock Scan Cron...');
      const lowStockItems = await Material.find({ 
        $expr: { $lte: ['$quantity', '$minStockLevel'] } 
      });

      if (lowStockItems.length > 0) {
        await notifyRole('Admin', {
          title: 'Supply Chain: Stock Criticality',
          message: `Strategic Alert: ${lowStockItems.length} materials require immediate procurement.`,
          type: 'warning',
          priority: 'high',
          module: 'material',
          link: '/inventory/alerts'
        });
      }
    } catch (error) {
      console.error('Stock Scan Cron Failed:', error.message);
    }
  });

  console.log('Node-Cron Executive Layer Initialized.');
};

module.exports = initCronJobs;
