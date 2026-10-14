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
    const { searchParams } = new URL(req.url);
    const requestedDept = searchParams.get("department");

    // AddSec is locked to their assigned department. Admin can specify a department (defaults to "Software").
    const rawDept =
      session.user?.role === "addsec"
        ? session.user?.department
        : (requestedDept || "Software");

    let userDepartment = String(rawDept || "Software").replace(/\s*department\s*$/i, "").trim() || "Software";
    if (userDepartment.toLowerCase() === "department") {
      userDepartment = "Software";
    }
    userDepartment = userDepartment.charAt(0).toUpperCase() + userDepartment.slice(1);

    await connectDB();

    const form = await RecruitmentConfig.findById(id).lean();
    if (!form) {
      return NextResponse.json(
        { success: false, message: "Recruitment form not found" },
        { status: 404 }
      );
    }

    const deptRegex = new RegExp(`^${userDepartment}$`, "i");

    // Security check: If AddSec, ensure form includes their department
    const formHasDept = Array.isArray(form.departments) && form.departments.some((d) => deptRegex.test(d));
    if (session.user?.role === "addsec" && !formHasDept) {
      return NextResponse.json(
        { success: false, message: `Access denied. This form is not assigned to ${userDepartment} department.` },
        { status: 403 }
      );
    }

    // Filter applications strictly for this department (case-insensitive regex)
    const query = { formId: form._id, department: deptRegex };

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
        department: userDepartment,
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
      interviewSlot,
      interviewDate,
      interviewStatus,
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
      const cleanDept = String(userDepartment).replace(/\s*department\s*$/i, "").trim();
      query.department = new RegExp(`^${cleanDept}$`, "i");
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
    if (interviewStatus !== undefined) {
      const cleanStatus = String(interviewStatus).trim().toLowerCase();
      application.interviewStatus = cleanStatus;
      if (cleanStatus === "completed") {
        application.interviewCompletedAt = new Date();
      } else if (cleanStatus === "pending") {
        application.interviewCompletedAt = null;
      }
    }
    if (interviewSlot !== undefined) {
      const cleanSlot = String(interviewSlot || "").trim();
      application.interviewSlot = cleanSlot;

      // Synchronize interviewSlot across all applications of this candidate in this recruitment drive
      const candidateEmail = String(application.responses?.email || "").trim();
      const candidateRoll = String(
        application.responses?.rollno ||
        application.responses?.rollNumber ||
        application.responses?.roll ||
        ""
      ).trim();

      const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const siblingFilter = [];
      if (candidateEmail) {
        siblingFilter.push({ "responses.email": new RegExp(`^\\s*${escapeRegex(candidateEmail)}\\s*$`, "i") });
      }
      if (candidateRoll) {
        siblingFilter.push({ "responses.rollno": new RegExp(`^\\s*${escapeRegex(candidateRoll)}\\s*$`, "i") });
        siblingFilter.push({ "responses.rollNumber": new RegExp(`^\\s*${escapeRegex(candidateRoll)}\\s*$`, "i") });
      }

      if (siblingFilter.length > 0) {
        await RecruitmentApplication.updateMany(
          { formId: id, $or: siblingFilter },
          { $set: { interviewSlot: cleanSlot } }
        );
      }
    }

    if (interviewDate !== undefined) {
      const cleanDate = String(interviewDate || "").trim();
      application.interviewDate = cleanDate;

      // Synchronize interviewDate across all applications of this candidate in this recruitment drive
      const candidateEmail = String(application.responses?.email || "").trim();
      const candidateRoll = String(
        application.responses?.rollno ||
        application.responses?.rollNumber ||
        application.responses?.roll ||
        ""
      ).trim();

      const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const siblingFilter = [];
      if (candidateEmail) {
        siblingFilter.push({ "responses.email": new RegExp(`^\\s*${escapeRegex(candidateEmail)}\\s*$`, "i") });
      }
      if (candidateRoll) {
        siblingFilter.push({ "responses.rollno": new RegExp(`^\\s*${escapeRegex(candidateRoll)}\\s*$`, "i") });
        siblingFilter.push({ "responses.rollNumber": new RegExp(`^\\s*${escapeRegex(candidateRoll)}\\s*$`, "i") });
      }

      if (siblingFilter.length > 0) {
        await RecruitmentApplication.updateMany(
          { formId: id, $or: siblingFilter },
          { $set: { interviewDate: cleanDate } }
        );
      }
    }

    const hasEvaluationChanges =
      points !== undefined ||
      comments !== undefined ||
      feedback !== undefined ||
      positiveRemarks !== undefined ||
      negativeRemarks !== undefined;

    if (hasEvaluationChanges) {
      application.evaluatedBy = session.user?.username || "addsec";
      application.evaluatedAt = new Date();
    }

    await application.save();

    return NextResponse.json(
      {
        success: true,
        message: "Application updated successfully.",
        data: {
          _id: application._id,
          points: application.points,
          comments: application.comments,
          feedback: application.feedback,
          positiveRemarks: application.positiveRemarks,
          negativeRemarks: application.negativeRemarks,
          interviewSlot: application.interviewSlot,
          interviewDate: application.interviewDate,
          interviewStatus: application.interviewStatus,
          interviewCompletedAt: application.interviewCompletedAt,
          evaluatedBy: application.evaluatedBy,
          evaluatedAt: application.evaluatedAt,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("UPDATE ADDSEC APPLICATION EVALUATION ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error while saving evaluation." },
      { status: 500 }
    );
  }
}
