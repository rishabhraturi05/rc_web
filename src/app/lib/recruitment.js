export const VALID_RECRUITMENT_TYPES = [
  "text",
  "email",
  "number",
  "textarea",
  "select",
  "radio",
  "checkbox",
  "file",
  "pdf",
];

export const DEFAULT_DEPARTMENT_OPTIONS = [
  "Software",
  "Mechanical",
  "Embedded",
  "PR",
];

export const DEFAULT_YEAR_OPTIONS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
];

export const DEFAULT_RECRUITMENT_FIELDS = [
  { name: "name", label: "Name", type: "text", required: true, options: [] },
  { name: "email", label: "Email", type: "email", required: true, options: [] },
  { name: "rollno", label: "Roll Number", type: "text", required: true, options: [] },
];

export function isDepartmentField(field) {
  const n = String(field?.name || "").trim().toLowerCase();
  const l = String(field?.label || "").trim().toLowerCase();
  return n === "department" || l === "department";
}

export function isYearField(field) {
  const n = String(field?.name || "").trim().toLowerCase();
  const l = String(field?.label || "").trim().toLowerCase();
  return (
    n === "year" ||
    n === "year_of_study" ||
    n === "study_year" ||
    l === "year" ||
    l === "year of study" ||
    l.includes("year")
  );
}

export function ensureDefaultRecruitmentFields(fields = []) {
  const normalized = Array.isArray(fields)
    ? fields
        .map((field, index) => normalizeField(field, index))
        .filter((field) => !isDepartmentField(field) && !isYearField(field))
    : [];

  const defaultFields = DEFAULT_RECRUITMENT_FIELDS.map((field) => ({
    ...field,
    options: Array.isArray(field.options) ? [...field.options] : [],
  }));

  const merged = [...defaultFields];
  const seen = new Set(defaultFields.map((field) => field.name));

  for (const field of normalized) {
    if (!field?.name || seen.has(field.name)) continue;
    merged.push(field);
    seen.add(field.name);
  }

  return merged;
}

export function getVisibleApplicationFields(form) {
  const allFields = Array.isArray(form?.fields) ? form.fields : [];
  const names = new Set(["name", "email", "rollno"]);

  return allFields.filter((field) => {
    const normalizedName = normalizeFieldName(field?.name || field?.label || "");
    return names.has(normalizedName);
  });
}

export function normalizeFieldName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);
}

export function isRecruitmentActive(config, referenceDate = new Date()) {
  if (!config || !config.isOpen) return false;
  if (config.deadline) {
    return new Date(config.deadline) > referenceDate;
  }
  return true;
}

export function getRecruitmentFormTitle(form) {
  if (!form) return "Recruitment Form";

  const rawTitle = String(form.title || "").trim();
  if (rawTitle) {
    return rawTitle;
  }

  const departments = Array.isArray(form.departments) && form.departments.length
    ? form.departments.join(" + ")
    : "Recruitment";

  const years = Array.isArray(form.years) && form.years.length
    ? form.years.join(", ")
    : DEFAULT_YEAR_OPTIONS.join(", ");

  return `${departments} (${years})`;
}

export function normalizeField(field, index = 0) {
  const type = String(field?.type || "text").trim().toLowerCase();
  const label = String(field?.label || "").trim();
  const rawName = String(field?.name || "").trim();
  const name = normalizeFieldName(rawName || label || `field_${index + 1}`);

  const normalized = {
    name,
    label: label || rawName || `Field ${index + 1}`,
    type: VALID_RECRUITMENT_TYPES.includes(type) ? type : "text",
    required: Boolean(field?.required),
    options: Array.isArray(field?.options)
      ? field.options
          .map((option) => String(option).trim())
          .filter(Boolean)
      : [],
  };

  if (["select", "radio"].includes(normalized.type)) {
    normalized.options = normalized.options.slice(0, 50);
  }

  return normalized;
}

export function normalizeRecruitmentConfig(payload = {}) {
  const fields = ensureDefaultRecruitmentFields(payload.fields);

  const rawDepartments = Array.isArray(payload.departments)
    ? payload.departments
    : typeof payload.departments === "string"
      ? payload.departments.split(",")
      : DEFAULT_DEPARTMENT_OPTIONS;

  const departments = rawDepartments
    .map((department) => String(department).trim())
    .filter(Boolean)
    .filter((department, index, list) => list.indexOf(department) === index);

  const rawYears = Array.isArray(payload.years || payload.eligibleYears)
    ? (payload.years || payload.eligibleYears)
    : typeof (payload.years || payload.eligibleYears) === "string"
      ? (payload.years || payload.eligibleYears).split(",")
      : DEFAULT_YEAR_OPTIONS;

  const years = rawYears
    .map((year) => String(year).trim())
    .filter(Boolean)
    .filter((year, index, list) => list.indexOf(year) === index);

  const deadlineValue = payload.deadline ? new Date(payload.deadline) : null;
  const customTitle = String(payload.title || "").trim();
  const title = customTitle || getRecruitmentFormTitle({ departments, years });

  const whatsappLink = String(payload.whatsappLink || "").trim();
  const rawPocs = Array.isArray(payload.pocs) ? payload.pocs : [];
  const pocs = [
    {
      name: String(rawPocs[0]?.name || payload.poc1Name || "").trim(),
      phone: String(rawPocs[0]?.phone || payload.poc1Phone || "").trim(),
    },
    {
      name: String(rawPocs[1]?.name || payload.poc2Name || "").trim(),
      phone: String(rawPocs[1]?.phone || payload.poc2Phone || "").trim(),
    },
  ];

  return {
    title,
    isOpen: Boolean(payload.isOpen !== undefined ? payload.isOpen : true),
    deadline: deadlineValue && !Number.isNaN(deadlineValue.getTime()) ? deadlineValue : null,
    fields,
    departments: departments.length ? departments : DEFAULT_DEPARTMENT_OPTIONS,
    years: years.length ? years : DEFAULT_YEAR_OPTIONS,
    whatsappLink,
    pocs,
  };
}

export function validateRecruitmentFieldValue(field, value) {
  if (!field || !field.name) return { valid: true, value };

  if (field.type === "file" || field.type === "pdf") {
    const isObj = value && typeof value === "object";
    const hasObjFile = isObj && Boolean(value.url || value.fileId);
    const hasStrFile = typeof value === "string" && value.trim() !== "";
    const hasFile = hasObjFile || hasStrFile;

    if (field.required && !hasFile) {
      return {
        valid: false,
        message: `Please upload your ${field.label || "PDF file"}.`,
      };
    }

    return { valid: true, value: hasFile ? value : null };
  }

  const trimmedValue = value === undefined || value === null ? "" : String(value).trim();

  if (field.type === "checkbox") {
    return {
      valid: value === true || value === false || value === "true" || value === "false",
      value: value === true || value === "true",
    };
  }

  if (field.required && (value === undefined || value === null || trimmedValue === "")) {
    return { valid: false, message: `${field.label || field.name} is required.` };
  }

  if (field.type === "email" && trimmedValue) {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue);
    return { valid: emailOk, value: trimmedValue, message: emailOk ? "" : "Please enter a valid email address." };
  }

  if (field.type === "number" && trimmedValue !== "") {
    const numberOk = Number.isFinite(Number(trimmedValue));
    return { valid: numberOk, value: Number(trimmedValue), message: numberOk ? "" : "Please enter a valid number." };
  }

  if (["select", "radio"].includes(field.type) && trimmedValue) {
    const options = Array.isArray(field.options) ? field.options.map((option) => String(option).trim()) : [];
    if (options.length && !options.includes(trimmedValue)) {
      return { valid: false, value: trimmedValue, message: `Please choose a valid option for ${field.label || field.name}.` };
    }
  }

  return { valid: true, value: trimmedValue, message: "" };
}

/**
 * Extracts resume/PDF info from applicant responses
 */
export function getApplicantResumeInfo(responses = {}, formFields = []) {
  if (!responses || typeof responses !== "object") {
    return { hasResume: false, url: "", filename: "", label: "" };
  }

  // 1. Look for configured file/pdf fields in the form
  if (Array.isArray(formFields) && formFields.length > 0) {
    for (const field of formFields) {
      if (field.type === "file" || field.type === "pdf") {
        const val = responses[field.name] ?? responses[field.label];
        if (val) {
          if (typeof val === "object" && val.url) {
            return {
              hasResume: true,
              url: val.url,
              filename: val.filename || val.name || `${field.label || "Resume"}.pdf`,
              label: field.label || "Resume",
            };
          }
          if (typeof val === "string" && val.trim()) {
            return {
              hasResume: true,
              url: val.trim(),
              filename: `${field.label || "Resume"}.pdf`,
              label: field.label || "Resume",
            };
          }
        }
      }
    }
  }

  // 2. Look by common resume field names / labels
  const resumeKeys = ["resume", "cv", "resume_pdf", "pdf_resume", "resume_link", "portfolio_pdf"];
  for (const [key, val] of Object.entries(responses)) {
    const normalizedKey = key.toLowerCase();
    const isResumeKey = resumeKeys.some((rk) => normalizedKey.includes(rk));

    if (val && (isResumeKey || (typeof val === "object" && val.url))) {
      if (typeof val === "object" && val.url) {
        return {
          hasResume: true,
          url: val.url,
          filename: val.filename || val.name || "Resume.pdf",
          label: key,
        };
      }
      if (typeof val === "string" && val.trim()) {
        const s = val.trim();
        if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("/api/recruitment/files/")) {
          return {
            hasResume: true,
            url: s,
            filename: "Resume.pdf",
            label: key,
          };
        }
      }
    }
  }

  // 3. Fallback: Check any value ending with .pdf or starting with /api/recruitment/files/
  for (const [key, val] of Object.entries(responses)) {
    if (typeof val === "string" && (val.includes("/api/recruitment/files/") || val.toLowerCase().endsWith(".pdf"))) {
      return {
        hasResume: true,
        url: val,
        filename: "Resume.pdf",
        label: key,
      };
    }
  }

  return { hasResume: false, url: "", filename: "", label: "" };
}

export function normalizeToTimeInputValue(str) {
  if (!str || typeof str !== "string") return "";
  const trimmed = str.trim();
  if (!trimmed) return "";

  // 24h format HH:mm
  const match24 = trimmed.match(/^([01]?[0-9]|2[0-3]):([0-5][0-9])$/);
  if (match24) {
    return `${match24[1].padStart(2, "0")}:${match24[2]}`;
  }

  // 12h format e.g. "10:30 AM", "2:30 pm", "4:30PM"
  const match12 = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(am|pm)?$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = match12[2];
    const modifier = match12[3]?.toLowerCase();

    if (modifier === "pm" && hours < 12) hours += 12;
    if (modifier === "am" && hours === 12) hours = 0;

    return `${String(hours).padStart(2, "0")}:${minutes}`;
  }

  // Fallback: search for time substring like "4:30 PM" or "14:30" in text
  const matchSub = trimmed.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
  if (matchSub) {
    let hours = parseInt(matchSub[1], 10);
    const minutes = matchSub[2];
    const modifier = matchSub[3]?.toLowerCase();

    if (modifier === "pm" && hours < 12) hours += 12;
    if (modifier === "am" && hours === 12) hours = 0;

    return `${String(hours).padStart(2, "0")}:${minutes}`;
  }

  return "";
}

export function formatTimeSlot(timeStr) {
  if (!timeStr || typeof timeStr !== "string") return "Not Scheduled";
  const normalized = normalizeToTimeInputValue(timeStr);
  if (!normalized) return timeStr || "Not Scheduled";

  const [hStr, mStr] = normalized.split(":");
  let hours = parseInt(hStr, 10);
  const minutes = mStr;
  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${String(hours).padStart(2, "0")}:${minutes} ${period}`;
}

export function formatInterviewDate(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return "";
  const trimmed = dateStr.trim();
  if (!trimmed) return "";
  try {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  } catch {}
  return trimmed;
}

export function parseTimeSlotToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== "string") return null;
  const normalized = normalizeToTimeInputValue(timeStr);
  if (!normalized) return null;
  const parts = normalized.split(":");
  if (parts.length < 2) return null;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes)) return null;
  return hours * 60 + minutes;
}

export function getCandidateScoreInfo(app, edit) {
  const currentPos =
    edit?.positiveRemarks !== undefined
      ? edit.positiveRemarks
      : Array.isArray(app?.positiveRemarks)
      ? app.positiveRemarks
      : [];
  const currentNeg =
    edit?.negativeRemarks !== undefined
      ? edit.negativeRemarks
      : Array.isArray(app?.negativeRemarks)
      ? app.negativeRemarks
      : [];

  const hasRemarks = currentPos.length > 0 || currentNeg.length > 0;
  const currentPoints = edit?.points !== undefined ? edit.points : app?.points;
  const hasPoints =
    currentPoints !== undefined &&
    currentPoints !== null &&
    String(currentPoints).trim() !== "";
  const currentComments =
    edit?.comments !== undefined ? edit.comments : app?.comments;
  const hasComments = Boolean(currentComments && String(currentComments).trim() !== "");

  const currentFeedback = edit?.feedback !== undefined ? edit.feedback : app?.feedback;
  const hasFeedback = Boolean(
    currentFeedback &&
    String(currentFeedback).trim() !== "" &&
    !["pending", "none", "null", "undefined"].includes(String(currentFeedback).trim().toLowerCase())
  );

  const currentEvaluator = edit?.evaluatedBy !== undefined ? edit.evaluatedBy : app?.evaluatedBy;
  const hasEvaluator = Boolean(
    currentEvaluator &&
    String(currentEvaluator).trim() !== "" &&
    !["pending", "none", "null", "undefined"].includes(String(currentEvaluator).trim().toLowerCase())
  );

  let scoreNum = null;
  let scoreFormatted = "—";
  const isEvaluated = Boolean(hasRemarks || hasPoints || hasComments || hasFeedback || hasEvaluator);

  if (hasRemarks) {
    scoreNum = currentPos.length - currentNeg.length;
    scoreFormatted = scoreNum > 0 ? `+${scoreNum}` : `${scoreNum}`;
  } else if (hasPoints) {
    const parsed = parseFloat(currentPoints);
    if (!Number.isNaN(parsed)) {
      scoreNum = parsed;
      scoreFormatted = parsed > 0 ? `+${parsed}` : `${parsed}`;
    } else {
      scoreFormatted = String(currentPoints);
    }
  }

  let status = "pending";
  if (scoreNum !== null) {
    if (scoreNum > 0) status = "positive";
    else if (scoreNum === 0) status = "zero";
    else status = "negative";
  } else if (isEvaluated) {
    status = "zero";
  }

  return {
    scoreNum,
    scoreFormatted,
    isEvaluated,
    status, // 'positive' (>0), 'zero' (=0), 'negative' (<0), 'pending'
    posCount: currentPos.length,
    negCount: currentNeg.length,
    points: currentPoints || "",
    comments: currentComments || "",
    feedback: currentFeedback || "",
    evaluatedBy: currentEvaluator || "",
    evaluatedAt: app?.evaluatedAt || null,
  };
}



