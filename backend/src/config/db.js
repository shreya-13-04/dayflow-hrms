const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dayflow_hrms';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 1000,
    });
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[MongoDB Warning] Could not connect to database (${error.message}). Continuing API server startup.`);
    return null;
  }
};

module.exports = connectDB;
