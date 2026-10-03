"use client";

import React from "react";

export default function FreshersHero({ eventConfig = {} }) {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative z-10 w-full max-w-5xl mx-auto px-4 pt-24 sm:pt-32 pb-6 sm:pb-10 font-vcr text-center">
      {/* Top Tagline Badge */}
      <div className="inline-flex max-w-full items-center justify-center gap-2 px-4 sm:px-5 py-2 rounded-full border border-cyan-500/70 bg-cyan-950/60 text-cyan-300 text-[11px] sm:text-sm font-bold tracking-wider glow-cyan mb-4 sm:mb-6 text-center leading-relaxed">
        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping inline-block shrink-0" />
        <span className="truncate sm:whitespace-normal">
          {eventConfig.tagline || "MISSION ACCOMPLISHED: CREW VICTORY ARCHIVE"}
        </span>
      </div>

      {/* Main Title Header */}
      <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-wider mb-2 text-white glow-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] flex items-center justify-center flex-wrap gap-x-3 sm:gap-x-4">
        <span>PROJECT</span>
        <span>SKELD</span>
      </h1>

      {/* Subtitle */}
      <p className="text-base sm:text-2xl text-yellow-400 max-w-3xl mx-auto mb-2 font-vcr glow-yellow">
        THE SPACESHIP HAS LANDED. VICTORY TO THE CREW.
      </p>

      <p className="text-xs sm:text-base text-gray-300 max-w-2xl mx-auto mb-6 sm:mb-8 font-sans px-2">
        {eventConfig.eventSubtitle || "Robotics Club NIT Warangal presents the Project Skeld post-event celebration & surveillance photo archive!"}
      </p>

      {/* Subheading */}
      <h2 className="text-lg sm:text-2xl md:text-3xl font-bold tracking-widest text-cyan-400 font-vcr glow-cyan uppercase mb-6">
        POST-EVENT CELEBRATION &amp; GALLERY
      </h2>

      {/* Quick Nav Action Buttons */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
        <button
          onClick={() => scrollToSection("podium")}
          className="px-5 py-2 rounded-lg bg-yellow-950/70 border border-yellow-500/70 hover:bg-yellow-900/80 text-yellow-300 font-bold text-xs sm:text-sm tracking-wider shadow-[0_0_15px_rgba(234,179,8,0.25)] transition-all cursor-pointer"
        >
          🏆 VICTORY PODIUM
        </button>
        <button
          onClick={() => scrollToSection("gallery")}
          className="px-5 py-2 rounded-lg bg-cyan-950/70 border border-cyan-500/70 hover:bg-cyan-900/80 text-cyan-300 font-bold text-xs sm:text-sm tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.25)] transition-all cursor-pointer"
        >
          📷 SECURITY GALLERY
        </button>
      </div>
    </section>
  );
}
