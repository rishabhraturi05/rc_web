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

export async function PUT(req, { params }) {
  try {
    const authResult = await validateAdmin();
    if (authResult.response) return authResult.response;

    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const allowedFields = [
      "attended",
      "isDeleted",
      "name",
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

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("UPDATE TECHNOZIAN ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const authResult = await validateAdmin();
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
    console.error("DELETE TECHNOZIAN ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
