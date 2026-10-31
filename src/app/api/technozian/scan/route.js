import { NextResponse, after } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { connectDB } from "@/app/lib/db";
import TechnozianRegistration from "@/app/models/TechnozianRegistration";
import { forwardRfidScan, getForwardingStatus } from "@/app/lib/rfidForwarder";

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

/**
 * Checks if a string looks like a NITW roll number.
 * NITW roll numbers follow patterns like: 23BCS042, 21BCE101, 24MCS005, 20PHD002, etc.
 * Pattern: 2 digits (year) + 2-3 letters (branch code) + 3 digits (student number)
 */
function isNitwRollNo(value) {
  if (!value || typeof value !== "string") return false;
  // Matches: 2-digit year + 2-4 uppercase letters + 2-4 digits (e.g., 23BCS042, 21ME01, 24MTECH001)
  return /^\d{2}[A-Z]{2,4}\d{2,4}$/.test(value.trim().toUpperCase());
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
    forwardingTargets: getForwardingStatus(isAuthorized),
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

    const rawRollNo = typeof rollNo === "string" ? rollNo.trim() : "";
    const cleanRfidUid = typeof rfidUid === "string" ? rfidUid.trim().toUpperCase() : "";
    const cleanDeviceId = typeof deviceId === "string" && deviceId.trim() ? deviceId.trim() : "BOX_1";

    if (!rawRollNo && !cleanRfidUid) {
      return NextResponse.json(
        {
          success: false,
          status: "missing_fields",
          message: "Missing roll number or RFID UID",
        },
        { status: 400 }
      );
    }

    // Determine if this is a NITW student (roll number) or non-NITW (name sent in rollNo field)
    const isNitwStudent = isNitwRollNo(rawRollNo);
    let cleanRollNo;
    let participantName;

    if (isNitwStudent) {
      // NITW student: rollNo is an actual roll number
      cleanRollNo = rawRollNo.toUpperCase();
      participantName = (name || "").trim();
    } else if (rawRollNo) {
      // Non-NITW student: rollNo field contains their name
      // Store a generated ID as rollNo, and use the value as their name
      cleanRollNo = `EXT_${rawRollNo.replace(/\s+/g, "_").toUpperCase()}`;
      participantName = rawRollNo; // The original value IS their name
    } else {
      // Only RFID UID provided, no roll number
      cleanRollNo = "";
      participantName = (name || "").trim();
    }

    // Trigger background relay to configured external websites without delaying response to ESP
    const scanEventData = {
      rollNo: cleanRollNo || rawRollNo.toUpperCase(),
      rfidUid: cleanRfidUid,
      deviceId: cleanDeviceId,
      name: participantName,
      branch: (branch || "").trim(),
      year: (year || "").trim(),
      contactNo: (contactNo || "").trim(),
      email: (email || "").trim(),
      notes: (notes || "").trim(),
      isNitwStudent,
      rawBody: body,
    };

    if (typeof after === "function") {
      after(async () => {
        await forwardRfidScan(scanEventData);
      });
    } else {
      forwardRfidScan(scanEventData).catch((err) =>
        console.error("[RFID_FORWARD_BACKGROUND_ERROR]", err)
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
      // Update name if we have one and existing record doesn't
      if (participantName && (!existing.name || existing.name === "" || existing.name === "Walk-in Participant")) {
        existing.name = participantName;
      }

      await existing.save();

      const studentType = isNitwStudent ? "NITW" : "Non-NITW";

      // Case 1: Student was ALREADY registered / attended before this tap
      if (wasAlreadyAttended) {
        return NextResponse.json(
          {
            success: true,
            status: "already_registered",
            name: existing.name || "Student",
            rollNo: existing.rollNo,
            isRepeat: true,
            isNitwStudent,
            studentType,
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
              isNitwStudent,
              studentType,
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
          isNitwStudent,
          studentType,
          message: `Registered successfully: ${existing.name || existing.rollNo} (${studentType})`,
          data: {
            id: existing._id,
            rollNo: existing.rollNo,
            rfidUid: existing.rfidUid,
            name: existing.name || "Student",
            collegeName: existing.collegeName || existing.branch || "",
            scanCount: existing.scanCount,
            lastScannedAt: existing.lastScannedAt,
            deviceId: existing.deviceId,
            isNitwStudent,
            studentType,
          },
        },
        { status: 201 }
      );
    }

    // Case 3: Student NOT found in database — auto-register for both NITW and Non-NITW
    // Non-NITW students are always auto-registered since they won't be pre-loaded in the database
    const allowAutoRegister =
      !isNitwStudent || body.autoRegister === true || body.isWalkIn === true;

    if (!allowAutoRegister) {
      return NextResponse.json(
        {
          success: false,
          status: "not_found",
          name: null,
          rollNo: cleanRollNo || cleanRfidUid,
          isNitwStudent,
          studentType: "NITW",
          message: `NITW student not found in database: ${cleanRollNo || cleanRfidUid}`,
        },
        { status: 404 }
      );
    }

    // Auto-create registration
    const newRecord = await TechnozianRegistration.create({
      rollNo: cleanRollNo || `RFID_${cleanRfidUid}`,
      rfidUid: cleanRfidUid,
      deviceId: cleanDeviceId,
      name: participantName || (isNitwStudent ? "Walk-in Participant" : rawRollNo),
      branch: (branch || "").trim(),
      year: (year || "").trim(),
      contactNo: (contactNo || "").trim(),
      email: (email || "").trim(),
      notes: isNitwStudent
        ? (notes || "").trim()
        : (notes || "").trim() || "Non-NITW Participant",
      scanCount: 1,
      lastScannedAt: new Date(),
      attended: true,
      isManual: false,
      eventName: "Smash Karts",
    });

    const studentType = isNitwStudent ? "NITW" : "Non-NITW";

    return NextResponse.json(
      {
        success: true,
        status: "success",
        name: newRecord.name || "Student",
        rollNo: newRecord.rollNo,
        isRepeat: false,
        isNitwStudent,
        studentType,
        message: `Registered successfully: ${newRecord.name || newRecord.rollNo} (${studentType})`,
        data: {
          id: newRecord._id,
          rollNo: newRecord.rollNo,
          rfidUid: newRecord.rfidUid,
          name: newRecord.name || "Student",
          collegeName: newRecord.collegeName || newRecord.branch || "",
          scanCount: 1,
          lastScannedAt: newRecord.lastScannedAt,
          deviceId: newRecord.deviceId,
          isNitwStudent,
          studentType,
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
