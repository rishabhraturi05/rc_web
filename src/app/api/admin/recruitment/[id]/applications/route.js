import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { connectDB } from "@/app/lib/db";
import RecruitmentConfig from "@/app/models/RecruitmentConfig";
import RecruitmentApplication from "@/app/models/RecruitmentApplication";
import { DEFAULT_YEAR_OPTIONS, getRecruitmentFormTitle } from "@/app/lib/recruitment";

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

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req, { params }) {
  try {
    const authResult = await validateAdmin();
    if (authResult.response) return authResult.response;

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const department = searchParams.get("department");

    await connectDB();

    const form = await RecruitmentConfig.findById(id).lean();
    if (!form) {
      return NextResponse.json(
        { success: false, message: "Recruitment form not found" },
        { status: 404 }
      );
    }

    const query = { formId: form._id };
    if (department && department !== "all") {
      query.department = department;
    }

    const applications = await RecruitmentApplication.find(query)
      .sort({ createdAt: -1 })
      .lean();

    const years = Array.isArray(form.years) && form.years.length
      ? form.years
      : DEFAULT_YEAR_OPTIONS;
    const title = form.title?.trim() || getRecruitmentFormTitle({ ...form, years });

    const normalizedForm = {
      ...form,
      years,
      title,
    };

    return NextResponse.json(
      { success: true, data: { form: normalizedForm, applications } },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    console.error("GET RECRUITMENT APPLICATIONS ERROR:", error);
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
    const { applicationId, department, year, responses } = body || {};

    if (!applicationId) {
      return NextResponse.json(
        { success: false, message: "Application ID is required." },
        { status: 400 }
      );
    }

    await connectDB();

    const application = await RecruitmentApplication.findOne({
      _id: applicationId,
      formId: id,
    });

    if (!application) {
      return NextResponse.json(
        { success: false, message: "Application not found for this form." },
        { status: 404 }
      );
    }

    const updatedResponses = {
      ...(application.responses || {}),
      ...(responses && typeof responses === "object" ? responses : {}),
    };

    if (year) {
      updatedResponses.year = year;
    }

    if (department) {
      application.department = String(department).trim();
    }
    if (year) {
      application.year = String(year).trim();
    }
    application.responses = updatedResponses;
    application.markModified("responses");

    await application.save();

    return NextResponse.json({
      success: true,
      message: "Application updated successfully.",
      data: application,
    });
  } catch (error) {
    console.error("UPDATE RECRUITMENT APPLICATION ERROR:", error);
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
    const { searchParams } = new URL(req.url);
    let applicationId = searchParams.get("applicationId");

    if (!applicationId) {
      try {
        const body = await req.json();
        applicationId = body?.applicationId;
      } catch {
        // empty body
      }
    }

    if (!applicationId) {
      return NextResponse.json(
        { success: false, message: "Application ID is required." },
        { status: 400 }
      );
    }

    await connectDB();

    const deleted = await RecruitmentApplication.findOneAndDelete({
      _id: applicationId,
      formId: id,
    });

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Application not found or already deleted." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Application deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE RECRUITMENT APPLICATION ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
