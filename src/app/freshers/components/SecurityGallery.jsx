"use client";

import React, { useState } from "react";
import AmongUsModal from "./AmongUsModal";

// Camera Feeds Registry - 10 Local Event Photos
const CAMERA_FEEDS = [
  {
    id: 1,
    camId: "CAM-01",
    room: "ADMIN",
    timestamp: "18:22:10 UTC",
    url: "/gallery/photo1.jpeg",
  },
  {
    id: 2,
    camId: "CAM-02",
    room: "MEDBAY",
    timestamp: "18:24:35 UTC",
    url: "/gallery/photo2.jpeg",
  },
  {
    id: 3,
    camId: "CAM-03",
    room: "ELECTRICAL",
    timestamp: "18:26:50 UTC",
    url: "/gallery/photo3.jpeg",
  },
  {
    id: 4,
    camId: "CAM-04",
    room: "SECURITY",
    timestamp: "18:28:12 UTC",
    url: "/gallery/photo4.jpeg",
  },
  {
    id: 5,
    camId: "CAM-05",
    room: "CAFETERIA",
    timestamp: "18:30:45 UTC",
    url: "/gallery/photo5.jpeg",
  },
  {
    id: 6,
    camId: "CAM-06",
    room: "NAVIGATION",
    timestamp: "18:32:19 UTC",
    url: "/gallery/photo6.jpeg",
  },
  {
    id: 7,
    camId: "CAM-07",
    room: "WEAPONS",
    timestamp: "18:34:02 UTC",
    url: "/gallery/photo7.jpeg",
  },
  {
    id: 8,
    camId: "CAM-08",
    room: "REACTOR",
    timestamp: "18:36:28 UTC",
    url: "/gallery/photo8.jpeg",
  },
  {
    id: 9,
    camId: "CAM-09",
    room: "UPPER ENGINE",
    timestamp: "18:38:50 UTC",
    url: "/gallery/photo9.jpeg",
  },
  {
    id: 10,
    camId: "CAM-10",
    room: "LOWER ENGINE",
    timestamp: "18:40:15 UTC",
    url: "/gallery/photo10.jpeg",
  },

  {
    id: 11,
    camId: "CAM-11",
    room: "VENT",
    timestamp: "18:44:30 UTC",
    url: "/gallery/photo11.jpeg",
  },

  {
    id: 12,
    camId: "CAM-12",
    room: "MEETING",
    timestamp: "18:50:00 UTC",
    url: "/gallery/photo12.jpeg",
  },
];

export default function SecurityGallery() {
  const [selectedFeed, setSelectedFeed] = useState(null);

  return (
    <section id="gallery" className="relative z-10 w-full max-w-6xl mx-auto my-16 px-4 font-vcr">
      {/* CCTV STATION HEADER BAR */}
      <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-xl p-5 sm:p-6 mb-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-700/50 pb-4">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] shrink-0" />
            <div>
              <h2 className="text-xl sm:text-3xl font-black text-white tracking-wider uppercase drop-shadow">
                SKELD SECURITY GALLERY
              </h2>
              <p className="text-xs text-sky-400/90 font-mono mt-0.5">
                SURVEILLANCE CAM MONITORS // 10 DECLASSIFIED FEEDS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-sky-300 text-xs font-mono font-bold">
              ● 10 FEEDS LIVE
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-600/50 text-emerald-300 text-xs font-mono font-bold">
              STATUS: SECURED
            </span>
          </div>
        </div>

        <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-400 font-mono gap-2">
          <p>
            CLICK ANY FEED TO LAUNCH FULLSCREEN VIEWER WITH INTERACTIVE ANIMATIONS.
          </p>
          <span className="text-sky-400/80">SECURITY TERMINAL v4.2</span>
        </div>
      </div>

      {/* RESPONSIVE CCTV GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {CAMERA_FEEDS.map((feed) => (
          <div
            key={feed.id}
            onClick={() => setSelectedFeed(feed)}
            className="cctv-card group cursor-pointer aspect-[4/3] flex flex-col justify-between relative overflow-hidden"
          >
            {/* 4 Corner Rivets */}
            <div className="cctv-rivet top-1.5 left-1.5" />
            <div className="cctv-rivet top-1.5 right-1.5" />
            <div className="cctv-rivet bottom-1.5 left-1.5" />
            <div className="cctv-rivet bottom-1.5 right-1.5" />

            {/* Scanline Overlay */}
            <div className="cctv-scanline-overlay pointer-events-none" />

            {/* Top Bar with Camera Badge */}
            <div className="relative z-20 flex items-center justify-between px-3 py-2 bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 rec-dot shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                <span className="text-[10px] sm:text-xs font-mono font-bold text-sky-300 tracking-wider">
                  {feed.camId} [{feed.room}]
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 hidden sm:inline">
                REC
              </span>
            </div>

            {/* Local Image */}
            <div className="absolute inset-0 z-10 overflow-hidden">
              <img
                src={feed.url}
                alt={`${feed.camId} - ${feed.tag}`}
                className="w-full h-full object-cover cctv-image-glitch group-hover:brightness-105 transition-all duration-300"
                loading="lazy"
              />
            </div>

            {/* Bottom Info Bar */}
            <div className="relative z-20 px-3 py-2 bg-gradient-to-t from-black/95 via-black/75 to-transparent">
              <div className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-wider truncate group-hover:text-sky-300 transition-colors">
                {feed.tag}
              </div>
              <div className="flex items-center justify-between text-[8px] sm:text-[9px] text-slate-400 font-mono mt-0.5">
                <span>SEC-{feed.id.toString().padStart(2, "0")}</span>
                <span>{feed.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FULLSCREEN MODAL */}
      <AmongUsModal
        isOpen={Boolean(selectedFeed)}
        activeFeed={selectedFeed}
        onClose={() => setSelectedFeed(null)}
        onSelectFeed={(feed) => setSelectedFeed(feed)}
        allFeeds={CAMERA_FEEDS}
      />
    </section>
  );
}