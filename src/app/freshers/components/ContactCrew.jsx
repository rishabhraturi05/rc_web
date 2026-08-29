"use client";

import React from "react";
import { organizers } from "../data/organizers";
import { CrewmateSprite } from "./FloatingCrewmates";

export default function ContactCrew() {
  return (
    <section id="comms" className="relative z-10 w-full max-w-5xl mx-auto my-12 px-4 font-vcr">
      <div className="crt-screen crt-scanlines p-6 sm:p-8 bg-gray-950/95 text-white border-2 border-yellow-500/70 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
        {/* Communications Header */}
        <div className="border-b-2 border-yellow-500/50 pb-3 mb-6 text-center">
          <div className="inline-block px-3 py-1 bg-yellow-950/80 border border-yellow-500 text-yellow-400 text-xs font-bold rounded mb-2">
            COMMUNICATIONS FREQUENCY
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white glow-white tracking-wider">
            COMMUNICATIONS
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            ROBOTICS CLUB NIT WARANGAL • FLIGHT COMMAND & CREW CONTACTS
          </p>
        </div>

        {/* Organizers Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizers.map((org) => (
            <div
              key={org.id}
              className="p-5 rounded-xl border-2 bg-gray-900/90 hover:scale-105 transition-all duration-300 flex flex-col items-center text-center shadow-[0_0_15px_rgba(0,0,0,0.5)]"
              style={{ borderColor: org.color }}
            >
              {/* Crewmate Sprite Avatar */}
              <div className="mb-3">
                <CrewmateSprite color={org.color} size={65} spriteUrl={org.sprite} />
              </div>

              {/* Name & Role */}
              <h3 className="text-base font-bold text-white mb-1">{org.name}</h3>
              <div className="text-xs font-bold mb-3 px-2 py-0.5 rounded bg-gray-950 border border-gray-800" style={{ color: org.color }}>
                {org.role}
              </div>

              {/* Clickable Phone & Email */}
              <div className="w-full space-y-2 pt-2 border-t border-gray-800 text-xs">
                <a
                  href={`tel:${org.phone}`}
                  className="block px-3 py-1.5 rounded bg-gray-950 hover:bg-gray-800 text-yellow-400 hover:text-yellow-300 transition-colors font-mono"
                >
                  📞 {org.phone}
                </a>

              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
