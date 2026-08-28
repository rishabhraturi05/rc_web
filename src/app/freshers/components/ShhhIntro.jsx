"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { CrewmateSprite } from "./FloatingCrewmates";
import { amongUsAssets } from "../data/amongUsAssets";

export default function ShhhIntro({ onComplete }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Crucial: Intro plays on every page load / reload of /freshers.
    // Sequence timing handles progression once per page lifecycle.
    const timer1 = setTimeout(() => setStep(1), 250);   // Radar appears
    const timer2 = setTimeout(() => setStep(2), 700);   // Crewmate appears
    const timer3 = setTimeout(() => setStep(3), 1200);  // Hand gesture
    const timer4 = setTimeout(() => setStep(4), 1700);  // SHHHHHHH text
    const timer5 = setTimeout(() => {
      onComplete();
    }, 4200);                                            // Complete & transition to main view

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center overflow-hidden font-vcr text-white crt-scanlines crt-flicker">
      {/* Skip Button */}
      <button
        onClick={onComplete}
        className="absolute top-6 right-6 z-50 px-4 py-2 rounded border border-yellow-500/70 bg-yellow-500/10 text-yellow-400 text-xs sm:text-sm tracking-wider hover:bg-yellow-500/30 transition-all cursor-pointer font-vcr"
      >
        [ SKIP INTRO ]
      </button>

      <div className="relative flex flex-col items-center justify-center p-4 z-10">
        {/* STEP 1: Radar Warning Ring */}
        {step >= 1 && (
          <div className="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full border-4 border-dashed border-yellow-500/80 radar-spinner flex items-center justify-center">
            <div className="w-48 h-48 rounded-full border-2 border-red-500/50 border-t-yellow-400" />
          </div>
        )}

        {/* STEP 2: Red Crewmate Sprite */}
        {step >= 2 && (
          <div className="relative z-10 transition-all duration-500 transform scale-125 sm:scale-150 my-6">
            <CrewmateSprite color="#ef4444" size={90} spriteUrl={amongUsAssets.intro.crewmate} />

            {/* STEP 3: Animated Hand Gesture */}
            {step >= 3 && (
              <div className="absolute -top-4 right-2 text-4xl sm:text-5xl animate-bounce z-20">
                🤫
              </div>
            )}
          </div>
        )}

        {/* STEP 4: SHHHHHHH! Text */}
        {step >= 4 && (
          <div className="relative z-20 mt-8 text-center">
            <h1 className="text-4xl sm:text-6xl font-bold tracking-widest text-red-500 glow-red animate-pulse">
              SHHHHHHH!
            </h1>
            <p className="text-sm sm:text-base text-yellow-400 mt-3 tracking-widest glow-yellow font-vcr">
              THERE IS 1 IMPOSTOR AMONG US...
            </p>
          </div>
        )}
      </div>

      {/* System Status Footer Line */}
      <div className="absolute bottom-6 text-xs text-gray-400 tracking-widest z-10 font-vcr">
        ROBOTICS CLUB NITW • SPACESHIP INITIALIZATION
      </div>
    </div>
  );
}
