import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI|| 'mongodb://127.0.0.1:27017/staSentryPro',
      {
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 3000,
      }
    );
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`⚠️ MongoDB Connection Error: ${error.message}`);
    console.warn('Continuing without a database connection. API routes that need persistence will fail until MongoDB is available.');
    return null;
  }
};

export default connectDB;