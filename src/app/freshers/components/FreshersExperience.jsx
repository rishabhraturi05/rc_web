"use client";

import React, { useState } from "react";
import "../styles/freshers.css";
import { freshersEvent } from "../data/freshersConfig";
import SpaceBackground from "./SpaceBackground";
import FloatingCrewmates from "./FloatingCrewmates";
import ShhhIntro from "./ShhhIntro";
import FreshersHero from "./FreshersHero";
import EventIntel from "./EventDetails";
import RegistrationTerminal from "./RegistrationTerminal";
import RulesTerminal from "./RulesTerminal";
import SecurityMap from "./SecurityMap";
import ContactCrew from "./ContactCrew";
import FinalCTA from "./FinalCTA";
import AmbientVentKill from "./AmbientVentKill";
import WormholeRunner from "./WormholeRunner";

export default function FreshersExperience() {
  // Intro plays on every page load / reload of /freshers
  const [introSeen, setIntroSeen] = useState(false);

  const scrollToRegister = () => {
    const regSection = document.getElementById("register");
    if (regSection) {
      regSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative min-h-screen text-white bg-[#05070a] font-vcr overflow-x-hidden selection:bg-yellow-500 selection:text-black">
      {/* SCENE 1: Fullscreen Shhh Intro Overlay (Plays on every page load/reload) */}
      {!introSeen && (
        <ShhhIntro onComplete={() => setIntroSeen(true)} />
      )}

      {/* PERSISTENT DEEP SPACE BACKGROUND */}
      <SpaceBackground />

      {/* AMBIENT FLOATING CREWMATES LAYER */}
      <FloatingCrewmates count={7} />

      {/* AMBIENT VENT KILL LOOP IN CORNER */}
      <AmbientVentKill />

      {/* SINGLE CONTINUOUS SCROLLING FRESHERS EXPERIENCE */}
      <main className="relative z-10 pt-4 px-2 sm:px-6 space-y-4">
        {/* 1. FRESHERS HERO / LOBBY */}
        <FreshersHero
          eventConfig={freshersEvent}
          onRegisterClick={scrollToRegister}
        />

        {/* 2. EVENT INTEL */}
        <EventIntel eventConfig={freshersEvent} />

        {/* 3. REGISTER SECTION */}
        <RegistrationTerminal eventConfig={freshersEvent} />

        {/* 4. MISSION RULES */}
        <RulesTerminal rules={freshersEvent.rules} />

        {/* 5. SECURITY MAP */}
        <SecurityMap />

        {/* 6. COMMUNICATIONS */}
        <ContactCrew />

        {/* 7. FINAL CTA */}
        <FinalCTA onRegisterClick={scrollToRegister} />

        {/* DECORATIVE WORMHOLE RUNNER AT BOTTOM */}
        <div className="pb-8">
          <WormholeRunner speedSeconds={6} crewmateColor="#f59e0b" />
        </div>
      </main>
    </div>
  );
}
