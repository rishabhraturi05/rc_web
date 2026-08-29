"use client";

import React, { useState } from "react";
import EmergencyButton from "./EmergencyButton";
import RegisteredFlash from "./RegisteredFlash";
import { submitFreshersRegistration } from "../lib/registrationApi";

const BRANCHES = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "CHEM", "META", "BIOTECH", "Other"];

const initialForm = {
  name: "",
  email: "",
  contactNo: "",
  rollNo: "",
  branch: "",
  teamName: "",
  considerRecruitment: false,
};

export default function RegistrationTerminal({ eventConfig, onSuccessComplete }) {
  const [formData, setFormData] = useState(initialForm);
  const [participants, setParticipants] = useState([{ name: "", rollNo: "" }]);
  const [submitting, setSubmitting] = useState(false);
  const [terminalLog, setTerminalLog] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [registeredData, setRegisteredData] = useState(null);

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

  const addParticipant = () => setParticipants((prev) => [...prev, { name: "", rollNo: "" }]);
  const removeParticipant = (index) => {
    if (participants.length <= 1) return;
    setParticipants((prev) => prev.filter((_, i) => i !== index));
  };
  const updateParticipant = (index, field, value) => {
    setParticipants((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  };

  const handleRegisterSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage("");

    if (!formData.name.trim() || !formData.email.trim() || !formData.contactNo.trim() || !formData.rollNo.trim() || !formData.branch || !formData.teamName.trim()) {
      setErrorMessage("MISSING REQUIRED FIELDS. FILL ALL CREWMATE IDENTIFICATION DATA.");
      return;
    }

    const rollRegex = /^26(BTB|CEB|CHB|CSB|ECB|EEB|MEB|MMB|CYC|MAC|PHC|EDB)[0-1][A-B][0-9]{2}$/;
    if (!rollRegex.test(formData.rollNo)) {
      setErrorMessage("INVALID ROLL NUMBER FORMAT. VERIFY YOUR BRANCH CODE.");
      return;
    }

    const cleanParticipants = participants.map((p) => p.trim()).filter(Boolean);
    const cleanParticipants = participants
      .map((p) => ({
        name: typeof p === "string" ? p.trim() : (p.name || "").trim(),
        rollNo: typeof p === "string" ? "" : (p.rollNo || "").trim(),
      }))
      .filter((p) => p.name.length > 0);

    if (cleanParticipants.length === 0) {
      setErrorMessage("AT LEAST ONE PARTICIPANT NAME IS REQUIRED.");
      return;
    }

    const missingRoll = cleanParticipants.some((p) => !p.rollNo);
    if (missingRoll) {
      const msg = "ROLL NUMBER IS REQUIRED FOR ALL TEAM PARTICIPANTS.";
      setErrorMessage(msg);
      alert(`⚠️ REGISTRATION BLOCKED:\n${msg}`);
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
      // Popup alert to inform user clearly when duplicate roll number or email is detected
      alert(`⚠️ REGISTRATION BLOCKED:\n\n${errorMsg}`);
    }
  };

  const handleFlashComplete = () => {
    setRegisteredData(null);
    setFormData(initialForm);
    setParticipants([""]);
    setSubmitting(false);
    setTerminalLog("");
  };
  if (registeredData) {
    return (
      <RegisteredFlash
        registrationData={registeredData}
        onReset={() => {
          setRegisteredData(null);
          setFormData(initialForm);
          setParticipants([{ name: "", rollNo: "" }]);
        }}
      />
    );
  }

  if (registeredData) {
    return (
      <RegisteredFlash
        registrationData={registeredData}
        eventConfig={eventConfig}
        onReturn={() => setRegisteredData(null)}
      />
    );
  }

  return (
    <section id="register" className="relative z-10 w-full max-w-3xl mx-auto my-12 px-4 font-vcr">
      
      {registeredData && <RegisteredFlash onComplete={handleFlashComplete} />}

      <div className="crt-screen crt-scanlines p-6 sm:p-8 bg-gray-950/95 text-white border-2 border-red-500/70 shadow-[0_0_35px_rgba(239,68,68,0.25)]">
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
                pattern="^26(BTB|CEB|CHB|CSB|ECB|EEB|MEB|MMB|CYC|MAC|PHC|EDB)[0-1][A-B][0-9]{2}$"
                title="Format must include a valid branch code (e.g., 26CSB0A09)"
                maxLength={9}
                disabled={submitting}
                className="w-full px-4 py-2.5 bg-gray-900 border-2 border-gray-700 rounded-lg text-white font-vcr text-sm focus:outline-none focus:border-yellow-400 focus:shadow-[0_0_15px_rgba(245,158,11,0.3)]"
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
                [!] PARTICIPANT CREWMATES ({participants.length}) *
              </label>
              <button
                type="button"
                onClick={addParticipant}
                disabled={submitting}
                className="text-xs text-green-400 hover:text-green-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                + ADD CREWMATE
              </button>
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
                    disabled={submitting}
                    className="w-full sm:w-44 px-4 py-2 bg-gray-900 border border-gray-700 rounded text-sm text-white font-vcr focus:outline-none focus:border-yellow-400 uppercase"
                    placeholder="Roll No"
                  />
                  {participants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeParticipant(index)}
                      disabled={submitting}
                      className="px-3 py-2 bg-red-950 text-red-400 border border-red-800 rounded text-xs hover:bg-red-900 cursor-pointer self-end sm:self-auto"
                    >
                      ✕
                    </button>
                  )}
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
              label={submitting ? "TRANSMITTING..." : "EMERGENCY\nMEETING"}
            />
          </div>
        </form>
      </div>
    </section>
  );
}