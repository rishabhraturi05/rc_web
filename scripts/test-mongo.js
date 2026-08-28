const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const envPath = path.join(__dirname, "..", ".env.local");
const env = fs.readFileSync(envPath, "utf8");
const match = env.match(/^MONGODB_URI=(.+)$/m);
const uri = match?.[1]?.trim();

if (!uri) {
  console.log("MONGODB_URI not found in .env.local");
  process.exit(1);
}

console.log("URI host:", uri.replace(/\/\/[^:]+:[^@]+@/, "//***:***@"));

(async () => {
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
    console.log("CONNECTED db:", mongoose.connection.name);
    const cols = await mongoose.connection.db.listCollections().toArray();
    console.log("Collections:", cols.map((c) => c.name).join(", ") || "(none)");
    await mongoose.disconnect();
    process.exit(0);
  } catch (e) {
    console.log("ERROR name:", e.name);
    console.log("ERROR msg:", e.message);
    if (e.cause) console.log("CAUSE:", e.cause.message || e.cause);
    process.exit(1);
  }
})();
