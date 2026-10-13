"use client";

import React, { useState, useMemo } from "react";
import {
  FaTimes,
  FaCheck,
  FaCheckCircle,
  FaEye,
  FaLaptopCode,
  FaCogs,
  FaMicrochip,
  FaBullhorn,
  FaChevronUp,
  FaChevronDown,
  FaUserClock,
  FaClock,
  FaUser,
  FaHistory,
  FaTrash,
  FaUndo,
} from "react-icons/fa";
import { formatTimeSlot } from "@/app/lib/recruitment";

export const QUEUE_DEPARTMENTS = [
  {
    name: "Software",
    icon: FaLaptopCode,
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    activeColor: "border-blue-400 bg-blue-950/40 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.3)]",
    dotColor: "bg-blue-400",
  },
  {
    name: "Mechanical",
    icon: FaCogs,
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    activeColor: "border-amber-400 bg-amber-950/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]",
    dotColor: "bg-amber-400",
  },
  {
    name: "Embedded",
    icon: FaMicrochip,
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    activeColor: "border-emerald-400 bg-emerald-950/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]",
    dotColor: "bg-emerald-400",
  },
  {
    name: "PR",
    icon: FaBullhorn,
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    activeColor: "border-purple-400 bg-purple-950/40 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]",
    dotColor: "bg-purple-400",
  },
];

export default function InterviewQueuePanel({
  isOpen,
  onClose,
  applications = [],
  groupedApplications = [],
  onRemoveFromQueue, // (appId, markDone: boolean) => void
  onReorderQueue,    // (dept, newItems) => void
  onOpenReviewModal, // (candidateGroup, deptAppId) => void
  loadingActionId,
}) {
  const [activeTab, setActiveTab] = useState("All");
  const [showHistory, setShowHistory] = useState(false);

  // Group applications currently in queue by department
  const queuedByDept = useMemo(() => {
    const map = {
      Software: [],
      Mechanical: [],
      Embedded: [],
      PR: [],
    };

    applications.forEach((app) => {
      if (app.interviewStatus === "in_queue") {
        const dept = app.queueDepartment || app.department || "Software";
        if (map[dept]) {
          map[dept].push(app);
        } else {
          // If department name slightly differs, match or put in Software
          const matchedKey = Object.keys(map).find(
            (k) => k.toLowerCase() === dept.toLowerCase()
          );
          if (matchedKey) {
            map[matchedKey].push(app);
          } else {
            map.Software.push(app);
          }
        }
      }
    });

    // Sort each queue by queueOrder asc, then queueAddedAt asc, then createdAt asc
    Object.keys(map).forEach((k) => {
      map[k].sort((a, b) => {
        const orderA = a.queueOrder !== undefined ? a.queueOrder : 0;
        const orderB = b.queueOrder !== undefined ? b.queueOrder : 0;
        if (orderA !== orderB) return orderA - orderB;

        const timeA = a.queueAddedAt ? new Date(a.queueAddedAt).getTime() : new Date(a.createdAt).getTime();
        const timeB = b.queueAddedAt ? new Date(b.queueAddedAt).getTime() : new Date(b.createdAt).getTime();
        return timeA - timeB;
      });
    });

    return map;
  }, [applications]);

  // Completed interviews list
  const completedInterviews = useMemo(() => {
    return applications
      .filter((app) => app.interviewStatus === "completed")
      .sort((a, b) => {
        const timeA = a.interviewCompletedAt ? new Date(a.interviewCompletedAt).getTime() : new Date(a.updatedAt || a.createdAt).getTime();
        const timeB = b.interviewCompletedAt ? new Date(b.interviewCompletedAt).getTime() : new Date(b.updatedAt || b.createdAt).getTime();
        return timeB - timeA;
      });
  }, [applications]);

  const totalInQueue = useMemo(() => {
    return (
      queuedByDept.Software.length +
      queuedByDept.Mechanical.length +
      queuedByDept.Embedded.length +
      queuedByDept.PR.length
    );
  }, [queuedByDept]);

  // Find candidate group for modal opening
  const findGroupForApp = (app) => {
    return groupedApplications.find((g) =>
      g.deptApplications.some((d) => d._id === app._id)
    );
  };

  const handleMove = (dept, index, direction) => {
    const list = [...(queuedByDept[dept] || [])];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    if (onReorderQueue) {
      onReorderQueue(dept, list);
    }
  };

  const formatWaitingDuration = (addedAt) => {
    if (!addedAt) return null;
    const diffMs = Date.now() - new Date(addedAt).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just added";
    if (diffMins < 60) return `${diffMins}m waiting`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ${diffMins % 60}m waiting`;
  };

  return (
    <div className="glass-panel border border-cyan-500/40 rounded-2xl bg-black/85 backdrop-blur-xl shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col h-full max-h-[calc(100vh-140px)] sticky top-24 overflow-hidden">
      {/* Top Header */}
      <div className="p-4 border-b border-white/15 bg-white/[0.03] flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 block animate-ping absolute -top-0.5 -right-0.5" />
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300">
              <FaUserClock className="text-sm" />
            </div>
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold tracking-wider text-white uppercase flex items-center gap-2">
              <span>INTERVIEW QUEUE</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 border border-cyan-400/40 text-cyan-300">
                {totalInQueue} Waiting
              </span>
            </h3>
            <p className="font-mono text-[10px] text-gray-400">
              Track next applicants per department
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer text-gray-400 hover:text-white p-1.5 rounded-lg border border-white/10 hover:border-white/30 bg-white/5 transition-colors"
          title="Close Queue Panel"
        >
          <FaTimes className="text-xs" />
        </button>
      </div>

      {/* Department Tabs Bar */}
      <div className="p-2 border-b border-white/10 bg-black/40 shrink-0">
        <div className="grid grid-cols-5 gap-1 font-mono text-[11px]">
          <button
            type="button"
            onClick={() => setActiveTab("All")}
            className={`py-1.5 px-1 text-center rounded transition-all cursor-pointer font-bold ${
              activeTab === "All"
                ? "bg-white/15 text-white border border-white/30 shadow-sm"
                : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
            }`}
          >
            All ({totalInQueue})
          </button>

          {QUEUE_DEPARTMENTS.map((dept) => {
            const count = queuedByDept[dept.name]?.length || 0;
            const isTabActive = activeTab === dept.name;
            const Icon = dept.icon;

            return (
              <button
                key={dept.name}
                type="button"
                onClick={() => setActiveTab(dept.name)}
                className={`py-1.5 px-1 text-center rounded transition-all cursor-pointer font-bold flex flex-col items-center gap-0.5 ${
                  isTabActive
                    ? dept.activeColor + " border"
                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
                title={`${dept.name} Queue`}
              >
                <div className="flex items-center gap-1">
                  <Icon className="text-[10px]" />
                  <span className="truncate">{dept.name.slice(0, 4)}</span>
                </div>
                <span
                  className={`text-[9px] px-1 rounded-full font-bold ${
                    count > 0 ? dept.badgeColor + " border" : "text-gray-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Queue Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 font-mono text-xs custom-scrollbar">
        {activeTab === "All" ? (
          // All 4 Department Queues
          QUEUE_DEPARTMENTS.map((dept) => {
            const list = queuedByDept[dept.name] || [];
            const Icon = dept.icon;

            return (
              <div
                key={dept.name}
                className="rounded-xl border border-white/15 bg-white/[0.02] p-3 space-y-2.5"
              >
                {/* Department Header */}
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${dept.dotColor}`} />
                    <Icon className="text-gray-300 text-xs" />
                    <span className="font-bold text-white uppercase text-xs">
                      {dept.name} Queue
                    </span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${dept.badgeColor} font-bold`}>
                    {list.length} waiting
                  </span>
                </div>

                {/* Candidates List */}
                {list.length === 0 ? (
                  <div className="py-4 text-center text-gray-500 text-[11px] italic">
                    Queue is empty. Click "+ Queue" on an applicant.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {list.map((app, idx) => (
                      <QueueCard
                        key={app._id}
                        app={app}
                        index={idx}
                        deptName={dept.name}
                        isFirst={idx === 0}
                        isLast={idx === list.length - 1}
                        onRemove={onRemoveFromQueue}
                        onMove={(dir) => handleMove(dept.name, idx, dir)}
                        onReview={() => {
                          const grp = findGroupForApp(app);
                          if (grp && onOpenReviewModal) onOpenReviewModal(grp, app._id);
                        }}
                        loadingActionId={loadingActionId}
                        waitingText={formatWaitingDuration(app.queueAddedAt)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          // Specific Department Queue
          (() => {
            const dept = QUEUE_DEPARTMENTS.find((d) => d.name === activeTab) || QUEUE_DEPARTMENTS[0];
            const list = queuedByDept[dept.name] || [];
            const Icon = dept.icon;

            return (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-white/10 bg-white/[0.03]">
                  <div className="flex items-center gap-2">
                    <Icon className="text-sm text-cyan-400" />
                    <span className="font-bold text-white text-sm uppercase">
                      {dept.name} Department
                    </span>
                  </div>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full border ${dept.badgeColor} font-bold`}>
                    {list.length} in line
                  </span>
                </div>

                {list.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-xs rounded-xl border border-white/10 bg-white/[0.02] space-y-2">
                    <p className="text-gray-300 font-bold">Queue is currently empty</p>
                    <p className="text-[11px] text-gray-500">
                      Add applicants to this queue by clicking the <span className="text-cyan-400">[+ Queue]</span> button in the table.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {list.map((app, idx) => (
                      <QueueCard
                        key={app._id}
                        app={app}
                        index={idx}
                        deptName={dept.name}
                        isFirst={idx === 0}
                        isLast={idx === list.length - 1}
                        onRemove={onRemoveFromQueue}
                        onMove={(dir) => handleMove(dept.name, idx, dir)}
                        onReview={() => {
                          const grp = findGroupForApp(app);
                          if (grp && onOpenReviewModal) onOpenReviewModal(grp, app._id);
                        }}
                        loadingActionId={loadingActionId}
                        waitingText={formatWaitingDuration(app.queueAddedAt)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })()
        )}

        {/* Recently Completed Section Drawer */}
        <div className="pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between text-gray-400 hover:text-white p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] transition-colors cursor-pointer text-[11px]"
          >
            <div className="flex items-center gap-1.5">
              <FaHistory className="text-emerald-400 text-xs" />
              <span>Completed Interviews ({completedInterviews.length})</span>
            </div>
            <span className="text-gray-500 text-[10px]">
              {showHistory ? "Hide" : "Show"}
            </span>
          </button>

          {showHistory && (
            <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {completedInterviews.length === 0 ? (
                <p className="text-[10px] text-gray-500 italic p-2 text-center">
                  No completed interviews yet.
                </p>
              ) : (
                completedInterviews.map((app) => {
                  const candidateName =
                    app.responses?.name || app.responses?.fullName || "Candidate";
                  const candidateRoll =
                    app.responses?.rollno || app.responses?.rollNumber || "—";
                  const doneTime = app.interviewCompletedAt
                    ? new Date(app.interviewCompletedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Completed";

                  return (
                    <div
                      key={app._id}
                      className="p-2 rounded-lg border border-emerald-500/20 bg-emerald-950/20 flex items-center justify-between gap-2 text-[10px]"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-gray-200 truncate flex items-center gap-1.5">
                          <FaCheckCircle className="text-emerald-400 shrink-0 text-[10px]" />
                          <span className="truncate">{candidateName}</span>
                        </div>
                        <div className="text-gray-400 text-[9px] mt-0.5">
                          {app.department} • Roll: {candidateRoll} • {doneTime}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            const grp = findGroupForApp(app);
                            if (grp && onOpenReviewModal) onOpenReviewModal(grp, app._id);
                          }}
                          className="cursor-pointer text-blue-400 hover:text-white p-1 rounded bg-blue-950/40 border border-blue-500/30"
                          title="Review responses"
                        >
                          <FaEye className="text-[9px]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveFromQueue(app._id, false)}
                          className="cursor-pointer text-gray-400 hover:text-amber-300 p-1 rounded bg-black/40 border border-white/10 hover:border-amber-400/40"
                          title="Undo / Reset to Pending"
                        >
                          <FaUndo className="text-[9px]" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function QueueCard({
  app,
  index,
  deptName,
  isFirst,
  isLast,
  onRemove,
  onMove,
  onReview,
  loadingActionId,
  waitingText,
}) {
  const candidateName = app.responses?.name || app.responses?.fullName || "Candidate";
  const candidateRoll = app.responses?.rollno || app.responses?.rollNumber || "—";
  const candidateYear = app.year || app.responses?.year || "";
  const slotTime = app.interviewSlot ? formatTimeSlot(app.interviewSlot) : null;
  const isLoading = loadingActionId === app._id;

  return (
    <div
      className={`rounded-xl border transition-all p-3 space-y-2.5 relative ${
        isFirst
          ? "border-emerald-400 bg-emerald-950/30 shadow-[0_0_20px_rgba(16,185,129,0.22)] ring-1 ring-emerald-500/30"
          : "border-white/15 bg-black/60 hover:border-white/30"
      }`}
    >
      {/* Top Tag: Position & Status */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {isFirst ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-black shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
              #1 NOW INTERVIEWING
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-gray-300 border border-white/20">
              #{index + 1} In Line
            </span>
          )}

          {waitingText && (
            <span className="text-[9px] text-gray-400 flex items-center gap-1">
              <FaClock className="text-[8px] text-cyan-400" />
              {waitingText}
            </span>
          )}
        </div>

        {/* Reordering arrows */}
        <div className="flex items-center gap-0.5">
          {!isFirst && (
            <button
              type="button"
              onClick={() => onMove(-1)}
              className="p-1 text-gray-400 hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer"
              title="Move Up"
            >
              <FaChevronUp className="text-[9px]" />
            </button>
          )}
          {!isLast && (
            <button
              type="button"
              onClick={() => onMove(1)}
              className="p-1 text-gray-400 hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer"
              title="Move Down"
            >
              <FaChevronDown className="text-[9px]" />
            </button>
          )}
        </div>
      </div>

      {/* Candidate Details */}
      <div className="space-y-0.5">
        <div className="flex items-start justify-between gap-2">
          <h4
            className={`font-bold truncate text-sm ${
              isFirst ? "text-emerald-200" : "text-white"
            }`}
            title={candidateName}
          >
            {candidateName}
          </h4>
          {candidateYear && (
            <span className="px-1.5 py-0.2 rounded text-[9px] bg-white/10 text-gray-300 border border-white/15 shrink-0">
              {candidateYear}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-gray-400 font-mono">
          <span>Roll: <strong className="text-gray-200">{candidateRoll}</strong></span>
          {slotTime && (
            <span className="text-cyan-300 border border-cyan-500/30 bg-cyan-950/30 px-1 rounded text-[10px]">
              {slotTime}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-1.5">
        {/* Done / Mark Interview Done */}
        <button
          type="button"
          disabled={isLoading}
          onClick={() => onRemove(app._id, true)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-bold text-[11px] tracking-wide transition-all cursor-pointer ${
            isFirst
              ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_12px_rgba(16,185,129,0.4)]"
              : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40"
          }`}
          title="Interview is finished: Mark Interview Done and Remove from Queue"
        >
          <FaCheck className="text-[10px]" />
          <span>Mark Done</span>
        </button>

        {/* Review Candidate */}
        <button
          type="button"
          onClick={onReview}
          className="cursor-pointer flex items-center gap-1 py-1.5 px-2 rounded-lg font-bold text-[11px] bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 transition-colors"
          title="Review applicant responses & evaluate"
        >
          <FaEye className="text-[10px]" />
          <span>Review</span>
        </button>

        {/* Dismiss / Remove from Queue without marking done */}
        <button
          type="button"
          disabled={isLoading}
          onClick={() => onRemove(app._id, false)}
          className="cursor-pointer text-gray-400 hover:text-rose-400 p-1.5 rounded-lg border border-white/10 hover:border-rose-500/30 bg-white/5 hover:bg-rose-950/20 transition-colors"
          title="Remove from queue (without marking done)"
        >
          <FaTimes className="text-[10px]" />
        </button>
      </div>
    </div>
  );
}
