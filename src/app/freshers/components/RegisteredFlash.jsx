"use client";

import React, { useEffect, useState } from "react";

export default function RegisteredFlash({ onComplete }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onComplete) onComplete();
    }, 1200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none" 
      style={{ animation: 'screenShake 0.35s ease-out' }}
    >
      <div 
        className="relative w-full max-w-7xl flex items-center justify-center"
        style={{ animation: 'slamIn 0.25s cubic-bezier(0.1, 0.9, 0.2, 1) forwards' }}
      >
        <img
          src="/freshers/among-us/registration/registered.png"
          alt="Flash"
          className="w-full max-h-[30vh] object-cover drop-shadow-[0_0_20px_rgba(255,0,0,0.8)]"
        />
        <h1 
          className="absolute text-5xl md:text-8xl font-black text-black tracking-[0.2em] drop-shadow-[0_8px_16px_rgba(0,0,0,1)]" 
          style={{ fontFamily: 'Impact, sans-serif' }}
        >
          REGISTERED
        </h1>
      </div>
      <style jsx>{`
        @keyframes slamIn {
          0% { transform: scale(4); opacity: 0; }
          40% { transform: scale(0.9); opacity: 1; }
          70% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes screenShake {
          0%, 100% { transform: translate(0, 0); }
          20% { transform: translate(-12px, 8px) rotate(-2deg); }
          40% { transform: translate(12px, -8px) rotate(2deg); }
          60% { transform: translate(-6px, 4px) rotate(-1deg); }
          80% { transform: translate(6px, -4px) rotate(1deg); }
        }
      `}</style>
    </div>
  );
}