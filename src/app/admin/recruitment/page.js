"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  FaArrowLeft,
  FaDownload,
  FaEdit,
  FaPlus,
  FaTimes,
  FaTrash,
  FaLock,
  FaLockOpen,
  FaFileAlt,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import {
  DEFAULT_DEPARTMENT_OPTIONS,
  ensureDefaultRecruitmentFields,
  getVisibleApplicationFields,
} from "@/app/lib/recruitment";

const DEFAULT_DEADLINE = "2026-12-31T23:59";

const createFieldId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const blankField = () => ({
  id: createFieldId(),
  name: "",
  label: "",
  type: "text",
  required: false,
  options: "",
});

const blankForm = {
  isOpen: true,
  deadline: DEFAULT_DEADLINE,
  departments: [...DEFAULT_DEPARTMENT_OPTIONS],
  fields: [
    { ...blankField(), name: "name", label: "Name", type: "text", required: true },
    { ...blankField(), name: "email", label: "Email", type: "email", required: true },
    { ...blankField(), name: "rollno", label: "Roll Number", type: "text", required: true },
  ],
};

const fieldTypeOptions = [
  { label: "Text", value: "text" },
  { label: "Email", value: "email" },
  { label: "Number", value: "number" },
  { label: "Textarea", value: "textarea" },
  { label: "Select", value: "select" },
  { label: "Radio", value: "radio" },
  { label: "Checkbox", value: "checkbox" },
];

function formatFieldOptions(rawOptions) {
  return String(rawOptions || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildSheetRows(form, applications) {
  const fieldHeaders = (form?.fields || [])
    .filter((field) => String(field?.name || "").trim().toLowerCase() !== "department")
    .map((field) => ({
      key: field.name || field.label,
      label: field.label || field.name,
    }));

  const rows = applications.map((application) => {
    const row = {
      "Application Time": new Date(application.createdAt).toLocaleString(),
      Department: application.department,
    };

    (fieldHeaders || []).forEach(({ key, label }) => {
      const rawValue = application.responses?.[key];
      row[label] =
        typeof rawValue === "boolean"
          ? rawValue ? "Yes" : "No"
          : rawValue === undefined || rawValue === null
            ? ""
            : String(rawValue);
    });

    return row;
  });

  return rows;
}

export default function RecruitmentAdminPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [forms, setForms] = useState([]);
  const [activeFormId, setActiveFormId] = useState("");
  const [applications, setApplications] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [editor, setEditor] = useState(blankForm);
  const [editingId, setEditingId] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated" || session?.user?.role !== "admin") {
      router.push("/admin/login");
      return;
    }
    fetchForms();
  }, [status, session, router]);

  const activeForms = useMemo(
    () => forms.filter((form) => form.isOpen && (!form.deadline || new Date(form.deadline) > new Date())),
    [forms]
  );

  const closedForms = useMemo(
    () => forms.filter((form) => !form.isOpen || (form.deadline && new Date(form.deadline) <= new Date())),
    [forms]
  );

  const selectedForm = useMemo(
    () => forms.find((form) => form._id === activeFormId) || null,
    [forms, activeFormId]
  );

  const visibleFields = useMemo(() => {
    return getVisibleApplicationFields(selectedForm);
  }, [selectedForm]);

  const filteredApplications = useMemo(() => {
    if (!applications.length) return [];
    if (selectedDepartment === "all") return applications;
    return applications.filter((application) => application.department === selectedDepartment);
  }, [applications, selectedDepartment]);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/recruitment");
      const result = await response.json();

      if (!result.success) {
        if (response.status === 401) {
          router.push("/admin/login");
        }
        return;
      }

      const fetchedForms = result.data || [];
      setForms(fetchedForms);

      if (fetchedForms.length) {
        const stillExists = fetchedForms.find((f) => f._id === activeFormId);
        const formToSelect = stillExists || fetchedForms[0];
        setActiveFormId(formToSelect._id);
        await fetchApplications(formToSelect._id);
      } else {
        setActiveFormId("");
        setApplications([]);
        setSelectedDepartment("all");
      }
    } catch (error) {
      console.error("Fetch forms error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async (formId) => {
    try {
      const response = await fetch(`/api/admin/recruitment/${formId}/applications`);
      const result = await response.json();

      if (!result.success) {
        setApplications([]);
        return;
      }

      setApplications(result.data.applications || []);
      const form = result.data.form;
      const departmentOptions = Array.isArray(form?.departments) ? form.departments : [];
      setSelectedDepartment(
        departmentOptions.includes(selectedDepartment) ? selectedDepartment : "all"
      );
    } catch (error) {
      console.error("Fetch applications error:", error);
      setApplications([]);
    }
  };

  const openEditor = (form = null) => {
    setMessage("");
    if (!form) {
      setEditingId(null);
      setEditor({
        ...blankForm,
        deadline: DEFAULT_DEADLINE,
        departments: [...DEFAULT_DEPARTMENT_OPTIONS],
        fields: [
          { ...blankField(), name: "name", label: "Name", type: "text", required: true },
          { ...blankField(), name: "email", label: "Email", type: "email", required: true },
          { ...blankField(), name: "rollno", label: "Roll Number", type: "text", required: true },
        ],
      });
      setShowEditor(true);
      return;
    }

    setEditingId(form._id);
    const formFields = ensureDefaultRecruitmentFields(form.fields || [])
      .filter((field) => String(field?.name || "").trim().toLowerCase() !== "department")
      .map((field) => ({
        id: createFieldId(),
        name: field.name || "",
        label: field.label || "",
        type: field.type || "text",
        required: Boolean(field.required),
        options: Array.isArray(field.options) ? field.options.join(", ") : "",
      }));

    setEditor({
      isOpen: Boolean(form.isOpen),
      deadline: form.deadline ? new Date(form.deadline).toISOString().slice(0, 16) : DEFAULT_DEADLINE,
      departments: Array.isArray(form.departments) && form.departments.length ? form.departments : [...DEFAULT_DEPARTMENT_OPTIONS],
      fields: formFields,
    });
    setShowEditor(true);
  };

  const closeEditor = () => {
    setShowEditor(false);
    setEditingId(null);
    setEditor(blankForm);
  };

  const updateField = (index, key, value) => {
    setEditor((previous) => ({
      ...previous,
      fields: previous.fields.map((field, fieldIndex) =>
        fieldIndex === index ? { ...field, [key]: value } : field
      ),
    }));
  };

  const addField = () => {
    setEditor((previous) => ({
      ...previous,
      fields: [...previous.fields, blankField()],
    }));
  };

  const removeField = (index) => {
    const field = editor.fields[index];
    const defaultNames = new Set(["name", "email", "department", "rollno"]);
    if (field && defaultNames.has(String(field.name || "").trim().toLowerCase())) {
      setMessage("Default fields cannot be removed.");
      return;
    }

    setEditor((previous) => ({
      ...previous,
      fields: previous.fields.filter((_, fieldIndex) => fieldIndex !== index),
    }));
  };

  const saveForm = async () => {
    const cleanedFields = editor.fields
      .map((field) => ({
        id: field.id,
        name: String(field.name || "").trim(),
        label: String(field.label || "").trim(),
        type: field.type || "text",
        required: Boolean(field.required),
        options: formatFieldOptions(field.options),
      }))
      .filter((field) => field.name && field.label)
      .filter((field) => String(field.name).trim().toLowerCase() !== "department");

    const departments = Array.isArray(editor.departments)
      ? editor.departments
          .map((department) => String(department).trim())
          .filter(Boolean)
      : [];

    const finalFields = ensureDefaultRecruitmentFields(cleanedFields).map((field) => ({
      name: field.name,
      label: field.label,
      type: field.type,
      required: field.required,
      options: Array.isArray(field.options) ? field.options : [],
    }));

    if (!finalFields.length || !departments.length) {
      setMessage("A form must include at least the default fields and one department.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const payload = {
        isOpen: editor.isOpen,
        deadline: editor.deadline ? new Date(editor.deadline).toISOString() : new Date(DEFAULT_DEADLINE).toISOString(),
        fields: finalFields,
        departments,
      };

      const endpoint = editingId ? `/api/admin/recruitment/${editingId}` : "/api/admin/recruitment";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!result.success) {
        setMessage(result.message || "Failed to save recruitment form.");
        return;
      }

      setMessage(editingId ? "Recruitment form updated successfully." : "Recruitment form created successfully.");
      closeEditor();
      await fetchForms();
    } catch (error) {
      console.error("Save recruitment form error:", error);
      setMessage("Failed to save recruitment form.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleFormStatus = async (form) => {
    try {
      const nextStatus = !form.isOpen;
      const response = await fetch(`/api/admin/recruitment/${form._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOpen: nextStatus }),
      });
      const result = await response.json();

      if (result.success) {
        setMessage(`Form has been marked as ${nextStatus ? "open" : "closed"}.`);
        await fetchForms();
      } else {
        setMessage(result.message || "Failed to update form status.");
      }
    } catch (error) {
      console.error("Toggle form status error:", error);
      setMessage("Failed to update form status.");
    }
  };

  const deleteForm = async (formId) => {
    const safe = window.confirm(
      "Are you sure you want to permanently delete this recruitment form and all applications submitted to it? This action cannot be undone."
    );

    if (!safe) return;

    try {
      const response = await fetch(`/api/admin/recruitment/${formId}`, { method: "DELETE" });
      const result = await response.json();

      if (!result.success) {
        setMessage(result.message || "Failed to delete form.");
        return;
      }

      setMessage("Recruitment form and its applications were deleted permanently.");
      if (activeFormId === formId) {
        setActiveFormId("");
        setApplications([]);
      }
      await fetchForms();
    } catch (error) {
      console.error("Delete form error:", error);
      setMessage("Failed to delete form.");
    }
  };

  const exportSelectedForm = () => {
    if (!filteredApplications.length) {
      setMessage("No applications available for the current filter.");
      return;
    }

    if (!selectedForm) return;

    const workbook = XLSX.utils.book_new();
    const rows = buildSheetRows(selectedForm, filteredApplications);
    const worksheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Recruitment");
    XLSX.writeFile(
      workbook,
      `${selectedForm.departments?.join("_") || "recruitment"}_${selectedDepartment === "all" ? "all" : selectedDepartment}.xlsx`
    );
  };

  const exportAllForms = async () => {
    try {
      const mergedRows = [];

      for (const form of forms) {
        const response = await fetch(`/api/admin/recruitment/${form._id}/applications`);
        const result = await response.json();

        if (result.success) {
          mergedRows.push(...buildSheetRows(form, result.data.applications || []));
        }
      }

      if (!mergedRows.length) {
        setMessage("No applications are available to export.");
        return;
      }

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(mergedRows);
      XLSX.utils.book_append_sheet(workbook, worksheet, "AllApplications");
      XLSX.writeFile(workbook, "rc_recruitment_all_applications.xlsx");
    } catch (error) {
      console.error("Export all forms error:", error);
      setMessage("Failed to export all applications.");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="relative min-h-screen text-white flex items-center justify-center pt-24">
        <p className="font-mono text-gray-300 text-lg">Loading recruitment dashboard...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-white">
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pt-24 pb-12 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white font-mono text-sm mb-3 transition-colors"
            >
              <FaArrowLeft size={12} /> Back to Admin Panel
            </Link>
            <h1 className="font-mono text-4xl sm:text-5xl font-bold tracking-tight mb-2 text-white">
              {">_"} RECRUITMENT_MANAGEMENT
            </h1>
            <p className="font-mono text-gray-400 text-lg">
              Manage recruitment forms, deadlines, departments, and applications
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {!showEditor && (
              <button
                type="button"
                onClick={() => openEditor()}
                className="flex items-center gap-2 px-5 py-2.5 border border-white text-white bg-transparent rounded hover:bg-white hover:text-black transition-colors font-mono uppercase text-sm tracking-widest cursor-pointer"
              >
                <FaPlus /> [ + CREATE NEW FORM ]
              </button>
            )}
          </div>
        </div>

        {/* Message Banner */}
        {message && (
          <div className="mb-6 rounded-lg border border-white/30 bg-white/10 px-4 py-3 font-mono text-sm text-white flex items-center justify-between">
            <span>{message}</span>
            <button
              onClick={() => setMessage("")}
              className="text-gray-400 hover:text-white font-mono text-xs ml-4 cursor-pointer"
            >
              [ dismiss ]
            </button>
          </div>
        )}

        {/* Form Creator / Editor (Shown only when creating or editing a form) */}
        {showEditor && (
          <div className="mb-10 glass-panel p-6 sm:p-8 border border-white/30">
            <div className="flex items-center justify-between gap-4 mb-6 border-b border-white/15 pb-4">
              <div>
                <h2 className="font-mono text-2xl font-bold uppercase tracking-wider text-white">
                  {editingId ? "[ EDIT RECRUITMENT FORM ]" : "[ CREATE NEW RECRUITMENT FORM ]"}
                </h2>
                <p className="font-mono text-xs text-gray-400 mt-1">
                  Configure form status, application deadline, eligible departments, and custom questions.
                </p>
              </div>
              <button
                type="button"
                onClick={closeEditor}
                className="flex items-center gap-2 px-3 py-1.5 border border-white/20 text-gray-300 rounded hover:border-white hover:text-white font-mono text-xs uppercase tracking-widest transition-colors cursor-pointer"
              >
                <FaTimes /> Cancel
              </button>
            </div>

            <div className="space-y-6">
              <label className="flex items-center gap-3 font-mono text-sm text-white cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={editor.isOpen}
                  onChange={(event) => setEditor((previous) => ({ ...previous, isOpen: event.target.checked }))}
                  className="h-4 w-4 accent-white rounded cursor-pointer"
                />
                <span>Form is open for submissions</span>
              </label>

              <div>
                <label className="mb-2 block font-mono text-sm text-gray-300 uppercase tracking-wider">
                  Submission Deadline
                </label>
                <input
                  type="datetime-local"
                  value={editor.deadline}
                  onChange={(event) => setEditor((previous) => ({ ...previous, deadline: event.target.value }))}
                  className="w-full sm:w-80 rounded border border-white/20 bg-black/40 px-3 py-2 font-mono text-sm text-white focus:border-white focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block font-mono text-sm text-gray-300 uppercase tracking-wider">
                  Available Departments
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded border border-white/20 bg-black/40 p-4">
                  {DEFAULT_DEPARTMENT_OPTIONS.map((department) => (
                    <label key={department} className="flex items-center gap-2 font-mono text-sm text-white cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={editor.departments.includes(department)}
                        onChange={(event) => {
                          const checked = event.target.checked;
                          setEditor((previous) => {
                            const nextDepartments = checked
                              ? [...previous.departments, department]
                              : previous.departments.filter((item) => item !== department);
                            return { ...previous, departments: nextDepartments };
                          });
                        }}
                        className="h-4 w-4 accent-white rounded cursor-pointer"
                      />
                      <span>{department}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block font-mono text-sm text-gray-300 uppercase tracking-wider">
                  Form Fields & Questions
                </label>
                <div className="space-y-4">
                  {editor.fields
                    .filter((field) => String(field.name || "").trim().toLowerCase() !== "department")
                    .map((field, index) => {
                      const isDefaultField = ["name", "email", "rollno"].includes(String(field.name || "").trim().toLowerCase());
                      return (
                        <div key={field.id || `${field.name || index}-field`} className="rounded border border-white/10 bg-black/30 p-4">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <span className="block font-mono text-xs text-gray-400 mb-1">Field Name (ID)</span>
                              <input
                                type="text"
                                value={field.name}
                                disabled={isDefaultField}
                                onChange={(event) => updateField(index, "name", event.target.value)}
                                className="w-full rounded border border-white/20 bg-black/40 px-3 py-2 font-mono text-sm text-white focus:border-white focus:outline-none disabled:opacity-50"
                                placeholder="field_name"
                              />
                            </div>
                            <div>
                              <span className="block font-mono text-xs text-gray-400 mb-1">Display Label</span>
                              <input
                                type="text"
                                value={field.label}
                                onChange={(event) => updateField(index, "label", event.target.value)}
                                className="w-full rounded border border-white/20 bg-black/40 px-3 py-2 font-mono text-sm text-white focus:border-white focus:outline-none"
                                placeholder="Field Label"
                              />
                            </div>
                          </div>

                          <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
                            <div>
                              <span className="block font-mono text-xs text-gray-400 mb-1">Input Type</span>
                              <select
                                value={field.type}
                                disabled={isDefaultField}
                                onChange={(event) => updateField(index, "type", event.target.value)}
                                className="w-full rounded border border-white/20 bg-black/40 px-3 py-2 font-mono text-sm text-white focus:border-white focus:outline-none disabled:opacity-50"
                              >
                                {fieldTypeOptions.map((option) => (
                                  <option key={option.value} value={option.value} className="bg-black text-white">
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="flex items-end">
                              <label className="flex items-center gap-2 rounded border border-white/15 bg-black/20 px-3 py-2 font-mono text-sm text-white cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={Boolean(field.required)}
                                  disabled={isDefaultField}
                                  onChange={(event) => updateField(index, "required", event.target.checked)}
                                  className="h-4 w-4 accent-white rounded cursor-pointer"
                                />
                                Required
                              </label>
                            </div>
                          </div>

                          {(field.type === "select" || field.type === "radio") && (
                            <div className="mt-3">
                              <span className="block font-mono text-xs text-gray-400 mb-1">Options (comma-separated)</span>
                              <input
                                type="text"
                                value={field.options}
                                onChange={(event) => updateField(index, "options", event.target.value)}
                                className="w-full rounded border border-white/20 bg-black/40 px-3 py-2 font-mono text-sm text-white focus:border-white focus:outline-none"
                                placeholder="Option 1, Option 2, Option 3"
                              />
                            </div>
                          )}

                          {!isDefaultField && (
                            <div className="mt-3 flex justify-end">
                              <button
                                type="button"
                                onClick={() => removeField(index)}
                                className="cursor-pointer font-mono text-xs text-red-400 hover:text-red-300 border border-red-500/30 rounded px-2.5 py-1 tracking-wider uppercase"
                              >
                                [ Remove Field ]
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/15">
                <button
                  type="button"
                  onClick={addField}
                  className="flex items-center gap-2 px-4 py-2 border border-white/20 text-white rounded hover:border-white font-mono text-xs uppercase tracking-widest transition-colors cursor-pointer"
                >
                  <FaPlus /> [ + Add Custom Field ]
                </button>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeEditor}
                    className="px-5 py-2 border border-white/20 text-gray-300 rounded hover:border-white hover:text-white font-mono text-xs uppercase tracking-widest transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveForm}
                    disabled={saving}
                    className="px-6 py-2 border border-white bg-white text-black font-mono text-xs uppercase tracking-widest font-bold rounded hover:bg-transparent hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {saving ? "Saving..." : editingId ? "[ UPDATE FORM ]" : "[ SAVE FORM ]"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Overview: 3 Main Options (Create Form, Open Forms, Closed Forms) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Option 1: Create Form Card */}
          <div
            onClick={() => openEditor()}
            className="glass-panel p-6 glass-panel-hover flex flex-col justify-between cursor-pointer border border-white/20 hover:border-white transition-all group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <FaFileAlt className="text-3xl text-white group-hover:scale-110 transition-transform" />
                <span className="font-mono text-xs uppercase tracking-widest text-gray-400 border border-white/10 px-2 py-0.5 rounded">
                  ACTION
                </span>
              </div>
              <h2 className="font-mono text-xl font-bold mb-2 text-white">CREATE_FORM</h2>
              <p className="font-mono text-gray-400 text-sm leading-relaxed mb-4">
                Set up a new recruitment drive with custom deadlines, department selections, and application questions.
              </p>
            </div>
            <button
              type="button"
              className="w-full mt-2 py-2 px-4 border border-white text-white rounded group-hover:bg-white group-hover:text-black font-mono text-xs uppercase tracking-widest transition-colors"
            >
              [ + START FORM ]
            </button>
          </div>

          {/* Option 2: Open Forms Card */}
          <div className="glass-panel p-6 border border-white/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <FaLockOpen className="text-3xl text-white" />
                <span className="font-mono text-xs uppercase tracking-widest text-white border border-white/40 bg-white/10 px-2.5 py-0.5 rounded">
                  {activeForms.length} OPEN
                </span>
              </div>
              <h2 className="font-mono text-xl font-bold mb-2 text-white">OPEN_FORMS</h2>
              <p className="font-mono text-gray-400 text-sm leading-relaxed mb-4">
                Currently accepting applications from candidates.
              </p>
            </div>

            <div className="space-y-3 mt-2 max-h-60 overflow-y-auto pr-1">
              {activeForms.length ? (
                activeForms.map((form) => {
                  const isSelected = form._id === activeFormId;
                  return (
                    <div
                      key={form._id}
                      className={`p-3 rounded border transition-all ${
                        isSelected
                          ? "border-white bg-white/10"
                          : "border-white/10 bg-black/40 hover:border-white/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            setActiveFormId(form._id);
                            await fetchApplications(form._id);
                          }}
                          className="text-left font-mono text-sm font-bold text-white hover:underline cursor-pointer"
                        >
                          {form.departments?.join(" + ") || "Recruitment Form"}
                        </button>
                      </div>
                      <p className="font-mono text-xs text-gray-400 mt-1">
                        {form.applicantCount || 0} applications • Deadline:{" "}
                        {form.deadline ? new Date(form.deadline).toLocaleDateString() : "No deadline"}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-white/10">
                        <button
                          type="button"
                          onClick={async () => {
                            setActiveFormId(form._id);
                            await fetchApplications(form._id);
                          }}
                          className="cursor-pointer font-mono text-[10px] uppercase tracking-wider text-white border border-white/20 hover:border-white rounded px-2 py-0.5"
                        >
                          {isSelected ? "Viewing" : "View"}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditor(form)}
                          className="cursor-pointer font-mono text-[10px] uppercase tracking-wider text-gray-300 hover:text-white border border-white/20 hover:border-white rounded px-2 py-0.5"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleFormStatus(form)}
                          className="cursor-pointer font-mono text-[10px] uppercase tracking-wider text-gray-300 hover:text-white border border-white/20 hover:border-white rounded px-2 py-0.5"
                        >
                          Close
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteForm(form._id)}
                          className="cursor-pointer font-mono text-[10px] uppercase tracking-wider text-red-400 hover:text-red-300 border border-red-500/30 rounded px-2 py-0.5"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="font-mono text-xs text-gray-400 py-3">No active open forms.</p>
              )}
            </div>
          </div>

          {/* Option 3: Closed Forms Card */}
          <div className="glass-panel p-6 border border-white/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <FaLock className="text-3xl text-gray-400" />
                <span className="font-mono text-xs uppercase tracking-widest text-gray-400 border border-white/10 bg-white/5 px-2.5 py-0.5 rounded">
                  {closedForms.length} CLOSED
                </span>
              </div>
              <h2 className="font-mono text-xl font-bold mb-2 text-white">CLOSED_FORMS</h2>
              <p className="font-mono text-gray-400 text-sm leading-relaxed mb-4">
                Completed drives or paused forms. You can reopen or export data.
              </p>
            </div>

            <div className="space-y-3 mt-2 max-h-60 overflow-y-auto pr-1">
              {closedForms.length ? (
                closedForms.map((form) => {
                  const isSelected = form._id === activeFormId;
                  return (
                    <div
                      key={form._id}
                      className={`p-3 rounded border transition-all ${
                        isSelected
                          ? "border-white bg-white/10"
                          : "border-white/10 bg-black/40 hover:border-white/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            setActiveFormId(form._id);
                            await fetchApplications(form._id);
                          }}
                          className="text-left font-mono text-sm font-bold text-gray-300 hover:text-white hover:underline cursor-pointer"
                        >
                          {form.departments?.join(" + ") || "Recruitment Form"}
                        </button>
                      </div>
                      <p className="font-mono text-xs text-gray-400 mt-1">
                        {form.applicantCount || 0} applications • Closed
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-white/10">
                        <button
                          type="button"
                          onClick={async () => {
                            setActiveFormId(form._id);
                            await fetchApplications(form._id);
                          }}
                          className="cursor-pointer font-mono text-[10px] uppercase tracking-wider text-white border border-white/20 hover:border-white rounded px-2 py-0.5"
                        >
                          {isSelected ? "Viewing" : "View"}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditor(form)}
                          className="cursor-pointer font-mono text-[10px] uppercase tracking-wider text-gray-300 hover:text-white border border-white/20 hover:border-white rounded px-2 py-0.5"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleFormStatus(form)}
                          className="cursor-pointer font-mono text-[10px] uppercase tracking-wider text-gray-300 hover:text-white border border-white/20 hover:border-white rounded px-2 py-0.5"
                        >
                          Reopen
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteForm(form._id)}
                          className="cursor-pointer font-mono text-[10px] uppercase tracking-wider text-red-400 hover:text-red-300 border border-red-500/30 rounded px-2 py-0.5"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="font-mono text-xs text-gray-400 py-3">No closed forms.</p>
              )}
            </div>
          </div>
        </div>

        {/* Applications Section for the Selected Form */}
        {selectedForm ? (
          <div className="glass-panel p-6 sm:p-8 border border-white/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="font-mono text-2xl font-bold uppercase tracking-wide text-white">
                    {">_"} APPLICATIONS
                  </h2>
                  <span className="font-mono text-xs border border-white/30 bg-white/10 px-2.5 py-0.5 rounded text-white">
                    {selectedForm.departments?.join(" + ") || "Form"}
                  </span>
                  <span
                    className={`font-mono text-xs border px-2 py-0.5 rounded ${
                      selectedForm.isOpen
                        ? "border-white/40 bg-white/10 text-white"
                        : "border-white/20 bg-white/5 text-gray-400"
                    }`}
                  >
                    {selectedForm.isOpen ? "OPEN" : "CLOSED"}
                  </span>
                </div>
                <p className="font-mono text-sm text-gray-400 mt-1">
                  Showing {filteredApplications.length} of {applications.length} submitted applications
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={exportSelectedForm}
                  className="flex items-center gap-2 px-4 py-2 border border-white/30 text-white rounded hover:border-white font-mono text-xs uppercase tracking-widest transition-colors cursor-pointer"
                >
                  <FaDownload /> [ Export Filtered ]
                </button>
                <button
                  type="button"
                  onClick={exportAllForms}
                  className="flex items-center gap-2 px-4 py-2 border border-white text-white rounded hover:bg-white hover:text-black font-mono text-xs uppercase tracking-widest transition-colors cursor-pointer"
                >
                  <FaDownload /> [ Export All Forms ]
                </button>
              </div>
            </div>

            {/* Department Filter */}
            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <label className="font-mono text-xs uppercase tracking-wider text-gray-400">
                Filter by department:
              </label>
              <select
                value={selectedDepartment}
                onChange={(event) => setSelectedDepartment(event.target.value)}
                className="rounded border border-white/20 bg-black/40 px-3 py-1.5 font-mono text-xs text-white focus:border-white focus:outline-none"
              >
                <option value="all" className="bg-black text-white">All departments ({applications.length})</option>
                {(selectedForm.departments || []).map((department) => {
                  const count = applications.filter((app) => app.department === department).length;
                  return (
                    <option key={department} value={department} className="bg-black text-white">
                      {department} ({count})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Applications Table */}
            <div className="overflow-x-auto rounded border border-white/10">
              <table className="min-w-full text-left font-mono text-sm">
                <thead>
                  <tr className="border-b border-white/15 bg-white/5 text-gray-300">
                    <th className="px-4 py-3 text-xs uppercase tracking-wider">Timestamp</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-wider">Department</th>
                    {visibleFields.map((field) => (
                      <th key={field.name} className="px-4 py-3 text-xs uppercase tracking-wider">
                        {field.label || field.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.length ? (
                    filteredApplications.map((application) => (
                      <tr
                        key={application._id}
                        className="border-b border-white/10 hover:bg-white/5 transition-colors text-gray-200"
                      >
                        <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                          {new Date(application.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="border border-white/20 px-2 py-0.5 rounded text-xs text-white">
                            {application.department}
                          </span>
                        </td>
                        {visibleFields.map((field) => (
                          <td
                            key={`${application._id}-${field.name}`}
                            className="px-4 py-3 max-w-xs truncate text-xs"
                            title={String(application.responses?.[field.name] ?? "")}
                          >
                            {typeof application.responses?.[field.name] === "boolean"
                              ? application.responses[field.name]
                                ? "Yes"
                                : "No"
                              : application.responses?.[field.name] ?? "-"}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={visibleFields.length + 2}
                        className="px-4 py-8 text-center text-gray-400 font-mono text-sm"
                      >
                        No applications match the selected department filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="glass-panel p-8 text-center border border-white/20">
            <p className="font-mono text-gray-400 text-sm">
              No recruitment form selected or created yet. Click <span className="text-white font-bold">[ + START FORM ]</span> to create your first recruitment drive.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
