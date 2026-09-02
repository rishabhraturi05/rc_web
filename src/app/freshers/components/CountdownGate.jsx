"use client";

import React, { useState, useEffect } from "react";
import SpaceBackground from "./SpaceBackground";
import FloatingCrewmates from "./FloatingCrewmates";
import WormholeRunner from "./WormholeRunner";

export default function CountdownGate({ onUnlock }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalMs: 1,
  });
  const [targetTimestamp, setTargetTimestamp] = useState(null);
  const [serverOffset, setServerOffset] = useState(0);
  const [logs, setLogs] = useState([
    "INITIALIZING SECURITY GATEWAY...",
    "CREWMATE VERIFICATION PROTOCOL ACTIVE...",
    "REGISTRATION ACCESS LOCKED UNTIL COUNTDOWN EXPIRATION.",
  ]);

  useEffect(() => {
    let isMounted = true;

    // Fetch synced server time & countdown target
    async function syncTime() {
      try {
        const res = await fetch("/api/freshers/time", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            const offset = data.serverTime - Date.now();
            setServerOffset(offset);
            setTargetTimestamp(data.targetTimestamp);

            if (!data.isLocked || data.remainingMs <= 0) {
              onUnlock?.();
            }
          }
        }
      } catch (err) {
        console.error("Time sync failed, falling back to local clock:", err);
      }
    }

    syncTime();
    const syncInterval = setInterval(syncTime, 2000); // re-sync every 2 seconds

    return () => {
      isMounted = false;
      clearInterval(syncInterval);
    };
  }, [onUnlock]);

  useEffect(() => {
    if (!targetTimestamp) return;

    const timer = setInterval(() => {
      const nowSynced = Date.now() + serverOffset;
      const diff = Math.max(0, targetTimestamp - nowSynced);

      if (diff <= 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 });
        onUnlock?.();
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, totalMs: diff });
    }, 250);

    return () => clearInterval(timer);
  }, [targetTimestamp, serverOffset, onUnlock]);

  // Ambient log updates for sci-fi atmosphere
  useEffect(() => {
    const ambientLogs = [
      "SCANNING FOR IMPOSTORS IN THE AREA...",
      "CHECKING SHIP INTEGRITY: 100% OPERATIONAL",
      "COMMUNICATIONS SYSTEM STABLE...",
      "REACTOR POWER LEVELS NOMINAL...",
      "WAITING FOR DEPLOYMENT AUTHORIZATION...",
      "NAV SYSTEM LOCKED TO RC NITW COORDINATES...",
    ];

    const logTimer = setInterval(() => {
      const randomLog = ambientLogs[Math.floor(Math.random() * ambientLogs.length)];
      setLogs((prev) => [...prev.slice(-4), `[${new Date().toLocaleTimeString()}] ${randomLog}`]);
    }, 4000);

    return () => clearInterval(logTimer);
  }, []);

  const formatDigits = (num) => String(num).padStart(2, "0");

  return (
    <div className="relative min-h-screen text-white bg-[#05070a] font-vcr overflow-x-hidden flex flex-col justify-between selection:bg-yellow-500 selection:text-black">
      <SpaceBackground />
      <FloatingCrewmates count={6} />

      {/* Header Banner */}
      <header className="relative z-10 pt-6 px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-red-950/80 border-2 border-red-500/60 px-4 py-2 rounded-lg text-xs sm:text-sm tracking-widest text-red-400 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.4)]">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span>SECURITY ACCESS CONTROL: SYSTEM LOCKED</span>
        </div>
      </header>

      {/* Main Countdown Screen */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 my-auto w-full text-center space-y-8 py-8">
        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-red-500 tracking-wider filter drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]">
            RC NITW FRESHERS 2026
          </h1>
          <p className="text-cyan-400 text-sm sm:text-base tracking-widest uppercase">
            REGISTRATION DEPLOYMENT COUNTDOWN
          </p>
          <div className="inline-block bg-black/60 border border-yellow-500/40 px-4 py-1.5 rounded-full text-yellow-400 font-mono text-sm sm:text-lg tracking-widest mt-2 shadow-[0_0_10px_rgba(234,179,8,0.2)]">
            ⏳ {formatDigits(timeLeft.days)}d : {formatDigits(timeLeft.hours)}h : {formatDigits(timeLeft.minutes)}m : {formatDigits(timeLeft.seconds)}s
          </div>
        </div>

        {/* Timer Displays */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {/* Days */}
          <div className="relative group bg-gray-900/90 border-2 border-cyan-500/50 rounded-xl p-4 sm:p-6 backdrop-blur-md shadow-[0_0_25px_rgba(6,182,212,0.25)] hover:border-cyan-400 transition-all">
            <div className="text-4xl sm:text-6xl font-extrabold text-cyan-300 font-mono tracking-wider drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
              {formatDigits(timeLeft.days)}
            </div>
            <div className="text-xs sm:text-sm text-cyan-500/80 uppercase font-bold tracking-widest mt-2">
              DAYS
            </div>
            <div className="absolute top-1 right-2 text-[10px] text-cyan-600">SYS.D</div>
          </div>

          {/* Hours */}
          <div className="relative group bg-gray-900/90 border-2 border-cyan-500/50 rounded-xl p-4 sm:p-6 backdrop-blur-md shadow-[0_0_25px_rgba(6,182,212,0.25)] hover:border-cyan-400 transition-all">
            <div className="text-4xl sm:text-6xl font-extrabold text-cyan-300 font-mono tracking-wider drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
              {formatDigits(timeLeft.hours)}
            </div>
            <div className="text-xs sm:text-sm text-cyan-500/80 uppercase font-bold tracking-widest mt-2">
              HOURS
            </div>
            <div className="absolute top-1 right-2 text-[10px] text-cyan-600">SYS.H</div>
          </div>

          {/* Minutes */}
          <div className="relative group bg-gray-900/90 border-2 border-yellow-500/50 rounded-xl p-4 sm:p-6 backdrop-blur-md shadow-[0_0_25px_rgba(234,179,8,0.25)] hover:border-yellow-400 transition-all">
            <div className="text-4xl sm:text-6xl font-extrabold text-yellow-300 font-mono tracking-wider drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]">
              {formatDigits(timeLeft.minutes)}
            </div>
            <div className="text-xs sm:text-sm text-yellow-500/80 uppercase font-bold tracking-widest mt-2">
              MINUTES
            </div>
            <div className="absolute top-1 right-2 text-[10px] text-yellow-600">SYS.M</div>
          </div>

          {/* Seconds */}
          <div className="relative group bg-gray-900/90 border-2 border-red-500/60 rounded-xl p-4 sm:p-6 backdrop-blur-md shadow-[0_0_25px_rgba(239,68,68,0.35)] hover:border-red-400 transition-all animate-pulse">
            <div className="text-4xl sm:text-6xl font-extrabold text-red-400 font-mono tracking-wider drop-shadow-[0_0_12px_rgba(239,68,68,0.9)]">
              {formatDigits(timeLeft.seconds)}
            </div>
            <div className="text-xs sm:text-sm text-red-500/80 uppercase font-bold tracking-widest mt-2">
              SECONDS
            </div>
            <div className="absolute top-1 right-2 text-[10px] text-red-600">SYS.S</div>
          </div>
        </div>

        {/* Security Warning Box */}
        <div className="bg-black/70 border border-yellow-500/30 rounded-xl p-4 max-w-xl mx-auto backdrop-blur-md text-left text-xs sm:text-sm space-y-2 text-gray-300">
          <div className="flex items-center gap-2 text-yellow-400 font-bold border-b border-yellow-500/20 pb-2">
            <span>🛡️ SECURITY GATEKEEPER ACTIVE</span>
          </div>
          <p className="leading-relaxed">
            Registration forms are strictly encrypted and locked until the deployment countdown reaches zero. Prepare your crewmates in the meantime!
          </p>
        </div>

        {/* Live Diagnostics Terminal */}
        <div className="bg-black/90 border border-emerald-500/30 rounded-lg p-3 max-w-xl mx-auto font-mono text-[11px] sm:text-xs text-left text-emerald-400/90 shadow-inner h-24 overflow-hidden flex flex-col justify-end">
          <div className="text-emerald-600 text-[10px] uppercase border-b border-emerald-500/20 pb-1 mb-1">
            TERMINAL DIAGNOSTICS // ACCESS BUS
          </div>
          {logs.map((log, idx) => (
            <div key={idx} className="truncate">
              {log}
            </div>
          ))}
        </div>
      </main>

      {/* Footer / Animated Runner */}
      <footer className="relative z-10 pb-4">
        <WormholeRunner speedSeconds={6} crewmateColor="#ef4444" />
      </footer>
    </div>
  );
}
