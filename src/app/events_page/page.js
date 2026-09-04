'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const EventCard = ({ event, onClick, index }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <div className="absolute top-4 right-4 bg-cyan-500/20 text-cyan-300 border border-cyan-400 px-3 py-1 rounded-sm text-xs font-mono font-bold tracking-widest animate-pulse backdrop-blur-md shadow-[0_0_10px_rgba(34,211,238,0.5)] z-20">
            [ LIVE ]
          </div>
        )
      case 'completed':
        return (
          <div className="absolute top-4 right-4 bg-gray-900/60 text-gray-400 border border-gray-600 px-3 py-1 rounded-sm text-xs font-mono font-bold tracking-widest backdrop-blur-md z-20">
            [ COMPLETED ]
          </div>
        )
      case 'cancelled':
        return (
          <div className="absolute top-4 right-4 bg-red-900/60 text-red-400 border border-red-500 px-3 py-1 rounded-sm text-xs font-mono font-bold tracking-widest backdrop-blur-md z-20">
            [ CANCELLED ]
          </div>
        )
      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group cursor-pointer w-full max-w-[400px] h-[450px] flex flex-col justify-end relative overflow-hidden glass-panel glass-panel-hover"
      onClick={onClick}
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-80"
        style={{ backgroundImage: `url('${event.image}')` }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-10"></div>
      
      {getStatusBadge(event.status)}

      <div className="relative z-20 p-6 transform transition-transform duration-300 group-hover:-translate-y-2">
        <h3 className="text-2xl font-bold mb-2 text-white uppercase tracking-wider group-hover:text-cyan-300 transition-colors" style={{ fontFamily: 'var(--font-orbitron)' }}>{event.title}</h3>
        <p className="text-sm mb-3 font-mono text-cyan-400">{event.date}</p>
        <p className="text-sm font-mono text-gray-300 opacity-90 line-clamp-2 border-l-2 border-cyan-400 pl-3">{event.shortDescription}</p>
        <p className="mt-4 font-mono text-xs text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {'>'} CLICK TO DECRYPT
        </p>
      </div>
    </motion.div>
  )
}

const EventModal = ({ event, isOpen, onClose }) => {
  // Escape key + body scroll lock
  React.useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-2xl max-h-[85vh] overflow-y-auto custom-scrollbar glass-panel"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative h-48 sm:h-64 rounded-t-xl overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('${event.image}')` }}  
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
              
              <button
                onClick={onClose}
                aria-label="Close dialog"
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-black/50 hover:bg-cyan-500/20 border border-white/20 hover:border-cyan-400 rounded-full text-white hover:text-cyan-400 transition-all duration-300 z-20 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              </button>
              
              <div className="absolute bottom-6 left-6 right-6">
                <h2 id="event-modal-title" className="text-3xl sm:text-4xl font-bold text-white uppercase tracking-widest drop-shadow-lg" style={{ fontFamily: 'var(--font-orbitron)' }}>
                    {event.title}
                </h2>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-8">
              <div className="flex flex-col gap-8">
                {/* Event Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
                    <span className="block font-mono text-xs text-gray-500 mb-1">DATE</span>
                    <p className="font-mono text-sm text-cyan-300">{event.date}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
                    <span className="block font-mono text-xs text-gray-500 mb-1">TIME</span>
                    <p className="font-mono text-sm text-cyan-300">{event.time}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-4 rounded-lg sm:col-span-2">
                    <span className="block font-mono text-xs text-gray-500 mb-1">VENUE</span>
                    <p className="font-mono text-sm text-white">{event.venue}</p>
                  </div>
                </div>

                {/* Event Description */}
                <div>
                  <h3 className="text-xl font-bold mb-4 text-cyan-400 uppercase tracking-widest flex items-center gap-2" style={{ fontFamily: 'var(--font-orbitron)' }}>
                    <span className="w-4 h-[2px] bg-cyan-400"></span>
                    Mission Brief
                  </h3>
                  <div className="text-gray-300 font-mono text-sm leading-relaxed whitespace-pre-wrap pl-6 border-l border-white/10">
                    {event.description}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="bg-cyan-900/20 border border-cyan-400/30 p-5 rounded-lg">
                  <h3 className="text-sm font-bold mb-2 text-cyan-400 font-mono tracking-widest uppercase">Comm Link</h3>
                  <p className="text-white font-mono text-sm">{event.contact}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

const EventsPage = () => {
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const events = [
    {
      id: 1,
      title: "Fresher's Event",
      date: "Oct 17, 2025",
      time: "5:00 PM",
      venue: "MME Seminar Hall",
      duration: "3 hours",
      fee: "-",
      status: "completed",
      image: "/events/freshers.jpg",
      shortDescription: "Exclusive event for freshers",
      description: "The wait is finally OVER.\nThe heist of creativity is about to begin…\n🎭 LA CASA DE ROBOT\nHere's the Masterplan, Crew:\n🔹 Rendezvous Point: MME Seminar Hall\n🔹 Mission: Crack codes, conquer challenges, outsmart the clock\n🔹 Goal: Unleash your inner innovator 🤖\n\nAnd the spoils of this heist ? 🏆\nRobotic Kits, Refreshments, Glory, and Bragging Rights! ⚙\nThis time, we're not after gold or banks…\nWe're after something bigger —\n⚡ Innovation.Imagination.The Future of Robotics! ⚡\n",
      contact: "Contact: robotics@nitw.ac.in | Phone: +91-7661991859"
    },
    {
      id: 2,
      title: "Sumo War",
      date: "October 24-25, 2025",
      time: "-",
      venue: "-",
      duration: "4 hours",
      fee: "N/A",
      status: "completed",
      image: "/events/Sumo Wars Event Poster.png",
      shortDescription: "Robotics Battle",
      description: "Where strategy meets strength! Step into the arena with your battle-ready sumobot and take control in an adrenaline-fueled showdown. Outsmart your rival, push them out of the warzone, and rack up points by landing hits and keeping them trapped in the danger zone. Skill decides the champion!",
      contact: "Contact: Srijoy | Phone: +91-75694 98783"
    },
    {
      id: 3,
      title: "Bombs Away",
      date: "October 24-25, 2025",
      time: "-",
      venue: "Robotics Lab, NIT Warangal",
      duration: "-",
      fee: "N/A",
      status: "completed",
      image: "/events/Bombs_Away_EventPoster.png",
      shortDescription: "Fly the Plane",
      description: "Bomb's Away is a skill-based challenge testing your timing and judgment. As a 'Bombardier,' you will control a single trigger to release an inert payload from a pilot-operated RC aircraft. Your mission is to account for speed and altitude to land the payload closest to the target's center.",
      contact: "Contact: Dhanvanth | Phone: 74180 56603"
    },
    {
      id: 4,
      title: "BLAZE",
      date: "October 24-25, 2025",
      time: "-",
      venue: "-",
      duration: "-",
      fee: "N/A",
      status: "completed",
      image: "/events/RC_BLAZE_POSTER.png",
      shortDescription: "Showcase your innovative robotics solutions",
      description: "BLAZE is your high-octane laser challenge by the Robotics Club. Enter the custom 'Alice in Borderland' arena for intense 4v4 combat. The map is loaded with secrets, and every day brings a new game mode! Play smart, hit hard, and fight your way to the top of the live leaderboard.",
      contact: "Contact: Soumilya | Phone: 84486 44855"
    },
    {
      id: 5,
      title: "Robotics Workshop",
      date: "Sept 14, 2025",
      time: "10:00 AM - 4:00 PM",
      venue: "ALC",
      duration: "6 hours",
      fee: "-",
      status: "completed",
      image: "/events/workshop.jpg",
      shortDescription: "Learn the basics of robotics",
      description: "Join this interactive, hands-on session to explore Arduino, Robot Design, and take on thrilling challenges like Cozmo Clench and Meshmerize—the perfect launchpad for Techfest IIT Bombay.This is not just a lecture—you will build, create, and compete with like-minded robotics enthusiasts.",
      contact: "Contact: roboticsclub@nitw.ac.in | Phone: +91-7661991859"
    },
    {
      id: 6,
      title: "Global Trends in Robotics",
      date: "March 19, 2025",
      time: "6:30 PM",
      venue: "ALC",
      duration: "3 hours",
      fee: "-",
      status: "completed",
      image: "/events/onlinewebinar25.png",
      shortDescription: "Global Trends in Robotics",
      description: "The field of robotics is evolving rapidly, opening up exciting opportunities across the globe in research, industry, and entrepreneurship. From AI-driven automation to space exploration and healthcare innovations, robotics is transforming the way we work and live.Join us for an insightful speaker session where our expert Nallamilli Venkata Reddy garu will discuss about global trends in robotics, career pathways, international research collaborations, and the skills needed to thrive in this dynamic field.Don't miss this opportunity to gain valuable knowledge and explore how you can be part of the global robotics revolution!",
      contact: "Contact: roboticsclub@nitw.ac.in | Phone: +91-7661991859"
    }
  ]

  const handleEventClick = (event) => {
    setSelectedEvent(event)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedEvent(null), 300)
  }

  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden pb-24">

      {/* Hero Section */}
      <div className="relative z-10 pt-32 pb-16 text-center">
        <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
        >
          <h1 className="mb-4 text-5xl md:text-7xl font-black text-white title-glow tracking-tighter uppercase" style={{ fontFamily: 'var(--font-orbitron)' }}>
            Events
          </h1>
          <p className="text-cyan-400 font-mono text-lg max-w-2xl mx-auto bg-black/40 backdrop-blur-sm p-4 rounded-lg shadow-xl border border-white/10">
            Join our exciting robotics events and workshops.
          </p>
        </motion.div>
      </div>

      {/* Events Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {events.map((event, idx) => (
            <EventCard
              key={event.id}
              event={event}
              index={idx}
              onClick={() => handleEventClick(event)}
            />
          ))}
        </div>
      </div>

      {/* Modal */}
      <EventModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </main>
  )
}

export default EventsPage
