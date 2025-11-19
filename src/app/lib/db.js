// /lib/db.js
import mongoose from "mongoose";

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;

  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

    if (!uri) {
      throw new Error(
        "Missing Mongo connection string. Set MONGO_URI or MONGODB_URI."
      );
    }

    await mongoose.connect(uri);
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}
