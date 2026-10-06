"use client";

import React from "react";
import Link from "next/link";
import {
  FaShieldAlt,
  FaUsersCog,
  FaArrowRight,
  FaArrowLeft,
  FaLock,
  FaFileAlt,
  FaCogs,
  FaTable,
} from "react-icons/fa";

export default function InternalGatewayPage() {
  return (
    <div className="relative min-h-screen text-white flex flex-col justify-between pt-28 sm:pt-36 pb-16 px-4 sm:px-6 lg:px-8">
      {/* Background Subtle Gradient Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto w-full space-y-10 relative z-10">
        {/* Header */}
        <div className="text-center space-y-3" data-aos="fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-widest bg-white/10 text-gray-300 border border-white/20">
            <FaLock className="text-[10px] text-amber-400" />
            <span>Authorized Personnel Only</span>
          </div>

          <h1 className="font-mono text-3xl sm:text-5xl font-bold tracking-tight text-white flex items-center justify-center gap-3">
            {">_"} INTERNAL_GATEWAY
          </h1>

          <p className="font-mono text-gray-400 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Welcome to the internal administration gateway of the Robotics Club, NIT Warangal.
            Please select your authorized portal to sign in:
          </p>
        </div>

        {/* Portal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Card 1: Admin Portal */}
          <Link
            href="/admin/login"
            className="group glass-panel p-6 sm:p-8 rounded-xl border border-white/20 hover:border-white/60 transition-all duration-300 bg-white/[0.02] hover:bg-white/[0.06] flex flex-col justify-between shadow-xl hover:shadow-[0_0_30px_rgba(255,255,255,0.08)]"
          >
            <div>
              <div className="flex items-center justify-between gap-3 mb-5">
                <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-white/10 text-white border border-white/20">
                  EXECUTIVE // ADMIN
                </span>
                <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <FaShieldAlt className="text-lg text-white" />
                </div>
              </div>

              <h2 className="font-mono text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-2">
                Admin Portal
              </h2>

              <p className="font-mono text-xs sm:text-sm text-gray-400 mt-2 leading-relaxed">
                Centralized management console for overall recruitment configuration, applicant database, and club operations.
              </p>

              <div className="mt-6 pt-5 border-t border-white/10 space-y-2.5 text-xs font-mono text-gray-300">
                <div className="flex items-center gap-2">
                  <FaFileAlt className="text-gray-400 text-xs" />
                  <span>Configure Recruitment Forms &amp; Deadlines</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaTable className="text-gray-400 text-xs" />
                  <span>Master Applicant Database &amp; Analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCogs className="text-gray-400 text-xs" />
                  <span>Department &amp; Account Control</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4">
              <div className="w-full py-3 px-4 rounded bg-white text-black group-hover:bg-gray-200 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md">
                <span>[ Access Admin Login ]</span>
                <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Card 2: Additional Secretary Portal */}
          <Link
            href="/addsecs"
            className="group glass-panel p-6 sm:p-8 rounded-xl border border-white/20 hover:border-white/60 transition-all duration-300 bg-white/[0.02] hover:bg-white/[0.06] flex flex-col justify-between shadow-xl hover:shadow-[0_0_30px_rgba(255,255,255,0.08)]"
          >
            <div>
              <div className="flex items-center justify-between gap-3 mb-5">
                <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-white/10 text-white border border-white/20">
                  DEPARTMENTS // ADDSEC
                </span>
                <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <FaUsersCog className="text-lg text-emerald-400" />
                </div>
              </div>

              <h2 className="font-mono text-2xl font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-2">
                AddSec Portal
              </h2>

              <p className="font-mono text-xs sm:text-sm text-gray-400 mt-2 leading-relaxed">
                Department evaluation terminal for Software, Mechanical, Embedded, and PR Additional Secretaries.
              </p>

              <div className="mt-6 pt-5 border-t border-white/10 space-y-2.5 text-xs font-mono text-gray-300">
                <div className="flex items-center gap-2">
                  <FaTable className="text-emerald-400 text-xs" />
                  <span>Review Department Submissions</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaFileAlt className="text-emerald-400 text-xs" />
                  <span>Assign Scores, Remarks &amp; Verdicts</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCogs className="text-emerald-400 text-xs" />
                  <span>Export Department Entries to Excel (.xlsx)</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4">
              <div className="w-full py-3 px-4 rounded bg-white text-black group-hover:bg-gray-200 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md">
                <span>[ Access AddSec Login ]</span>
                <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>

        {/* Back to Public Site */}
        <div className="text-center pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-xs text-gray-400 hover:text-white transition-colors underline underline-offset-4"
          >
            <FaArrowLeft className="text-[10px]" />
            <span>[ Return to Main Website ]</span>
          </Link>
        </div>
      </div>

      {/* Footer Notice */}
      <div className="text-center pt-10 text-gray-600 font-mono text-[11px] relative z-10">
        Robotics Club NITW &bull; Internal Systems Gateway &bull; Restricted Access
      </div>
    </div>
  );
}
