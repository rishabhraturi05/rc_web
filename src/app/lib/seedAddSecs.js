import bcrypt from "bcryptjs";
import { connectDB } from "@/app/lib/db";
import AddSec from "@/app/models/AddSec";

export const DEFAULT_ADDSECS = [
  {
    username: "addsec_software",
    password: "software@rc2026",
    department: "Software",
  },
  {
    username: "addsec_mechanical",
    password: "mechanical@rc2026",
    department: "Mechanical",
  },
  {
    username: "addsec_embedded",
    password: "embedded@rc2026",
    department: "Embedded",
  },
  {
    username: "addsec_pr",
    password: "pr@rc2026",
    department: "PR",
  },
];

export async function ensureDefaultAddSecs() {
  try {
    await connectDB();
    for (const item of DEFAULT_ADDSECS) {
      const existing = await AddSec.findOne({ username: item.username });
      if (!existing) {
        const hashedPassword = await bcrypt.hash(item.password, 10);
        await AddSec.create({
          username: item.username,
          password: hashedPassword,
          department: item.department,
        });
        console.log(`Auto-seeded AddSec account: ${item.username} (${item.department})`);
      }
    }
  } catch (error) {
    console.error("Error ensuring default AddSecs:", error);
  }
}
