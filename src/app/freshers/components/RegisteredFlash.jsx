"use client";

import React, { useEffect, useState } from "react";

export default function RegisteredFlash({ onComplete }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onComplete) onComplete();
    }, 1200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none" 
      style={{ animation: 'screenShake 0.35s ease-out' }}
    >
      <div 
        className="relative w-full max-w-7xl flex items-center justify-center"
        style={{ animation: 'slamIn 0.25s cubic-bezier(0.1, 0.9, 0.2, 1) forwards' }}
      >
        <img
          src="/freshers/among-us/registration/registered.png"
          alt="Flash"
          className="w-full max-h-[30vh] object-cover drop-shadow-[0_0_20px_rgba(255,0,0,0.8)]"
        />
        <h1 
          className="absolute text-5xl md:text-8xl font-black text-black tracking-[0.2em] drop-shadow-[0_8px_16px_rgba(0,0,0,1)]" 
          style={{ fontFamily: 'Impact, sans-serif' }}
        >
          REGISTERED
        </h1>
        {/* Transmission Summary Payload */}
        <div className="space-y-4 text-xs sm:text-sm bg-gray-900/90 p-4 rounded-xl border border-gray-800">
          <div className="flex justify-between border-b border-gray-800 pb-2">
            <span className="text-gray-400">TEAM NAME:</span>
            <span className="text-yellow-400 font-bold">{registrationData?.teamName || "CREW-ALPHA"}</span>
          </div>
          <div className="flex justify-between border-b border-gray-800 pb-2">
            <span className="text-gray-400">TEAM LEADER:</span>
            <span className="text-white font-bold">{registrationData?.name || "CREWMATE"}</span>
          </div>
          <div className="flex justify-between border-b border-gray-800 pb-2">
            <span className="text-gray-400">EMAIL:</span>
            <span className="text-yellow-400">{registrationData?.email}</span>
          </div>
          <div className="flex justify-between border-b border-gray-800 pb-2">
            <span className="text-gray-400">ROLL NO:</span>
            <span className="text-white">{registrationData?.rollNo}</span>
          </div>
          <div className="flex justify-between border-b border-gray-800 pb-2">
            <span className="text-gray-400">BRANCH:</span>
            <span className="text-white">{registrationData?.branch}</span>
          </div>
          {registrationData?.participants?.length > 0 && (
            <div className="pt-1">
              <span className="text-gray-400 block mb-1">CREWMATE MEMBERS:</span>
              <div className="flex flex-wrap gap-1.5">
                {registrationData.participants.map((p, i) => {
                  const label = typeof p === "object" ? `${p.name}${p.rollNo ? ` (${p.rollNo})` : ""}` : p;
                  return (
                    <span key={i} className="px-2 py-0.5 bg-gray-900 border border-yellow-500/40 text-yellow-300 rounded text-[11px]">
                      👤 {label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Mission Coordinates */}
        <div className="my-6 p-4 rounded-xl border border-yellow-500/40 bg-yellow-950/20 text-center text-xs space-y-1">
          <div className="text-yellow-400 font-bold">MISSION LAUNCH DETAILS</div>
          <div className="text-gray-200">
            DATE: <span className="text-white font-bold">{eventConfig.eventDate}</span> | TIME:{" "}
            <span className="text-white font-bold">{eventConfig.eventTime}</span>
          </div>
          <div className="text-gray-200">
            VENUE: <span className="text-white font-bold">{eventConfig.venue}</span>
          </div>
          <div className="text-[10px] text-gray-400 pt-1">
            * Bring valid NIT Warangal Student ID Card on launch day.
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center">
          <button
            onClick={onReturn}
            className="px-6 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm tracking-wider border-2 border-yellow-300 shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all cursor-pointer"
          >
            [ RETURN TO LOBBY ]
          </button>
        </div>
      </div>
      <style jsx>{`
        @keyframes slamIn {
          0% { transform: scale(4); opacity: 0; }
          40% { transform: scale(0.9); opacity: 1; }
          70% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes screenShake {
          0%, 100% { transform: translate(0, 0); }
          20% { transform: translate(-12px, 8px) rotate(-2deg); }
          40% { transform: translate(12px, -8px) rotate(2deg); }
          60% { transform: translate(-6px, 4px) rotate(-1deg); }
          80% { transform: translate(6px, -4px) rotate(1deg); }
        }
      `}</style>
    </div>
  );
}