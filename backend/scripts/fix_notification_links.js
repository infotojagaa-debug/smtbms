const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Notification = require('../models/Notification');

const fixLinks = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to Intelligence Hub...');

    // Fix manager task links
    const result1 = await Notification.updateMany(
      { link: '/manager/tasks' },
      { $set: { link: '/manager/task-assign' } }
    );
    console.log(`Updated ${result1.modifiedCount} manager task links.`);

    // Fix any empty/null links to at least go to notification center if that's what the user prefers
    // But usually we leave them. The user specifically said "i want direct to the notification features".
    // If they click a notification and it has no link, let's make it go to /notifications.
    const result2 = await Notification.updateMany(
      { link: { $in: [null, '/', ''] } },
      { $set: { link: '/notifications' } }
    );
    console.log(`Updated ${result2.modifiedCount} generic links to point to Notification Center.`);

    console.log('Operational synchronization complete.');
    process.exit(0);
  } catch (error) {
    console.error('Synchronization Failed:', error.message);
    process.exit(1);
  }
};

fixLinks();
