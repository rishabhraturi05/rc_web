
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
      title: 'RC Blaze',
      image: 'https://placehold.co/600x400/0D1117/FFFFFF?text=RC+Blaze',
      summary: 'A high-speed, PID-tuned line follower robot engineered for competitive events.',
      description: 'RC Blaze is a competitive line follower robot focused on high-speed navigation with PID tuning, a modular chassis, and rapid pit iteration. Built to compete in campus and inter-collegiate events, it showcases advanced control systems and robust mechanical design.',
      tags: ['Line Follower', 'PID Control', 'Embedded Systems'],
      links: [{ label: 'View Gallery', href: '#' }]
    },
    {
      title: 'Sumo Wars Bot',
      image: 'https://placehold.co/600x400/0D1117/FFFFFF?text=Sumo+Wars',
      summary: 'A torque-optimized pusher bot with intelligent edge detection for autonomous combat.',
      description: 'This is a compact, low-CG sumo bot featuring torque-dense drivetrains, high-grip wheels, and IR-based dohyo edge detection. It has been meticulously tuned for aggressive bouts and quick recoveries in the ring.',
      tags: ['Mechanical', 'Control Systems', 'Sensors'],
      links: []
    },
    {
      title: 'e-Yantra Tasks',
      image: 'https://placehold.co/600x400/0D1117/FFFFFF?text=e-Yantra',
      summary: 'Simulation-first robotics development with a robust perception pipeline for complex tasks.',
      description: 'Our e-Yantra challenge entries emphasize simulation-grounded development, robust state machines, and perception using classical CV pipelines, with a progressive deployment strategy to real hardware for validated performance.',
      tags: ['e-Yantra', 'Computer Vision', 'Simulation'],
      links: []
    },
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
                  <img src={p.image} alt={p.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
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
