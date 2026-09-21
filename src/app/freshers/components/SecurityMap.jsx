"use client";

import React from "react";

export default function SecurityMap() {
  return (
    <section id="map" className="relative z-10 w-full max-w-5xl mx-auto my-12 px-4 font-vcr">
      <div className="p-4 sm:p-6 bg-[#050b14]/95 text-white border-2 border-cyan-500/70 shadow-[0_0_30px_rgba(6,182,212,0.25)] rounded-lg">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-cyan-500/50 pb-3 mb-6 sm:mb-10 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
            <h2 className="text-xl sm:text-3xl font-bold text-white tracking-wider drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">
              SECURITY MAP: NAB VENUE
            </h2>
          </div>
          <span className="text-xs text-cyan-300 font-mono animate-pulse">
            LIVE SURVEILLANCE FEED
          </span>
        </div>

        <div className="relative w-full max-w-3xl mx-auto aspect-square overflow-visible flex items-center justify-center">
          
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            preserveAspectRatio="none"
          >
            <defs>
              <pattern id="hexGrid" width="4" height="4" patternUnits="userSpaceOnUse">
                <path d="M 4 0 L 0 0 0 4" fill="none" stroke="#06b6d4" strokeWidth="0.1" opacity="0.3" />
              </pattern>
            </defs>
            
            <polygon
              points="25,2 48,25 52,25 75,2 98,25 75,48 75,52 98,75 75,98 52,75 48,75 25,98 2,75 25,52 25,48 2,25"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2"
              className="opacity-40 blur-[4px]"
            />
            
            <polygon
              points="25,2 48,25 52,25 75,2 98,25 75,48 75,52 98,75 75,98 52,75 48,75 25,98 2,75 25,52 25,48 2,25"
              fill="url(#hexGrid)"
              stroke="#06b6d4"
              strokeWidth="0.5"
              className="opacity-80"
            />
            
            <polygon
              points="25,2 48,25 52,25 75,2 98,25 75,48 75,52 98,75 75,98 52,75 48,75 25,98 2,75 25,52 25,48 2,25"
              fill="#0a1526"
              className="opacity-90"
            />
          </svg>

          <div className="absolute top-[4%] left-[4%] w-[32%] h-[32%] group z-10 [perspective:1000px] rotate-[-45deg] cursor-pointer">
            <div className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
              <div className="absolute inset-0 [backface-visibility:hidden] bg-[#081b33]/90 border border-cyan-400/50 flex flex-col justify-center items-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <h3 className="text-cyan-300 font-bold text-[10px] sm:text-xs md:text-base lg:text-xl tracking-wider uppercase">ELECTRICAL</h3>
              </div>
              <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-[#081b33]/90 border border-cyan-400/50 flex flex-col justify-center items-center p-2 sm:p-3 shadow-[0_0_25px_rgba(6,182,212,0.5)]">
                <p className="text-gray-300 text-[6px] sm:text-[8px] md:text-[10px] lg:text-xs text-center uppercase leading-tight">SOME EXCITING STUFF</p>
                <p className="text-red-400 font-bold text-[6px] sm:text-[8px] md:text-[10px] lg:text-xs mt-1 sm:mt-2 text-center animate-pulse uppercase leading-tight">IMPOSTOR COME AND SABOTAGE</p>
              </div>
            </div>
          </div>

          <div className="absolute top-[4%] right-[4%] w-[32%] h-[32%] group z-10 [perspective:1000px] rotate-[45deg] cursor-pointer">
            <div className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
              <div className="absolute inset-0 [backface-visibility:hidden] bg-[#081b33]/90 border border-orange-400/50 flex flex-col justify-center items-center shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                <h3 className="text-orange-400 font-bold text-[10px] sm:text-xs md:text-base lg:text-xl tracking-wider uppercase">SECURITY</h3>
              </div>
              <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-[#081b33]/90 border border-orange-400/50 flex flex-col justify-center items-center p-2 sm:p-3 shadow-[0_0_25px_rgba(249,115,22,0.5)]">
                <p className="text-gray-300 text-[6px] sm:text-[8px] md:text-[10px] lg:text-xs text-center uppercase leading-tight">SOME ARE CREATING A STRATEGY</p>
                <p className="text-red-400 font-bold text-[6px] sm:text-[8px] md:text-[10px] lg:text-xs mt-1 sm:mt-2 text-center uppercase leading-tight">HMM!! IMPOSTOR IN DANGER</p>
              </div>
            </div>
          </div>

          <div className="absolute top-[33%] left-[33%] w-[34%] h-[34%] bg-[#1a0505]/90 rounded-full border-2 border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.6)] flex flex-col items-center justify-center p-2 z-20 hover:scale-110 transition-transform duration-300 cursor-pointer backdrop-blur-md">
            <div className="w-[85%] h-[85%] bg-red-600/20 rounded-full flex flex-col items-center justify-center border border-red-500/60 animate-pulse">
              <span className="text-red-400 font-bold text-[7px] sm:text-[9px] md:text-[12px] lg:text-sm text-center px-1 drop-shadow-[0_0_5px_rgba(248,113,113,0.8)] leading-tight">ITS VOTING TIME<br/>EJECT THE IMPOSTOR!!!</span>
            </div>
          </div>

          <div className="absolute bottom-[4%] left-[4%] w-[32%] h-[32%] group z-10 [perspective:1000px] rotate-[45deg] cursor-pointer">
            <div className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
              <div className="absolute inset-0 [backface-visibility:hidden] bg-[#081b33]/90 border border-rose-400/50 flex flex-col justify-center items-center shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                <h3 className="text-rose-400 font-bold text-[10px] sm:text-xs md:text-base lg:text-xl tracking-wider uppercase">MEDBAY</h3>
              </div>
              <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-[#081b33]/90 border border-rose-400/50 flex flex-col justify-center items-center p-2 sm:p-3 shadow-[0_0_25px_rgba(244,63,94,0.5)]">
                <p className="text-white font-bold text-[6px] sm:text-[8px] md:text-[10px] lg:text-xs text-center uppercase leading-tight drop-shadow-[0_0_2px_rgba(244,63,94,0.8)]">OH MY GOD A DEAD BODY</p>
                <div className="mt-1 sm:mt-2 bg-red-600 text-white text-[6px] sm:text-[8px] md:text-[10px] font-bold px-2 py-0.5 sm:py-1 rounded w-[80%] text-center animate-bounce shadow-[0_0_10px_rgba(220,38,38,0.7)]">
                  REPORT!!!!
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-[4%] right-[4%] w-[32%] h-[32%] group z-10 [perspective:1000px] rotate-[-45deg] cursor-pointer">
            <div className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
              <div className="absolute inset-0 [backface-visibility:hidden] bg-[#081b33]/90 border border-emerald-400/50 flex flex-col justify-center items-center shadow-[0_0_15px_rgba(52,211,153,0.2)]">
                <h3 className="text-emerald-400 font-bold text-[10px] sm:text-xs md:text-base lg:text-xl tracking-wider uppercase">ADMIN</h3>
              </div>
              <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-[#081b33]/90 border border-emerald-400/50 flex flex-col justify-center items-center p-2 sm:p-3 shadow-[0_0_25px_rgba(52,211,153,0.5)]">
                <p className="text-gray-300 text-[6px] sm:text-[8px] md:text-[10px] lg:text-xs text-center uppercase leading-tight">CREWMATES COMPLETING THEIR TASKS</p>
                <p className="text-emerald-300 font-bold text-[6px] sm:text-[8px] md:text-[10px] lg:text-xs mt-1 sm:mt-2 text-center border border-emerald-500/50 bg-emerald-950/50 px-1 py-0.5 rounded leading-tight">
                  DO NOT DISTURB!!!
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}