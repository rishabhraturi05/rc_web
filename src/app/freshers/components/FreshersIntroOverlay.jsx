"use client";

import React, { useState, useEffect } from "react";

export default function FreshersIntroOverlay() {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!showIntro) return null;

  return (
    <div className="shhh-overlay select-none">
      <div className="shhh-character-wrapper">
        <img src="/freshers/among-us/intro/shhh-wheel.png" alt="wheel" className="shhh-wheel" />
        <img src="/freshers/among-us/intro/shhh-body.png" alt="body" className="shhh-body" />
        <img src="/freshers/among-us/intro/shhh-hand.png" alt="hand" className="shhh-hand" />
      </div>
      <img src="/freshers/among-us/intro/Shhh-text.png" alt="SHHHHHHH!" className="shhh-text-img" />
    </div>
  );
}
