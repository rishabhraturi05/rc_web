"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  FaTrash,
  FaCheck,
  FaTimes,
  FaPlus,
  FaArrowLeft,
  FaDownload,
  FaSync,
  FaCopy,
  FaMicrochip,
  FaCarSide,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaUserCheck,
  FaFilter,
} from "react-icons/fa";
import * as XLSX from "xlsx";

const BRANCHES = ["All", "CSE", "ECE", "EEE", "MECH", "CIVIL", "CHEM", "META", "BIOTECH", "Other"];

const emptyWalkIn = {
  name: "",
  collegeName: "",
};

export default function SmashKartsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [registrations, setRegistrations] = useState([]);
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    scannedToday: 0,
    totalAttended: 0,
    pendingAttendance: 0,
    rfidScans: 0,
    manualEntries: 0,
    recycleBinCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("all"); // 'all' | 'attended' | 'pending' | 'bin'
  const [search, setSearch] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("All");
  const [autoRefresh, setAutoRefresh] = useState(false); // Default to off for big lists, toggleable
  const [showWalkInForm, setShowWalkInForm] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [walkInData, setWalkInData] = useState(emptyWalkIn);
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [customEndpointUrl, setCustomEndpointUrl] = useState("");

  // Quick check-in state
  const [quickRollInput, setQuickRollInput] = useState("");
  const [quickCheckInMessage, setQuickCheckInMessage] = useState(null);
  const quickInputRef = useRef(null);

  // Toast state
  const [toastMessage, setToastMessage] = useState(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const showToast = (text, type = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const fetchRegistrations = useCallback(async (isPolling = false) => {
    try {
      if (!isPolling) setLoading(true);
      const res = await fetch("/api/addsecs/smashkarts", {
        cache: "no-store",
      });
      const data = await res.json();

      if (!data.success && res.status === 401) {
        router.push("/addsecs/login");
        return;
      }

      if (data.success) {
        setRegistrations(data.data || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (error) {
      console.error("Smash Karts fetch error:", error);
    } finally {
      if (!isPolling) setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (status === "loading") return;
    if (
      status === "unauthenticated" ||
      (session?.user?.role !== "addsec" && session?.user?.role !== "admin")
    ) {
      router.push("/addsecs/login");
      return;
    }
    fetchRegistrations();
  }, [status, session, router, fetchRegistrations]);

  // Live polling for hardware card taps (if enabled)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchRegistrations(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchRegistrations]);

  // Filtered registrations
  const filteredList = useMemo(() => {
    let list = registrations;
    if (viewMode === "all") list = list.filter((r) => !r.isDeleted);
    else if (viewMode === "attended") list = list.filter((r) => !r.isDeleted && r.attended);
    else if (viewMode === "pending") list = list.filter((r) => !r.isDeleted && !r.attended);
    else if (viewMode === "bin") list = list.filter((r) => r.isDeleted);

    if (selectedBranch !== "All") {
      list = list.filter((r) => (r.branch || "Other").toUpperCase() === selectedBranch.toUpperCase());
    }

    if (!search.trim()) return list;
    const q = search.toLowerCase().trim();
    return list.filter(
      (r) =>
        (r.rollNo && r.rollNo.toLowerCase().includes(q)) ||
        (r.name && r.name.toLowerCase().includes(q)) ||
        (r.collegeName && r.collegeName.toLowerCase().includes(q)) ||
        (r.rfidUid && r.rfidUid.toLowerCase().includes(q)) ||
        (r.email && r.email.toLowerCase().includes(q)) ||
        (r.branch && r.branch.toLowerCase().includes(q))
    );
  }, [registrations, viewMode, selectedBranch, search]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [search, viewMode, selectedBranch, pageSize]);

  // Paginated list for high-performance DOM rendering
  const totalPages = Math.max(1, Math.ceil(filteredList.length / pageSize));
  const paginatedList = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredList.slice(start, start + pageSize);
  }, [filteredList, page, pageSize]);

  // Quick Roll Number Check-in (Instant manual attendance by typing roll number)
  const handleQuickCheckIn = async (e) => {
    e.preventDefault();
    if (!quickRollInput.trim()) return;
    const targetRoll = quickRollInput.trim().toUpperCase();

    // Find student in local state
    const student = registrations.find(
      (r) => !r.isDeleted && r.rollNo && r.rollNo.toUpperCase() === targetRoll
    );

    if (!student) {
      setQuickCheckInMessage({
        text: `Roll number ${targetRoll} not found in database!`,
        type: "error",
      });
      return;
    }

    if (student.attended) {
      setQuickCheckInMessage({
        text: `[ALREADY ATTENDED] ${student.rollNo} (${student.name || "Student"}) was already marked attended!`,
        type: "info",
      });
      setQuickRollInput("");
      return;
    }

    try {
      setUpdatingId(student._id);
      const res = await fetch(`/api/addsecs/smashkarts/${student._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attended: true }),
      });
      const data = await res.json();
      if (data.success) {
        setRegistrations((prev) =>
          prev.map((r) =>
            r._id === student._id ? { ...r, attended: true, lastScannedAt: new Date() } : r
          )
        );
        setStats((prev) => ({
          ...prev,
          totalAttended: prev.totalAttended + 1,
          pendingAttendance: Math.max(0, prev.pendingAttendance - 1),
        }));
        setQuickCheckInMessage({
          text: `✓ Confirmed Attendance for ${student.rollNo} — ${student.name || "Student"}!`,
          type: "success",
        });
        setQuickRollInput("");
      } else {
        setQuickCheckInMessage({
          text: data.message || "Failed to mark attendance",
          type: "error",
        });
      }
    } catch {
      setQuickCheckInMessage({
        text: "Network error updating attendance",
        type: "error",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleAttended = async (id, currentVal) => {
    try {
      setUpdatingId(id);
      const res = await fetch(`/api/addsecs/smashkarts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attended: !currentVal }),
      });
      const data = await res.json();
      if (data.success) {
        setRegistrations((prev) =>
          prev.map((r) => (r._id === id ? { ...r, attended: !currentVal } : r))
        );
        setStats((prev) => ({
          ...prev,
          totalAttended: prev.totalAttended + (currentVal ? -1 : 1),
          pendingAttendance: prev.pendingAttendance + (currentVal ? 1 : -1),
        }));
        showToast(
          !currentVal
            ? "Marked as ATTENDED!"
            : "Attendance removed.",
          !currentVal ? "success" : "info"
        );
      } else {
        alert(data.message || "Failed to update attendance");
      }
    } catch {
      alert("Failed to update attendance");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Move this student to the recycle bin?")) return;
    try {
      setDeletingId(id);
      const res = await fetch(`/api/addsecs/smashkarts/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setRegistrations((prev) =>
          prev.map((r) => (r._id === id ? { ...r, isDeleted: true } : r))
        );
        setStats((prev) => ({
          ...prev,
          totalRegistrations: prev.totalRegistrations - 1,
          recycleBinCount: prev.recycleBinCount + 1,
        }));
        showToast("Moved to recycle bin.");
      } else {
        alert(data.message || "Failed to delete");
      }
    } catch {
      alert("Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  const handleRestore = async (id) => {
    try {
      setUpdatingId(id);
      const res = await fetch(`/api/addsecs/smashkarts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDeleted: false }),
      });
      const data = await res.json();
      if (data.success) {
        setRegistrations((prev) =>
          prev.map((r) => (r._id === id ? { ...r, isDeleted: false } : r))
        );
        setStats((prev) => ({
          ...prev,
          totalRegistrations: prev.totalRegistrations + 1,
          recycleBinCount: prev.recycleBinCount - 1,
        }));
        showToast("Restored from recycle bin.");
      } else {
        alert(data.message || "Failed to restore");
      }
    } catch {
      alert("Failed to restore entry");
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePermanentDelete = async (id) => {
    if (!window.confirm("Permanently purge this record? This cannot be undone.")) return;
    try {
      setDeletingId(id);
      const res = await fetch(`/api/addsecs/smashkarts/${id}?permanent=true`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setRegistrations((prev) => prev.filter((r) => r._id !== id));
        setStats((prev) => ({
          ...prev,
          recycleBinCount: Math.max(0, prev.recycleBinCount - 1),
        }));
        showToast("Permanently deleted.");
      } else {
        alert(data.message || "Failed to delete permanently");
      }
    } catch {
      alert("Failed to delete permanently");
    } finally {
      setDeletingId(null);
    }
  };



  const handleWalkInSubmit = async (e) => {
    e.preventDefault();
    if (!walkInData.name.trim()) {
      alert("Participant name is required");
      return;
    }
    if (!walkInData.collegeName.trim()) {
      alert("College name is required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/addsecs/smashkarts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(walkInData),
      });
      const data = await res.json();
      if (data.success) {
        setRegistrations((prev) => [data.data, ...prev]);
        setStats((prev) => ({
          ...prev,
          totalRegistrations: prev.totalRegistrations + 1,
          manualEntries: prev.manualEntries + 1,
          scannedToday: prev.scannedToday + 1,
          totalAttended: prev.totalAttended + 1,
        }));
        setWalkInData(emptyWalkIn);
        setShowWalkInForm(false);
        showToast(`Walk-in added: ${data.data.name} (${data.data.collegeName})!`);
      } else {
        alert(data.message || "Failed to add walk-in");
      }
    } catch {
      alert("Failed to add walk-in");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadExcel = () => {
    if (filteredList.length === 0) {
      alert("No data to download.");
      return;
    }

    const headers = [
      "Roll No / Walk-in ID",
      "Participant Name",
      "College Name",
      "Branch",
      "Year",
      "Email",
      "Attended",
      "Source",
      "Scan Count",
      "Last Scanned At",
      "Notes",
    ];

    const rows = filteredList.map((r) => [
      r.rollNo || "",
      r.name || "",
      r.collegeName || "NIT Warangal",
      r.branch || "",
      r.year || "",
      r.email || "",
      r.attended ? "YES" : "NO",
      r.isManual ? "Roster / Walk-in" : "RFID Scan",
      r.scanCount || 0,
      r.lastScannedAt ? new Date(r.lastScannedAt).toLocaleString() : "",
      r.notes || "",
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SmashKarts_Registrations");
    XLSX.writeFile(
      workbook,
      `SmashKarts_Registrations_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  const originUrl = typeof window !== "undefined" ? window.location.origin : "";
  const endpointUrl = customEndpointUrl || (originUrl ? `${originUrl}/api/technozian/scan` : "/api/technozian/scan");
  const apiKey = "rc_technozian_rfid_2025";

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      router.push("/addsecs/login");
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  if (status === "loading") {
    return (
      <div className="relative min-h-screen text-white flex items-center justify-center">
        <p className="font-mono text-gray-300 text-lg animate-pulse">{">_"} Loading Smash Karts Terminal[...]</p>
      </div>
    );
  }

  if (
    status === "unauthenticated" ||
    (session?.user?.role !== "addsec" && session?.user?.role !== "admin")
  ) {
    return null;
  }

  return (
    <div className="relative min-h-screen text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-24 right-4 z-50 px-4 py-3 rounded border font-mono text-sm shadow-xl transition-all ${
            toastMessage.type === "error"
              ? "bg-red-950/90 border-red-500 text-red-200"
              : "bg-emerald-950/90 border-emerald-500 text-emerald-200"
          }`}
        >
          {toastMessage.type === "error" ? "⚠ " : "✓ "}
          {toastMessage.text}
        </div>
      )}

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <Link
                href="/addsecs"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white font-mono text-xs sm:text-sm mb-2 transition-colors cursor-pointer"
              >
                <FaArrowLeft size={11} /> Back to AddSec Portal
              </Link>
              <h1 className="font-mono text-2xl sm:text-4xl font-bold tracking-tight text-white flex items-center gap-3">
                <FaCarSide className="text-amber-400 text-2xl sm:text-3xl" />
                <span>{">_"} SMASHKARTS_REGISTRATION</span>
              </h1>
              <p className="font-mono text-gray-400 text-xs sm:text-sm mt-1">
                NITW Student Roster ({registrations.length.toLocaleString()} total) &bull; Mark attendance manually or via RFID Smart-Box
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">

              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center gap-2 px-3.5 py-2 border rounded font-mono uppercase text-xs tracking-wider cursor-pointer transition-colors ${
                  autoRefresh
                    ? "border-emerald-400 bg-emerald-500/20 text-emerald-300 font-semibold"
                    : "border-white/30 text-gray-300 bg-transparent hover:bg-white hover:text-black"
                }`}
                title="Toggle Real-Time Hardware Sync"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    autoRefresh ? "bg-emerald-400 animate-ping" : "bg-gray-500"
                  }`}
                />
                [ LIVE: {autoRefresh ? "ON" : "OFF"} ]
              </button>
              <button
                onClick={() => setShowApiModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 border border-white/30 text-white bg-transparent rounded hover:bg-white hover:text-black transition-colors font-mono uppercase text-xs tracking-wider cursor-pointer"
              >
                <FaMicrochip /> [ HARDWARE API ]
              </button>
              <button
                onClick={handleDownloadExcel}
                className="flex items-center gap-1.5 px-3.5 py-2 border border-white/30 text-white bg-transparent rounded hover:bg-white hover:text-black transition-colors font-mono uppercase text-xs tracking-wider cursor-pointer"
              >
                <FaDownload /> [ EXCEL (.XLSX) ]
              </button>
              <button
                onClick={() => setShowWalkInForm(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 border border-amber-400 text-amber-300 bg-amber-950/30 rounded hover:bg-amber-400 hover:text-black transition-colors font-mono uppercase text-xs tracking-wider cursor-pointer font-bold"
              >
                <FaPlus /> [ + WALK-IN ]
              </button>
              <button
                onClick={handleLogout}
                className="px-3.5 py-2 bg-transparent border border-white/30 text-gray-300 font-mono rounded hover:bg-red-600/30 hover:border-red-500 transition-colors uppercase text-xs tracking-wider cursor-pointer"
              >
                [ LOGOUT ]
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="glass-panel p-5 text-center border border-white/20">
              <p className="font-mono text-gray-400 text-xs uppercase tracking-wider mb-1">
                Total Roster
              </p>
              <p className="font-mono text-2xl sm:text-3xl font-bold text-white">
                {stats.totalRegistrations.toLocaleString()}
              </p>
            </div>
            <div className="glass-panel p-5 text-center border border-emerald-500/40 bg-emerald-950/10">
              <p className="font-mono text-emerald-400 text-xs uppercase tracking-wider mb-1">
                ✓ Attended
              </p>
              <p className="font-mono text-2xl sm:text-3xl font-bold text-emerald-400">
                {stats.totalAttended.toLocaleString()}
              </p>
            </div>
            <div className="glass-panel p-5 text-center border border-amber-500/40 bg-amber-950/10">
              <p className="font-mono text-amber-400 text-xs uppercase tracking-wider mb-1">
                ○ Pending
              </p>
              <p className="font-mono text-2xl sm:text-3xl font-bold text-amber-300">
                {(stats.pendingAttendance || Math.max(0, stats.totalRegistrations - stats.totalAttended)).toLocaleString()}
              </p>
            </div>
            <div className="glass-panel p-5 text-center border border-cyan-500/40 bg-cyan-950/10">
              <p className="font-mono text-cyan-400 text-xs uppercase tracking-wider mb-1">
                RFID Smart-Box Scans
              </p>
              <p className="font-mono text-2xl sm:text-3xl font-bold text-cyan-300">
                {stats.rfidScans.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Quick Roll Number Check-in Box */}
          <div className="glass-panel p-4 sm:p-5 rounded-lg border border-amber-400/40 bg-amber-950/15">
            <form onSubmit={handleQuickCheckIn} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center gap-2 shrink-0">
                <FaUserCheck className="text-amber-400 text-xl" />
                <span className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300">
                  Instant Roll Check-in:
                </span>
              </div>
              <div className="flex-1 relative">
                <input
                  ref={quickInputRef}
                  type="text"
                  placeholder="Enter Roll Number to mark attendance (e.g. 23CEB0B10)..."
                  value={quickRollInput}
                  onChange={(e) => {
                    setQuickRollInput(e.target.value.toUpperCase());
                    if (quickCheckInMessage) setQuickCheckInMessage(null);
                  }}
                  className="w-full px-4 py-2 bg-black/60 border border-white/30 text-white font-mono text-sm rounded focus:border-amber-400 focus:outline-none placeholder:text-gray-500 uppercase tracking-wider"
                />
              </div>
              <button
                type="submit"
                disabled={!quickRollInput.trim() || updatingId}
                className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold text-xs sm:text-sm uppercase tracking-wider rounded transition-colors disabled:opacity-50 cursor-pointer shrink-0"
              >
                {updatingId ? "[ MARKING... ]" : "[ MARK ATTENDED ]"}
              </button>
            </form>
            {quickCheckInMessage && (
              <div
                className={`mt-2 font-mono text-xs px-3 py-1.5 rounded border ${
                  quickCheckInMessage.type === "success"
                    ? "bg-emerald-950/80 border-emerald-500 text-emerald-200"
                    : quickCheckInMessage.type === "info"
                    ? "bg-blue-950/80 border-blue-500 text-blue-200"
                    : "bg-red-950/80 border-red-500 text-red-200"
                }`}
              >
                {quickCheckInMessage.text}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-4 sm:gap-6 border-b border-white/20 pb-3 overflow-x-auto font-mono text-xs sm:text-sm uppercase tracking-wider">
            <button
              onClick={() => setViewMode("all")}
              className={`whitespace-nowrap pb-2 cursor-pointer transition-colors ${
                viewMode === "all"
                  ? "text-white border-b-2 border-white font-bold"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              All Students ({stats.totalRegistrations.toLocaleString()})
            </button>
            <button
              onClick={() => setViewMode("attended")}
              className={`whitespace-nowrap pb-2 cursor-pointer transition-colors ${
                viewMode === "attended"
                  ? "text-emerald-400 border-b-2 border-emerald-400 font-bold"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              ✓ Attended ({stats.totalAttended.toLocaleString()})
            </button>
            <button
              onClick={() => setViewMode("pending")}
              className={`whitespace-nowrap pb-2 cursor-pointer transition-colors ${
                viewMode === "pending"
                  ? "text-amber-400 border-b-2 border-amber-400 font-bold"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              ○ Pending Attendance ({(stats.pendingAttendance || Math.max(0, stats.totalRegistrations - stats.totalAttended)).toLocaleString()})
            </button>
            <button
              onClick={() => setViewMode("bin")}
              className={`whitespace-nowrap pb-2 cursor-pointer transition-colors ${
                viewMode === "bin"
                  ? "text-rose-400 border-b-2 border-rose-400 font-bold"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Recycle Bin ({stats.recycleBinCount})
            </button>
          </div>

          {/* Search & Filters Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                <input
                  type="text"
                  placeholder="Search roll number, student name, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-black/40 border border-white/20 text-white font-mono rounded focus:border-white focus:outline-none text-xs sm:text-sm placeholder:text-gray-500"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <FaTimes size={12} />
                  </button>
                )}
              </div>

              {/* Branch Filter */}
              <div className="flex items-center gap-1.5 shrink-0">
                <label className="font-mono text-xs text-gray-400">Branch:</label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="bg-black/60 border border-white/20 rounded px-2.5 py-1.5 text-xs font-mono text-white focus:border-white focus:outline-none"
                >
                  {BRANCHES.map((b) => (
                    <option key={b} value={b} className="bg-black text-white">
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-between sm:justify-end">
              <div className="flex items-center gap-1.5 font-mono text-xs text-gray-400">
                <span>Per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="bg-black/60 border border-white/20 rounded px-2 py-1 text-xs font-mono text-white focus:border-white"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={250}>250</option>
                </select>
              </div>

              <button
                onClick={() => fetchRegistrations(false)}
                className="px-3.5 py-1.5 bg-transparent border border-white/30 text-white font-mono rounded hover:bg-white hover:text-black transition-colors uppercase text-xs tracking-wider flex items-center gap-1.5 cursor-pointer"
              >
                <FaSync className={loading ? "animate-spin" : ""} /> [ REFRESH ]
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="glass-panel overflow-x-auto border border-white/20 rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/20 font-mono text-xs uppercase tracking-wider text-gray-400 bg-white/[0.02]">
                  <th className="p-3.5">#</th>
                  <th className="p-3.5">Roll No / ID</th>
                  <th className="p-3.5">Participant Name</th>
                  <th className="p-3.5">College / Branch</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Source</th>
                  <th className="p-3.5">RFID / Last Seen</th>
                  <th className="p-3.5 text-center">Attendance Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 font-mono text-xs sm:text-sm">
                {loading && registrations.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-gray-400 font-mono">
                      Loading Smash Karts student database...
                    </td>
                  </tr>
                ) : filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-gray-500 font-mono">
                      No matching student registrations found.
                    </td>
                  </tr>
                ) : (
                  paginatedList.map((item, idx) => {
                    const rowNumber = (page - 1) * pageSize + idx + 1;
                    return (
                      <tr
                        key={item._id}
                        className={`transition-colors ${
                          item.attended
                            ? "bg-emerald-950/15 hover:bg-emerald-950/25"
                            : "hover:bg-white/5"
                        }`}
                      >
                        <td className="p-3.5 text-gray-500">{rowNumber}</td>
                        <td className="p-3.5 font-bold tracking-wider text-white">
                          <span className="px-2 py-0.5 rounded bg-white/10 border border-white/15">
                            {item.rollNo}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="text-white font-medium">
                            {item.name || <span className="text-gray-500 italic">Not set</span>}
                          </div>
                        </td>
                        <td className="p-3.5">
                          {item.collegeName ? (
                            <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold text-xs inline-block">
                              {item.collegeName}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-300">
                              {item.branch ? `${item.branch} • ${item.year || "1st"}` : "NITW"}
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-gray-400 text-xs truncate max-w-xs">
                          {item.email || "—"}
                        </td>
                        <td className="p-3.5">
                          <span className="text-[10px] px-2 py-0.5 rounded border border-white/20 text-gray-300 uppercase">
                            {item.deviceId === "CONTACTS_ROSTER"
                              ? "Roster"
                              : item.isManual
                              ? "Walk-in"
                              : item.deviceId || "RFID"}
                          </span>
                        </td>
                        <td className="p-3.5 text-xs text-gray-400">
                          {item.rfidUid ? (
                            <span className="text-cyan-300">{item.rfidUid}</span>
                          ) : item.lastScannedAt ? (
                            new Date(item.lastScannedAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => handleToggleAttended(item._id, item.attended)}
                            disabled={updatingId === item._id}
                            className={`px-3 py-1.5 rounded font-mono uppercase text-xs tracking-wider cursor-pointer transition-all border font-bold flex items-center justify-center gap-1.5 mx-auto ${
                              item.attended
                                ? "border-emerald-500 bg-emerald-500 text-black shadow-md hover:bg-emerald-400"
                                : "border-white/30 text-gray-300 bg-white/5 hover:border-amber-400 hover:text-amber-300 hover:bg-amber-950/30"
                            }`}
                            title={item.attended ? "Click to revoke attendance" : "Click to mark as attended"}
                          >
                            {item.attended ? (
                              <>
                                <FaCheck className="text-xs" />
                                <span>ATTENDED</span>
                              </>
                            ) : (
                              <span>○ MARK ATTENDED</span>
                            )}
                          </button>
                        </td>
                        <td className="p-3.5 text-right">
                          {item.isDeleted ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleRestore(item._id)}
                                disabled={updatingId === item._id}
                                className="px-2 py-1 border border-white/40 text-gray-300 hover:text-white rounded text-xs cursor-pointer"
                              >
                                Restore
                              </button>
                              <button
                                onClick={() => handlePermanentDelete(item._id)}
                                disabled={deletingId === item._id}
                                className="px-2 py-1 border border-red-500/50 text-red-300 hover:bg-red-600 hover:text-white rounded text-xs cursor-pointer"
                              >
                                Purge
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleDelete(item._id)}
                              disabled={deletingId === item._id}
                              className="text-gray-400 hover:text-red-400 transition-colors cursor-pointer p-1"
                              title="Move to Bin"
                            >
                              <FaTrash />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredList.length > 0 && (
            <div className="glass-panel p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-gray-400 border border-white/10 rounded-lg">
              <div>
                Showing{" "}
                <strong className="text-white">
                  {(page - 1) * pageSize + 1}
                </strong>{" "}
                to{" "}
                <strong className="text-white">
                  {Math.min(page * pageSize, filteredList.length)}
                </strong>{" "}
                of <strong className="text-white">{filteredList.length.toLocaleString()}</strong> results
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(1)}
                  disabled={page <= 1}
                  className="px-2.5 py-1.5 rounded border border-white/20 text-white hover:bg-white hover:text-black disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  &laquo; First
                </button>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-2.5 py-1.5 rounded border border-white/20 text-white hover:bg-white hover:text-black disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1"
                >
                  <FaChevronLeft size={10} /> Prev
                </button>

                <span className="px-2 text-white font-bold">
                  Page {page} of {totalPages}
                </span>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-2.5 py-1.5 rounded border border-white/20 text-white hover:bg-white hover:text-black disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1"
                >
                  Next <FaChevronRight size={10} />
                </button>
                <button
                  onClick={() => setPage(totalPages)}
                  disabled={page >= totalPages}
                  className="px-2.5 py-1.5 rounded border border-white/20 text-white hover:bg-white hover:text-black disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  Last &raquo;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Walk-in Form Modal - JUST Name and College Name */}
      {showWalkInForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md p-6 sm:p-8 rounded-xl border border-amber-400/50 bg-black max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-white/20 pb-4">
              <h2 className="font-mono text-lg sm:text-xl font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <FaCarSide className="text-amber-400" />
                <span>{">_"} Add Walk-in Participant</span>
              </h2>
              <button
                onClick={() => setShowWalkInForm(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <FaTimes size={18} />
              </button>
            </div>

            <form onSubmit={handleWalkInSubmit} className="space-y-5 font-mono text-sm">
              <div>
                <label className="block text-gray-300 font-bold mb-1.5 uppercase text-xs tracking-wider">
                  NAME *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Rahul Sharma"
                  value={walkInData.name}
                  onChange={(e) =>
                    setWalkInData({ ...walkInData, name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-black/60 border border-white/30 text-white rounded focus:border-amber-400 focus:outline-none placeholder:text-gray-600"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1.5 uppercase text-xs tracking-wider">
                  COLLEGE NAME *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NIT Warangal / CBIT / VNR VJIET"
                  value={walkInData.collegeName}
                  onChange={(e) =>
                    setWalkInData({ ...walkInData, collegeName: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-black/60 border border-white/30 text-white rounded focus:border-amber-400 focus:outline-none placeholder:text-gray-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/20">
                <button
                  type="button"
                  onClick={() => setShowWalkInForm(false)}
                  className="px-5 py-2.5 border border-white/30 text-gray-300 hover:text-white hover:bg-white/10 font-mono uppercase text-xs sm:text-sm tracking-wider rounded transition-colors cursor-pointer"
                >
                  [ CANCEL ]
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-amber-400 text-black font-mono font-bold uppercase text-xs sm:text-sm tracking-wider rounded hover:bg-amber-300 transition-colors disabled:opacity-50 cursor-pointer shadow-lg"
                >
                  {submitting ? "[ ADDING... ]" : "[ CONFIRM WALK-IN ]"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hardware API Modal */}
      {showApiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-2xl p-6 sm:p-8 rounded border border-white/30 bg-black font-mono text-sm max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b border-white/20 pb-4">
              <h2 className="font-mono text-xl font-bold uppercase tracking-wider text-white">
                {">_"} ESP Hardware Endpoint
              </h2>
              <button
                onClick={() => setShowApiModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-gray-400 uppercase text-xs">
                    POST Endpoint URL (Editable)
                  </label>
                  <span className="text-[11px] text-gray-500 font-mono">
                    Type or edit freely to copy
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customEndpointUrl || endpointUrl}
                    onChange={(e) => setCustomEndpointUrl(e.target.value)}
                    placeholder="https://your-domain.com/api/technozian/scan"
                    className="w-full px-4 py-2 bg-transparent border border-white/30 text-white rounded focus:border-white focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(customEndpointUrl || endpointUrl);
                      setCopiedUrl(true);
                      setTimeout(() => setCopiedUrl(false), 2000);
                    }}
                    className="px-4 py-2 border border-white text-white hover:bg-white hover:text-black uppercase text-xs tracking-widest rounded flex items-center gap-1 cursor-pointer"
                  >
                    <FaCopy /> {copiedUrl ? "COPIED" : "COPY"}
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setCustomEndpointUrl(`${originUrl}/api/technozian/scan`)}
                    className="text-[11px] px-2 py-1 border border-white/20 text-gray-400 hover:text-white hover:border-white rounded cursor-pointer"
                  >
                    [ Reset to Current Host ]
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomEndpointUrl("http://192.168.1.100:3000/api/technozian/scan")}
                    className="text-[11px] px-2 py-1 border border-white/20 text-gray-400 hover:text-white hover:border-white rounded cursor-pointer"
                  >
                    [ Local Wi-Fi Template ]
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomEndpointUrl("https://rc-nitw.org/api/technozian/scan")}
                    className="text-[11px] px-2 py-1 border border-white/20 text-gray-400 hover:text-white hover:border-white rounded cursor-pointer"
                  >
                    [ rc-nitw.org Live Domain ]
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
                  * Note: When your website is deployed on Vercel or a live domain, this URL automatically updates to your domain. For testing with an ESP locally, replace <code className="text-white">localhost</code> with your computer's local Wi-Fi IP address (e.g. <code className="text-white">http://192.168.x.x:3000</code>) because the ESP cannot reach <code className="text-white">localhost</code>.
                </p>
              </div>

              <div>
                <label className="text-gray-400 block mb-1 uppercase text-xs">
                  Header: x-api-key
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={apiKey}
                    className="w-full px-4 py-2 bg-transparent border border-white/30 text-white rounded select-all"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(apiKey);
                      setCopiedKey(true);
                      setTimeout(() => setCopiedKey(false), 2000);
                    }}
                    className="px-4 py-2 border border-white text-white hover:bg-white hover:text-black uppercase text-xs tracking-widest rounded flex items-center gap-1 cursor-pointer"
                  >
                    <FaCopy /> {copiedKey ? "COPIED" : "COPY"}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-gray-400 block mb-1 uppercase text-xs">
                  JSON Body Format
                </label>
                <pre className="p-4 bg-white/5 border border-white/20 rounded text-gray-300 text-xs overflow-x-auto">
{`{
  "rollNo": "23BCS042",
  "rfidUid": "A3F291B0",
  "deviceId": "BOX_1"
}`}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-6 mt-6 border-t border-white/20">
              <button
                onClick={() => setShowApiModal(false)}
                className="px-6 py-2 border border-white text-white hover:bg-white hover:text-black uppercase text-sm tracking-widest rounded transition-colors"
              >
                [ CLOSE ]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
