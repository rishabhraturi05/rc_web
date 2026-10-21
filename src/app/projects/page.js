"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const XIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const CATEGORIES = ["All", "Robotic Arms", "UAV & Aerial", "Autonomous Rovers", "CNC & Automation"];

export default function ProjectsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeProjectIndex, setActiveProjectIndex] = useState(null);
  const closeButtonRef = useRef(null);

  const projects = useMemo(
    () => [
      {
        title: "5-Axis Robotic Arm",
        category: "Robotic Arms",
        image: "/projects/robotic-arm.jpeg",
        summary: "A 5-axis robotic manipulator with inverse kinematics and OpenCV visual tracking.",
        description:
          "Developed an advanced 5-axis robotic arm using high-torque servo motors, leveraging OpenCV for color recognition and inverse kinematics for precise object placement. Implemented a PID algorithm to ensure smooth and accurate servo movement, enhancing performance for precision segregation.",
        tags: ["Robotic Arm", "OpenCV", "PID Control", "Inverse Kinematics"],
      },
      {
        title: "Quadcopter Platform",
        category: "UAV & Aerial",
        image: "/projects/quadcopter.jpeg",
        summary: "Custom carbon drone airframe with brushless ESCs, FPV telemetry, and flight controller.",
        description:
          "Built a quadcopter equipped with BLDC brushless motors and ESCs, controlled by a KK flight controller. Designed a customized drone base for enhanced stability and performance. Utilized RF transmission for reliable communication and integrated FPV (First-Person View) for real-time aerial footage, providing an immersive and responsive flying experience.",
        tags: ["Quadcopter", "BLDC ESC", "FPV Video", "Flight Control"],
      },
      {
        title: "Waste Management Robot",
        category: "Robotic Arms",
        image: "/projects/wmr.jpeg",
        summary: "Omnidirectional rover with sensor-based identification and a 3-axis sorting arm.",
        description:
          "Designed an efficient waste management robot featuring a sensor pad for waste identification and a 3-axis robotic arm for segregation. Engineered an omnidirectional rover with a 15 kg holding capacity using Arduino Uno to facilitate the robotic arm's movement.",
        tags: ["Waste Management", "Arduino", "Robotic Arm", "Sensors"],
      },
      {
        title: "2D CNC Plotter",
        category: "CNC & Automation",
        image: "/projects/2d-plotter.jpeg",
        summary: "Precision stepper-driven 2D drafting machine for rapid automated vector plotting.",
        description:
          "Designed and built a 2-D CNC Plotter capable of transforming digital art into precise, hand-drawn illustrations. The machine uses stepper-driven motion control and a custom tool head to sketch detailed patterns, typography art, and line drawings with remarkable accuracy. Integrated firmware and calibration workflows ensure smooth plotting, making it a compact, reliable, and creative desktop manufacturing tool for rapid prototyping and artistic automation.",
        tags: ["CNC Plotter", "Stepper Motors", "Vector Drafting", "Firmware"],
      },
      {
        title: "Omni-Directional RC Rover",
        category: "Autonomous Rovers",
        image: "/projects/Omni-Vector-Mobility-Rover.jpeg",
        summary: "Mecanum-wheel vector platform for algorithmic motion planning and real-time control.",
        description:
          "Engineered a compact omnidirectional RC rover capable of gliding effortlessly in any direction with smooth, vector-based motion. The chassis is equipped with precision-driven mecanum wheels and a responsive control system that allows the robot to trace programmed movement patterns, follow predefined paths, or switch to real-time manual control. Built for experimentation in motion planning and robotics navigation, the rover serves as a versatile platform for testing algorithms, exploring kinematics, and demonstrating elegant, highly maneuverable robotic motion.",
        tags: ["Mecanum Wheels", "Kinematics", "Motion Planning", "Vector Control"],
      },
      {
        title: "Lunarath (Moon Rover)",
        category: "Autonomous Rovers",
        image: "/projects/Lunarath-(Moon Rover).jpeg",
        summary: "Autonomous field rover with RealSense depth perception and onboard manipulation.",
        description:
          "Built an advanced autonomous rover designed for next-generation logistics, agriculture, and planetary exploration. The system integrates an Intel RealSense depth camera for spatial awareness, a Raspberry Pi running optimized PID control for ultra-stable mobility, and an Inverse Kinematics–driven robotic arm for precise object handling. The platform is engineered to adapt, navigate, and interact with complex environments, making it a versatile testbed for intelligent field robotics and automation research.",
        tags: ["Planetary Rover", "Intel RealSense", "Inverse Kinematics", "Autonomous Navigation"],
      },
      {
        title: "Telemetry-Enabled RC Aircraft",
        category: "UAV & Aerial",
        image: "/projects/Telemetry-Enabled-RC-Aircraft-Platform.jpeg",
        summary: "Custom aerodynamic foam-board aircraft with synchronized multithreaded avionics.",
        description:
          "Developed a fully custom foam-board RC aircraft engineered for aerodynamic stability, payload handling, and long-range communication, integrating a parallel data-logging system for synchronized in-flight operations. The airframe was modeled and iterated through CAD, while the electronics suite—built around a Raspberry Pi Pico—used multithreaded firmware to handle simultaneous control signals, telemetry acquisition, and actuator commands. NRF24L01 transceivers enabled a dedicated bidirectional communication link, and an onboard FPV camera provided real-time video for navigation and payload deployment.",
        tags: ["Avionics", "CAD Airframe", "Raspberry Pi Pico", "NRF24L01 RF"],
      },
    ],
    []
  );

  const filteredProjects = useMemo(() => {
    if (selectedCategory === "All") return projects;
    return projects.filter((p) => p.category === selectedCategory);
  }, [projects, selectedCategory]);

  useEffect(() => {
    const handleKeydown = (e) => {
      if (e.key === "Escape") {
        setActiveProjectIndex(null);
      }
      if (e.key === "Tab" && activeProjectIndex !== null) {
        e.preventDefault();
        closeButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [activeProjectIndex]);

  useEffect(() => {
    if (activeProjectIndex !== null) {
      document.body.style.overflow = "hidden";
      setTimeout(() => closeButtonRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeProjectIndex]);

  const activeProject = activeProjectIndex !== null ? filteredProjects[activeProjectIndex] : null;

  return (
    <main className="relative min-h-screen bg-[#020202] text-[#f5f1ea] overflow-x-hidden pt-32 pb-24">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-cyan-500/5 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-cyan-400 mb-3 px-3.5 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/20">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              <span>ENGINEERING SHOWCASE</span>
            </div>
            <h1
              className="text-5xl sm:text-6xl md:text-7xl font-black text-white tracking-tighter uppercase drop-shadow-[0_0_35px_rgba(255,255,255,0.3)] mb-4"
              style={{ fontFamily: "var(--font-orbitron)" }}
            >
              PROJECTS
            </h1>
            <p className="text-gray-300 font-mono text-sm sm:text-base max-w-xl mx-auto">
              Hardware prototypes, autonomous platforms, and robotic manipulators engineered at NIT Warangal.
            </p>
          </motion.div>
        </div>

        {/* Category Pill Filters (Kowalski Tactile Design) */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-14">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer active:scale-95 ${
                  isActive
                    ? "bg-cyan-400 text-black font-bold shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                    : "bg-black/40 text-gray-400 hover:text-white border border-white/10 hover:border-cyan-400/50"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Projects Grid */}
        <motion.div layout className="grid gap-8 sm:gap-10 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filteredProjects.map((p, idx) => (
              <motion.div
                key={p.title}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="h-full"
              >
                <button
                  onClick={() => setActiveProjectIndex(idx)}
                  className="group relative w-full h-full text-left glass-panel rounded-2xl overflow-hidden border border-white/10 hover:border-cyan-400/50 transition-all duration-300 flex flex-col justify-start focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-pointer hover:-translate-y-1.5 shadow-xl bg-black/60 backdrop-blur-md"
                >
                  {/* Image Container with smooth hover zoom */}
                  <div className="relative h-60 w-full overflow-hidden bg-slate-950">
                    <img
                      src={p.image}
                      alt={p.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>

                    {/* Category Tag overlay */}
                    <div className="absolute top-3 left-3">
                      <span className="font-mono text-[10px] px-2.5 py-1 rounded bg-black/70 backdrop-blur-md border border-white/20 text-cyan-300 uppercase tracking-widest">
                        {p.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                    <div>
                      <h3
                        className="text-xl sm:text-2xl text-white uppercase tracking-wider group-hover:text-cyan-300 transition-colors"
                        style={{ fontFamily: "var(--font-orbitron)" }}
                      >
                        {p.title}
                      </h3>
                      <p className="font-mono text-xs sm:text-sm text-gray-300 mt-3 line-clamp-3 leading-relaxed border-l-2 border-cyan-400/60 pl-3">
                        {p.summary}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap gap-1.5">
                      {p.tags.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="font-mono text-[10px] px-2.5 py-1 rounded bg-cyan-950/30 border border-cyan-500/30 text-cyan-300 tracking-wider"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center gap-2 font-mono text-xs text-cyan-400 group-hover:text-cyan-200 transition-colors">
                      <span>View Specifications</span>
                      <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Detail Modal Dialog */}
      <AnimatePresence>
        {activeProject && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setActiveProjectIndex(null)}
            ></motion.div>

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-panel border border-cyan-500/30 bg-black/90 backdrop-blur-xl rounded-2xl shadow-2xl custom-scrollbar"
            >
              <div className="relative h-64 sm:h-80 w-full overflow-hidden">
                <img
                  src={activeProject.image}
                  alt={activeProject.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

                <button
                  ref={closeButtonRef}
                  onClick={() => setActiveProjectIndex(null)}
                  aria-label="Close dialog"
                  className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-black/60 hover:bg-cyan-500/20 border border-white/20 hover:border-cyan-400 rounded-full text-white hover:text-cyan-300 transition-all cursor-pointer z-20 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  <XIcon />
                </button>

                <div className="absolute bottom-6 left-6 right-6">
                  <span className="font-mono text-xs px-2.5 py-1 rounded bg-cyan-950/60 border border-cyan-400/50 text-cyan-300 uppercase tracking-widest mb-2 inline-block">
                    {activeProject.category}
                  </span>
                  <h2
                    id="project-title"
                    className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight drop-shadow-lg"
                    style={{ fontFamily: "var(--font-orbitron)" }}
                  >
                    {activeProject.title}
                  </h2>
                </div>
              </div>

              <div className="p-6 sm:p-10">
                <div className="flex flex-wrap gap-2 mb-8">
                  {activeProject.tags.map((t) => (
                    <span
                      key={t}
                      className="font-mono text-xs px-3 py-1.5 rounded bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 tracking-wider"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <h3
                  className="text-xl font-bold mb-4 text-cyan-400 uppercase tracking-wider flex items-center gap-2"
                  style={{ fontFamily: "var(--font-orbitron)" }}
                >
                  <span className="w-4 h-[2px] bg-cyan-400"></span>
                  Technical Overview
                </h3>
                <p className="font-mono text-sm text-gray-300 leading-relaxed whitespace-pre-wrap pl-6 border-l-2 border-cyan-500/20">
                  {activeProject.description}
                </p>

                <div className="mt-10 pt-6 border-t border-white/10 flex justify-end">
                  <button
                    onClick={() => setActiveProjectIndex(null)}
                    className="px-6 py-2.5 rounded-lg font-mono text-xs font-bold uppercase tracking-wider text-black bg-cyan-400 hover:bg-cyan-300 active:scale-95 transition-all cursor-pointer"
                  >
                    Close Specifications
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
