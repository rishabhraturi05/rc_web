"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { createPortal } from "react-dom";
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
  FaPlus,
  FaTrash,
  FaLaptopCode,
  FaCogs,
  FaMicrochip,
  FaBullhorn,
  FaLock,
  FaUser,
  FaArrowLeft,
  FaArrowRight,
  FaFilePdf,
  FaColumns,
  FaExternalLinkAlt,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import { getRecruitmentFormTitle, getApplicantResumeInfo } from "@/app/lib/recruitment";

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
  const [scoreFilter, setScoreFilter] = useState("all"); // 'all', 'positive', 'zero', 'negative', 'pending'
  const [sortBy, setSortBy] = useState("newest"); // 'newest', 'oldest', 'points_desc', 'points_asc', 'name_asc'

  // Inline edits state: { [appId]: { points, comments, feedback, positiveRemarks, negativeRemarks, isDirty, isSaving, savedRecently } }
  const [inlineEdits, setInlineEdits] = useState({});

  // Review Modal state
  const [modalAppIndex, setModalAppIndex] = useState(null); // index in filteredApplications
  const [modalOpen, setModalOpen] = useState(false);
  const [showResumeSplit, setShowResumeSplit] = useState(true);
  const [newPositiveInput, setNewPositiveInput] = useState("");
  const [newNegativeInput, setNewNegativeInput] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("admin-modal-open");
    } else {
      document.body.style.overflow = "";
      document.body.classList.remove("admin-modal-open");
    }
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("admin-modal-open");
    };
  }, [modalOpen]);

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
            positiveRemarks: Array.isArray(app.positiveRemarks) ? [...app.positiveRemarks] : [],
            negativeRemarks: Array.isArray(app.negativeRemarks) ? [...app.negativeRemarks] : [],
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

  // Helper to extract net score, formatting, and classification status
  const getCandidateScoreInfo = useCallback((app, edit) => {
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

    let scoreNum = null;
    let scoreFormatted = "—";
    let isEvaluated = false;

    if (hasRemarks) {
      scoreNum = currentPos.length - currentNeg.length;
      scoreFormatted = scoreNum > 0 ? `+${scoreNum}` : `${scoreNum}`;
      isEvaluated = true;
    } else if (hasPoints) {
      const parsed = parseFloat(currentPoints);
      if (!Number.isNaN(parsed)) {
        scoreNum = parsed;
        scoreFormatted = parsed > 0 ? `+${parsed}` : `${parsed}`;
      } else {
        scoreFormatted = String(currentPoints);
      }
      isEvaluated = true;
    } else if (hasComments) {
      isEvaluated = true;
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
      comments: currentComments || "",
    };
  }, []);

  // Filtered & Sorted Applications
  const filteredApplications = useMemo(() => {
    if (!applications.length) return [];

    let list = applications.filter((app) => {
      // 1. Year filter
      const appYear = app.year || app.responses?.year || "";
      if (selectedYear !== "all" && appYear !== selectedYear) {
        return false;
      }

      const scoreInfo = getCandidateScoreInfo(app, inlineEdits[app._id]);

      // 2. Evaluation status filter
      if (evaluationFilter === "evaluated" && !scoreInfo.isEvaluated) return false;
      if (evaluationFilter === "pending" && scoreInfo.isEvaluated) return false;

      // 3. Score status filter (Positive / Zero / Negative / Pending)
      if (scoreFilter === "positive" && scoreInfo.status !== "positive") return false;
      if (scoreFilter === "zero" && (scoreInfo.status !== "zero" || !scoreInfo.isEvaluated)) return false;
      if (scoreFilter === "negative" && scoreInfo.status !== "negative") return false;
      if (scoreFilter === "pending" && scoreInfo.isEvaluated) return false;

      // 4. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const candidateName = String(app.responses?.name || app.responses?.fullName || "").toLowerCase();
        const candidateRoll = String(app.responses?.rollno || app.responses?.rollNumber || "").toLowerCase();
        const candidateEmail = String(app.responses?.email || "").toLowerCase();
        const candidateComments = String(scoreInfo.comments).toLowerCase();

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
        const infoA = getCandidateScoreInfo(a, inlineEdits[a._id]);
        const infoB = getCandidateScoreInfo(b, inlineEdits[b._id]);
        const pA = infoA.scoreNum !== null ? infoA.scoreNum : -999999;
        const pB = infoB.scoreNum !== null ? infoB.scoreNum : -999999;
        return pB - pA;
      }
      if (sortBy === "points_asc") {
        const infoA = getCandidateScoreInfo(a, inlineEdits[a._id]);
        const infoB = getCandidateScoreInfo(b, inlineEdits[b._id]);
        const pA = infoA.scoreNum !== null ? infoA.scoreNum : 999999;
        const pB = infoB.scoreNum !== null ? infoB.scoreNum : 999999;
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
  }, [applications, selectedYear, evaluationFilter, scoreFilter, searchQuery, sortBy, inlineEdits, getCandidateScoreInfo]);

  // Overall Statistics for this Form & Department (Score-driven)
  const stats = useMemo(() => {
    const total = applications.length;
    let evaluated = 0;
    let positiveCount = 0;
    let zeroCount = 0;
    let negativeCount = 0;
    let totalScore = 0;
    let scoredCandidatesCount = 0;

    applications.forEach((app) => {
      const info = getCandidateScoreInfo(app, inlineEdits[app._id]);
      if (info.isEvaluated) evaluated++;
      if (info.status === "positive") positiveCount++;
      else if (info.status === "zero" && info.isEvaluated) zeroCount++;
      else if (info.status === "negative") negativeCount++;

      if (info.scoreNum !== null) {
        totalScore += info.scoreNum;
        scoredCandidatesCount++;
      }
    });

    const pending = total - evaluated;
    const avgScore = scoredCandidatesCount > 0 ? (totalScore / scoredCandidatesCount).toFixed(1) : "—";

    return { total, evaluated, pending, avgScore, positiveCount, zeroCount, negativeCount };
  }, [applications, inlineEdits, getCandidateScoreInfo]);

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
          positiveRemarks: edit.positiveRemarks || [],
          negativeRemarks: edit.negativeRemarks || [],
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
                positiveRemarks: edit.positiveRemarks || [],
                negativeRemarks: edit.negativeRemarks || [],
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

  // Live remarks handlers with automatic score calculation (+1 / -1)
  const handleAddPositiveRemark = (appId) => {
    if (!newPositiveInput.trim() || !appId) return;
    const text = newPositiveInput.trim();
    const currentEdit = inlineEdits[appId] || {};
    const currentApp = applications.find((a) => a._id === appId);
    const currentPos = currentEdit.positiveRemarks !== undefined
      ? currentEdit.positiveRemarks
      : (currentApp?.positiveRemarks || []);
    const currentNeg = currentEdit.negativeRemarks !== undefined
      ? currentEdit.negativeRemarks
      : (currentApp?.negativeRemarks || []);

    const nextPos = [...currentPos, text];
    const nextScore = nextPos.length - currentNeg.length;
    const scoreStr = nextScore > 0 ? `+${nextScore}` : `${nextScore}`;

    setInlineEdits((prev) => ({
      ...prev,
      [appId]: {
        ...(prev[appId] || {}),
        positiveRemarks: nextPos,
        negativeRemarks: currentNeg,
        points: scoreStr,
        isDirty: true,
        savedRecently: false,
      },
    }));
    setNewPositiveInput("");
  };

  const handleRemovePositiveRemark = (appId, index) => {
    if (!appId) return;
    const currentEdit = inlineEdits[appId] || {};
    const currentApp = applications.find((a) => a._id === appId);
    const currentPos = currentEdit.positiveRemarks !== undefined
      ? currentEdit.positiveRemarks
      : (currentApp?.positiveRemarks || []);
    const currentNeg = currentEdit.negativeRemarks !== undefined
      ? currentEdit.negativeRemarks
      : (currentApp?.negativeRemarks || []);

    const nextPos = currentPos.filter((_, i) => i !== index);
    const nextScore = nextPos.length - currentNeg.length;
    const scoreStr = nextScore > 0 ? `+${nextScore}` : `${nextScore}`;

    setInlineEdits((prev) => ({
      ...prev,
      [appId]: {
        ...(prev[appId] || {}),
        positiveRemarks: nextPos,
        negativeRemarks: currentNeg,
        points: scoreStr,
        isDirty: true,
        savedRecently: false,
      },
    }));
  };

  const handleAddNegativeRemark = (appId) => {
    if (!newNegativeInput.trim() || !appId) return;
    const text = newNegativeInput.trim();
    const currentEdit = inlineEdits[appId] || {};
    const currentApp = applications.find((a) => a._id === appId);
    const currentPos = currentEdit.positiveRemarks !== undefined
      ? currentEdit.positiveRemarks
      : (currentApp?.positiveRemarks || []);
    const currentNeg = currentEdit.negativeRemarks !== undefined
      ? currentEdit.negativeRemarks
      : (currentApp?.negativeRemarks || []);

    const nextNeg = [...currentNeg, text];
    const nextScore = currentPos.length - nextNeg.length;
    const scoreStr = nextScore > 0 ? `+${nextScore}` : `${nextScore}`;

    setInlineEdits((prev) => ({
      ...prev,
      [appId]: {
        ...(prev[appId] || {}),
        positiveRemarks: currentPos,
        negativeRemarks: nextNeg,
        points: scoreStr,
        isDirty: true,
        savedRecently: false,
      },
    }));
    setNewNegativeInput("");
  };

  const handleRemoveNegativeRemark = (appId, index) => {
    if (!appId) return;
    const currentEdit = inlineEdits[appId] || {};
    const currentApp = applications.find((a) => a._id === appId);
    const currentPos = currentEdit.positiveRemarks !== undefined
      ? currentEdit.positiveRemarks
      : (currentApp?.positiveRemarks || []);
    const currentNeg = currentEdit.negativeRemarks !== undefined
      ? currentEdit.negativeRemarks
      : (currentApp?.negativeRemarks || []);

    const nextNeg = currentNeg.filter((_, i) => i !== index);
    const nextScore = currentPos.length - nextNeg.length;
    const scoreStr = nextScore > 0 ? `+${nextScore}` : `${nextScore}`;

    setInlineEdits((prev) => ({
      ...prev,
      [appId]: {
        ...(prev[appId] || {}),
        positiveRemarks: currentPos,
        negativeRemarks: nextNeg,
        points: scoreStr,
        isDirty: true,
        savedRecently: false,
      },
    }));
  };

  // Helper to build Excel rows
  const buildExcelRows = (form, appList) => {
    const customFields = (form?.fields || []).filter(
      (f) => !["department", "year"].includes(String(f.name || "").toLowerCase())
    );

    return appList.map((app) => {
      const edit = inlineEdits[app._id] || {};
      const posRemarks = edit.positiveRemarks !== undefined ? edit.positiveRemarks : app.positiveRemarks || [];
      const negRemarks = edit.negativeRemarks !== undefined ? edit.negativeRemarks : app.negativeRemarks || [];
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
            : typeof val === "object" && val?.url
            ? val.url
            : String(val);
      });

      const scoreInfo = getCandidateScoreInfo(app, edit);

      // Evaluation columns
      row["Score Classification"] =
        scoreInfo.status === "positive"
          ? "Positive (>0)"
          : scoreInfo.status === "zero" && scoreInfo.isEvaluated
          ? "Zero (0)"
          : scoreInfo.status === "negative"
          ? "Negative (<0)"
          : "Pending";
      row["Points / Score"] = scoreInfo.isEvaluated ? scoreInfo.scoreFormatted : "";
      row["Positive Remarks (+1)"] = Array.isArray(posRemarks) ? posRemarks.join("; ") : "";
      row["Negative Remarks (-1)"] = Array.isArray(negRemarks) ? negRemarks.join("; ") : "";
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
              : typeof val === "object" && val?.url
              ? val.url
              : String(val);
        });

        const posRemarks = edit.positiveRemarks !== undefined ? edit.positiveRemarks : app.positiveRemarks || [];
        const negRemarks = edit.negativeRemarks !== undefined ? edit.negativeRemarks : app.negativeRemarks || [];
        const scoreInfo = getCandidateScoreInfo(app, edit);

        row["Score Classification"] =
          scoreInfo.status === "positive"
            ? "Positive (>0)"
            : scoreInfo.status === "zero" && scoreInfo.isEvaluated
            ? "Zero (0)"
            : scoreInfo.status === "negative"
            ? "Negative (<0)"
            : "Pending";
        row["Points / Score"] = scoreInfo.isEvaluated ? scoreInfo.scoreFormatted : "";
        row["Positive Remarks (+1)"] = Array.isArray(posRemarks) ? posRemarks.join("; ") : "";
        row["Negative Remarks (-1)"] = Array.isArray(negRemarks) ? negRemarks.join("; ") : "";
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
  const openModal = (index, forceResumeSplit = false) => {
    setModalAppIndex(index);
    if (forceResumeSplit) {
      setShowResumeSplit(true);
    }
    setNewPositiveInput("");
    setNewNegativeInput("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalAppIndex(null);
    setNewPositiveInput("");
    setNewNegativeInput("");
  };

  const nextModalApp = () => {
    if (modalAppIndex !== null && modalAppIndex < filteredApplications.length - 1) {
      setModalAppIndex(modalAppIndex + 1);
      setNewPositiveInput("");
      setNewNegativeInput("");
    }
  };

  const prevModalApp = () => {
    if (modalAppIndex !== null && modalAppIndex > 0) {
      setModalAppIndex(modalAppIndex - 1);
      setNewPositiveInput("");
      setNewNegativeInput("");
    }
  };

  const currentModalApp =
    modalAppIndex !== null && filteredApplications[modalAppIndex]
      ? filteredApplications[modalAppIndex]
      : null;

  if (status === "unauthenticated" || (status !== "loading" && session?.user?.role !== "addsec" && session?.user?.role !== "admin")) {
    return (
      <div className="relative min-h-screen text-white flex flex-col justify-center py-16 sm:py-24 lg:py-28 px-3.5 sm:px-6 lg:px-8">
        {/* Title Header */}
        <div className="relative z-10 text-center pb-6 sm:pb-8" data-aos="fade-up">
          <div className="inline-block px-3 py-1 mb-2.5 sm:mb-3 rounded-full text-[10px] sm:text-xs font-mono uppercase tracking-widest bg-white/10 text-gray-300 border border-white/20">
            Department Additional Secretaries Portal
          </div>
          <h1 className="font-mono text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-2 sm:mb-3 text-white">
            {">_"} ADDSEC_LOGIN
          </h1>
          <p className="font-mono text-gray-400 text-xs sm:text-sm lg:text-base max-w-lg mx-auto px-2">
            Sign in with your department ID to access recruitment applicant entries, scoring, and Excel reports.
          </p>
        </div>

        {/* 4 Department Badges with One-Click Autofill */}
        <div className="max-w-xl mx-auto w-full mb-6 sm:mb-8">
          <div className="text-center mb-2 sm:mb-2.5">
            <span className="font-mono text-[10px] sm:text-[11px] text-gray-400 uppercase tracking-wider">
              [ Click department to autofill ID ]
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {DEPARTMENTS.map((dept) => {
              const Icon = dept.icon;
              return (
                <button
                  type="button"
                  key={dept.name}
                  onClick={() =>
                    setLoginCreds((prev) => ({
                      ...prev,
                      username: `addsec_${dept.name.toLowerCase()}`,
                    }))
                  }
                  className={`p-2.5 sm:p-3 text-center rounded border transition-all duration-200 flex flex-col items-center justify-center space-y-1 sm:space-y-1.5 glass-panel hover:scale-[1.03] active:scale-95 cursor-pointer ${dept.border}`}
                  title={`Click to autofill ID for ${dept.name}`}
                >
                  <Icon className={`text-lg sm:text-xl ${dept.color}`} />
                  <span className="font-mono text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-gray-200">
                    {dept.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Login Form Container */}
        <div className="relative z-10 max-w-md mx-auto w-full">
          <form
            onSubmit={handleInlineLogin}
            className="glass-panel p-5 sm:p-8 space-y-5 sm:space-y-6 shadow-2xl border border-white/20 rounded-xl"
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
            <div className="glass-panel p-3.5 sm:p-4 border border-white/10 flex flex-col justify-between rounded-lg">
              <span className="font-mono text-xs text-gray-400 uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                <FaUserAstronaut className="text-gray-300" /> Total
              </span>
              <div className="font-mono text-2xl sm:text-3xl font-bold mt-1.5 text-white">
                {stats.total}
              </div>
              <span className="font-mono text-[10px] sm:text-[11px] text-gray-500 mt-1 truncate">In {departmentName}</span>
            </div>

            <div className="glass-panel p-3.5 sm:p-4 border border-emerald-500/30 bg-emerald-950/20 flex flex-col justify-between rounded-lg">
              <span className="font-mono text-xs text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                <FaStar className="text-emerald-400" /> Positive
              </span>
              <div className="font-mono text-2xl sm:text-3xl font-bold mt-1.5 text-emerald-400">
                {stats.positiveCount}
              </div>
              <span className="font-mono text-[10px] sm:text-[11px] text-emerald-500/70 mt-1">Score &gt; 0 pts</span>
            </div>

            <div className="glass-panel p-3.5 sm:p-4 border border-amber-400/40 bg-amber-950/25 flex flex-col justify-between rounded-lg shadow-[0_0_15px_rgba(251,191,36,0.1)]">
              <span className="font-mono text-xs text-amber-300 uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                <FaClock className="text-amber-400" /> Zero
              </span>
              <div className="font-mono text-2xl sm:text-3xl font-bold mt-1.5 text-amber-300">
                {stats.zeroCount}
              </div>
              <span className="font-mono text-[10px] sm:text-[11px] text-amber-400/70 mt-1">Score = 0 pts</span>
            </div>

            <div className="glass-panel p-3.5 sm:p-4 border border-rose-500/30 bg-rose-950/20 flex flex-col justify-between rounded-lg">
              <span className="font-mono text-xs text-rose-400 uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                <FaStar className="text-rose-400" /> Negative
              </span>
              <div className="font-mono text-2xl sm:text-3xl font-bold mt-1.5 text-rose-400">
                {stats.negativeCount}
              </div>
              <span className="font-mono text-[10px] sm:text-[11px] text-rose-500/70 mt-1">Score &lt; 0 pts</span>
            </div>

            <div className="glass-panel p-3.5 sm:p-4 border border-white/10 flex flex-col justify-between rounded-lg">
              <span className="font-mono text-xs text-blue-400 uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                <FaCheckCircle className="text-blue-400" /> Evaluated
              </span>
              <div className="font-mono text-2xl sm:text-3xl font-bold mt-1.5 text-blue-400">
                {stats.evaluated}
              </div>
              <span className="font-mono text-[10px] sm:text-[11px] text-gray-500 mt-1 truncate">{stats.pending} pending</span>
            </div>

            <div className="glass-panel p-3.5 sm:p-4 border border-white/10 flex flex-col justify-between rounded-lg">
              <span className="font-mono text-xs text-amber-400 uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                <FaStar className="text-amber-400" /> Avg Score
              </span>
              <div className="font-mono text-2xl sm:text-3xl font-bold mt-1.5 text-amber-400">
                {stats.avgScore}
              </div>
              <span className="font-mono text-[10px] sm:text-[11px] text-gray-500 mt-1 truncate">From scored candidates</span>
            </div>
          </div>
        )}

        {/* Filter and Search Bar */}
        {/* Filter and Search Bar - Unified Single Line */}
        {activeForm && (
          <div className="glass-panel p-2.5 sm:p-3 border border-white/15 rounded-xl">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              {/* Left Group: Shrunk Search Bar + Compact Filters + Candidate Count */}
              <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
                {/* Search Bar - Shrunk slightly */}
                <div className="relative w-44 sm:w-52 md:w-56 shrink-0">
                  <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, roll, email..."
                    className="w-full pl-8 pr-7 py-1.5 bg-black/60 border border-white/20 rounded text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  )}
                </div>

                {/* Year Filter */}
                <div className="flex items-center gap-1 shrink-0">
                  <label className="font-mono text-[11px] text-gray-400 whitespace-nowrap">Year:</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="bg-black/60 border border-white/20 rounded px-2 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-white"
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
                <div className="flex items-center gap-1 shrink-0">
                  <label className="font-mono text-[11px] text-gray-400 whitespace-nowrap">Status:</label>
                  <select
                    value={evaluationFilter}
                    onChange={(e) => setEvaluationFilter(e.target.value)}
                    className="bg-black/60 border border-white/20 rounded px-2 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-white"
                  >
                    <option value="all">All Status</option>
                    <option value="evaluated">Evaluated Only</option>
                    <option value="pending">Pending Only</option>
                  </select>
                </div>

                {/* Score Status Filter */}
                <div className="flex items-center gap-1 shrink-0">
                  <label className="font-mono text-[11px] text-gray-400 whitespace-nowrap">Score:</label>
                  <select
                    value={scoreFilter}
                    onChange={(e) => setScoreFilter(e.target.value)}
                    className="bg-black/60 border border-white/20 rounded px-2 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-white"
                  >
                    <option value="all">All Scores</option>
                    <option value="positive">🟢 Positive (&gt; 0)</option>
                    <option value="zero">🟡 Zero (0)</option>
                    <option value="negative">🔴 Negative (&lt; 0)</option>
                    <option value="pending">⚪ Pending</option>
                  </select>
                </div>

                {/* Sort By Filter */}
                <div className="flex items-center gap-1 shrink-0">
                  <label className="font-mono text-[11px] text-gray-400 whitespace-nowrap">Sort:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-black/60 border border-white/20 rounded px-2 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-white"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="points_desc">Points: High to Low</option>
                    <option value="points_asc">Points: Low to High</option>
                    <option value="name_asc">Name: A to Z</option>
                  </select>
                </div>

                {/* Showing Count + Quick Clear */}
                <div className="flex items-center gap-1.5 text-gray-400 text-[11px] font-mono shrink-0 pl-1">
                  <span>
                    Showing <strong className="text-white">{filteredApplications.length}</strong> of{" "}
                    <strong className="text-white">{applications.length}</strong>
                  </span>
                  {(searchQuery || selectedYear !== "all" || evaluationFilter !== "all" || scoreFilter !== "all" || sortBy !== "newest") && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedYear("all");
                        setEvaluationFilter("all");
                        setScoreFilter("all");
                        setSortBy("newest");
                      }}
                      className="text-blue-400 hover:underline cursor-pointer"
                      title="Clear active filters"
                    >
                      [Clear]
                    </button>
                  )}
                </div>
              </div>

              {/* Right Group: Excel Download Buttons (Always in one line side-by-side) */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={exportFilteredView}
                  disabled={!filteredApplications.length}
                  className="px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
                  title="Download the current table rows as Excel"
                >
                  <FaDownload className="text-xs" />
                  <span>[ Export Filtered ({filteredApplications.length}) ]</span>
                </button>

                <button
                  onClick={exportThisForm}
                  disabled={!applications.length}
                  className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
                  title="Download all applicants for this form"
                >
                  <FaDownload className="text-xs" />
                  <span>[ Export All ({applications.length}) ]</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Applicant Entries Container */}
        {activeForm && (
          <div className="space-y-4">
            {loadingApps ? (
              <div className="glass-panel border border-white/15 p-12 text-center rounded-xl">
                <p className="font-mono text-gray-400 text-sm animate-pulse">Loading applicant entries...</p>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="glass-panel border border-white/15 p-12 text-center space-y-2 rounded-xl">
                <p className="font-mono text-gray-300 text-base">No applicants found matching your criteria.</p>
                <p className="font-mono text-gray-500 text-xs">Try clearing filters or search keywords.</p>
              </div>
            ) : (
              <>
                {/* 1. MOBILE RESPONSIVE CARDS VIEW (block on screens < md) */}
                <div className="block md:hidden space-y-3.5">
                  {filteredApplications.map((app, index) => {
                    const edit = inlineEdits[app._id] || {};
                    const scoreInfo = getCandidateScoreInfo(app, edit);
                    const appResume = getApplicantResumeInfo(app.responses, activeForm?.fields);
                    const candidateName = app.responses?.name || app.responses?.fullName || "Applicant";
                    const candidateRoll = app.responses?.rollno || app.responses?.rollNumber || "—";
                    const candidateEmail = app.responses?.email || "—";
                    const candidateYear = app.year || app.responses?.year || "—";

                    return (
                      <div
                        key={app._id}
                        className={`glass-panel p-4 rounded-xl border transition-all ${
                          scoreInfo.status === "positive"
                            ? "border-emerald-500/70 bg-emerald-950/25 shadow-[0_0_15px_rgba(16,185,129,0.18)]"
                            : scoreInfo.status === "zero" && scoreInfo.isEvaluated
                            ? "border-amber-400/80 bg-amber-950/25 shadow-[0_0_15px_rgba(251,191,36,0.18)]"
                            : scoreInfo.status === "negative"
                            ? "border-rose-500/70 bg-rose-950/25 shadow-[0_0_15px_rgba(244,63,94,0.18)]"
                            : "border-white/15 bg-white/[0.02]"
                        }`}
                      >
                        {/* Header: Index, Name, Year Badge */}
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
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-gray-300 border border-white/20 whitespace-nowrap">
                            {candidateYear}
                          </span>
                        </div>

                        {/* Sub-info: Email & View All */}
                        <div className="py-2.5 flex items-center justify-between text-xs font-mono text-gray-400 border-b border-white/10 gap-2">
                          <div className="truncate text-[11px] text-gray-500 flex-1" title={candidateEmail}>
                            {candidateEmail}
                          </div>
                          <span className="text-[10px] text-gray-500">
                            {new Date(app.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Score & Remarks Preview Bar */}
                        <div className="py-2.5 flex items-center justify-between border-b border-white/10 gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider font-semibold">
                              Score:
                            </span>
                            {scoreInfo.isEvaluated ? (
                              <span
                                className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono ${
                                  scoreInfo.status === "positive"
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/60"
                                    : scoreInfo.status === "negative"
                                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/60"
                                    : "bg-amber-400/20 text-amber-300 border border-amber-400/60"
                                }`}
                              >
                                {scoreInfo.scoreFormatted} <span className="text-[10px] opacity-75">pts</span>
                              </span>
                            ) : (
                              <span className="text-gray-500 font-mono text-xs italic">Pending</span>
                            )}
                          </div>

                          {(scoreInfo.posCount > 0 || scoreInfo.negCount > 0) && (
                            <div className="flex items-center gap-1.5">
                              {scoreInfo.posCount > 0 && (
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                                  +{scoreInfo.posCount} Pos
                                </span>
                              )}
                              {scoreInfo.negCount > 0 && (
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-400 border border-rose-500/30">
                                  -{scoreInfo.negCount} Neg
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Remarks Snippet */}
                        {scoreInfo.comments && (
                          <div className="py-2 text-xs font-mono text-gray-300 line-clamp-2 border-b border-white/5">
                            {scoreInfo.comments}
                          </div>
                        )}

                        {/* Card Actions Footer */}
                        <div className="pt-2.5 flex items-center justify-between text-xs font-mono mt-1">
                          <div className="text-[10px] text-gray-500">
                            {app.evaluatedBy ? `Evaluated by ${app.evaluatedBy}` : "Not yet evaluated"}
                          </div>
                          <div className="flex items-center gap-1.5">
                            {appResume.hasResume && (
                              <button
                                type="button"
                                onClick={() => openModal(index, true)}
                                className="px-2.5 py-1.5 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-500/40 rounded text-xs font-mono uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer font-bold"
                                title="Open applicant resume in parallel view & grade"
                              >
                                <FaFilePdf className="text-xs" />
                                <span>Resume</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => openModal(index)}
                              className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer border border-white/20 font-bold"
                            >
                              <FaEye className="text-xs" />
                              <span>Review</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 2. DESKTOP & TABLET HIGH-DENSITY DATA TABLE (hidden on mobile, visible on md and up) */}
                <div className="hidden md:block glass-panel border border-white/15 overflow-hidden rounded-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs">
                      <thead className="bg-white/5 border-b border-white/15 text-gray-400 uppercase tracking-wider">
                        <tr>
                          <th className="py-3 px-3 w-12 text-center">#</th>
                          <th className="py-3 px-4 min-w-[200px]">Applicant Info</th>
                          <th className="py-3 px-3 min-w-[85px]">Year</th>
                          <th className="py-3 px-3 min-w-[120px]">
                            <div className="flex items-center gap-1">
                              <FaStar className="text-amber-400 text-xs" />
                              <span>Score</span>
                            </div>
                          </th>
                          <th className="py-3 px-4 min-w-[260px]">
                            <div className="flex items-center gap-1">
                              <FaRegCommentDots className="text-blue-400 text-xs" />
                              <span>Positive / Negative Points</span>
                            </div>
                          </th>
                          <th className="py-3 px-3 min-w-[110px] text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {filteredApplications.map((app, index) => {
                          const edit = inlineEdits[app._id] || {};
                          const scoreInfo = getCandidateScoreInfo(app, edit);
                          const appResume = getApplicantResumeInfo(app.responses, activeForm?.fields);
                          const candidateName = app.responses?.name || app.responses?.fullName || "Applicant";
                          const candidateRoll = app.responses?.rollno || app.responses?.rollNumber || "—";
                          const candidateEmail = app.responses?.email || "—";
                          const candidateYear = app.year || app.responses?.year || "—";

                          return (
                            <tr
                              key={app._id}
                              className={`transition-colors group ${
                                scoreInfo.status === "positive"
                                  ? "border-l-4 border-l-emerald-500 bg-emerald-950/20 hover:bg-emerald-950/30"
                                  : scoreInfo.status === "zero" && scoreInfo.isEvaluated
                                  ? "border-l-4 border-l-amber-400 bg-amber-950/20 hover:bg-amber-950/30"
                                  : scoreInfo.status === "negative"
                                  ? "border-l-4 border-l-rose-500 bg-rose-950/20 hover:bg-rose-950/30"
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
                                <div className="text-gray-500 text-[10px] mt-0.5">
                                  Submitted: {new Date(app.createdAt).toLocaleDateString()}
                                </div>
                              </td>

                              {/* Year */}
                              <td className="py-3 px-3">
                                <span className="px-2 py-0.5 rounded text-[11px] bg-white/10 text-gray-300 border border-white/20 whitespace-nowrap">
                                  {candidateYear}
                                </span>
                              </td>

                              {/* Read-only Score Badge */}
                              <td className="py-3 px-3">
                                {scoreInfo.isEvaluated ? (
                                  <span
                                    className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold font-mono ${
                                      scoreInfo.status === "positive"
                                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/60 shadow-[0_0_8px_rgba(16,185,129,0.25)]"
                                        : scoreInfo.status === "negative"
                                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/60 shadow-[0_0_8px_rgba(244,63,94,0.25)]"
                                        : "bg-amber-400/20 text-amber-300 border border-amber-400/60 shadow-[0_0_8px_rgba(251,191,36,0.25)]"
                                    }`}
                                  >
                                    <span>{scoreInfo.scoreFormatted}</span>
                                    <span className="text-[10px] opacity-75 ml-1">pts</span>
                                  </span>
                                ) : (
                                  <span className="text-gray-500 font-mono text-xs">—</span>
                                )}
                              </td>

                              {/* Read-only Remarks & Comments Preview (NO TEXTAREA) */}
                              <td className="py-3 px-4 max-w-[280px]">
                                <div className="space-y-1">
                                  {(scoreInfo.posCount > 0 || scoreInfo.negCount > 0) && (
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      {scoreInfo.posCount > 0 && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-500/40">
                                          +{scoreInfo.posCount} Pos
                                        </span>
                                      )}
                                      {scoreInfo.negCount > 0 && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-950/70 text-rose-300 border border-rose-500/40">
                                          -{scoreInfo.negCount} Neg
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  {scoreInfo.comments ? (
                                    <div className="text-xs text-gray-300 line-clamp-2 break-words font-mono" title={scoreInfo.comments}>
                                      {scoreInfo.comments}
                                    </div>
                                  ) : !scoreInfo.posCount && !scoreInfo.negCount ? (
                                    <span className="text-gray-500 text-xs italic">No remarks yet</span>
                                  ) : null}
                                  {app.evaluatedBy && (
                                    <div className="text-[10px] text-gray-500">
                                      By {app.evaluatedBy} • {app.evaluatedAt ? new Date(app.evaluatedAt).toLocaleDateString() : ""}
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* Review Actions */}
                              <td className="py-3 px-3 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  {appResume.hasResume && (
                                    <button
                                      type="button"
                                      onClick={() => openModal(index, true)}
                                      className="px-2.5 py-1.5 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-500/40 rounded text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1"
                                      title="Open resume in parallel view & grade"
                                    >
                                      <FaFilePdf className="text-[11px]" />
                                      <span>Resume</span>
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => openModal(index)}
                                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/25 rounded text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
                                    title="Open candidate detailed review modal to edit remarks and score"
                                  >
                                    Review
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
        )}
          </>
        )}
      </div>

      {/* Detailed Candidate Review Modal */}
      {modalOpen && currentModalApp && mounted && typeof document !== "undefined" && createPortal(
        (() => {
          const resumeInfo = getApplicantResumeInfo(currentModalApp.responses, activeForm?.fields);
          const hasResume = resumeInfo.hasResume;
          const isSplit = hasResume && showResumeSplit;

          return (
            <div className={`fixed inset-0 z-[99999] flex ${isSplit ? "items-center justify-center p-2 sm:p-4" : "items-start justify-center pt-24 sm:pt-28 pb-8 px-2.5 sm:px-4 md:px-6 overflow-y-auto"} bg-black/90 backdrop-blur-md`}>
              <div className={`glass-panel w-full ${isSplit ? "max-w-[96vw] xl:max-w-7xl h-[92vh] max-h-[92vh]" : "max-w-3xl max-h-[calc(100vh-7.5rem)] sm:max-h-[calc(100vh-8.5rem)] overflow-y-auto"} border border-white/25 shadow-2xl flex flex-col rounded-xl my-auto transition-all duration-300`}>
              {/* Modal Header */}
              <div className="p-3.5 sm:p-5 border-b border-white/15 flex items-center justify-between sticky top-0 bg-black/95 backdrop-blur z-20 gap-2">
                <div className="min-w-0 flex-1 pr-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 block truncate">
                    Applicant Review ({modalAppIndex + 1} of {filteredApplications.length})
                  </span>
                  <h2 className="font-mono text-base sm:text-xl md:text-2xl font-bold text-white mt-0.5 truncate" title={currentModalApp.responses?.name || currentModalApp.responses?.fullName || "Candidate Profile"}>
                    {currentModalApp.responses?.name || currentModalApp.responses?.fullName || "Candidate Profile"}
                  </h2>
                </div>

                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  {hasResume && (
                    <button
                      type="button"
                      onClick={() => setShowResumeSplit(!showResumeSplit)}
                      className={`px-2.5 py-1.5 rounded font-mono text-xs flex items-center gap-1.5 border transition-all cursor-pointer ${
                        showResumeSplit
                          ? "border-emerald-500/60 bg-emerald-500/20 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                          : "border-white/20 bg-white/5 text-gray-300 hover:text-white"
                      }`}
                      title="Toggle parallel split view for resume and evaluation"
                    >
                      <FaColumns className="text-xs" />
                      <span className="hidden sm:inline">
                        {showResumeSplit ? "Parallel View [ON]" : "Open Split View"}
                      </span>
                      <span className="sm:hidden">Split</span>
                    </button>
                  )}

                  {hasResume && (
                    <a
                      href={resumeInfo.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 glass-panel border border-white/20 text-gray-300 hover:text-white rounded transition-colors"
                      title="Open resume in full window"
                    >
                      <FaExternalLinkAlt className="text-xs" />
                    </a>
                  )}

                  <button
                    onClick={prevModalApp}
                    disabled={modalAppIndex === 0}
                    className="p-2 sm:p-2.5 glass-panel border border-white/20 text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded"
                    title="Previous Applicant"
                  >
                    <FaChevronLeft className="text-xs" />
                  </button>
                  <button
                    onClick={nextModalApp}
                    disabled={modalAppIndex === filteredApplications.length - 1}
                    className="p-2 sm:p-2.5 glass-panel border border-white/20 text-gray-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded"
                    title="Next Applicant"
                  >
                    <FaChevronRight className="text-xs" />
                  </button>
                  <button
                    onClick={closeModal}
                    className="p-2 sm:p-2.5 text-gray-400 hover:text-white rounded ml-1"
                    title="Close Modal"
                  >
                    <FaTimes className="text-sm" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className={`p-3.5 sm:p-5 ${isSplit ? "flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden" : "space-y-4 sm:space-y-6"}`}>
                {/* Left Column: Embedded in-website PDF Viewer */}
                {isSplit && (
                  <div className="flex flex-col h-full rounded-xl border border-white/15 bg-black/80 overflow-hidden shadow-2xl min-h-[420px] lg:min-h-0">
                    <div className="p-2.5 sm:p-3 border-b border-white/10 bg-white/[0.04] flex items-center justify-between font-mono text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <FaFilePdf className="text-rose-400 text-base flex-shrink-0" />
                        <span className="text-white font-bold truncate max-w-[200px] sm:max-w-xs" title={resumeInfo.filename}>
                          {resumeInfo.filename || "Candidate Resume.pdf"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] text-emerald-300 px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 uppercase font-semibold">
                          Live Document
                        </span>
                        <a
                          href={resumeInfo.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-gray-300 hover:text-white text-xs p-1 rounded hover:bg-white/10 transition-colors"
                          title="Open PDF in new window"
                        >
                          <FaExternalLinkAlt />
                        </a>
                      </div>
                    </div>
                    <div className="flex-1 relative bg-neutral-950 overflow-hidden">
                      <iframe
                        src={resumeInfo.url}
                        className="w-full h-full border-none bg-neutral-900"
                        title="Candidate Resume"
                      />
                    </div>
                  </div>
                )}

                {/* Right Column: Candidate Responses & Simultaneous Grading */}
                <div className={`${isSplit ? "h-full overflow-y-auto pr-1 sm:pr-2 space-y-4 sm:space-y-6" : "space-y-4 sm:space-y-6"}`}>
                  {hasResume && !isSplit && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 p-3 rounded-lg border border-rose-500/35 bg-rose-950/20 font-mono text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <FaFilePdf className="text-rose-400 text-base flex-shrink-0" />
                        <span className="text-white font-semibold truncate">
                          Candidate Resume: <strong className="text-gray-200">{resumeInfo.filename}</strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowResumeSplit(true)}
                        className="px-3 py-1.5 rounded bg-rose-500 hover:bg-rose-400 text-white font-bold font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap self-end sm:self-auto"
                      >
                        <FaColumns className="text-xs" />
                        <span>[ Open Parallel Split View ]</span>
                      </button>
                    </div>
                  )}
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
                  Form Question Responses
                </h3>
                <div className="space-y-2.5 sm:space-y-3">
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

                const currentPos =
                  modalEdit.positiveRemarks !== undefined
                    ? modalEdit.positiveRemarks
                    : Array.isArray(currentModalApp.positiveRemarks)
                    ? currentModalApp.positiveRemarks
                    : [];
                const currentNeg =
                  modalEdit.negativeRemarks !== undefined
                    ? modalEdit.negativeRemarks
                    : Array.isArray(currentModalApp.negativeRemarks)
                    ? currentModalApp.negativeRemarks
                    : [];

                const autoScore = currentPos.length - currentNeg.length;
                const autoScoreFormatted = autoScore > 0 ? `+${autoScore}` : `${autoScore}`;
                const displayScore =
                  modalEdit.points !== undefined && modalEdit.points !== ""
                    ? modalEdit.points
                    : currentPos.length > 0 || currentNeg.length > 0
                    ? autoScoreFormatted
                    : currentModalApp.points ?? "";

                return (
                  <div
                    className={`p-3.5 sm:p-5 rounded-xl transition-all duration-300 space-y-4 ${
                      autoScore > 0
                        ? "bg-emerald-950/25 border-2 border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.35)]"
                        : autoScore < 0
                        ? "bg-rose-950/25 border-2 border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.35)]"
                        : "bg-amber-950/25 border-2 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.35)]"
                    }`}
                  >
                    {/* Header & Score Status */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3
                          className={`font-mono text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 ${
                            autoScore > 0
                              ? "text-emerald-300"
                              : autoScore < 0
                              ? "text-rose-300"
                              : "text-amber-300"
                          }`}
                        >
                          <FaStar /> Evaluation &amp; Scoring
                        </h3>

                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border flex items-center gap-1 ${
                            autoScore > 0
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500"
                              : autoScore < 0
                              ? "bg-rose-500/20 text-rose-300 border-rose-500"
                              : "bg-amber-400/20 text-amber-300 border-amber-400"
                          }`}
                        >
                          {autoScore > 0 ? "● Positive Score" : autoScore < 0 ? "● Negative Score" : "● Zero Score"}
                        </span>
                      </div>

                      <span className="font-mono text-[11px] text-gray-400">
                        Score auto-updates with positive (+1) &amp; negative (-1) remarks
                      </span>
                    </div>

                    {/* Live Scorecard Bar */}
                    <div className="glass-panel p-3.5 rounded-lg border border-white/15 bg-black/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs text-gray-400 uppercase tracking-wider font-semibold">
                            Live Score:
                          </span>
                          <div
                            className={`px-3 py-1 rounded font-mono text-base font-extrabold tracking-wider border flex items-center gap-1.5 ${
                              autoScore > 0
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                                : autoScore < 0
                                ? "bg-rose-500/20 text-rose-300 border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.3)]"
                                : "bg-amber-400/20 text-amber-300 border-amber-400"
                            }`}
                          >
                            <span>{autoScoreFormatted}</span>
                            <span className="text-[10px] uppercase font-normal opacity-75">pts</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-mono">
                          <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/40">
                            +{currentPos.length} pos ({currentPos.length * 1} pts)
                          </span>
                          <span className="text-gray-500">-</span>
                          <span className="px-2 py-0.5 rounded bg-rose-950/60 text-rose-400 border border-rose-500/40">
                            -{currentNeg.length} neg (-{currentNeg.length * 1} pts)
                          </span>
                        </div>
                      </div>

                      {/* Override / Manual Score Field */}
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <label className="text-[11px] font-mono text-gray-400 whitespace-nowrap uppercase">
                          Score Field:
                        </label>
                        <input
                          type="text"
                          value={displayScore}
                          onChange={(e) => handleInlineChange(currentModalApp._id, "points", e.target.value)}
                          placeholder="e.g. +2"
                          className="w-24 px-2.5 py-1 bg-black/80 rounded text-sm font-mono font-bold text-center text-white border border-white/20 focus:outline-none focus:border-amber-400"
                          title="Auto-calculated from remarks. You may also edit manually if needed."
                        />
                      </div>
                    </div>

                    {/* Side-by-Side Remarks Containers: Positive (+1) and Negative (-1) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {/* POSITIVE REMARKS COLUMN */}
                      <div className="rounded-xl border border-emerald-500/35 bg-emerald-950/15 p-3.5 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20 mb-3">
                            <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                              <FaThumbsUp className="text-[11px]" /> Positive Remarks
                            </span>
                            <span className="px-2 py-0.5 rounded font-mono text-[10px] font-extrabold bg-emerald-500 text-black">
                              +1 pt each
                            </span>
                          </div>

                          {/* Positive Input Bar */}
                          <div className="flex gap-1.5 mb-3">
                            <input
                              type="text"
                              value={newPositiveInput}
                              onChange={(e) => setNewPositiveInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddPositiveRemark(currentModalApp._id);
                                }
                              }}
                              placeholder="Add positive point & press Enter..."
                              className="flex-1 px-3 py-1.5 bg-black/75 rounded text-xs font-mono text-white placeholder-emerald-400/40 border border-emerald-500/40 focus:outline-none focus:border-emerald-300"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddPositiveRemark(currentModalApp._id)}
                              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-mono text-xs rounded transition-all flex items-center gap-1 cursor-pointer flex-shrink-0"
                            >
                              <FaPlus className="text-[10px]" />
                              <span>+1</span>
                            </button>
                          </div>

                          {/* List of Positive Remarks */}
                          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                            {currentPos.length === 0 ? (
                              <div className="p-3 rounded border border-dashed border-emerald-500/20 text-center font-mono text-[11px] text-emerald-400/60">
                                No positive remarks yet. Type above to add (+1 pt each).
                              </div>
                            ) : (
                              currentPos.map((remark, idx) => (
                                <div
                                  key={idx}
                                  className="p-2 rounded bg-black/60 border border-emerald-500/30 flex items-start justify-between gap-2 group transition-colors hover:border-emerald-400"
                                >
                                  <div className="flex items-start gap-2">
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 flex-shrink-0">
                                      +1
                                    </span>
                                    <span className="text-xs font-mono text-emerald-100 break-words">
                                      {remark}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemovePositiveRemark(currentModalApp._id, idx)}
                                    className="text-gray-500 hover:text-rose-400 p-1 transition-colors flex-shrink-0 cursor-pointer"
                                    title="Remove remark (-1 pt)"
                                  >
                                    <FaTrash className="text-[10px]" />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        <div className="pt-2 text-right">
                          <span className="font-mono text-[10px] text-emerald-400/70">
                            Total positive: +{currentPos.length} pts
                          </span>
                        </div>
                      </div>

                      {/* NEGATIVE REMARKS COLUMN */}
                      <div className="rounded-xl border border-rose-500/35 bg-rose-950/15 p-3.5 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between pb-2 border-b border-rose-500/20 mb-3">
                            <span className="font-mono text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                              <FaThumbsDown className="text-[11px]" /> Negative Remarks
                            </span>
                            <span className="px-2 py-0.5 rounded font-mono text-[10px] font-extrabold bg-rose-500 text-white">
                              -1 pt each
                            </span>
                          </div>

                          {/* Negative Input Bar */}
                          <div className="flex gap-1.5 mb-3">
                            <input
                              type="text"
                              value={newNegativeInput}
                              onChange={(e) => setNewNegativeInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddNegativeRemark(currentModalApp._id);
                                }
                              }}
                              placeholder="Add negative point & press Enter..."
                              className="flex-1 px-3 py-1.5 bg-black/75 rounded text-xs font-mono text-white placeholder-rose-400/40 border border-rose-500/40 focus:outline-none focus:border-rose-300"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddNegativeRemark(currentModalApp._id)}
                              className="px-3 py-1.5 bg-rose-500 hover:bg-rose-400 text-white font-bold font-mono text-xs rounded transition-all flex items-center gap-1 cursor-pointer flex-shrink-0"
                            >
                              <FaPlus className="text-[10px]" />
                              <span>-1</span>
                            </button>
                          </div>

                          {/* List of Negative Remarks */}
                          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                            {currentNeg.length === 0 ? (
                              <div className="p-3 rounded border border-dashed border-rose-500/20 text-center font-mono text-[11px] text-rose-400/60">
                                No negative remarks yet. Type above to add (-1 pt each).
                              </div>
                            ) : (
                              currentNeg.map((remark, idx) => (
                                <div
                                  key={idx}
                                  className="p-2 rounded bg-black/60 border border-rose-500/30 flex items-start justify-between gap-2 group transition-colors hover:border-rose-400"
                                >
                                  <div className="flex items-start gap-2">
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/50 flex-shrink-0">
                                      -1
                                    </span>
                                    <span className="text-xs font-mono text-rose-100 break-words">
                                      {remark}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveNegativeRemark(currentModalApp._id, idx)}
                                    className="text-gray-500 hover:text-rose-400 p-1 transition-colors flex-shrink-0 cursor-pointer"
                                    title="Remove deduction (+1 pt back)"
                                  >
                                    <FaTrash className="text-[10px]" />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        <div className="pt-2 text-right">
                          <span className="font-mono text-[10px] text-rose-400/70">
                            Total deduction: -{currentNeg.length} pts
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Optional Overall Comments / Notes */}
                    <div>
                      <label className="block text-xs font-mono text-gray-300 mb-1 uppercase tracking-wider">
                        Additional Overall Notes / Summary (Optional)
                      </label>
                      <textarea
                        rows={2}
                        value={modalEdit.comments ?? currentModalApp.comments ?? ""}
                        onChange={(e) => handleInlineChange(currentModalApp._id, "comments", e.target.value)}
                        placeholder="General impressions, round feedback, interview notes..."
                        className="w-full px-3 py-2 bg-black/70 rounded text-xs font-mono text-white focus:outline-none transition-colors border border-white/20 focus:border-blue-400 resize-none"
                      />
                    </div>

                    {/* Save Button & Last Evaluated Metadata */}
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
                        onClick={() =>
                          saveEvaluation(currentModalApp._id, {
                            feedback: autoScore > 0 ? "positive" : autoScore < 0 ? "negative" : "waitlist",
                            points: displayScore,
                          })
                        }
                        disabled={modalEdit.isSaving}
                        className={`w-full sm:w-auto px-6 py-2.5 font-bold rounded font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-lg cursor-pointer ${
                          autoScore > 0
                            ? "bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                            : autoScore < 0
                            ? "bg-rose-500 text-white hover:bg-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                            : "bg-amber-400 text-black hover:bg-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.4)]"
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
              </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 border-t border-white/10 bg-black/80 flex items-center justify-between font-mono text-xs">
              <span className="text-gray-500 text-[11px] sm:text-xs truncate pr-2">
                Use arrows above to cycle through candidates.
              </span>
              <button
                onClick={closeModal}
                className="px-4 py-1.5 glass-panel border border-white/20 text-gray-300 hover:text-white rounded flex-shrink-0"
              >
                Close
              </button>
            </div>
          </div>
        </div>
        );
      })(),
      document.body
    )}
    </div>
  );
}
