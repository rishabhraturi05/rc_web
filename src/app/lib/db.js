import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not configured in environment variables");
}

/** Reuse connection across Next.js hot reloads */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: "Rc",
        bufferCommands: false,
        serverSelectionTimeoutMS: 15000,
        family: 4,
      })
      .then((mongooseInstance) => {
        console.log("Connected DB:", mongooseInstance.connection.name);
        return mongooseInstance;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    console.error("MongoDB connection error:", err.message);
    throw err;
  }

  return cached.conn;
}
