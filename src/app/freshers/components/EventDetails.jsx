"use client";

import React from "react";

export default function EventDetails({ eventConfig }) {
  return (
    <section id="intel" className="relative z-10 w-full max-w-4xl mx-auto my-10 px-4 font-vcr">
      <div className="crt-screen crt-scanlines p-6 sm:p-8 bg-gray-950/95 text-white border-2 border-yellow-500/60 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
        {/* Intel Header */}
        <div className="border-b-2 border-yellow-500/50 pb-4 mb-6 text-center">
          <div className="inline-block px-3 py-1 bg-yellow-950/80 border border-yellow-500 text-yellow-400 text-xs font-bold rounded mb-2">
            MISSION BRIEFING
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white glow-white tracking-wider">
            EVENT INTEL
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            ROBOTICS CLUB NIT WARANGAL • DEEP SPACE OPERATIONS
          </p>
        </div>

        {/* Mission Description */}
        <div className="p-4 mb-6 rounded-xl bg-gray-900/90 border border-gray-800 text-xs sm:text-sm text-gray-200 leading-relaxed font-sans">
          {eventConfig.description}
        </div>

        {/* Key Parameters Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl border border-yellow-500/40 bg-gray-900/90">
            <div className="text-xs text-yellow-400 font-bold tracking-wider mb-1">
              👥 CREW SQUAD SIZE
            </div>
            <div className="text-sm font-bold text-white">{eventConfig.teamSize}</div>
            <p className="text-[11px] text-gray-400 mt-1 font-sans">
              Form your crew before entry. Solo participants will be merged at registration.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-green-500/40 bg-gray-900/90">
            <div className="text-xs text-green-400 font-bold tracking-wider mb-1">
              🎓 ELIGIBILITY CRITERIA
            </div>
            <div className="text-sm font-bold text-white">{eventConfig.eligibility}</div>
            <p className="text-[11px] text-gray-400 mt-1 font-sans">
              Open exclusively to all batch 2026 first-year NIT Warangal students.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-yellow-500/40 bg-gray-900/90">
            <div className="text-xs text-yellow-400 font-bold tracking-wider mb-1">
              🏆 REWARDS & CERTIFICATES
            </div>
            <div className="text-sm font-bold text-white">{eventConfig.prizes}</div>
            <p className="text-[11px] text-gray-400 mt-1 font-sans">
              Trophies, official RC swag, and certificate of merit for winning crewmates.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-red-500/40 bg-gray-900/90">
            <div className="text-xs text-red-400 font-bold tracking-wider mb-1">
              ⏳ REGISTRATION DEADLINE
            </div>
            <div className="text-sm font-bold text-white">{eventConfig.registrationDeadline}</div>
            <p className="text-[11px] text-gray-400 mt-1 font-sans">
              Slots fill up fast. Submit crewmate data before airlocks close.
            </p>
          </div>
        </div>

        {/* Mission Timeline / Stages */}
        <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/70">
          <div className="text-xs text-yellow-400 font-bold tracking-wider mb-3">
            MISSION STAGES & TASKS
          </div>
          <ul className="space-y-2 text-xs text-gray-200 font-vcr">
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">STAGE 1:</span>
              <span>Card Swipe Registration & ID Verification at AirLock</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">STAGE 2:</span>
              <span>Interactive Hardware & Circuit Task Stations in Task Zone</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400">STAGE 3:</span>
              <span>Impostor Mystery Challenge & Bot Showcase on Main Stage</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400">STAGE 4:</span>
              <span>Emergency Assembly & Prize Distribution Ceremony</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
