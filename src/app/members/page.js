"use client";
import Link from 'next/link';
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaLinkedin, FaInstagram, FaEnvelope, FaNetworkWired, FaMicrochip, FaCode, FaCogs, FaBullhorn } from 'react-icons/fa' 
import { allmembers } from '../components/Membersarray';

const profiles = {
  professor: allmembers.facad,
  secretaries: allmembers.secretaries,
  addlSecretaries: allmembers.addlSecretaries,
}
const allofthemembers = allmembers;

const tabs = [
  { id: 'core', label: 'Core Command', icon: <FaNetworkWired /> },
  { id: 'software', label: 'Software', icon: <FaCode /> },
  { id: 'embedded', label: 'Embedded', icon: <FaMicrochip /> },
  { id: 'mechanical', label: 'Mechanical', icon: <FaCogs /> },
  { id: 'pr', label: 'Public Relations', icon: <FaBullhorn /> }
];

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 }
};

const ProfileCard = ({ person, size = 'md', index = 0 }) => {
  const isSmall = size === 'sm' || size === 'xs'
  const isExtraSmall = size === 'xs'
  const [copied, setCopied] = useState('')

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(''), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  return (
    <motion.div 
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group relative overflow-hidden glass-panel glass-panel-hover"
    >
      <div className={`relative ${isExtraSmall ? 'h-50' : isSmall ? 'h-74' : 'h-68'} w-full`}>
        <img src={person.img} alt={person.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
      </div>
      
      {/* Cyberpunk gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90"></div>
      
      {/* Border glow on hover */}
      <div className="absolute inset-0 border-2 border-transparent transition-colors duration-300 group-hover:border-cyan-400/50 rounded-xl pointer-events-none"></div>

      <div className="absolute inset-x-0 bottom-0 p-4 text-white transform transition-transform duration-300">
          <div className="flex flex-col gap-2">
            <p className={`${isExtraSmall ? 'text-xs' : isSmall ? 'text-sm' : 'text-base'} font-bold font-mono tracking-tight text-cyan-50`}>{person.name}</p>
            <div className="flex gap-4 items-center">
              <button 
                onClick={() => copyToClipboard(person.email, 'email')} 
                className="pointer-events-auto text-gray-400 hover:text-cyan-400 transition-colors"
                title="Copy email"
              >
                <FaEnvelope size={16} />
              </button>
              <Link href={person.linkedin} target="_blank" rel="noreferrer" className="pointer-events-auto text-gray-400 hover:text-blue-400 transition-colors">
                <FaLinkedin size={16} />
              </Link>
              <button 
                onClick={() => copyToClipboard(person.instagram, 'instagram')} 
                className="pointer-events-auto text-gray-400 hover:text-pink-400 transition-colors"
                title="Copy Instagram"
              >
                <FaInstagram size={16} />
              </button>
            </div>
          </div>
      </div>
      
      {/* Terminal style copy notification */}
      {copied && (
        <div className="absolute top-4 right-4 bg-cyan-900/80 backdrop-blur border border-cyan-400 text-cyan-100 px-3 py-1 rounded-md text-xs font-mono font-medium animate-pulse">
          {'>'} COPIED
        </div>
      )}
    </motion.div>
  )
}

const Section = ({ title, people, cols = 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4', cardSize = 'md' }) => (
  <div className="mb-16">
    <div className="flex items-center gap-4 mb-10">
      <span className="w-12 h-[2px] bg-cyan-400"></span>
      <h2 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-widest" style={{ fontFamily: 'var(--font-orbitron)' }}>{title}</h2>
    </div>
    <div className={`grid gap-6 ${cols}`}>
      {people.map((p, idx) => (
        <ProfileCard key={`${p.name}-${idx}`} person={p} size={cardSize} index={idx % 8} />
      ))}
    </div>
  </div>
)

const Page = () => {
  const [activeTab, setActiveTab] = useState('core');

  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden pb-24">

      {/* Hero Section */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pt-32 pb-12 text-center">
        <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
        >
          <h1 className="mb-4 text-5xl md:text-7xl font-black text-white title-glow tracking-tighter" style={{ fontFamily: 'var(--font-orbitron)' }}>TEAM DATABASE</h1>
          <p className="text-cyan-400 font-mono text-lg max-w-2xl mx-auto bg-black/40 backdrop-blur-sm p-4 rounded-lg shadow-xl border border-white/10">
            Select a network node to access personnel files.
          </p>
        </motion.div>
      </div>

      {/* Cyber-Node Selector Hub */}
      <div className="relative z-20 mx-auto max-w-5xl px-4 mb-16">
        <div className="flex flex-wrap justify-center gap-3 md:gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-md font-mono text-xs md:text-sm uppercase tracking-widest transition-all duration-300 border-2 ${
                activeTab === tab.id 
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)] scale-105' 
                  : 'bg-black/60 border-white/10 text-gray-400 hover:border-white/30 hover:text-white hover:bg-black/80'
              } backdrop-blur-md`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Data Grid Render */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 min-h-[50vh]">
        <AnimatePresence mode="wait">
          {activeTab === 'core' && (
            <motion.div
              key="core"
              initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
              transition={{ duration: 0.3 }}
            >
              <Section title="Faculty Advisor" people={profiles.professor} cols="grid-cols-1 max-w-sm" />
              <Section title="General Secretaries" people={profiles.secretaries} cols="grid-cols-1 sm:grid-cols-2 max-w-3xl" />
              <Section title="Additional Secretaries" people={profiles.addlSecretaries} cols="grid-cols-1 sm:grid-cols-2 md:grid-cols-4" />
            </motion.div>
          )}

          {activeTab === 'software' && (
            <motion.div
              key="software"
              initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
              transition={{ duration: 0.3 }}
            >
              <Section title="Software Team" people={allofthemembers.software} cardSize="sm" />
            </motion.div>
          )}

          {activeTab === 'embedded' && (
            <motion.div
              key="embedded"
              initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
              transition={{ duration: 0.3 }}
            >
              <Section title="Embedded Systems" people={allofthemembers.embedded} cardSize="sm" />
            </motion.div>
          )}

          {activeTab === 'mechanical' && (
            <motion.div
              key="mechanical"
              initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
              transition={{ duration: 0.3 }}
            >
              <Section title="Mechanical Team" people={allofthemembers.mechanical} cardSize="sm" />
            </motion.div>
          )}

          {activeTab === 'pr' && (
            <motion.div
              key="pr"
              initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
              transition={{ duration: 0.3 }}
            >
              <Section title="Public Relations" people={allofthemembers.pr} cols="grid-cols-1 sm:grid-cols-2 md:grid-cols-3" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
    </main>
  )
}

export default Page;


