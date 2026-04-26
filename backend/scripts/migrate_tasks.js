const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Task = require('../models/Task');

const migrateTasks = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to Workforce Matrix for Data Migration...');

    const tasks = await Task.find({});
    console.log(`Analyzing ${tasks.length} objectives...`);

    let updatedCount = 0;
    for (const task of tasks) {
      let needsUpdate = false;

      // 1. Convert assignedTo from single ObjectId to Array if necessary
      if (task.assignedTo && !Array.isArray(task.assignedTo)) {
        const oldId = task.assignedTo;
        task.assignedTo = [{ 
          user: oldId, 
          status: task.status || 'Pending',
          progressNotes: task.progressNotes || '',
          updatedAt: new Date()
        }];
        needsUpdate = true;
      } else if (!task.assignedTo || task.assignedTo.length === 0) {
          // If unassigned, ensure it's at least an empty array or self-assigned
          task.assignedTo = [{ user: task.user, status: 'Pending' }];
          needsUpdate = true;
      }

      // 2. Harmonize Priority (Convert P1/P2/P3 to High/Medium/Low)
      if (task.priority === 'P1') { task.priority = 'High'; needsUpdate = true; }
      else if (task.priority === 'P2') { task.priority = 'Medium'; needsUpdate = true; }
      else if (task.priority === 'P3') { task.priority = 'Low'; needsUpdate = true; }
      else if (!['High', 'Medium', 'Low'].includes(task.priority)) {
        task.priority = 'Medium'; // Default fallback
        needsUpdate = true;
      }

      // 3. Ensure assignedBy exists
      if (!task.assignedBy) {
        task.assignedBy = task.user;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await task.save();
        updatedCount++;
      }
    }

    console.log(`Migration Complete. ${updatedCount} missions synchronized with the Unified Command architecture.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration Failed:', error.message);
    process.exit(1);
  }
};

migrateTasks();
