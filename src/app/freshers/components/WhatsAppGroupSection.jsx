"use client";

import React, { useState, useEffect } from "react";

/*
function WhatsAppIcon({ className = "w-6 h-6" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.52 3.48A11.93 11.93 0 0 0 12.07 0C5.46 0 .09 5.37.09 11.98c0 2.11.55 4.17 1.6 6L0 24l6.2-1.63a11.95 11.95 0 0 0 5.86 1.52h.01c6.61 0 11.98-5.37 11.98-11.98 0-3.2-1.25-6.21-3.53-8.43zm-8.45 18.39h-.01c-1.8 0-3.56-.48-5.11-1.4l-.37-.22-3.79 1 1.01-3.69-.24-.38a9.92 9.92 0 0 1-1.52-5.2c0-5.48 4.46-9.94 9.95-9.94 2.66 0 5.15 1.03 7.03 2.91 1.88 1.88 2.91 4.37 2.91 7.03 0 5.48-4.46 9.94-9.94 9.94zm5.45-7.44c-.3-.15-1.77-.87-2.04-.97-.28-.1-.48-.15-.68.15-.2.3-.78.97-.95 1.17-.18.2-.35.23-.65.08-.3-.15-1.26-.47-2.4-1.49-.89-.79-1.49-1.77-1.66-2.07-.18-.3-.02-.46.13-.61.14-.14.3-.35.45-.53.15-.17.2-.3.3-.5.1-.2.05-.38-.03-.53-.07-.15-.68-1.63-.93-2.23-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.53.07-.8.38-.28.3-1.06 1.04-1.06 2.53 0 1.5 1.09 2.94 1.24 3.15.15.2 2.15 3.28 5.2 4.6 3.06 1.32 3.06.88 3.61.82.56-.05 1.77-.72 2.02-1.42.25-.7.25-1.3.18-1.42-.08-.13-.28-.2-.58-.35z" />
    </svg>
  );
}
*/

export default function WhatsAppGroupSection({ whatsappLink: initialLink = "" }) {
  // Returning null ensures the component renders nothing on the screen, 
  // without breaking any imports in parent files.
  return null;

  /*
  const [copied, setCopied] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState(
    initialLink ||
    process.env.NEXT_PUBLIC_WHATSAPP_GROUP_LINK ||
    process.env.NEXT_PUBLIC_WHATSAPP_LINK ||
    ""
  );

  useEffect(() => {
    if (initialLink) {
      setWhatsappLink(initialLink);
      return;
    }

    // Always fetch dynamically from API to guarantee reading live env
    fetch("/api/freshers/whatsapp")
      .then((res) => res.json())
      .then((data) => {
        if (data?.link) {
          setWhatsappLink(data.link);
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch WhatsApp link dynamically:", err);
      });
  }, [initialLink]);

  const handleCopy = (e) => {
    e.preventDefault();
    if (!whatsappLink) return;
    navigator.clipboard.writeText(whatsappLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      id="whatsapp-group"
      className="relative z-10 w-full max-w-4xl mx-auto my-6 px-4 font-vcr"
    >
      <div className="crt-screen crt-scanlines p-6 sm:p-8 bg-gray-950/95 text-white border-2 border-emerald-500/70 shadow-[0_0_35px_rgba(16,185,129,0.25)]">
        <div className="border-b-2 border-emerald-500/40 pb-3 mb-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/80 border border-emerald-500 text-emerald-400 text-xs font-bold rounded mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            COMMUNICATION RELAY • ENCRYPTED CHANNEL
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white glow-white tracking-wider uppercase">
            join whatsapp group link
          </h2>
          <p className="text-xs text-gray-400 mt-1 font-mono">
            CONNECT WITH FELLOW CREWMATES • RECEIVE REAL-TIME TRANSMISSIONS
          </p>
        </div>

        <div className="p-4 sm:p-5 mb-6 rounded-xl bg-gray-900/90 border border-gray-800 text-center">
          <p className="text-sm sm:text-base text-gray-200 leading-relaxed font-sans max-w-2xl mx-auto">
            Join the official Robotics Club NITW Project Skeld WhatsApp group to get instant mission updates, find crewmates to form teams, ask questions to seniors, and coordinate your event schedule.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={whatsappLink || "#"}
            target={whatsappLink ? "_blank" : "_self"}
            rel="noopener noreferrer"
            onClick={(e) => {
              if (!whatsappLink) {
                e.preventDefault();
                alert(
                  "WhatsApp group link is not detected. Please make sure you saved your .env.local file with: NEXT_PUBLIC_WHATSAPP_GROUP_LINK=https://chat.whatsapp.com/..."
                );
              }
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-base sm:text-lg text-white bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-700 hover:from-emerald-500 hover:to-green-400 border-2 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.6)] transform hover:scale-105 active:scale-95 transition-all cursor-pointer text-center"
          >
            <WhatsAppIcon className="w-6 h-6 shrink-0" />
            <span>join whatsapp group link</span>
          </a>

          {whatsappLink && (
            <button
              type="button"
              onClick={handleCopy}
              className="w-full sm:w-auto px-6 py-4 rounded-xl font-bold text-sm text-emerald-300 bg-gray-900 hover:bg-gray-800 border border-emerald-500/50 hover:border-emerald-400 transition-all cursor-pointer"
            >
              {copied ? "COPIED LINK! ✓" : "COPY LINK"}
            </button>
          )}
        </div>

        {!whatsappLink && (
          <p className="text-[11px] text-yellow-400/80 text-center mt-4 font-mono">
            * Please verify that NEXT_PUBLIC_WHATSAPP_GROUP_LINK is saved in your .env.local file (Ctrl + S).
          </p>
        )}
      </div>
    </section>
  );
  */
}