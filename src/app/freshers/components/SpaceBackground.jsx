"use client";

import React from "react";

export default function SpaceBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#030712]">
      {/* Deep Space Radial Nebula Gradients */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: `
            radial-gradient(ellipse at 15% 75%, rgba(0, 255, 255, 0.12) 0%, transparent 60%),
            radial-gradient(ellipse at 85% 25%, rgba(231, 76, 60, 0.15) 0%, transparent 60%),
            radial-gradient(ellipse at 50% 50%, rgba(15, 23, 42, 0.9) 0%, #030712 100%)
          `,
        }}
      />

      {/* Grid line overlay for retro tech feel */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #00ffff 1px, transparent 1px),
            linear-gradient(to bottom, #00ffff 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Static Starfield Layer */}
      <div className="freshers-stars opacity-80" />

      {/* Distant Planet Glow */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-cyan-900/10 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-red-900/10 blur-3xl" />
    </div>
  );
}
