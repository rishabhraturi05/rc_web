"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  FaArrowLeft,
  FaSearch,
  FaPlus,
  FaTrash,
  FaEdit,
  FaSave,
  FaThumbsUp,
  FaThumbsDown,
  FaDownload,
  FaTimes,
  FaCode,
  FaMicrochip,
  FaCogs,
  FaBullhorn,
  FaNetworkWired,
  FaUserTie,
  FaGraduationCap,
  FaUsers,
  FaEnvelope,
  FaPhoneAlt,
  FaIdCard,
  FaCheck,
  FaLinkedin,
  FaInstagram,
} from "react-icons/fa";
import * as XLSX from "xlsx";

const SECTIONS = [
  { id: "software", label: "Software", icon: FaCode },
  { id: "embedded", label: "Embedded", icon: FaMicrochip },
  { id: "mechanical", label: "Mechanical", icon: FaCogs },
  { id: "pr", label: "Public Relations", icon: FaBullhorn },
  { id: "core", label: "Core Command", icon: FaNetworkWired },
  { id: "professor", label: "Professors", icon: FaUserTie },
  { id: "alumni", label: "Alumni", icon: FaGraduationCap },
  { id: "all", label: "All Members", icon: FaUsers },
];

export function getMemberSections(m) {
  if (!m) return ["software"];
  const sections = new Set();

  const isAlumni = Boolean(m.isAlumni || m.alumni);
  const isProf = Boolean(m.isProf || m.professor);
  const category = String(m.category || "").trim().toLowerCase();
  const dept = String(m.department || m.dept || "").trim().toLowerCase();
  const role = String(m.role || "").trim().toLowerCase();
  const name = String(m.name || "").trim().toLowerCase();

  // 1. Alumni Section
  if (
    isAlumni ||
    category === "alumni" ||
    category === "alumini" ||
    dept === "alumni" ||
    dept === "alumini" ||
    role.includes("alumn")
  ) {
    sections.add("alumni");
    return Array.from(sections);
  }

  // 2. Professor / Faculty Section
  if (
    isProf ||
    category === "professor" ||
    category === "prof" ||
    category === "facad" ||
    dept === "professor" ||
    dept === "prof" ||
    dept === "facad" ||
    role.includes("prof") ||
    role.includes("faculty") ||
    name.startsWith("prof")
  ) {
    sections.add("professor");
    return Array.from(sections);
  }

  // 3. Core Command (Secretaries, Addl Secretaries, isCore)
  const isCore = Boolean(
    m.isCore ||
    m.isAddlSec ||
    m.isGenSec ||
    category === "core" ||
    category === "secretaries" ||
    category === "addlsecretaries" ||
    dept === "core command" ||
    dept === "core" ||
    role.includes("secretary") ||
    name.includes("rishabh raturi") ||
    name.includes("soumilya dwivedi") ||
    name.includes("dinesh pichaappan") ||
    name.includes("shravya rangu") ||
    name.includes("aryan roy") ||
    name.includes("mani kumar")
  );

  if (isCore) {
    sections.add("core");
  }

  // 4. Technical Department (Members can belong to Core Command AND a technical department)
  if (name.includes("dhanvanth")) {
    sections.add("software");
  } else if (name.includes("dinesh pichaappan") || name.includes("shravya rangu")) {
    sections.add("embedded");
  } else if (name.includes("soumilya dwivedi") || name.includes("mani kumar")) {
    sections.add("mechanical");
  } else if (name.includes("rishabh raturi") || name.includes("aryan roy")) {
    sections.add("software");
  } else if (dept === "embedded" || dept.includes("embed") || category === "embedded") {
    sections.add("embedded");
  } else if (dept === "mechanical" || dept.includes("mech") || category === "mechanical") {
    sections.add("mechanical");
  } else if (dept === "pr" || dept === "public relations" || dept.includes("public") || category === "pr") {
    sections.add("pr");
  } else if (dept === "software" || dept.includes("soft") || category === "software") {
    sections.add("software");
  } else if (!isCore) {
    sections.add("software");
  }

  if (sections.size === 0) {
    sections.add("software");
  }

  return Array.from(sections);
}

export function memberBelongsToSection(m, sectionId) {
  if (sectionId === "all") return true;
  const sects = getMemberSections(m);
  return sects.includes(sectionId);
}

export function getMemberSection(m) {
  const sects = getMemberSections(m);
  return sects[0] || "software";
}

export default function ManageMembersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("software");
  const [searchQuery, setSearchQuery] = useState("");

  // Scoring inline edits state keyed by member._id
  const [memberEdits, setMemberEdits] = useState({});
  const [newPositiveInputs, setNewPositiveInputs] = useState({});
  const [newNegativeInputs, setNewNegativeInputs] = useState({});

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [newMemberForm, setNewMemberForm] = useState({
    name: "",
    section: "software",
    role: "Member",
    isCore: false,
    isAddlSec: false,
    year: "",
    rollNumber: "",
    email: "",
    phone: "",
    img: "",
    linkedin: "",
    instagram: "",
    bio: "",
  });

  const [editingMember, setEditingMember] = useState(null);
  const [updatingMember, setUpdatingMember] = useState(false);

  const [deletingMember, setDeletingMember] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Auth protection
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated" || session?.user?.role !== "admin") {
      router.push("/admin/login");
    }
  }, [status, session, router]);

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      router.push("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      alert("Logout failed. Please try again.");
    }
  };

  // Fetch all members from DB
  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/members", { cache: "no-store" });
      const data = await res.json();

      if (data.success) {
        const raw = Array.isArray(data.data) ? data.data : [];
        const seen = new Set();
        const unique = [];
        for (const m of raw) {
          const key = (m.name || "").trim().toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            unique.push(m);
          }
        }
        setMembers(unique);
      } else {
        alert(data.message || "Failed to load members from database");
      }
    } catch (err) {
      console.error("Fetch members error:", err);
      alert("Network error while loading members.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      fetchMembers();
    }
  }, [status, session, fetchMembers]);

  // Compute section counts
  const sectionCounts = useMemo(() => {
    const counts = {
      all: members.length,
      software: 0,
      embedded: 0,
      mechanical: 0,
      pr: 0,
      core: 0,
      professor: 0,
      alumni: 0,
    };

    members.forEach((m) => {
      const sects = getMemberSections(m);
      sects.forEach((sec) => {
        if (counts[sec] !== undefined) {
          counts[sec]++;
        }
      });
    });

    return counts;
  }, [members]);

  // Scoring helper
  const getScoreInfo = useCallback(
    (member) => {
      const edit = memberEdits[member._id] || {};
      const posRemarks =
        edit.positiveRemarks !== undefined
          ? edit.positiveRemarks
          : Array.isArray(member.positiveRemarks)
          ? member.positiveRemarks
          : [];
      const negRemarks =
        edit.negativeRemarks !== undefined
          ? edit.negativeRemarks
          : Array.isArray(member.negativeRemarks)
          ? member.negativeRemarks
          : [];

      const currentPoints = edit.points !== undefined ? edit.points : member.points;
      const hasPoints =
        currentPoints !== undefined &&
        currentPoints !== null &&
        String(currentPoints).trim() !== "";

      const currentComments = edit.comments !== undefined ? edit.comments : member.comments;
      const hasComments = Boolean(currentComments && String(currentComments).trim() !== "");
      const hasRemarks = posRemarks.length > 0 || negRemarks.length > 0;

      let scoreNum = null;
      let scoreFormatted = "—";
      let isEvaluated = false;

      if (hasRemarks) {
        scoreNum = posRemarks.length - negRemarks.length;
        scoreFormatted = scoreNum > 0 ? `+${scoreNum}` : `${scoreNum}`;
        isEvaluated = true;
      } else if (hasPoints) {
        const parsed = parseFloat(currentPoints);
        if (!isNaN(parsed)) {
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
        status,
        posCount: posRemarks.length,
        negCount: negRemarks.length,
        posRemarks,
        negRemarks,
        points: currentPoints || "",
        comments: currentComments || "",
        feedback: edit.feedback !== undefined ? edit.feedback : member.feedback || "",
        isDirty: Boolean(edit.isDirty),
        isSaving: Boolean(edit.isSaving),
        savedRecently: Boolean(edit.savedRecently),
      };
    },
    [memberEdits]
  );

  // Filtered members for currently active tab & search
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      // 1. Tab section filter (dual membership aware)
      if (activeTab !== "all") {
        if (!memberBelongsToSection(m, activeTab)) return false;
      }

      // 2. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const name = String(m.name || "").toLowerCase();
        const email = String(m.email || "").toLowerCase();
        const roll = String(m.rollNumber || "").toLowerCase();
        const role = String(m.role || "").toLowerCase();
        const dept = String(m.department || "").toLowerCase();
        const comments = String(m.comments || "").toLowerCase();

        return (
          name.includes(q) ||
          email.includes(q) ||
          roll.includes(q) ||
          role.includes(q) ||
          dept.includes(q) ||
          comments.includes(q)
        );
      }

      return true;
    });
  }, [members, activeTab, searchQuery]);

  // Remarks & Scoring Handlers
  const handleAddPositiveRemark = (memberId) => {
    const text = (newPositiveInputs[memberId] || "").trim();
    if (!text) return;

    const currentMember = members.find((m) => m._id === memberId);
    const scoreInfo = getScoreInfo(currentMember);
    const nextPos = [...scoreInfo.posRemarks, text];
    const nextScore = nextPos.length - scoreInfo.negRemarks.length;
    const scoreStr = nextScore > 0 ? `+${nextScore}` : `${nextScore}`;

    setMemberEdits((prev) => ({
      ...prev,
      [memberId]: {
        ...(prev[memberId] || {}),
        positiveRemarks: nextPos,
        negativeRemarks: scoreInfo.negRemarks,
        points: scoreStr,
        isDirty: true,
        savedRecently: false,
      },
    }));

    setNewPositiveInputs((prev) => ({ ...prev, [memberId]: "" }));
  };

  const handleRemovePositiveRemark = (memberId, index) => {
    const currentMember = members.find((m) => m._id === memberId);
    const scoreInfo = getScoreInfo(currentMember);
    const nextPos = scoreInfo.posRemarks.filter((_, i) => i !== index);
    const nextScore = nextPos.length - scoreInfo.negRemarks.length;
    const scoreStr = nextScore > 0 ? `+${nextScore}` : `${nextScore}`;

    setMemberEdits((prev) => ({
      ...prev,
      [memberId]: {
        ...(prev[memberId] || {}),
        positiveRemarks: nextPos,
        negativeRemarks: scoreInfo.negRemarks,
        points: scoreStr,
        isDirty: true,
        savedRecently: false,
      },
    }));
  };

  const handleAddNegativeRemark = (memberId) => {
    const text = (newNegativeInputs[memberId] || "").trim();
    if (!text) return;

    const currentMember = members.find((m) => m._id === memberId);
    const scoreInfo = getScoreInfo(currentMember);
    const nextNeg = [...scoreInfo.negRemarks, text];
    const nextScore = scoreInfo.posRemarks.length - nextNeg.length;
    const scoreStr = nextScore > 0 ? `+${nextScore}` : `${nextScore}`;

    setMemberEdits((prev) => ({
      ...prev,
      [memberId]: {
        ...(prev[memberId] || {}),
        positiveRemarks: scoreInfo.posRemarks,
        negativeRemarks: nextNeg,
        points: scoreStr,
        isDirty: true,
        savedRecently: false,
      },
    }));

    setNewNegativeInputs((prev) => ({ ...prev, [memberId]: "" }));
  };

  const handleRemoveNegativeRemark = (memberId, index) => {
    const currentMember = members.find((m) => m._id === memberId);
    const scoreInfo = getScoreInfo(currentMember);
    const nextNeg = scoreInfo.negRemarks.filter((_, i) => i !== index);
    const nextScore = scoreInfo.posRemarks.length - nextNeg.length;
    const scoreStr = nextScore > 0 ? `+${nextScore}` : `${nextScore}`;

    setMemberEdits((prev) => ({
      ...prev,
      [memberId]: {
        ...(prev[memberId] || {}),
        positiveRemarks: scoreInfo.posRemarks,
        negativeRemarks: nextNeg,
        points: scoreStr,
        isDirty: true,
        savedRecently: false,
      },
    }));
  };

  const handlePointsChange = (memberId, val) => {
    setMemberEdits((prev) => ({
      ...prev,
      [memberId]: {
        ...(prev[memberId] || {}),
        points: val,
        isDirty: true,
        savedRecently: false,
      },
    }));
  };

  const handleCommentsChange = (memberId, val) => {
    setMemberEdits((prev) => ({
      ...prev,
      [memberId]: {
        ...(prev[memberId] || {}),
        comments: val,
        isDirty: true,
        savedRecently: false,
      },
    }));
  };

  const handleFeedbackChange = (memberId, val) => {
    setMemberEdits((prev) => ({
      ...prev,
      [memberId]: {
        ...(prev[memberId] || {}),
        feedback: val,
        isDirty: true,
        savedRecently: false,
      },
    }));
  };

  // Save Evaluation
  const saveMemberEvaluation = async (memberId) => {
    const currentMember = members.find((m) => m._id === memberId);
    if (!currentMember) return;

    const scoreInfo = getScoreInfo(currentMember);

    setMemberEdits((prev) => ({
      ...prev,
      [memberId]: { ...(prev[memberId] || {}), isSaving: true },
    }));

    try {
      const res = await fetch(`/api/admin/members/${memberId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          points: scoreInfo.points,
          comments: scoreInfo.comments,
          positiveRemarks: scoreInfo.posRemarks,
          negativeRemarks: scoreInfo.negRemarks,
          feedback: scoreInfo.feedback,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to save score");
        setMemberEdits((prev) => ({
          ...prev,
          [memberId]: { ...(prev[memberId] || {}), isSaving: false },
        }));
        return;
      }

      setMembers((prev) =>
        prev.map((m) =>
          m._id === memberId
            ? {
                ...m,
                points: scoreInfo.points,
                comments: scoreInfo.comments,
                positiveRemarks: scoreInfo.posRemarks,
                negativeRemarks: scoreInfo.negRemarks,
                feedback: scoreInfo.feedback,
                evaluatedBy: data.data?.evaluatedBy,
                evaluatedAt: data.data?.evaluatedAt,
              }
            : m
        )
      );

      setMemberEdits((prev) => ({
        ...prev,
        [memberId]: {
          ...(prev[memberId] || {}),
          isDirty: false,
          isSaving: false,
          savedRecently: true,
        },
      }));
    } catch (err) {
      console.error("Save score error:", err);
      alert("Network error while saving score.");
      setMemberEdits((prev) => ({
        ...prev,
        [memberId]: { ...(prev[memberId] || {}), isSaving: false },
      }));
    }
  };

  // Add Member
  const handleAddMemberSubmit = async (e) => {
    e.preventDefault();
    if (!newMemberForm.name.trim()) {
      alert("Name is required");
      return;
    }

    const sec = newMemberForm.section;
    const isAlumni = sec === "alumni";
    const isProf = sec === "professor";

    let dept = "Software";
    let category = "member";

    if (isAlumni) {
      dept = "Alumni";
      category = "alumni";
    } else if (isProf) {
      dept = "Professor";
      category = "professor";
    } else if (sec === "core") {
      dept = "Core Command";
      category = "core";
    } else if (sec === "embedded") {
      dept = "Embedded";
    } else if (sec === "mechanical") {
      dept = "Mechanical";
    } else if (sec === "pr") {
      dept = "PR";
    }

    const isCoreRole = Boolean(
      newMemberForm.isCore ||
      newMemberForm.isAddlSec ||
      sec === "core" ||
      dept === "Core Command" ||
      (newMemberForm.role || "").toLowerCase().includes("secretary")
    );

    const isAddlSec = Boolean(
      newMemberForm.isAddlSec ||
      (newMemberForm.role || "").toLowerCase().includes("additional secretary")
    );

    try {
      setAddingMember(true);
      const res = await fetch("/api/admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newMemberForm.name.trim(),
          department: dept,
          category: isAlumni ? "alumni" : isProf ? "professor" : isCoreRole ? "core" : category,
          isAlumni,
          isProf,
          isCore: isCoreRole,
          isAddlSec,
          role:
            newMemberForm.role.trim() ||
            (isProf ? "Faculty Advisor" : isAlumni ? "Alumnus" : isAddlSec ? "Additional Secretary" : "Member"),
          year: newMemberForm.year.trim(),
          rollNumber: newMemberForm.rollNumber.trim(),
          email: newMemberForm.email.trim(),
          phone: newMemberForm.phone.trim(),
          img: newMemberForm.img?.trim() || "",
          linkedin: newMemberForm.linkedin.trim(),
          instagram: newMemberForm.instagram.trim(),
        }),
      });

      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to add member");
        return;
      }

      setMembers((prev) => {
        const filtered = prev.filter(
          (m) => (m.name || "").trim().toLowerCase() !== (data.data.name || "").trim().toLowerCase()
        );
        return [data.data, ...filtered];
      });
      setIsAddModalOpen(false);
      setNewMemberForm({
        name: "",
        section: "software",
        role: "Member",
        isCore: false,
        isAddlSec: false,
        year: "",
        rollNumber: "",
        email: "",
        phone: "",
        img: "",
        linkedin: "",
        instagram: "",
        bio: "",
      });
      alert(`Member "${data.data.name}" added successfully.`);
    } catch (err) {
      console.error("Add member error:", err);
      alert("Network error while adding member.");
    } finally {
      setAddingMember(false);
    }
  };

  // Delete Member
  const handleDeleteMember = async () => {
    if (!deletingMember) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/admin/members/${deletingMember._id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to delete member");
        return;
      }

      setMembers((prev) => prev.filter((m) => m._id !== deletingMember._id));
      setDeletingMember(null);
    } catch (err) {
      console.error("Delete member error:", err);
      alert("Network error while deleting member.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Update Member Details
  const handleUpdateDetailsSubmit = async (e) => {
    e.preventDefault();
    if (!editingMember || !editingMember.name?.trim()) {
      alert("Name is required");
      return;
    }

    try {
      setUpdatingMember(true);
      const deptStr = (editingMember.department || "Software").trim();
      const isAlumni =
        editingMember.isAlumni === true ||
        deptStr.toLowerCase() === "alumni" ||
        deptStr.toLowerCase() === "alumini" ||
        (editingMember.role || "").toLowerCase().includes("alumn");
      const isProf =
        editingMember.isProf === true ||
        deptStr.toLowerCase() === "professor" ||
        deptStr.toLowerCase() === "prof" ||
        (editingMember.role || "").toLowerCase().includes("prof") ||
        (editingMember.name || "").toLowerCase().startsWith("prof");

      const isCoreRole = Boolean(
        editingMember.isCore ||
        editingMember.isAddlSec ||
        deptStr.toLowerCase() === "core command" ||
        deptStr.toLowerCase() === "core" ||
        (editingMember.role || "").toLowerCase().includes("secretary")
      );
      const isAddlSec = Boolean(
        editingMember.isAddlSec ||
        (editingMember.role || "").toLowerCase().includes("additional secretary")
      );

      let category = editingMember.category || "member";
      if (isAlumni) category = "alumni";
      else if (isProf) category = "professor";
      else if (isCoreRole) category = "core";

      const res = await fetch(`/api/admin/members/${editingMember._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingMember.name.trim(),
          department: deptStr,
          category,
          isAlumni,
          isProf,
          isCore: isCoreRole,
          isAddlSec,
          role: editingMember.role?.trim() || "Member",
          year: editingMember.year?.trim() || "",
          rollNumber: editingMember.rollNumber?.trim() || "",
          email: editingMember.email?.trim() || "",
          phone: editingMember.phone?.trim() || "",
          img: editingMember.img?.trim() || "",
          linkedin: editingMember.linkedin?.trim() || "",
          instagram: editingMember.instagram?.trim() || "",
        }),
      });

      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Failed to update member");
        return;
      }

      setMembers((prev) =>
        prev.map((m) => (m._id === editingMember._id ? { ...m, ...data.data } : m))
      );

      setEditingMember(null);
    } catch (err) {
      console.error("Update details error:", err);
      alert("Network error while updating member.");
    } finally {
      setUpdatingMember(false);
    }
  };

  // Export Excel
  const handleExportExcel = () => {
    if (!filteredMembers.length) {
      alert("No members in current section to export.");
      return;
    }

    const rows = filteredMembers.map((m, idx) => {
      const scoreInfo = getScoreInfo(m);
      return {
        "S.No": idx + 1,
        "Name": m.name,
        "Section": getMemberSections(m).join(", ").toUpperCase(),
        "Department": m.department || "—",
        "Role / Designation": m.role || "Member",
        "Year of Study": m.year || "—",
        "Roll Number": m.rollNumber || "—",
        "Email": m.email || "—",
        "Phone": m.phone || "—",
        "Score / Points": scoreInfo.scoreFormatted,
        "Score Classification":
          scoreInfo.status === "positive"
            ? "Positive (>0)"
            : scoreInfo.status === "zero" && scoreInfo.isEvaluated
            ? "Zero (0)"
            : scoreInfo.status === "negative"
            ? "Negative (<0)"
            : "Pending",
        "Positive Remarks (+1)": scoreInfo.posRemarks.join("; "),
        "Negative Remarks (-1)": scoreInfo.negRemarks.join("; "),
        "Verdict / Feedback": scoreInfo.feedback || "—",
        "Admin Comments": scoreInfo.comments || "—",
        "Evaluated By": m.evaluatedBy || "—",
        "Evaluated At": m.evaluatedAt ? new Date(m.evaluatedAt).toLocaleString() : "—",
        "LinkedIn": m.linkedin || "—",
        "Instagram": m.instagram || "—",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    const sheetTitle = activeTab.slice(0, 31);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetTitle);

    XLSX.writeFile(
      workbook,
      `RC_Members_${activeTab}_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  // Standard Admin Page Loading (Matches other admin pages)
  if (status === "loading" || loading) {
    return (
      <div className="relative min-h-screen text-white">
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 pt-24 pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-black/60 border border-white/20 rounded-2xl p-6 sm:p-8 text-center glass-panel">
              <p className="font-mono text-gray-300 text-lg">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || session?.user?.role !== "admin") {
    return null;
  }

  return (
    <div className="relative min-h-screen text-white">
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section with Logout & Action Buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white font-mono text-sm mb-4 transition-colors"
              >
                <FaArrowLeft /> Back to Admin Panel
              </Link>
              <h1 className="font-mono text-4xl sm:text-5xl font-bold tracking-tight mb-2 text-white">
                {">_"} MANAGE_MEMBERS
              </h1>
              <p className="font-mono text-gray-400 text-lg">
                View members department-wise, alumni, professors, and evaluate scores
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-5 py-2 bg-transparent border border-white text-white font-mono rounded hover:bg-white hover:text-black transition-colors uppercase text-sm tracking-widest cursor-pointer flex items-center gap-2"
              >
                <FaPlus /> [ + ADD MEMBER ]
              </button>

              <button
                onClick={handleExportExcel}
                className="px-5 py-2 bg-transparent border border-white text-white font-mono rounded hover:bg-white hover:text-black transition-colors uppercase text-sm tracking-widest cursor-pointer flex items-center gap-2"
              >
                <FaDownload /> [ EXPORT EXCEL ]
              </button>

              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-transparent border border-white text-white font-mono rounded hover:bg-white hover:text-black transition-colors uppercase text-sm tracking-widest cursor-pointer"
              >
                [ LOGOUT ]
              </button>
            </div>
          </div>

          {/* Department / Section Selector Tabs */}
          <div className="flex flex-wrap gap-3 mb-8">
            {SECTIONS.map((sec) => {
              const Icon = sec.icon;
              const count = sectionCounts[sec.id] || 0;
              const isActive = activeTab === sec.id;

              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveTab(sec.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-mono text-sm uppercase tracking-wider transition-all duration-200 border cursor-pointer ${
                    isActive
                      ? "bg-white text-black font-bold border-white"
                      : "bg-transparent border-white/20 text-gray-300 hover:border-white hover:text-white"
                  }`}
                >
                  <Icon />
                  <span>{sec.label}</span>
                  <span
                    className={`ml-2 text-xs px-2 py-0.5 rounded-full font-mono ${
                      isActive ? "bg-black text-white" : "bg-white/10 text-gray-300"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="mb-6 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search member name, roll number, email, or remarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/60 border border-white/20 rounded-lg pl-11 pr-4 py-3 font-mono text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <FaTimes />
              </button>
            )}
          </div>

          {/* Members List */}
          {filteredMembers.length === 0 ? (
            <div className="bg-black/60 border border-white/20 rounded-2xl p-12 text-center text-gray-400 font-mono glass-panel">
              <p className="text-lg text-white mb-2">No members found in this section.</p>
              <p className="text-sm text-gray-400">
                You can add a member to this section using the [ + ADD MEMBER ] button above.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredMembers.map((member) => {
                const scoreInfo = getScoreInfo(member);
                const posInputVal = newPositiveInputs[member._id] || "";
                const negInputVal = newNegativeInputs[member._id] || "";
                const sec = getMemberSection(member);

                return (
                  <div
                    key={member._id}
                    className="glass-panel p-6 sm:p-8 transition-all duration-300 border border-white/20"
                  >
                    {/* Top Section: Member Details & Action Buttons */}
                    <div className="flex flex-col md:flex-row items-start justify-between gap-4 pb-6 border-b border-white/10">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Avatar */}
                        <div className="w-14 h-14 rounded-lg bg-black border border-white/20 flex items-center justify-center shrink-0 overflow-hidden">
                          {member.img ? (
                            <img
                              src={member.img}
                              alt={member.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <span className="font-mono font-bold text-white text-lg">
                              {member.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="font-mono text-xl sm:text-2xl font-bold text-white">
                              {member.name}
                            </h3>

                            {/* Department & Section Badges (shows Core Command + Department) */}
                            {getMemberSections(member).map((sId) => {
                              const isCoreBadge = sId === "core";
                              return (
                                <span
                                  key={sId}
                                  className={`px-3 py-1 rounded-lg text-xs font-mono uppercase font-semibold border ${
                                    isCoreBadge
                                      ? "bg-white/20 text-white border-white/40 font-bold"
                                      : "bg-white/10 text-white border-white/20"
                                  }`}
                                >
                                  {sId === "core" ? "CORE COMMAND" : sId === "pr" ? "PUBLIC RELATIONS" : sId}
                                </span>
                              );
                            })}

                            {/* Role Badge */}
                            {member.role && (
                              <span className="px-3 py-1 bg-white/5 text-gray-300 rounded-lg text-xs font-mono border border-white/10">
                                {member.role}
                              </span>
                            )}

                            {/* Year of study */}
                            {member.year && (
                              <span className="px-3 py-1 bg-white/5 text-gray-300 rounded-lg text-xs font-mono border border-white/10">
                                {member.year}
                              </span>
                            )}
                          </div>

                          {/* Contact information */}
                          <div className="space-y-1.5 font-mono text-xs sm:text-sm text-gray-300">
                            {member.rollNumber && (
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">Roll No:</span>
                                <span className="text-white font-semibold">{member.rollNumber}</span>
                              </div>
                            )}

                            {member.email && (
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">Email:</span>
                                <a
                                  href={`mailto:${member.email}`}
                                  className="text-gray-300 hover:text-white underline transition-colors"
                                >
                                  {member.email}
                                </a>
                              </div>
                            )}

                            {member.phone && (
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">Phone:</span>
                                <a
                                  href={`tel:${member.phone}`}
                                  className="text-gray-300 hover:text-white transition-colors"
                                >
                                  {member.phone}
                                </a>
                              </div>
                            )}

                            {(member.linkedin || member.instagram) && (
                              <div className="flex items-center gap-4 pt-1">
                                {member.linkedin && member.linkedin !== "#" && (
                                  <a
                                    href={
                                      member.linkedin.startsWith("http")
                                        ? member.linkedin
                                        : `https://${member.linkedin}`
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1.5 text-gray-300 hover:text-white text-xs"
                                  >
                                    <FaLinkedin /> LinkedIn
                                  </a>
                                )}
                                {member.instagram && member.instagram !== "#" && (
                                  <a
                                    href={
                                      member.instagram.startsWith("http")
                                        ? member.instagram
                                        : `https://${member.instagram}`
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1.5 text-gray-300 hover:text-white text-xs"
                                  >
                                    <FaInstagram /> Instagram
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Edit & Delete Buttons */}
                      <div className="flex items-center gap-2 self-end md:self-start">
                        <button
                          onClick={() => setEditingMember(member)}
                          className="px-3 py-1.5 bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 rounded font-mono text-xs transition-colors flex items-center gap-1.5 cursor-pointer border border-white/10"
                          title="Edit member details"
                        >
                          <FaEdit /> Edit
                        </button>

                        <button
                          onClick={() => setDeletingMember(member)}
                          className="px-3 py-1.5 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 rounded font-mono text-xs transition-colors flex items-center gap-1.5 cursor-pointer border border-white/10"
                          title="Delete member"
                        >
                          <FaTrash /> Delete
                        </button>
                      </div>
                    </div>

                    {/* Recruitment-Style Scoring Section */}
                    <div className="pt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Remarks Columns (Left 6 cols) */}
                      <div className="lg:col-span-6 space-y-4">
                        {/* Positive Remarks (+1) */}
                        <div>
                          <div className="flex items-center justify-between text-xs font-mono mb-2">
                            <span className="text-gray-300 font-bold flex items-center gap-1.5 uppercase">
                              <FaThumbsUp size={11} className="text-gray-400" /> POSITIVE REMARKS (+1 EACH)
                            </span>
                            <span className="text-gray-400">Count: {scoreInfo.posCount}</span>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-2 min-h-[34px] p-2 bg-black/60 border border-white/10 rounded-lg">
                            {scoreInfo.posRemarks.length === 0 ? (
                              <span className="text-xs font-mono text-gray-600 italic">
                                No positive remarks added
                              </span>
                            ) : (
                              scoreInfo.posRemarks.map((rem, rIdx) => (
                                <span
                                  key={`pos-${rIdx}`}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/20 text-gray-200 text-xs font-mono rounded"
                                >
                                  +{rem}
                                  <button
                                    onClick={() => handleRemovePositiveRemark(member._id, rIdx)}
                                    className="text-gray-400 hover:text-white cursor-pointer ml-1"
                                  >
                                    <FaTimes size={10} />
                                  </button>
                                </span>
                              ))
                            )}
                          </div>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Add positive point..."
                              value={posInputVal}
                              onChange={(e) =>
                                setNewPositiveInputs((prev) => ({
                                  ...prev,
                                  [member._id]: e.target.value,
                                }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddPositiveRemark(member._id);
                                }
                              }}
                              className="flex-1 bg-black border border-white/20 rounded px-3 py-1.5 font-mono text-xs text-white focus:outline-none focus:border-white"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddPositiveRemark(member._id)}
                              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-mono font-bold text-xs rounded transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <FaPlus size={10} /> Add (+1)
                            </button>
                          </div>
                        </div>

                        {/* Negative Remarks (-1) */}
                        <div>
                          <div className="flex items-center justify-between text-xs font-mono mb-2">
                            <span className="text-gray-300 font-bold flex items-center gap-1.5 uppercase">
                              <FaThumbsDown size={11} className="text-gray-400" /> NEGATIVE REMARKS (-1 EACH)
                            </span>
                            <span className="text-gray-400">Count: {scoreInfo.negCount}</span>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-2 min-h-[34px] p-2 bg-black/60 border border-white/10 rounded-lg">
                            {scoreInfo.negRemarks.length === 0 ? (
                              <span className="text-xs font-mono text-gray-600 italic">
                                No negative remarks added
                              </span>
                            ) : (
                              scoreInfo.negRemarks.map((rem, rIdx) => (
                                <span
                                  key={`neg-${rIdx}`}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/20 text-gray-200 text-xs font-mono rounded"
                                >
                                  -{rem}
                                  <button
                                    onClick={() => handleRemoveNegativeRemark(member._id, rIdx)}
                                    className="text-gray-400 hover:text-white cursor-pointer ml-1"
                                  >
                                    <FaTimes size={10} />
                                  </button>
                                </span>
                              ))
                            )}
                          </div>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Add negative point..."
                              value={negInputVal}
                              onChange={(e) =>
                                setNewNegativeInputs((prev) => ({
                                  ...prev,
                                  [member._id]: e.target.value,
                                }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddNegativeRemark(member._id);
                                }
                              }}
                              className="flex-1 bg-black border border-white/20 rounded px-3 py-1.5 font-mono text-xs text-white focus:outline-none focus:border-white"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddNegativeRemark(member._id)}
                              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-mono font-bold text-xs rounded transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <FaPlus size={10} /> Add (-1)
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Score, Feedback, Notes & Save (Right 6 cols) */}
                      <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          {/* Net Score Box */}
                          <div className="bg-black/60 border border-white/10 p-3 rounded-lg flex items-center justify-between">
                            <div>
                              <span className="block text-xs font-mono text-gray-400 uppercase">
                                Net Score
                              </span>
                              <div className="flex items-baseline gap-2 mt-0.5">
                                <span
                                  className={`font-mono text-3xl font-black ${
                                    scoreInfo.isEvaluated ? "text-white" : "text-gray-500"
                                  }`}
                                >
                                  {scoreInfo.scoreFormatted}
                                </span>
                              </div>
                            </div>

                            {/* Direct points override */}
                            <div className="w-20">
                              <label className="block text-[11px] font-mono text-gray-500 text-right">
                                Points
                              </label>
                              <input
                                type="text"
                                value={scoreInfo.points}
                                onChange={(e) => handlePointsChange(member._id, e.target.value)}
                                placeholder="+0"
                                className="w-full bg-black border border-white/20 rounded px-2 py-1 text-center font-mono text-sm text-white focus:border-white focus:outline-none"
                              />
                            </div>
                          </div>

                          {/* Verdict / Status */}
                          <div className="bg-black/60 border border-white/10 p-3 rounded-lg flex flex-col justify-between">
                            <label className="text-xs font-mono text-gray-400 uppercase">Status</label>
                            <select
                              value={scoreInfo.feedback}
                              onChange={(e) => handleFeedbackChange(member._id, e.target.value)}
                              className="w-full bg-black border border-white/20 rounded px-2 py-1.5 font-mono text-xs text-white focus:outline-none focus:border-white cursor-pointer mt-1"
                            >
                              <option value="">— Select Status —</option>
                              <option value="outstanding">Outstanding (+)</option>
                              <option value="positive">Active / Good (+)</option>
                              <option value="neutral">Neutral (0)</option>
                              <option value="needs_improvement">Needs Improvement (-)</option>
                              <option value="inactive">Inactive (-)</option>
                            </select>
                          </div>
                        </div>

                        {/* Admin comments */}
                        <div>
                          <label className="block text-xs font-mono text-gray-400 uppercase mb-1">
                            Admin Remarks / Scoring Notes:
                          </label>
                          <textarea
                            rows={2}
                            value={scoreInfo.comments}
                            onChange={(e) => handleCommentsChange(member._id, e.target.value)}
                            placeholder="Enter evaluation remarks or notes..."
                            className="w-full bg-black border border-white/20 rounded px-3 py-2 text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-white"
                          />
                        </div>

                        {/* Evaluator & Save Button */}
                        <div className="flex items-center justify-between gap-3 pt-2">
                          <div className="text-xs font-mono text-gray-500">
                            {member.evaluatedBy ? (
                              <span>
                                Evaluated by <span className="text-gray-300">{member.evaluatedBy}</span>
                              </span>
                            ) : (
                              <span className="italic text-gray-600">Pending evaluation</span>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            {scoreInfo.savedRecently && (
                              <span className="text-xs font-mono text-gray-300 flex items-center gap-1">
                                <FaCheck className="text-white" /> Saved
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => saveMemberEvaluation(member._id)}
                              disabled={scoreInfo.isSaving}
                              className="px-5 py-2 font-mono text-xs font-bold uppercase rounded flex items-center gap-2 transition-all cursor-pointer bg-white text-black hover:bg-gray-200"
                            >
                              {scoreInfo.isSaving ? (
                                "Saving..."
                              ) : (
                                <>
                                  <FaSave />
                                  {scoreInfo.isDirty ? "Save Score *" : "Save Score"}
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ADD MEMBER MODAL */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl border border-white/20 bg-black/95 p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.9)] relative overflow-hidden font-mono text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/15 pb-4 mb-6">
              <h3 className="font-mono text-xl font-bold text-white flex items-center gap-2">
                [ + ADD NEW MEMBER ]
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <FaTimes size={18} />
              </button>
            </div>

            <form onSubmit={handleAddMemberSubmit} className="space-y-4">
              <div>
                <label className="block font-mono text-xs text-gray-300 mb-1">
                  Full Name <span className="text-gray-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={newMemberForm.name}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
                  className="w-full bg-black border border-white/20 rounded px-3 py-2 font-mono text-sm text-white focus:outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs text-gray-300 mb-1">
                    Section / Category <span className="text-gray-400">*</span>
                  </label>
                  <select
                    value={newMemberForm.section}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, section: e.target.value })}
                    className="w-full bg-black border border-white/20 rounded px-3 py-2 font-mono text-sm text-white focus:outline-none focus:border-white cursor-pointer"
                  >
                    <option value="software">Software</option>
                    <option value="embedded">Embedded</option>
                    <option value="mechanical">Mechanical</option>
                    <option value="pr">Public Relations</option>
                    <option value="core">Core Command</option>
                    <option value="professor">Professor / Faculty</option>
                    <option value="alumni">Alumni</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-xs text-gray-300 mb-1">Role / Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Member, Lead, Alumnus"
                    value={newMemberForm.role}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, role: e.target.value })}
                    className="w-full bg-black border border-white/20 rounded px-3 py-2 font-mono text-sm text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              {/* Dual Membership Controls (Core Command / AddSec) */}
              <div className="p-3 bg-white/5 border border-white/10 rounded-lg space-y-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={Boolean(newMemberForm.isCore || newMemberForm.isAddlSec || newMemberForm.section === "core")}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setNewMemberForm({
                        ...newMemberForm,
                        isCore: checked,
                        isAddlSec: checked && (newMemberForm.isAddlSec || newMemberForm.role?.toLowerCase().includes("additional secretary")),
                      });
                    }}
                    className="rounded bg-black border-white/20 text-white focus:ring-0 cursor-pointer"
                  />
                  <span className="font-mono text-xs text-gray-200">
                    Also in Core Command (Dual Department)
                  </span>
                </label>
                {(newMemberForm.isCore || newMemberForm.isAddlSec || newMemberForm.section === "core") && (
                  <label className="flex items-center gap-2 pl-5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={Boolean(newMemberForm.isAddlSec || newMemberForm.role?.toLowerCase().includes("additional secretary"))}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setNewMemberForm({
                          ...newMemberForm,
                          isAddlSec: checked,
                          isCore: true,
                          role: checked && (!newMemberForm.role || newMemberForm.role === "Member") ? "Additional Secretary" : newMemberForm.role,
                        });
                      }}
                      className="rounded bg-black border-white/20 text-white focus:ring-0 cursor-pointer"
                    />
                    <span className="font-mono text-xs text-gray-300 font-semibold">
                      Designate as Additional Secretary (AddSec)
                    </span>
                  </label>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs text-gray-300 mb-1">Year / Batch</label>
                  <input
                    type="text"
                    placeholder="e.g. 2nd Year / Batch 2024"
                    value={newMemberForm.year}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, year: e.target.value })}
                    className="w-full bg-black border border-white/20 rounded px-3 py-2 font-mono text-sm text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs text-gray-300 mb-1">Roll Number</label>
                  <input
                    type="text"
                    placeholder="e.g. AR23MAB0A18"
                    value={newMemberForm.rollNumber}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, rollNumber: e.target.value })}
                    className="w-full bg-black border border-white/20 rounded px-3 py-2 font-mono text-sm text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="member@nitw.ac.in"
                    value={newMemberForm.email}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, email: e.target.value })}
                    className="w-full bg-black border border-white/20 rounded px-3 py-2 font-mono text-sm text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs text-gray-300 mb-1">Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 XXXXXXXXXX"
                    value={newMemberForm.phone}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, phone: e.target.value })}
                    className="w-full bg-black border border-white/20 rounded px-3 py-2 font-mono text-sm text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs text-gray-300 mb-1">LinkedIn URL</label>
                  <input
                    type="text"
                    placeholder="https://linkedin.com/in/..."
                    value={newMemberForm.linkedin}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, linkedin: e.target.value })}
                    className="w-full bg-black border border-white/20 rounded px-3 py-2 font-mono text-sm text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs text-gray-300 mb-1">Instagram URL</label>
                  <input
                    type="text"
                    placeholder="https://instagram.com/..."
                    value={newMemberForm.instagram}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, instagram: e.target.value })}
                    className="w-full bg-black border border-white/20 rounded px-3 py-2 font-mono text-sm text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs text-gray-300 mb-1">
                  Image Path / URL (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. /members/2026/name.jpg or image URL"
                  value={newMemberForm.img || ""}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, img: e.target.value })}
                  className="w-full bg-black border border-white/20 rounded px-3 py-2 font-mono text-sm text-white focus:outline-none focus:border-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/15">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-white/20 rounded font-mono text-xs text-gray-300 hover:bg-white hover:text-black transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingMember}
                  className="px-6 py-2 bg-white text-black font-mono font-bold text-xs uppercase rounded hover:bg-gray-200 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  {addingMember ? "Saving..." : "[ SAVE MEMBER ]"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT MEMBER DETAILS MODAL */}
      {/* ========================================================================= */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl border border-white/20 bg-black/95 p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.9)] relative overflow-hidden font-mono text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/15 pb-4 mb-6">
              <h3 className="font-mono text-xl font-bold text-white flex items-center gap-2">
                [ EDIT MEMBER DETAILS ]
              </h3>
              <button
                onClick={() => setEditingMember(null)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <FaTimes size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateDetailsSubmit} className="space-y-4">
              <div>
                <label className="block font-mono text-xs text-gray-300 mb-1">
                  Full Name <span className="text-gray-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingMember.name || ""}
                  onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                  className="w-full bg-black border border-white/20 rounded px-3 py-2 font-mono text-sm text-white focus:outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs text-gray-300 mb-1">
                    Department / Section <span className="text-gray-400">*</span>
                  </label>
                  <select
                    value={
                      ["Software", "Embedded", "Mechanical", "PR", "Core Command", "Professor", "Alumni"].includes(editingMember.department)
                        ? editingMember.department
                        : editingMember.department?.toLowerCase().includes("soft")
                        ? "Software"
                        : editingMember.department?.toLowerCase().includes("embed")
                        ? "Embedded"
                        : editingMember.department?.toLowerCase().includes("mech")
                        ? "Mechanical"
                        : editingMember.department?.toLowerCase().includes("pr")
                        ? "PR"
                        : editingMember.department?.toLowerCase().includes("core")
                        ? "Core Command"
                        : editingMember.department?.toLowerCase().includes("prof")
                        ? "Professor"
                        : editingMember.department?.toLowerCase().includes("alumn")
                        ? "Alumni"
                        : "Software"
                    }
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, department: e.target.value })
                    }
                    className="w-full bg-black border border-white/20 rounded px-3 py-2 font-mono text-sm text-white focus:outline-none focus:border-white cursor-pointer"
                  >
                    <option value="Software">Software</option>
                    <option value="Embedded">Embedded</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="PR">Public Relations</option>
                    <option value="Core Command">Core Command</option>
                    <option value="Professor">Professor / Faculty</option>
                    <option value="Alumni">Alumni</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-xs text-gray-300 mb-1">Role / Title</label>
                  <input
                    type="text"
                    value={editingMember.role || ""}
                    onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })}
                    className="w-full bg-black border border-white/20 rounded px-3 py-2 font-mono text-sm text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              {/* Dual Membership Controls (Core Command / AddSec) */}
              <div className="p-3 bg-white/5 border border-white/10 rounded-lg space-y-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={Boolean(
                      editingMember.isCore ||
                      editingMember.isAddlSec ||
                      editingMember.department === "Core Command"
                    )}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setEditingMember({
                        ...editingMember,
                        isCore: checked,
                        isAddlSec: checked && (editingMember.isAddlSec || editingMember.role?.toLowerCase().includes("additional secretary")),
                      });
                    }}
                    className="rounded bg-black border-white/20 text-white focus:ring-0 cursor-pointer"
                  />
                  <span className="font-mono text-xs text-gray-200">
                    Also in Core Command (Dual Department)
                  </span>
                </label>
                {(editingMember.isCore || editingMember.isAddlSec || editingMember.department === "Core Command") && (
                  <label className="flex items-center gap-2 pl-5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={Boolean(
                        editingMember.isAddlSec ||
                        editingMember.role?.toLowerCase().includes("additional secretary")
                      )}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setEditingMember({
                          ...editingMember,
                          isAddlSec: checked,
                          isCore: true,
                          role: checked && (!editingMember.role || editingMember.role === "Member") ? "Additional Secretary" : editingMember.role,
                        });
                      }}
                      className="rounded bg-black border-white/20 text-white focus:ring-0 cursor-pointer"
                    />
                    <span className="font-mono text-xs text-gray-300 font-semibold">
                      Designate as Additional Secretary (AddSec)
                    </span>
                  </label>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs text-gray-300 mb-1">Year / Batch</label>
                  <input
                    type="text"
                    value={editingMember.year || ""}
                    onChange={(e) => setEditingMember({ ...editingMember, year: e.target.value })}
                    className="w-full bg-black border border-white/20 rounded px-3 py-2 font-mono text-sm text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs text-gray-300 mb-1">Roll Number</label>
                  <input
                    type="text"
                    value={editingMember.rollNumber || ""}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, rollNumber: e.target.value })
                    }
                    className="w-full bg-black border border-white/20 rounded px-3 py-2 font-mono text-sm text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={editingMember.email || ""}
                    onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                    className="w-full bg-black border border-white/20 rounded px-3 py-2 font-mono text-sm text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs text-gray-300 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editingMember.phone || ""}
                    onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                    className="w-full bg-black border border-white/20 rounded px-3 py-2 font-mono text-sm text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs text-gray-300 mb-1">LinkedIn</label>
                  <input
                    type="text"
                    value={editingMember.linkedin || ""}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, linkedin: e.target.value })
                    }
                    className="w-full bg-black border border-white/20 rounded px-3 py-2 font-mono text-sm text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs text-gray-300 mb-1">Instagram</label>
                  <input
                    type="text"
                    value={editingMember.instagram || ""}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, instagram: e.target.value })
                    }
                    className="w-full bg-black border border-white/20 rounded px-3 py-2 font-mono text-sm text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs text-gray-300 mb-1">
                  Image Path / URL (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. /members/2026/name.jpg or image URL"
                  value={editingMember.img || ""}
                  onChange={(e) =>
                    setEditingMember({ ...editingMember, img: e.target.value })
                  }
                  className="w-full bg-black border border-white/20 rounded px-3 py-2 font-mono text-sm text-white focus:outline-none focus:border-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/15">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 border border-white/20 rounded font-mono text-xs text-gray-300 hover:bg-white hover:text-black transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingMember}
                  className="px-6 py-2 bg-white text-black font-mono font-bold text-xs uppercase rounded hover:bg-gray-200 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  {updatingMember ? "Updating..." : "[ UPDATE DETAILS ]"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {deletingMember && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-white/20 bg-black/95 p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.9)] relative overflow-hidden font-mono text-white">
            <h3 className="font-mono text-xl font-bold text-white mb-3 flex items-center gap-2">
              <FaTrash className="text-gray-400" /> CONFIRM DELETION
            </h3>
            <p className="font-mono text-sm text-gray-300 leading-relaxed mb-6">
              Are you sure you want to delete member{" "}
              <span className="text-white font-bold underline">{deletingMember.name}</span>? This
              will permanently remove their records from the database.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingMember(null)}
                className="px-4 py-2 border border-white/20 rounded font-mono text-xs text-gray-300 hover:bg-white hover:text-black transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteMember}
                disabled={isDeleting}
                className="px-5 py-2 bg-white hover:bg-gray-200 text-black font-mono font-bold text-xs uppercase rounded transition-colors flex items-center gap-2 cursor-pointer"
              >
                {isDeleting ? "Deleting..." : "[ YES, DELETE ]"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
