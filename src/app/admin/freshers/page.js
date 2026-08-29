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
} from "react-icons/fa";

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
  const [stats, setStats] = useState({ totalTeams: 0, totalAttended: 0 });
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
    if (!search.trim()) return teams;
    const q = search.toLowerCase();
    return teams.filter(
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
  }, [teams, search]);

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
    if (!window.confirm("Delete this entire team from the database? This cannot be undone.")) return;
    try {
      setDeleting(id);
      const res = await fetch(`/api/admin/freshers/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        const removed = teams.find((t) => t._id === id);
        setTeams((prev) => prev.filter((t) => t._id !== id));
        setStats((prev) => ({
          totalTeams: prev.totalTeams - 1,
          totalAttended: prev.totalAttended - (removed?.attended ? 1 : 0),
        }));
      } else {
        alert(data.message || "Failed to delete");
      }
    } catch {
      alert("Failed to delete team");
    } finally {
      setDeleting(null);
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
    await signOut({ redirect: false });
    router.push("/admin/login");
    router.refresh();
  };

  if (status === "loading" || loading) {
    return (
      <div className="relative min-h-screen text-white flex items-center justify-center pt-24">
        <p className="destruct-font text-gray-300 text-lg">Loading...</p>
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
              <Link href="/admin" className="inline-flex items-center gap-2 text-gray-400 hover:text-white destruct-font text-sm mb-3 transition-colors">
                <FaArrowLeft size={12} /> Back to Admin Panel
              </Link>
              <h1 className="batman-font text-4xl sm:text-5xl font-bold tracking-tight mb-2">
                Freshers Registration
              </h1>
              <p className="destruct-font text-gray-300 text-lg">
                Manage registered teams and walk-in entries
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowWalkInForm(true)}
                className="flex items-center gap-2 px-5 py-3 bg-green-700/30 border border-green-600/50 text-green-300 rounded-lg hover:bg-green-700/50 transition-all batman-font text-sm"
              >
                <FaPlus /> Add Walk-in
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 text-white font-semibold rounded-lg transition-all batman-font text-sm"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-900/50 border border-cyan-700/50 rounded-2xl p-6 text-center">
              <p className="destruct-font text-gray-400 text-sm mb-1">Total Teams Registered</p>
              <p className="batman-font text-4xl text-cyan-400">{stats.totalTeams}</p>
            </div>
            <div className="bg-gray-900/50 border border-green-700/50 rounded-2xl p-6 text-center">
              <p className="destruct-font text-gray-400 text-sm mb-1">Teams Attended (Checked In)</p>
              <p className="batman-font text-4xl text-green-400">{stats.totalAttended}</p>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by team name or participant name..."
              className="w-full max-w-md px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 destruct-font"
            />
          </div>
        </div>
      </div>

      {/* Teams list */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto space-y-4">
          {filteredTeams.length === 0 ? (
            <div className="bg-gray-900/50 border border-gray-700/80 rounded-2xl p-8 text-center">
              <p className="destruct-font text-gray-300">
                {search ? "No teams match your search." : "No registrations yet."}
              </p>
            </div>
          ) : (
            filteredTeams.map((team) => (
              <div
                key={team._id}
                className={`bg-gray-900/50 border rounded-2xl p-5 sm:p-6 transition-all ${
                  team.attended ? "border-green-600/60 bg-gray-900/70" : "border-gray-700/80"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <button
                        onClick={() =>
                          setExpandedTeam(expandedTeam === team._id ? null : team._id)
                        }
                        className="flex items-center gap-2 batman-font text-xl sm:text-2xl text-white hover:text-cyan-300 transition-colors"
                      >
                        {expandedTeam === team._id ? (
                          <FaChevronUp className="text-cyan-400" />
                        ) : (
                          <FaChevronDown className="text-gray-400" />
                        )}
                        {team.teamName}
                      </button>
                      {team.isWalkIn && (
                        <span className="px-2 py-0.5 bg-yellow-600/20 text-yellow-400 text-xs rounded border border-yellow-600/30 destruct-font">
                          Walk-in
                        </span>
                      )}
                      {team.attended && (
                        <span className="px-2 py-0.5 bg-green-600/20 text-green-400 text-xs rounded border border-green-600/30 destruct-font">
                          Attended
                        </span>
                      )}
                    </div>

                    <div className="destruct-font text-gray-400 text-sm space-y-1">
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
                        <p className="destruct-font text-gray-300 text-sm font-semibold mb-2">
                          Team Members ({team.participants.length})
                        </p>
                        <ul className="space-y-1">
                          {team.participants.map((p, i) => {
                            const label = typeof p === "object" ? `${p.name} ${p.rollNo ? `(${p.rollNo})` : ""}` : p;
                            return (
                              <li key={i} className="destruct-font text-white text-sm flex items-center gap-2">
                                <span className="text-cyan-400">•</span> {label}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
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
                      title="Delete team"
                    >
                      <FaTrash size={18} />
                    </button>
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
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 sm:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowWalkInForm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <FaTimes size={20} />
            </button>
            <h2 className="batman-font text-2xl mb-4">Add Walk-in Team</h2>
            <form onSubmit={handleWalkInSubmit} className="space-y-3 destruct-font">
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
                className="w-full py-3 bg-green-700 hover:bg-green-600 rounded-lg batman-font disabled:opacity-50"
              >
                {submittingWalkIn ? "Adding..." : "Add Walk-in Team"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
