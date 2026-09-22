"use client";

import React from "react";

export default function EmergencyButton({ onClick, disabled = false, loading = false, label }) {
  const isDisabled = disabled || loading;

  const handleClick = (e) => {
    if (isDisabled) {
      e?.preventDefault();
      return;
    }
    if (onClick) onClick(e);
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-4 font-vcr">
      <div className="emergency-button-container">
        <button
          type="button"
          disabled={isDisabled}
          onClick={handleClick}
          className={`emergency-btn-3d-active emergency-pulse-glow group transition-all duration-200 ${
            isDisabled
              ? "opacity-60 cursor-not-allowed pointer-events-none filter grayscale-[30%]"
              : "cursor-pointer"
          }`}
          aria-label={label || "Register Button"}
        >
          {/* Glass Dome Highlight */}
          <div className="absolute inset-2 rounded-full border-2 border-white/20 pointer-events-none" />

          {/* Button Label */}
          <div className="relative z-10 text-center px-2 flex flex-col items-center justify-center">
            {loading ? (
              <div className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                <span className="block text-white text-xs sm:text-sm font-black tracking-wider leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  TRANSMITTING...
                </span>
              </div>
            ) : (
              <span className="block text-white text-base sm:text-lg font-black tracking-wider leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] whitespace-pre-line">
                {label || "REGISTER"}
              </span>
            )}
          </div>
        </button>
      </div>

      <div className="mt-3 text-center">
        <span
          className={`text-xs font-bold tracking-widest ${
            isDisabled
              ? "text-yellow-400 animate-pulse"
              : "text-red-400 glow-red animate-pulse"
          }`}
        >
          {loading
            ? "TRANSMITTING CREWMATE DATA TO COMMAND..."
            : isDisabled
            ? "TRANSMISSION IN PROGRESS..."
            : "PRESS TO TRANSMIT CREWMATE DATA"}
        </span>
      </div>
    </div>
  );
}
