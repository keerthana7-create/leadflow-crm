const app = require('../../backend/app');
const connectDB = require('../../backend/config/db');
const { seedDatabase } = require('../../backend/seed');

let isConnected = false;

// Middleware to ensure DB connection and seeding on Vercel Serverless
app.use(async (req, res, next) => {
  if (!isConnected) {
    try {
      await connectDB();
      const User = require('../../backend/models/User');
      const count = await User.countDocuments();
      if (count === 0) {
        await seedDatabase();
      }
      isConnected = true;
    } catch (err) {
      console.error('Serverless DB connection error:', err);
    }
  }
  next();
});

module.exports = app;
