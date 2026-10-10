"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  FaTimes,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaExclamationCircle,
  FaSpinner,
} from "react-icons/fa";

export default function ChangeCredentialsModal({ isOpen, onClose, session }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("self"); // "self" or "addsec" (for admin)
  const [targetDept, setTargetDept] = useState("Software");

  // Form fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Visibility toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const isAdmin = session?.user?.role === "admin";
  const currentUsername = session?.user?.username || "";

  const handleReset = () => {
    setCurrentPassword("");
    setNewUsername("");
    setNewPassword("");
    setConfirmPassword("");
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (activeTab === "self") {
      if (!currentPassword) {
        setErrorMsg("Please enter your current password to verify identity.");
        return;
      }
      if (!newUsername.trim() && !newPassword.trim()) {
        setErrorMsg("Please provide a new User ID or a new Password.");
        return;
      }
    } else {
      // Admin managing AddSec
      if (!newUsername.trim() && !newPassword.trim()) {
        setErrorMsg("Please provide a new User ID or new Password for the selected AddSec.");
        return;
      }
    }

    if (newPassword.trim()) {
      if (newPassword.length < 6) {
        setErrorMsg("New password must be at least 6 characters long.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg("New password and Confirm password do not match.");
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        currentPassword: activeTab === "self" ? currentPassword : undefined,
        newUsername: newUsername.trim() || undefined,
        newPassword: newPassword.trim() || undefined,
        targetDepartment: activeTab === "addsec" ? targetDept : undefined,
      };

      const res = await fetch("/api/auth/change-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!data.success) {
        setErrorMsg(data.message || "Failed to update credentials.");
        return;
      }

      setSuccessMsg(data.message || "Credentials updated successfully!");

      if (activeTab === "self") {
        setTimeout(async () => {
          await signOut({ redirect: false });
          router.push(isAdmin ? "/admin/login" : "/addsecs/login");
          router.refresh();
        }, 1800);
      } else {
        handleReset();
        setSuccessMsg(data.message);
      }
    } catch (err) {
      console.error("Change credentials error:", err);
      setErrorMsg("Something went wrong while updating credentials.");
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div
        className="glass-panel w-full max-w-lg rounded-2xl border border-white/20 bg-black/95 p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.9)] relative overflow-hidden font-mono text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/15 pb-4 mb-6">
          <div>
            <p className="text-[10px] sm:text-xs uppercase tracking-widest text-gray-400 mb-1">
              [ ACCOUNT SECURITY ]
            </p>
            <h2
              className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white"
              style={{ fontFamily: "var(--font-orbitron)" }}
            >
              CHANGE CREDENTIALS
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <FaTimes className="text-base" />
          </button>
        </div>

        {/* Tabs for Admin */}
        {isAdmin && (
          <div className="flex items-center gap-2 mb-6 p-1 rounded-lg border border-white/15 bg-black/60 text-xs">
            <button
              type="button"
              onClick={() => {
                setActiveTab("self");
                handleReset();
              }}
              className={`flex-1 py-2 px-3 rounded transition-all uppercase tracking-wider font-bold cursor-pointer ${
                activeTab === "self"
                  ? "bg-white text-black shadow"
                  : "text-gray-400 hover:text-white bg-transparent"
              }`}
            >
              My Admin Account
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("addsec");
                handleReset();
              }}
              className={`flex-1 py-2 px-3 rounded transition-all uppercase tracking-wider font-bold cursor-pointer ${
                activeTab === "addsec"
                  ? "bg-white text-black shadow"
                  : "text-gray-400 hover:text-white bg-transparent"
              }`}
            >
              Manage AddSec Accounts
            </button>
          </div>
        )}

        {/* Department Selector when Admin manages AddSecs */}
        {isAdmin && activeTab === "addsec" && (
          <div className="mb-5 flex items-center justify-between gap-3 p-3 rounded-lg border border-white/15 bg-white/5">
            <span className="text-xs text-gray-300 uppercase tracking-wider">
              Select Department:
            </span>
            <select
              value={targetDept}
              onChange={(e) => {
                setTargetDept(e.target.value);
                handleReset();
              }}
              className="bg-black border border-white/20 rounded px-3 py-1.5 text-xs text-white focus:border-white focus:outline-none cursor-pointer"
            >
              <option value="Software">Software AddSec</option>
              <option value="Mechanical">Mechanical AddSec</option>
              <option value="Embedded">Embedded AddSec</option>
              <option value="PR">PR AddSec</option>
            </select>
          </div>
        )}

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2 mb-4">
            <FaExclamationCircle className="text-red-400 shrink-0 text-sm" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 mb-4">
            <FaCheckCircle className="text-emerald-400 shrink-0 text-sm" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Current Password (only required when updating own account) */}
          {activeTab === "self" && (
            <div>
              <label className="block text-gray-300 font-semibold mb-1.5 uppercase tracking-wider">
                Current Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full rounded border border-white/20 bg-black/60 px-3.5 py-2.5 text-white placeholder:text-gray-600 focus:border-white focus:outline-none pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showCurrent ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
          )}

          {/* New User ID / Username */}
          <div>
            <label className="block text-gray-300 font-semibold mb-1.5 uppercase tracking-wider">
              New User ID (Username)
            </label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder={
                activeTab === "self"
                  ? `Leave blank to keep current (${currentUsername})`
                  : `Enter new User ID for ${targetDept}`
              }
              className="w-full rounded border border-white/20 bg-black/60 px-3.5 py-2.5 text-white placeholder:text-gray-600 focus:border-white focus:outline-none"
            />
          </div>

          {/* New Password */}
          <div>
            <label className="block text-gray-300 font-semibold mb-1.5 uppercase tracking-wider">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Leave blank to keep existing password"
                className="w-full rounded border border-white/20 bg-black/60 px-3.5 py-2.5 text-white placeholder:text-gray-600 focus:border-white focus:outline-none pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showNew ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          {newPassword.trim() && (
            <div>
              <label className="block text-gray-300 font-semibold mb-1.5 uppercase tracking-wider">
                Confirm New Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full rounded border border-white/20 bg-black/60 px-3.5 py-2.5 text-white placeholder:text-gray-600 focus:border-white focus:outline-none pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/15 mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 rounded border border-white/20 bg-transparent text-gray-300 hover:text-white hover:border-white transition-colors uppercase tracking-widest cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded bg-white hover:bg-gray-200 text-black font-bold uppercase tracking-widest flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin text-sm" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>[ Save Changes ]</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modalContent, document.body);
}
