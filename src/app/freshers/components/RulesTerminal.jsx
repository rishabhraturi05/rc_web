"use client";

import React from "react";

export default function RulesTerminal({ rules = [] }) {
  return (
    <section id="rules" className="relative z-10 w-full max-w-4xl mx-auto my-12 px-4 font-vcr">
      <div className="crt-screen crt-scanlines p-6 sm:p-8 bg-gray-950/95 text-white border-2 border-green-500/70 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
        {/* Terminal Header Bar */}
        <div className="flex items-center justify-between border-b-2 border-green-500/50 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
            <h2 className="text-xl sm:text-3xl font-bold text-white tracking-wider glow-white">
              MISSION RULES
            </h2>
          </div>
          <span className="text-xs text-green-500 font-mono">ADMIN DIRECTIVES</span>
        </div>

        {/* Console Prompt */}
        <div className="text-xs text-green-400 mb-4 font-mono">
          &gt; cat /sys/freshers/rules.txt
          <br />
          &gt; LOADING MISSION DIRECTIVES... [OK]
        </div>

        {/* Scrollable Rules Container */}
        <div className="max-h-96 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-green-600 font-mono text-xs sm:text-sm">
          {rules.map((rule, index) => (
            <div
              key={index}
              className="p-3 rounded bg-gray-900/90 border border-gray-800 hover:border-green-500/60 transition-colors"
            >
              <span className="text-gray-200">{rule}</span>
            </div>
          ))}
        </div>

        {/* Terminal Footer Cursor */}
        <div className="mt-4 pt-3 border-t border-gray-800 text-xs text-green-400 flex items-center gap-1 font-mono">
          <span>&gt; END OF DIRECTIVES. AWAITING CREWMATE COMPLIANCE...</span>
          <span className="w-2 h-4 bg-green-400 animate-ping inline-block ml-1" />
        </div>
      </div>
    </section>
  );
}
