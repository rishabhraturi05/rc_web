"use client";

import React, { useState } from "react";
import { mapRooms } from "../data/rooms";

export default function SecurityMap() {
  const [selectedRoom, setSelectedRoom] = useState(mapRooms[0]);

  return (
    <section id="map" className="relative z-10 w-full max-w-5xl mx-auto my-12 px-4 font-vcr">
      <div className="crt-screen crt-scanlines p-4 sm:p-6 bg-gray-950/95 text-white border-2 border-green-500/70 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
        {/* Map Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-green-500/50 pb-3 mb-4 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-400 animate-ping" />
            <h2 className="text-xl sm:text-3xl font-bold text-white tracking-wider glow-white">
              SECURITY MAP
            </h2>
          </div>
          <span className="text-xs text-yellow-400 font-mono">
            CLICK / TAP ROOM TO INSPECT INTEL
          </span>
        </div>

        {/* Mobile Room Quick Select Tabs */}
        <div className="flex sm:hidden overflow-x-auto gap-2 pb-3 mb-3 scrollbar-none">
          {mapRooms.map((room) => {
            const isSelected = selectedRoom?.id === room.id;
            return (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-all ${
                  isSelected
                    ? "border-yellow-400 bg-yellow-500/20 text-yellow-300"
                    : "border-green-500/40 bg-gray-900 text-gray-300"
                }`}
              >
                {room.code}: {room.name}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Interactive Blueprint Canvas */}
          <div className="lg:col-span-2 relative min-h-[240px] sm:min-h-[300px] aspect-[16/10] w-full bg-gray-900/90 rounded-xl border-2 border-gray-700 p-2 overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,0.8)]">
            {/* Grid Lines */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #10b981 1px, transparent 1px),
                  linear-gradient(to bottom, #10b981 1px, transparent 1px)
                `,
                backgroundSize: "30px 30px",
              }}
            />

            {/* Room Boxes Rendered on Blueprint Map */}
            {mapRooms.map((room) => {
              const isSelected = selectedRoom?.id === room.id;

              return (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  onFocus={() => setSelectedRoom(room)}
                  tabIndex={0}
                  className={`absolute rounded-lg border-2 p-2 flex flex-col justify-between transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? "border-yellow-400 bg-yellow-500/20 shadow-[0_0_20px_rgba(245,158,11,0.7)] z-20 scale-105"
                      : "border-green-500/60 bg-gray-950/80 hover:border-yellow-400 hover:bg-gray-900/90 z-10"
                  }`}
                  style={{
                    top: `${room.y}%`,
                    left: `${room.x}%`,
                    width: `${room.width}%`,
                    height: `${room.height}%`,
                  }}
                  aria-label={`Inspect ${room.name}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] sm:text-xs font-bold truncate text-yellow-400">
                      {room.code}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  </div>
                  <div className="text-[10px] sm:text-xs font-bold text-white truncate text-left">
                    {room.name}
                  </div>
                </button>
              );
            })}

            {/* Connecting Corridor Overlay */}
            <div className="absolute top-[45%] left-[20%] right-[20%] h-3 bg-gray-800/80 border-t border-b border-green-500/30 pointer-events-none -z-0" />
          </div>

          {/* Room Details Sidebar Panel */}
          <div className="p-4 rounded-xl border border-green-500/40 bg-gray-900/90 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <span className="text-xs text-green-400 font-bold">SELECTED QUADRANT</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-950 text-green-300 border border-green-700">
                {selectedRoom?.code}
              </span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white glow-white mb-1">
                {selectedRoom?.name}
              </h3>
              <div className="text-xs text-yellow-400 font-bold mb-2">
                STATUS: {selectedRoom?.status}
              </div>
              <p className="text-xs text-gray-300 font-sans leading-relaxed">
                {selectedRoom?.description}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-gray-950 border border-yellow-500/30">
              <div className="text-[11px] text-yellow-400 font-bold mb-1">
                📌 ROOM TASK OBJECTIVE
              </div>
              <div className="text-xs text-white font-mono">{selectedRoom?.task}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
