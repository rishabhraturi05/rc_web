import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { connectDB } from "@/app/lib/db";
import RecruitmentConfig from "@/app/models/RecruitmentConfig";
import RecruitmentApplication from "@/app/models/RecruitmentApplication";
import { isRecruitmentActive, normalizeRecruitmentConfig } from "@/app/lib/recruitment";

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

export async function GET(req, { params }) {
  try {
    const authResult = await validateAdmin();
    if (authResult.response) return authResult.response;

    const { id } = await params;

    await connectDB();
    const form = await RecruitmentConfig.findById(id).lean();

    if (!form) {
      return NextResponse.json(
        { success: false, message: "Recruitment form not found" },
        { status: 404 }
      );
    }

    const applicantCount = await RecruitmentApplication.countDocuments({ formId: form._id });

    return NextResponse.json({
      success: true,
      data: {
        ...form,
        applicantCount,
      },
    });
  } catch (error) {
    console.error("GET RECRUITMENT FORM ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const authResult = await validateAdmin();
    if (authResult.response) return authResult.response;

    const { id } = await params;
    const body = await req.json();

    await connectDB();

    const existing = await RecruitmentConfig.findById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Recruitment form not found" },
        { status: 404 }
      );
    }

    const merged = normalizeRecruitmentConfig({
      ...existing.toObject(),
      ...body,
    });

    if (!Array.isArray(merged.fields) || merged.fields.length === 0) {
      return NextResponse.json(
        { success: false, message: "At least one field is required." },
        { status: 400 }
      );
    }

    if (!Array.isArray(merged.departments) || merged.departments.length === 0) {
      return NextResponse.json(
        { success: false, message: "At least one department is required." },
        { status: 400 }
      );
    }

    existing.isOpen = Boolean(merged.isOpen);
    existing.deadline = merged.deadline;
    existing.fields = merged.fields;
    existing.departments = merged.departments;
    existing.updatedAt = new Date();

    await existing.save();

    return NextResponse.json({ success: true, data: existing });
  } catch (error) {
    console.error("UPDATE RECRUITMENT FORM ERROR:", error);
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

    const { id } = await params;

    await connectDB();

    const form = await RecruitmentConfig.findById(id);
    if (!form) {
      return NextResponse.json(
        { success: false, message: "Recruitment form not found" },
        { status: 404 }
      );
    }

    // Delete all applications belonging to this form, then delete the form itself
    await RecruitmentApplication.deleteMany({ formId: form._id });
    await RecruitmentConfig.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Recruitment form and all related applications were deleted.",
    });
  } catch (error) {
    console.error("DELETE RECRUITMENT FORM ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
