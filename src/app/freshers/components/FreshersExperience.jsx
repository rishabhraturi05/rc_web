"use client";

import React from "react";
import "../styles/freshers.css";
import { freshersEvent } from "../data/freshersConfig";
import SpaceBackground from "./SpaceBackground";
import FloatingCrewmates from "./FloatingCrewmates";
import FreshersHero from "./FreshersHero";
import WinnersPodium from "./WinnersPodium";
import SecurityGallery from "./SecurityGallery";
import AmbientVentKill from "./AmbientVentKill";
import WormholeRunner from "./WormholeRunner";

export default function FreshersExperience({ children }) {
  return (
    <div className="relative min-h-screen text-white bg-[#05070a] font-vcr overflow-x-hidden selection:bg-yellow-500 selection:text-black">
      {/* Ambience & Background Canvases */}
      <SpaceBackground />
      <FloatingCrewmates count={7} />
      <AmbientVentKill />

      {/* Main Content Area */}
      <main className="relative z-10 pt-4 px-2 sm:px-6 space-y-12">
        <FreshersHero eventConfig={freshersEvent} />

        {/* Feature 1: "VICTORY" Winners Podium */}
        <WinnersPodium />

        {/* Feature 2 & 3: Skeld Security Gallery + Fullscreen Retro Modal Engine */}
        <SecurityGallery />

        {/* Community & WhatsApp Hub */}
        {children}

        {/* Celebratory Footer Runner */}
        <div className="pb-8">
          <WormholeRunner speedSeconds={6} crewmateColor="#f59e0b" />
        </div>
      </main>
    </div>
  );
}

