"use client";

import React from "react";

export default function FreshersHero({ eventConfig, onRegisterClick }) {
  return (
    <section className="relative z-10 w-full max-w-5xl mx-auto px-4 pt-24 sm:pt-32 pb-8 sm:pb-12 font-vcr text-center">
      {/* Top Tagline Badge */}
      <div className="inline-flex max-w-full items-center justify-center gap-2 px-4 sm:px-5 py-2 rounded-full border border-red-500/70 bg-red-950/50 text-red-400 text-[11px] sm:text-sm font-bold tracking-wider glow-red mb-4 sm:mb-6 text-center leading-relaxed">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping inline-block shrink-0" />
        <span className="truncate sm:whitespace-normal">{eventConfig.tagline || "EMERGENCY MEETING: JOIN THE CREW OR BE LEFT IN THE VENT"}</span>
      </div>

      {/* Main Title Header */}
      <h1 className="text-3xl sm:text-6xl lg:text-7xl font-extrabold tracking-wider mb-3 text-white glow-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
        FRESHERS EVENT
      </h1>

      {/* Subtitle */}
      <p className="text-base sm:text-2xl text-yellow-400 max-w-3xl mx-auto mb-2 font-vcr glow-yellow">
        THE SPACESHIP IS READY. WELCOME, CREWMATE.
      </p>

      <p className="text-xs sm:text-base text-gray-300 max-w-2xl mx-auto mb-6 sm:mb-8 font-sans px-2">
        {eventConfig.eventSubtitle}
      </p>

      {/* Event Details Badges (Date, Time, Venue) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 max-w-4xl mx-auto">
        <div className="p-4 rounded-xl border border-yellow-500/50 bg-gray-950/80 text-center shadow-[0_0_15px_rgba(245,158,11,0.15)]">
          <div className="text-xs text-yellow-400 font-bold tracking-wider mb-1">📅 EVENT DATE</div>
          <div className="text-sm sm:text-base font-bold text-white glow-white">
            {eventConfig.eventDate}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-yellow-500/50 bg-gray-950/80 text-center shadow-[0_0_15px_rgba(245,158,11,0.15)]">
          <div className="text-xs text-yellow-400 font-bold tracking-wider mb-1">⏰ LAUNCH TIME</div>
          <div className="text-sm sm:text-base font-bold text-white glow-white">
            {eventConfig.eventTime}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-green-500/50 bg-gray-950/80 text-center shadow-[0_0_15px_rgba(16,185,129,0.15)]">
          <div className="text-xs text-green-400 font-bold tracking-wider mb-1">📍 SKELD VENUE</div>
          <div className="text-sm sm:text-base font-bold text-white glow-white">
            {eventConfig.venue}
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          type="button"
          onClick={onRegisterClick}
          className="w-full sm:w-auto px-10 py-4 rounded-xl font-bold text-lg text-white bg-gradient-to-r from-red-600 via-red-500 to-red-700 hover:from-red-500 hover:to-red-600 border-2 border-red-400 shadow-[0_0_25px_rgba(239,68,68,0.7)] transform hover:scale-105 transition-all cursor-pointer text-center"
        >
          [!] REGISTER CREWMATE SQUAD
        </button>
      </div>
    </section>
  );
}
