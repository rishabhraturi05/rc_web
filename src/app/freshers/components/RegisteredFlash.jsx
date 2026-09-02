"use client";

import React, { useEffect, useState } from "react";

export default function RegisteredFlash({ onComplete, onReset, onReturn }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Lock scrolling on both html and body elements
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    // Prevent wheel and touch drag scrolling on mobile / desktop
    const preventScroll = (e) => {
      e.preventDefault();
    };

    window.addEventListener("touchmove", preventScroll, { passive: false });
    window.addEventListener("wheel", preventScroll, { passive: false });

    const totalTimer = setTimeout(() => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
      window.removeEventListener("touchmove", preventScroll);
      window.removeEventListener("wheel", preventScroll);

      setVisible(false);
      if (onComplete) onComplete();
      if (onReset) onReset();
      if (onReturn) onReturn();
    }, 4000);

    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
      window.removeEventListener("touchmove", preventScroll);
      window.removeEventListener("wheel", preventScroll);
      clearTimeout(totalTimer);
    };
  }, [onComplete, onReset, onReturn]);

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen min-h-[100dvh] z-[99999] bg-black/80 backdrop-blur-lg overflow-hidden flex items-center justify-center pointer-events-auto"
      style={{ touchAction: "none", overscrollBehavior: "none" }}
    >
      
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{ animation: 'revealText 4s linear forwards' }}
      >
        <h1 className="text-white font-vcr text-xl md:text-3xl tracking-widest text-center whitespace-nowrap">
          Your form has been submitted
        </h1>
      </div>

      <div 
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
        style={{ animation: 'moveSprite 4s linear forwards' }}
      >
        <img
          src="/freshers/among-us/crewmates/red.svg"
          alt="Ejected"
          className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
          style={{ animation: 'spinContinuous 2s linear infinite' }}
        />
      </div>

      <style jsx>{`
        @keyframes revealText {
          0% { clip-path: inset(0 100% 0 0); }
          100% { clip-path: inset(0 0% 0 0); }
        }
        @keyframes moveSprite {
          0% { left: 0%; }
          100% { left: 100%; }
        }
        @keyframes spinContinuous {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}