const mongoose = require('mongoose');

let _memoryServer = null;

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;

    // If no MONGODB_URI is set (local dev), spin up an in-memory MongoDB
    if (!uri) {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      _memoryServer = await MongoMemoryServer.create();
      uri = _memoryServer.getUri();
      console.log('🧪 Using in-memory MongoDB (no MONGODB_URI found in .env)');
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (_memoryServer) {
    await _memoryServer.stop();
    _memoryServer = null;
  }
};

module.exports = connectDB;
module.exports.disconnectDB = disconnectDB;
