import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { connectDB } from "@/app/lib/db";
import Member from "@/app/models/Member";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function validateAdmin() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "admin") {
    return {
      session: null,
      response: NextResponse.json(
        { success: false, message: "Unauthorized: Admin privileges required" },
        { status: 401 }
      ),
    };
  }

  return { session, response: null };
}

// GET /api/admin/members/[id]
export async function GET(request, { params }) {
  try {
    const { response } = await validateAdmin();
    if (response) return response;

    const { id } = await params;
    await connectDB();

    const member = await Member.findById(id).lean();
    if (!member) {
      return NextResponse.json(
        { success: false, message: "Member not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: member });
  } catch (error) {
    console.error("GET /api/admin/members/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch member" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/members/[id]
export async function PUT(request, { params }) {
  try {
    const { session, response } = await validateAdmin();
    if (response) return response;

    const { id } = await params;
    await connectDB();

    const body = await request.json();
    const existing = await Member.findById(id);

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Member not found" },
        { status: 404 }
      );
    }

    // Check if score/evaluation fields are provided
    const isEvaluationUpdate =
      body.points !== undefined ||
      body.comments !== undefined ||
      body.positiveRemarks !== undefined ||
      body.negativeRemarks !== undefined ||
      body.feedback !== undefined;

    const updateFields = {};

    // Standard details update
    if (body.name !== undefined) updateFields.name = body.name.trim();
    if (body.department !== undefined) updateFields.department = body.department.trim();
    if (body.role !== undefined) updateFields.role = body.role.trim();
    if (body.year !== undefined) updateFields.year = body.year.trim();
    if (body.rollNumber !== undefined) updateFields.rollNumber = body.rollNumber.trim();
    if (body.email !== undefined) updateFields.email = body.email.trim();
    if (body.phone !== undefined) updateFields.phone = body.phone.trim();
    if (body.img !== undefined) updateFields.img = body.img.trim();
    if (body.linkedin !== undefined) updateFields.linkedin = body.linkedin.trim();
    if (body.instagram !== undefined) updateFields.instagram = body.instagram.trim();
    if (body.isAlumni !== undefined) updateFields.isAlumni = Boolean(body.isAlumni);
    if (body.isProf !== undefined) updateFields.isProf = Boolean(body.isProf);
    if (body.isCore !== undefined) updateFields.isCore = Boolean(body.isCore);
    if (body.isAddlSec !== undefined) updateFields.isAddlSec = Boolean(body.isAddlSec);
    if (body.category !== undefined) updateFields.category = String(body.category).trim();
    if (body.bio !== undefined) updateFields.bio = body.bio.trim();

    // Scoring & evaluation update (just like recruitment)
    if (body.points !== undefined) updateFields.points = String(body.points).trim();
    if (body.comments !== undefined) updateFields.comments = String(body.comments).trim();
    if (body.feedback !== undefined) updateFields.feedback = String(body.feedback).trim();
    if (body.positiveRemarks !== undefined) {
      updateFields.positiveRemarks = Array.isArray(body.positiveRemarks)
        ? body.positiveRemarks
        : [];
    }
    if (body.negativeRemarks !== undefined) {
      updateFields.negativeRemarks = Array.isArray(body.negativeRemarks)
        ? body.negativeRemarks
        : [];
    }

    if (isEvaluationUpdate) {
      updateFields.evaluatedBy = session.user?.username || "admin";
      updateFields.evaluatedAt = new Date();
    }

    const updatedMember = await Member.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: "Member updated successfully",
      data: updatedMember,
    });
  } catch (error) {
    console.error("PUT /api/admin/members/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update member" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/members/[id]
export async function DELETE(request, { params }) {
  try {
    const { response } = await validateAdmin();
    if (response) return response;

    const { id } = await params;
    await connectDB();

    const deleted = await Member.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Member not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Member "${deleted.name}" deleted successfully`,
    });
  } catch (error) {
    console.error("DELETE /api/admin/members/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete member" },
      { status: 500 }
    );
  }
}
