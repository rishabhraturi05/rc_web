"use client";

import React from "react";

export default function EmergencyButton({ onClick, disabled = false }) {
  return (
    <div className="relative flex flex-col items-center justify-center p-4 font-vcr">
      <div className="emergency-button-container">
        <button
          type="button"
          disabled={disabled}
          onClick={onClick}
          className={`emergency-btn-3d-active emergency-pulse-glow group ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          aria-label="Register Button"
        >
          {/* Glass Dome Highlight */}
          <div className="absolute inset-2 rounded-full border-2 border-white/20 pointer-events-none" />

          {/* Button Label */}
          <div className="relative z-10 text-center px-2">
            <span className="block text-white text-base sm:text-lg font-black tracking-wider leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              REGISTER
            </span>
          </div>
        </button>
      </div>

      <div className="mt-3 text-center">
        <span className="text-xs text-red-400 font-bold tracking-widest glow-red animate-pulse">
          PRESS TO TRANSMIT CREWMATE DATA
        </span>
      </div>
    </div>
  );
}
