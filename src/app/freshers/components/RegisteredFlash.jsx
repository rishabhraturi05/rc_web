"use client";

import React, { useEffect, useState } from "react";

export default function RegisteredFlash({
  registrationData,
  eventConfig,
  onReset,
  onReturn,
  onComplete,
}) {
  const [flashActive, setFlashActive] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFlashActive(false);
      if (onComplete) onComplete();
    }, 1200);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const handleBack = onReset || onReturn;

  return (
    <div className="relative z-40 w-full max-w-2xl mx-auto my-6 p-4 font-vcr">
      {/* Red Screen Flash Overlay */}
      {flashActive && (
        <div className="fixed inset-0 z-50 pointer-events-none registered-red-flash flex items-center justify-center">
          <h1 className="text-6xl sm:text-8xl font-black text-white tracking-widest text-center glow-red drop-shadow-[0_0_40px_rgba(239,68,68,1)]">
            REGISTERED
          </h1>
        </div>
      )}

      {/* Confirmation Terminal Card */}
      <div className="crt-screen crt-scanlines p-6 sm:p-8 border-2 border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.4)] bg-gray-950/95 text-white">
        <div className="text-center mb-6 border-b border-red-500/40 pb-4">
          <div className="inline-block px-3 py-1 bg-red-950 border border-red-500 text-red-400 text-xs font-bold rounded mb-2">
            TRANSMISSION COMPLETE
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-red-500 glow-red tracking-wider">
            REGISTERED CREWMATE
          </h2>
          <p className="text-xs text-gray-300 mt-1">
            Your crewmate identity data has been transmitted to RC Flight Command.
          </p>
        </div>

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
            DATE: <span className="text-white font-bold">{eventConfig?.eventDate || "TBD"}</span> | TIME:{" "}
            <span className="text-white font-bold">{eventConfig?.eventTime || "TBD"}</span>
          </div>
          <div className="text-gray-200">
            VENUE: <span className="text-white font-bold">{eventConfig?.venue || "NIT Warangal Campus"}</span>
          </div>
          <div className="text-[10px] text-gray-400 pt-1">
            * Bring valid NIT Warangal Student ID Card on launch day.
          </div>
        </div>

        {/* Action Button */}
        {handleBack && (
          <div className="text-center">
            <button
              onClick={handleBack}
              className="px-6 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm tracking-wider border-2 border-yellow-300 shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all cursor-pointer"
            >
              [ RETURN TO LOBBY ]
            </button>
          </div>
        )}
      </div>
    </div>
  );
}