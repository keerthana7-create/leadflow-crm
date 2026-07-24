const connectDB = require('../config/db');
const seedData = require('../seed');
const app = require('../app');

let isReady = false;

// Wrap the app with DB initialization for serverless cold starts
const handler = async (req, res) => {
  if (!isReady) {
    try {
      await connectDB();
      // Auto-seed demo accounts if DB is empty
      const User = require('../models/User');
      const count = await User.countDocuments();
      if (count === 0) {
        await seedData.seedDatabase();
        console.log('Database seeded with demo accounts');
      }
      isReady = true;
    } catch (err) {
      console.error('DB init error:', err.message);
    }
  }
  return app(req, res);
};

module.exports = handler;
