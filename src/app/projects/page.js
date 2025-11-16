
"use client"

import React, { useEffect, useMemo, useRef, useState } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'

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

  // Initialize AOS animations
  useEffect(() => {
    AOS.init({ duration: 1000, once: true, easing: 'ease-out' })
  }, [])

  // Effect to handle keyboard controls (Escape to close, Tab for focus trapping)
  useEffect(() => {
    const handleKeydown = (e) => {
      if (e.key === 'Escape') {
        setActiveProjectIndex(null);
      }
      if (e.key === 'Tab' && activeProjectIndex !== null) {
        // Simple focus trap: ensures focus stays on the close button
        e.preventDefault();
        closeButtonRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [activeProjectIndex]);

  // Effect to lock body scroll when modal is open
  useEffect(() => {
    if (activeProjectIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    // Cleanup on component unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeProjectIndex]);

  // Effect to focus the close button when the modal opens
  useEffect(() => {
    if (activeProjectIndex !== null) {
      closeButtonRef.current?.focus();
    }
  }, [activeProjectIndex]);


  const activeProject = activeProjectIndex !== null ? projects[activeProjectIndex] : null;

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden">
      <div className="relative z-10 text-center pt-24 pb-12" data-aos="fade-up">
        <h1 className="batman-font text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">Projects</h1>
        <p className="destruct-font text-gray-300 mt-4 max-w-2xl mx-auto">Explore what we build and how we build it.</p>
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid gap-8 sm:gap-10 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {projects.map((p, idx) => (
            <div key={p.title} className="[perspective:1000px]" data-aos="zoom-in" data-aos-delay={idx * 100}>
              <button
                onClick={() => setActiveProjectIndex(idx)}
                className="group relative block w-full h-full bg-gray-800/50 border border-gray-700/80 rounded-2xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                <div className="relative h-64 w-full overflow-hidden rounded-t-2xl">
                  {/* Image zoom on hover */}
                  <img src={p.image} alt={p.title} className="absolute inset-0 w-full h-full object-fit transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                </div>

                <div className="p-5 text-left [transform:translateZ(40px)]">
                  <h3 className="batman-font text-xl sm:text-2xl text-gray-100">{p.title}</h3>
                  <p className="destruct-font text-sm text-gray-300 mt-2 line-clamp-2">{p.summary}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {p.tags.map((t) => (
                      <span key={t} className="destruct-font text-xs px-2.5 py-1 rounded-md bg-gray-800/70 border border-gray-700 text-gray-200">{t}</span>
                    ))}
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Dialog */}
      {activeProject && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop with transition */}
          <div
            className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${activeProjectIndex !== null ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setActiveProjectIndex(null)}
          ></div>

          {/* Modal Content with transition */}
          <div className={`relative z-10 w-full max-w-4xl bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ease-in-out ${activeProjectIndex !== null ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className="relative h-56 sm:h-72">
              <img src={activeProject.image} alt={activeProject.title} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
              <button
                ref={closeButtonRef}
                onClick={() => setActiveProjectIndex(null)}
                aria-label="Close dialog"
                className="absolute top-4 right-4 text-gray-300 hover:text-white bg-black/60 rounded-full p-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 border border-gray-700"
              >
                <XIcon />
              </button>
            </div>

            <div className="p-6 sm:p-8">
              <h2 id="project-title" className="batman-font text-2xl sm:text-4xl mb-2 text-white">{activeProject.title}</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {activeProject.tags.map((t) => (
                  <span key={t} className="destruct-font text-xs px-2.5 py-1 rounded-md bg-gray-800/70 border border-gray-700 text-gray-200">{t}</span>
                ))}
              </div>
              <p className="destruct-font text-gray-300 leading-relaxed">
                {activeProject.description}
              </p>

              {activeProject.links?.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-4">
                  {activeProject.links.map((l) => (
                    <a
                      key={l.href}
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="destruct-font inline-block text-sm px-5 py-2.5 rounded-lg border border-blue-500/70 text-blue-300 hover:border-blue-400 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >{l.label}</a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectsPage
