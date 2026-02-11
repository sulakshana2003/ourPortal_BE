import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import dns from "dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]); // try Cloudflare + Google

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("💕 MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
