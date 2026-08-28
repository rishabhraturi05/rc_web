"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { amongUsAssets } from "../data/amongUsAssets";

// Reusable SVG Crewmate Component for fallback & crisp vector rendering
export function CrewmateSprite({ color = "#ef4444", size = 60, spriteUrl }) {
  const [imgError, setImgError] = useState(false);

  if (spriteUrl && !imgError) {
    return (
      <div style={{ width: size, height: size * 1.25 }} className="relative">
        <Image
          src={spriteUrl}
          alt="Crewmate"
          fill
          className="object-contain drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]"
          onError={() => setImgError(true)}
          unoptimized
        />
      </div>
    );
  }

  return (
    <svg
      width={size}
      height={size * 1.25}
      viewBox="0 0 80 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]"
    >
      {/* Backpack */}
      <rect x="8" y="32" width="16" height="38" rx="8" fill={color} stroke="#050a14" strokeWidth="4" />
      {/* Main Body */}
      <rect x="18" y="16" width="46" height="68" rx="23" fill={color} stroke="#050a14" strokeWidth="5" />
      {/* Left Leg */}
      <rect x="22" y="76" width="16" height="16" rx="6" fill={color} stroke="#050a14" strokeWidth="4" />
      {/* Right Leg */}
      <rect x="44" y="76" width="16" height="16" rx="6" fill={color} stroke="#050a14" strokeWidth="4" />
      {/* Visor Outer */}
      <ellipse cx="48" cy="34" rx="18" ry="12" fill="#87ceeb" stroke="#050a14" strokeWidth="4" />
      {/* Visor Glint */}
      <ellipse cx="45" cy="31" rx="10" ry="6" fill="#ffffff" opacity="0.8" />
    </svg>
  );
}

export default function FloatingCrewmates({ count = 6 }) {
  const crewmatesConfig = useMemo(() => {
    const colorKeys = ["red", "blue", "cyan", "yellow", "green", "purple"];
    const colors = ["#ef4444", "#3b82f6", "#06b6d4", "#f59e0b", "#10b981", "#8b5cf6"];

    return Array.from({ length: count }).map((_, index) => {
      const colorKey = colorKeys[index % colorKeys.length];
      const color = colors[index % colors.length];
      const spriteUrl = amongUsAssets.crewmates[colorKey];
      const top = 10 + ((index * 19) % 75);
      const left = 4 + ((index * 22) % 86);
      const duration = 12 + (index % 4) * 4;
      const delay = index * 1.5;
      const scale = 0.6 + (index % 3) * 0.2;
      const opacity = 0.35 + (index % 3) * 0.2;

      return { id: index, color, spriteUrl, top, left, duration, delay, scale, opacity };
    });
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden" aria-hidden="true">
      {crewmatesConfig.map((item) => (
        <div
          key={item.id}
          className="absolute transition-transform duration-1000"
          style={{
            top: `${item.top}%`,
            left: `${item.left}%`,
            opacity: item.opacity,
            transform: `scale(${item.scale})`,
            animation: `floatingCrewmateBob ${item.duration}s ease-in-out infinite`,
            animationDelay: `${item.delay}s`,
          }}
        >
          <CrewmateSprite color={item.color} size={65} spriteUrl={item.spriteUrl} />
        </div>
      ))}

      <style jsx global>{`
        @keyframes floatingCrewmateBob {
          0%, 100% {
            transform: translateY(0px) rotate(-8deg);
          }
          50% {
            transform: translateY(-30px) rotate(8deg);
          }
        }
      `}</style>
    </div>
  );
}
