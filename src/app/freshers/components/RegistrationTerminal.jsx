"use client";

import React, { useState, useEffect } from "react";
import EmergencyButton from "./EmergencyButton";
import RegisteredFlash from "./RegisteredFlash";
import { submitFreshersRegistration } from "../lib/registrationApi";

const BRANCHES = ["CSE", "CSE(AIDS)", "MNC", "ECE", "ECE(VLSI)", "EEE", "EEE(Electric Mobility)", "MECH", "CIVIL", "CHEM", "BIOTECH", "META", "BSC-BED", "INTEGRATED MSC"];

const initialForm = {
  name: "",
  email: "",
  contactNo: "",
  rollNo: "",
  branch: "",
  teamName: "",
  considerRecruitment: false,
};

function DeadCrewmateIcon({ className = "w-14 h-14" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Backpack */}
      <rect x="18" y="52" width="16" height="34" rx="8" fill="#B91C1C" stroke="#050a14" strokeWidth="4.5" />

      {/* Left Leg */}
      <rect x="30" y="72" width="20" height="24" rx="8" fill="#EF4444" stroke="#050a14" strokeWidth="4.5" />
      {/* Right Leg */}
      <rect x="58" y="72" width="20" height="24" rx="8" fill="#EF4444" stroke="#050a14" strokeWidth="4.5" />

      {/* Lower Torso Body */}
      <path
        d="M26 50 C26 50, 24 74, 32 76 C40 78, 50 78, 54 70 C58 78, 68 78, 76 76 C84 74, 82 50, 82 50 Z"
        fill="#EF4444"
        stroke="#050a14"
        strokeWidth="4.5"
        strokeLinejoin="round"
      />

      {/* Body Shadows */}
      <path d="M26 58 C27 70, 34 76, 44 76 C38 72, 34 66, 34 58 Z" fill="#B91C1C" opacity="0.6" />
      <path d="M64 72 C68 76, 74 76, 78 72 C80 66, 80 58, 80 58 C78 64, 72 70, 64 72 Z" fill="#B91C1C" opacity="0.6" />

      {/* Severed Flesh / Cut Surface */}
      <ellipse cx="54" cy="50" rx="28" ry="9" fill="#991B1B" stroke="#050a14" strokeWidth="4.5" />
      <ellipse cx="54" cy="50" rx="23" ry="6" fill="#DC2626" />
      <ellipse cx="54" cy="50" rx="16" ry="3.5" fill="#7F1D1D" />

      {/* Bone Base Ring */}
      <ellipse cx="54" cy="49" rx="8" ry="3" fill="#E2E8F0" stroke="#050a14" strokeWidth="2" />

      {/* Bone Shaft */}
      <path d="M49 22 L49 48 L59 48 L59 22 Z" fill="#F8FAFC" stroke="#050a14" strokeWidth="4" strokeLinejoin="round" />

      {/* Bone Lobes */}
      <circle cx="47" cy="18" r="7.5" fill="#F8FAFC" stroke="#050a14" strokeWidth="4" />
      <circle cx="61" cy="18" r="7.5" fill="#F8FAFC" stroke="#050a14" strokeWidth="4" />

      {/* Clean Bone Center Joint */}
      <rect x="49.5" y="16" width="9" height="12" fill="#F8FAFC" />
      <circle cx="47" cy="18" r="5.5" fill="#F8FAFC" />
      <circle cx="61" cy="18" r="5.5" fill="#F8FAFC" />

      {/* Bone Highlights */}
      <path d="M46 16 C46 14, 48 13, 50 14" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      <path d="M52 24 L52 44" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function WhatsAppIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.52 3.48A11.93 11.93 0 0 0 12.07 0C5.46 0 .09 5.37.09 11.98c0 2.11.55 4.17 1.6 6L0 24l6.2-1.63a11.95 11.95 0 0 0 5.86 1.52h.01c6.61 0 11.98-5.37 11.98-11.98 0-3.2-1.25-6.21-3.53-8.43zm-8.45 18.39h-.01c-1.8 0-3.56-.48-5.11-1.4l-.37-.22-3.79 1 1.01-3.69-.24-.38a9.92 9.92 0 0 1-1.52-5.2c0-5.48 4.46-9.94 9.95-9.94 2.66 0 5.15 1.03 7.03 2.91 1.88 1.88 2.91 4.37 2.91 7.03 0 5.48-4.46 9.94-9.94 9.94zm5.45-7.44c-.3-.15-1.77-.87-2.04-.97-.28-.1-.48-.15-.68.15-.2.3-.78.97-.95 1.17-.18.2-.35.23-.65.08-.3-.15-1.26-.47-2.4-1.49-.89-.79-1.49-1.77-1.66-2.07-.18-.3-.02-.46.13-.61.14-.14.3-.35.45-.53.15-.17.2-.3.3-.5.1-.2.05-.38-.03-.53-.07-.15-.68-1.63-.93-2.23-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.53.07-.8.38-.28.3-1.06 1.04-1.06 2.53 0 1.5 1.09 2.94 1.24 3.15.15.2 2.15 3.28 5.2 4.6 3.06 1.32 3.06.88 3.61.82.56-.05 1.77-.72 2.02-1.42.25-.7.25-1.3.18-1.42-.08-.13-.28-.2-.58-.35z" />
    </svg>
  );
}

const DEFAULT_WHATSAPP_LINK = "https://chat.whatsapp.com/BxeQpDzIxAK1CnUylO4nV7";

export default function RegistrationTerminal({ eventConfig, onSuccessComplete }) {
  const [formData, setFormData] = useState(initialForm);
  const [participants, setParticipants] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [terminalLog, setTerminalLog] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [registeredData, setRegisteredData] = useState(null);
  const [showWhatsappOverlay, setShowWhatsappOverlay] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState(
    process.env.NEXT_PUBLIC_WHATSAPP_GROUP_LINK ||
    process.env.NEXT_PUBLIC_WHATSAPP_LINK ||
    DEFAULT_WHATSAPP_LINK
  );

  useEffect(() => {
    const fetchWhatsappLink = async () => {
      try {
        const response = await fetch("/api/freshers/whatsapp");
        if (response.ok) {
          const data = await response.json();
          if (data?.link) {
            setWhatsappLink(data.link);
            return;
          }
        }
        // Fallback to /api/whatsapp if needed
        const fallbackRes = await fetch("/api/whatsapp");
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          if (fallbackData?.link) {
            setWhatsappLink(fallbackData.link);
          }
        }
      } catch (error) {
        console.warn("WhatsApp link fetch error:", error);
      }
    };
    fetchWhatsappLink();
  }, []);

  useEffect(() => {
    if (showWhatsappOverlay) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [showWhatsappOverlay]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === "checkbox" ? checked : value;

    if (name === "rollNo") {
      finalValue = finalValue.toUpperCase();
    }

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const addParticipant = () => {
    if (participants.length >= 5) return;
    setParticipants((prev) => [...prev, { name: "", rollNo: "" }]);
  };
  
  const removeParticipant = (index) => {
    setParticipants((prev) => prev.filter((_, i) => i !== index));
  };
  
  const updateParticipant = (index, field, value) => {
    let finalValue = value;
    if (field === "rollNo") {
      finalValue = finalValue.toUpperCase();
    }
    setParticipants((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: finalValue } : p))
    );
  };

  const handleFullReset = () => {
    setShowWhatsappOverlay(false);
    setFormData(initialForm);
    setParticipants([]);
    setSubmitting(false);
    setTerminalLog("");
    setErrorMessage("");
  };

  const handleRegisterSubmit = async (e) => {
    if (e) e.preventDefault();
    if (submitting) return;
    setErrorMessage("");

    if (!formData.name.trim() || !formData.email.trim() || !formData.contactNo.trim() || !formData.rollNo.trim() || !formData.branch || !formData.teamName.trim()) {
      setErrorMessage("MISSING REQUIRED FIELDS. FILL ALL CREWMATE IDENTIFICATION DATA.");
      return;
    }

    const rollRegex = /^26(CSB0A|CSB0B|CSB1A|ECB0A|ECB0B|ECB1A|EEB0A|EEB0B|EEB1A|EMB0A|MEB0A|MEB0B|CEB0A|CEB0B|CHB0A|CHB0B|BTB0A|MMB0A|CYE00|PHE00|EDI00|DSB0A|MAE00)[0-9]{2}$/i;
    
    if (!rollRegex.test(formData.rollNo)) {
      setErrorMessage("INVALID LEADER ROLL NUMBER FORMAT. VERIFY YOUR BRANCH CODE.");
      return;
    }

    const cleanParticipants = participants
      .map((p) => ({
        name: typeof p === "string" ? p.trim() : (p.name || "").trim(),
        rollNo: typeof p === "string" ? "" : (p.rollNo || "").trim(),
      }))
      .filter((p) => p.name.length > 0);

    const missingRoll = cleanParticipants.some((p) => !p.rollNo);
    if (missingRoll) {
      setErrorMessage("ROLL NUMBER IS REQUIRED FOR ALL TEAM PARTICIPANTS.");
      alert("⚠️ REGISTRATION BLOCKED:\nROLL NUMBER IS REQUIRED FOR ALL TEAM PARTICIPANTS.");
      return;
    }

    const invalidCrewmateRoll = cleanParticipants.some((p) => !rollRegex.test(p.rollNo));
    if (invalidCrewmateRoll) {
      setErrorMessage("ONE OR MORE CREWMATES HAVE AN INVALID ROLL NUMBER FORMAT.");
      alert("⚠️ REGISTRATION BLOCKED:\nONE OR MORE CREWMATES HAVE AN INVALID ROLL NUMBER FORMAT.");
      return;
    }

    setSubmitting(true);
    setTerminalLog("> INITIALIZING CREWMATE DATA TRANSMISSION...");

    setTimeout(() => {
      setTerminalLog("> VERIFYING IDENTITY WITH RC FLIGHT COMMAND...");
    }, 600);

    const payload = {
      ...formData,
      participants: cleanParticipants,
    };

    const res = await submitFreshersRegistration(payload);

    if (res.success) {
      setTerminalLog("> TRANSMISSION COMPLETE. CREWMATE VERIFIED.");
      setTimeout(() => {
        setRegisteredData(payload);
        if (onSuccessComplete) onSuccessComplete();
      }, 800);
    } else {
      setSubmitting(false);
      setTerminalLog("> TRANSMISSION FAILED.");
      const errorMsg = res.error || "TRANSMISSION ERROR. PLEASE RETRY.";
      setErrorMessage(errorMsg);
      alert(`⚠️ REGISTRATION BLOCKED:\n\n${errorMsg}`);
    }
  };

  return (
    <section id="register" className="relative z-10 w-full max-w-3xl mx-auto my-12 px-4 font-vcr">
      {registeredData && (
        <RegisteredFlash
          registrationData={registeredData}
          eventConfig={eventConfig}
          onReset={() => {
            setRegisteredData(null);
            setShowWhatsappOverlay(true);
          }}
        />
      )}

      {/* Full-Screen Pop-up Modal with Blurred Background */}
      {showWhatsappOverlay && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          {/* Backdrop Click Dismiss */}
          <div
            className="absolute inset-0 cursor-pointer"
            onClick={handleFullReset}
            aria-hidden="true"
          />

          {/* Centered Modal Pop-up Card with Blue/Cyan Sci-Fi Styling */}
          <div className="relative z-10 w-full max-w-lg mx-auto p-6 sm:p-8 bg-gray-950/95 rounded-2xl border-2 border-cyan-400 shadow-[0_0_45px_rgba(6,182,212,0.55),inset_0_0_30px_rgba(6,182,212,0.2)] text-center text-white crt-screen crt-scanlines">
            {/* Top Close 'X' Button */}
            <button
              type="button"
              onClick={handleFullReset}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-gray-900 border border-cyan-500/50 text-cyan-400 hover:text-white hover:border-cyan-300 hover:bg-cyan-950/60 flex items-center justify-center text-sm font-mono transition-all cursor-pointer"
              title="Close Terminal"
            >
              ✕
            </button>

            {/* Among Us Killed Crewmate Round Badge with Blue Sci-Fi Ring */}
            <div className="relative mb-5 flex items-center justify-center">
              <span className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-cyan-950/60 flex items-center justify-center animate-pulse border-2 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.6)]">
                <DeadCrewmateIcon className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-[0_0_14px_rgba(239,68,68,0.9)]" />
              </span>
            </div>

            {/* Blue / Cyan Type Header */}
            <h2 className="text-2xl sm:text-3xl font-bold text-cyan-400 tracking-widest mb-3 drop-shadow-[0_0_15px_rgba(34,211,238,0.9)] uppercase">
              REGISTRATION COMPLETE!
            </h2>

            <p className="text-gray-300 text-xs sm:text-sm mb-8 font-mono tracking-widest leading-relaxed max-w-md mx-auto">
              YOU HAVE SUCCESSFULLY REGISTERED. JOIN THE WHATSAPP GROUP NOW FOR ALL MISSION UPDATES AND EVENT DETAILS.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <a
                href={whatsappLink || DEFAULT_WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  const targetUrl = whatsappLink || DEFAULT_WHATSAPP_LINK;
                  if (!targetUrl) {
                    e.preventDefault();
                    alert("WhatsApp group link is not detected. Please verify your environment configuration.");
                  }
                }}
                className="px-6 py-3.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(22,163,74,0.6)] transition-all flex items-center justify-center gap-2 border-2 border-green-400 text-sm sm:text-base tracking-wider cursor-pointer transform hover:scale-105 active:scale-95"
              >
                <WhatsAppIcon className="w-5 h-5 shrink-0" />
                <span>JOIN WHATSAPP GROUP</span>
              </a>
              <button
                type="button"
                onClick={handleFullReset}
                className="px-6 py-3.5 bg-red-950/80 hover:bg-red-900/80 text-red-400 font-bold border-2 border-red-800 rounded-xl transition-all text-sm sm:text-base tracking-wider shadow-[0_0_15px_rgba(153,27,27,0.5)] cursor-pointer transform hover:scale-105 active:scale-95"
              >
                CLOSE TERMINAL
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative overflow-hidden crt-screen crt-scanlines p-6 sm:p-8 bg-gray-950/95 text-white border-2 border-red-500/70 shadow-[0_0_35px_rgba(239,68,68,0.25)]">

        <div className="flex items-center justify-between border-b-2 border-red-500/50 pb-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-wider glow-white">
              REGISTER
            </h2>
          </div>
          <span className="text-xs text-yellow-400 font-mono hidden sm:inline">CREWMATE TERMINAL</span>
        </div>

        {terminalLog && (
          <div className="p-3 mb-6 rounded bg-gray-900 border border-green-500/60 text-xs font-mono text-green-400">
            {terminalLog}
          </div>
        )}

        {errorMessage && (
          <div className="p-3 mb-6 rounded bg-red-950/90 border border-red-500 text-xs font-mono text-red-300">
            🚨 ERROR: {errorMessage}
          </div>
        )}

        <form onSubmit={handleRegisterSubmit} className="space-y-5">
          <div>
            <label className="block text-xs text-yellow-400 font-bold mb-1 tracking-wider">
              [!] CREWMATE TEAM NAME *
            </label>
            <input
              name="teamName"
              value={formData.teamName}
              onChange={handleChange}
              required
              disabled={submitting}
              className="w-full px-4 py-2.5 bg-gray-900 border-2 border-gray-700 rounded-lg text-white font-vcr text-sm focus:outline-none focus:border-yellow-400 focus:shadow-[0_0_15px_rgba(245,158,11,0.3)]"
              placeholder="e.g. CYBER_IMPOSTORS"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-yellow-400 font-bold mb-1 tracking-wider">
                [!] TEAM LEADER NAME *
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={submitting}
                className="w-full px-4 py-2.5 bg-gray-900 border-2 border-gray-700 rounded-lg text-white font-vcr text-sm focus:outline-none focus:border-yellow-400 focus:shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                placeholder="Full Name"
              />
            </div>
            <div>
              <label className="block text-xs text-yellow-400 font-bold mb-1 tracking-wider">
                [!] COLLEGE EMAIL *
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={submitting}
                className="w-full px-4 py-2.5 bg-gray-900 border-2 border-gray-700 rounded-lg text-white font-vcr text-sm focus:outline-none focus:border-yellow-400 focus:shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                placeholder="student@student.nitw.ac.in"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-yellow-400 font-bold mb-1 tracking-wider">
                [!] ROLL NUMBER *
              </label>
              <input
                name="rollNo"
                value={formData.rollNo}
                onChange={handleChange}
                required
                pattern="^26(CSB0A|CSB0B|CSB1A|ECB0A|ECB0B|ECB1A|EEB0A|EEB0B|EEB1A|MEB0A|MEB0B|CEB0A|CEB0B|CHB0A|CHB0B|BTB0A|MMB0A|CYE00|PHE00|EDI00|CDS0A|MAE00)[0-9]{2}$"
                title="Format must include a valid branch code (e.g., 26CSB0A09)"
                maxLength={9}
                disabled={submitting}
                className="w-full px-4 py-2.5 bg-gray-900 border-2 border-gray-700 rounded-lg text-white font-vcr text-sm focus:outline-none focus:border-yellow-400 focus:shadow-[0_0_15px_rgba(245,158,11,0.3)] uppercase"
                placeholder="26CSB0A09"
              />
            </div>
            <div>
              <label className="block text-xs text-yellow-400 font-bold mb-1 tracking-wider">
                [!] CONTACT NO *
              </label>
              <input
                name="contactNo"
                type="tel"
                value={formData.contactNo}
                onChange={handleChange}
                required
                disabled={submitting}
                className="w-full px-4 py-2.5 bg-gray-900 border-2 border-gray-700 rounded-lg text-white font-vcr text-sm focus:outline-none focus:border-yellow-400 focus:shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                placeholder="10-digit Phone"
              />
            </div>
            <div>
              <label className="block text-xs text-yellow-400 font-bold mb-1 tracking-wider">
                [!] BRANCH *
              </label>
              <select
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                required
                disabled={submitting}
                className="w-full px-4 py-2.5 bg-gray-900 border-2 border-gray-700 rounded-lg text-white font-vcr text-sm focus:outline-none focus:border-yellow-400"
              >
                <option value="">Select Branch</option>
                {BRANCHES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-yellow-400 font-bold tracking-wider">
                [!] PARTICIPANT CREWMATES ({participants.length}) (OPTIONAL)
              </label>
              {participants.length < 5 && (
                <button
                  type="button"
                  onClick={addParticipant}
                  disabled={submitting}
                  className="text-xs text-green-400 hover:text-green-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  + ADD CREWMATE
                </button>
              )}
            </div>

            <div className="space-y-2">
              {participants.map((participant, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    value={participant.name || ""}
                    onChange={(e) => updateParticipant(index, "name", e.target.value)}
                    required
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded text-sm text-white font-vcr focus:outline-none focus:border-yellow-400"
                    placeholder={`Crewmate ${index + 1} Name`}
                  />
                  <input
                    value={participant.rollNo || ""}
                    onChange={(e) => updateParticipant(index, "rollNo", e.target.value)}
                    required
                    pattern="^26(CSB0A|CSB0B|CSB1A|ECB0A|ECB0B|ECB1A|EEB0A|EEB0B|EEB1A|MEB0A|MEB0B|CEB0A|CEB0B|CHB0A|CHB0B|BTB0A|MMB0A|CYE00|PHE00|EDI00|CDS0A|MAE00)[0-9]{2}$"
                    title="Format must include a valid branch code (e.g., 26CSB0A09)"
                    maxLength={9}
                    disabled={submitting}
                    className="w-full sm:w-44 px-4 py-2 bg-gray-900 border border-gray-700 rounded text-sm text-white font-vcr focus:outline-none focus:border-yellow-400 uppercase"
                    placeholder="Roll No"
                  />
                  <button
                    type="button"
                    onClick={() => removeParticipant(index)}
                    disabled={submitting}
                    className="px-3 py-2 bg-red-950 text-red-400 border border-red-800 rounded text-xs hover:bg-red-900 cursor-pointer self-end sm:self-auto"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-800 bg-gray-900/60">
            <input
              type="checkbox"
              id="considerRecruitment"
              name="considerRecruitment"
              checked={formData.considerRecruitment}
              onChange={handleChange}
              disabled={submitting}
              className="w-4 h-4 accent-yellow-500 cursor-pointer"
            />
            <label htmlFor="considerRecruitment" className="text-xs text-gray-300 font-sans cursor-pointer">
              Consider my team members for upcoming Robotics Club recruitment drives.
            </label>
          </div>

          <div className="pt-4 flex justify-center">
            <EmergencyButton
              onClick={handleRegisterSubmit}
              disabled={submitting}
              loading={submitting}
              label={submitting ? "TRANSMITTING..." : "EMERGENCY\nMEETING"}
            />
          </div>
        </form>
      </div>
    </section>
  );
}