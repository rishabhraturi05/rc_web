"use client";

import React from "react";

export default function RegistrationTerminal() {
  const leaderboard = [
    { rank: 1, name: "apex among imposters - prateek", score: 25 },
    { rank: 2, name: "heisen-bugs", score: 21 },
    { rank: 3, name: "o2 tech", score: 21 },
    { rank: 4, name: "Cyber criminals", score: 20 },
    { rank: 5, name: "the sus team", score: 20 },
    { rank: 6, name: "space beans", score: 20 },
    { rank: 7, name: "6769", score: 18 },
    { rank: 8, name: "quantum_bots", score: 17 }
  ];

  return (
    <section id="results" className="relative z-10 w-full max-w-3xl mx-auto my-12 px-4 font-vcr">
      <div className="relative overflow-hidden crt-screen crt-scanlines p-6 sm:p-10 bg-gray-950/95 text-white border-2 border-red-500/70 shadow-[0_0_35px_rgba(239,68,68,0.25)] mb-10">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-4 mb-10 border-b-2 border-red-500/50 pb-10 text-center md:text-left">
          
          <div className="relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center shrink-0">
            <img 
              src="/among_us_kill.png" 
              alt="Among Us Kill" 
              className="absolute max-w-none w-[160%] h-[160%] object-contain drop-shadow-[0_0_20px_rgba(239,68,68,0.7)]" 
            />
          </div>

          <div className="flex flex-col items-center md:items-start justify-center relative z-10 md:-ml-8">
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold text-red-500 tracking-widest drop-shadow-[0_0_15px_rgba(239,68,68,0.8)] uppercase mb-4 whitespace-nowrap">
              ROUND 2
            </h2>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-yellow-400 animate-pulse tracking-widest uppercase whitespace-nowrap">
              COMING SOON!!!
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10 max-w-2xl mx-auto">
          <div className="p-5 rounded-xl border border-red-500/40 bg-gray-900/80 text-center shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <div className="text-sm text-red-400 font-bold tracking-wider mb-2">📅 EVENT DATE</div>
            <div className="text-base sm:text-lg font-bold text-gray-300">TBD</div>
          </div>
          <div className="p-5 rounded-xl border border-red-500/40 bg-gray-900/80 text-center shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <div className="text-sm text-red-400 font-bold tracking-wider mb-2">⏰ TIME</div>
            <div className="text-base sm:text-lg font-bold text-gray-300">TBD</div>
          </div>
          <div className="p-5 rounded-xl border border-red-500/40 bg-gray-900/80 text-center shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <div className="text-sm text-red-400 font-bold tracking-wider mb-2">📍 VENUE</div>
            <div className="text-base sm:text-lg font-bold text-gray-300">TBD</div>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden crt-screen crt-scanlines p-6 sm:p-8 bg-gray-950/95 text-white border-2 border-cyan-500/70 shadow-[0_0_35px_rgba(6,182,212,0.25)]">
        
        <div className="flex items-center justify-between border-b-2 border-cyan-500/50 pb-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cyan-500 animate-pulse" />
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-wider glow-white uppercase whitespace-nowrap">
              ROUND 1 RESULTS
            </h2>
          </div>
          <span className="text-xs text-cyan-400 font-mono hidden sm:inline">LEADERBOARD TERMINAL</span>
        </div>

        <div className="mb-8 p-5 bg-gray-900 border-2 border-yellow-500 rounded-lg shadow-[0_0_15px_rgba(234,179,8,0.3)]">
          <h3 className="text-xl text-yellow-400 font-bold mb-3 text-center tracking-widest uppercase">
            🌟 Highlight of the Event! 🌟
          </h3>
          <p className="text-sm text-gray-300 leading-relaxed mb-4 text-center font-sans">
            Apex Among Imposters were initially at 9th position, but they made the correct bet on 9th place, which ultimately propelled them to 1st position!
          </p>
          <p className="text-lg text-green-400 font-bold text-center tracking-wide">
            Great hunch! 👏
          </p>
        </div>

        <div className="space-y-3 mb-8">
          {leaderboard.map((team) => (
            <div 
              key={team.rank} 
              className="flex items-center p-3 bg-gray-900 border border-gray-700 rounded-lg hover:border-cyan-400 hover:shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded bg-cyan-950/80 text-cyan-300 font-bold mr-4 border border-cyan-700/50 text-lg">
                {team.rank}
              </div>
              <div className="flex-1 text-sm sm:text-base uppercase tracking-wider text-gray-200 truncate pr-2">
                {team.name}
              </div>
              <div className="text-xl sm:text-2xl font-bold text-cyan-400">
                {team.score}
              </div>
            </div>
          ))}
        </div>

        <div className="p-5 bg-gray-900/60 border border-gray-800 rounded-lg text-center">
          <p className="mb-2 text-white font-bold tracking-wider text-sm sm:text-base">
            Congratulations to all the winning teams! 🎊🎊
          </p>
          <p className="text-xs sm:text-sm text-gray-400 font-sans">
            The next steps for round 2 and further details will be communicated to the teams shortly.
          </p>
        </div>
      </div>
    </section>
  );
}