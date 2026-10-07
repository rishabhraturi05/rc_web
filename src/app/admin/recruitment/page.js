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
  FaSearch,
  FaCheckCircle,
  FaClock,
  FaUserAstronaut,
  FaEye,
  FaSave,
  FaChevronLeft,
  FaChevronRight,
  FaRegCommentDots,
  FaStar,
  FaThumbsUp,
  FaThumbsDown,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import {
  DEFAULT_DEPARTMENT_OPTIONS,
  DEFAULT_YEAR_OPTIONS,
  ensureDefaultRecruitmentFields,
  getRecruitmentFormTitle,
  getVisibleApplicationFields,
  isDepartmentField,
  isYearField,
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
  title: "",
  isOpen: true,
  deadline: DEFAULT_DEADLINE,
  departments: [...DEFAULT_DEPARTMENT_OPTIONS],
  years: [...DEFAULT_YEAR_OPTIONS],
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

function buildSheetRows(form, applications, inlineEdits = {}) {
  const fieldHeaders = (form?.fields || [])
    .filter((field) => !["department", "year"].includes(String(field?.name || "").trim().toLowerCase()))
    .map((field) => ({
      key: field.name || field.label,
      label: field.label || field.name,
    }));

  const rows = applications.map((application) => {
    const edit = inlineEdits[application._id] || {};
    const feedbackVal = edit.feedback !== undefined ? edit.feedback : application.feedback || "";
    const pointsVal = edit.points !== undefined ? edit.points : application.points || "";
    const commentsVal = edit.comments !== undefined ? edit.comments : application.comments || "";

    const row = {
      "Application Time": new Date(application.createdAt).toLocaleString(),
      Department: application.department,
      Year: application.year || application.responses?.year || "",
      "Verdict / Feedback":
        feedbackVal === "positive"
          ? "Positive (Green)"
          : feedbackVal === "waitlist"
          ? "Waitlist (Yellow)"
          : feedbackVal === "negative"
          ? "Negative (Red)"
          : "Unclassified",
      "Points / Score": pointsVal,
      "Comments / Remarks": commentsVal,
      "Evaluated By": application.evaluatedBy || "Pending",
      "Evaluated At": application.evaluatedAt ? new Date(application.evaluatedAt).toLocaleString() : "",
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
  const [selectedYear, setSelectedYear] = useState("all");
  const [editor, setEditor] = useState(blankForm);
  const [editingId, setEditingId] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [editingApplication, setEditingApplication] = useState(null);
  const [savingApplication, setSavingApplication] = useState(false);
  const [applicationFormValues, setApplicationFormValues] = useState({
    department: "",
    year: "",
    responses: {},
  });

  // Additional Evaluation & Filter States (matching AddSec dashboard)
  const [searchQuery, setSearchQuery] = useState("");
  const [evaluationFilter, setEvaluationFilter] = useState("all"); // 'all', 'evaluated', 'pending'
  const [feedbackFilter, setFeedbackFilter] = useState("all"); // 'all', 'positive', 'waitlist', 'negative', 'unclassified'
  const [sortBy, setSortBy] = useState("newest"); // 'newest', 'oldest', 'points_desc', 'points_asc', 'name_asc'

  // Inline edits state: { [appId]: { points, comments, feedback, isDirty, isSaving, savedRecently } }
  const [inlineEdits, setInlineEdits] = useState({});

  // Review Modal state
  const [modalAppIndex, setModalAppIndex] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

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
    return getVisibleApplicationFields(selectedForm).filter(
      (field) => !["department", "year"].includes(String(field.name || "").trim().toLowerCase())
    );
  }, [selectedForm]);

  const filteredApplications = useMemo(() => {
    if (!applications.length) return [];

    let list = applications.filter((application) => {
      // 1. Department filter
      const matchDept = selectedDepartment === "all" || application.department === selectedDepartment;
      if (!matchDept) return false;

      // 2. Year filter
      const appYear = application.year || application.responses?.year || "";
      const matchYear = selectedYear === "all" || appYear === selectedYear;
      if (!matchYear) return false;

      // 3. Evaluation status filter
      const currentPoints =
        inlineEdits[application._id]?.points !== undefined
          ? inlineEdits[application._id]?.points
          : application.points;
      const currentComments =
        inlineEdits[application._id]?.comments !== undefined
          ? inlineEdits[application._id]?.comments
          : application.comments;
      const currentFeedback =
        inlineEdits[application._id]?.feedback !== undefined
          ? inlineEdits[application._id]?.feedback
          : application.feedback || "";
      const isEvaluated = Boolean(currentPoints || currentComments || currentFeedback);

      if (evaluationFilter === "evaluated" && !isEvaluated) return false;
      if (evaluationFilter === "pending" && isEvaluated) return false;

      // 4. Feedback filter (Positive / Waitlist / Negative / Unclassified)
      if (feedbackFilter === "positive" && currentFeedback !== "positive") return false;
      if (feedbackFilter === "waitlist" && currentFeedback !== "waitlist") return false;
      if (feedbackFilter === "negative" && currentFeedback !== "negative") return false;
      if (feedbackFilter === "unclassified" && Boolean(currentFeedback)) return false;

      // 5. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const candidateName = String(
          application.responses?.name || application.responses?.fullName || ""
        ).toLowerCase();
        const candidateRoll = String(
          application.responses?.rollno || application.responses?.rollNumber || ""
        ).toLowerCase();
        const candidateEmail = String(application.responses?.email || "").toLowerCase();
        const candidateComments = String(currentComments || "").toLowerCase();

        const allAnswers = Object.values(application.responses || {})
          .map((v) => String(v).toLowerCase())
          .join(" ");

        const matches =
          candidateName.includes(query) ||
          candidateRoll.includes(query) ||
          candidateEmail.includes(query) ||
          candidateComments.includes(query) ||
          allAnswers.includes(query);

        if (!matches) return false;
      }

      return true;
    });

    // Sorting
    list = [...list].sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (sortBy === "points_desc") {
        const pA = parseFloat(inlineEdits[a._id]?.points ?? a.points) || -999999;
        const pB = parseFloat(inlineEdits[b._id]?.points ?? b.points) || -999999;
        return pB - pA;
      }
      if (sortBy === "points_asc") {
        const pA = parseFloat(inlineEdits[a._id]?.points ?? a.points) || 999999;
        const pB = parseFloat(inlineEdits[b._id]?.points ?? b.points) || 999999;
        return pA - pB;
      }
      if (sortBy === "name_asc") {
        const nameA = String(a.responses?.name || "").toLowerCase();
        const nameB = String(b.responses?.name || "").toLowerCase();
        return nameA.localeCompare(nameB);
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return list;
  }, [
    applications,
    selectedDepartment,
    selectedYear,
    evaluationFilter,
    feedbackFilter,
    searchQuery,
    sortBy,
    inlineEdits,
  ]);

  // Overall Statistics for this Form (or selected department)
  const stats = useMemo(() => {
    const baseApps = applications.filter((app) => {
      return selectedDepartment === "all" || app.department === selectedDepartment;
    });

    const total = baseApps.length;
    let evaluated = 0;
    let positiveCount = 0;
    let waitlistCount = 0;
    let negativeCount = 0;
    let totalPoints = 0;
    let numericPointsCount = 0;

    baseApps.forEach((app) => {
      const p = inlineEdits[app._id]?.points !== undefined ? inlineEdits[app._id]?.points : app.points;
      const c = inlineEdits[app._id]?.comments !== undefined ? inlineEdits[app._id]?.comments : app.comments;
      const fb = inlineEdits[app._id]?.feedback !== undefined ? inlineEdits[app._id]?.feedback : app.feedback;

      if (p || c || fb) evaluated++;
      if (fb === "positive") positiveCount++;
      if (fb === "waitlist") waitlistCount++;
      if (fb === "negative") negativeCount++;

      const num = parseFloat(p);
      if (!Number.isNaN(num)) {
        totalPoints += num;
        numericPointsCount++;
      }
    });

    const pending = total - evaluated;
    const avgScore = numericPointsCount > 0 ? (totalPoints / numericPointsCount).toFixed(1) : "—";

    return { total, evaluated, pending, avgScore, positiveCount, waitlistCount, negativeCount };
  }, [applications, selectedDepartment, inlineEdits]);

  // Handle inline change for points, comments, verdict
  const handleInlineChange = (appId, field, value) => {
    setInlineEdits((prev) => ({
      ...prev,
      [appId]: {
        ...(prev[appId] || {}),
        [field]: value,
        isDirty: true,
        savedRecently: false,
      },
    }));
  };

  // Save evaluation for a single applicant (points, comments, feedback)
  const saveEvaluation = async (appId, customOverrides = null) => {
    const edit = customOverrides ? { ...(inlineEdits[appId] || {}), ...customOverrides } : inlineEdits[appId];
    if (!selectedForm || !edit) return;

    setInlineEdits((prev) => ({
      ...prev,
      [appId]: { ...(prev[appId] || {}), ...edit, isSaving: true },
    }));

    try {
      const response = await fetch(`/api/admin/recruitment/${selectedForm._id}/applications`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: appId,
          points: edit.points,
          comments: edit.comments,
          feedback: edit.feedback,
        }),
      });

      const result = await response.json();
      if (!result.success) {
        setMessage(result.message || "Failed to save evaluation.");
        setInlineEdits((prev) => ({
          ...prev,
          [appId]: { ...(prev[appId] || {}), isSaving: false },
        }));
        return;
      }

      setInlineEdits((prev) => ({
        ...prev,
        [appId]: {
          ...(prev[appId] || {}),
          ...edit,
          isSaving: false,
          isDirty: false,
          savedRecently: true,
        },
      }));

      // Update in applications list as well
      setApplications((prev) =>
        prev.map((app) =>
          app._id === appId
            ? {
                ...app,
                points: edit.points,
                comments: edit.comments,
                feedback: edit.feedback,
                evaluatedBy: result.data?.evaluatedBy || session?.user?.username || "admin",
                evaluatedAt: result.data?.evaluatedAt || new Date().toISOString(),
              }
            : app
        )
      );

      setTimeout(() => {
        setInlineEdits((prev) => ({
          ...prev,
          [appId]: { ...(prev[appId] || {}), savedRecently: false },
        }));
      }, 3000);
    } catch (error) {
      console.error("Save evaluation error:", error);
      setMessage("Error saving evaluation.");
      setInlineEdits((prev) => ({
        ...prev,
        [appId]: { ...(prev[appId] || {}), isSaving: false },
      }));
    }
  };

  // Modal navigation
  const openModal = (index) => {
    setModalAppIndex(index);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalAppIndex(null);
  };

  const nextModalApp = () => {
    if (modalAppIndex !== null && modalAppIndex < filteredApplications.length - 1) {
      setModalAppIndex(modalAppIndex + 1);
    }
  };

  const prevModalApp = () => {
    if (modalAppIndex !== null && modalAppIndex > 0) {
      setModalAppIndex(modalAppIndex - 1);
    }
  };

  const currentModalApp =
    modalAppIndex !== null && filteredApplications[modalAppIndex]
      ? filteredApplications[modalAppIndex]
      : null;

  const fetchForms = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/recruitment", {
        cache: "no-store",
        headers: { Pragma: "no-cache", "Cache-Control": "no-cache" },
      });
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
      const response = await fetch(`/api/admin/recruitment/${formId}/applications`, {
        cache: "no-store",
        headers: { Pragma: "no-cache", "Cache-Control": "no-cache" },
      });
      const result = await response.json();

      if (!result.success) {
        setApplications([]);
        setInlineEdits({});
        return;
      }

      const apps = result.data.applications || [];
      setApplications(apps);

      // Initialize inline edits state with DB values
      const edits = {};
      apps.forEach((app) => {
        edits[app._id] = {
          points: app.points || "",
          comments: app.comments || "",
          feedback: app.feedback || "",
          isDirty: false,
          isSaving: false,
          savedRecently: false,
        };
      });
      setInlineEdits(edits);

      const form = result.data.form;
      const departmentOptions = Array.isArray(form?.departments) ? form.departments : [];
      setSelectedDepartment(
        departmentOptions.includes(selectedDepartment) ? selectedDepartment : "all"
      );
    } catch (error) {
      console.error("Fetch applications error:", error);
      setApplications([]);
      setInlineEdits({});
    }
  };

  const openApplicationEditor = (application) => {
    setEditingApplication(application);
    setApplicationFormValues({
      department: application.department || selectedForm?.departments?.[0] || "",
      year: application.year || application.responses?.year || selectedForm?.years?.[0] || "",
      responses: { ...(application.responses || {}) },
    });
  };

  const closeApplicationEditor = () => {
    setEditingApplication(null);
    setApplicationFormValues({ department: "", year: "", responses: {} });
  };

  const handleApplicationResponseChange = (fieldKey, value) => {
    setApplicationFormValues((prev) => ({
      ...prev,
      responses: {
        ...prev.responses,
        [fieldKey]: value,
      },
    }));
  };

  const saveApplication = async () => {
    if (!editingApplication || !selectedForm) return;

    if (!applicationFormValues.department) {
      setMessage("Department is required.");
      return;
    }

    if (!applicationFormValues.year) {
      setMessage("Year of study is required.");
      return;
    }

    setSavingApplication(true);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/recruitment/${selectedForm._id}/applications`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: editingApplication._id,
          department: applicationFormValues.department,
          year: applicationFormValues.year,
          responses: {
            ...applicationFormValues.responses,
            year: applicationFormValues.year,
          },
        }),
      });

      const result = await response.json();
      if (!result.success) {
        setMessage(result.message || "Failed to update response.");
        return;
      }

      setMessage("Applicant response updated successfully.");
      closeApplicationEditor();
      await fetchApplications(selectedForm._id);
    } catch (error) {
      console.error("Save application error:", error);
      setMessage("Error updating applicant response.");
    } finally {
      setSavingApplication(false);
    }
  };

  const deleteApplication = async (applicationId) => {
    if (!selectedForm || !applicationId) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this applicant response? This cannot be undone."
    );
    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/admin/recruitment/${selectedForm._id}/applications?applicationId=${applicationId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();
      if (!result.success) {
        setMessage(result.message || "Failed to delete applicant response.");
        return;
      }

      setMessage("Applicant response deleted successfully.");
      await fetchApplications(selectedForm._id);
      await fetchForms();
    } catch (error) {
      console.error("Delete application error:", error);
      setMessage("Error deleting applicant response.");
    }
  };

  const openEditor = (form = null) => {
    setMessage("");
    if (!form) {
      setEditingId(null);
      setEditor({
        ...blankForm,
        title: "",
        deadline: DEFAULT_DEADLINE,
        departments: [...DEFAULT_DEPARTMENT_OPTIONS],
        years: [...DEFAULT_YEAR_OPTIONS],
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
      .filter((field) => !["department", "year"].includes(String(field?.name || "").trim().toLowerCase()))
      .map((field) => ({
        id: createFieldId(),
        name: field.name || "",
        label: field.label || "",
        type: field.type || "text",
        required: Boolean(field.required),
        options: Array.isArray(field.options) ? field.options.join(", ") : "",
      }));

    setEditor({
      title: form.title || "",
      isOpen: Boolean(form.isOpen),
      deadline: form.deadline ? new Date(form.deadline).toISOString().slice(0, 16) : DEFAULT_DEADLINE,
      departments: Array.isArray(form.departments) && form.departments.length ? form.departments : [...DEFAULT_DEPARTMENT_OPTIONS],
      years: Array.isArray(form.years) && form.years.length ? form.years : [...DEFAULT_YEAR_OPTIONS],
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
      .filter((field) => !isDepartmentField(field) && !isYearField(field))
      .map((field) => ({
        id: field.id,
        name: String(field.name || "").trim(),
        label: String(field.label || "").trim(),
        type: field.type || "text",
        required: Boolean(field.required),
        options: formatFieldOptions(field.options),
      }))
      .filter((field) => field.name && field.label);

    const departments = Array.isArray(editor.departments)
      ? editor.departments
          .map((department) => String(department).trim())
          .filter(Boolean)
      : [];

    const years = Array.isArray(editor.years)
      ? editor.years
          .map((year) => String(year).trim())
          .filter(Boolean)
      : [];

    const finalTitle = editor.title && editor.title.trim()
      ? editor.title.trim()
      : getRecruitmentFormTitle({ departments, years });

    const finalFields = ensureDefaultRecruitmentFields(cleanedFields).map((field) => ({
      name: field.name,
      label: field.label,
      type: field.type,
      required: field.required,
      options: Array.isArray(field.options) ? field.options : [],
    }));

    if (!finalFields.length || !departments.length || !years.length) {
      setMessage("A form must include at least the default fields, one department, and one eligible year.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const payload = {
        title: finalTitle,
        isOpen: editor.isOpen,
        deadline: editor.deadline ? new Date(editor.deadline).toISOString() : new Date(DEFAULT_DEADLINE).toISOString(),
        fields: finalFields,
        departments,
        years,
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
    const rows = buildSheetRows(selectedForm, filteredApplications, inlineEdits);
    const worksheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Recruitment");
    XLSX.writeFile(
      workbook,
      `${getRecruitmentFormTitle(selectedForm).replace(/[^a-zA-Z0-9_-]+/g, "_")}_${selectedDepartment === "all" ? "all" : selectedDepartment}.xlsx`
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
                  Configure form status, application deadline, eligible departments, eligible years, and custom questions.
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
                  Form Name (Custom / Manual Name)
                </label>
                <input
                  type="text"
                  value={editor.title}
                  onChange={(event) => setEditor((previous) => ({ ...previous, title: event.target.value }))}
                  placeholder="e.g. Software Team Recruitment (1st & 2nd Year) or any custom name"
                  className="w-full sm:w-96 rounded border border-white/20 bg-black/40 px-3 py-2 font-mono text-sm text-white focus:border-white focus:outline-none placeholder:text-gray-500"
                />
                <p className="font-mono text-xs text-gray-400 mt-1.5">
                  Display Name: <span className="text-white font-bold">{editor.title?.trim() || getRecruitmentFormTitle(editor)}</span>
                  <span className="text-gray-500 block sm:inline sm:ml-2">(Enter any manual name above, or leave blank to auto-generate from departments & years)</span>
                </p>
              </div>

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
                  Eligible Years
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded border border-white/20 bg-black/40 p-4">
                  {DEFAULT_YEAR_OPTIONS.map((year) => (
                    <label key={year} className="flex items-center gap-2 font-mono text-sm text-white cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={editor.years.includes(year)}
                        onChange={(event) => {
                          const checked = event.target.checked;
                          setEditor((previous) => {
                            const nextYears = checked
                              ? [...previous.years, year]
                              : previous.years.filter((item) => item !== year);
                            return { ...previous, years: nextYears };
                          });
                        }}
                        className="h-4 w-4 accent-white rounded cursor-pointer"
                      />
                      <span>{year}</span>
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
                    .filter((field) => !isDepartmentField(field) && !isYearField(field))
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
                          {getRecruitmentFormTitle(form)}
                        </button>
                      </div>
                      <p className="font-mono text-xs text-gray-400 mt-1">
                        {form.applicantCount || 0} applications • Years: {form.years?.join(", ") || "All"} • Deadline:{" "}
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
                          {getRecruitmentFormTitle(form)}
                        </button>
                      </div>
                      <p className="font-mono text-xs text-gray-400 mt-1">
                        {form.applicantCount || 0} applications • Years: {form.years?.join(", ") || "All"} • Closed
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
                    {getRecruitmentFormTitle(selectedForm)}
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

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5 mb-6">
              {/* Total */}
              <div className="glass-panel p-3.5 sm:p-4 border border-white/10 flex flex-col justify-between rounded-lg">
                <span className="font-mono text-xs text-gray-400 uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                  <FaUserAstronaut className="text-gray-300" /> Total
                </span>
                <div className="font-mono text-2xl sm:text-3xl font-bold mt-1.5 text-white">
                  {stats.total}
                </div>
                <span className="font-mono text-[10px] sm:text-[11px] text-gray-500 mt-1 truncate">
                  {selectedDepartment === "all" ? "All Departments" : selectedDepartment}
                </span>
              </div>

              {/* Positive / Green */}
              <div className="glass-panel p-3.5 sm:p-4 border border-emerald-500/30 bg-emerald-950/20 flex flex-col justify-between rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <span className="font-mono text-xs text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                  <FaThumbsUp className="text-emerald-400" /> Positive
                </span>
                <div className="font-mono text-2xl sm:text-3xl font-bold mt-1.5 text-emerald-400">
                  {stats.positiveCount}
                </div>
                <span className="font-mono text-[10px] sm:text-[11px] text-emerald-500/70 mt-1">
                  Green verdict
                </span>
              </div>

              {/* Waitlist / Yellow */}
              <div className="glass-panel p-3.5 sm:p-4 border border-amber-400/40 bg-amber-950/25 flex flex-col justify-between rounded-lg shadow-[0_0_15px_rgba(251,191,36,0.1)]">
                <span className="font-mono text-xs text-amber-300 uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                  <FaClock className="text-amber-400" /> Waitlist
                </span>
                <div className="font-mono text-2xl sm:text-3xl font-bold mt-1.5 text-amber-300">
                  {stats.waitlistCount}
                </div>
                <span className="font-mono text-[10px] sm:text-[11px] text-amber-400/70 mt-1">
                  Yellow verdict
                </span>
              </div>

              {/* Negative / Red */}
              <div className="glass-panel p-3.5 sm:p-4 border border-rose-500/30 bg-rose-950/20 flex flex-col justify-between rounded-lg shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                <span className="font-mono text-xs text-rose-400 uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                  <FaThumbsDown className="text-rose-400" /> Negative
                </span>
                <div className="font-mono text-2xl sm:text-3xl font-bold mt-1.5 text-rose-400">
                  {stats.negativeCount}
                </div>
                <span className="font-mono text-[10px] sm:text-[11px] text-rose-500/70 mt-1">
                  Red verdict
                </span>
              </div>

              {/* Evaluated */}
              <div className="glass-panel p-3.5 sm:p-4 border border-blue-500/30 bg-blue-950/20 flex flex-col justify-between rounded-lg">
                <span className="font-mono text-xs text-blue-400 uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                  <FaCheckCircle className="text-blue-400" /> Evaluated
                </span>
                <div className="font-mono text-2xl sm:text-3xl font-bold mt-1.5 text-blue-400">
                  {stats.evaluated}
                </div>
                <span className="font-mono text-[10px] sm:text-[11px] text-gray-500 mt-1 truncate">
                  {stats.pending} pending
                </span>
              </div>

              {/* Avg Score */}
              <div className="glass-panel p-3.5 sm:p-4 border border-white/10 flex flex-col justify-between rounded-lg">
                <span className="font-mono text-xs text-amber-400 uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                  <FaStar className="text-amber-400" /> Avg Score
                </span>
                <div className="font-mono text-2xl sm:text-3xl font-bold mt-1.5 text-white">
                  {stats.avgScore}
                </div>
                <span className="font-mono text-[10px] sm:text-[11px] text-gray-500 mt-1 truncate">
                  Evaluated avg
                </span>
              </div>
            </div>

            {/* Search and Filters Bar */}
            <div className="glass-panel p-4 rounded-xl border border-white/15 mb-6 space-y-3">
              <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
                {/* Search Input */}
                <div className="relative flex-1 min-w-[200px]">
                  <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search candidate by name, roll no, email, comments, or responses..."
                    className="w-full pl-9 pr-8 py-2 bg-black/60 border border-white/20 rounded font-mono text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  )}
                </div>

                {/* Dropdown Filters Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:items-center gap-2">
                  {/* Department Filter */}
                  <div className="flex flex-col xs:flex-row xs:items-center gap-1">
                    <label className="font-mono text-[11px] text-gray-400 whitespace-nowrap">Dept:</label>
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className="bg-black/60 border border-white/20 rounded px-2.5 py-1.5 font-mono text-xs text-white focus:outline-none focus:border-white w-full"
                    >
                      <option value="all">All ({applications.length})</option>
                      {(selectedForm.departments || []).map((dept) => {
                        const count = applications.filter((app) => app.department === dept).length;
                        return (
                          <option key={dept} value={dept}>
                            {dept} ({count})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Year Filter */}
                  <div className="flex flex-col xs:flex-row xs:items-center gap-1">
                    <label className="font-mono text-[11px] text-gray-400 whitespace-nowrap">Year:</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="bg-black/60 border border-white/20 rounded px-2.5 py-1.5 font-mono text-xs text-white focus:outline-none focus:border-white w-full"
                    >
                      <option value="all">All Years</option>
                      {(selectedForm.years || DEFAULT_YEAR_OPTIONS).map((yr) => {
                        const count = applications.filter((app) => (app.year || app.responses?.year) === yr).length;
                        return (
                          <option key={yr} value={yr}>
                            {yr} ({count})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Evaluation Status Filter */}
                  <div className="flex flex-col xs:flex-row xs:items-center gap-1">
                    <label className="font-mono text-[11px] text-gray-400 whitespace-nowrap">Status:</label>
                    <select
                      value={evaluationFilter}
                      onChange={(e) => setEvaluationFilter(e.target.value)}
                      className="bg-black/60 border border-white/20 rounded px-2.5 py-1.5 font-mono text-xs text-white focus:outline-none focus:border-white w-full"
                    >
                      <option value="all">All Status</option>
                      <option value="evaluated">Evaluated Only</option>
                      <option value="pending">Pending Only</option>
                    </select>
                  </div>

                  {/* Verdict / Feedback Filter */}
                  <div className="flex flex-col xs:flex-row xs:items-center gap-1">
                    <label className="font-mono text-[11px] text-gray-400 whitespace-nowrap">Verdict:</label>
                    <select
                      value={feedbackFilter}
                      onChange={(e) => setFeedbackFilter(e.target.value)}
                      className="bg-black/60 border border-white/20 rounded px-2.5 py-1.5 font-mono text-xs text-white focus:outline-none focus:border-white w-full"
                    >
                      <option value="all">All Verdicts</option>
                      <option value="positive">🟢 Positive (Green)</option>
                      <option value="waitlist">🟡 Waitlist (Yellow)</option>
                      <option value="negative">🔴 Negative (Red)</option>
                      <option value="unclassified">Unclassified</option>
                    </select>
                  </div>

                  {/* Sort Filter */}
                  <div className="flex flex-col xs:flex-row xs:items-center gap-1">
                    <label className="font-mono text-[11px] text-gray-400 whitespace-nowrap">Sort:</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-black/60 border border-white/20 rounded px-2.5 py-1.5 font-mono text-xs text-white focus:outline-none focus:border-white w-full"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="points_desc">Points: High to Low</option>
                      <option value="points_asc">Points: Low to High</option>
                      <option value="name_asc">Name: A to Z</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Active Filter Clear Bar */}
              {(searchQuery || selectedDepartment !== "all" || selectedYear !== "all" || evaluationFilter !== "all" || feedbackFilter !== "all" || sortBy !== "newest") && (
                <div className="flex items-center justify-between text-xs font-mono text-gray-400 pt-2 border-t border-white/10">
                  <span>
                    Filtered: Showing <strong className="text-white">{filteredApplications.length}</strong> of <strong className="text-white">{applications.length}</strong> candidates
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedDepartment("all");
                      setSelectedYear("all");
                      setEvaluationFilter("all");
                      setFeedbackFilter("all");
                      setSortBy("newest");
                    }}
                    className="text-blue-400 hover:underline cursor-pointer"
                  >
                    [ Reset Filters ]
                  </button>
                </div>
              )}
            </div>

            {/* Applications Display */}
            {filteredApplications.length === 0 ? (
              <div className="glass-panel border border-white/15 p-12 text-center space-y-2 rounded-xl">
                <p className="font-mono text-gray-300 text-base">No applicants found matching your criteria.</p>
                <p className="font-mono text-gray-500 text-xs">Try clearing filters or search keywords.</p>
              </div>
            ) : (
              <>
                {/* 1. Mobile Cards View (visible on < md) */}
                <div className="block md:hidden space-y-3.5">
                  {filteredApplications.map((app, index) => {
                    const edit = inlineEdits[app._id] || { points: "", comments: "", feedback: "" };
                    const candidateName = app.responses?.name || app.responses?.fullName || "Applicant";
                    const candidateRoll = app.responses?.rollno || app.responses?.rollNumber || "—";
                    const candidateEmail = app.responses?.email || "—";
                    const candidateYear = app.year || app.responses?.year || "—";
                    const candidateFeedback = edit.feedback !== undefined ? edit.feedback : app.feedback || "";

                    return (
                      <div
                        key={app._id}
                        className={`glass-panel p-4 rounded-xl border transition-all ${
                          candidateFeedback === "positive"
                            ? "border-emerald-500/70 bg-emerald-950/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                            : candidateFeedback === "waitlist"
                            ? "border-amber-400/80 bg-amber-950/25 shadow-[0_0_15px_rgba(251,191,36,0.18)]"
                            : candidateFeedback === "negative"
                            ? "border-rose-500/70 bg-rose-950/20 shadow-[0_0_15px_rgba(244,63,94,0.15)]"
                            : "border-white/15 bg-white/[0.02]"
                        }`}
                      >
                        {/* Header: Index, Name, Department & Year */}
                        <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-white/10">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500 font-mono text-xs">#{index + 1}</span>
                              <h3 className="font-mono font-bold text-white text-sm truncate" title={candidateName}>
                                {candidateName}
                              </h3>
                            </div>
                            <div className="text-gray-400 font-mono text-[11px] mt-0.5">
                              Roll: <strong className="text-gray-200">{candidateRoll}</strong>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono border border-white/20 bg-white/10 text-white whitespace-nowrap">
                              {app.department}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-gray-300 border border-white/10 whitespace-nowrap">
                              {candidateYear}
                            </span>
                          </div>
                        </div>

                        {/* Sub-info: Email, View Responses */}
                        <div className="py-2.5 flex items-center justify-between text-xs font-mono text-gray-400 border-b border-white/10 gap-2">
                          <div className="truncate text-[11px] text-gray-500 flex-1" title={candidateEmail}>
                            {candidateEmail}
                          </div>
                          <button
                            type="button"
                            onClick={() => openModal(index)}
                            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 whitespace-nowrap font-semibold cursor-pointer"
                          >
                            <FaEye className="text-[11px]" />
                            <span>View All ({Object.keys(app.responses || {}).length})</span>
                          </button>
                        </div>

                        {/* Verdict / Feedback: 3 Buttons */}
                        <div className="pt-3 pb-2 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider font-semibold">
                              Verdict Classification:
                            </span>
                            {candidateFeedback && (
                              <span
                                className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                  candidateFeedback === "positive"
                                    ? "text-emerald-300 bg-emerald-950/60 border border-emerald-500/40"
                                    : candidateFeedback === "waitlist"
                                    ? "text-amber-300 bg-amber-950/60 border border-amber-400/50"
                                    : "text-rose-300 bg-rose-950/60 border border-rose-500/40"
                                }`}
                              >
                                {candidateFeedback}
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-1.5">
                            {/* Positive Button */}
                            <button
                              type="button"
                              onClick={() => {
                                const nextVal = candidateFeedback === "positive" ? "" : "positive";
                                handleInlineChange(app._id, "feedback", nextVal);
                                saveEvaluation(app._id, { ...edit, feedback: nextVal });
                              }}
                              className={`py-2 px-1 rounded text-xs font-mono font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                candidateFeedback === "positive"
                                  ? "bg-emerald-500 text-black border border-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.5)] font-extrabold"
                                  : "bg-white/5 hover:bg-emerald-950/40 text-gray-300 border border-white/10"
                              }`}
                            >
                              <FaThumbsUp className="text-[11px]" />
                              <span>Positive</span>
                            </button>

                            {/* Waitlist Button */}
                            <button
                              type="button"
                              onClick={() => {
                                const nextVal = candidateFeedback === "waitlist" ? "" : "waitlist";
                                handleInlineChange(app._id, "feedback", nextVal);
                                saveEvaluation(app._id, { ...edit, feedback: nextVal });
                              }}
                              className={`py-2 px-1 rounded text-xs font-mono font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                candidateFeedback === "waitlist"
                                  ? "bg-amber-400 text-black border border-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.6)] font-extrabold"
                                  : "bg-white/5 hover:bg-amber-950/40 text-gray-300 border border-white/10"
                              }`}
                            >
                              <FaClock className="text-[11px]" />
                              <span>Waitlist</span>
                            </button>

                            {/* Negative Button */}
                            <button
                              type="button"
                              onClick={() => {
                                const nextVal = candidateFeedback === "negative" ? "" : "negative";
                                handleInlineChange(app._id, "feedback", nextVal);
                                saveEvaluation(app._id, { ...edit, feedback: nextVal });
                              }}
                              className={`py-2 px-1 rounded text-xs font-mono font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                candidateFeedback === "negative"
                                  ? "bg-rose-500 text-white border border-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.5)] font-extrabold"
                                  : "bg-white/5 hover:bg-rose-950/40 text-gray-300 border border-white/10"
                              }`}
                            >
                              <FaThumbsDown className="text-[11px]" />
                              <span>Negative</span>
                            </button>
                          </div>
                        </div>

                        {/* Inline Score & Remarks */}
                        <div className="pt-2 space-y-2">
                          <div className="flex items-center gap-2">
                            <label className="text-[11px] font-mono text-gray-400 w-16 whitespace-nowrap">Score:</label>
                            <input
                              type="text"
                              value={edit.points}
                              onChange={(e) => handleInlineChange(app._id, "points", e.target.value)}
                              onBlur={() => {
                                if (edit.isDirty) saveEvaluation(app._id);
                              }}
                              placeholder="e.g. 8.5/10"
                              className={`flex-1 px-2.5 py-1.5 bg-black/70 rounded text-xs text-white focus:outline-none font-mono font-bold transition-colors ${
                                candidateFeedback === "positive"
                                  ? "border border-emerald-500/50 focus:border-emerald-400"
                                  : candidateFeedback === "waitlist"
                                  ? "border border-amber-400/60 focus:border-amber-300"
                                  : candidateFeedback === "negative"
                                  ? "border border-rose-500/50 focus:border-rose-400"
                                  : "border border-white/20 focus:border-white"
                              }`}
                            />
                          </div>

                          <div className="space-y-1">
                            <textarea
                              rows={2}
                              value={edit.comments}
                              onChange={(e) => handleInlineChange(app._id, "comments", e.target.value)}
                              onBlur={() => {
                                if (edit.isDirty) saveEvaluation(app._id);
                              }}
                              placeholder="Remarks, interview feedback..."
                              className={`w-full px-2.5 py-1.5 bg-black/70 rounded text-xs text-white focus:outline-none resize-none placeholder-gray-600 font-mono transition-colors ${
                                candidateFeedback === "positive"
                                  ? "border border-emerald-500/50 focus:border-emerald-400"
                                  : candidateFeedback === "waitlist"
                                  ? "border border-amber-400/60 focus:border-amber-300"
                                  : candidateFeedback === "negative"
                                  ? "border border-rose-500/50 focus:border-rose-400"
                                  : "border border-white/20 focus:border-white"
                              }`}
                            />
                          </div>
                        </div>

                        {/* Card Actions Footer */}
                        <div className="pt-2.5 flex items-center justify-between text-xs font-mono border-t border-white/10 mt-2">
                          <div className="text-[10px] text-gray-500 truncate max-w-[140px]">
                            {app.evaluatedBy ? `By ${app.evaluatedBy}` : "Not evaluated"}
                          </div>
                          <div className="flex items-center gap-1.5">
                            {edit.isSaving ? (
                              <span className="text-[11px] text-amber-400 animate-pulse font-mono font-bold">
                                Saving...
                              </span>
                            ) : edit.savedRecently ? (
                              <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1 font-bold">
                                <FaCheckCircle className="text-xs" /> Saved
                              </span>
                            ) : edit.isDirty ? (
                              <button
                                type="button"
                                onClick={() => saveEvaluation(app._id)}
                                className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/50 rounded text-xs font-mono uppercase tracking-wider flex items-center gap-1 font-bold cursor-pointer"
                              >
                                <FaSave className="text-xs" /> Save
                              </button>
                            ) : null}

                            <button
                              type="button"
                              onClick={() => openModal(index)}
                              className="px-2.5 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 rounded text-xs font-mono uppercase tracking-wider cursor-pointer"
                            >
                              Review
                            </button>
                            <button
                              type="button"
                              onClick={() => openApplicationEditor(app)}
                              className="px-2 py-1 bg-white/5 hover:bg-white/15 text-gray-300 border border-white/20 rounded text-xs font-mono uppercase tracking-wider cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteApplication(app._id)}
                              className="px-2 py-1 text-red-400 hover:text-red-300 border border-red-500/30 rounded text-xs font-mono uppercase tracking-wider cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 2. Desktop High-Density Data Table (visible on md+) */}
                <div className="hidden md:block glass-panel border border-white/15 overflow-hidden rounded-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs">
                      <thead className="bg-white/5 border-b border-white/15 text-gray-400 uppercase tracking-wider">
                        <tr>
                          <th className="py-3 px-3 w-10 text-center">#</th>
                          <th className="py-3 px-3 min-w-[170px]">Applicant Info</th>
                          <th className="py-3 px-2 min-w-[95px]">Department</th>
                          <th className="py-3 px-2 min-w-[80px]">Year</th>
                          <th className="py-3 px-3 min-w-[125px]">Responses</th>
                          <th className="py-3 px-3 min-w-[175px] text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" title="Positive"></span>
                              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" title="Waitlist"></span>
                              <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" title="Negative"></span>
                              <span>Verdict</span>
                            </div>
                          </th>
                          <th className="py-3 px-3 min-w-[100px]">
                            <div className="flex items-center gap-1">
                              <FaStar className="text-amber-400 text-xs" />
                              <span>Points</span>
                            </div>
                          </th>
                          <th className="py-3 px-3 min-w-[200px]">
                            <div className="flex items-center gap-1">
                              <FaRegCommentDots className="text-blue-400 text-xs" />
                              <span>Comments / Remarks</span>
                            </div>
                          </th>
                          <th className="py-3 px-3 min-w-[150px] text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {filteredApplications.map((app, index) => {
                          const edit = inlineEdits[app._id] || { points: "", comments: "", feedback: "" };
                          const candidateName = app.responses?.name || app.responses?.fullName || "Applicant";
                          const candidateRoll = app.responses?.rollno || app.responses?.rollNumber || "—";
                          const candidateEmail = app.responses?.email || "—";
                          const candidateYear = app.year || app.responses?.year || "—";
                          const candidateFeedback = edit.feedback !== undefined ? edit.feedback : app.feedback || "";

                          // Color-code department badges
                          const deptLower = String(app.department || "").toLowerCase();
                          const deptBadgeClass = deptLower.includes("soft")
                            ? "text-blue-400 border-blue-500/40 bg-blue-950/30"
                            : deptLower.includes("mech")
                            ? "text-amber-400 border-amber-500/40 bg-amber-950/30"
                            : deptLower.includes("embed")
                            ? "text-emerald-400 border-emerald-500/40 bg-emerald-950/30"
                            : deptLower.includes("pr")
                            ? "text-purple-400 border-purple-500/40 bg-purple-950/30"
                            : "text-white border-white/20 bg-white/10";

                          return (
                            <tr
                              key={app._id}
                              className={`transition-colors group ${
                                candidateFeedback === "positive"
                                  ? "border-l-4 border-l-emerald-500 bg-emerald-950/15 hover:bg-emerald-950/25"
                                  : candidateFeedback === "waitlist"
                                  ? "border-l-4 border-l-amber-400 bg-amber-950/20 hover:bg-amber-950/30"
                                  : candidateFeedback === "negative"
                                  ? "border-l-4 border-l-rose-500 bg-rose-950/15 hover:bg-rose-950/25"
                                  : "hover:bg-white/[0.03]"
                              }`}
                            >
                              {/* Index */}
                              <td className="py-3 px-3 text-center text-gray-500">{index + 1}</td>

                              {/* Applicant Info */}
                              <td className="py-3 px-3">
                                <div className="font-bold text-white text-sm">{candidateName}</div>
                                <div className="text-gray-400 text-[11px] flex items-center gap-2 mt-0.5">
                                  <span>Roll: <strong className="text-gray-200">{candidateRoll}</strong></span>
                                </div>
                                <div className="text-gray-500 text-[10px] truncate max-w-[190px]" title={candidateEmail}>
                                  {candidateEmail}
                                </div>
                              </td>

                              {/* Department */}
                              <td className="py-3 px-2">
                                <span className={`px-2 py-0.5 rounded text-[11px] border whitespace-nowrap font-medium ${deptBadgeClass}`}>
                                  {app.department}
                                </span>
                              </td>

                              {/* Year */}
                              <td className="py-3 px-2">
                                <span className="px-2 py-0.5 rounded text-[11px] bg-white/10 text-gray-300 border border-white/20 whitespace-nowrap">
                                  {candidateYear}
                                </span>
                              </td>

                              {/* Responses Preview */}
                              <td className="py-3 px-3">
                                <button
                                  type="button"
                                  onClick={() => openModal(index)}
                                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors font-medium cursor-pointer"
                                >
                                  <FaEye className="text-xs" />
                                  <span>View All ({Object.keys(app.responses || {}).length})</span>
                                </button>
                                <div className="text-[10px] text-gray-500 mt-1">
                                  {new Date(app.createdAt).toLocaleDateString()}
                                </div>
                              </td>

                              {/* Verdict Classification: Pos (Green), Waitlist (Yellow), Neg (Red) */}
                              <td className="py-3 px-3 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  {/* Positive / Green */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const nextVal = candidateFeedback === "positive" ? "" : "positive";
                                      handleInlineChange(app._id, "feedback", nextVal);
                                      saveEvaluation(app._id, { ...edit, feedback: nextVal });
                                    }}
                                    className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1 cursor-pointer ${
                                      candidateFeedback === "positive"
                                        ? "bg-emerald-500 text-black border border-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.5)] scale-105"
                                        : "bg-white/5 hover:bg-emerald-950/40 text-gray-400 hover:text-emerald-300 border border-white/10"
                                    }`}
                                    title="Classify as Positive Feedback (Green)"
                                  >
                                    <FaThumbsUp className="text-[10px]" />
                                    <span>{candidateFeedback === "positive" ? "Pos" : "+"}</span>
                                  </button>

                                  {/* Waitlist / Yellow */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const nextVal = candidateFeedback === "waitlist" ? "" : "waitlist";
                                      handleInlineChange(app._id, "feedback", nextVal);
                                      saveEvaluation(app._id, { ...edit, feedback: nextVal });
                                    }}
                                    className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1 cursor-pointer ${
                                      candidateFeedback === "waitlist"
                                        ? "bg-amber-400 text-black border border-amber-200 shadow-[0_0_10px_rgba(251,191,36,0.6)] scale-105"
                                        : "bg-white/5 hover:bg-amber-950/40 text-gray-400 hover:text-amber-300 border border-white/10"
                                    }`}
                                    title="Classify as Waitlist (Yellow)"
                                  >
                                    <FaClock className="text-[10px]" />
                                    <span>{candidateFeedback === "waitlist" ? "Wait" : "~"}</span>
                                  </button>

                                  {/* Negative / Red */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const nextVal = candidateFeedback === "negative" ? "" : "negative";
                                      handleInlineChange(app._id, "feedback", nextVal);
                                      saveEvaluation(app._id, { ...edit, feedback: nextVal });
                                    }}
                                    className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1 cursor-pointer ${
                                      candidateFeedback === "negative"
                                        ? "bg-rose-500 text-white border border-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.5)] scale-105"
                                        : "bg-white/5 hover:bg-rose-950/40 text-gray-400 hover:text-rose-300 border border-white/10"
                                    }`}
                                    title="Classify as Negative Feedback (Red)"
                                  >
                                    <FaThumbsDown className="text-[10px]" />
                                    <span>{candidateFeedback === "negative" ? "Neg" : "-"}</span>
                                  </button>
                                </div>
                              </td>

                              {/* Points / Score */}
                              <td className="py-3 px-3">
                                <input
                                  type="text"
                                  value={edit.points}
                                  onChange={(e) => handleInlineChange(app._id, "points", e.target.value)}
                                  onBlur={() => {
                                    if (edit.isDirty) saveEvaluation(app._id);
                                  }}
                                  placeholder="e.g. 9/10"
                                  className={`w-20 px-2 py-1.5 bg-black/70 rounded text-center text-xs text-white focus:outline-none transition-colors font-bold font-mono ${
                                    candidateFeedback === "positive"
                                      ? "border border-emerald-500/50 focus:border-emerald-400"
                                      : candidateFeedback === "waitlist"
                                      ? "border border-amber-400/60 focus:border-amber-300"
                                      : candidateFeedback === "negative"
                                      ? "border border-rose-500/50 focus:border-rose-400"
                                      : "border border-white/20 focus:border-white"
                                  }`}
                                />
                              </td>

                              {/* Comments / Remarks */}
                              <td className="py-3 px-3">
                                <textarea
                                  rows={1}
                                  value={edit.comments}
                                  onChange={(e) => handleInlineChange(app._id, "comments", e.target.value)}
                                  onBlur={() => {
                                    if (edit.isDirty) saveEvaluation(app._id);
                                  }}
                                  placeholder="Add evaluation remarks, interview notes..."
                                  className={`w-full px-2.5 py-1.5 bg-black/70 rounded text-xs text-white focus:outline-none transition-colors resize-none placeholder-gray-600 font-mono ${
                                    candidateFeedback === "positive"
                                      ? "border border-emerald-500/50 focus:border-emerald-400"
                                      : candidateFeedback === "waitlist"
                                      ? "border border-amber-400/60 focus:border-amber-300"
                                      : candidateFeedback === "negative"
                                      ? "border border-rose-500/50 focus:border-rose-400"
                                      : "border border-white/20 focus:border-white"
                                  }`}
                                />
                                {app.evaluatedBy && (
                                  <div className="text-[10px] text-gray-500 mt-0.5 truncate font-mono">
                                    By {app.evaluatedBy} • {app.evaluatedAt ? new Date(app.evaluatedAt).toLocaleDateString() : ""}
                                  </div>
                                )}
                              </td>

                              {/* Actions */}
                              <td className="py-3 px-3 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  {edit.isSaving ? (
                                    <span className="text-[11px] text-amber-400 animate-pulse font-mono font-bold">
                                      Saving...
                                    </span>
                                  ) : edit.savedRecently ? (
                                    <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1 font-bold">
                                      <FaCheckCircle className="text-xs" /> Saved
                                    </span>
                                  ) : edit.isDirty ? (
                                    <button
                                      type="button"
                                      onClick={() => saveEvaluation(app._id)}
                                      className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/50 rounded text-[10px] font-mono uppercase tracking-wider flex items-center gap-1 transition-colors font-bold cursor-pointer"
                                      title="Save evaluation"
                                    >
                                      <FaSave className="text-xs" /> Save
                                    </button>
                                  ) : null}

                                  <button
                                    type="button"
                                    onClick={() => openModal(index)}
                                    className="cursor-pointer font-mono text-[10px] uppercase tracking-wider text-blue-400 hover:text-white border border-blue-500/30 hover:border-blue-400 bg-blue-950/20 rounded px-2.5 py-1 transition-colors"
                                    title="Review candidate full response & evaluation"
                                  >
                                    Review
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openApplicationEditor(app)}
                                    className="cursor-pointer font-mono text-[10px] uppercase tracking-wider text-gray-300 hover:text-white border border-white/20 hover:border-white rounded px-2.5 py-1 transition-colors"
                                    title="Edit raw response fields"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deleteApplication(app._id)}
                                    className="cursor-pointer font-mono text-[10px] uppercase tracking-wider text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-400 rounded px-2.5 py-1 transition-colors"
                                    title="Delete candidate response"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="glass-panel p-8 text-center border border-white/20">
            <p className="font-mono text-gray-400 text-sm">
              No recruitment form selected or created yet. Click <span className="text-white font-bold">[ + START FORM ]</span> to create your first recruitment drive.
            </p>
          </div>
        )}

        {/* Edit Application Response Modal */}
        {editingApplication && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="glass-panel w-full max-w-xl p-6 sm:p-8 border border-white/30 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between gap-4 mb-6 border-b border-white/15 pb-4">
                <div>
                  <h2 className="font-mono text-xl font-bold uppercase tracking-wider text-white">
                    [ EDIT APPLICANT RESPONSE ]
                  </h2>
                  <p className="font-mono text-xs text-gray-400 mt-1">
                    Submitted on {new Date(editingApplication.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeApplicationEditor}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-white/20 text-gray-300 rounded hover:border-white hover:text-white font-mono text-xs uppercase tracking-widest transition-colors cursor-pointer"
                >
                  <FaTimes /> Close
                </button>
              </div>

              <div className="space-y-4">
                {/* Department select */}
                <div>
                  <label className="mb-1 block font-mono text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Department *
                  </label>
                  <select
                    value={applicationFormValues.department}
                    onChange={(e) => setApplicationFormValues((prev) => ({ ...prev, department: e.target.value }))}
                    className="w-full rounded border border-white/20 bg-black/50 px-3 py-2 font-mono text-sm text-white focus:border-white focus:outline-none"
                  >
                    {(selectedForm?.departments || DEFAULT_DEPARTMENT_OPTIONS).map((dept) => (
                      <option key={dept} value={dept} className="bg-black text-white">
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year select */}
                <div>
                  <label className="mb-1 block font-mono text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Year of Study *
                  </label>
                  <select
                    value={applicationFormValues.year}
                    onChange={(e) => setApplicationFormValues((prev) => ({ ...prev, year: e.target.value }))}
                    className="w-full rounded border border-white/20 bg-black/50 px-3 py-2 font-mono text-sm text-white focus:border-white focus:outline-none"
                  >
                    {(selectedForm?.years || DEFAULT_YEAR_OPTIONS).map((yr) => (
                      <option key={yr} value={yr} className="bg-black text-white">
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Form fields & custom responses */}
                {(selectedForm?.fields || [])
                  .filter((f) => !isDepartmentField(f) && !isYearField(f))
                  .map((field) => {
                    const fieldKey = field.name || field.label;
                    const curVal = applicationFormValues.responses?.[fieldKey] ?? "";

                    return (
                      <div key={fieldKey}>
                        <label className="mb-1 block font-mono text-xs font-semibold text-gray-300 uppercase tracking-wider">
                          {field.label || fieldKey} {field.required ? <span className="text-red-400">*</span> : ""}
                        </label>
                        {field.type === "textarea" ? (
                          <textarea
                            rows={3}
                            value={curVal}
                            onChange={(e) => handleApplicationResponseChange(fieldKey, e.target.value)}
                            className="w-full rounded border border-white/20 bg-black/50 px-3 py-2 font-mono text-sm text-white focus:border-white focus:outline-none"
                          />
                        ) : field.type === "checkbox" ? (
                          <label className="flex items-center gap-2 cursor-pointer font-mono text-sm text-white">
                            <input
                              type="checkbox"
                              checked={Boolean(curVal)}
                              onChange={(e) => handleApplicationResponseChange(fieldKey, e.target.checked)}
                              className="accent-white cursor-pointer"
                            />
                            <span>Yes / No</span>
                          </label>
                        ) : field.type === "select" ? (
                          <select
                            value={curVal}
                            onChange={(e) => handleApplicationResponseChange(fieldKey, e.target.value)}
                            className="w-full rounded border border-white/20 bg-black/50 px-3 py-2 font-mono text-sm text-white focus:border-white focus:outline-none"
                          >
                            <option value="" className="bg-black text-gray-400">Select option</option>
                            {(field.options || []).map((opt) => (
                              <option key={opt} value={opt} className="bg-black text-white">
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={field.type === "email" ? "email" : field.type === "number" ? "number" : "text"}
                            value={curVal}
                            onChange={(e) => handleApplicationResponseChange(fieldKey, e.target.value)}
                            className="w-full rounded border border-white/20 bg-black/50 px-3 py-2 font-mono text-sm text-white focus:border-white focus:outline-none"
                          />
                        )}
                      </div>
                    );
                  })}
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={closeApplicationEditor}
                  className="px-4 py-2 border border-white/20 text-gray-300 rounded font-mono text-xs uppercase tracking-wider hover:border-white hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveApplication}
                  disabled={savingApplication}
                  className="px-6 py-2 border border-white bg-white text-black font-mono text-xs font-bold uppercase tracking-wider rounded hover:bg-transparent hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  {savingApplication ? "Saving..." : "[ Save Changes ]"}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Detailed Candidate Review Modal (matching AddSec dashboard) */}
        {modalOpen && currentModalApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-black/85 backdrop-blur-sm">
            <div className="glass-panel w-full max-w-3xl max-h-[94vh] sm:max-h-[90vh] overflow-y-auto border border-white/25 shadow-2xl flex flex-col rounded-xl">
              {/* Modal Header */}
              <div className="p-3.5 sm:p-5 border-b border-white/15 flex items-center justify-between sticky top-0 bg-black/95 backdrop-blur z-20 gap-2">
                <div className="min-w-0 flex-1 pr-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 block truncate">
                    Candidate Review ({modalAppIndex + 1} of {filteredApplications.length})
                  </span>
                  <h2
                    className="font-mono text-base sm:text-xl md:text-2xl font-bold text-white mt-0.5 truncate"
                    title={currentModalApp.responses?.name || currentModalApp.responses?.fullName || "Candidate Profile"}
                  >
                    {currentModalApp.responses?.name || currentModalApp.responses?.fullName || "Candidate Profile"}
                  </h2>
                </div>

                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={prevModalApp}
                    disabled={modalAppIndex === 0}
                    className="p-2 sm:p-2.5 glass-panel border border-white/20 text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded cursor-pointer"
                    title="Previous Applicant"
                  >
                    <FaChevronLeft className="text-xs" />
                  </button>
                  <button
                    type="button"
                    onClick={nextModalApp}
                    disabled={modalAppIndex === filteredApplications.length - 1}
                    className="p-2 sm:p-2.5 glass-panel border border-white/20 text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded cursor-pointer"
                    title="Next Applicant"
                  >
                    <FaChevronRight className="text-xs" />
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="p-2 sm:p-2.5 text-gray-400 hover:text-white rounded ml-1 cursor-pointer"
                    title="Close Modal"
                  >
                    <FaTimes className="text-sm" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6">
                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 font-mono text-xs">
                  <div className="bg-white/5 p-2.5 sm:p-3 rounded border border-white/10">
                    <span className="text-gray-500 block text-[11px]">Roll Number</span>
                    <span className="text-white font-bold text-xs sm:text-sm mt-0.5 block truncate">
                      {currentModalApp.responses?.rollno || currentModalApp.responses?.rollNumber || "—"}
                    </span>
                  </div>
                  <div className="bg-white/5 p-2.5 sm:p-3 rounded border border-white/10">
                    <span className="text-gray-500 block text-[11px]">Department</span>
                    <span className="text-white font-bold text-xs sm:text-sm mt-0.5 block truncate">
                      {currentModalApp.department}
                    </span>
                  </div>
                  <div className="bg-white/5 p-2.5 sm:p-3 rounded border border-white/10">
                    <span className="text-gray-500 block text-[11px]">Year of Study</span>
                    <span className="text-white font-bold text-xs sm:text-sm mt-0.5 block truncate">
                      {currentModalApp.year || currentModalApp.responses?.year || "—"}
                    </span>
                  </div>
                  <div className="bg-white/5 p-2.5 sm:p-3 rounded border border-white/10">
                    <span className="text-gray-500 block text-[11px]">Submitted At</span>
                    <span className="text-white font-bold text-xs sm:text-sm mt-0.5 block truncate">
                      {new Date(currentModalApp.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Email & Contact */}
                <div className="font-mono text-xs bg-white/5 p-2.5 sm:p-3 rounded border border-white/10 flex items-center justify-between">
                  <div className="truncate">
                    <span className="text-gray-500">Contact Email: </span>
                    <a
                      href={`mailto:${currentModalApp.responses?.email || ""}`}
                      className="text-blue-400 hover:underline font-bold"
                    >
                      {currentModalApp.responses?.email || "—"}
                    </a>
                  </div>
                </div>

                {/* All Custom Form Responses */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="font-mono text-xs uppercase tracking-wider text-gray-400 border-b border-white/10 pb-1.5 font-semibold">
                    Candidate Responses
                  </h3>
                  <div className="space-y-2.5 sm:space-y-3">
                    {(selectedForm?.fields || [])
                      .filter(
                        (f) =>
                          !["name", "email", "rollno", "department", "year"].includes(
                            String(f.name || "").toLowerCase()
                          )
                      )
                      .map((field) => {
                        const key = field.name || field.label;
                        const label = field.label || field.name;
                        const val = currentModalApp.responses?.[key];
                        const formattedVal =
                          val === undefined || val === null || val === ""
                            ? "—"
                            : typeof val === "boolean"
                            ? val ? "Yes" : "No"
                            : String(val);

                        const isUrl =
                          String(formattedVal).startsWith("http://") ||
                          String(formattedVal).startsWith("https://");

                        return (
                          <div
                            key={key}
                            className="bg-black/50 p-3 sm:p-3.5 rounded border border-white/10 font-mono space-y-1"
                          >
                            <label className="text-xs text-gray-400 block font-semibold">
                              {label}
                            </label>
                            <div className="text-xs text-gray-100 whitespace-pre-wrap leading-relaxed break-words">
                              {isUrl ? (
                                <a
                                  href={formattedVal}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-400 hover:underline break-all"
                                >
                                  {formattedVal} ↗
                                </a>
                              ) : (
                                formattedVal
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Evaluation Section in Modal */}
                {(() => {
                  const modalEdit = inlineEdits[currentModalApp._id] || {};
                  const modalFeedback =
                    modalEdit.feedback !== undefined
                      ? modalEdit.feedback
                      : currentModalApp.feedback || "";

                  return (
                    <div
                      className={`p-3.5 sm:p-5 rounded-xl transition-all duration-300 space-y-3.5 sm:space-y-4 ${
                        modalFeedback === "positive"
                          ? "bg-emerald-950/25 border-2 border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.35)]"
                          : modalFeedback === "waitlist"
                          ? "bg-amber-950/25 border-2 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.35)]"
                          : modalFeedback === "negative"
                          ? "bg-rose-950/25 border-2 border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.35)]"
                          : "bg-white/5 border border-white/20"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3
                            className={`font-mono text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 ${
                              modalFeedback === "positive"
                                ? "text-emerald-300"
                                : modalFeedback === "waitlist"
                                ? "text-amber-300"
                                : modalFeedback === "negative"
                                ? "text-rose-300"
                                : "text-amber-300"
                            }`}
                          >
                            <FaStar /> Evaluation & Verdict
                          </h3>

                          {modalFeedback === "positive" && (
                            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500 flex items-center gap-1">
                              <FaThumbsUp className="text-[9px]" /> Positive Verdict
                            </span>
                          )}
                          {modalFeedback === "waitlist" && (
                            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400 flex items-center gap-1">
                              <FaClock className="text-[9px]" /> Waitlisted
                            </span>
                          )}
                          {modalFeedback === "negative" && (
                            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500 flex items-center gap-1">
                              <FaThumbsDown className="text-[9px]" /> Negative Verdict
                            </span>
                          )}
                        </div>

                        {/* Feedback Verdict Classification Buttons */}
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span className="font-mono text-[11px] sm:text-xs text-gray-400 uppercase tracking-wider mr-1">
                            Verdict:
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleInlineChange(
                                currentModalApp._id,
                                "feedback",
                                modalFeedback === "positive" ? "" : "positive"
                              )
                            }
                            className={`px-2.5 sm:px-3 py-1.5 rounded font-mono text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              modalFeedback === "positive"
                                ? "bg-emerald-500 text-black border-2 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-105"
                                : "bg-emerald-950/40 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/50"
                            }`}
                          >
                            <FaThumbsUp className="text-xs" /> Positive
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleInlineChange(
                                currentModalApp._id,
                                "feedback",
                                modalFeedback === "waitlist" ? "" : "waitlist"
                              )
                            }
                            className={`px-2.5 sm:px-3 py-1.5 rounded font-mono text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              modalFeedback === "waitlist"
                                ? "bg-amber-400 text-black border-2 border-amber-200 shadow-[0_0_15px_rgba(251,191,36,0.6)] scale-105"
                                : "bg-amber-950/40 text-amber-300 border border-amber-500/40 hover:bg-amber-900/50"
                            }`}
                          >
                            <FaClock className="text-xs" /> Waitlist
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleInlineChange(
                                currentModalApp._id,
                                "feedback",
                                modalFeedback === "negative" ? "" : "negative"
                              )
                            }
                            className={`px-2.5 sm:px-3 py-1.5 rounded font-mono text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              modalFeedback === "negative"
                                ? "bg-rose-500 text-white border-2 border-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.5)] scale-105"
                                : "bg-rose-950/40 text-rose-300 border border-rose-500/40 hover:bg-rose-900/50"
                            }`}
                          >
                            <FaThumbsDown className="text-xs" /> Negative
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-mono text-gray-300 mb-1 uppercase tracking-wider">
                            Points / Score
                          </label>
                          <input
                            type="text"
                            value={modalEdit.points ?? currentModalApp.points ?? ""}
                            onChange={(e) => handleInlineChange(currentModalApp._id, "points", e.target.value)}
                            placeholder="e.g. 8.5 / 10"
                            className={`w-full px-3 py-2 bg-black/70 rounded text-sm font-mono text-white focus:outline-none transition-colors ${
                              modalFeedback === "positive"
                                ? "border border-emerald-500/50 focus:border-emerald-400"
                                : modalFeedback === "waitlist"
                                ? "border border-amber-400/60 focus:border-amber-300"
                                : modalFeedback === "negative"
                                ? "border border-rose-500/50 focus:border-rose-400"
                                : "border border-white/20 focus:border-amber-400"
                            }`}
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-mono text-gray-300 mb-1 uppercase tracking-wider">
                            Comments / Interview Remarks
                          </label>
                          <textarea
                            rows={3}
                            value={modalEdit.comments ?? currentModalApp.comments ?? ""}
                            onChange={(e) => handleInlineChange(currentModalApp._id, "comments", e.target.value)}
                            placeholder="Interview feedback, task performance, reasoning for score..."
                            className={`w-full px-3 py-2 bg-black/70 rounded text-xs font-mono text-white focus:outline-none transition-colors ${
                              modalFeedback === "positive"
                                ? "border border-emerald-500/50 focus:border-emerald-400"
                                : modalFeedback === "waitlist"
                                ? "border border-amber-400/60 focus:border-amber-300"
                                : modalFeedback === "negative"
                                ? "border border-rose-500/50 focus:border-rose-400"
                                : "border border-white/20 focus:border-blue-400"
                            }`}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
                        <div>
                          {currentModalApp.evaluatedBy && (
                            <span className="font-mono text-[10px] text-gray-400 block">
                              Last saved by {currentModalApp.evaluatedBy} on{" "}
                              {currentModalApp.evaluatedAt ? new Date(currentModalApp.evaluatedAt).toLocaleString() : ""}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => saveEvaluation(currentModalApp._id)}
                          disabled={modalEdit.isSaving}
                          className={`w-full sm:w-auto px-5 py-2.5 font-bold rounded font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-lg cursor-pointer ${
                            modalFeedback === "positive"
                              ? "bg-emerald-500 text-black hover:bg-emerald-400"
                              : modalFeedback === "waitlist"
                              ? "bg-amber-400 text-black hover:bg-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.4)]"
                              : modalFeedback === "negative"
                              ? "bg-rose-500 text-white hover:bg-rose-400"
                              : "bg-white text-black hover:bg-gray-200"
                          }`}
                        >
                          <FaSave className="text-xs" />
                          {modalEdit.isSaving ? "Saving..." : "Save Evaluation"}
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Modal Footer */}
              <div className="p-3 sm:p-4 border-t border-white/10 bg-black/80 flex items-center justify-between font-mono text-xs">
                <span className="text-gray-500 text-[11px] sm:text-xs truncate pr-2">
                  Use arrows in top right to navigate candidates.
                </span>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-1.5 glass-panel border border-white/20 text-gray-300 hover:text-white rounded flex-shrink-0 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
