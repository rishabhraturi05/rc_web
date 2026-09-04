"use client";

import React from "react";
import { CrewmateSprite } from "./FloatingCrewmates";

export default function ProgressCrewmate({ progress = 0, label = "TASK PROGRESS" }) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="w-full max-w-xl mx-auto my-4 font-vcr">
      <div className="flex items-center justify-between text-xs text-green-400 font-bold mb-1.5 px-1">
        <span>{label}</span>
        <span>{clampedProgress}%</span>
      </div>

      <div className="relative w-full h-7 bg-gray-950 rounded-lg border-2 border-green-500/60 overflow-visible p-1 shadow-[0_0_15px_rgba(46,204,113,0.2)]">
        {/* Progress Bar Fill */}
        <div
          className="h-full bg-gradient-to-r from-green-600 to-emerald-400 rounded transition-all duration-500 ease-out relative"
          style={{ width: `${clampedProgress}%` }}
        >
          {/* Subtle Scanlines on Bar */}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[length:4px_100%]" />
        </div>

        {/* Crewmate Runner on Top of Progress Bar */}
        <div
          className="absolute -top-7 transition-all duration-500 ease-out transform -translate-x-1/2 pointer-events-none"
          style={{ left: `${Math.max(5, Math.min(95, clampedProgress))}%` }}
        >
          <CrewmateSprite color="#2ecc71" size={28} />
        </div>
      </div>
    </div>
  );
}
