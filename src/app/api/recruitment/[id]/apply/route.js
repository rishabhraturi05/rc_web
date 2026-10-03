import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import RecruitmentConfig from "@/app/models/RecruitmentConfig";
import RecruitmentApplication from "@/app/models/RecruitmentApplication";
import { isRecruitmentActive, validateRecruitmentFieldValue } from "@/app/lib/recruitment";

const STUDENT_EMAIL_REGEX = /^[a-z0-9._%+-]+@student\.nitw\.ac\.in$/i;

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { department, responses } = body || {};

    await connectDB();

    const form = await RecruitmentConfig.findById(id);
    if (!form) {
      return NextResponse.json(
        { success: false, message: "Recruitment form not found" },
        { status: 404 }
      );
    }

    if (!isRecruitmentActive(form)) {
      return NextResponse.json(
        { success: false, message: "This recruitment form is currently closed." },
        { status: 403 }
      );
    }

    const availableDepartments = Array.isArray(form.departments) ? form.departments : [];
    if (!department || !availableDepartments.includes(String(department).trim())) {
      return NextResponse.json(
        { success: false, message: "Please choose a valid department for this application." },
        { status: 400 }
      );
    }

    const cleanedResponses = responses && typeof responses === "object" ? responses : {};
    const validatedResponses = {};
    const emailFieldNames = [];
    let applicantEmail = "";

    for (const field of form.fields || []) {
      if (String(field?.name || "").trim().toLowerCase() === "department") {
        continue;
      }

      if (String(field?.type || "").trim().toLowerCase() === "email" && field?.name) {
        emailFieldNames.push(field.name);
      }

      const fieldValue = cleanedResponses[field.name];
      const validation = validateRecruitmentFieldValue(field, fieldValue);

      if (!validation.valid) {
        return NextResponse.json(
          { success: false, message: validation.message || `Invalid value for ${field.label || field.name}.` },
          { status: 400 }
        );
      }

      if (field.type === "checkbox") {
        validatedResponses[field.name] = Boolean(validation.value);
      } else if (field.type === "email") {
        const normalizedEmailValue = String(validation.value || "").trim().toLowerCase();
        validatedResponses[field.name] = normalizedEmailValue;
        if (!applicantEmail && normalizedEmailValue) {
          applicantEmail = normalizedEmailValue;
        }
      } else if (field.type === "number") {
        if (fieldValue !== undefined && fieldValue !== null && fieldValue !== "") {
          validatedResponses[field.name] = Number(validation.value);
        } else {
          validatedResponses[field.name] = "";
        }
      } else {
        validatedResponses[field.name] = validation.value;
      }
    }

    if (!applicantEmail) {
      return NextResponse.json(
        { success: false, message: "A college email is required to apply." },
        { status: 400 }
      );
    }

    if (!STUDENT_EMAIL_REGEX.test(applicantEmail)) {
      return NextResponse.json(
        { success: false, message: "Please use your college email ID (@student.nitw.ac.in)." },
        { status: 400 }
      );
    }

    if (emailFieldNames.length) {
      const duplicateQuery = {
        formId: form._id,
        $or: emailFieldNames.map((fieldName) => ({ [`responses.${fieldName}`]: applicantEmail })),
      };

      const existingApplication = await RecruitmentApplication.findOne(duplicateQuery).lean();
      if (existingApplication) {
        return NextResponse.json(
          { success: false, message: "You have already applied for this form." },
          { status: 409 }
        );
      }
    }

    const application = await RecruitmentApplication.create({
      formId: form._id,
      department: String(department).trim(),
      responses: validatedResponses,
    });

    return NextResponse.json(
      { success: true, data: application },
      { status: 201 }
    );
  } catch (error) {
    console.error("SUBMIT RECRUITMENT APPLICATION ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
