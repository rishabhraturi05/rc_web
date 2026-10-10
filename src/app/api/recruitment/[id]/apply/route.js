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
    const { departments, department, year, responses } = body || {};
    const depts = departments || (department ? [department] : []);

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
    if (!depts || depts.length === 0 || depts.length > 2) {
      return NextResponse.json(
        { success: false, message: "Please select 1 or 2 valid departments." },
        { status: 400 }
      );
    }

    for (const d of depts) {
      if (!availableDepartments.includes(String(d).trim())) {
        return NextResponse.json(
          { success: false, message: `Please choose a valid department for this application: ${d}.` },
          { status: 400 }
        );
      }
    }

    const availableYears =
      Array.isArray(form.years) && form.years.length
        ? form.years
        : ["1st Year", "2nd Year", "3rd Year", "4th Year"];
    const applicantYear = String(year || responses?.year || "").trim();

    if (!applicantYear) {
      return NextResponse.json(
        {
          success: false,
          message: "Year of study is a mandatory field. Please select your year of study.",
        },
        { status: 400 }
      );
    }

    if (!availableYears.includes(applicantYear)) {
      return NextResponse.json(
        {
          success: false,
          message: `Year "${applicantYear}" is not allowed for this recruitment form. Allowed years: ${availableYears.join(", ")}.`,
        },
        { status: 403 }
      );
    }

    const cleanedResponses = responses && typeof responses === "object" ? responses : {};
    const validatedResponses = {};
    const emailFieldNames = [];
    let applicantEmail = "";

    for (const field of form.fields || []) {
      if (["department", "year"].includes(String(field?.name || "").trim().toLowerCase())) {
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
      const whatsappLink =
        process.env.NEXT_PUBLIC_RECRUITMENT_WHATSAPP_LINK ||
        process.env.RECRUITMENT_WHATSAPP_LINK ||
        "https://chat.whatsapp.com/FoMYMW3X0DnK4EpoeSO9Em?s=sw&p=a&mlu=4&ilr=4";

      for (const d of depts) {
        const duplicateQuery = {
          formId: form._id,
          department: String(d).trim(),
          $or: emailFieldNames.map((fieldName) => ({ [`responses.${fieldName}`]: applicantEmail })),
        };

        const existingApplication = await RecruitmentApplication.findOne(duplicateQuery).lean();
        if (existingApplication) {
          return NextResponse.json(
            {
              success: true,
              alreadyApplied: true,
              message: `You are already registered for ${d} department.`,
              department: existingApplication.department || d,
              year: existingApplication.year || applicantYear,
              data: existingApplication,
              whatsappLink,
            },
            { status: 200 }
          );
        }
      }
    }

    const createdApplications = [];
    for (const d of depts) {
      const application = await RecruitmentApplication.create({
        formId: form._id,
        department: String(d).trim(),
        year: applicantYear,
        responses: {
          ...validatedResponses,
          year: applicantYear,
        },
      });
      createdApplications.push(application);
    }

    const whatsappLink =
      process.env.NEXT_PUBLIC_RECRUITMENT_WHATSAPP_LINK ||
      process.env.RECRUITMENT_WHATSAPP_LINK ||
      "https://chat.whatsapp.com/FoMYMW3X0DnK4EpoeSO9Em?s=sw&p=a&mlu=4&ilr=4";

    return NextResponse.json(
      { 
        success: true, 
        data: createdApplications.length === 1 ? createdApplications[0] : createdApplications, 
        department: depts.join(" & "),
        whatsappLink 
      },
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
