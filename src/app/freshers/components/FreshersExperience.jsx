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

export default function FreshersExperience() {
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
        <EventIntel eventConfig={freshersEvent} />
        <RegistrationTerminal eventConfig={freshersEvent} />
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