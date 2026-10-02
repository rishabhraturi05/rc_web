import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import RecruitmentConfig from "@/app/models/RecruitmentConfig";
import RecruitmentApplication from "@/app/models/RecruitmentApplication";
import { isRecruitmentActive, validateRecruitmentFieldValue } from "@/app/lib/recruitment";

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

    for (const field of form.fields || []) {
      if (String(field?.name || "").trim().toLowerCase() === "department") {
        continue;
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
