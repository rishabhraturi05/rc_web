"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FaDownload, FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import * as XLSX from "xlsx";
import { DEFAULT_DEPARTMENT_OPTIONS, ensureDefaultRecruitmentFields, getVisibleApplicationFields } from "@/app/lib/recruitment";

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

  const visibleFields = useMemo(() => {
    const form = forms.find((item) => item._id === activeFormId);
    return getVisibleApplicationFields(form);
  }, [forms, activeFormId]);

  const isFormClosed = (form) => !form?.isOpen || (form?.deadline && new Date(form.deadline) <= new Date());

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

      setForms(result.data || []);
      if (result.data?.length) {
        const defaultForm = result.data[0];
        setActiveFormId(defaultForm._id);
        await fetchApplications(defaultForm._id);
      } else {
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
    if (!form) {
      setEditingId(null);
      setEditor({
        ...blankForm,
        deadline: DEFAULT_DEADLINE,
        departments: [...DEFAULT_DEPARTMENT_OPTIONS],
        fields: [
          { ...blankField(), name: "name", label: "Name", type: "text", required: true },
          { ...blankField(), name: "rollno", label: "Roll Number", type: "text", required: true },
        ],
      });
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
    const defaultNames = new Set(["name", "department", "rollno"]);
    if (field && defaultNames.has(String(field.name || "").trim().toLowerCase())) {
      setMessage("The default fields cannot be removed.");
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

      setMessage(editingId ? "Recruitment form updated." : "Recruitment form created.");
      setEditingId(null);
      setEditor({
        ...blankForm,
        deadline: DEFAULT_DEADLINE,
        departments: [...DEFAULT_DEPARTMENT_OPTIONS],
        fields: [
          { ...blankField(), name: "name", label: "Name", type: "text", required: true },
          { ...blankField(), name: "rollno", label: "Roll Number", type: "text", required: true },
        ],
      });
      await fetchForms();
    } catch (error) {
      console.error("Save recruitment form error:", error);
      setMessage("Failed to save recruitment form.");
    } finally {
      setSaving(false);
    }
  };

  const deleteForm = async (formId) => {
    const targetForm = forms.find((form) => form._id === formId);
    if (!targetForm) return;

    const isClosed = !targetForm.isOpen || (targetForm.deadline && new Date(targetForm.deadline) <= new Date());
    if (!isClosed) {
      setMessage("Open forms cannot be deleted. Close the form first, then delete it.");
      return;
    }

    const safe = window.confirm(
      "Delete this closed form permanently? This will also delete all applications belonging to it. Download the Excel file first if you need a backup."
    );

    if (!safe) return;

    try {
      const response = await fetch(`/api/admin/recruitment/${formId}`, { method: "DELETE" });
      const result = await response.json();

      if (!result.success) {
        setMessage(result.message || "Failed to delete form.");
        return;
      }

      setMessage("Closed form and its applications were deleted permanently.");
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

    const selectedForm = forms.find((form) => form._id === activeFormId);
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
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="font-mono text-gray-300">Loading recruitment dashboard...</p>
      </div>
    );
  }

  return (
    <div className="relative z-20 min-h-screen bg-black text-white px-4 sm:px-6 lg:px-8 py-24">
      <div className="relative z-30 max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-cyber font-mono text-sm uppercase tracking-[0.25em]">[ Admin ]</p>
            <h1 className="mt-2 text-4xl font-bold uppercase tracking-tight">Recruitment Dashboard</h1>
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200">
            {message}
          </div>
        )}

        <div className="relative z-40 grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          <div className="relative z-50 space-y-6">
            <div className="glass-panel p-5">
              <h2 className="mb-4 text-lg font-bold uppercase tracking-[0.15em] text-cyan-300">Open Forms</h2>
              <div className="space-y-3">
                {activeForms.length ? (
                  activeForms.map((form) => (
                    <div key={form._id} className="rounded-xl border border-white/10 bg-black/40 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            setActiveFormId(form._id);
                            await fetchApplications(form._id);
                          }}
                          className="cursor-pointer text-left font-mono text-sm text-white hover:text-cyan-300"
                        >
                          {form.departments?.join(" + ") || "Form"}
                        </button>
                        <span className="rounded-full border border-green-500/50 bg-green-500/10 px-2 py-1 text-[10px] uppercase tracking-widest text-green-300">
                          Open
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-gray-300">
                        {form.applicantCount || 0} applications
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button type="button" onClick={() => openEditor(form)} className="cursor-pointer flex items-center gap-1 rounded border border-white/10 px-2 py-1 text-[10px] uppercase tracking-widest text-gray-200">
                          <FaEdit /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            setActiveFormId(form._id);
                            await fetchApplications(form._id);
                          }}
                          className="cursor-pointer flex items-center gap-1 rounded border border-white/10 px-2 py-1 text-[10px] uppercase tracking-widest text-gray-200"
                        >
                          View
                        </button>
                        {isFormClosed(form) && (
                          <button type="button" onClick={() => deleteForm(form._id)} className="cursor-pointer flex items-center gap-1 rounded border border-red-500/40 px-2 py-1 text-[10px] uppercase tracking-widest text-red-300">
                            <FaTrash /> Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">No active forms.</p>
                )}
              </div>
            </div>

            <div className="glass-panel p-5">
              <h2 className="mb-4 text-lg font-bold uppercase tracking-[0.15em] text-cyan-300">Closed Forms</h2>
              <div className="space-y-3">
                {closedForms.length ? (
                  closedForms.map((form) => (
                    <div key={form._id} className="rounded-xl border border-white/10 bg-black/40 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            setActiveFormId(form._id);
                            await fetchApplications(form._id);
                          }}
                          className="cursor-pointer text-left font-mono text-sm text-white hover:text-cyan-300"
                        >
                          {form.departments?.join(" + ") || "Form"}
                        </button>
                        <span className="rounded-full border border-red-500/50 bg-red-500/10 px-2 py-1 text-[10px] uppercase tracking-widest text-red-300">
                          Closed
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-gray-300">
                        {form.applicantCount || 0} applications
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            setActiveFormId(form._id);
                            await fetchApplications(form._id);
                          }}
                          className="cursor-pointer flex items-center gap-1 rounded border border-white/10 px-2 py-1 text-[10px] uppercase tracking-widest text-gray-200"
                        >
                          View
                        </button>
                        <button type="button" onClick={() => deleteForm(form._id)} className="cursor-pointer flex items-center gap-1 rounded border border-red-500/40 px-2 py-1 text-[10px] uppercase tracking-widest text-red-300">
                          <FaTrash /> Delete
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">No closed forms.</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-panel p-5">
              <h2 className="mb-4 text-lg font-bold uppercase tracking-[0.15em] text-cyan-300">
                {editingId ? "Edit Form" : "Create Form"}
              </h2>

              <div className="space-y-4">
                <label className="flex items-center gap-3 text-sm text-gray-200">
                  <input
                    type="checkbox"
                    checked={editor.isOpen}
                    onChange={(event) => setEditor((previous) => ({ ...previous, isOpen: event.target.checked }))}
                    className="h-4 w-4 accent-cyan-400"
                  />
                  Form is open
                </label>

                <div>
                  <label className="mb-2 block text-sm text-gray-200">Deadline</label>
                  <input
                    type="datetime-local"
                    value={editor.deadline}
                    onChange={(event) => setEditor((previous) => ({ ...previous, deadline: event.target.value }))}
                    className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-200">Departments</label>
                  <div className="space-y-2 rounded-lg border border-white/20 bg-black/40 p-3">
                    {DEFAULT_DEPARTMENT_OPTIONS.map((department) => (
                      <label key={department} className="flex items-center gap-3 text-sm text-gray-200">
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
                          className="h-4 w-4 accent-cyan-400"
                        />
                        <span>{department}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {editor.fields
                    .filter((field) => String(field.name || "").trim().toLowerCase() !== "department")
                    .map((field, index) => (
                    <div key={field.id || `${field.name || index}-field`} className="rounded-lg border border-white/10 bg-black/30 p-3">
                      <div className="grid gap-3 md:grid-cols-2">
                        <input
                          type="text"
                          value={field.name}
                          onChange={(event) => updateField(index, "name", event.target.value)}
                          className="rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
                          placeholder="Field name"
                        />
                        <input
                          type="text"
                          value={field.label}
                          onChange={(event) => updateField(index, "label", event.target.value)}
                          className="rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
                          placeholder="Field label"
                        />
                      </div>

                      <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
                        <select
                          value={field.type}
                          onChange={(event) => updateField(index, "type", event.target.value)}
                          className="rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
                        >
                          {fieldTypeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>

                        <label className="flex items-center gap-2 rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-sm text-gray-200">
                          <input
                            type="checkbox"
                            checked={Boolean(field.required)}
                            onChange={(event) => updateField(index, "required", event.target.checked)}
                            className="h-4 w-4 accent-cyan-400"
                          />
                          Required
                        </label>
                      </div>

                      {field.type === "select" || field.type === "radio" ? (
                        <input
                          type="text"
                          value={field.options}
                          onChange={(event) => updateField(index, "options", event.target.value)}
                          className="mt-3 w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
                          placeholder="Options separated by commas"
                        />
                      ) : null}

                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeField(index)}
                          disabled={String(field.name || "").trim().toLowerCase() === "name" || String(field.name || "").trim().toLowerCase() === "department" || String(field.name || "").trim().toLowerCase() === "rollno"}
                          className="rounded border border-red-500/40 px-2 py-1 text-[10px] uppercase tracking-widest text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Remove Field
                        </button>
                      </div>
                    </div>
                    ))}
                </div>

                <button
                  type="button"
                  onClick={addField}
                  className="flex items-center gap-2 rounded border border-white/20 px-3 py-2 text-xs uppercase tracking-[0.15em] text-gray-200"
                >
                  <FaPlus /> Add Field
                </button>

                <button
                  type="button"
                  onClick={saveForm}
                  disabled={saving}
                  className="w-full rounded-lg border border-cyan-400 bg-cyan-500/10 px-4 py-3 font-mono text-xs uppercase tracking-[0.2em] text-cyan-200 disabled:opacity-60"
                >
                  {saving ? "Saving..." : editingId ? "Update Form" : "Save Form"}
                </button>
              </div>
            </div>

            <div className="glass-panel p-5">
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h2 className="text-lg font-bold uppercase tracking-[0.15em] text-cyan-300">Applications</h2>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={exportSelectedForm}
                    className="flex items-center gap-2 rounded border border-white/15 px-3 py-2 text-[10px] uppercase tracking-[0.15em] text-gray-200"
                  >
                    <FaDownload /> Export Filtered
                  </button>
                  <button
                    type="button"
                    onClick={exportAllForms}
                    className="flex items-center gap-2 rounded border border-white/15 px-3 py-2 text-[10px] uppercase tracking-[0.15em] text-gray-200"
                  >
                    <FaDownload /> Export All
                  </button>
                </div>
              </div>

              {activeFormId && forms.find((form) => form._id === activeFormId) && (
                <div className="mb-4">
                  <label className="mb-2 block text-sm text-gray-200">Filter by department</label>
                  <select
                    value={selectedDepartment}
                    onChange={(event) => setSelectedDepartment(event.target.value)}
                    className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="all">All departments</option>
                    {(forms.find((form) => form._id === activeFormId)?.departments || []).map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-300">
                      <th className="px-2 py-2">Time</th>
                      <th className="px-2 py-2">Department</th>
                      {visibleFields.map((field) => (
                        <th key={field.name} className="px-2 py-2">
                          {field.label || field.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplications.length ? (
                      filteredApplications.map((application) => (
                        <tr key={application._id} className="border-b border-white/10 text-gray-200">
                          <td className="px-2 py-2">{new Date(application.createdAt).toLocaleString()}</td>
                          <td className="px-2 py-2">{application.department}</td>
                          {visibleFields.map((field) => (
                            <td key={`${application._id}-${field.name}`} className="px-2 py-2">
                              {typeof application.responses?.[field.name] === "boolean"
                                ? application.responses[field.name]
                                  ? "Yes"
                                  : "No"
                                : application.responses?.[field.name] ?? ""}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-2 py-6 text-center text-gray-400">
                          No applications match the current filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
