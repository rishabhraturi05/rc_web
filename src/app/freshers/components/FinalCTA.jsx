"use client";

import React from "react";

export default function FinalCTA({ onRegisterClick }) {
  return (
    <section className="relative z-10 w-full max-w-4xl mx-auto my-16 px-4 font-vcr text-center">
      <div className="p-8 rounded-2xl border-2 border-red-500/70 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 shadow-[0_0_40px_rgba(239,68,68,0.3)]">
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white glow-white mb-3">
          AIRLOCK CLOSING SOON
        </h2>
        <p className="text-yellow-400 text-sm sm:text-base max-w-xl mx-auto mb-6">
          Do not miss the Robotics Club NITW Among Us Freshers Bash. Transmit your crewmate data before mission launch.
        </p>

        <button
          type="button"
          onClick={onRegisterClick}
          className="px-10 py-4 rounded-xl font-bold text-lg text-white bg-gradient-to-r from-red-600 via-red-500 to-red-700 hover:from-red-500 hover:to-red-600 border-2 border-red-400 shadow-[0_0_25px_rgba(239,68,68,0.7)] transform hover:scale-105 transition-all cursor-pointer inline-block"
        >
          [!] REPORT TO REGISTER
        </button>
      </div>
    </section>
  );
}
