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

export const DEFAULT_RECRUITMENT_FIELDS = [
  { name: "name", label: "Name", type: "text", required: true, options: [] },
  { name: "rollno", label: "Roll Number", type: "text", required: true, options: [] },
];

export function ensureDefaultRecruitmentFields(fields = []) {
  const normalized = Array.isArray(fields)
    ? fields
        .map((field, index) => normalizeField(field, index))
        .filter((field) => String(field?.name || "").trim().toLowerCase() !== "department")
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
  const names = new Set(["name", "rollno"]);

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

  const deadlineValue = payload.deadline ? new Date(payload.deadline) : null;

  return {
    isOpen: Boolean(payload.isOpen !== undefined ? payload.isOpen : true),
    deadline: deadlineValue && !Number.isNaN(deadlineValue.getTime()) ? deadlineValue : null,
    fields,
    departments: departments.length ? departments : DEFAULT_DEPARTMENT_OPTIONS,
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
