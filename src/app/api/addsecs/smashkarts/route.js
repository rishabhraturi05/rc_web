import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { connectDB } from "@/app/lib/db";
import TechnozianRegistration from "@/app/models/TechnozianRegistration";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function validateAuth() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user?.role !== "addsec" && session.user?.role !== "admin")) {
    return {
      response: NextResponse.json(
        { success: false, message: "Unauthorized. Additional Secretary or Admin access required." },
        { status: 401 }
      ),
    };
  }

  return { response: null };
}

export async function GET() {
  try {
    const authResult = await validateAuth();
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
      pendingAttendance: active.filter((r) => !r.attended).length,
      rfidScans: active.filter((r) => !r.isManual).length,
      manualEntries: active.filter((r) => r.isManual).length,
      recycleBinCount: registrations.filter((r) => r.isDeleted).length,
    };

    return NextResponse.json(
      {
        success: true,
        data: registrations,
        stats,
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err) {
    console.error("GET ADDSEC SMASHKARTS ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error fetching registrations" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const authResult = await validateAuth();
    if (authResult.response) return authResult.response;

    const body = await req.json();
    const { name, collegeName, rollNo, notes } = body;

    const cleanName = typeof name === "string" ? name.trim() : "";
    const cleanCollege = typeof collegeName === "string" ? collegeName.trim() : "";

    if (!cleanName) {
      return NextResponse.json(
        { success: false, message: "Participant name is required" },
        { status: 400 }
      );
    }

    if (!cleanCollege) {
      return NextResponse.json(
        { success: false, message: "College name is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Auto-generate or sanitize Roll/Walkin ID
    let finalRollNo = typeof rollNo === "string" && rollNo.trim()
      ? rollNo.trim().toUpperCase()
      : `WALKIN-${Math.floor(1000 + Math.random() * 9000)}`;

    // Ensure uniqueness for generated walk-in ID
    let existing = await TechnozianRegistration.findOne({
      rollNo: finalRollNo,
      isDeleted: false,
    });

    while (existing) {
      finalRollNo = `WALKIN-${Math.floor(1000 + Math.random() * 9000)}`;
      existing = await TechnozianRegistration.findOne({
        rollNo: finalRollNo,
        isDeleted: false,
      });
    }

    const registration = await TechnozianRegistration.create({
      rollNo: finalRollNo,
      name: cleanName,
      collegeName: cleanCollege,
      branch: cleanCollege,
      year: "Walk-in",
      rfidUid: "",
      notes: (notes || "").trim() || `Walk-in from ${cleanCollege}`,
      deviceId: "WALKIN",
      scanCount: 1,
      lastScannedAt: new Date(),
      attended: true,
      isManual: true,
      eventName: "Smash Karts",
    });

    return NextResponse.json(
      { success: true, data: registration },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST ADDSEC SMASHKARTS ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error creating registration" },
      { status: 500 }
    );
  }
}
