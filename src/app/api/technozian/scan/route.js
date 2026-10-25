import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { connectDB } from "@/app/lib/db";
import TechnozianRegistration from "@/app/models/TechnozianRegistration";

// Default fallback key if RFID_API_KEY is not defined in .env
const DEFAULT_API_KEY = "rc_technozian_rfid_2025";

function verifyApiKey(req, bodyKey = null) {
  const configuredKey =
    process.env.RFID_API_KEY ||
    process.env.apiKey ||
    process.env.API_KEY ||
    DEFAULT_API_KEY;

  const headerKey =
    req.headers.get("x-api-key") ||
    req.headers.get("x-device-key") ||
    req.headers.get("authorization")?.replace("Bearer ", "");

  const url = new URL(req.url);
  const queryKey = url.searchParams.get("apiKey") || url.searchParams.get("key");

  return (
    headerKey === configuredKey ||
    queryKey === configuredKey ||
    bodyKey === configuredKey
  );
}

// Health check / info endpoint for browser or hardware team testing
export async function GET(req) {
  const isAuthorized = verifyApiKey(req);
  return NextResponse.json({
    status: "active",
    endpoint: "/api/technozian/scan",
    message: "Smash Karts / Technozian RFID Scanner API is online and accepting POST requests",
    authorized: isAuthorized,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req) {
  try {
    // 1. Parse payload
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, status: "error", message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    // 2. Validate device API key (supports x-api-key header, query param, body.apiKey, OR logged-in AddSec/Admin session)
    const isApiKeyValid = verifyApiKey(req, body?.apiKey);
    let isAuthenticatedUser = false;
    if (!isApiKeyValid) {
      try {
        const session = await getServerSession(authOptions);
        if (session && (session.user?.role === "addsec" || session.user?.role === "admin")) {
          isAuthenticatedUser = true;
        }
      } catch {
        // Fallback to strict API key validation
      }
    }

    if (!isApiKeyValid && !isAuthenticatedUser) {
      return NextResponse.json(
        {
          success: false,
          status: "unauthorized",
          message: "Unauthorized: Invalid or missing API key (send via x-api-key header or apiKey in JSON)",
        },
        { status: 401 }
      );
    }

    const {
      rollNo,
      rfidUid,
      deviceId,
      name,
      branch,
      year,
      contactNo,
      email,
      notes,
    } = body;

    const cleanRollNo = typeof rollNo === "string" ? rollNo.trim().toUpperCase() : "";
    const cleanRfidUid = typeof rfidUid === "string" ? rfidUid.trim().toUpperCase() : "";
    const cleanDeviceId = typeof deviceId === "string" && deviceId.trim() ? deviceId.trim() : "BOX_1";

    if (!cleanRollNo && !cleanRfidUid) {
      return NextResponse.json(
        {
          success: false,
          status: "missing_fields",
          message: "Missing roll number or RFID UID",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // 3. Search for existing registration by rollNo or rfidUid
    const query = {
      isDeleted: false,
      $or: [],
    };
    if (cleanRollNo) query.$or.push({ rollNo: cleanRollNo });
    if (cleanRfidUid) query.$or.push({ rfidUid: cleanRfidUid });

    let existing = await TechnozianRegistration.findOne(query);

    if (existing) {
      const wasAlreadyAttended = Boolean(existing.attended);

      // Update attendance & scan details
      existing.scanCount = (existing.scanCount || 0) + 1;
      existing.lastScannedAt = new Date();
      existing.attended = true;
      if (cleanDeviceId) existing.deviceId = cleanDeviceId;
      if (cleanRfidUid && !existing.rfidUid) existing.rfidUid = cleanRfidUid;
      if (cleanRollNo && (!existing.rollNo || existing.rollNo === "")) existing.rollNo = cleanRollNo;

      await existing.save();

      // Case 1: Student was ALREADY registered / attended before this tap
      if (wasAlreadyAttended) {
        return NextResponse.json(
          {
            success: true,
            status: "already_registered",
            name: existing.name || "Student",
            rollNo: existing.rollNo,
            isRepeat: true,
            message: `Already registered! Attendance was already recorded for ${existing.name || existing.rollNo}`,
            data: {
              id: existing._id,
              rollNo: existing.rollNo,
              rfidUid: existing.rfidUid,
              name: existing.name || "Student",
              collegeName: existing.collegeName || existing.branch || "",
              scanCount: existing.scanCount,
              lastScannedAt: existing.lastScannedAt,
              deviceId: existing.deviceId,
            },
          },
          { status: 200 }
        );
      }

      // Case 2: First-time scan / Registered successfully!
      return NextResponse.json(
        {
          success: true,
          status: "success",
          name: existing.name || "Student",
          rollNo: existing.rollNo,
          isRepeat: false,
          message: `Registered successfully: ${existing.name || existing.rollNo}`,
          data: {
            id: existing._id,
            rollNo: existing.rollNo,
            rfidUid: existing.rfidUid,
            name: existing.name || "Student",
            collegeName: existing.collegeName || existing.branch || "",
            scanCount: existing.scanCount,
            lastScannedAt: existing.lastScannedAt,
            deviceId: existing.deviceId,
          },
        },
        { status: 201 }
      );
    }

    // Case 3: Student NOT found in database (or optional auto-register if explicitly requested)
    const allowAutoRegister = body.autoRegister === true || body.isWalkIn === true;

    if (!allowAutoRegister) {
      return NextResponse.json(
        {
          success: false,
          status: "not_found",
          name: null,
          rollNo: cleanRollNo || cleanRfidUid,
          message: `Student not found in database: ${cleanRollNo || cleanRfidUid}`,
        },
        { status: 404 }
      );
    }

    // Optional Auto-create walkin if autoRegister: true is passed
    const newRecord = await TechnozianRegistration.create({
      rollNo: cleanRollNo || `RFID_${cleanRfidUid}`,
      rfidUid: cleanRfidUid,
      deviceId: cleanDeviceId,
      name: (name || "").trim() || "Walk-in Participant",
      branch: (branch || "").trim(),
      year: (year || "").trim(),
      contactNo: (contactNo || "").trim(),
      email: (email || "").trim(),
      notes: (notes || "").trim(),
      scanCount: 1,
      lastScannedAt: new Date(),
      attended: true,
      isManual: false,
      eventName: "Smash Karts",
    });

    return NextResponse.json(
      {
        success: true,
        status: "success",
        name: newRecord.name || "Student",
        rollNo: newRecord.rollNo,
        isRepeat: false,
        message: `Registered successfully: ${newRecord.name || newRecord.rollNo}`,
        data: {
          id: newRecord._id,
          rollNo: newRecord.rollNo,
          rfidUid: newRecord.rfidUid,
          name: newRecord.name || "Student",
          collegeName: newRecord.collegeName || newRecord.branch || "",
          scanCount: 1,
          lastScannedAt: newRecord.lastScannedAt,
          deviceId: newRecord.deviceId,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[TECHNZOIAN_RFID_SCAN_ERROR]:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error saving scan",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
