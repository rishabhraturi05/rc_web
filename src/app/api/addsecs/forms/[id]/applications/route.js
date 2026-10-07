import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { connectDB } from "@/app/lib/db";
import RecruitmentConfig from "@/app/models/RecruitmentConfig";
import RecruitmentApplication from "@/app/models/RecruitmentApplication";
import { DEFAULT_YEAR_OPTIONS, getRecruitmentFormTitle } from "@/app/lib/recruitment";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user?.role !== "addsec" && session.user?.role !== "admin")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Additional Secretary access required." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const userDepartment = session.user?.department;

    await connectDB();

    const form = await RecruitmentConfig.findById(id).lean();
    if (!form) {
      return NextResponse.json(
        { success: false, message: "Recruitment form not found" },
        { status: 404 }
      );
    }

    // Security check: If AddSec, ensure form includes their department
    if (userDepartment && !form.departments?.includes(userDepartment)) {
      return NextResponse.json(
        { success: false, message: `Access denied. This form is not assigned to ${userDepartment} department.` },
        { status: 403 }
      );
    }

    // Filter applications strictly for this department
    const query = { formId: form._id };
    if (userDepartment) {
      query.department = userDepartment;
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
      {
        success: true,
        department: userDepartment || "All",
        data: { form: normalizedForm, applications },
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    console.error("GET ADDSEC APPLICATIONS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error fetching applications." },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user?.role !== "addsec" && session.user?.role !== "admin")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Additional Secretary access required." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const userDepartment = session.user?.department;
    const body = await req.json();
    const {
      applicationId,
      points,
      comments,
      feedback,
      positiveRemarks,
      negativeRemarks,
    } = body || {};

    if (!applicationId) {
      return NextResponse.json(
        { success: false, message: "Application ID is required." },
        { status: 400 }
      );
    }

    await connectDB();

    // Query application ensuring it matches the form and department
    const query = { _id: applicationId, formId: id };
    if (userDepartment) {
      query.department = userDepartment;
    }

    const application = await RecruitmentApplication.findOne(query);

    if (!application) {
      return NextResponse.json(
        { success: false, message: "Application not found or you lack permission to evaluate it." },
        { status: 404 }
      );
    }

    // Update points, comments, feedback classification, remarks, and evaluation metadata
    if (points !== undefined) {
      application.points = String(points).trim();
    }
    if (comments !== undefined) {
      application.comments = String(comments).trim();
    }
    if (feedback !== undefined) {
      application.feedback = String(feedback).trim().toLowerCase();
    }
    if (positiveRemarks !== undefined) {
      application.positiveRemarks = Array.isArray(positiveRemarks) ? positiveRemarks : [];
    }
    if (negativeRemarks !== undefined) {
      application.negativeRemarks = Array.isArray(negativeRemarks) ? negativeRemarks : [];
    }

    application.evaluatedBy = session.user?.username || "addsec";
    application.evaluatedAt = new Date();

    await application.save();

    return NextResponse.json({
      success: true,
      message: "Evaluation saved successfully.",
      data: {
        _id: application._id,
        points: application.points,
        comments: application.comments,
        feedback: application.feedback,
        positiveRemarks: application.positiveRemarks,
        negativeRemarks: application.negativeRemarks,
        evaluatedBy: application.evaluatedBy,
        evaluatedAt: application.evaluatedAt,
      },
    });
  } catch (error) {
    console.error("UPDATE ADDSEC APPLICATION EVALUATION ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error while saving evaluation." },
      { status: 500 }
    );
  }
}
