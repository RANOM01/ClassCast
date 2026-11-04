import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

let isConnected = false;

// Attach persistent error handler to prevent unhandled error crashes
mongoose.connection.on('error', (err) => {
  isConnected = false;
  console.warn(`[ClassCast] MongoDB runtime notice: ${err.message}`);
});

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/classcast';
  
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[ClassCast] MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    isConnected = false;
    console.error(`[ClassCast] MongoDB connection error: ${err.message}`);
    console.warn(`[ClassCast] Ensure MONGODB_URI is set properly in server/.env (e.g. MongoDB Atlas or local MongoDB).`);
    return null;
  }
}

export function getDBStatus() {
  return {
    isConnected: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState, // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
  };
}
