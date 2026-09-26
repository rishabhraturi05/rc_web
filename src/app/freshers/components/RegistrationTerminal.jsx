"use client";

import React, { useState, useEffect } from "react";
import EmergencyButton from "./EmergencyButton";
import RegisteredFlash from "./RegisteredFlash";
import { submitFreshersRegistration } from "../lib/registrationApi";

/*
const BRANCHES = ["CSE", "CSE(AIDS)", "MNC", "ECE", "ECE(VLSI)", "EEE", "EEE(Electric Mobility)", "MECH", "CIVIL", "CHEM", "BIOTECH", "META", "BSC-BED", "INTEGRATED MSC","OTHER"];

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
      <rect x="18" y="52" width="16" height="34" rx="8" fill="#B91C1C" stroke="#050a14" strokeWidth="4.5" />

      <rect x="30" y="72" width="20" height="24" rx="8" fill="#EF4444" stroke="#050a14" strokeWidth="4.5" />
      <rect x="58" y="72" width="20" height="24" rx="8" fill="#EF4444" stroke="#050a14" strokeWidth="4.5" />

      <path
        d="M26 50 C26 50, 24 74, 32 76 C40 78, 50 78, 54 70 C58 78, 68 78, 76 76 C84 74, 82 50, 82 50 Z"
        fill="#EF4444"
        stroke="#050a14"
        strokeWidth="4.5"
        strokeLinejoin="round"
      />

      <path d="M26 58 C27 70, 34 76, 44 76 C38 72, 34 66, 34 58 Z" fill="#B91C1C" opacity="0.6" />
      <path d="M64 72 C68 76, 74 76, 78 72 C80 66, 80 58, 80 58 C78 64, 72 70, 64 72 Z" fill="#B91C1C" opacity="0.6" />

      <ellipse cx="54" cy="50" rx="28" ry="9" fill="#991B1B" stroke="#050a14" strokeWidth="4.5" />
      <ellipse cx="54" cy="50" rx="23" ry="6" fill="#DC2626" />
      <ellipse cx="54" cy="50" rx="16" ry="3.5" fill="#7F1D1D" />

      <ellipse cx="54" cy="49" rx="8" ry="3" fill="#E2E8F0" stroke="#050a14" strokeWidth="2" />

      <path d="M49 22 L49 48 L59 48 L59 22 Z" fill="#F8FAFC" stroke="#050a14" strokeWidth="4" strokeLinejoin="round" />

      <circle cx="47" cy="18" r="7.5" fill="#F8FAFC" stroke="#050a14" strokeWidth="4" />
      <circle cx="61" cy="18" r="7.5" fill="#F8FAFC" stroke="#050a14" strokeWidth="4" />

      <rect x="49.5" y="16" width="9" height="12" fill="#F8FAFC" />
      <circle cx="47" cy="18" r="5.5" fill="#F8FAFC" />
      <circle cx="61" cy="18" r="5.5" fill="#F8FAFC" />

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

    const rollRegex = /^26(CSB0A|CSB0B|CSB1A|CSB1B|ECB0A|ECB0B|ECB1A|ECB1B|EEB0A|EEB0B|EEB1A|EEB1B|EMB0A|MEB0A|MEB0B|MEB1A|MEB1B|CEB0A|CEB0B|CEB1A|CEB1B|CHB0A|CHB0B|CHB1A|CHB1B|BTB0A|BTB1A|BTB1B|MMB0A|MMB1A|MMB1B|CYE00|PHE00|EDI00|DSB0A|MAE00)[0-9]{2}$/i;
    
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
    // Previous return statement omitted
  );
}
*/

export default function RegistrationTerminal() {
  const leaderboard = [
    { rank: 1, name: "apex among imposters - prateek", score: 25 },
    { rank: 2, name: "heisen-bugs", score: 21 },
    { rank: 3, name: "o2 tech", score: 21 },
    { rank: 4, name: "Cyber criminals", score: 20 },
    { rank: 5, name: "the sus team", score: 20 },
    { rank: 6, name: "space beans", score: 20 },
    { rank: 7, name: "6769", score: 18 },
    { rank: 8, name: "quantum_bots", score: 17 }
  ];

  return (
    <section id="results" className="relative z-10 w-full max-w-3xl mx-auto my-12 px-4 font-vcr">
      <div className="relative overflow-hidden crt-screen crt-scanlines p-6 sm:p-8 bg-gray-950/95 text-white border-2 border-cyan-500/70 shadow-[0_0_35px_rgba(6,182,212,0.25)]">
        
        <div className="flex items-center justify-between border-b-2 border-cyan-500/50 pb-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cyan-500 animate-pulse" />
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-wider glow-white uppercase">
              ROUND 1 RESULTS
            </h2>
          </div>
          <span className="text-xs text-cyan-400 font-mono hidden sm:inline">LEADERBOARD TERMINAL</span>
        </div>

        <div className="mb-8 p-5 bg-gray-900 border-2 border-yellow-500 rounded-lg shadow-[0_0_15px_rgba(234,179,8,0.3)]">
          <h3 className="text-xl text-yellow-400 font-bold mb-3 text-center tracking-widest uppercase">
            🌟 Highlight of the Event! 🌟
          </h3>
          <p className="text-sm text-gray-300 leading-relaxed mb-4 text-center font-sans">
            Apex Among Imposters were initially at 9th position, but they made the correct bet on 9th place, which ultimately propelled them to 1st position!
          </p>
          <p className="text-lg text-green-400 font-bold text-center tracking-wide">
            Great hunch! 👏
          </p>
        </div>

        <div className="space-y-3 mb-8">
          {leaderboard.map((team) => (
            <div 
              key={team.rank} 
              className="flex items-center p-3 bg-gray-900 border border-gray-700 rounded-lg hover:border-cyan-400 hover:shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded bg-cyan-950/80 text-cyan-300 font-bold mr-4 border border-cyan-700/50 text-lg">
                {team.rank}
              </div>
              <div className="flex-1 text-sm sm:text-base uppercase tracking-wider text-gray-200 truncate pr-2">
                {team.name}
              </div>
              <div className="text-xl sm:text-2xl font-bold text-cyan-400">
                {team.score}
              </div>
            </div>
          ))}
        </div>

        <div className="p-5 bg-gray-900/60 border border-gray-800 rounded-lg text-center">
          <p className="mb-2 text-white font-bold tracking-wider text-sm sm:text-base">
            Congratulations to all the winning teams! 🎊🎊
          </p>
          <p className="text-xs sm:text-sm text-gray-400 font-sans">
            The next steps for round 2 and further details will be communicated to the teams shortly.
          </p>
        </div>

      </div>
    </section>
  );
}