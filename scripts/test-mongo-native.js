const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

const envPath = path.join(__dirname, "..", ".env.local");
const env = fs.readFileSync(envPath, "utf8");
const match = env.match(/^MONGODB_URI=(.+)$/m);
const uri = match?.[1]?.trim();

(async () => {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 15000,
  });

  try {
    console.log("Connecting with native MongoDB driver...");
    await client.connect();
    console.log("CONNECTED");
    const db = client.db("Rc");
    const cols = await db.listCollections().toArray();
    console.log("Collections:", cols.map((c) => c.name).join(", ") || "(none)");
    await client.close();
    process.exit(0);
  } catch (e) {
    console.log("ERROR:", e.message);
    if (e.errorResponse) console.log("errorResponse:", e.errorResponse);
    await client.close().catch(() => {});
    process.exit(1);
  }
})();
