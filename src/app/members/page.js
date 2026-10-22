"use client";
import Link from 'next/link';
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaLinkedin,
  FaInstagram,
  FaEnvelope,
  FaNetworkWired,
  FaMicrochip,
  FaCode,
  FaCogs,
  FaBullhorn
} from 'react-icons/fa'
import { allmembers } from '../components/Membersarray';

const tabs = [
  { id: 'core', label: 'Leadership', icon: <FaNetworkWired /> },
  { id: 'software', label: 'Software', icon: <FaCode /> },
  { id: 'embedded', label: 'Embedded Systems', icon: <FaMicrochip /> },
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
        <img
          src={person.img || person.imageUrl || "/members/2026/aryan_roy.webp"}
          alt={person.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.src = "/favicon.ico";
          }}
        />
      </div>

      {/* Subtle dark gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90"></div>

      {/* Border glow on hover */}
      <div className="absolute inset-0 border-2 border-transparent transition-colors duration-300 group-hover:border-cyan-400/50 rounded-xl pointer-events-none"></div>

      <div className="absolute inset-x-0 bottom-0 p-4 text-white transform transition-transform duration-300">
        <div className="flex flex-col gap-2">
          <p className={`${isExtraSmall ? 'text-xs' : isSmall ? 'text-sm' : 'text-base'} font-bold font-mono tracking-tight text-cyan-50`}>{person.name}</p>
          {person.role && (
            <p className="text-xs font-mono text-gray-400 -mt-1">{person.role}</p>
          )}
          <div className="flex gap-4 items-center">
            {person.email && (
              <button
                onClick={() => copyToClipboard(person.email, 'email')}
                className="pointer-events-auto text-gray-400 hover:text-cyan-400 transition-colors cursor-pointer"
                title="Copy email"
              >
                <FaEnvelope size={16} />
              </button>
            )}
            {person.linkedin && person.linkedin !== "#" && (
              <Link
                href={person.linkedin.startsWith("http") ? person.linkedin : `https://${person.linkedin}`}
                target="_blank"
                rel="noreferrer"
                className="pointer-events-auto text-gray-400 hover:text-blue-400 transition-colors"
              >
                <FaLinkedin size={16} />
              </Link>
            )}
            {person.instagram && person.instagram !== "#" && (
              <button
                onClick={() => copyToClipboard(person.instagram, 'instagram')}
                className="pointer-events-auto text-gray-400 hover:text-pink-400 transition-colors cursor-pointer"
                title="Copy Instagram"
              >
                <FaInstagram size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Copy notification */}
      {copied && (
        <div className="absolute top-4 right-4 bg-black/90 backdrop-blur border border-cyan-400 text-cyan-300 px-2.5 py-1 rounded text-[11px] font-mono font-medium shadow-lg">
          Copied
        </div>
      )}
    </motion.div>
  )
}

const Section = ({ title, people = [], cols = 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4', cardSize = 'md' }) => (
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
  const [loading, setLoading] = useState(true);

  const [profiles, setProfiles] = useState({
    professor: allmembers.facad,
    secretaries: allmembers.secretaries,
    addlSecretaries: allmembers.addlSecretaries,
  });

  const [allofthemembers, setAllofthemembers] = useState({
    software: allmembers.software,
    embedded: allmembers.embedded,
    mechanical: allmembers.mechanical,
    pr: allmembers.pr,
  });

  // Fetch live members from MongoDB
  useEffect(() => {
    fetch('/api/members', { cache: 'no-store' })
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          const d = res.data;
          setProfiles({
            professor: Array.isArray(d.professor) && d.professor.length > 0 ? d.professor : allmembers.facad,
            secretaries: Array.isArray(d.secretaries) ? d.secretaries : allmembers.secretaries,
            addlSecretaries: Array.isArray(d.addlSecretaries) ? d.addlSecretaries : allmembers.addlSecretaries,
          });

          setAllofthemembers({
            software: Array.isArray(d.software) ? d.software : allmembers.software,
            embedded: Array.isArray(d.embedded) ? d.embedded : allmembers.embedded,
            mechanical: Array.isArray(d.mechanical) ? d.mechanical : allmembers.mechanical,
            pr: Array.isArray(d.pr) ? d.pr : allmembers.pr,
          });
        }
      })
      .catch((err) => {
        console.error("Live members load notice:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <main className="relative min-h-screen bg-transparent text-white overflow-x-hidden pb-24">

      {/* Header Section */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pt-32 pb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-cyan-400 mb-3 px-3.5 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/20">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span>PEOPLE OF RC NITW</span>
          </div>
          <h1 className="mb-4 text-5xl md:text-7xl font-black text-white title-glow tracking-tighter uppercase" style={{ fontFamily: 'var(--font-orbitron)' }}>
            OUR TEAM
          </h1>
          <p className="text-gray-300 font-mono text-sm sm:text-base max-w-2xl mx-auto">
            Meet the student innovators, technical leads, and mentors driving robotics and automation at NIT Warangal.
          </p>
        </motion.div>
      </div>

      {/* Domain Category Selector */}
      <div className="relative z-20 mx-auto max-w-5xl px-4 mb-16">
        <div className="flex flex-wrap justify-center gap-2.5 md:gap-3.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-mono text-xs md:text-sm uppercase tracking-wider transition-all duration-200 cursor-pointer active:scale-95 ${activeTab === tab.id
                  ? 'bg-cyan-400 text-black font-bold shadow-[0_0_20px_rgba(34,211,238,0.4)]'
                  : 'bg-black/60 border border-white/10 text-gray-400 hover:border-cyan-400/50 hover:text-white hover:bg-black/80'
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
        {loading ? (
          <div className="space-y-12">
            <div>
              <div className="w-48 h-6 bg-white/10 rounded mb-8 animate-pulse" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-80 rounded-2xl border border-white/10 bg-black/60 overflow-hidden animate-pulse p-4 flex flex-col justify-between">
                    <div className="w-full h-52 bg-white/5 rounded-xl mb-4" />
                    <div className="space-y-2">
                      <div className="w-3/4 h-4 bg-white/10 rounded" />
                      <div className="w-1/2 h-3 bg-cyan-400/20 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
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
              <Section title="Software Team" people={allofthemembers.software} cardSize="md" />
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
              <Section title="Embedded Systems" people={allofthemembers.embedded} cardSize="md" />
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
              <Section title="Mechanical Team" people={allofthemembers.mechanical} cardSize="md" />
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
        )}
      </div>

    </main>
  )
}

export default Page;
