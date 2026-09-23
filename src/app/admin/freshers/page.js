"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  FaTrash,
  FaCheck,
  FaChevronDown,
  FaChevronUp,
  FaPlus,
  FaTimes,
  FaArrowLeft,
  FaDownload,
} from "react-icons/fa";
import * as XLSX from "xlsx";

const BRANCHES = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "CHEM", "META", "BIOTECH", "Other"];

const emptyWalkIn = {
  name: "",
  email: "",
  contactNo: "",
  rollNo: "",
  branch: "",
  teamName: "",
  considerRecruitment: false,
};

export default function AdminFreshers() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [teams, setTeams] = useState([]);
  const [stats, setStats] = useState({ totalTeams: 0, totalAttended: 0, totalParticipants: 0 });
  const [viewMode, setViewMode] = useState("all");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedTeam, setExpandedTeam] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [showWalkInForm, setShowWalkInForm] = useState(false);
  const [walkInData, setWalkInData] = useState(emptyWalkIn);
  const [walkInParticipants, setWalkInParticipants] = useState([""]);
  const [submittingWalkIn, setSubmittingWalkIn] = useState(false);

  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/freshers");
      const data = await res.json();

      if (!data.success && res.status === 401) {
        router.push("/admin/login");
        return;
      }

      if (data.success) {
        setTeams(data.data);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated" || session?.user?.role !== "admin") {
      router.push("/admin/login");
      return;
    }
    fetchTeams();
  }, [status, session, router, fetchTeams]);

  const filteredTeams = useMemo(() => {
    let list = teams;
    if (viewMode === "all") list = list.filter(t => !t.isDeleted);
    else if (viewMode === "attended") list = list.filter(t => !t.isDeleted && t.attended);
    else if (viewMode === "bin") list = list.filter(t => t.isDeleted);

    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (t) =>
        t.teamName.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.participants.some((p) => {
          if (typeof p === "object") {
            return (
              p.name?.toLowerCase().includes(q) ||
              p.rollNo?.toLowerCase().includes(q)
            );
          }
          return p.toLowerCase().includes(q);
        })
    );
  }, [teams, search, viewMode]);

  const handleToggleAttended = async (id, current) => {
    try {
      setUpdating(id);
      const res = await fetch(`/api/admin/freshers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attended: !current }),
      });
      const data = await res.json();
      if (data.success) {
        setTeams((prev) =>
          prev.map((t) => (t._id === id ? { ...t, attended: !current } : t))
        );
        setStats((prev) => ({
          ...prev,
          totalAttended: prev.totalAttended + (current ? -1 : 1),
        }));
      } else {
        alert(data.message || "Failed to update");
      }
    } catch {
      alert("Failed to update attendance");
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Move this team to the recycle bin?")) return;
    try {
      setDeleting(id);
      const res = await fetch(`/api/admin/freshers/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setTeams((prev) => prev.map((t) => t._id === id ? { ...t, isDeleted: true } : t));
        const removed = teams.find((t) => t._id === id);
        setStats((prev) => ({
          ...prev,
          totalTeams: prev.totalTeams - 1,
          totalAttended: prev.totalAttended - (removed?.attended ? 1 : 0),
          totalParticipants: prev.totalParticipants - (1 + (removed?.participants?.length || 0))
        }));
      } else {
        alert(data.message || "Failed to move to bin");
      }
    } catch {
      alert("Failed to move to bin");
    } finally {
      setDeleting(null);
    }
  };

  const handlePermanentDelete = async (id) => {
    if (!window.confirm("Permanently delete this team? This cannot be undone.")) return;
    try {
      setDeleting(id);
      const res = await fetch(`/api/admin/freshers/${id}?permanent=true`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setTeams((prev) => prev.filter((t) => t._id !== id));
      } else {
        alert(data.message || "Failed to delete permanently");
      }
    } catch {
      alert("Failed to delete permanently");
    } finally {
      setDeleting(null);
    }
  };

  const handleRestore = async (id) => {
    try {
      setUpdating(id);
      const res = await fetch(`/api/admin/freshers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDeleted: false }),
      });
      const data = await res.json();
      if (data.success) {
        setTeams((prev) => prev.map((t) => t._id === id ? { ...t, isDeleted: false } : t));
        const restored = teams.find((t) => t._id === id);
        setStats((prev) => ({
          ...prev,
          totalTeams: prev.totalTeams + 1,
          totalAttended: prev.totalAttended + (restored?.attended ? 1 : 0),
          totalParticipants: prev.totalParticipants + (1 + (restored?.participants?.length || 0))
        }));
      } else {
        alert(data.message || "Failed to restore");
      }
    } catch {
      alert("Failed to restore team");
    } finally {
      setUpdating(null);
    }
  };

  const handleWalkInSubmit = async (e) => {
    e.preventDefault();
    setSubmittingWalkIn(true);
    try {
      const res = await fetch("/api/admin/freshers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...walkInData, participants: walkInParticipants }),
      });
      const data = await res.json();
      if (data.success) {
        setTeams((prev) => [data.data, ...prev]);
        setStats((prev) => ({ ...prev, totalTeams: prev.totalTeams + 1 }));
        setWalkInData(emptyWalkIn);
        setWalkInParticipants([""]);
        setShowWalkInForm(false);
      } else {
        alert(data.message || "Failed to add walk-in");
      }
    } catch {
      alert("Failed to add walk-in");
    } finally {
      setSubmittingWalkIn(false);
    }
  };

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

  const handleDownloadExcel = () => {
    if (filteredTeams.length === 0) {
      alert("No data to download.");
      return;
    }

    const headers = [
      "Team Name",
      "Leader Name",
      "Email",
      "Contact No",
      "Roll No",
      "Branch",
      "Attended",
      "Is Walk-In",
      "Recruitment Interest",
      "Participant 1",
      "Participant 2",
      "Participant 3",
      "Participant 4",
      "Participant 5"
    ];

    const dataRows = [];

    filteredTeams.forEach((team) => {
      const row = [
        team.teamName,
        team.name,
        team.email,
        team.contactNo,
        team.rollNo,
        team.branch,
        team.attended ? "Yes" : "No",
        team.isWalkIn ? "Yes" : "No",
        team.considerRecruitment ? "Yes" : "No",
      ];
      
      const maxParticipants = 5;
      for (let i = 0; i < maxParticipants; i++) {
        const p = team.participants[i];
        if (p) {
          row.push(typeof p === "object" ? `${p.name || ""} ${p.rollNo || ""}`.trim() : p);
        } else {
          row.push("");
        }
      }

      dataRows.push(row);
    });

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Teams");
    XLSX.writeFile(workbook, `freshers_teams_${viewMode}.xlsx`);
  };

  if (status === "loading" || loading) {
    return (
      <div className="relative min-h-screen text-white flex items-center justify-center pt-24">
        <p className="font-mono text-gray-300 text-lg">Loading...</p>
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <Link href="/admin" className="inline-flex items-center gap-2 text-gray-400 hover:text-white font-mono text-sm mb-3 transition-colors">
                <FaArrowLeft size={12} /> Back to Admin Panel
              </Link>
              <h1 className="font-mono text-4xl sm:text-5xl font-bold tracking-tight mb-2 text-white">
                {">_"} FRESHERS_REGISTRATION
              </h1>
              <p className="font-mono text-gray-300 text-lg">
                Manage registered teams and walk-in entries
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleDownloadExcel}
                className="flex items-center gap-2 px-5 py-2 border border-white text-white bg-transparent rounded hover:bg-white hover:text-black transition-colors font-mono uppercase text-sm tracking-widest"
              >
                <FaDownload /> [ DOWNLOAD ]
              </button>
              <button
                onClick={() => setShowWalkInForm(true)}
                className="flex items-center gap-2 px-5 py-2 border border-white text-white bg-transparent rounded hover:bg-white hover:text-black transition-colors font-mono uppercase text-sm tracking-widest"
              >
                <FaPlus /> [ + WALK-IN ]
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-transparent border border-white text-white font-mono rounded hover:bg-white hover:text-black transition-colors uppercase text-sm tracking-widest"
              >
                [ LOGOUT ]
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div className="glass-panel p-6 text-center">
              <p className="font-mono text-gray-400 text-sm mb-1 uppercase tracking-wider">Total Teams Registered</p>
              <p className="font-mono text-4xl text-white">{stats.totalTeams}</p>
            </div>
            <div className="glass-panel p-6 text-center">
              <p className="font-mono text-gray-400 text-sm mb-1 uppercase tracking-wider">Teams Attended</p>
              <p className="font-mono text-4xl text-white">{stats.totalAttended}</p>
            </div>
            <div className="glass-panel p-6 text-center">
              <p className="font-mono text-gray-400 text-sm mb-1 uppercase tracking-wider">Total Participants</p>
              <p className="font-mono text-4xl text-white">{stats.totalParticipants}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 mb-6 border-b border-white/20 pb-4 overflow-x-auto font-mono text-sm uppercase tracking-wider">
            <button
              onClick={() => setViewMode("all")}
              className={`whitespace-nowrap pb-2 ${viewMode === "all" ? "text-white border-b-2 border-white" : "text-gray-500 hover:text-gray-300"}`}
            >
              All Teams
            </button>
            <button
              onClick={() => setViewMode("attended")}
              className={`whitespace-nowrap pb-2 ${viewMode === "attended" ? "text-white border-b-2 border-white" : "text-gray-500 hover:text-gray-300"}`}
            >
              Attended Teams
            </button>
            <button
              onClick={() => setViewMode("bin")}
              className={`whitespace-nowrap pb-2 ${viewMode === "bin" ? "text-white border-b-2 border-white" : "text-gray-500 hover:text-gray-300"}`}
            >
              Recycle Bin
            </button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by team name or participant name..."
              className="w-full max-w-md px-4 py-3 bg-black/50 border border-white/20 rounded text-white placeholder-gray-500 focus:outline-none focus:border-white transition-all duration-300 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Teams list */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto space-y-4">
          {filteredTeams.length === 0 ? (
            <div className="glass-panel p-8 text-center">
              <p className="font-mono text-gray-300">
                {search ? "No teams match your search." : "No registrations yet."}
              </p>
            </div>
          ) : (
            filteredTeams.map((team) => (
              <div
                key={team._id}
                className={`glass-panel p-5 sm:p-6 transition-all ${
                  team.attended ? "border-white bg-white/5" : "border-white/20"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <button
                        onClick={() =>
                          setExpandedTeam(expandedTeam === team._id ? null : team._id)
                        }
                        className="flex items-center gap-2 font-mono text-xl sm:text-2xl text-white hover:text-cyan-300 transition-colors"
                      >
                        {expandedTeam === team._id ? (
                          <FaChevronUp className="text-cyan-400" />
                        ) : (
                          <FaChevronDown className="text-gray-400" />
                        )}
                        {team.teamName}
                      </button>
                      {team.isWalkIn && (
                        <span className="px-2 py-0.5 bg-yellow-600/20 text-yellow-400 text-xs rounded border border-yellow-600/30 font-mono">
                          Walk-in
                        </span>
                      )}
                      {team.attended && (
                        <span className="px-2 py-0.5 bg-green-600/20 text-green-400 text-xs rounded border border-green-600/30 font-mono">
                          Attended
                        </span>
                      )}
                    </div>

                    <div className="font-mono text-gray-400 text-sm space-y-1">
                      <p>Leader: {team.name} · {team.branch} · {team.rollNo}</p>
                      <p>{team.email} · {team.contactNo}</p>
                      <p>
                        Recruitment interest:{" "}
                        <span className={team.considerRecruitment ? "text-green-400" : "text-gray-500"}>
                          {team.considerRecruitment ? "Yes" : "No"}
                        </span>
                      </p>
                    </div>

                    {expandedTeam === team._id && (
                      <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                        <p className="font-mono text-gray-300 text-sm font-semibold mb-2">
                          Team Members ({team.participants.length})
                        </p>
                        <ul className="space-y-1">
                          {team.participants.map((p, i) => {
                            const label = typeof p === "object" ? `${p.name} ${p.rollNo ? `(${p.rollNo})` : ""}` : p;
                            return (
                              <li key={i} className="font-mono text-white text-sm flex items-center gap-2">
                                <span className="text-cyan-400">•</span> {label}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    {viewMode === "bin" ? (
                      <>
                        <button
                          onClick={() => handleRestore(team._id)}
                          disabled={updating === team._id}
                          className={`p-3 rounded-lg bg-blue-600/30 text-blue-400 border border-blue-600/50 hover:text-blue-300 hover:border-blue-500 transition-all ${
                            updating === team._id ? "opacity-50" : ""
                          }`}
                          title="Restore team"
                        >
                          <FaCheck size={18} />
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(team._id)}
                          disabled={deleting === team._id}
                          className={`p-3 rounded-lg text-red-400 hover:text-red-300 border border-red-800/50 hover:border-red-600/50 transition-all ${
                            deleting === team._id ? "opacity-50" : ""
                          }`}
                          title="Delete permanently"
                        >
                          <FaTrash size={18} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleToggleAttended(team._id, team.attended)}
                          disabled={updating === team._id}
                          title={team.attended ? "Mark as not attended" : "Mark as attended"}
                          className={`p-3 rounded-lg transition-all ${
                            team.attended
                              ? "bg-green-600/30 text-green-400 border border-green-600/50"
                              : "bg-gray-800/60 text-gray-400 border border-gray-600/50 hover:text-green-400 hover:border-green-600/50"
                          } ${updating === team._id ? "opacity-50" : ""}`}
                        >
                          <FaCheck size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(team._id)}
                          disabled={deleting === team._id}
                          className={`p-3 rounded-lg text-red-400 hover:text-red-300 border border-red-800/50 hover:border-red-600/50 transition-all ${
                            deleting === team._id ? "opacity-50" : ""
                          }`}
                          title="Move to bin"
                        >
                          <FaTrash size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Walk-in modal */}
      {showWalkInForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 sm:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowWalkInForm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <FaTimes size={20} />
            </button>
            <h2 className="font-mono text-2xl mb-4">Add Walk-in Team</h2>
            <form onSubmit={handleWalkInSubmit} className="space-y-3 font-mono">
              <input
                placeholder="Team Name *"
                value={walkInData.teamName}
                onChange={(e) => setWalkInData({ ...walkInData, teamName: e.target.value })}
                required
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
              <input
                placeholder="Leader Name *"
                value={walkInData.name}
                onChange={(e) => setWalkInData({ ...walkInData, name: e.target.value })}
                required
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="Email *"
                  type="email"
                  value={walkInData.email}
                  onChange={(e) => setWalkInData({ ...walkInData, email: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
                <input
                  placeholder="Contact *"
                  value={walkInData.contactNo}
                  onChange={(e) => setWalkInData({ ...walkInData, contactNo: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="Roll No *"
                  value={walkInData.rollNo}
                  onChange={(e) => setWalkInData({ ...walkInData, rollNo: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
                <select
                  value={walkInData.branch}
                  onChange={(e) => setWalkInData({ ...walkInData, branch: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                  <option value="">Branch *</option>
                  {BRANCHES.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-400">Participants *</span>
                  <button
                    type="button"
                    onClick={() => setWalkInParticipants((p) => [...p, ""])}
                    className="text-xs text-green-400"
                  >
                    + Add
                  </button>
                </div>
                {walkInParticipants.map((p, i) => (
                  <input
                    key={i}
                    placeholder={`Participant ${i + 1}`}
                    value={p}
                    onChange={(e) =>
                      setWalkInParticipants((prev) =>
                        prev.map((x, j) => (j === i ? e.target.value : x))
                      )
                    }
                    required
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white mb-2"
                  />
                ))}
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={walkInData.considerRecruitment}
                  onChange={(e) =>
                    setWalkInData({ ...walkInData, considerRecruitment: e.target.checked })
                  }
                />
                Consider for recruitment
              </label>
              <button
                type="submit"
                disabled={submittingWalkIn}
                className="w-full py-3 bg-white text-black hover:bg-gray-200 rounded font-bold font-mono uppercase tracking-widest disabled:opacity-50 transition-colors border border-white"
              >
                {submittingWalkIn ? "[ ADDING... ]" : "[ + ADD_WALK-IN_TEAM ]"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
