import mongoose from "mongoose";
import dns from "node:dns";

// Fix for Node.js "querySrv ECONNREFUSED" on networks/ISPs that fail DNS SRV records
try {
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
} catch (err) {
  // Ignored in restricted environments
}

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
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise || mongoose.connection.readyState === 0) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 15000,
      maxPoolSize: 10,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        console.log("[MongoDB] Connected successfully to DB:", mongooseInstance.connection.name);
        return mongooseInstance;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    cached.conn = null;
    console.error("[MongoDB] Connection error:", err.message);
    throw err;
  }

  return cached.conn;
}
