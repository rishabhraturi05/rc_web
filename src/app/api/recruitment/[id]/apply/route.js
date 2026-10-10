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

    // Identify roll number fields and extract applicant roll number
    let applicantRoll = "";
    const rollFieldNames = ["rollno", "rollNumber", "roll_no", "roll"];
    for (const field of form.fields || []) {
      const fName = String(field?.name || "").toLowerCase();
      const fLabel = String(field?.label || "").toLowerCase();
      if (fName.includes("roll") || fLabel.includes("roll")) {
        if (!rollFieldNames.includes(field.name)) {
          rollFieldNames.push(field.name);
        }
      }
    }

    for (const name of rollFieldNames) {
      const val = validatedResponses[name] ?? cleanedResponses[name];
      if (val !== undefined && val !== null && String(val).trim()) {
        applicantRoll = String(val).trim().toLowerCase();
        break;
      }
    }

    // Constraint: If email OR roll number has already applied to this recruitment drive, cannot apply again
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const duplicateConditions = [];

    if (applicantEmail) {
      const emailRegex = new RegExp(`^\\s*${escapeRegex(applicantEmail.trim())}\\s*$`, "i");
      const targetEmailFields = Array.from(new Set([...emailFieldNames, "email"]));
      for (const fieldName of targetEmailFields) {
        duplicateConditions.push({ [`responses.${fieldName}`]: emailRegex });
      }
    }

    if (applicantRoll) {
      const rollRegex = new RegExp(`^\\s*${escapeRegex(applicantRoll.trim())}\\s*$`, "i");
      const targetRollFields = Array.from(new Set([...rollFieldNames, "rollno", "rollNumber"]));
      for (const fieldName of targetRollFields) {
        duplicateConditions.push({ [`responses.${fieldName}`]: rollRegex });
      }
    }

    if (duplicateConditions.length > 0) {
      const existingApplication = await RecruitmentApplication.findOne({
        formId: form._id,
        $or: duplicateConditions,
      }).lean();

      if (existingApplication) {
        const existingEmail = String(existingApplication.responses?.email || "").trim().toLowerCase();
        const existingRoll = String(
          existingApplication.responses?.rollno ||
          existingApplication.responses?.rollNumber ||
          existingApplication.responses?.roll ||
          ""
        ).trim().toLowerCase();

        const isEmailMatch = applicantEmail && (existingEmail === applicantEmail.toLowerCase());
        const isRollMatch = applicantRoll && (existingRoll === applicantRoll.toLowerCase());

        let duplicateMsg = "You have already applied. Each applicant can only submit one application.";
        if (isEmailMatch && isRollMatch) {
          duplicateMsg = `Application already submitted with email "${applicantEmail}" and roll number "${applicantRoll.toUpperCase()}". You cannot apply again.`;
        } else if (isEmailMatch) {
          duplicateMsg = `An application has already been submitted with email "${applicantEmail}". You cannot apply again.`;
        } else if (isRollMatch) {
          duplicateMsg = `An application has already been submitted with roll number "${applicantRoll.toUpperCase()}". You cannot apply again.`;
        }

        return NextResponse.json(
          {
            success: false,
            alreadyApplied: true,
            message: duplicateMsg,
            department: existingApplication.department,
            year: existingApplication.year || applicantYear,
            data: existingApplication,
          },
          { status: 400 }
        );
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
