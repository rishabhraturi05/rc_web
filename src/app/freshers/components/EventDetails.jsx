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
              Open exclusively to all branches 2026 first-year NIT Warangal students.
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
          <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-y-4 sm:gap-y-6 gap-x-4 text-white font-mono text-xs sm:text-sm">
            <div className="text-yellow-400 font-bold sm:font-normal">BOARD THE SHIP:</div>
            <div className="text-gray-300">Swipe your ID at the airlock and dive straight into fast-paced tech quizzes, mini-games, and logic puzzles. Only the top-performing squads will advance to the 2nd round.</div>
            <div className="text-green-400 font-bold sm:font-normal">AMONG US:</div>
            <div className="text-gray-300">You will be secretly assigned as a hardworking Crewmate or an Impostor. This round has 8 tasks to be completed in 20 minutes</div>
            <div className="text-red-400 font-bold sm:font-normal">CREWMATE MISSION:</div>
            <div className="text-gray-300">Run around the station fixing broken hardware and solving hands-on tech puzzles to keep the ship flying. Zero prior engineering experience needed!</div>
            <div className="text-cyan-400 font-bold sm:font-normal">IMPOSTOR MISSION:</div>
            <div className="text-gray-300">Secretly "eliminate" Crewmates and trigger massive system sabotages to cause chaos—all while pretending to be fixing things.</div>
            <div className="text-orange-400 font-bold sm:font-normal">EMERGENCY MEETING:</div>
            <div className="text-gray-300">Found a downed crewmate or hit the big red button? All gameplay pauses. The squad gathers to debate, point fingers, and vote to eject the Impostor out the airlock!</div>
          </div>
        </div>
      </div>
    </section>
  );
}
