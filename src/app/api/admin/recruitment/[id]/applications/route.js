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
      session: null,
    };
  }

  return { response: null, session };
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

export async function POST(req, { params }) {
  try {
    const authResult = await validateAdmin();
    if (authResult.response) return authResult.response;

    const { id } = await params;
    const body = await req.json();
    const { sourceApplicationId, department, interviewStatus, queueDepartment, queueAddedAt } = body || {};

    if (!sourceApplicationId || !department) {
      return NextResponse.json(
        { success: false, message: "sourceApplicationId and department are required." },
        { status: 400 }
      );
    }

    await connectDB();

    const sourceApp = await RecruitmentApplication.findOne({ _id: sourceApplicationId, formId: id }).lean();
    if (!sourceApp) {
      return NextResponse.json(
        { success: false, message: "Source application not found." },
        { status: 404 }
      );
    }

    const targetDept = String(department).trim();
    const candidateEmail = String(sourceApp.responses?.email || "").trim();
    const candidateRoll = String(
      sourceApp.responses?.rollno ||
      sourceApp.responses?.rollNumber ||
      sourceApp.responses?.roll ||
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

    let existingDeptApp = null;
    if (siblingFilter.length > 0) {
      existingDeptApp = await RecruitmentApplication.findOne({
        formId: id,
        department: targetDept,
        $or: siblingFilter,
      });
    }

    if (existingDeptApp) {
      existingDeptApp.interviewStatus = interviewStatus || "in_queue";
      existingDeptApp.queueDepartment = queueDepartment || targetDept;
      existingDeptApp.queueAddedAt = queueAddedAt ? new Date(queueAddedAt) : new Date();
      await existingDeptApp.save();
      return NextResponse.json({ success: true, data: existingDeptApp });
    }

    return NextResponse.json(
      {
        success: false,
        message: `Candidate did not apply for ${targetDept}. Candidates can only be queued in departments they applied for.`,
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("POST RECRUITMENT APPLICATION (ADD DEPT) ERROR:", error);
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

    // Check if batch queue updates are provided
    if (Array.isArray(body?.queueUpdates) && body.queueUpdates.length > 0) {
      const bulkOps = body.queueUpdates.map((item) => ({
        updateOne: {
          filter: { _id: item.applicationId, formId: id },
          update: {
            $set: {
              ...(item.interviewStatus !== undefined && { interviewStatus: String(item.interviewStatus).trim().toLowerCase() }),
              ...(item.queueDepartment !== undefined && { queueDepartment: String(item.queueDepartment).trim() }),
              ...(item.queueAddedAt !== undefined && { queueAddedAt: item.queueAddedAt ? new Date(item.queueAddedAt) : null }),
              ...(item.queueOrder !== undefined && { queueOrder: Number(item.queueOrder) || 0 }),
              ...(item.interviewCompletedAt !== undefined && { interviewCompletedAt: item.interviewCompletedAt ? new Date(item.interviewCompletedAt) : null }),
            },
          },
        },
      }));

      await RecruitmentApplication.bulkWrite(bulkOps);

      return NextResponse.json({
        success: true,
        message: "Queue updated successfully.",
      });
    }

    const {
      applicationId,
      department,
      year,
      responses,
      points,
      comments,
      feedback,
      positiveRemarks,
      negativeRemarks,
      interviewSlot,
      interviewStatus,
      queueDepartment,
      queueAddedAt,
      queueOrder,
      interviewCompletedAt,
    } = body || {};

    if (!applicationId) {
      return NextResponse.json(
        { success: false, message: "Application ID is required." },
        { status: 400 }
      );
    }

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

    if (responses && typeof responses === "object") {
      const updatedResponses = {
        ...(application.responses || {}),
        ...responses,
      };
      if (year) {
        updatedResponses.year = year;
      }
      application.responses = updatedResponses;
      application.markModified("responses");
    }

    if (department !== undefined) {
      application.department = String(department).trim();
    }
    if (year !== undefined) {
      application.year = String(year).trim();
    }

    // Evaluation fields (points, comments, feedback, positiveRemarks, negativeRemarks)
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

    if (interviewStatus !== undefined) {
      application.interviewStatus = String(interviewStatus).trim().toLowerCase();
    }
    if (queueDepartment !== undefined) {
      application.queueDepartment = String(queueDepartment).trim();
    }
    if (queueAddedAt !== undefined) {
      application.queueAddedAt = queueAddedAt ? new Date(queueAddedAt) : null;
    }
    if (queueOrder !== undefined) {
      application.queueOrder = Number(queueOrder) || 0;
    }
    if (interviewCompletedAt !== undefined) {
      application.interviewCompletedAt = interviewCompletedAt ? new Date(interviewCompletedAt) : null;
    }

    if (
      points !== undefined ||
      comments !== undefined ||
      feedback !== undefined ||
      positiveRemarks !== undefined ||
      negativeRemarks !== undefined
    ) {
      application.evaluatedBy = authResult.session?.user?.username || "admin";
      application.evaluatedAt = new Date();
    }

    await application.save();

    return NextResponse.json(
      {
        success: true,
        message: "Application updated successfully.",
        data: application,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
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
