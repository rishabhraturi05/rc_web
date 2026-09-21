"use client";

import React from "react";
import "../styles/freshers.css";
import { freshersEvent } from "../data/freshersConfig";
import SpaceBackground from "./SpaceBackground";
import FloatingCrewmates from "./FloatingCrewmates";
import FreshersHero from "./FreshersHero";
import EventIntel from "./EventDetails";
import RegistrationTerminal from "./RegistrationTerminal";
import RulesTerminal from "./RulesTerminal";
import SecurityMap from "./SecurityMap";
import ContactCrew from "./ContactCrew";
import FinalCTA from "./FinalCTA";
import AmbientVentKill from "./AmbientVentKill";
import WormholeRunner from "./WormholeRunner";

export default function FreshersExperience({ children }) {
  const scrollToRegister = () => {
    const regSection = document.getElementById("register");
    if (regSection) {
      regSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative min-h-screen text-white bg-[#05070a] font-vcr overflow-x-hidden selection:bg-yellow-500 selection:text-black">
      <SpaceBackground />
      <FloatingCrewmates count={7} />
      <AmbientVentKill />
      <main className="relative z-10 pt-4 px-2 sm:px-6 space-y-4">
        <FreshersHero
          eventConfig={freshersEvent}
          onRegisterClick={scrollToRegister}
        />
        <div className="max-w-4xl mx-auto p-4 border border-blue-500/30 bg-blue-900/20 rounded-lg">
          <p className="text-blue-200 text-sm md:text-base font-mono text-center">
            <span className="font-bold text-blue-400">Solo or short-handed?</span> Team Formation Policy: If you are unable to form a complete team of 6 members prior to the event, do not worry. We will match and merge individual participants into a cohesive team on-site.
          </p>
        </div>
        <EventIntel eventConfig={freshersEvent} />
        <RegistrationTerminal eventConfig={freshersEvent} />
        
        {children}

        <RulesTerminal rules={freshersEvent.rules} />
        <SecurityMap />
        <ContactCrew />
        <FinalCTA onRegisterClick={scrollToRegister} />
        <div className="pb-8">
          <WormholeRunner speedSeconds={6} crewmateColor="#f59e0b" />
        </div>
      </main>
    </div>
  );
}