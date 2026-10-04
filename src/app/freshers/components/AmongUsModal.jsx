"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

// The 12 Distinct High-Production Animations
export const ANIMATION_TYPES = [
  { id: "zigzag", name: "⚡ Zig-Zag Hydraulic Gate", desc: "Interlocking sawtooth blast doors clamp together" },
  { id: "vent", name: "💨 Vent Infiltration Jump", desc: "Authentic Among Us vent opens with bean burst" },
  { id: "ejected", name: "🚀 Ejected Deep Space", desc: "Zero-G orbit with typewriter debrief" },
  { id: "emergency", name: "🚨 Emergency Meeting Slam", desc: "Red button press with alarm shockwave" },
  { id: "shhh", name: "🤫 SHHH! Silence Unveil", desc: "Authentic Crewmate bean silence gesture to iris reveal" },
  { id: "blast", name: "🛡️ Armored Blast Shields", desc: "Dual vertical hydraulic hazard doors slide open" },
  { id: "cctv", name: "📺 CCTV Signal De-scramble", desc: "Static noise and tracking sync to HD lock-in" },
  { id: "scanner", name: "🧬 Medbay Bio-Scanner", desc: "Holographic laser beam sweeps and projects image" },
  { id: "iris", name: "📸 Mechanical Iris Shutter", desc: "8-blade aerospace camera aperture expansion" },
  { id: "swipe", name: "💳 Admin Card Swipe Task", desc: "ID swipe through scanner with green accepted light" },
  { id: "spark", name: "🔌 Electrical Rewire Ignition", desc: "Wire spark arcs with CRT phosphor power-on" },
  { id: "radar", name: "📡 Navigation Radar Sonar", desc: "360° radar sweep line with acoustic sonar ping" },
];

export default function AmongUsModal({
  isOpen,
  activeFeed,
  onClose,
  onSelectFeed,
  allFeeds = [],
}) {
  const [mounted, setMounted] = useState(false);
  const [activeAnim, setActiveAnim] = useState("zigzag");
  const [stage, setStage] = useState("animating"); // "animating" | "settled"
  const [stars, setStars] = useState([]);

  const stageTimerRef = useRef(null);

  // Hydration safety for React Portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate background stars once
  useEffect(() => {
    const starList = Array.from({ length: 48 }).map((_, i) => ({
      id: i,
      left: `${(i * 17) % 100}%`,
      top: `${(i * 23) % 100}%`,
      size: (i % 3) + 1.2,
      delay: `${(i % 5) * 0.3}s`,
      duration: `${1.4 + (i % 4) * 0.4}s`,
    }));
    setStars(starList);
  }, []);

  // Body class to completely suppress the website navbar and lock scrolling
  useEffect(() => {
    if (!isOpen) return;

    document.body.classList.add("among-us-modal-active");

    // Pick a random animation among the 12
    const randomIndex = Math.floor(Math.random() * ANIMATION_TYPES.length);
    const chosenAnim = ANIMATION_TYPES[randomIndex].id;
    triggerAnimation(chosenAnim);

    return () => {
      document.body.classList.remove("among-us-modal-active");
      clearTimers();
    };
  }, [isOpen, activeFeed]);

  const clearTimers = () => {
    if (stageTimerRef.current) clearTimeout(stageTimerRef.current);
  };

  const triggerAnimation = (animId) => {
    clearTimers();
    setActiveAnim(animId);
    setStage("animating");

    stageTimerRef.current = setTimeout(() => {
      setStage("settled");
    }, 1500);
  };

  // Keyboard navigation: Escape to close, Arrows to navigate
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        navigateFeed(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        navigateFeed(1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, activeFeed, allFeeds]);

  if (!mounted || !isOpen || !activeFeed) return null;

  const navigateFeed = (direction) => {
    if (!allFeeds.length) return;
    const currentIndex = allFeeds.findIndex((f) => f.id === activeFeed.id);
    let newIndex = currentIndex + direction;
    if (newIndex < 0) newIndex = allFeeds.length - 1;
    if (newIndex >= allFeeds.length) newIndex = 0;
    if (onSelectFeed) onSelectFeed(allFeeds[newIndex]);
  };

  const skipAnimation = () => {
    clearTimers();
    setStage("settled");
  };

  const currentIndex = allFeeds.findIndex((f) => f.id === activeFeed.id) + 1;
  const currentAnimObj = ANIMATION_TYPES.find((a) => a.id === activeAnim) || ANIMATION_TYPES[0];

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[999999] w-screen h-screen bg-[#030712] text-slate-100 flex flex-col justify-between overflow-hidden select-none font-vcr"
    >
      {/* Background Star Ambient Dust */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        {stars.map((star) => (
          <span
            key={star.id}
            className="absolute rounded-full bg-slate-300"
            style={{
              left: star.left,
              top: star.top,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animation: `recBlink ${star.duration} infinite ${star.delay}`,
            }}
          />
        ))}
      </div>

      {/* ===================================================================== */}
      {/* 1. TOP HUD BAR (Bypasses website navbar completely via React Portal)  */}
      {/* ===================================================================== */}
      <header className="fullscreen-modal-header relative z-50 w-full px-4 sm:px-8 py-3 flex items-center justify-between border-b border-slate-700/60 bg-slate-900/90 backdrop-blur-xl shrink-0">
        {/* Left: Camera Feed Identification */}
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
            <span className="text-sm sm:text-base font-black tracking-widest text-white uppercase drop-shadow">
              {activeFeed.camId} [{activeFeed.room || "SECTOR"}]
            </span>
            <span className="text-xs text-sky-400 font-mono hidden sm:inline">
              LIVE REC // {activeFeed.timestamp || "26.09.2026 18:22:10 UTC"}
            </span>
          </div>
        </div>

        {/* Center: Fullscreen Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-mono text-slate-300">
          <span>CINEMA FULLSCREEN</span>
          <span className="text-sky-400">•</span>
          <span className="text-sky-300">{currentIndex} / {allFeeds.length || 10}</span>
        </div>

        {/* Right: Animation Replay Selector & Close Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Animation Picker Dropdown */}
          {/* <div className="relative hidden sm:block">
            <select
              value={activeAnim}
              onChange={(e) => triggerAnimation(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-800/90 border border-slate-600/70 text-xs text-sky-300 font-mono tracking-wider hover:border-sky-400/60 focus:outline-none cursor-pointer"
              title="Select & Replay Animation"
            >
              {ANIMATION_TYPES.map((anim) => (
                <option key={anim.id} value={anim.id} className="bg-slate-900 text-slate-200">
                  {anim.name}
                </option>
              ))}
            </select>
          </div> */}

          {/* Quick Replay Button */}
          <button
            onClick={() => triggerAnimation(activeAnim)}
            className="fullscreen-btn px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider flex items-center gap-1 cursor-pointer"
            title="Replay Current Animation"
          >
            <span>🔄</span>
            <span className="hidden md:inline">REPLAY</span>
          </button>

          {/* Close Button (Eye-Soothing Crimson) */}
          <button
            onClick={onClose}
            className="fullscreen-report-btn px-3.5 sm:px-4 py-1.5 rounded-lg font-bold text-xs sm:text-sm tracking-wider flex items-center gap-1.5 cursor-pointer"
            title="Close Fullscreen (Escape)"
          >
            <span>✕</span>
            <span>CLOSE</span>
            <span className="hidden sm:inline text-[10px] opacity-80 font-mono ml-0.5">[ESC]</span>
          </button>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* 2. CENTER STAGE: FULLSCREEN IMAGE & 12 ANIMATION ENGINES              */}
      {/* ===================================================================== */}
      <main className="relative flex-1 w-full h-full flex items-center justify-center p-2 sm:p-6 overflow-hidden">

        {/* ------------------------------------------------------------------- */}
        {/* A. ACTIVE ANIMATION SEQUENCE (Plays when stage === "animating")     */}
        {/* ------------------------------------------------------------------- */}
        {stage === "animating" && (
          <div
            onClick={skipAnimation}
            className="absolute inset-0 z-40 flex items-center justify-center p-4 cursor-pointer overflow-hidden"
            title="Click anywhere to skip animation"
          >
            {/* 1. ZIG-ZAG HYDRAULIC GATE ANIMATION */}
            {activeAnim === "zigzag" && (
              <div className="relative w-full max-w-5xl aspect-[16/10] sm:aspect-[16/9] flex items-center justify-center">
                {/* Left Zig-Zag Half */}
                <div
                  className="absolute inset-0 w-full h-full"
                  style={{
                    animation: "zigzagSlideLeft 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                    clipPath: "polygon(0% 0%, 50% 0%, 55% 15%, 45% 30%, 55% 45%, 45% 60%, 55% 75%, 45% 90%, 50% 100%, 0% 100%)",
                  }}
                >
                  <img src={activeFeed.url} alt="left" className="w-full h-full object-cover rounded-xl border border-sky-400/40" />
                </div>
                {/* Right Zig-Zag Half */}
                <div
                  className="absolute inset-0 w-full h-full"
                  style={{
                    animation: "zigzagSlideRight 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                    clipPath: "polygon(100% 0%, 50% 0%, 55% 15%, 45% 30%, 55% 45%, 45% 60%, 55% 75%, 45% 90%, 50% 100%, 100% 100%)",
                  }}
                >
                  <img src={activeFeed.url} alt="right" className="w-full h-full object-cover rounded-xl border border-sky-400/40" />
                </div>
              </div>
            )}

            {/* 2. AUTHENTIC AMONG US VENT INFILTRATION JUMP */}
            {activeAnim === "vent" && (
              <div className="relative flex flex-col items-center justify-center w-full max-w-4xl">
                {/* Emerging Photo */}
                <div
                  className="w-full max-w-3xl aspect-[16/10] rounded-xl overflow-hidden border-2 border-slate-600 shadow-2xl relative z-20"
                  style={{ animation: "ventEmergeBurst 1.3s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
                >
                  <img src={activeFeed.url} alt="vent reveal" className="w-full h-full object-cover" />
                </div>

                {/* Steam Burst Puff */}
                <div
                  className="absolute bottom-16 z-15 w-52 h-52 rounded-full bg-slate-300/35 blur-2xl pointer-events-none"
                  style={{ animation: "ventSteamShockwave 1.2s ease-out forwards" }}
                />

                {/* Real Among Us Vent & Popping Crewmate Bean */}
                <div className="relative z-30 mt-6 flex flex-col items-center">
                  {/* Venting Cyan Crewmate Sprite */}
                  <div className="relative -mb-4 z-40 w-16 h-20 animate-bounce">
                    <img
                      src="/freshers/among-us/crewmates/cyan.svg"
                      alt="venting crewmate"
                      className="w-full h-full object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
                    />
                  </div>

                  {/* Authentic Metal Vent Grate */}
                  <div
                    className="w-56 sm:w-68 h-20 bg-zinc-900 border-4 border-zinc-700 rounded-lg shadow-2xl flex flex-col justify-between p-2.5"
                    style={{ animation: "ventFlapOpen 1.4s ease-out forwards" }}
                  >
                    <div className="w-full h-2 bg-zinc-800 border-y border-zinc-600 rounded" />
                    <div className="w-full h-2 bg-zinc-800 border-y border-zinc-600 rounded" />
                    <div className="w-full h-2 bg-zinc-800 border-y border-zinc-600 rounded" />
                    <div className="absolute inset-0 bg-cyan-600/15 blur-sm pointer-events-none" />
                  </div>
                </div>
              </div>
            )}

            {/* 3. EJECTED DEEP SPACE ORBIT */}
            {activeAnim === "ejected" && (
              <div className="relative flex flex-col items-center justify-center w-full max-w-4xl">
                <div
                  className="w-full max-w-2xl aspect-[16/10] rounded-xl overflow-hidden border-2 border-sky-400 shadow-[0_0_30px_rgba(56,189,248,0.4)]"
                  style={{ animation: "ejectOrbitTravel 1.6s cubic-bezier(0.25, 1, 0.5, 1) forwards" }}
                >
                  <img src={activeFeed.url} alt="ejected" className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            {/* 4. EMERGENCY MEETING SLAM */}
            {activeAnim === "emergency" && (
              <div className="relative flex flex-col items-center justify-center w-full max-w-4xl">
                {/* Big Red Emergency Button */}
                <div
                  className="absolute z-30 w-32 h-32 rounded-full bg-gradient-to-b from-red-500 to-red-900 border-4 border-red-950 flex items-center justify-center shadow-2xl"
                  style={{ animation: "emergencyBtnPress 1.2s ease-out forwards" }}
                >
                  <div className="w-24 h-24 rounded-full bg-red-600 border-2 border-red-300/40 flex items-center justify-center text-white font-black text-xs text-center">
                    EMERGENCY
                  </div>
                </div>
                {/* Shockwave Ring */}
                <div
                  className="absolute z-20 w-40 h-40 rounded-full border-4 border-red-500 pointer-events-none"
                  style={{ animation: "emergencyShockwave 1.1s ease-out forwards" }}
                />
                {/* Image Slamming In */}
                <div
                  className="w-full max-w-4xl aspect-[16/10] rounded-xl overflow-hidden border-2 border-red-500/80 shadow-[0_0_40px_rgba(239,68,68,0.5)] z-10"
                  style={{ animation: "emergencyPhotoSlam 1.3s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
                >
                  <img src={activeFeed.url} alt="emergency" className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            {/* 5. AUTHENTIC AMONG US "SHHH!" BEAN ANIMATION */}
            {activeAnim === "shhh" && (
              <div className="relative flex flex-col items-center justify-center w-full max-w-4xl">
                {/* Authentic Among Us SHHH Characters Scene */}
                <div
                  className="absolute z-30 flex flex-col items-center pointer-events-none"
                  style={{ animation: "shhhVisorPulse 1.4s ease-out forwards" }}
                >
                  <div className="relative w-56 h-56 sm:w-72 sm:h-72 flex items-center justify-center">
                    {/* Spinning Background Wheel */}
                    <img
                      src="/freshers/among-us/intro/shhh-wheel.png"
                      alt="shhh wheel"
                      className="absolute inset-0 w-full h-full object-contain"
                      style={{ animation: "shhhWheelSpin 12s linear infinite" }}
                    />
                    {/* Red Crewmate Body Bean */}
                    <img
                      src="/freshers/among-us/intro/shhh-body.png"
                      alt="shhh body"
                      className="absolute w-[60%] h-[60%] object-contain z-10"
                    />
                    {/* Shushing Hand Gesture */}
                    <img
                      src="/freshers/among-us/intro/shhh-hand.png"
                      alt="shhh hand"
                      className="absolute w-[60%] h-[60%] object-contain z-20"
                      style={{ animation: "shhhHandGesture 0.6s ease-out forwards" }}
                    />
                  </div>
                  {/* Official SHHHHH Text Banner */}
                  <img
                    src="/freshers/among-us/intro/Shhh-text.png"
                    alt="SHHHHH"
                    className="w-48 sm:w-60 mt-3 object-contain z-30 drop-shadow-lg"
                    style={{ animation: "shhhTextPop 0.5s ease-out 0.4s forwards" }}
                  />
                </div>

                {/* Expanding Image behind */}
                <div
                  className="w-full max-w-4xl aspect-[16/10] rounded-xl overflow-hidden border border-slate-600 shadow-2xl z-10"
                  style={{ animation: "shhhPhotoUnveil 1.5s ease-out forwards" }}
                >
                  <img src={activeFeed.url} alt="shhh" className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            {/* 6. HYDRAULIC BLAST DOORS */}
            {activeAnim === "blast" && (
              <div className="relative w-full max-w-4xl aspect-[16/10] rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
                <img src={activeFeed.url} alt="blast reveal" className="w-full h-full object-cover" />
                {/* Top Blast Shield */}
                <div
                  className="absolute inset-x-0 top-0 h-1/2 bg-slate-900 border-b-4 border-amber-500/80 z-20"
                  style={{ animation: "blastDoorSlideUp 1.3s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
                />
                {/* Bottom Blast Shield */}
                <div
                  className="absolute inset-x-0 bottom-0 h-1/2 bg-slate-900 border-t-4 border-amber-500/80 z-20"
                  style={{ animation: "blastDoorSlideDown 1.3s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
                />
              </div>
            )}

            {/* 7. CCTV SIGNAL DE-SCRAMBLE */}
            {activeAnim === "cctv" && (
              <div className="relative w-full max-w-4xl aspect-[16/10] rounded-xl overflow-hidden border border-slate-600 shadow-2xl">
                {/* Glitch Static Layer */}
                <div
                  className="absolute inset-0 bg-slate-800/80 z-20 flex flex-col items-center justify-center pointer-events-none"
                  style={{ animation: "cctvNoiseDejitter 1.3s ease-out forwards" }}
                >
                  <div className="w-full h-full bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.5)_0px,rgba(0,0,0,0.5)_2px,transparent_2px,transparent_4px)] pointer-events-none" />
                </div>
                <div
                  className="w-full h-full"
                  style={{ animation: "cctvLockIn 1.3s ease-out forwards" }}
                >
                  <img src={activeFeed.url} alt="cctv" className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            {/* 8. MEDBAY BIO-SCANNER */}
            {activeAnim === "scanner" && (
              <div className="relative w-full max-w-4xl aspect-[16/10] rounded-xl overflow-hidden border border-emerald-500/50 shadow-2xl">
                <div
                  className="w-full h-full"
                  style={{ animation: "medbayRevealLine 1.4s ease-out forwards" }}
                >
                  <img src={activeFeed.url} alt="medbay" className="w-full h-full object-cover" />
                </div>
                {/* Sweeping Laser Bar */}
                <div
                  className="absolute inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_rgba(52,211,153,0.9)] z-20 pointer-events-none"
                  style={{ animation: "medbayLaserBar 1.4s ease-out forwards" }}
                />
              </div>
            )}

            {/* 9. MECHANICAL IRIS SHUTTER */}
            {activeAnim === "iris" && (
              <div className="relative w-full max-w-4xl aspect-[16/10] rounded-xl overflow-hidden border border-sky-500/40 shadow-2xl">
                <div
                  className="w-full h-full"
                  style={{ animation: "irisApertureBlade 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
                >
                  <img src={activeFeed.url} alt="iris" className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            {/* 10. ADMIN CARD SWIPE */}
            {activeAnim === "swipe" && (
              <div className="relative flex flex-col items-center justify-center w-full max-w-4xl">
                <div
                  className="w-full max-w-3xl aspect-[16/10] rounded-xl overflow-hidden border-2 border-emerald-400/70 shadow-2xl z-20"
                  style={{ animation: "cardSwipeAction 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
                >
                  <img src={activeFeed.url} alt="swipe" className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            {/* 11. WIRE SPARK IGNITION */}
            {activeAnim === "spark" && (
              <div className="relative w-full max-w-4xl aspect-[16/10] rounded-xl overflow-hidden border border-slate-700 shadow-2xl flex items-center justify-center">
                {/* Electric Spark Flash */}
                <div
                  className="absolute z-30 w-32 h-32 rounded-full bg-cyan-400/40 blur-xl pointer-events-none"
                  style={{ animation: "wireSparkBurst 1.2s ease-out forwards" }}
                />
                <div
                  className="w-full h-full"
                  style={{ animation: "crtPowerBloom 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
                >
                  <img src={activeFeed.url} alt="spark bloom" className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            {/* 12. RADAR SONAR PING */}
            {activeAnim === "radar" && (
              <div className="relative w-full max-w-4xl aspect-[16/10] rounded-xl overflow-hidden border border-emerald-500/40 shadow-2xl flex items-center justify-center">
                {/* Sonar Ping Ring */}
                <div
                  className="absolute z-20 w-48 h-48 rounded-full border-2 border-emerald-400 pointer-events-none"
                  style={{ animation: "radarSonarPing 1.3s ease-out forwards" }}
                />
                {/* Rotating Sweep Beam */}
                <div
                  className="absolute z-20 w-80 h-80 pointer-events-none"
                  style={{ animation: "radarSweepArm 1.3s linear forwards" }}
                >
                  <div className="w-1/2 h-0.5 bg-gradient-to-r from-emerald-400 to-transparent" />
                </div>
                <img src={activeFeed.url} alt="radar" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* B. SETTLED FULLSCREEN PRESENTATION (Expansive Cinema View)          */}
        {/* ------------------------------------------------------------------- */}
        {stage === "settled" && (
          <div className="relative w-full h-full flex items-center justify-center p-1 sm:p-4 animate-in fade-in zoom-in-95 duration-200">
            {/* High-Resolution Fullscreen Image Display */}
            <div className="relative max-h-[82vh] max-w-[95vw] rounded-xl overflow-hidden border border-slate-700/80 shadow-[0_20px_50px_rgba(0,0,0,0.9)] bg-black flex items-center justify-center">
              {/* Subtle Scanline Overlay */}
              <div className="cctv-scanline-overlay" />

              <img
                src={activeFeed.url}
                alt={activeFeed.tag}
                className="max-h-[82vh] max-w-[95vw] w-auto h-auto object-contain rounded-xl"
              />

              {/* Corner Crosshairs */}
              <div className="absolute top-3 left-3 text-sky-400/70 font-mono text-xs pointer-events-none">
                ┌─ [{activeFeed.camId}]
              </div>
              <div className="absolute bottom-3 right-3 text-sky-400/70 font-mono text-xs pointer-events-none">
                [GRID LOCKED] ─┘
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ===================================================================== */}
      {/* 3. BOTTOM HUD CONTROL BAR                                             */}
      {/* ===================================================================== */}
      <footer className="relative z-50 w-full px-4 sm:px-8 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-slate-700/60 bg-slate-900/90 backdrop-blur-xl shrink-0 gap-3">
        {/* Left: Metadata & Tag */}
        <div className="text-center sm:text-left">
          <h3 className="text-sm sm:text-base font-bold text-white tracking-wide uppercase drop-shadow">
            TAG: {activeFeed.tag}
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            LOCATION: {activeFeed.room || "SKELD COMMAND"} • STATUS: DECLASSIFIED
          </p>
        </div>

        {/* Center: Previous / Next Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateFeed(-1)}
            className="fullscreen-btn px-4 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider cursor-pointer"
            title="Previous (Left Arrow)"
          >
            ◄ PREV
          </button>
          <span className="text-xs font-mono text-sky-300 px-2">
            {currentIndex} / {allFeeds.length || 10}
          </span>
          <button
            onClick={() => navigateFeed(1)}
            className="fullscreen-btn px-4 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider cursor-pointer"
            title="Next (Right Arrow)"
          >
            NEXT ►
          </button>
        </div>

        {/* Right: Active Animation Indicator & Shuffle Next */}
        <div className="flex items-center gap-2">
          <span className="hidden lg:inline text-[11px] font-mono text-slate-400 border border-slate-700/80 px-2.5 py-1 rounded bg-slate-800/60">
            ANIM: {currentAnimObj.name.split(" ")[1] || "EFFECT"}
          </span>
          <button
            onClick={() => {
              const randomIndex = Math.floor(Math.random() * ANIMATION_TYPES.length);
              triggerAnimation(ANIMATION_TYPES[randomIndex].id);
            }}
            className="fullscreen-btn px-3 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider flex items-center gap-1.5 cursor-pointer"
            title="Trigger a new random animation on this photo"
          >
            <span>🎲</span>
            <span>SHUFFLE FX</span>
          </button>
        </div>
      </footer>
    </div>
  );

  return createPortal(modalContent, document.body);
}

