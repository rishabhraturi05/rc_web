'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaExternalLinkAlt,
  FaTrophy,
  FaMapMarkerAlt,
  FaClock,
  FaUsers,
  FaPhoneAlt,
  FaCheckCircle,
  FaGamepad,
  FaCarSide,
  FaRobot,
} from 'react-icons/fa'

const tzEvents = [
  {
    id: 'tz-smash-karts',
    title: 'SMASH KARTS',
    tagline: 'High-Speed FPV Robotic Racing Competition',
    category: 'Technozion Flagship',
    isTz: true,
    accent: 'from-amber-500/20 via-cyan-500/10 to-transparent',
    borderGlow: 'hover:border-cyan-400 hover:shadow-[0_0_35px_rgba(34,211,238,0.35)]',
    prizePool: '₹30,000',
    date: 'October 30-31',
    time: '10:00 AM – 1:00 PM & 3:00 PM – 6:00 PM',
    venue: 'Near SAC (Student Activity Centre)',
    eligibility: 'Everyone (Open to all colleges & years)',
    teamSize: 'Individual or Teams',
    status: 'active',
    image: '/events/smashkarts.jpg',
    registerUrl: 'https://technozion.nitw.ac.in/register',
    shortDescription: 'Build, customise, and pilot modular 1:10 karts through immersive FPV goggles in high-octane 3-kart track battles with tactical ArUco power-ups.',
    description: `Smash Karts is a high-speed robotic racing competition where engineering meets strategy. Build and customise your kart, take control through an immersive first-person view, and compete against two other racers on a shared track.

THREE KARTS. ONE TRACK. ALL-OUT RACING.
• Race Format: Three karts race head-to-head on a custom obstacle-laden track.
• Build & Race: Bring your own custom-built kart or use a club-provided modular car!
• Tactical Power-Ups: Drive through ArUco-tagged zones to trigger strategic power boosts.
• FPV Driving: Pilot your kart live using realistic steering wheel, pedals, and FPV goggles.
• Computer Vision Tracking: Automated camera overhead tracks split times, lap counters, and live leaderboards.
• Elimination Rounds: Multiple qualifier heats where winners advance to the Grand Finale!`,
    specs: [
      { label: 'Scale & Weight', value: '1:10 Scale | 3 – 5 kg' },
      { label: 'Chassis Limits', value: 'Width ≤ 200 mm | Wheelbase ≤ 300 mm' },
      { label: 'Suspension & Wheels', value: 'Front suspension only | Wheels ≤ 100 mm' },
      { label: 'Max Motor Power', value: '384 W Max Power output' },
      { label: 'FPV System', value: 'ESP32-S3 Sense (Provided by club)' },
      { label: 'Microcontroller', value: 'ESP32-C6 Mini / equivalent' },
      { label: 'Sensors', value: 'BNO086 IMU + Rotary Encoders' },
      { label: 'Controls', value: 'Steering wheel & pedal hardware provided' },
    ],
    contact: 'Krishna: +91 98460 32569 | Robotics Club NITW',
    contactName: 'Krishna',
    contactPhone: '+919846032569',
  },
  {
    id: 'tz-arcade',
    title: 'ARCADE',
    tagline: 'Air Hockey — Autonomous Robotics Challenge',
    category: 'Technozion Flagship',
    isTz: true,
    accent: 'from-fuchsia-500/20 via-pink-500/10 to-transparent',
    borderGlow: 'hover:border-fuchsia-400 hover:shadow-[0_0_35px_rgba(217,70,239,0.35)]',
    prizePool: '₹10,000',
    date: 'October 30-31',
    time: 'Technozion Days (Full Schedule in SAC)',
    venue: 'SAC Room 112',
    eligibility: 'Open to all (Students from any institution)',
    teamSize: 'Up to 4 Members per Team',
    status: 'active',
    image: '/events/arcade.jpg',
    registerUrl: 'https://technozion.nitw.ac.in/register',
    shortDescription: 'Design and program an autonomous robotic gantry defender using 210 FPS computer vision to track puck trajectories and challenge human opponents.',
    description: `Air Hockey – Arcade Division is an autonomous robotics challenge combining high-speed computer vision, trajectory prediction, and closed-loop motion control. Teams develop intelligent robotic systems to defend a goal in a fast-paced game that tests precision and reflexes.

TRACK THE PUCK. PREDICT ITS PATH. DEFEND YOUR GOAL.
• The Challenge: Design and program an autonomous robotic defender to compete against a human opponent in a 5-minute air hockey match.
• Real-Time Vision: Using real-time overhead camera feeds at 210 FPS, your robot must detect the puck, calculate velocity vectors, predict reflections, and actuate the striker to intercept shots and score.
• Match Format: 1 Autonomous robot vs 1 Human opponent (5-minute timed match).
• Scoring Matrix:
  - Robot scores goal against human: +10 Points
  - Human scores goal against robot: -5 Points
• Arena: Rectangular half-table with a high-speed CoreXY belt gantry mechanism. Modular configuration software is recommended.`,
    specs: [
      { label: 'Main Compute', value: 'Raspberry Pi 4 (Main Computing Unit)' },
      { label: 'Vision System', value: 'OV9281 MIPI CSI-2 Global-Shutter Camera' },
      { label: 'Camera FPS', value: 'Monochrome Real-Time Tracking at 210 FPS' },
      { label: 'Actuation', value: 'CoreXY Gantry with GT2 Timing Belts' },
      { label: 'Motor Drivers', value: 'ESP32 Board + MKS XDrive Mini V1.0' },
      { label: 'Motors', value: 'Tarot Martin BLDC / Dauchi 6000 RPM Motors' },
      { label: 'Encoders', value: 'AMT103 High-Resolution Optical Encoders' },
      { label: 'Airframe', value: '2020 V-Slot Aluminum Extrusions & 3D Mounts' },
    ],
    contact: 'Vipul Bansal: +91 81188 32272 | Robotics Club NITW',
    contactName: 'Vipul Bansal',
    contactPhone: '+918118832272',
  },
]

const standardEvents = [
  {
    id: 'skeld',
    title: 'PROJECT SKELD',
    tagline: 'Exclusive Robotics Freshman Experience',
    date: 'Sept 26, 2026',
    time: '5:00 PM',
    venue: 'NAB (New Academic Building)',
    duration: '3 hours',
    status: 'completed',
    image: '/events/freshers.jpg',
    shortDescription: 'Exclusive robotics freshers event: Project Skeld inspired by Among Us.',
    description: `Emergency Meeting, Crewmates! An immersive, tech-driven freshers experience inspired by Among Us.

🔹 Venue: NAB
🔹 Mission: Solve robotics puzzles, fix broken circuitry, identify impostors, and experience life inside the Robotics Club NITW spaceship.
🔹 Eligibility: First-Year Students of NIT Warangal
🔹 Team: 6 Crewmates per Team

Head over to the Freshers tab to explore the winners podium, leaderboard, and event gallery!`,
    contact: 'robotics@nitw.ac.in | Phone: +91-7661991859',
  },
  {
    id: 'sumowar',
    title: 'SUMO WAR',
    tagline: 'High-Impact Robotics Battle',
    date: 'October 24-25, 2025',
    time: 'Full Day Arena',
    venue: 'Campus Open Arena',
    duration: '4 hours',
    status: 'completed',
    image: '/events/Sumo Wars Event Poster.png',
    shortDescription: 'High-torque sumo robot pushing battle inside a circular ring.',
    description: `Where strategy meets strength! Step into the arena with your battle-ready sumobot and take control in an adrenaline-fueled showdown. Outsmart your rival, push them out of the warzone, and rack up points by landing hits and keeping them trapped in the danger zone. Skill decides the champion!`,
    contact: 'Srijoy | Phone: +91-75694 98783',
  },
  {
    id: 'bombsaway',
    title: 'BOMBS AWAY',
    tagline: 'Precision Aerodynamic Drop Challenge',
    date: 'October 24-25, 2025',
    time: 'Afternoon Flight Window',
    venue: 'Robotics Lab & Grounds, NIT Warangal',
    duration: '2 hours',
    status: 'completed',
    image: '/events/Bombs_Away_EventPoster.png',
    shortDescription: 'Skill-based aerial drop release challenge from an RC aircraft.',
    description: `Bomb's Away is a skill-based challenge testing your timing and aerodynamic judgment. As a 'Bombardier,' you will control a single trigger to release an inert payload from a pilot-operated RC aircraft. Your mission is to account for speed and altitude to land the payload closest to the target center.`,
    contact: 'Dhanvanth | Phone: +91-74180 56603',
  },
  {
    id: 'blaze',
    title: 'BLAZE',
    tagline: 'High-Octane Tactical Laser Arena',
    date: 'October 24-25, 2025',
    time: 'Evening Arena',
    venue: 'SAC Amphitheatre Arena',
    duration: '3 hours',
    status: 'completed',
    image: '/events/RC_BLAZE_POSTER.png',
    shortDescription: 'Tactical laser battle arena with dynamic rules and live leaderboard.',
    description: `BLAZE is your high-octane laser challenge by the Robotics Club. Enter the custom arena for intense 4v4 combat. The map is loaded with secrets, and every day brings a new game mode! Play smart, hit hard, and fight your way to the top of the live leaderboard.`,
    contact: 'Soumilya | Phone: +91-84486 44855',
  },
  {
    id: 'workshop',
    title: 'ROBOTICS WORKSHOP',
    tagline: 'Hands-on Prototyping & Mechanism Design',
    date: 'Sept 14, 2025',
    time: '10:00 AM - 4:00 PM',
    venue: 'ALC (Advanced Learning Centre)',
    duration: '6 hours',
    status: 'completed',
    image: '/events/workshop.jpg',
    shortDescription: 'Hands-on session exploring Arduino, CAD, and competitive robot builds.',
    description: `Join this interactive, hands-on session to explore Arduino, Robot Design, and take on thrilling challenges like Cozmo Clench and Meshmerize—the perfect launchpad for Techfest IIT Bombay. This is not just a lecture—you build, fabricate, and test with fellow builders.`,
    contact: 'roboticsclub@nitw.ac.in | Phone: +91-7661991859',
  },
  {
    id: 'trends',
    title: 'GLOBAL TRENDS IN ROBOTICS',
    tagline: 'Expert Guest Lecture & Industry Insights',
    date: 'March 19, 2025',
    time: '6:30 PM',
    venue: 'ALC & Virtual Stream',
    duration: '3 hours',
    status: 'completed',
    image: '/events/onlinewebinar25.png',
    shortDescription: 'Speaker session on global robotics trends, career pathways, and AI integration.',
    description: `The field of robotics is evolving rapidly, opening up exciting opportunities across the globe in research, industry, and entrepreneurship. Expert Nallamilli Venkata Reddy discussed global trends in robotics, career pathways, international research collaborations, and the skills needed to thrive in this dynamic field.`,
    contact: 'roboticsclub@nitw.ac.in | Phone: +91-7661991859',
  },
]

// Modal component for viewing complete event specifications
const EventModal = ({ event, isOpen, onClose }) => {
  React.useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && event && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="event-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar glass-panel rounded-2xl border border-white/20 bg-[#080b10] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Media */}
            <div className="relative h-56 sm:h-72 w-full overflow-hidden">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080b10] via-black/50 to-transparent"></div>

              {/* Close Button */}
              <button
                onClick={onClose}
                aria-label="Close dialog"
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-black/60 hover:bg-cyan-500/20 border border-white/20 hover:border-cyan-400 rounded-full text-white hover:text-cyan-400 transition-all duration-200 z-20 cursor-pointer"
              >
                ✕
              </button>

              {/* Header Badges & Title */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {event.isTz && (
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 font-mono text-[11px] font-bold uppercase tracking-wider">
                      Technozion Flagship
                    </span>
                  )}
                  {event.prizePool && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <FaTrophy className="text-xs" />
                      <span>Prize Pool: {event.prizePool}</span>
                    </span>
                  )}
                </div>
                <h2
                  id="event-modal-title"
                  className="text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight drop-shadow-lg"
                  style={{ fontFamily: 'var(--font-orbitron)' }}
                >
                  {event.title}
                </h2>
                {event.tagline && (
                  <p className="font-mono text-xs sm:text-sm text-cyan-300 mt-1">
                    {event.tagline}
                  </p>
                )}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Quick Info Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl font-mono">
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
                    <FaClock className="text-[11px]" />
                    <span>Dates & Time</span>
                  </div>
                  <p className="text-white text-xs">{event.date}</p>
                  {event.time && <p className="text-gray-400 text-[11px] mt-0.5">{event.time}</p>}
                </div>

                <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl font-mono">
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
                    <FaMapMarkerAlt className="text-[11px]" />
                    <span>Location</span>
                  </div>
                  <p className="text-white text-xs">{event.venue}</p>
                </div>

                {event.eligibility && (
                  <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl font-mono sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
                      <FaUsers className="text-[11px]" />
                      <span>Eligibility</span>
                    </div>
                    <p className="text-white text-xs">{event.eligibility}</p>
                    {event.teamSize && (
                      <p className="text-gray-400 text-[11px] mt-0.5">{event.teamSize}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Action Button: Register on Technozion */}
              {event.registerUrl && (
                <div className="pt-1">
                  <a
                    href={event.registerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-6 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-cyan-400 hover:bg-cyan-300 text-black flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all duration-200 active:scale-95 cursor-pointer"
                  >
                    <span>Register on Technozion</span>
                    <FaExternalLinkAlt className="text-[11px]" />
                  </a>
                </div>
              )}

              {/* Event Description */}
              <div>
                <h3
                  className="text-lg font-bold mb-3 text-cyan-300 uppercase tracking-wider flex items-center gap-2"
                  style={{ fontFamily: 'var(--font-orbitron)' }}
                >
                  <span className="w-4 h-[2px] bg-cyan-400"></span>
                  <span>Event Overview</span>
                </h3>
                <div className="text-gray-300 font-mono text-xs sm:text-sm leading-relaxed whitespace-pre-wrap pl-4 border-l border-white/10">
                  {event.description}
                </div>
              </div>

              {/* Hardware & Specifications Table (for TZ Events) */}
              {Array.isArray(event.specs) && event.specs.length > 0 && (
                <div>
                  <h3
                    className="text-lg font-bold mb-3 text-cyan-300 uppercase tracking-wider flex items-center gap-2"
                    style={{ fontFamily: 'var(--font-orbitron)' }}
                  >
                    <span className="w-4 h-[2px] bg-cyan-400"></span>
                    <span>Specifications & Hardware</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-xs">
                    {event.specs.map((spec, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg bg-black/50 border border-white/10 flex flex-col justify-center"
                      >
                        <span className="text-cyan-400 font-bold uppercase tracking-wider text-[10px]">
                          {spec.label}
                        </span>
                        <span className="text-gray-200 font-medium mt-0.5">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Point of Contact */}
              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
                <div>
                  <span className="text-cyan-400 text-[10px] uppercase font-bold tracking-widest block">
                    Event Coordinator
                  </span>
                  <span className="text-white font-bold text-sm block mt-0.5">
                    {event.contactName || 'Robotics Club Coordinator'}
                  </span>
                  <span className="text-gray-400 text-xs block">{event.contact}</span>
                </div>
                {event.contactPhone && (
                  <a
                    href={`tel:${event.contactPhone}`}
                    className="px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 hover:text-white font-bold flex items-center gap-2 self-start sm:self-center transition-colors cursor-pointer"
                  >
                    <FaPhoneAlt className="text-xs" />
                    <span>Call Coordinator</span>
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default function EventsPage() {
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filter, setFilter] = useState('All')

  const openModal = (ev) => {
    setSelectedEvent(ev)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedEvent(null), 300)
  }

  const filteredStandard = standardEvents.filter((ev) => {
    if (filter === 'Live') return ev.status === 'active'
    if (filter === 'Completed') return ev.status === 'completed'
    return true
  })

  return (
    <main className="relative min-h-screen bg-transparent text-white overflow-x-hidden pt-32 pb-24">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ======================================================== */}
        {/* HEADER SECTION                                           */}
        {/* ======================================================== */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-cyan-400 mb-3 px-3.5 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/20">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>ARENAS & WORKSHOPS</span>
            </div>
            <h1
              className="text-5xl sm:text-6xl md:text-7xl font-black text-white title-glow tracking-tighter uppercase mb-4"
              style={{ fontFamily: 'var(--font-orbitron)' }}
            >
              EVENTS
            </h1>
            <p className="text-gray-300 font-mono text-sm sm:text-base max-w-2xl mx-auto">
              National robotics championships, high-speed FPV racing, autonomous gantry challenges,
              and hands-on bootcamps at NIT Warangal.
            </p>
          </motion.div>
        </div>

        {/* ======================================================== */}
        {/* TECHNOZION 2026 FEATURED SECTION                         */}
        {/* ======================================================== */}
        <section className="mb-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-white/10">
            <div>
              <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-amber-400 mb-2">
                <FaTrophy className="text-xs" />
                <span>TECHNOZION &apos;26 FLAGSHIPS</span>
              </div>
              <h2
                className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight"
                style={{ fontFamily: 'var(--font-orbitron)' }}
              >
                FEATURED TOURNAMENTS
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-gray-400">Official Portal:</span>
              <a
                href="https://technozion.nitw.ac.in/register"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase tracking-wider bg-cyan-400 hover:bg-cyan-300 text-black transition-all shadow-[0_0_15px_rgba(34,211,238,0.4)] active:scale-95 cursor-pointer"
              >
                <span>Register on Technozion</span>
                <FaExternalLinkAlt className="text-[10px]" />
              </a>
            </div>
          </div>

          {/* 2 Flagship Highlight Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {tzEvents.map((event, idx) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className={`group relative rounded-3xl overflow-hidden glass-panel border border-white/15 ${event.borderGlow} transition-all duration-500 bg-gradient-to-b from-[#0c121d]/75 via-black/60 to-[#06080e]/80 backdrop-blur-sm shadow-2xl flex flex-col justify-between`}
              >
                {/* Poster Image with Gradient Fade */}
                <div className="relative h-72 sm:h-80 w-full overflow-hidden bg-black/30">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

                  {/* Top Floating Badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full font-mono text-[11px] font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md border border-cyan-400/50 text-cyan-300 flex items-center gap-1.5 shadow-lg">
                      {event.id === 'tz-arcade' ? <FaGamepad className="text-xs" /> : <FaCarSide className="text-xs" />}
                      <span>{event.category}</span>
                    </span>

                    <span className="px-3 py-1 rounded-full font-mono text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 backdrop-blur-md border border-amber-400/60 text-amber-300 shadow-lg flex items-center gap-1.5">
                      <FaTrophy className="text-xs" />
                      <span>{event.prizePool}</span>
                    </span>
                  </div>

                  {/* Bottom Image Overlay Details */}
                  <div className="absolute bottom-4 left-6 right-6">
                    <p className="font-mono text-xs uppercase tracking-widest text-cyan-300 font-bold mb-1">
                      {event.date} • {event.venue}
                    </p>
                    <h3
                      className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight group-hover:text-cyan-300 transition-colors"
                      style={{ fontFamily: 'var(--font-orbitron)' }}
                    >
                      {event.title}
                    </h3>
                  </div>
                </div>

                {/* Card Content Area */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
                  <div>
                    <p className="font-mono text-xs sm:text-sm text-gray-300 leading-relaxed border-l-2 border-cyan-400/60 pl-3">
                      {event.shortDescription}
                    </p>

                    {/* Quick Specs Highlights */}
                    <div className="grid grid-cols-2 gap-2 mt-5 font-mono text-xs">
                      <div className="p-2.5 rounded-lg bg-black/40 border border-white/10">
                        <span className="text-[10px] text-gray-400 block uppercase">Eligibility</span>
                        <span className="text-white font-medium truncate block">{event.eligibility}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-black/40 border border-white/10">
                        <span className="text-[10px] text-gray-400 block uppercase">Location</span>
                        <span className="text-white font-medium truncate block">{event.venue}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <a
                      href={event.registerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-cyan-400 hover:bg-cyan-300 text-black flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(34,211,238,0.35)] transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <span>Register</span>
                      <FaExternalLinkAlt className="text-[10px]" />
                    </a>

                    <button
                      type="button"
                      onClick={() => openModal(event)}
                      className="flex-1 py-3 px-4 rounded-xl font-mono text-xs font-semibold uppercase tracking-wider bg-white/5 hover:bg-white/10 border border-white/20 hover:border-cyan-400/50 text-white flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <span>Specifications</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ======================================================== */}
        {/* OTHER CLUB EVENTS & WORKSHOPS (BELOW)                    */}
        {/* ======================================================== */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-white/10">
            <div>
              <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-cyan-400 mb-2">
                <FaRobot className="text-xs" />
                <span>ONGOING & PAST INITIATIVES</span>
              </div>
              <h2
                className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight"
                style={{ fontFamily: 'var(--font-orbitron)' }}
              >
                CLUB EVENTS & WORKSHOPS
              </h2>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2">
              {['All', 'Live', 'Completed'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilter(tab)}
                  className={`px-3.5 py-1.5 rounded-lg font-mono text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer active:scale-95 ${
                    filter === tab
                      ? 'bg-cyan-400 text-black font-bold shadow-[0_0_12px_rgba(34,211,238,0.35)]'
                      : 'bg-black/40 text-gray-400 hover:text-white border border-white/10 hover:border-cyan-400/50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Standard Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
            {filteredStandard.map((event, idx) => {
              const isLive = event.status === 'active'
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  className="group cursor-pointer w-full max-w-[400px] h-[450px] flex flex-col justify-end relative overflow-hidden rounded-2xl glass-panel border border-white/10 hover:border-cyan-400/50 transition-all duration-300 hover:-translate-y-1.5 shadow-xl"
                  onClick={() => openModal(event)}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-60 group-hover:opacity-80"
                    style={{ backgroundImage: `url('${event.image}')` }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-10"></div>

                  {/* Status Badge */}
                  <div className="absolute top-4 right-4 z-20">
                    {isLive ? (
                      <div className="bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>LIVE</span>
                      </div>
                    ) : (
                      <div className="bg-black/70 text-gray-400 border border-white/15 px-3 py-1 rounded-full text-xs font-mono font-medium tracking-wider backdrop-blur-md">
                        COMPLETED
                      </div>
                    )}
                  </div>

                  <div className="relative z-20 p-6 transform transition-transform duration-300 group-hover:-translate-y-1">
                    <h3
                      className="text-2xl font-bold mb-1 text-white uppercase tracking-wider group-hover:text-cyan-300 transition-colors"
                      style={{ fontFamily: 'var(--font-orbitron)' }}
                    >
                      {event.title}
                    </h3>
                    <p className="text-xs mb-3 font-mono text-cyan-400">{event.date}</p>
                    <p className="text-xs sm:text-sm font-mono text-gray-300 opacity-90 line-clamp-2 border-l-2 border-cyan-400/60 pl-3">
                      {event.shortDescription}
                    </p>
                    <div className="mt-4 flex items-center gap-2 font-mono text-xs text-cyan-400 group-hover:text-cyan-200 transition-colors">
                      <span>View Event Details</span>
                      <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </section>
      </div>

      {/* Global Event Modal */}
      <EventModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </main>
  )
}
