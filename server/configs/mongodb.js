import mongoose from 'mongoose';
import dns from 'node:dns';

// Force Node to use IPv4 lookup first - fixes Vercel's ENOTFOUND issue
dns.setDefaultResultOrder('ipv4first');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
  }
};

export default connectDB;