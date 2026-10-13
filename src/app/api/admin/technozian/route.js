import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { connectDB } from "@/app/lib/db";
import TechnozianRegistration from "@/app/models/TechnozianRegistration";

async function validateAdmin() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "admin") {
    return {
      response: NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  return { response: null };
}

export async function GET() {
  try {
    const authResult = await validateAdmin();
    if (authResult.response) return authResult.response;

    await connectDB();

    const registrations = await TechnozianRegistration.find({})
      .sort({ lastScannedAt: -1, createdAt: -1 })
      .lean();

    const active = registrations.filter((r) => !r.isDeleted);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const scannedToday = active.filter((r) => {
      const scanDate = new Date(r.lastScannedAt || r.createdAt);
      return scanDate >= today;
    }).length;

    const stats = {
      totalRegistrations: active.length,
      scannedToday,
      totalAttended: active.filter((r) => r.attended).length,
      rfidScans: active.filter((r) => !r.isManual).length,
      manualEntries: active.filter((r) => r.isManual).length,
      recycleBinCount: registrations.filter((r) => r.isDeleted).length,
    };

    return NextResponse.json({
      success: true,
      data: registrations,
      stats,
    });
  } catch (err) {
    console.error("GET ADMIN TECHNOZIAN ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error fetching registrations" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const authResult = await validateAdmin();
    if (authResult.response) return authResult.response;

    const body = await req.json();
    const { rollNo, rfidUid, name, branch, year, contactNo, email, notes } = body;

    const cleanRollNo = typeof rollNo === "string" ? rollNo.trim().toUpperCase() : "";

    if (!cleanRollNo) {
      return NextResponse.json(
        { success: false, message: "Roll number is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if rollNo already exists
    const existing = await TechnozianRegistration.findOne({
      rollNo: cleanRollNo,
      isDeleted: false,
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: `Roll number ${cleanRollNo} is already registered!`,
        },
        { status: 409 }
      );
    }

    const registration = await TechnozianRegistration.create({
      rollNo: cleanRollNo,
      rfidUid: (rfidUid || "").trim().toUpperCase(),
      name: (name || "").trim(),
      branch: (branch || "").trim(),
      year: (year || "").trim(),
      contactNo: (contactNo || "").trim(),
      email: (email || "").trim(),
      notes: (notes || "").trim(),
      deviceId: "ADMIN_MANUAL",
      scanCount: 1,
      lastScannedAt: new Date(),
      attended: true,
      isManual: true,
      eventName: "Technozian",
    });

    return NextResponse.json(
      { success: true, data: registration },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST ADMIN TECHNOZIAN ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error creating registration" },
      { status: 500 }
    );
  }
}
