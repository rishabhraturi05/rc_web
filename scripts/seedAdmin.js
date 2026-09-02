const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Please provide MONGODB_URI as an environment variable.");
  console.log("Usage: set MONGODB_URI='your-atlas-uri' && node scripts/seedAdmin.js");
  process.exit(1);
}

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URI, { dbName: "Rc" });
    console.log("Connected to MongoDB.");

    const username = "roboticsclub@nitw.ac.in";
    const password = "roboticsclub@2027";

    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      console.log("Admin user already exists. Overwriting password...");
      existingAdmin.password = await bcrypt.hash(password, 10);
      await existingAdmin.save();
      console.log("Password updated successfully.");
    } else {
      console.log("Creating new admin user...");
      const hashedPassword = await bcrypt.hash(password, 10);
      const newAdmin = new Admin({ username, password: hashedPassword });
      await newAdmin.save();
      console.log("Admin user created successfully.");
    }

    console.log("You can now log in with the credentials.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
}

seedAdmin();
