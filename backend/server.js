require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const autoSeed = async () => {
  try {
    const User = require('./models/User');
    const count = await User.countDocuments();
    if (count === 0) {
      console.log('🌱 No users found — running auto-seed...');
      // Dynamic require so seed only runs when needed
      const { seedDatabase } = require('./seed');
      await seedDatabase();
    }
  } catch (err) {
    console.warn('⚠️  Auto-seed skipped:', err.message);
  }
};

const startServer = async () => {
  await connectDB();
  await autoSeed();
  app.listen(PORT, () => {
    console.log(`🚀 LeadFlow CRM API running on http://localhost:${PORT} [${process.env.NODE_ENV || 'development'}]`);
    console.log(`   Admin: admin@leadflow.com / password123`);
    console.log(`   Member: john@leadflow.com / password123`);
  });
};

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
