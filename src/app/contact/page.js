"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaPaperPlane,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimes,
  FaChevronDown,
} from "react-icons/fa";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    queryType: "",
    otherQuery: "",
    message: "",
  });

  const [showOtherInput, setShowOtherInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error', title: string, message: string }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "queryType") {
      const isOther = value === "others";
      setShowOtherInput(isOther);
      if (!isOther) {
        setFormData((prev) => ({ ...prev, otherQuery: "" }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setNotification(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setNotification({
          type: "error",
          title: "Message Failed",
          message: data.msg || data.error || "Unable to send message. Please verify all fields.",
        });
        setIsSubmitting(false);
        return;
      }

      setNotification({
        type: "success",
        title: "Message Sent Successfully",
        message: "Thank you for reaching out! The Robotics Club team will get back to you shortly.",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        queryType: "",
        otherQuery: "",
        message: "",
      });
      setShowOtherInput(false);
    } catch (error) {
      console.error(error);
      setNotification({
        type: "error",
        title: "Connection Error",
        message: "Something went wrong while sending your message. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-[#020202] text-[#f5f1ea] overflow-x-hidden pt-32 pb-24">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Toast Notification Banner */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-lg"
          >
            <div
              className={`p-4 rounded-xl border backdrop-blur-xl shadow-2xl flex items-start gap-3.5 ${
                notification.type === "success"
                  ? "bg-black/90 border-emerald-500/60 shadow-[0_0_30px_rgba(16,185,129,0.25)] text-emerald-300"
                  : "bg-black/90 border-red-500/60 shadow-[0_0_30px_rgba(239,68,68,0.25)] text-red-300"
              }`}
            >
              <div className="mt-0.5 text-lg">
                {notification.type === "success" ? (
                  <FaCheckCircle className="text-emerald-400" />
                ) : (
                  <FaExclamationTriangle className="text-red-400" />
                )}
              </div>
              <div className="flex-1 font-mono text-xs">
                <p className="font-bold tracking-wider uppercase text-sm">
                  {notification.title}
                </p>
                <p className="mt-1 text-gray-300 leading-relaxed font-sans text-xs">
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => setNotification(null)}
                className="text-gray-400 hover:text-white p-1 transition-colors"
                aria-label="Close notification"
              >
                <FaTimes size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12">
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-cyan-400 mb-3 px-3.5 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/20">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              <span>GET IN TOUCH</span>
            </div>
            <h1
              className="text-5xl sm:text-6xl md:text-7xl font-black text-white tracking-tighter uppercase drop-shadow-[0_0_35px_rgba(255,255,255,0.3)] mb-4"
              style={{ fontFamily: "var(--font-orbitron)" }}
            >
              CONTACT US
            </h1>
            <p className="text-gray-300 font-mono text-sm sm:text-base max-w-xl mx-auto">
              Have questions, ideas for collaboration, or want to visit the lab? Reach out and we&apos;ll get back to you.
            </p>
          </motion.div>
        </div>

        {/* Dual Command Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Lab Location & Contact Info (5 cols) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="lg:col-span-5 flex flex-col gap-6"
          >
            {/* Lab Location */}
            <div className="glass-panel p-6 sm:p-8 border border-white/10 relative group rounded-2xl bg-black/60 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <FaMapMarkerAlt />
                </div>
                <div>
                  <h3 className="font-mono text-xs text-cyan-400 uppercase tracking-widest">
                    Location
                  </h3>
                  <p
                    className="text-base font-bold text-white tracking-wide"
                    style={{ fontFamily: "var(--font-orbitron)" }}
                  >
                    NIT WARANGAL
                  </p>
                </div>
              </div>
              <p className="font-mono text-xs text-gray-300 leading-relaxed pl-13">
                Centre for Innovation and Incubation (CII)
                <br />
                National Institute of Technology Warangal
                <br />
                Telangana, India — 506004
              </p>
            </div>

            {/* Direct Contact */}
            <div className="glass-panel p-6 sm:p-8 border border-white/10 relative rounded-2xl bg-black/60 backdrop-blur-md">
              <div className="space-y-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <FaEnvelope />
                  </div>
                  <div>
                    <p className="font-mono text-[11px] text-gray-400 uppercase tracking-wider">
                      Email
                    </p>
                    <a
                      href="mailto:roboticsclub@nitw.ac.in"
                      className="font-mono text-sm text-cyan-300 hover:text-white transition-colors underline-offset-4 hover:underline"
                    >
                      roboticsclub@nitw.ac.in
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <FaPhoneAlt />
                  </div>
                  <div>
                    <p className="font-mono text-[11px] text-gray-400 uppercase tracking-wider">
                      Phone
                    </p>
                    <a
                      href="tel:+919701877170"
                      className="font-mono text-sm text-cyan-300 hover:text-white transition-colors"
                    >
                      +91 97018 77170
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Link Card */}
            <div className="glass-panel p-6 border-l-4 border-l-cyan-400 rounded-2xl bg-black/40 backdrop-blur-md">
              <p className="font-mono text-xs uppercase tracking-wider text-cyan-400 font-bold mb-1">
                Looking to join the team?
              </p>
              <p className="font-mono text-xs text-gray-300 leading-relaxed mb-4">
                Freshers and sophomores looking to join the club can review active openings directly on our recruitment portal.
              </p>
              <Link
                href="/recruitment"
                className="inline-flex items-center gap-2 font-mono text-xs font-bold text-cyan-400 hover:text-cyan-200 transition-colors uppercase tracking-wider"
              >
                <span>Open Recruitment Portal</span>
                <span>→</span>
              </Link>
            </div>
          </motion.div>

          {/* Right Column: Contact Form (7 cols) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
            className="lg:col-span-7"
          >
            <div className="glass-panel p-8 sm:p-10 border border-white/10 rounded-2xl bg-black/70 backdrop-blur-xl shadow-2xl relative">

              <div className="mb-8 pb-4 border-b border-white/10">
                <h2
                  className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wider"
                  style={{ fontFamily: "var(--font-orbitron)" }}
                >
                  SEND A MESSAGE
                </h2>
                <p className="font-mono text-xs text-gray-400 mt-1">
                  Fill out all mandatory fields marked with an asterisk
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-xs font-mono font-bold text-cyan-300 uppercase tracking-widest mb-2"
                  >
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your name"
                    className="w-full px-4 py-3.5 bg-black/50 border border-white/15 rounded-lg text-white font-mono text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-200"
                  />
                </div>

                {/* Email & Phone Dual Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-mono font-bold text-cyan-300 uppercase tracking-widest mb-2"
                    >
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="name@domain.com"
                      className="w-full px-4 py-3.5 bg-black/50 border border-white/15 rounded-lg text-white font-mono text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-xs font-mono font-bold text-cyan-300 uppercase tracking-widest mb-2"
                    >
                      Phone Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full px-4 py-3.5 bg-black/50 border border-white/15 rounded-lg text-white font-mono text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Query Type Dropdown */}
                <div>
                  <label
                    htmlFor="queryType"
                    className="block text-xs font-mono font-bold text-cyan-300 uppercase tracking-widest mb-2"
                  >
                    Topic <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="queryType"
                      name="queryType"
                      value={formData.queryType}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3.5 bg-black/50 border border-white/15 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-200 appearance-none cursor-pointer pr-10"
                    >
                      <option value="" className="bg-[#0f172a] text-gray-400">
                        Select a category...
                      </option>
                      <option value="general" className="bg-[#0f172a] text-cyan-300">
                        General Inquiry
                      </option>
                      <option value="Recruitment" className="bg-[#0f172a] text-cyan-300">
                        Recruitment & Inductions
                      </option>
                      <option value="events" className="bg-[#0f172a] text-cyan-300">
                        Workshops & Guest Talks
                      </option>
                      <option value="projects" className="bg-[#0f172a] text-cyan-300">
                        Project Collaboration
                      </option>
                      <option value="collaboration" className="bg-[#0f172a] text-cyan-300">
                        Sponsorship & Partnerships
                      </option>
                      <option value="others" className="bg-[#0f172a] text-cyan-300">
                        Other Inquiries
                      </option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none">
                      <FaChevronDown size={12} />
                    </div>
                  </div>
                </div>

                {/* Other Query Input */}
                <AnimatePresence>
                  {showOtherInput && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <label
                        htmlFor="otherQuery"
                        className="block text-xs font-mono font-bold text-cyan-300 uppercase tracking-widest mb-2"
                      >
                        Please Specify <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        id="otherQuery"
                        name="otherQuery"
                        value={formData.otherQuery}
                        onChange={handleChange}
                        required={showOtherInput}
                        placeholder="Briefly describe your topic"
                        className="w-full px-4 py-3.5 bg-black/50 border border-white/15 rounded-lg text-white font-mono text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-200"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Message Field */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="message"
                      className="block text-xs font-mono font-bold text-cyan-300 uppercase tracking-widest"
                    >
                      Message <span className="text-red-400">*</span>
                    </label>
                    <span className="font-mono text-[10px] text-gray-500">
                      {formData.message.length} chars
                    </span>
                  </div>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Write your message here..."
                    className="w-full px-4 py-3.5 bg-black/50 border border-white/15 rounded-lg text-white font-mono text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-200 resize-none"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-6 rounded-lg font-mono text-sm font-bold uppercase tracking-widest text-black bg-cyan-400 hover:bg-cyan-300 active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(34,211,238,0.4)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                        <span>SENDING...</span>
                      </>
                    ) : (
                      <>
                        <FaPaperPlane size={13} />
                        <span>SEND MESSAGE</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}