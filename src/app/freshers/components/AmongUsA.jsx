import React from "react";

/**
 * AmongUsA renders the stylized "A" shaped like the Among Us crewmate outline,
 * styled in the same 45° chamfered retro block font style as the surrounding VCR OSD Mono letters.
 * Matches: same size as other letters (0.85em), wide stance, and subtle matching glow.
 */
export default function AmongUsA({ className = "", glow = true }) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 ${className}`}
      style={{
        height: "0.85em",
        width: "auto",
        display: "inline-block",
        verticalAlign: "-0.01em",
        filter: glow
          ? "drop-shadow(0 0 10px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 20px rgba(255, 255, 255, 0.4))"
          : "none",
      }}
      aria-hidden="true"
    >
      {/* Backpack on right with 45° retro font chamfers */}
      <path
        d="M 19 7.5
           L 24 7.5
           L 25.5 9
           L 25.5 17.5
           L 24 19
           L 19 19"
        stroke="white"
        strokeWidth="2.2"
        strokeLinejoin="miter"
        strokeLinecap="square"
      />
      {/* Main Body with 45° chamfered dome, stubby wide legs, and inner leg arch */}
      <path
        d="M 7.5 2
           L 13.5 2
           L 19 7.5
           L 19 26
           L 13 26
           L 13 18
           L 12 17
           L 9 17
           L 8 18
           L 8 26
           L 2 26
           L 2 7.5
           Z"
        stroke="white"
        strokeWidth="2.2"
        strokeLinejoin="miter"
      />
      {/* Visor with 45° chamfered retro corners */}
      <path
        d="M 6.5 7.5
           L 14.5 7.5
           L 16.5 9.5
           L 16.5 11.5
           L 14.5 13.5
           L 6.5 13.5
           L 4.5 11.5
           L 4.5 9.5
           Z"
        stroke="white"
        strokeWidth="2"
        strokeLinejoin="miter"
      />
    </svg>
  );
}
