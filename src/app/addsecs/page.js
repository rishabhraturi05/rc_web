"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  FaDownload,
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaClock,
  FaUserAstronaut,
  FaSignOutAlt,
  FaEye,
  FaSave,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaRegCommentDots,
  FaStar,
  FaThumbsUp,
  FaThumbsDown,
  FaLaptopCode,
  FaCogs,
  FaMicrochip,
  FaBullhorn,
  FaLock,
  FaUser,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import { getRecruitmentFormTitle } from "@/app/lib/recruitment";

const DEPARTMENTS = [
  {
    name: "Software",
    icon: FaLaptopCode,
    color: "text-blue-400",
    border: "border-blue-500/30",
  },
  {
    name: "Mechanical",
    icon: FaCogs,
    color: "text-amber-400",
    border: "border-amber-500/30",
  },
  {
    name: "Embedded",
    icon: FaMicrochip,
    color: "text-emerald-400",
    border: "border-emerald-500/30",
  },
  {
    name: "PR",
    icon: FaBullhorn,
    color: "text-purple-400",
    border: "border-purple-500/30",
  },
];

export default function AddSecDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [forms, setForms] = useState([]);
  const [activeFormId, setActiveFormId] = useState("");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingApps, setLoadingApps] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState({ text: "", type: "info" });

  // Direct Inline Login State when unauthenticated
  const [loginCreds, setLoginCreds] = useState({ username: "", password: "" });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleInlineLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");

    try {
      const result = await signIn("credentials", {
        username: loginCreds.username.trim(),
        password: loginCreds.password.trim(),
        redirect: false,
      });

      if (result?.error) {
        setLoginError("Invalid ID or password. Please verify your credentials.");
      } else if (result?.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error("Login error:", err);
      setLoginError("An error occurred during authentication.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");
  const [evaluationFilter, setEvaluationFilter] = useState("all"); // 'all', 'evaluated', 'pending'
  const [feedbackFilter, setFeedbackFilter] = useState("all"); // 'all', 'positive', 'negative', 'unclassified'
  const [sortBy, setSortBy] = useState("newest"); // 'newest', 'oldest', 'points_desc', 'points_asc', 'name_asc'

  // Inline edits state: { [appId]: { points, comments, feedback, isDirty, isSaving, savedRecently } }
  const [inlineEdits, setInlineEdits] = useState({});

  // Review Modal state
  const [modalAppIndex, setModalAppIndex] = useState(null); // index in filteredApplications
  const [modalOpen, setModalOpen] = useState(false);

  // Department name from session
  const departmentName = session?.user?.department || "Department";

  // Auth protection check: load department forms when authenticated
  useEffect(() => {
    if (status === "authenticated" && (session?.user?.role === "addsec" || session?.user?.role === "admin")) {
      fetchDepartmentForms();
    } else if (status !== "loading") {
      setLoading(false);
    }
  }, [status, session]);

  // Auto-dismiss feedback message after 4s
  useEffect(() => {
    if (feedbackMessage.text) {
      const timer = setTimeout(() => {
        setFeedbackMessage({ text: "", type: "info" });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [feedbackMessage]);

  const showToast = (text, type = "success") => {
    setFeedbackMessage({ text, type });
  };

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      router.push("/addsecs/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const fetchDepartmentForms = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/addsecs/forms");
      const result = await response.json();

      if (!result.success) {
        showToast(result.message || "Failed to load forms.", "error");
        setLoading(false);
        return;
      }

      const formList = result.data || [];
      setForms(formList);

      if (activeFormId && formList.some((f) => f._id === activeFormId)) {
        await fetchApplications(activeFormId);
      }
    } catch (error) {
      console.error("Error fetching forms:", error);
      showToast("Error connecting to server.", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async (formId) => {
    if (!formId) return;
    setLoadingApps(true);
    try {
      const response = await fetch(`/api/addsecs/forms/${formId}/applications`);
      const result = await response.json();

      if (result.success) {
        const apps = result.data?.applications || [];
        setApplications(apps);

        // Initialize inline edits
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
      } else {
        showToast(result.message || "Failed to fetch applicants.", "error");
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      showToast("Error loading applicant entries.", "error");
    } finally {
      setLoadingApps(false);
    }
  };

  const handleSelectForm = (formId) => {
    if (formId === activeFormId) return;
    setActiveFormId(formId);
    fetchApplications(formId);
  };

  const activeForm = useMemo(
    () => forms.find((f) => f._id === activeFormId) || null,
    [forms, activeFormId]
  );

  // Filtered & Sorted Applications
  const filteredApplications = useMemo(() => {
    if (!applications.length) return [];

    let list = applications.filter((app) => {
      // 1. Year filter
      const appYear = app.year || app.responses?.year || "";
      if (selectedYear !== "all" && appYear !== selectedYear) {
        return false;
      }

      // 2. Evaluation status filter
      const hasPoints = Boolean(inlineEdits[app._id]?.points || app.points);
      const hasComments = Boolean(inlineEdits[app._id]?.comments || app.comments);
      const isEvaluated = hasPoints || hasComments;

      if (evaluationFilter === "evaluated" && !isEvaluated) return false;
      if (evaluationFilter === "pending" && isEvaluated) return false;

      // 3. Feedback filter (Positive / Negative / Unclassified)
      const currentFeedback =
        inlineEdits[app._id]?.feedback !== undefined
          ? inlineEdits[app._id]?.feedback
          : app.feedback || "";

      if (feedbackFilter === "positive" && currentFeedback !== "positive") return false;
      if (feedbackFilter === "negative" && currentFeedback !== "negative") return false;
      if (feedbackFilter === "unclassified" && Boolean(currentFeedback)) return false;

      // 4. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const candidateName = String(app.responses?.name || app.responses?.fullName || "").toLowerCase();
        const candidateRoll = String(app.responses?.rollno || app.responses?.rollNumber || "").toLowerCase();
        const candidateEmail = String(app.responses?.email || "").toLowerCase();
        const candidateComments = String(inlineEdits[app._id]?.comments || app.comments || "").toLowerCase();

        // Search through all response values as well
        const allAnswers = Object.values(app.responses || {})
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
        const pA = parseFloat(inlineEdits[a._id]?.points || a.points) || -999999;
        const pB = parseFloat(inlineEdits[b._id]?.points || b.points) || -999999;
        return pB - pA;
      }
      if (sortBy === "points_asc") {
        const pA = parseFloat(inlineEdits[a._id]?.points || a.points) || 999999;
        const pB = parseFloat(inlineEdits[b._id]?.points || b.points) || 999999;
        return pA - pB;
      }
      if (sortBy === "name_asc") {
        const nameA = String(a.responses?.name || "").toLowerCase();
        const nameB = String(b.responses?.name || "").toLowerCase();
        return nameA.localeCompare(nameB);
      }
      // default: newest
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return list;
  }, [applications, selectedYear, evaluationFilter, feedbackFilter, searchQuery, sortBy, inlineEdits]);

  // Overall Statistics for this Form & Department
  const stats = useMemo(() => {
    const total = applications.length;
    let evaluated = 0;
    let positiveCount = 0;
    let negativeCount = 0;
    let totalPoints = 0;
    let numericPointsCount = 0;

    applications.forEach((app) => {
      const p = inlineEdits[app._id]?.points !== undefined ? inlineEdits[app._id]?.points : app.points;
      const c = inlineEdits[app._id]?.comments !== undefined ? inlineEdits[app._id]?.comments : app.comments;
      const fb = inlineEdits[app._id]?.feedback !== undefined ? inlineEdits[app._id]?.feedback : app.feedback;

      if (p || c || fb) evaluated++;
      if (fb === "positive") positiveCount++;
      if (fb === "negative") negativeCount++;

      const num = parseFloat(p);
      if (!Number.isNaN(num)) {
        totalPoints += num;
        numericPointsCount++;
      }
    });

    const pending = total - evaluated;
    const avgScore = numericPointsCount > 0 ? (totalPoints / numericPointsCount).toFixed(1) : "—";

    return { total, evaluated, pending, avgScore, positiveCount, negativeCount };
  }, [applications, inlineEdits]);

  // Handle inline change
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

  // Save evaluation for a single application
  const saveEvaluation = async (appId, customOverrides = null) => {
    const edit = customOverrides ? { ...(inlineEdits[appId] || {}), ...customOverrides } : inlineEdits[appId];
    if (!activeForm || !edit) return;

    setInlineEdits((prev) => ({
      ...prev,
      [appId]: { ...(prev[appId] || {}), ...edit, isSaving: true },
    }));

    try {
      const response = await fetch(`/api/addsecs/forms/${activeForm._id}/applications`, {
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
        showToast(result.message || "Failed to save evaluation.", "error");
        setInlineEdits((prev) => ({
          ...prev,
          [appId]: { ...(prev[appId] || {}), isSaving: false },
        }));
        return;
      }

      // Update local application record
      setApplications((prev) =>
        prev.map((app) =>
          app._id === appId
            ? {
                ...app,
                points: edit.points,
                comments: edit.comments,
                feedback: edit.feedback,
                evaluatedBy: result.data?.evaluatedBy,
                evaluatedAt: result.data?.evaluatedAt,
              }
            : app
        )
      );

      setInlineEdits((prev) => ({
        ...prev,
        [appId]: {
          ...(prev[appId] || {}),
          ...edit,
          isDirty: false,
          isSaving: false,
          savedRecently: true,
        },
      }));

      showToast("Evaluation saved to MongoDB.", "success");
    } catch (error) {
      console.error("Save evaluation error:", error);
      showToast("Network error while saving.", "error");
      setInlineEdits((prev) => ({
        ...prev,
        [appId]: { ...(prev[appId] || {}), isSaving: false },
      }));
    }
  };

  // Helper to build Excel rows
  const buildExcelRows = (form, appList) => {
    const customFields = (form?.fields || []).filter(
      (f) => !["department", "year"].includes(String(f.name || "").toLowerCase())
    );

    return appList.map((app) => {
      const edit = inlineEdits[app._id] || {};
      const pointsVal = edit.points !== undefined ? edit.points : app.points || "";
      const commentsVal = edit.comments !== undefined ? edit.comments : app.comments || "";
      const feedbackVal = edit.feedback !== undefined ? edit.feedback : app.feedback || "";

      const row = {
        "Submission Time": new Date(app.createdAt).toLocaleString(),
        "Applicant Name": app.responses?.name || app.responses?.fullName || "—",
        "Roll Number": app.responses?.rollno || app.responses?.rollNumber || "—",
        "Email": app.responses?.email || "—",
        "Department": app.department,
        "Year of Study": app.year || app.responses?.year || "—",
      };

      // Custom form fields
      customFields.forEach((field) => {
        const key = field.name || field.label;
        const label = field.label || field.name;
        const val = app.responses?.[key];
        row[label] =
          typeof val === "boolean"
            ? val ? "Yes" : "No"
            : val === undefined || val === null
            ? ""
            : String(val);
      });

      // Evaluation columns
      row["Feedback Classification"] =
        feedbackVal === "positive"
          ? "Positive"
          : feedbackVal === "negative"
          ? "Negative"
          : "Unclassified";
      row["Points / Score"] = pointsVal;
      row["Comments / Remarks"] = commentsVal;
      row["Evaluated By"] = app.evaluatedBy || "";
      row["Evaluated At"] = app.evaluatedAt ? new Date(app.evaluatedAt).toLocaleString() : "";

      return row;
    });
  };

  // 1. Export Current Filtered Table
  const exportFilteredView = () => {
    if (!filteredApplications.length) {
      showToast("No applicants match the current filter to export.", "error");
      return;
    }
    if (!activeForm) return;

    const rows = buildExcelRows(activeForm, filteredApplications);
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, `${departmentName}_Filtered`);

    const safeFormTitle = getRecruitmentFormTitle(activeForm).replace(/[^a-zA-Z0-9_-]+/g, "_");
    XLSX.writeFile(workbook, `${departmentName}_${safeFormTitle}_Filtered_${Date.now()}.xlsx`);
    showToast("Downloaded filtered applicants Excel file.");
  };

  // 2. Export All Applicants for this Form
  const exportThisForm = () => {
    if (!applications.length) {
      showToast("No applicants available in this form to export.", "error");
      return;
    }
    if (!activeForm) return;

    const rows = buildExcelRows(activeForm, applications);
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, `${departmentName}_All`);

    const safeFormTitle = getRecruitmentFormTitle(activeForm).replace(/[^a-zA-Z0-9_-]+/g, "_");
    XLSX.writeFile(workbook, `${departmentName}_${safeFormTitle}_All_Entries.xlsx`);
    showToast("Downloaded all form applicants Excel file.");
  };

  // 3. Export All Forms for this Department
  const exportAllForms = async () => {
    try {
      showToast("Preparing department full export...", "info");
      const response = await fetch("/api/addsecs/applications/all");
      const result = await response.json();

      if (!result.success || !result.data?.applications?.length) {
        showToast("No entries found across forms to export.", "error");
        return;
      }

      const { formsMap, applications: allApps } = result.data;
      const allRows = allApps.map((app) => {
        const formObj = formsMap[app.formId] || {};
        const edit = inlineEdits[app._id] || {};
        const pointsVal = edit.points !== undefined ? edit.points : app.points || "";
        const commentsVal = edit.comments !== undefined ? edit.comments : app.comments || "";

        const row = {
          "Form Title": formObj.title || "Recruitment Form",
          "Submission Time": new Date(app.createdAt).toLocaleString(),
          "Applicant Name": app.responses?.name || app.responses?.fullName || "—",
          "Roll Number": app.responses?.rollno || app.responses?.rollNumber || "—",
          "Email": app.responses?.email || "—",
          "Department": app.department,
          "Year of Study": app.year || app.responses?.year || "—",
        };

        const customFields = (formObj.fields || []).filter(
          (f) => !["department", "year"].includes(String(f.name || "").toLowerCase())
        );

        customFields.forEach((field) => {
          const key = field.name || field.label;
          const label = field.label || field.name;
          const val = app.responses?.[key];
          row[label] =
            typeof val === "boolean"
              ? val ? "Yes" : "No"
              : val === undefined || val === null
              ? ""
              : String(val);
        });

        const feedbackVal = edit.feedback !== undefined ? edit.feedback : app.feedback || "";
        row["Feedback Classification"] =
          feedbackVal === "positive"
            ? "Positive"
            : feedbackVal === "negative"
            ? "Negative"
            : "Unclassified";
        row["Points / Score"] = pointsVal;
        row["Comments / Remarks"] = commentsVal;
        row["Evaluated By"] = app.evaluatedBy || "";
        row["Evaluated At"] = app.evaluatedAt ? new Date(app.evaluatedAt).toLocaleString() : "";

        return row;
      });

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(allRows);
      XLSX.utils.book_append_sheet(workbook, worksheet, `${departmentName}_Full`);
      XLSX.writeFile(workbook, `RC_${departmentName}_All_Recruitments_${Date.now()}.xlsx`);
      showToast("Downloaded full department Excel export!");
    } catch (error) {
      console.error("Export all forms error:", error);
      showToast("Failed to generate complete export.", "error");
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

  if (status === "unauthenticated" || (status !== "loading" && session?.user?.role !== "addsec" && session?.user?.role !== "admin")) {
    return (
      <div className="relative min-h-screen text-white flex flex-col justify-center pt-28 sm:pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Title Header */}
        <div className="relative z-10 text-center pb-8" data-aos="fade-up">
          <div className="inline-block px-3 py-1 mb-3 rounded-full text-xs font-mono uppercase tracking-widest bg-white/10 text-gray-300 border border-white/20">
            Department Additional Secretaries Portal
          </div>
          <h1 className="font-mono text-3xl sm:text-5xl font-bold tracking-tight mb-3 text-white">
            {">_"} ADDSEC_LOGIN
          </h1>
          <p className="font-mono text-gray-400 text-sm sm:text-base max-w-lg mx-auto">
            Sign in with your department ID to access recruitment applicant entries, scoring, and Excel reports.
          </p>
        </div>

        {/* 4 Department Badges with One-Click Autofill */}
        <div className="max-w-xl mx-auto w-full mb-8">
          <div className="text-center mb-2.5">
            <span className="font-mono text-[11px] text-gray-400 uppercase tracking-wider">
              [ Additional Secretary Departments ]
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {DEPARTMENTS.map((dept) => {
              const Icon = dept.icon;
              return (
                <div
                  key={dept.name}
                  className={`p-3 text-center rounded border transition-all duration-200 flex flex-col items-center justify-center space-y-1.5 glass-panel ${dept.border}`}
                >
                  <Icon className={`text-xl ${dept.color}`} />
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-gray-200">
                    {dept.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Login Form Container */}
        <div className="relative z-10 max-w-md mx-auto w-full">
          <form
            onSubmit={handleInlineLogin}
            className="glass-panel p-6 sm:p-8 space-y-6 shadow-2xl border border-white/20"
          >
            <div>
              <label
                htmlFor="login_username"
                className="block text-xs font-bold text-white mb-2 font-mono uppercase tracking-wider flex items-center gap-2"
              >
                <FaUser className="text-gray-400" />
                AddSec Department ID
              </label>
              <input
                id="login_username"
                name="username"
                type="text"
                value={loginCreds.username}
                onChange={(e) =>
                  setLoginCreds((prev) => ({ ...prev, username: e.target.value }))
                }
                autoComplete="username"
                required
                className="w-full px-4 py-3 bg-black/60 border border-white/20 rounded text-white placeholder-gray-500 focus:outline-none focus:border-white transition-all duration-300 font-mono text-sm"
                placeholder="e.g. addsec_software or software"
              />
            </div>

            <div>
              <label
                htmlFor="login_password"
                className="block text-xs font-bold text-white mb-2 font-mono uppercase tracking-wider flex items-center gap-2"
              >
                <FaLock className="text-gray-400" />
                Password
              </label>
              <input
                id="login_password"
                name="password"
                type="password"
                value={loginCreds.password}
                onChange={(e) =>
                  setLoginCreds((prev) => ({ ...prev, password: e.target.value }))
                }
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 bg-black/60 border border-white/20 rounded text-white placeholder-gray-500 focus:outline-none focus:border-white transition-all duration-300 font-mono text-sm"
                placeholder="••••••••"
              />
            </div>

            {loginError && (
              <div className="px-4 py-3 bg-red-950/40 border border-red-500/80 rounded">
                <p className="font-mono text-red-400 text-xs">{loginError}</p>
              </div>
            )}

            <div className="pt-2 space-y-3">
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full px-6 py-3 bg-white text-black hover:bg-gray-200 disabled:opacity-60 disabled:cursor-not-allowed font-bold rounded transition-all duration-300 font-mono uppercase tracking-widest border border-white text-sm"
              >
                {isLoggingIn ? "[ AUTHENTICATING... ]" : "[ ACCESS_DEPARTMENT_PORTAL ]"}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/internal"
                  className="inline-flex items-center gap-1.5 font-mono text-xs text-gray-400 hover:text-white transition-colors underline underline-offset-4"
                >
                  <FaArrowLeft className="text-[10px]" />
                  <span>[ Back to Internal Gateway ]</span>
                </Link>
              </div>
            </div>

            <div className="text-center pt-1">
              <p className="font-mono text-xs text-gray-500">
                Robotics Club NITW &bull; Internal Recruitment System
              </p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (status === "loading" || loading) {
    return (
      <div className="relative min-h-screen text-white flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <p className="font-mono text-gray-300 text-lg animate-pulse">{">_"} Initializing AddSec Portal[...]</p>
          <p className="font-mono text-gray-500 text-xs">Authenticating and retrieving department records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-white pt-28 sm:pt-32 lg:pt-36 pb-16 px-3 sm:px-6 lg:px-8">
      {/* Toast Notification */}
      {feedbackMessage.text && (
        <div
          className={`fixed top-24 sm:top-28 right-4 z-50 px-4 py-3 rounded border font-mono text-sm shadow-xl transition-all duration-300 ${
            feedbackMessage.type === "error"
              ? "bg-red-950/90 border-red-500 text-red-200"
              : "bg-emerald-950/90 border-emerald-500 text-emerald-200"
          }`}
        >
          {feedbackMessage.type === "error" ? "⚠ " : "✓ "}
          {feedbackMessage.text}
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {!activeForm ? (
          /* Recruitment Drive Selection View */
          <>
            {/* Top Header Bar for Selection */}
            <div className="glass-panel p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-white/20">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase tracking-wider bg-white/10 text-white border border-white/30">
                    {departmentName} Department
                  </span>
                  <span className="text-xs font-mono text-gray-400">
                    Logged in as <strong className="text-white">{session?.user?.username}</strong>
                  </span>
                </div>
                <h1 className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                  {">_"} ADDSEC_PORTAL
                </h1>
                <p className="font-mono text-gray-400 text-xs sm:text-sm mt-1">
                  Select recruitment below to view applicants, evaluate responses, and record verdicts.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-transparent hover:bg-red-600/30 text-gray-300 hover:text-white border border-white/20 hover:border-red-500/50 rounded font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition-colors"
                >
                  <FaSignOutAlt className="text-xs" />
                  [ Logout ]
                </button>
              </div>
            </div>

            {/* Recruitment Selection Section */}
            <div className="glass-panel p-6 sm:p-8 border border-white/20 space-y-6">
              <div className="border-b border-white/10 pb-4">
                <span className="text-xs font-mono text-gray-400 uppercase tracking-widest block mb-1">
                  {"// SELECT_RECRUITMENT"}
                </span>
                <h2 className="font-mono text-xl sm:text-2xl font-bold text-white">
                  Recruitment
                </h2>
                <p className="font-mono text-gray-400 text-xs sm:text-sm mt-1">
                  Select <strong className="text-white">Recruitment</strong> below to inspect applicant submissions, evaluate candidate responses, and assign grades for {departmentName} Department.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {forms.length > 0 ? (
                  forms.map((form) => {
                    const isOpen = form.isOpen && (!form.deadline || new Date(form.deadline) > new Date());

                    return (
                      <div
                        key={form._id}
                        className="glass-panel p-6 border border-white/20 hover:border-white/50 transition-all duration-300 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex items-center justify-end mb-3">
                            <span
                              className={`text-xs px-2.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider ${
                                isOpen
                                  ? "bg-green-950/80 text-green-300 border border-green-600/50"
                                  : "bg-gray-800 text-gray-400 border border-gray-700"
                              }`}
                            >
                              {isOpen ? "● ACTIVE" : "● CLOSED"}
                            </span>
                          </div>

                          <h3 className="font-mono text-xl sm:text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                            Recruitment
                          </h3>

                          {/* Top 3 Stat Boxes */}
                          <div className="grid grid-cols-3 gap-2 my-4 pt-3 border-t border-white/10 text-xs font-mono">
                            <div className="p-2.5 rounded bg-black/40 border border-white/10">
                              <span className="text-gray-400 block text-[10px] uppercase">Department</span>
                              <span className="text-white font-bold text-xs truncate block">{departmentName}</span>
                            </div>
                            <div className="p-2.5 rounded bg-black/40 border border-white/10">
                              <span className="text-gray-400 block text-[10px] uppercase">Applicants</span>
                              <span className="text-white font-bold text-xs block">{form.totalApplications || 0}</span>
                            </div>
                            <div className="p-2.5 rounded bg-black/40 border border-white/10">
                              <span className="text-gray-400 block text-[10px] uppercase">Evaluated</span>
                              <span className="text-emerald-400 font-bold text-xs block">{form.evaluatedApplications || 0}</span>
                            </div>
                          </div>

                          {/* Eligible Years Box - wraps cleanly without overflowing */}
                          <div className="p-2.5 rounded bg-black/40 border border-white/10 text-xs font-mono mb-4">
                            <span className="text-gray-400 block text-[10px] uppercase mb-1.5">Eligible Years</span>
                            <div className="flex flex-wrap gap-1.5">
                              {(Array.isArray(form.years) && form.years.length ? form.years : ["All Years"]).map((yr) => (
                                <span
                                  key={yr}
                                  className="px-2 py-0.5 rounded bg-white/10 text-gray-200 text-[11px] font-medium border border-white/15 whitespace-nowrap"
                                >
                                  {yr}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleSelectForm(form._id)}
                          className="w-full py-3 px-4 rounded bg-white text-black hover:bg-gray-200 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md mt-2"
                        >
                          <span>[ Choose Recruitment ]</span>
                          <FaArrowRight className="text-xs" />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="glass-panel p-6 border border-white/20 rounded-lg bg-white/[0.02] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-end mb-3">
                        <span className="text-xs px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider bg-amber-950/80 text-amber-300 border border-amber-600/50">
                          AWAITING FORM
                        </span>
                      </div>
                      <h3 className="font-mono text-xl font-bold text-white">
                        Recruitment
                      </h3>
                      <p className="font-mono text-xs text-gray-400 mt-2">
                        No active recruitment forms are currently linked with the <strong>{departmentName}</strong> department in the database. Please ensure forms configured in the Admin Portal include the {departmentName} department.
                      </p>
                    </div>
                    <button
                      onClick={fetchDepartmentForms}
                      className="mt-6 w-full py-2.5 px-4 rounded bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold uppercase tracking-wider border border-white/20 transition-colors"
                    >
                      [ ↻ Refresh Forms ]
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Recruitment Details View */
          <>
            {/* Top Header Bar */}
            <div className="glass-panel p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-white/20">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase tracking-wider bg-white/10 text-white border border-white/30">
                    {departmentName} Department
                  </span>
                  <span className="text-xs font-mono text-gray-400">
                    Logged in as <strong className="text-white">{session?.user?.username}</strong>
                  </span>
                </div>
                <h1 className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                  {">_"} RECRUITMENT_DETAILS
                </h1>
                <p className="font-mono text-gray-400 text-xs sm:text-sm mt-1">
                  Review applicant responses, give points/scores, take interview notes, and export to Excel.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setActiveFormId(null)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition-colors"
                  title="Return to recruitment selection"
                >
                  <FaArrowLeft className="text-xs" />
                  [ Switch Recruitment ]
                </button>
                <button
                  onClick={exportAllForms}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-200 border border-white/20 rounded font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition-colors"
                  title="Download all entries for your department across all recruitment forms"
                >
                  <FaDownload className="text-xs" />
                  [ Export All Forms (.xlsx) ]
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-transparent hover:bg-red-600/30 text-gray-300 hover:text-white border border-white/20 hover:border-red-500/50 rounded font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition-colors"
                >
                  <FaSignOutAlt className="text-xs" />
                  [ Logout ]
                </button>
              </div>
            </div>

            {/* Active Recruitment Ribbon / Switcher */}
            <div className="glass-panel px-4 py-3 border border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-gray-400 uppercase tracking-wider">Active:</span>
                <span className="px-2.5 py-0.5 rounded bg-white text-black font-bold">
                  Recruitment
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    activeForm?.isOpen && (!activeForm.deadline || new Date(activeForm.deadline) > new Date())
                      ? "bg-green-950 text-green-300 border border-green-700"
                      : "bg-gray-800 text-gray-400"
                  }`}
                >
                  {activeForm?.isOpen && (!activeForm.deadline || new Date(activeForm.deadline) > new Date())
                    ? "ACTIVE"
                    : "CLOSED"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {forms.length > 1 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-gray-400">Switch:</span>
                    {forms.map((f) => {
                      const isCurrent = f._id === activeFormId;
                      return (
                        <button
                          key={f._id}
                          onClick={() => handleSelectForm(f._id)}
                          className={`px-2 py-1 rounded text-[11px] border transition-colors ${
                            isCurrent
                              ? "bg-white text-black border-white font-bold"
                              : "bg-white/5 hover:bg-white/15 text-gray-300 border-white/20"
                          }`}
                        >
                          {f.title || "Form"}
                        </button>
                      );
                    })}
                  </div>
                )}
                <button
                  onClick={() => setActiveFormId(null)}
                  className="px-2.5 py-1 text-gray-400 hover:text-white underline text-[11px]"
                >
                  [ Switch Recruitment ]
                </button>
              </div>
            </div>

        {/* Selected Form Active Banner & Quick Stats */}
        {activeForm && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="glass-panel p-4 border border-white/10 flex flex-col justify-between">
              <span className="font-mono text-xs text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <FaUserAstronaut className="text-gray-300" /> Total
              </span>
              <div className="font-mono text-2xl sm:text-3xl font-bold mt-2 text-white">
                {stats.total}
              </div>
              <span className="font-mono text-[11px] text-gray-500 mt-1">In {departmentName}</span>
            </div>

            <div className="glass-panel p-4 border border-emerald-500/30 bg-emerald-950/15 flex flex-col justify-between">
              <span className="font-mono text-xs text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <FaThumbsUp className="text-emerald-400" /> Positive
              </span>
              <div className="font-mono text-2xl sm:text-3xl font-bold mt-2 text-emerald-400">
                {stats.positiveCount}
              </div>
              <span className="font-mono text-[11px] text-emerald-500/70 mt-1">Green verdict</span>
            </div>

            <div className="glass-panel p-4 border border-rose-500/30 bg-rose-950/15 flex flex-col justify-between">
              <span className="font-mono text-xs text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <FaThumbsDown className="text-rose-400" /> Negative
              </span>
              <div className="font-mono text-2xl sm:text-3xl font-bold mt-2 text-rose-400">
                {stats.negativeCount}
              </div>
              <span className="font-mono text-[11px] text-rose-500/70 mt-1">Red verdict</span>
            </div>

            <div className="glass-panel p-4 border border-white/10 flex flex-col justify-between">
              <span className="font-mono text-xs text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <FaCheckCircle className="text-blue-400" /> Evaluated
              </span>
              <div className="font-mono text-2xl sm:text-3xl font-bold mt-2 text-blue-400">
                {stats.evaluated}
              </div>
              <span className="font-mono text-[11px] text-gray-500 mt-1">Notes / points given</span>
            </div>

            <div className="glass-panel p-4 border border-white/10 flex flex-col justify-between col-span-2 sm:col-span-1">
              <span className="font-mono text-xs text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <FaStar className="text-amber-400" /> Avg Score
              </span>
              <div className="font-mono text-2xl sm:text-3xl font-bold mt-2 text-amber-400">
                {stats.avgScore}
              </div>
              <span className="font-mono text-[11px] text-gray-500 mt-1">From numeric scores</span>
            </div>
          </div>
        )}

        {/* Filter and Search Bar */}
        {activeForm && (
          <div className="glass-panel p-4 sm:p-5 border border-white/15 space-y-4">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, roll no, email, or any response keyword..."
                  className="w-full pl-9 pr-4 py-2.5 bg-black/60 border border-white/20 rounded text-sm font-mono text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <FaTimes className="text-xs" />
                  </button>
                )}
              </div>

              {/* Year Filter */}
              <div className="flex items-center gap-2">
                <label className="font-mono text-xs text-gray-400 whitespace-nowrap">Year:</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-black/60 border border-white/20 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-white"
                >
                  <option value="all">All Years</option>
                  {(activeForm.years || ["1st Year", "2nd Year", "3rd Year", "4th Year"]).map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>

              {/* Evaluation Status Filter */}
              <div className="flex items-center gap-2">
                <label className="font-mono text-xs text-gray-400 whitespace-nowrap">Status:</label>
                <select
                  value={evaluationFilter}
                  onChange={(e) => setEvaluationFilter(e.target.value)}
                  className="bg-black/60 border border-white/20 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-white"
                >
                  <option value="all">All Status</option>
                  <option value="evaluated">Evaluated Only</option>
                  <option value="pending">Pending Only</option>
                </select>
              </div>

              {/* Feedback Filter */}
              <div className="flex items-center gap-2">
                <label className="font-mono text-xs text-gray-400 whitespace-nowrap">Feedback:</label>
                <select
                  value={feedbackFilter}
                  onChange={(e) => setFeedbackFilter(e.target.value)}
                  className="bg-black/60 border border-white/20 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-white"
                >
                  <option value="all">All Feedback</option>
                  <option value="positive">👍 Positive (Green)</option>
                  <option value="negative">👎 Negative (Red)</option>
                  <option value="unclassified">Unclassified</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-2">
                <label className="font-mono text-xs text-gray-400 whitespace-nowrap">Sort:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-black/60 border border-white/20 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-white"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="points_desc">Points: High to Low</option>
                  <option value="points_asc">Points: Low to High</option>
                  <option value="name_asc">Name: A to Z</option>
                </select>
              </div>
            </div>

            {/* Bottom Row of Filter Bar: Count + Excel Buttons */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-white/10 text-xs font-mono">
              <div className="text-gray-400">
                Showing <strong className="text-white">{filteredApplications.length}</strong> of{" "}
                <strong className="text-white">{applications.length}</strong> candidates
                {(searchQuery || selectedYear !== "all" || evaluationFilter !== "all" || feedbackFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedYear("all");
                      setEvaluationFilter("all");
                      setFeedbackFilter("all");
                      setSortBy("newest");
                    }}
                    className="ml-2 text-blue-400 hover:underline"
                  >
                    [ Clear Filters ]
                  </button>
                )}
              </div>

              {/* Excel Download Buttons */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={exportFilteredView}
                  disabled={!filteredApplications.length}
                  className="px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Download the current table rows as Excel"
                >
                  <FaDownload className="text-xs" />
                  [ Export Filtered ({filteredApplications.length}) ]
                </button>

                <button
                  onClick={exportThisForm}
                  disabled={!applications.length}
                  className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Download all applicants for this form"
                >
                  <FaDownload className="text-xs" />
                  [ Export All ({applications.length}) ]
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Applicant Entries Table */}
        {activeForm && (
          <div className="glass-panel border border-white/15 overflow-hidden">
            {loadingApps ? (
              <div className="p-12 text-center">
                <p className="font-mono text-gray-400 text-sm animate-pulse">Loading applicant entries...</p>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <p className="font-mono text-gray-300 text-base">No applicants found matching your criteria.</p>
                <p className="font-mono text-gray-500 text-xs">Try clearing filters or search keywords.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-white/5 border-b border-white/15 text-gray-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-3 w-12 text-center">#</th>
                      <th className="py-3 px-4 min-w-[180px]">Applicant Info</th>
                      <th className="py-3 px-3 min-w-[90px]">Year</th>
                      <th className="py-3 px-4 min-w-[140px]">Responses Preview</th>
                      <th className="py-3 px-3 min-w-[125px] text-center">
                        <div className="flex items-center justify-center gap-1">
                          <FaThumbsUp className="text-emerald-400 text-xs" />
                          <span>/</span>
                          <FaThumbsDown className="text-rose-400 text-xs" />
                          <span>Feedback</span>
                        </div>
                      </th>
                      <th className="py-3 px-3 min-w-[110px]">
                        <div className="flex items-center gap-1">
                          <FaStar className="text-amber-400 text-xs" />
                          <span>Points</span>
                        </div>
                      </th>
                      <th className="py-3 px-4 min-w-[240px]">
                        <div className="flex items-center gap-1">
                          <FaRegCommentDots className="text-blue-400 text-xs" />
                          <span>Comments / Remarks</span>
                        </div>
                      </th>
                      <th className="py-3 px-3 min-w-[110px] text-center">Actions</th>
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

                      return (
                        <tr
                          key={app._id}
                          className={`transition-colors group ${
                            candidateFeedback === "positive"
                              ? "border-l-4 border-l-emerald-500 bg-emerald-950/15 hover:bg-emerald-950/25"
                              : candidateFeedback === "negative"
                              ? "border-l-4 border-l-rose-500 bg-rose-950/15 hover:bg-rose-950/25"
                              : "hover:bg-white/[0.03]"
                          }`}
                        >
                          {/* Index */}
                          <td className="py-3 px-3 text-center text-gray-500">{index + 1}</td>

                          {/* Applicant Info */}
                          <td className="py-3 px-4">
                            <div className="font-bold text-white text-sm">{candidateName}</div>
                            <div className="text-gray-400 text-[11px] flex items-center gap-2 mt-0.5">
                              <span>Roll: <strong className="text-gray-300">{candidateRoll}</strong></span>
                            </div>
                            <div className="text-gray-500 text-[10px] truncate max-w-[200px]" title={candidateEmail}>
                              {candidateEmail}
                            </div>
                          </td>

                          {/* Year */}
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded text-[11px] bg-white/10 text-gray-300 border border-white/20 whitespace-nowrap">
                              {candidateYear}
                            </span>
                          </td>

                          {/* Responses Preview */}
                          <td className="py-3 px-4">
                            <button
                              onClick={() => openModal(index)}
                              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors"
                            >
                              <FaEye className="text-xs" />
                              <span>View All ({Object.keys(app.responses || {}).length})</span>
                            </button>
                            <div className="text-[10px] text-gray-500 mt-1">
                              {new Date(app.createdAt).toLocaleDateString()}
                            </div>
                          </td>

                          {/* Feedback Classification Cell */}
                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  const nextVal = candidateFeedback === "positive" ? "" : "positive";
                                  handleInlineChange(app._id, "feedback", nextVal);
                                  saveEvaluation(app._id, { ...edit, feedback: nextVal });
                                }}
                                className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1 ${
                                  candidateFeedback === "positive"
                                    ? "bg-emerald-500 text-black border border-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.5)] scale-105"
                                    : "bg-white/5 hover:bg-emerald-950/40 text-gray-400 hover:text-emerald-300 border border-white/10"
                                }`}
                                title="Classify as Positive Feedback"
                              >
                                <FaThumbsUp className="text-[10px]" />
                                <span>{candidateFeedback === "positive" ? "Pos" : "+"}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  const nextVal = candidateFeedback === "negative" ? "" : "negative";
                                  handleInlineChange(app._id, "feedback", nextVal);
                                  saveEvaluation(app._id, { ...edit, feedback: nextVal });
                                }}
                                className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1 ${
                                  candidateFeedback === "negative"
                                    ? "bg-rose-500 text-white border border-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.5)] scale-105"
                                    : "bg-white/5 hover:bg-rose-950/40 text-gray-400 hover:text-rose-300 border border-white/10"
                                }`}
                                title="Classify as Negative Feedback"
                              >
                                <FaThumbsDown className="text-[10px]" />
                                <span>{candidateFeedback === "negative" ? "Neg" : "-"}</span>
                              </button>
                            </div>
                          </td>

                          {/* Editable Points / Score */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={edit.points}
                                onChange={(e) => handleInlineChange(app._id, "points", e.target.value)}
                                onBlur={() => {
                                  if (edit.isDirty) saveEvaluation(app._id);
                                }}
                                placeholder="e.g. 9/10"
                                className={`w-20 px-2 py-1.5 bg-black/70 rounded text-center text-xs text-white focus:outline-none transition-colors font-bold ${
                                  candidateFeedback === "positive"
                                    ? "border border-emerald-500/50 focus:border-emerald-400"
                                    : candidateFeedback === "negative"
                                    ? "border border-rose-500/50 focus:border-rose-400"
                                    : "border border-white/20 focus:border-amber-400"
                                }`}
                              />
                            </div>
                          </td>

                          {/* Editable Comments / Remarks */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <textarea
                                rows={1}
                                value={edit.comments}
                                onChange={(e) => handleInlineChange(app._id, "comments", e.target.value)}
                                onBlur={() => {
                                  if (edit.isDirty) saveEvaluation(app._id);
                                }}
                                placeholder="Add notes, interview review, impressions..."
                                className={`w-full px-2.5 py-1.5 bg-black/70 rounded text-xs text-white focus:outline-none transition-colors resize-none placeholder-gray-600 ${
                                  candidateFeedback === "positive"
                                    ? "border border-emerald-500/50 focus:border-emerald-400"
                                    : candidateFeedback === "negative"
                                    ? "border border-rose-500/50 focus:border-rose-400"
                                    : "border border-white/20 focus:border-blue-400"
                                }`}
                              />
                            </div>
                            {app.evaluatedBy && (
                              <div className="text-[10px] text-gray-500 mt-0.5">
                                By {app.evaluatedBy} • {app.evaluatedAt ? new Date(app.evaluatedAt).toLocaleDateString() : ""}
                              </div>
                            )}
                          </td>

                          {/* Save & Review Actions */}
                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {edit.isSaving ? (
                                <span className="text-[11px] text-amber-400 animate-pulse font-mono">
                                  Saving...
                                </span>
                              ) : edit.savedRecently ? (
                                <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                                  <FaCheckCircle className="text-xs" /> Saved
                                </span>
                              ) : edit.isDirty ? (
                                <button
                                  onClick={() => saveEvaluation(app._id)}
                                  className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/50 rounded text-[11px] font-mono uppercase tracking-wider flex items-center gap-1 transition-colors"
                                  title="Save changes to Mongo"
                                >
                                  <FaSave className="text-xs" /> Save
                                </button>
                              ) : (
                                <button
                                  onClick={() => openModal(index)}
                                  className="px-2.5 py-1 bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white border border-white/20 rounded text-[11px] font-mono uppercase tracking-wider transition-colors"
                                  title="Open candidate detailed review modal"
                                >
                                  Review
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
          </>
        )}
      </div>

      {/* Detailed Candidate Review Modal */}
      {modalOpen && currentModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-3xl max-h-[92vh] overflow-y-auto border border-white/25 shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/15 flex items-center justify-between sticky top-0 bg-black/90 backdrop-blur z-10">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400">
                  Applicant Review ({modalAppIndex + 1} of {filteredApplications.length})
                </span>
                <h2 className="font-mono text-xl sm:text-2xl font-bold text-white mt-0.5">
                  {currentModalApp.responses?.name || currentModalApp.responses?.fullName || "Candidate Profile"}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={prevModalApp}
                  disabled={modalAppIndex === 0}
                  className="p-2 glass-panel border border-white/20 text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded"
                  title="Previous Applicant"
                >
                  <FaChevronLeft className="text-xs" />
                </button>
                <button
                  onClick={nextModalApp}
                  disabled={modalAppIndex === filteredApplications.length - 1}
                  className="p-2 glass-panel border border-white/20 text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded"
                  title="Next Applicant"
                >
                  <FaChevronRight className="text-xs" />
                </button>
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-400 hover:text-white rounded ml-2"
                >
                  <FaTimes className="text-sm" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-6">
              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="bg-white/5 p-3 rounded border border-white/10">
                  <span className="text-gray-500 block">Roll Number</span>
                  <span className="text-white font-bold text-sm mt-0.5 block">
                    {currentModalApp.responses?.rollno || currentModalApp.responses?.rollNumber || "—"}
                  </span>
                </div>
                <div className="bg-white/5 p-3 rounded border border-white/10">
                  <span className="text-gray-500 block">Department</span>
                  <span className="text-white font-bold text-sm mt-0.5 block">
                    {currentModalApp.department}
                  </span>
                </div>
                <div className="bg-white/5 p-3 rounded border border-white/10">
                  <span className="text-gray-500 block">Year of Study</span>
                  <span className="text-white font-bold text-sm mt-0.5 block">
                    {currentModalApp.year || currentModalApp.responses?.year || "—"}
                  </span>
                </div>
                <div className="bg-white/5 p-3 rounded border border-white/10">
                  <span className="text-gray-500 block">Submitted At</span>
                  <span className="text-white font-bold text-xs mt-1 block">
                    {new Date(currentModalApp.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Email & Contact */}
              <div className="font-mono text-xs bg-white/5 p-3 rounded border border-white/10 flex items-center justify-between">
                <div>
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
              <div className="space-y-4">
                <h3 className="font-mono text-xs uppercase tracking-wider text-gray-400 border-b border-white/10 pb-1.5">
                  Form Question Responses
                </h3>
                <div className="space-y-3">
                  {(activeForm?.fields || [])
                    .filter((f) => !["name", "email", "rollno", "department", "year"].includes(String(f.name || "").toLowerCase()))
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

                      // Check if answer is a URL
                      const isUrl = String(formattedVal).startsWith("http://") || String(formattedVal).startsWith("https://");

                      return (
                        <div
                          key={key}
                          className="bg-black/50 p-3.5 rounded border border-white/10 font-mono space-y-1"
                        >
                          <label className="text-xs text-gray-400 block font-semibold">
                            {label}
                          </label>
                          <div className="text-xs text-gray-100 whitespace-pre-wrap leading-relaxed">
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
                    className={`p-4 sm:p-5 rounded-xl transition-all duration-300 space-y-4 ${
                      modalFeedback === "positive"
                        ? "bg-emerald-950/25 border-2 border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.35)]"
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
                              : modalFeedback === "negative"
                              ? "text-rose-300"
                              : "text-amber-300"
                          }`}
                        >
                          <FaStar /> Evaluation & Notes
                        </h3>

                        {modalFeedback === "positive" && (
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500 flex items-center gap-1">
                            <FaThumbsUp className="text-[9px]" /> Positive Feedback
                          </span>
                        )}
                        {modalFeedback === "negative" && (
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500 flex items-center gap-1">
                            <FaThumbsDown className="text-[9px]" /> Negative Feedback
                          </span>
                        )}
                      </div>

                      {/* Feedback Classification Buttons */}
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-gray-400 uppercase tracking-wider">
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
                          className={`px-3 py-1.5 rounded font-mono text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 transition-all ${
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
                              modalFeedback === "negative" ? "" : "negative"
                            )
                          }
                          className={`px-3 py-1.5 rounded font-mono text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 transition-all ${
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
                        onClick={() => saveEvaluation(currentModalApp._id)}
                        disabled={modalEdit.isSaving}
                        className={`px-5 py-2.5 font-bold rounded font-mono text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg ${
                          modalFeedback === "positive"
                            ? "bg-emerald-500 text-black hover:bg-emerald-400"
                            : modalFeedback === "negative"
                            ? "bg-rose-500 text-white hover:bg-rose-400"
                            : "bg-white text-black hover:bg-gray-200"
                        }`}
                      >
                        <FaSave className="text-xs" />
                        {modalEdit.isSaving ? "Saving to MongoDB..." : "Save Evaluation"}
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 bg-black/80 flex items-center justify-between font-mono text-xs">
              <span className="text-gray-500">
                Use arrows above or keyboard to cycle through candidates.
              </span>
              <button
                onClick={closeModal}
                className="px-4 py-1.5 glass-panel border border-white/20 text-gray-300 hover:text-white rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
