const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://roboticsclub_db_user:Rcinnit234@rcwebsite.y2uiopt.mongodb.net/Rc?appName=RcWebsite";

const addSecSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  department: { type: String, required: true, enum: ["Software", "Mechanical", "Embedded", "PR"] },
}, { timestamps: true });

const AddSec = mongoose.models.AddSec || mongoose.model('AddSec', addSecSchema);

const DEFAULT_ACCOUNTS = [
  { username: "addsec_software", password: "software@rc2026", department: "Software" },
  { username: "addsec_mechanical", password: "mechanical@rc2026", department: "Mechanical" },
  { username: "addsec_embedded", password: "embedded@rc2026", department: "Embedded" },
  { username: "addsec_pr", password: "pr@rc2026", department: "PR" },
];

async function seedAddSecs() {
  try {
    await mongoose.connect(MONGODB_URI, { dbName: "Rc" });
    console.log("Connected to MongoDB.");

    for (const acc of DEFAULT_ACCOUNTS) {
      const hashedPassword = await bcrypt.hash(acc.password, 10);
      const existing = await AddSec.findOne({ username: acc.username });

      if (existing) {
        existing.password = hashedPassword;
        existing.department = acc.department;
        await existing.save();
        console.log(`Updated AddSec [${acc.department}]: ${acc.username}`);
      } else {
        await AddSec.create({
          username: acc.username,
          password: hashedPassword,
          department: acc.department,
        });
        console.log(`Created AddSec [${acc.department}]: ${acc.username}`);
      }
    }

    console.log("Seeding complete. 4 AddSec accounts ready!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding AddSecs:", error);
    process.exit(1);
  }
}

seedAddSecs();
