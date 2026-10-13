import { NextResponse } from "next/server";
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
    message: "Technozian RFID Scanner API is online and accepting POST requests",
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
        { success: false, message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    // 2. Validate device API key (supports x-api-key header, query param, OR body.apiKey)
    if (!verifyApiKey(req, body?.apiKey)) {
      return NextResponse.json(
        {
          success: false,
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
      // Repeat scan / update attendance
      existing.scanCount = (existing.scanCount || 1) + 1;
      existing.lastScannedAt = new Date();
      existing.attended = true;
      if (cleanDeviceId) existing.deviceId = cleanDeviceId;
      if (cleanRfidUid && !existing.rfidUid) existing.rfidUid = cleanRfidUid;
      if (cleanRollNo && (!existing.rollNo || existing.rollNo === "")) existing.rollNo = cleanRollNo;

      await existing.save();

      return NextResponse.json(
        {
          success: true,
          isRepeat: true,
          message: `Already registered! Attendance confirmed for ${existing.rollNo}`,
          data: {
            id: existing._id,
            rollNo: existing.rollNo,
            rfidUid: existing.rfidUid,
            name: existing.name || "Student",
            scanCount: existing.scanCount,
            lastScannedAt: existing.lastScannedAt,
            deviceId: existing.deviceId,
          },
        },
        { status: 200 }
      );
    }

    // 4. Create new registration
    const newRecord = await TechnozianRegistration.create({
      rollNo: cleanRollNo || `RFID_${cleanRfidUid}`,
      rfidUid: cleanRfidUid,
      deviceId: cleanDeviceId,
      name: (name || "").trim(),
      branch: (branch || "").trim(),
      year: (year || "").trim(),
      contactNo: (contactNo || "").trim(),
      email: (email || "").trim(),
      notes: (notes || "").trim(),
      scanCount: 1,
      lastScannedAt: new Date(),
      attended: true,
      isManual: false,
      eventName: "Technozian",
    });

    return NextResponse.json(
      {
        success: true,
        isRepeat: false,
        message: `Registered successfully: ${newRecord.rollNo}`,
        data: {
          id: newRecord._id,
          rollNo: newRecord.rollNo,
          rfidUid: newRecord.rfidUid,
          name: newRecord.name,
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
