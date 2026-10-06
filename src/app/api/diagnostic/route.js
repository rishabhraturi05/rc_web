import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Admin from "@/app/models/admin";
import AddSec from "@/app/models/AddSec";
import { DEFAULT_ADDSECS } from "@/app/lib/seedAddSecs";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const result = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      nextAuthUrl: process.env.NEXTAUTH_URL,
      hasMongoUri: Boolean(process.env.MONGODB_URI),
      hasSecret: Boolean(process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET),
    },
    mongo: {
      connected: false,
      error: null,
    },
    admin: {
      count: 0,
      usernames: [],
      defaultAdminReady: false,
    },
    addsecs: {
      count: 0,
      accounts: [],
    },
  };

  try {
    const startTime = Date.now();
    await connectDB();
    result.mongo.connected = true;
    result.mongo.responseTimeMs = Date.now() - startTime;

    // Check & Self-heal Admin
    let admin = await Admin.findOne({ username: "roboticsclub@nitw.ac.in" });
    if (!admin) {
      // Check if any admin exists
      const anyAdmin = await Admin.findOne({});
      if (!anyAdmin) {
        const hashedPassword = await bcrypt.hash("roboticsclub@2027", 10);
        admin = await Admin.create({
          username: "roboticsclub@nitw.ac.in",
          password: hashedPassword,
        });
      } else {
        admin = anyAdmin;
      }
    }

    if (admin) {
      // Ensure password matches roboticsclub@2027
      const matches = await bcrypt.compare("roboticsclub@2027", admin.password);
      if (!matches) {
        admin.password = await bcrypt.hash("roboticsclub@2027", 10);
        await admin.save();
      }
      result.admin.defaultAdminReady = true;
    }

    const allAdmins = await Admin.find({}).lean();
    result.admin.count = allAdmins.length;
    result.admin.usernames = allAdmins.map((a) => a.username);

    // Check & Self-heal AddSecs
    for (const item of DEFAULT_ADDSECS) {
      let addSec = await AddSec.findOne({ username: item.username });
      if (!addSec) {
        const hashedPassword = await bcrypt.hash(item.password, 10);
        addSec = await AddSec.create({
          username: item.username,
          password: hashedPassword,
          department: item.department,
        });
      } else {
        const matches = await bcrypt.compare(item.password, addSec.password);
        if (!matches) {
          addSec.password = await bcrypt.hash(item.password, 10);
          await addSec.save();
        }
      }
    }

    const allAddSecs = await AddSec.find({}).lean();
    result.addsecs.count = allAddSecs.length;
    result.addsecs.accounts = allAddSecs.map((a) => ({
      username: a.username,
      department: a.department,
    }));

    return NextResponse.json({
      success: true,
      message: "Diagnostics complete. All credentials verified and synced.",
      data: result,
    });
  } catch (error) {
    result.mongo.connected = false;
    result.mongo.error = error.message;
    return NextResponse.json(
      {
        success: false,
        message: "Diagnostics encountered an error.",
        error: error.message,
        data: result,
      },
      { status: 500 }
    );
  }
}
