"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { amongUsAssets } from "../data/amongUsAssets";

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
      <rect x="8" y="32" width="16" height="38" rx="8" fill={color} stroke="#050a14" strokeWidth="4" />
      <rect x="18" y="16" width="46" height="68" rx="23" fill={color} stroke="#050a14" strokeWidth="5" />
      <rect x="22" y="76" width="16" height="16" rx="6" fill={color} stroke="#050a14" strokeWidth="4" />
      <rect x="44" y="76" width="16" height="16" rx="6" fill={color} stroke="#050a14" strokeWidth="4" />
      <ellipse cx="48" cy="34" rx="18" ry="12" fill="#87ceeb" stroke="#050a14" strokeWidth="4" />
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
      
      const top = 5 + ((index * 17) % 80);
      const isLeft = index % 2 === 0;
      const left = isLeft ? 2 + ((index * 13) % 18) : 80 + ((index * 13) % 15);
      
      const duration = 20 + (index % 4) * 5;
      const delay = index * -3; 
      const scale = 0.6 + (index % 3) * 0.2;
      const opacity = 0.35 + (index % 3) * 0.2;
      const animationName = isLeft ? 'driftRight' : 'driftLeft';

      return { id: index, color, spriteUrl, top, left, duration, delay, scale, opacity, animationName };
    });
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden" aria-hidden="true">
      {crewmatesConfig.map((item) => (
        <div
          key={item.id}
          className="absolute"
          style={{
            top: `${item.top}%`,
            left: `${item.left}%`,
            opacity: item.opacity,
            transform: `scale(${item.scale})`,
            animation: `${item.animationName} ${item.duration}s ease-in-out infinite`,
            animationDelay: `${item.delay}s`,
          }}
        >
          <CrewmateSprite color={item.color} size={65} spriteUrl={item.spriteUrl} />
        </div>
      ))}

      <style jsx global>{`
        @keyframes driftRight {
          0% { transform: translate(0px, 0px) rotate(-15deg); }
          33% { transform: translate(50px, -70px) rotate(10deg); }
          66% { transform: translate(25px, 50px) rotate(-5deg); }
          100% { transform: translate(0px, 0px) rotate(-15deg); }
        }
        @keyframes driftLeft {
          0% { transform: translate(0px, 0px) rotate(15deg); }
          33% { transform: translate(-50px, 70px) rotate(-10deg); }
          66% { transform: translate(-25px, -50px) rotate(5deg); }
          100% { transform: translate(0px, 0px) rotate(15deg); }
        }
      `}</style>
    </div>
  );
}