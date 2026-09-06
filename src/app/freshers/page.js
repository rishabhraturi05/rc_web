"use client";

import { useState, useEffect } from "react";
import FreshersExperience from "./components/FreshersExperience";

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
  return (
    <>
      <FreshersIntroOverlay />
      <FreshersExperience />
    </>
  );
}