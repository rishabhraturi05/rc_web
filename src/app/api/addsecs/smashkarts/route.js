import { NextResponse, after } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { connectDB } from "@/app/lib/db";
import TechnozianRegistration from "@/app/models/TechnozianRegistration";
import { forwardRfidScan } from "@/app/lib/rfidForwarder";

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

    const cleanUserRoll = typeof rollNo === "string" ? rollNo.trim().toUpperCase() : "";

    // If an explicit roll number was provided, check if already registered
    if (cleanUserRoll) {
      const existingUser = await TechnozianRegistration.findOne({
        rollNo: cleanUserRoll,
        isDeleted: false,
      });

      if (existingUser) {
        // Mark attendance if not already marked
        if (!existingUser.attended) {
          existingUser.attended = true;
          existingUser.lastScannedAt = new Date();
          await existingUser.save();
        }

        // Forward to other 3 websites in the background
        const scanEventData = {
          rollNo: existingUser.rollNo,
          rfidUid: existingUser.rfidUid || "",
          deviceId: existingUser.deviceId || "WALKIN",
          name: existingUser.name || cleanName,
          branch: existingUser.branch || cleanCollege,
          rawBody: {
            rollNo: existingUser.rollNo,
            name: existingUser.name || cleanName,
            collegeName: existingUser.collegeName || cleanCollege,
          },
        };

        if (typeof after === "function") {
          after(async () => {
            await forwardRfidScan(scanEventData);
          });
        } else {
          forwardRfidScan(scanEventData).catch((err) =>
            console.error("[WALKIN_FORWARD_BACKGROUND_ERROR]", err)
          );
        }

        return NextResponse.json(
          {
            success: true,
            status: "already_registered",
            name: existingUser.name || "Student",
            rollNo: existingUser.rollNo,
            message: `Already registered! Student ${existingUser.name || "Student"} (${existingUser.rollNo}) is registered and marked attended.`,
            data: existingUser,
          },
          { status: 200 }
        );
      }
    }

    // Auto-generate or sanitize Roll/Walkin ID
    let finalRollNo = cleanUserRoll || `WALKIN-${Math.floor(1000 + Math.random() * 9000)}`;

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

    // Forward manual walk-in to all 3 external websites in background
    const scanEventData = {
      rollNo: registration.rollNo,
      rfidUid: registration.rfidUid || "",
      deviceId: "WALKIN",
      name: registration.name || "",
      branch: registration.branch || registration.collegeName || "",
      rawBody: {
        rollNo: registration.rollNo,
        name: registration.name,
        collegeName: registration.collegeName,
      },
    };

    if (typeof after === "function") {
      after(async () => {
        await forwardRfidScan(scanEventData);
      });
    } else {
      forwardRfidScan(scanEventData).catch((err) =>
        console.error("[WALKIN_FORWARD_BACKGROUND_ERROR]", err)
      );
    }

    return NextResponse.json(
      {
        success: true,
        status: "success",
        name: registration.name,
        rollNo: registration.rollNo,
        message: `Registered successfully: ${registration.name} (${registration.rollNo})`,
        data: registration,
      },
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
