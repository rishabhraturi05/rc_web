"use client";

import React from "react";
import { CrewmateSprite } from "./FloatingCrewmates";

export default function WormholeRunner({
  crewmateColor = "#f1c40f",
  size = 35,
  speedSeconds = 5,
}) {
  return (
    <div className="relative w-full max-w-md mx-auto h-16 pointer-events-none overflow-hidden my-2 font-vcr">
      {/* Left Wormhole Portal */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-12 rounded-full border-2 border-cyan-400 bg-cyan-900/60 blur-[1px] animate-pulse flex items-center justify-center">
        <div className="w-4 h-8 rounded-full bg-cyan-400 blur-[2px]" />
      </div>

      {/* Right Wormhole Portal */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-12 rounded-full border-2 border-purple-400 bg-purple-900/60 blur-[1px] animate-pulse flex items-center justify-center">
        <div className="w-4 h-8 rounded-full bg-purple-400 blur-[2px]" />
      </div>

      {/* Running Crewmate Sprite Animation */}
      <div
        className="absolute top-1/2 -translate-y-1/2"
        style={{
          animation: `wormholeRun ${speedSeconds}s linear infinite`,
        }}
      >
        <CrewmateSprite color={crewmateColor} size={size} />
      </div>

      <style jsx global>{`
        @keyframes wormholeRun {
          0% {
            left: 20px;
            opacity: 0;
            transform: translateY(-50%) scale(0.5) rotate(0deg);
          }
          10% {
            opacity: 1;
            transform: translateY(-50%) scale(1) rotate(5deg);
          }
          90% {
            opacity: 1;
            transform: translateY(-50%) scale(1) rotate(-5deg);
          }
          100% {
            left: calc(100% - 50px);
            opacity: 0;
            transform: translateY(-50%) scale(0.5) rotate(0deg);
          }
        }
      `}</style>
    </div>
  );
}
