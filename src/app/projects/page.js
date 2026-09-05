"use client"

import React, { useMemo, useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// SVG Icon for the close button
const XIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const ProjectsPage = () => {
  const [activeProjectIndex, setActiveProjectIndex] = useState(null);
  const closeButtonRef = useRef(null);

  const projects = useMemo(() => ([
    {
      title: '5-Axis Robotic arm',
      image: '/projects/robotic-arm.jpeg',
      summary: 'A 5-axis robotic arm with a gripper and a camera for object manipulation.',
      description: 'Developed an advanced 5-axis robotic arm using high torque servo motors, leveraging OpenCV for color recognition and inverse kinematics for precise object placement. Implemented a PID algorithm to ensure smooth and accurate servo movement, enhancing performance for segregation',
      tags: ['Robotic Arm', 'OpenCV', 'PID Control'],
    },
    {
      title: 'Quadcopter',
      image: '/projects/quadcopter.jpeg',
      summary: 'A quadcopter with a camera for object detection and avoidance.',
      description: 'Built a quadcopter equipped with BLDC brushless motors and ESCs, controlled by a KK flight controller. Designed a customized drone base for enhanced stability and performance. Utilized RF transmission for reliable communication and integrated FPV (First-Person View) for real-time aerial footage, providing an immersive and responsive flying experience.',
      tags: ['Quadcopter', 'OpenCV', 'PID Control'],
    },
    {
      title: 'Waste Management Robot',
      image: '/projects/wmr.jpeg',
      summary: 'A waste management robot with a sensor pad and a 3-axis robotic arm for segregation.',
      description: "Designed an efficient waste management robot using Arduino IDE, featuring a sensor pad for waste identification and a 3-axis robotic arm for segregation. Engineered an omnidirectional rover with a 15 kg holding capacity using Arduino Uno to facilitate the robotic arm's movement.",
      tags: ['Waste Management', 'Arduino', 'Robotic Arm'],
    },
    {
      title: '2D Plotter',
      image: '/projects/2d-plotter.jpeg',
      summary: 'A 2D plotter with a stepper motor and a custom tool head for plotting.',
      description: 'Designed and built a 2-D CNC Plotter capable of transforming digital art into precise, hand-drawn illustrations. The machine uses stepper-driven motion control and a custom tool head to sketch detailed patterns, typography art, and line drawings with remarkable accuracy. Integrated firmware and calibration workflows ensure smooth plotting, making it a compact, reliable, and creative desktop manufacturing tool for rapid prototyping and artistic automation.',
      tags: ['2D Plotter', 'Stepper Motor', 'Custom Tool Head'],
    },
    {
      title: 'Omni-Directional RC Rover',
      image: '/projects/Omni-Vector-Mobility-Rover.jpeg',
      summary: 'An omnidirectional RC rover with a mecanum wheel setup for smooth motion.',
      description: 'Engineered a compact omnidirectional RC rover capable of gliding effortlessly in any direction with smooth, vector-based motion. The chassis is equipped with precision-driven mecanum wheels and a responsive control system that allows the robot to trace programmed movement patterns, follow predefined paths, or switch to real-time manual control. Built for experimentation in motion planning and robotics navigation, the rover serves as a versatile platform for testing algorithms, exploring kinematics, and demonstrating elegant, highly maneuverable robotic motion.',
      tags: ['Omni-Directional RC Rover', 'Mecanum Wheels', 'Control System'],
    },
    {
      title: 'Lunarath (Moon Rover)',
      image: '/projects/Lunarath-(Moon Rover).jpeg',
      summary: 'An autonomous rover with a RealSense camera and a robotic arm for object handling.',
      description: 'Built an advanced autonomous rover designed for next-generation logistics, agriculture, and planetary exploration. The system integrates an Intel RealSense depth camera for spatial awareness, a Raspberry Pi running optimized PID control for ultra-stable mobility, and an Inverse Kinematics–driven robotic arm for precise object handling. The platform is engineered to adapt, navigate, and interact with complex environments, making it a versatile testbed for intelligent field robotics and automation research.',
      tags: ['Lunarath (Moon Rover)', 'RealSense Camera', 'Robotic Arm'],
    },
    {
      title: 'Telemetry-Enabled RC Aircraft Platform',
      image: '/projects/Telemetry-Enabled-RC-Aircraft-Platform.jpeg',
      summary: 'A telemetry-enabled RC aircraft platform with a data-logging and bomb-release system for synchronized in-flight operations.',
      description: 'We developed a fully custom, foam-board RC aircraft engineered for stability, payload handling, and long-range communication, integrating a parallel data-logging and bomb-release system for synchronized in-flight operations. The airframe was modeled and iterated through CAD, while the electronics suite—built around a Raspberry Pi Pico—used multithreaded firmware to handle simultaneous control signals, telemetry acquisition, and actuator commands. NRF24L01 transceivers enabled a dedicated bidirectional communication link, and an onboard FPV camera provided real-time video for navigation and payload deployment. The result was a technically robust platform that combined aerodynamic design, embedded systems, wireless communication, and mission-oriented automation into a single, field-tested aircraft.',
      tags: ['Telemetry-Enabled RC Aircraft Platform', 'Data-Logging', 'Bomb-Release System'],
    }
  ]), []);

  useEffect(() => {
    const handleKeydown = (e) => {
      if (e.key === 'Escape') {
        setActiveProjectIndex(null);
      }
      if (e.key === 'Tab' && activeProjectIndex !== null) {
        e.preventDefault();
        closeButtonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [activeProjectIndex]);

  useEffect(() => {
    if (activeProjectIndex !== null) {
      document.body.style.overflow = 'hidden';
      // Slight delay to ensure element is rendered
      setTimeout(() => closeButtonRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeProjectIndex]);

  const activeProject = activeProjectIndex !== null ? projects[activeProjectIndex] : null;

  return (
    <main className="relative min-h-screen bg-transparent text-white overflow-x-hidden pb-24">

      <div className="relative z-10 pt-32 pb-16 text-center">
        <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
        >
          <h1 className="mb-4 text-5xl md:text-7xl font-black text-white title-glow tracking-tighter uppercase" style={{ fontFamily: 'var(--font-orbitron)' }}>
            Projects
          </h1>
          <p className="text-cyan-400 font-mono text-lg max-w-2xl mx-auto bg-black/40 backdrop-blur-sm p-4 rounded-lg shadow-xl border border-white/10">
            Explore what we build and how we build it.
          </p>
        </motion.div>
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid gap-8 sm:gap-10 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {projects.map((p, idx) => (
            <motion.div 
              key={p.title} 
              className="h-full"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <button
                onClick={() => setActiveProjectIndex(idx)}
                className="group relative block w-full h-full text-left glass-panel glass-panel-hover flex flex-col justify-start focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <div className="relative h-64 w-full overflow-hidden rounded-t-xl">
                  {/* Image zoom on hover */}
                  <img src={p.image} alt={p.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                </div>

                <div className="p-6 flex-1 flex flex-col transform transition-transform duration-300 group-hover:-translate-y-2">
                  <h3 className="text-xl sm:text-2xl text-white uppercase tracking-wider group-hover:text-cyan-300 transition-colors" style={{ fontFamily: 'var(--font-orbitron)' }}>{p.title}</h3>
                  <p className="font-mono text-sm text-gray-300 mt-3 line-clamp-3 border-l-2 border-cyan-400 pl-3">{p.summary}</p>
                  
                  <div className="mt-auto pt-6 flex flex-wrap gap-2">
                    {p.tags.map((t) => (
                      <span key={t} className="font-mono text-xs px-2.5 py-1 rounded-sm bg-cyan-900/30 border border-cyan-400/50 text-cyan-300 tracking-wider">
                        {t}
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 font-mono text-xs text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 uppercase">
                      {'>'} INITIATE PROJECT LINK
                  </p>
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal Dialog */}
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
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setActiveProjectIndex(null)}
            ></motion.div>

            {/* Modal Content */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar glass-panel"
            >
              <div className="relative h-56 sm:h-80 rounded-t-xl overflow-hidden">
                <img src={activeProject.image} alt={activeProject.title} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                <button
                  ref={closeButtonRef}
                  onClick={() => setActiveProjectIndex(null)}
                  aria-label="Close dialog"
                  className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-black/50 hover:bg-cyan-500/20 border border-white/20 hover:border-cyan-400 rounded-full text-white hover:text-cyan-400 transition-all duration-300 z-20 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  <XIcon />
                </button>
                
                <div className="absolute bottom-6 left-6 right-6">
                  <h2 id="project-title" className="text-3xl sm:text-5xl font-bold text-white uppercase tracking-widest drop-shadow-lg" style={{ fontFamily: 'var(--font-orbitron)' }}>
                      {activeProject.title}
                  </h2>
                </div>
              </div>

              <div className="p-6 sm:p-10">
                <div className="flex flex-wrap gap-2 mb-8">
                  {activeProject.tags.map((t) => (
                    <span key={t} className="font-mono text-xs px-3 py-1.5 rounded-sm bg-cyan-900/30 border border-cyan-400 text-cyan-300 tracking-wider">
                      {t}
                    </span>
                  ))}
                </div>
                
                <h3 className="text-xl font-bold mb-4 text-cyan-400 uppercase tracking-widest flex items-center gap-2" style={{ fontFamily: 'var(--font-orbitron)' }}>
                  <span className="w-4 h-[2px] bg-cyan-400"></span>
                  Project Logs
                </h3>
                <p className="font-mono text-sm text-gray-300 leading-relaxed whitespace-pre-wrap pl-6 border-l border-white/10">
                  {activeProject.description}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  )
}

export default ProjectsPage
