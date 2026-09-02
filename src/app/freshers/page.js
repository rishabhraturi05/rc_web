"use client";

import { useState, useEffect } from "react";
import FreshersExperience from "./components/FreshersExperience";
import CountdownGate from "./components/CountdownGate";

export function FreshersIntroOverlay() {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {showIntro && (
        <div className="shhh-overlay select-none">
          <div className="shhh-character-wrapper">
            <img src="/freshers/among-us/intro/shhh-wheel.png" alt="wheel" className="shhh-wheel" />
            <img src="/freshers/among-us/intro/shhh-body.png" alt="body" className="shhh-body" />
            <img src="/freshers/among-us/intro/shhh-hand.png" alt="hand" className="shhh-hand" />
          </div>
          <img src="/freshers/among-us/intro/Shhh-text.png" alt="SHHHHHHH!" className="shhh-text-img" />
        </div>
      )}
    </>
  );
}

export default function FreshersPage() {
  const [isLocked, setIsLocked] = useState(true);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkLock() {
      try {
        const res = await fetch("/api/freshers/time", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setIsLocked(data.isLocked && data.remainingMs > 0);
        }
      } catch (err) {
        console.error("Lock check error:", err);
      } finally {
        setIsChecking(false);
      }
    }
    checkLock();
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#05070a] text-cyan-400 font-vcr flex items-center justify-center">
        <div className="flex items-center gap-3 bg-gray-900 border border-cyan-500/40 px-6 py-4 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)]">
          <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
          <span className="tracking-widest text-sm uppercase">CONNECTING TO SECURITY GATEWAY...</span>
        </div>
      </div>
    );
  }

  if (isLocked) {
    return <CountdownGate onUnlock={() => setIsLocked(false)} />;
  }

  return (
    <>
      <FreshersIntroOverlay />
      <FreshersExperience />
    </>
  );
}