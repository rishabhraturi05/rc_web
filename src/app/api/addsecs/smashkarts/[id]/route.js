import { NextResponse, after } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { connectDB } from "@/app/lib/db";
import TechnozianRegistration from "@/app/models/TechnozianRegistration";
import { forwardRfidScan } from "@/app/lib/rfidForwarder";

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

export async function PUT(req, { params }) {
  try {
    const authResult = await validateAuth();
    if (authResult.response) return authResult.response;

    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const allowedFields = [
      "attended",
      "isDeleted",
      "name",
      "collegeName",
      "rollNo",
      "branch",
      "year",
      "contactNo",
      "email",
      "notes",
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === "rollNo") {
          updateData.rollNo = String(body[field]).trim().toUpperCase();
        } else {
          updateData[field] = body[field];
        }
      }
    }

    if (updateData.attended === true) {
      updateData.lastScannedAt = new Date();
    }

    const updated = await TechnozianRegistration.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Registration not found" },
        { status: 404 }
      );
    }

    // If marked attended manually, forward to other 3 websites in the background
    if (updateData.attended === true) {
      const scanEventData = {
        rollNo: updated.rollNo,
        rfidUid: updated.rfidUid || "",
        deviceId: updated.deviceId || "MANUAL",
        name: updated.name || "",
        branch: updated.branch || updated.collegeName || "",
        rawBody: {
          rollNo: updated.rollNo,
          name: updated.name,
          collegeName: updated.collegeName,
        },
      };

      if (typeof after === "function") {
        after(async () => {
          await forwardRfidScan(scanEventData);
        });
      } else {
        forwardRfidScan(scanEventData).catch((err) =>
          console.error("[MANUAL_ATTENDANCE_FORWARD_ERROR]", err)
        );
      }
    }

    return NextResponse.json({
      success: true,
      status: "success",
      name: updated.name || "Student",
      rollNo: updated.rollNo,
      data: updated,
    });
  } catch (err) {
    console.error("UPDATE SMASHKARTS ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error updating registration" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const authResult = await validateAuth();
    if (authResult.response) return authResult.response;

    await connectDB();
    const { id } = await params;

    const url = new URL(req.url);
    const permanent = url.searchParams.get("permanent");

    let deleted;
    if (permanent === "true") {
      deleted = await TechnozianRegistration.findByIdAndDelete(id);
    } else {
      deleted = await TechnozianRegistration.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true }
      );
    }

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Registration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: permanent === "true" ? "Permanently deleted" : "Moved to recycle bin",
    });
  } catch (err) {
    console.error("DELETE SMASHKARTS ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error deleting registration" },
      { status: 500 }
    );
  }
}
