import mongoose from "mongoose";

export async function connectDB() {
  try {
    if (mongoose.connection.readyState === 1) return;

    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "Rc"
    });

    console.log("Connected DB:", mongoose.connection.name);
  } catch (err) {
    console.log("MongoDB error:", err);
  }
}
