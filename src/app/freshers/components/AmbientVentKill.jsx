"use client";

import React from "react";
import { CrewmateSprite } from "./FloatingCrewmates";

export default function AmbientVentKill() {
  return (
    <div className="fixed bottom-4 right-4 z-[2] pointer-events-none hidden md:block overflow-hidden w-64 h-24 font-vcr">
      {/* Vent Grid Graphic */}
      <div className="absolute bottom-0 right-8 w-16 h-4 bg-gray-900 border-2 border-gray-700 rounded flex items-center justify-around px-1 shadow-[0_0_10px_rgba(0,0,0,0.8)]">
        <div className="w-1 h-full bg-gray-950" />
        <div className="w-1 h-full bg-gray-950" />
        <div className="w-1 h-full bg-gray-950" />
      </div>

      {/* Animated Impostor & Crewmate Loop */}
      <div className="relative w-full h-full animate-ventKillLoop">
        {/* Victim Cyan Crewmate */}
        <div className="absolute bottom-2 left-4">
          <CrewmateSprite color="#00ffff" size={40} />
        </div>

        {/* Impostor Red Crewmate */}
        <div className="absolute bottom-2 right-8 animate-impostorRun">
          <CrewmateSprite color="#ff0000" size={42} />
        </div>
      </div>

      <style jsx global>{`
        @keyframes impostorRun {
          0% { transform: translateY(20px) scale(0.5); opacity: 0; }
          20% { transform: translateY(0px) scale(1); opacity: 1; }
          50% { transform: translateX(-120px); }
          70% { transform: translateX(-120px) scale(1.1); }
          100% { transform: translateY(20px) scale(0.5); opacity: 0; }
        }

        @keyframes ventKillLoop {
          0%, 100% { opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}
