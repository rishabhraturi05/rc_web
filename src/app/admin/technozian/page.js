"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
} from "react-icons/fa";
import * as XLSX from "xlsx";

const BRANCHES = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "CHEM", "META", "BIOTECH", "Other"];

const emptyForm = {
  rollNo: "",
  name: "",
  rfidUid: "",
  branch: "",
  year: "1st",
  contactNo: "",
  email: "",
  notes: "",
};

export default function AdminTechnozian() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [registrations, setRegistrations] = useState([]);
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    scannedToday: 0,
    totalAttended: 0,
    rfidScans: 0,
    manualEntries: 0,
    recycleBinCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("all"); // 'all' | 'attended' | 'bin'
  const [search, setSearch] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showWalkInForm, setShowWalkInForm] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [customEndpointUrl, setCustomEndpointUrl] = useState("");

  const fetchRegistrations = useCallback(async (isPolling = false) => {
    try {
      if (!isPolling) setLoading(true);
      const res = await fetch("/api/admin/technozian");
      const data = await res.json();

      if (!data.success && res.status === 401) {
        router.push("/admin/login");
        return;
      }

      if (data.success) {
        setRegistrations(data.data || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      if (!isPolling) setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated" || session?.user?.role !== "admin") {
      router.push("/admin/login");
      return;
    }
    fetchRegistrations();
  }, [status, session, router, fetchRegistrations]);

  // Live polling for hardware card taps
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchRegistrations(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchRegistrations]);

  const filteredList = useMemo(() => {
    let list = registrations;
    if (viewMode === "all") list = list.filter((r) => !r.isDeleted);
    else if (viewMode === "attended") list = list.filter((r) => !r.isDeleted && r.attended);
    else if (viewMode === "bin") list = list.filter((r) => r.isDeleted);

    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (r) =>
        (r.rollNo && r.rollNo.toLowerCase().includes(q)) ||
        (r.name && r.name.toLowerCase().includes(q)) ||
        (r.rfidUid && r.rfidUid.toLowerCase().includes(q)) ||
        (r.branch && r.branch.toLowerCase().includes(q)) ||
        (r.deviceId && r.deviceId.toLowerCase().includes(q))
    );
  }, [registrations, viewMode, search]);

  const handleToggleAttended = async (id, currentVal) => {
    try {
      setUpdatingId(id);
      const res = await fetch(`/api/admin/technozian/${id}`, {
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
        }));
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
    if (!window.confirm("Move this entry to the recycle bin?")) return;
    try {
      setDeletingId(id);
      const res = await fetch(`/api/admin/technozian/${id}`, { method: "DELETE" });
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
      const res = await fetch(`/api/admin/technozian/${id}`, {
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
    if (!window.confirm("Permanently delete this entry? This cannot be undone.")) return;
    try {
      setDeletingId(id);
      const res = await fetch(`/api/admin/technozian/${id}?permanent=true`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setRegistrations((prev) => prev.filter((r) => r._id !== id));
        setStats((prev) => ({
          ...prev,
          recycleBinCount: Math.max(0, prev.recycleBinCount - 1),
        }));
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
    if (!formData.rollNo.trim()) {
      alert("Roll number is required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/technozian", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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
        setFormData(emptyForm);
        setShowWalkInForm(false);
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
      "Roll No",
      "RFID UID",
      "Name",
      "Branch",
      "Year",
      "Contact No",
      "Email",
      "Source",
      "Device ID",
      "Scan Count",
      "Attended",
      "Scanned At",
    ];

    const rows = filteredList.map((r) => [
      r.rollNo || "",
      r.rfidUid || "",
      r.name || "",
      r.branch || "",
      r.year || "",
      r.contactNo || "",
      r.email || "",
      r.isManual ? "Manual Walk-in" : "RFID Scan",
      r.deviceId || "BOX_1",
      r.scanCount || 1,
      r.attended ? "YES" : "NO",
      r.lastScannedAt ? new Date(r.lastScannedAt).toLocaleString() : "",
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Technozian_Registrations");
    XLSX.writeFile(
      workbook,
      `Technozian_Registrations_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  const originUrl = typeof window !== "undefined" ? window.location.origin : "";
  const endpointUrl = customEndpointUrl || (originUrl ? `${originUrl}/api/technozian/scan` : "/api/technozian/scan");
  const apiKey = "rc_technozian_rfid_2025";

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      router.push("/admin/login");
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  if (status === "loading") {
    return (
      <div className="relative min-h-screen text-white flex items-center justify-center">
        <p className="font-mono text-gray-300 text-lg animate-pulse">Loading[...]_</p>
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
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white font-mono text-sm mb-3 transition-colors cursor-pointer"
              >
                <FaArrowLeft size={12} /> Back to Admin Panel
              </Link>
              <h1 className="font-mono text-4xl sm:text-5xl font-bold tracking-tight mb-2 text-white">
                {">_"} TECHNOZIAN_REGISTRATION
              </h1>
              <p className="font-mono text-gray-300 text-lg">
                Manage RFID smart-box scanner entries and walk-ins
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center gap-2 px-5 py-2 border rounded font-mono uppercase text-sm tracking-widest cursor-pointer transition-colors ${
                  autoRefresh
                    ? "border-white bg-white text-black"
                    : "border-white text-white bg-transparent hover:bg-white hover:text-black"
                }`}
                title="Toggle Real-Time Polling (every 4s)"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    autoRefresh ? "bg-black animate-ping" : "bg-gray-400"
                  }`}
                />
                [ LIVE SYNC: {autoRefresh ? "ON" : "OFF"} ]
              </button>
              <button
                onClick={() => setShowApiModal(true)}
                className="flex items-center gap-2 px-5 py-2 border border-white text-white bg-transparent rounded hover:bg-white hover:text-black transition-colors font-mono uppercase text-sm tracking-widest cursor-pointer"
              >
                <FaMicrochip /> [ HARDWARE API ]
              </button>
              <button
                onClick={handleDownloadExcel}
                className="flex items-center gap-2 px-5 py-2 border border-white text-white bg-transparent rounded hover:bg-white hover:text-black transition-colors font-mono uppercase text-sm tracking-widest cursor-pointer"
              >
                <FaDownload /> [ DOWNLOAD ]
              </button>
              <button
                onClick={() => setShowWalkInForm(true)}
                className="flex items-center gap-2 px-5 py-2 border border-white text-white bg-transparent rounded hover:bg-white hover:text-black transition-colors font-mono uppercase text-sm tracking-widest cursor-pointer"
              >
                <FaPlus /> [ + WALK-IN ]
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-transparent border border-white text-white font-mono rounded hover:bg-white hover:text-black transition-colors uppercase text-sm tracking-widest cursor-pointer"
              >
                [ LOGOUT ]
              </button>
            </div>
          </div>

          {/* Stats Cards - matching Freshers style exactly */}
          <div className="grid sm:grid-cols-4 gap-4 mb-8">
            <div className="glass-panel p-6 text-center">
              <p className="font-mono text-gray-400 text-sm mb-1 uppercase tracking-wider">
                Total Registered
              </p>
              <p className="font-mono text-4xl text-white">{stats.totalRegistrations}</p>
            </div>
            <div className="glass-panel p-6 text-center">
              <p className="font-mono text-gray-400 text-sm mb-1 uppercase tracking-wider">
                Attended
              </p>
              <p className="font-mono text-4xl text-white">{stats.totalAttended}</p>
            </div>
            <div className="glass-panel p-6 text-center">
              <p className="font-mono text-gray-400 text-sm mb-1 uppercase tracking-wider">
                RFID Box Scans
              </p>
              <p className="font-mono text-4xl text-white">{stats.rfidScans}</p>
            </div>
            <div className="glass-panel p-6 text-center">
              <p className="font-mono text-gray-400 text-sm mb-1 uppercase tracking-wider">
                Walk-in Entries
              </p>
              <p className="font-mono text-4xl text-white">{stats.manualEntries}</p>
            </div>
          </div>

          {/* Tabs - matching Freshers style exactly */}
          <div className="flex gap-6 mb-6 border-b border-white/20 pb-4 overflow-x-auto font-mono text-sm uppercase tracking-wider">
            <button
              onClick={() => setViewMode("all")}
              className={`whitespace-nowrap pb-2 cursor-pointer ${
                viewMode === "all"
                  ? "text-white border-b-2 border-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              All Scans ({stats.totalRegistrations})
            </button>
            <button
              onClick={() => setViewMode("attended")}
              className={`whitespace-nowrap pb-2 cursor-pointer ${
                viewMode === "attended"
                  ? "text-white border-b-2 border-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Attended ({stats.totalAttended})
            </button>
            <button
              onClick={() => setViewMode("bin")}
              className={`whitespace-nowrap pb-2 cursor-pointer ${
                viewMode === "bin"
                  ? "text-white border-b-2 border-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Recycle Bin ({stats.recycleBinCount})
            </button>
          </div>

          {/* Search bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
            <input
              type="text"
              placeholder="Search roll numbers, names, RFID UIDs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-md px-4 py-2 bg-transparent border border-white/20 text-white font-mono rounded focus:border-white focus:outline-none transition-colors"
            />
            <button
              onClick={() => fetchRegistrations(false)}
              className="px-4 py-2 bg-transparent border border-white/30 text-white font-mono rounded hover:bg-white hover:text-black transition-colors uppercase text-xs tracking-widest flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <FaSync className={loading ? "animate-spin" : ""} /> [ REFRESH ]
            </button>
          </div>

          {/* Table */}
          <div className="glass-panel overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/20 font-mono text-sm uppercase tracking-wider text-gray-400">
                  <th className="p-4">#</th>
                  <th className="p-4">Roll No</th>
                  <th className="p-4">Name & Branch</th>
                  <th className="p-4">Source / Device</th>
                  <th className="p-4">RFID UID</th>
                  <th className="p-4">Scan Count</th>
                  <th className="p-4">Last Scanned</th>
                  <th className="p-4 text-center">Attended</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 font-mono text-sm">
                {loading && registrations.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-gray-400">
                      Loading registrations...
                    </td>
                  </tr>
                ) : filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-gray-500">
                      No registrations found.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((item, idx) => (
                    <tr key={item._id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 text-gray-500">{idx + 1}</td>
                      <td className="p-4 font-bold text-white tracking-wider">
                        {item.rollNo}
                      </td>
                      <td className="p-4">
                        <div className="text-white">
                          {item.name || <span className="text-gray-500 italic">Not set</span>}
                        </div>
                        <div className="text-xs text-gray-400">
                          {item.branch ? `${item.branch} • ${item.year || "1st"}` : "-"}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-xs px-2 py-1 rounded border border-white/20 text-gray-300">
                          {item.isManual ? "MANUAL" : item.deviceId || "BOX_1"}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400">
                        {item.rfidUid || "-"}
                      </td>
                      <td className="p-4 text-gray-300">
                        {item.scanCount || 1}x
                      </td>
                      <td className="p-4 text-gray-400 text-xs">
                        {item.lastScannedAt
                          ? new Date(item.lastScannedAt).toLocaleString([], {
                              dateStyle: "short",
                              timeStyle: "short",
                            })
                          : "-"}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleAttended(item._id, item.attended)}
                          disabled={updatingId === item._id}
                          className={`px-3 py-1 rounded text-xs font-mono uppercase tracking-widest cursor-pointer transition-colors border ${
                            item.attended
                              ? "border-white bg-white text-black"
                              : "border-white/30 text-gray-400 hover:border-white hover:text-white"
                          }`}
                        >
                          {item.attended ? "YES" : "NO"}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        {item.isDeleted ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleRestore(item._id)}
                              disabled={updatingId === item._id}
                              className="px-2 py-1 border border-white/40 text-gray-300 hover:text-white hover:border-white rounded text-xs cursor-pointer"
                            >
                              Restore
                            </button>
                            <button
                              onClick={() => handlePermanentDelete(item._id)}
                              disabled={deletingId === item._id}
                              className="px-2 py-1 border border-white/40 text-gray-300 hover:bg-white hover:text-black rounded text-xs cursor-pointer"
                            >
                              Purge
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleDelete(item._id)}
                            disabled={deletingId === item._id}
                            className="text-gray-400 hover:text-white transition-colors cursor-pointer p-1"
                            title="Move to Bin"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Walk-in Form Modal - matching Freshers modal design */}
      {showWalkInForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-xl p-8 rounded border border-white/30 bg-black max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b border-white/20 pb-4">
              <h2 className="font-mono text-xl font-bold uppercase tracking-wider text-white">
                {">_"} Add Walk-in Entry
              </h2>
              <button
                onClick={() => setShowWalkInForm(false)}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes size={18} />
              </button>
            </div>

            <form onSubmit={handleWalkInSubmit} className="space-y-4 font-mono text-sm">
              <div>
                <label className="block text-gray-400 mb-1">ROLL NO *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 23BCS042"
                  value={formData.rollNo}
                  onChange={(e) =>
                    setFormData({ ...formData, rollNo: e.target.value.toUpperCase() })
                  }
                  className="w-full px-4 py-2 bg-transparent border border-white/30 text-white rounded focus:border-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1">STUDENT NAME</label>
                  <input
                    type="text"
                    placeholder="Full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-transparent border border-white/30 text-white rounded focus:border-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">RFID UID</label>
                  <input
                    type="text"
                    placeholder="Card UID (Optional)"
                    value={formData.rfidUid}
                    onChange={(e) =>
                      setFormData({ ...formData, rfidUid: e.target.value.toUpperCase() })
                    }
                    className="w-full px-4 py-2 bg-transparent border border-white/30 text-white rounded focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1">BRANCH</label>
                  <select
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full px-4 py-2 bg-black border border-white/30 text-white rounded focus:border-white focus:outline-none"
                  >
                    <option value="">Select Branch</option>
                    {BRANCHES.map((b) => (
                      <option key={b} value={b} className="bg-black text-white">
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">YEAR</label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-4 py-2 bg-black border border-white/30 text-white rounded focus:border-white focus:outline-none"
                  >
                    <option value="1st" className="bg-black text-white">1st Year</option>
                    <option value="2nd" className="bg-black text-white">2nd Year</option>
                    <option value="3rd" className="bg-black text-white">3rd Year</option>
                    <option value="4th" className="bg-black text-white">4th Year</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1">PHONE NUMBER</label>
                  <input
                    type="text"
                    placeholder="Contact No"
                    value={formData.contactNo}
                    onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })}
                    className="w-full px-4 py-2 bg-transparent border border-white/30 text-white rounded focus:border-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">EMAIL</label>
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 bg-transparent border border-white/30 text-white rounded focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">NOTES</label>
                <input
                  type="text"
                  placeholder="Optional remarks"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 bg-transparent border border-white/30 text-white rounded focus:border-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/20">
                <button
                  type="button"
                  onClick={() => setShowWalkInForm(false)}
                  className="px-5 py-2 border border-white/30 text-white hover:bg-white hover:text-black font-mono uppercase text-sm tracking-widest rounded transition-colors"
                >
                  [ CANCEL ]
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-white text-black font-mono uppercase text-sm tracking-widest rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {submitting ? "[ ADDING... ]" : "[ SUBMIT ]"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hardware API Modal */}
      {showApiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-2xl p-8 rounded border border-white/30 bg-black font-mono text-sm max-h-[90vh] overflow-y-auto">
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
