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
 */
function isNitwRollNo(value) {
  if (!value || typeof value !== "string") return false;
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

    await connectDB();

    const isNitw = isNitwRollNo(rawRollNo);

    // 3. Search for existing registration in our database
    const query = {
      isDeleted: false,
      $or: [],
    };
    if (rawRollNo) {
      query.$or.push({ rollNo: rawRollNo.toUpperCase() });
      query.$or.push({ rollNo: rawRollNo });
    }
    if (cleanRfidUid) {
      query.$or.push({ rfidUid: cleanRfidUid });
    }

    let existing = await TechnozianRegistration.findOne(query);

    // 4. Resolve Name:
    // If FOUND in our database -> use their registered Name from database
    // If NOT FOUND in our database -> use whatever rollNo string we received!
    let resolvedName = "";
    let resolvedRollNo = "";

    if (existing) {
      resolvedName = (existing.name || "").trim() || (name || "").trim() || existing.rollNo;
      resolvedRollNo = existing.rollNo;
    } else {
      resolvedName = (name || "").trim() || rawRollNo || (cleanRfidUid ? `RFID_${cleanRfidUid}` : "Participant");
      resolvedRollNo = rawRollNo.toUpperCase() || (cleanRfidUid ? `RFID_${cleanRfidUid}` : "PARTICIPANT");
    }

    // 5. Trigger background forward to the 3 external websites
    const scanEventData = {
      rollNo: resolvedRollNo,
      rfidUid: cleanRfidUid,
      deviceId: cleanDeviceId,
      name: resolvedName,
      branch: (branch || existing?.branch || existing?.collegeName || "").trim(),
      year: (year || existing?.year || "").trim(),
      contactNo: (contactNo || existing?.contactNo || "").trim(),
      email: (email || existing?.email || "").trim(),
      notes: (notes || existing?.notes || "").trim(),
      isNitwStudent: isNitw,
      rawBody: {
        rollNo: resolvedRollNo,
        rollNumber: resolvedRollNo,
        name: resolvedName,
      },
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

    if (existing) {
      const wasAlreadyAttended = Boolean(existing.attended);

      // Update attendance & scan details
      existing.scanCount = (existing.scanCount || 0) + 1;
      existing.lastScannedAt = new Date();
      existing.attended = true;
      if (cleanDeviceId) existing.deviceId = cleanDeviceId;
      if (cleanRfidUid && !existing.rfidUid) existing.rfidUid = cleanRfidUid;
      if (resolvedName && (!existing.name || existing.name === "" || existing.name === "Walk-in Participant")) {
        existing.name = resolvedName;
      }

      await existing.save();

      const studentType = isNitw ? "NITW" : "Non-NITW";

      // Case 1: Student was ALREADY registered / attended before this tap
      if (wasAlreadyAttended) {
        return NextResponse.json(
          {
            success: true,
            status: "already_registered",
            name: existing.name || resolvedName,
            rollNo: existing.rollNo,
            isRepeat: true,
            isNitwStudent: isNitw,
            studentType,
            message: `Already registered! Attendance was already recorded for ${existing.name || existing.rollNo}`,
            data: {
              id: existing._id,
              rollNo: existing.rollNo,
              rfidUid: existing.rfidUid,
              name: existing.name || resolvedName,
              collegeName: existing.collegeName || existing.branch || "",
              scanCount: existing.scanCount,
              lastScannedAt: existing.lastScannedAt,
              deviceId: existing.deviceId,
              isNitwStudent: isNitw,
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
          name: existing.name || resolvedName,
          rollNo: existing.rollNo,
          isRepeat: false,
          isNitwStudent: isNitw,
          studentType,
          message: `Registered successfully: ${existing.name || existing.rollNo} (${studentType})`,
          data: {
            id: existing._id,
            rollNo: existing.rollNo,
            rfidUid: existing.rfidUid,
            name: existing.name || resolvedName,
            collegeName: existing.collegeName || existing.branch || "",
            scanCount: existing.scanCount,
            lastScannedAt: existing.lastScannedAt,
            deviceId: existing.deviceId,
            isNitwStudent: isNitw,
            studentType,
          },
        },
        { status: 201 }
      );
    }

    // Case 3: Student NOT found in database — auto-register
    const allowAutoRegister =
      !isNitw || body.autoRegister === true || body.isWalkIn === true;

    if (!allowAutoRegister) {
      return NextResponse.json(
        {
          success: false,
          status: "not_found",
          name: resolvedName,
          rollNo: resolvedRollNo,
          isNitwStudent: isNitw,
          studentType: "NITW",
          message: `NITW student not found in database: ${resolvedRollNo}`,
        },
        { status: 404 }
      );
    }

    // Auto-create registration
    const newRecord = await TechnozianRegistration.create({
      rollNo: resolvedRollNo,
      rfidUid: cleanRfidUid,
      deviceId: cleanDeviceId,
      name: resolvedName,
      branch: (branch || "").trim(),
      year: (year || "").trim(),
      contactNo: (contactNo || "").trim(),
      email: (email || "").trim(),
      notes: isNitw
        ? (notes || "").trim()
        : (notes || "").trim() || "Non-NITW Participant",
      scanCount: 1,
      lastScannedAt: new Date(),
      attended: true,
      isManual: false,
      eventName: "Smash Karts",
    });

    const studentType = isNitw ? "NITW" : "Non-NITW";

    return NextResponse.json(
      {
        success: true,
        status: "success",
        name: newRecord.name || resolvedName,
        rollNo: newRecord.rollNo,
        isRepeat: false,
        isNitwStudent: isNitw,
        studentType,
        message: `Registered successfully: ${newRecord.name || newRecord.rollNo} (${studentType})`,
        data: {
          id: newRecord._id,
          rollNo: newRecord.rollNo,
          rfidUid: newRecord.rfidUid,
          name: newRecord.name || resolvedName,
          collegeName: newRecord.collegeName || newRecord.branch || "",
          scanCount: 1,
          lastScannedAt: newRecord.lastScannedAt,
          deviceId: newRecord.deviceId,
          isNitwStudent: isNitw,
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
