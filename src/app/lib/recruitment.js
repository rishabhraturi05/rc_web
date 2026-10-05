export const VALID_RECRUITMENT_TYPES = [
  "text",
  "email",
  "number",
  "textarea",
  "select",
  "radio",
  "checkbox",
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

  return {
    title,
    isOpen: Boolean(payload.isOpen !== undefined ? payload.isOpen : true),
    deadline: deadlineValue && !Number.isNaN(deadlineValue.getTime()) ? deadlineValue : null,
    fields,
    departments: departments.length ? departments : DEFAULT_DEPARTMENT_OPTIONS,
    years: years.length ? years : DEFAULT_YEAR_OPTIONS,
  };
}

export function validateRecruitmentFieldValue(field, value) {
  if (!field || !field.name) return { valid: true, value };

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
