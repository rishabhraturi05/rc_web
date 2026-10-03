"use client";

import React from "react";
import { winnersConfig } from "../data/freshersConfig";

// Inline SVG Crewmate Sprite with customizable color, hat, and visor accent
export function InlineCrewmate({
  color = "#ef4444",
  shadowColor = "#991b1b",
  hat = "crown", // "crown" | "horns" | "mini" | "sprout" | "party" | "dum" | "none"
  visorTint = "#87ceeb",
  size = 110,
  className = "",
}) {
  return (
    <div
      style={{ width: size, height: size * 1.3 }}
      className={`relative select-none ${className}`}
    >
      <svg
        viewBox="0 0 100 130"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)] overflow-visible"
      >
        <defs>
          <linearGradient id={`bodyGrad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="60%" stopColor={color} />
            <stop offset="100%" stopColor={shadowColor} />
          </linearGradient>
          <linearGradient id={`visorGrad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor={visorTint} />
            <stop offset="100%" stopColor="#1e3a8a" />
          </linearGradient>
          <linearGradient id="crownGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>
        </defs>

        {/* Backpack / Oxygen Tank */}
        <rect
          x="10"
          y="48"
          width="18"
          height="48"
          rx="9"
          fill={shadowColor}
          stroke="#070c18"
          strokeWidth="5"
        />
        <rect
          x="12"
          y="50"
          width="14"
          height="40"
          rx="7"
          fill={color}
        />

        {/* Main Body */}
        <rect
          x="22"
          y="32"
          width="58"
          height="76"
          rx="29"
          fill={`url(#bodyGrad-${color.replace("#", "")})`}
          stroke="#070c18"
          strokeWidth="6"
        />

        {/* Left Leg */}
        <rect
          x="26"
          y="98"
          width="20"
          height="22"
          rx="7"
          fill={shadowColor}
          stroke="#070c18"
          strokeWidth="5"
        />
        {/* Right Leg */}
        <rect
          x="54"
          y="98"
          width="20"
          height="22"
          rx="7"
          fill={shadowColor}
          stroke="#070c18"
          strokeWidth="5"
        />

        {/* Visor */}
        <ellipse
          cx="62"
          cy="52"
          rx="22"
          ry="14"
          fill={`url(#visorGrad-${color.replace("#", "")})`}
          stroke="#070c18"
          strokeWidth="5"
        />
        {/* Visor Specular Reflection */}
        <ellipse
          cx="58"
          cy="48"
          rx="12"
          ry="6"
          fill="#ffffff"
          opacity="0.85"
        />

        {/* --- HATS --- */}
        {hat === "crown" && (
          <g transform="translate(30, 8)">
            <path
              d="M 2 22 L 8 4 L 20 14 L 32 4 L 38 22 Z"
              fill="url(#crownGrad)"
              stroke="#070c18"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <circle cx="8" cy="4" r="2.5" fill="#ef4444" stroke="#070c18" strokeWidth="1.5" />
            <circle cx="20" cy="14" r="2.5" fill="#3b82f6" stroke="#070c18" strokeWidth="1.5" />
            <circle cx="32" cy="4" r="2.5" fill="#ef4444" stroke="#070c18" strokeWidth="1.5" />
            <circle cx="20" cy="20" r="3" fill="#dc2626" />
          </g>
        )}

        {hat === "horns" && (
          <g transform="translate(26, 4)">
            <path
              d="M 6 28 C 0 16 -2 6 6 0 C 8 8 12 18 16 28 Z"
              fill="#ef4444"
              stroke="#070c18"
              strokeWidth="4"
            />
            <path
              d="M 42 28 C 48 16 50 6 42 0 C 40 8 36 18 32 28 Z"
              fill="#ef4444"
              stroke="#070c18"
              strokeWidth="4"
            />
          </g>
        )}

        {hat === "mini" && (
          <g transform="translate(38, 12) scale(0.38)">
            <rect x="4" y="24" width="10" height="26" rx="5" fill="#0891b2" stroke="#070c18" strokeWidth="4" />
            <rect x="12" y="12" width="34" height="42" rx="17" fill="#06b6d4" stroke="#070c18" strokeWidth="5" />
            <rect x="16" y="48" width="11" height="13" rx="4" fill="#0891b2" stroke="#070c18" strokeWidth="4" />
            <rect x="31" y="48" width="11" height="13" rx="4" fill="#0891b2" stroke="#070c18" strokeWidth="4" />
            <ellipse cx="36" cy="24" rx="13" ry="8" fill="#a5f3fc" stroke="#070c18" strokeWidth="4" />
            <ellipse cx="34" cy="22" rx="6" ry="3" fill="#ffffff" opacity="0.9" />
          </g>
        )}

        {hat === "sprout" && (
          <g transform="translate(42, 10)">
            <path
              d="M 8 22 Q 8 10 16 6"
              stroke="#070c18"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 8 22 Q 8 10 16 6"
              stroke="#22c55e"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 16 6 C 24 4 28 10 24 14 C 20 18 16 12 16 6 Z"
              fill="#4ade80"
              stroke="#070c18"
              strokeWidth="2.5"
            />
            <path
              d="M 14 10 C 6 8 2 14 6 18 C 10 22 14 14 14 10 Z"
              fill="#22c55e"
              stroke="#070c18"
              strokeWidth="2.5"
            />
          </g>
        )}

        {hat === "party" && (
          <g transform="translate(36, 6)">
            <path d="M 4 26 L 14 2 L 24 26 Z" fill="#f59e0b" stroke="#070c18" strokeWidth="3" />
            <circle cx="14" cy="2" r="3" fill="#ec4899" stroke="#070c18" strokeWidth="1" />
            <path d="M 7 20 L 21 20" stroke="#3b82f6" strokeWidth="2.5" />
            <path d="M 10 12 L 18 12" stroke="#10b981" strokeWidth="2.5" />
          </g>
        )}

        {hat === "dum" && (
          <g transform="translate(40, 24)">
            <rect x="0" y="0" width="30" height="20" rx="2" fill="#fef08a" stroke="#070c18" strokeWidth="2.5" transform="rotate(-6)" />
            <text x="4" y="14" fill="#1c1917" fontSize="10" fontWeight="900" fontFamily="sans-serif" transform="rotate(-6)">DUM</text>
          </g>
        )}
      </svg>
    </div>
  );
}

export default function WinnersPodium({ config = winnersConfig }) {
  const { impostor, crewmates = [] } = config || {};

  return (
    <section id="podium" className="relative z-10 w-full max-w-5xl mx-auto my-12 px-4 font-vcr">
      {/* ========================================================= */}
      {/* AMONG US "VICTORY" BANNER                                 */}
      {/* ========================================================= */}
      <div className="victory-banner-box victory-outline-pulse p-6 sm:p-8 text-center mb-12 sm:mb-16">
        <div className="flex items-center justify-center gap-3 sm:gap-6 mb-3">
          <div className="hidden sm:flex items-end gap-1.5 h-10 sm:h-14">
            <span className="soundwave-bar h-4" style={{ animationDelay: "0.1s" }} />
            <span className="soundwave-bar h-7" style={{ animationDelay: "0.3s" }} />
            <span className="soundwave-bar h-10" style={{ animationDelay: "0.5s" }} />
            <span className="soundwave-bar h-6" style={{ animationDelay: "0.2s" }} />
            <span className="soundwave-bar h-12" style={{ animationDelay: "0.4s" }} />
          </div>

          <h2 className="victory-text text-5xl sm:text-7xl md:text-8xl font-black tracking-widest uppercase">
            VICTORY
          </h2>

          <div className="hidden sm:flex items-end gap-1.5 h-10 sm:h-14">
            <span className="soundwave-bar h-12" style={{ animationDelay: "0.4s" }} />
            <span className="soundwave-bar h-6" style={{ animationDelay: "0.2s" }} />
            <span className="soundwave-bar h-10" style={{ animationDelay: "0.5s" }} />
            <span className="soundwave-bar h-7" style={{ animationDelay: "0.3s" }} />
            <span className="soundwave-bar h-4" style={{ animationDelay: "0.1s" }} />
          </div>
        </div>

        <p className="text-sm sm:text-lg text-cyan-300 font-bold tracking-wider drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">
          MISSION ACCOMPLISHED • OFFICIAL CEREMONIAL AWARDS
        </p>
        <p className="text-xs sm:text-sm text-gray-400 mt-1 font-mono">
          PROJECT SKELD CEREMONIAL HONORS • 6 WINNERS DECLASSIFIED
        </p>
      </div>

      {/* ========================================================= */}
      {/* SEGMENT 1: THE IMPOSTOR (1 WINNER)                        */}
      {/* ========================================================= */}
      {impostor && (
        <div className="mb-14 sm:mb-16">
          <div className="flex items-center gap-3 mb-6 justify-center">
            <div className="h-px flex-1 max-w-xs bg-gradient-to-r from-transparent via-red-500/50 to-red-500/80" />
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/80 border border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.35)]">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="text-xs sm:text-sm font-black tracking-widest text-red-400 uppercase">
                🔴 IMPOSTOR WINNER
              </span>
            </div>
            <div className="h-px flex-1 max-w-xs bg-gradient-to-l from-transparent via-red-500/50 to-red-500/80" />
          </div>

          <div className="max-w-md mx-auto">
            <div className="impostor-banner-box impostor-outline-pulse p-6 sm:p-8 text-center relative overflow-hidden group hover:border-red-500/80 transition-all duration-300">
              <div className="cctv-rivet top-3 left-3" />
              <div className="cctv-rivet top-3 right-3" />
              <div className="cctv-rivet bottom-3 left-3" />
              <div className="cctv-rivet bottom-3 right-3" />

              <div className="inline-block px-3 py-1 rounded-full bg-red-900/60 border border-red-500/50 text-[11px] font-mono font-bold text-red-300 uppercase tracking-widest mb-3">
                {impostor.badge || "SABOTEUR MASTERMIND"}
              </div>

              <div className="crewmate-bob-center flex justify-center my-3">
                <InlineCrewmate
                  color={impostor.color || "#ef4444"}
                  shadowColor={impostor.shadowColor || "#991b1b"}
                  hat={impostor.hat || "horns"}
                  visorTint="#fca5a5"
                  size={115}
                />
              </div>

              <div className="mt-4">
                <h3 className="text-xl sm:text-2xl font-black text-red-400 uppercase tracking-wider drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]">
                  {impostor.name || "Rudra Shah"}
                </h3>
                {impostor.team && (
                  <p className="text-xs sm:text-sm font-mono text-gray-300 uppercase tracking-wide mt-1">
                    ({impostor.team})
                  </p>
                )}
                <div className="mt-3 inline-block">
                  <span className="px-3 py-1 rounded bg-red-950/90 border border-red-500/40 text-xs font-mono font-semibold text-red-300 tracking-wider">
                    {impostor.title || "IMPOSTOR WINNER"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SEGMENT 2: CREWMATES (5 WINNERS)                          */}
      {/* ========================================================= */}
      {crewmates && crewmates.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-6 justify-center">
            <div className="h-px flex-1 max-w-xs bg-gradient-to-r from-transparent via-cyan-500/50 to-cyan-500/80" />
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.35)]">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs sm:text-sm font-black tracking-widest text-cyan-300 uppercase">
                🚀 CREWMATE WINNERS ({crewmates[0]?.team || "THE SUS TEAM"})
              </span>
            </div>
            <div className="h-px flex-1 max-w-xs bg-gradient-to-l from-transparent via-cyan-500/50 to-cyan-500/80" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
            {crewmates.map((crew, idx) => {
              const bobClass =
                idx % 3 === 0
                  ? "crewmate-bob-center"
                  : idx % 3 === 1
                  ? "crewmate-bob-left"
                  : "crewmate-bob-right";

              return (
                <div
                  key={crew.id || idx}
                  className="relative bg-gradient-to-b from-slate-900/90 via-slate-950 to-black border-2 border-slate-700/80 hover:border-cyan-400/80 rounded-xl p-4 sm:p-5 text-center flex flex-col justify-between shadow-[0_10px_25px_rgba(0,0,0,0.6)] hover:shadow-[0_10px_30px_rgba(6,182,212,0.2)] transition-all duration-300 group"
                >
                  <div className="cctv-rivet top-2 left-2" />
                  <div className="cctv-rivet top-2 right-2" />

                  <div className="mb-2">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-600/70 text-[10px] font-mono text-cyan-300 font-bold uppercase tracking-wider">
                      CREWMATE #{crew.number || idx + 1}
                    </span>
                  </div>

                  <div className={`${bobClass} flex justify-center my-2`}>
                    <InlineCrewmate
                      color={crew.color || "#06b6d4"}
                      shadowColor={crew.shadowColor || "#0e7490"}
                      hat={crew.hat || "crown"}
                      visorTint="#bae6fd"
                      size={85}
                    />
                  </div>

                  {/* Individual Winner Details */}
                  <div className="mt-3">
                    <h4 className="text-sm sm:text-base font-black text-white uppercase tracking-wider truncate px-1 group-hover:text-cyan-300 transition-colors">
                      {crew.name || `Crewmate ${idx + 1}`}
                    </h4>
                    {crew.team && (
                      <p className="text-[11px] font-mono text-gray-400 uppercase tracking-wide mt-0.5 truncate px-1">
                        {crew.team}
                      </p>
                    )}
                    <div className="mt-2.5 border-t border-slate-800 pt-2">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block truncate">
                        {crew.badge || crew.title || "SURVIVOR"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}