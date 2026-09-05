'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import RoboconTimeline from '../components/Robocon'
import EyantraTimeline from '../components/Eyantra'

const CompeteTab = () => {
  const [currtab, setCurrtab] = useState('');

  const renderContent = () => {
    if (!currtab) return null;

    if (currtab === 'Robocon') {
      return <RoboconTimeline />;
    } else if (currtab === 'EYantra') {
      return <EyantraTimeline />;
    }

    return (
      <div className="text-center text-white py-10 font-mono">
        <p>Content for {currtab} would be displayed here.</p>
      </div>
    );
  };

  return (
    <main className="relative min-h-screen bg-transparent text-white overflow-x-hidden pb-24">

      {/* Hero Section */}
      <div className="relative z-10 pt-32 pb-16 text-center">
        <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
        >
          <h1 className="mb-4 text-5xl md:text-7xl font-black text-white title-glow tracking-tighter uppercase" style={{ fontFamily: 'var(--font-orbitron)' }}>
            Competitions
          </h1>
          <p className="text-cyan-400 font-mono text-lg max-w-2xl mx-auto bg-black/40 backdrop-blur-sm p-4 rounded-lg shadow-xl border border-white/10">
            Explore our journey through various robotics competitions and achievements.
          </p>
        </motion.div>
      </div>

      {/* Competition Selector */}
      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-8">
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onClick={() => setCurrtab('Robocon')}
            className={`group cursor-pointer w-full max-w-[320px] aspect-square rounded-2xl flex flex-col justify-end p-8 relative overflow-hidden transition-all duration-500 border-2 ${
              currtab === 'Robocon' 
                ? 'border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.4)] scale-105' 
                : 'border-white/20 hover:border-cyan-400/50 hover:scale-105'
            }`}
          >
            {/* Background Image with Overlay */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{ backgroundImage: "url('./robocon.jpg')" }}
            ></div>
            <div className={`absolute inset-0 transition-opacity duration-500 ${currtab === 'Robocon' ? 'bg-cyan-900/40' : 'bg-black/70 group-hover:bg-black/40'}`}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
            
            {/* Content */}
            <h3 className="relative z-10 text-3xl font-bold text-white tracking-widest uppercase transition-all duration-300 group-hover:text-cyan-300 drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]" style={{ fontFamily: 'var(--font-orbitron)' }}>
              Robocon
            </h3>
            <p className="relative z-10 font-mono text-sm text-cyan-50 mt-2 opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
              {'>'} INITIALIZE DATABASE
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            onClick={() => setCurrtab('EYantra')}
            className={`group cursor-pointer w-full max-w-[320px] aspect-square rounded-2xl flex flex-col justify-end p-8 relative overflow-hidden transition-all duration-500 border-2 ${
              currtab === 'EYantra' 
                ? 'border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.4)] scale-105' 
                : 'border-white/20 hover:border-cyan-400/50 hover:scale-105'
            }`}
          >
            {/* Background Image with Overlay */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{ backgroundImage: "url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbibab7EdP2fmKweDXfC_SjeVo6uJNLM_A1w&usqp=CAU')" }}
            ></div>
            <div className={`absolute inset-0 transition-opacity duration-500 ${currtab === 'EYantra' ? 'bg-cyan-900/40' : 'bg-black/70 group-hover:bg-black/40'}`}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
            
            {/* Content */}
            <h3 className="relative z-10 text-3xl font-bold text-white tracking-widest uppercase transition-all duration-300 group-hover:text-cyan-300 drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]" style={{ fontFamily: 'var(--font-orbitron)' }}>
              E-Yantra
            </h3>
            <p className="relative z-10 font-mono text-sm text-cyan-50 mt-2 opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
              {'>'} INITIALIZE DATABASE
            </p>
          </motion.div>

        </div>
      </div>

      <AnimatePresence mode="wait">
        {currtab && (
          <motion.div
            key={currtab}
            initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -50, filter: 'blur(10px)' }}
            transition={{ duration: 0.5 }}
            className="relative z-10 mt-24"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white uppercase tracking-widest" style={{ fontFamily: 'var(--font-orbitron)' }}>
                {currtab} Timeline
              </h2>
              <div className="w-24 h-1 bg-cyan-400 mx-auto mt-4 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
            </div>

            <div className="max-w-6xl mx-auto px-4">
              {renderContent()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

export default CompeteTab;