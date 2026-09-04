"use client"
import React, { useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Analytics } from '@vercel/analytics/next';
import Lenis from 'lenis';
import ThreeScene from './components/ThreeScene';

const Page = () => {
  useEffect(() => {
    // Initialize Lenis for buttery smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  const { scrollYProgress } = useScroll();

  // The title fades OUT between 0% and 15% of the total page scroll
  const titleOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const titleY = useTransform(scrollYProgress, [0, 0.15], [0, -100]);

  return (
    <div className="relative w-full bg-black">
      
      {/* 3D Background Scene (Replaces Spline & Gradient) */}
      <ThreeScene />

      {/* Scrolling Content Container */}
      <div className="relative z-10 w-full flex flex-col pointer-events-none">

        {/* SECTION 1: Fixed Title that fades out based on scroll */}
        <div className="h-[150vh] w-full relative">
          <div className="sticky top-0 h-screen w-full flex flex-col justify-center items-start px-8 md:px-16 lg:px-24">
            <motion.div
              style={{ opacity: titleOpacity, y: titleY }}
              initial={{ filter: "blur(10px)", scale: 1.1, x: -50 }}
              animate={{ filter: "blur(0px)", scale: 1, x: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="max-w-3xl"
            >
              <h1 
                className="text-6xl sm:text-7xl md:text-8xl lg:text-[7rem] text-white font-black tracking-tighter drop-shadow-[0_0_25px_rgba(255,255,255,0.4)] text-left leading-[0.9]"
                style={{ fontFamily: 'var(--font-orbitron)' }}
              >
                NITW<br/>ROBOTICS<br/>CLUB
              </h1>
              <motion.p 
                className="text-cyber font-mono mt-8 text-lg sm:text-xl md:text-2xl border-l-4 border-cyber pl-5 bg-black/30 backdrop-blur-sm p-4 rounded-r-lg shadow-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 1 }}
              >
                Building the future of automation, one circuit at a time.
              </motion.p>
            </motion.div>
          </div>
        </div>

        {/* Space reserved for animation transitions */}
        <div className="h-[50vh] w-full"></div>

        {/* SECTION 2: Origin (Left) */}
        <div className="min-h-screen w-full flex flex-col justify-center px-6 sm:px-12 max-w-7xl mx-auto relative">
          <div className="w-full md:w-1/2 lg:w-1/3 flex flex-col gap-6 self-start">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ margin: "-200px" }}
              transition={{ duration: 1 }}
              className="w-full glass-panel p-8 border-l-4 border-l-white/20 pointer-events-auto shadow-2xl bg-black/60 backdrop-blur-md"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-[1px] bg-cyber"></span>
                <p className='text-xl text-cyber font-mono font-bold tracking-widest uppercase'>[ ORIGIN ]</p>
              </div>
              <p className="text-base text-gray-200 font-mono leading-relaxed text-justify">
                Founded in 2019–20, the Robotics Club aims to introduce and promote the field of robotics at NIT Warangal. We strive to guide enthusiasts and build a community of like-minded innovators.
              </p>
            </motion.div>
            
            {/* Quirky Quote */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ margin: "-200px" }}
              transition={{ duration: 1, delay: 0.3 }}
              className="px-6 py-3 glass-panel border-l-2 border-l-cyber/50 pointer-events-auto self-start bg-black/40 backdrop-blur-sm shadow-xl"
            >
              <p className="text-gray-400 text-sm font-mono italic">
                {">"} &quot;yes we are a new club, but we ain&apos;t gonna disappoint y&apos;all tho.&quot;
              </p>
            </motion.div>
          </div>
        </div>

        {/* SECTION 3: Mission (Right) */}
        <div className="min-h-screen w-full flex flex-col justify-center px-6 sm:px-12 max-w-7xl mx-auto relative">
          <div className="w-full md:w-1/2 lg:w-1/3 flex flex-col gap-6 self-end items-end">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ margin: "-200px" }}
              transition={{ duration: 1 }}
              className="w-full glass-panel p-8 border-r-4 border-r-white/20 pointer-events-auto shadow-2xl bg-black/60 backdrop-blur-md"
            >
              <div className="flex items-center justify-end gap-3 mb-4">
                <p className='text-xl text-cyber font-mono font-bold tracking-widest uppercase'>[ MISSION ]</p>
                <span className="w-8 h-[1px] bg-cyber"></span>
              </div>
              <p className="text-base text-gray-200 font-mono leading-relaxed text-justify">
                We provide hands-on learning through workshops, training sessions, and active participation in competitive robotics events across India to push the boundaries of technology.
              </p>
            </motion.div>

            {/* Quirky Quote */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ margin: "-200px" }}
              transition={{ duration: 1, delay: 0.3 }}
              className="px-6 py-3 glass-panel border-r-2 border-r-cyber/50 pointer-events-auto self-end bg-black/40 backdrop-blur-sm shadow-xl max-w-sm"
            >
              <p className="text-gray-400 text-sm font-mono italic text-right">
                {">"} &quot;we&apos;re a group of people who got a little bit of brains and we do kinda work hard (u can see it right in front of u)&quot;
              </p>
            </motion.div>
          </div>
        </div>

        {/* SECTION 4: Vision (Bottom Full Width) */}
        <div className="min-h-screen w-full flex flex-col justify-center px-6 sm:px-12 max-w-7xl mx-auto relative mb-24">
          <div className="flex flex-col gap-8 w-full">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="w-full flex flex-col lg:flex-row items-center justify-between p-6 sm:p-8 md:p-12 gap-8 glass-panel pointer-events-auto shadow-2xl bg-black/70 backdrop-blur-md"
            >
              {/* Left side - Robotics Club Logo */}
              <div className="flex-1 flex justify-center lg:justify-start">
                <div className="relative group">
                  <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 overflow-hidden rounded-full glass-panel flex items-center justify-center bg-black/50">
                    <img
                      src="/Robotics Club, NITW.png"
                      alt="Robotics Club Logo"
                      className="absolute w-[80%] h-[80%] object-contain transform hover:animate-spin transition-all duration-300 drop-shadow-[0_0_15px_rgba(45,156,219,0.5)]"
                    />
                  </div>
                </div>
              </div>

              {/* Right side - Our Vision */}
              <div className="flex-1 text-center lg:text-left">
                <p className="text-lg sm:text-xl lg:text-2xl text-cyber font-mono mb-3 sm:mb-4 font-bold tracking-widest uppercase">[ Our Vision ]</p>
                <p className="text-sm sm:text-base lg:text-lg text-gray-300 font-mono leading-relaxed opacity-90">
                  To establish a vibrant and innovative robotics culture at NIT Warangal — one that inspires creativity, collaboration, and technical excellence. We aim to nurture future innovators who push the boundaries of technology, driving advancements in robotics that impact society and shape a smarter, more automated world.
                </p>
              </div>
            </motion.div>

            {/* Quirky Quote */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ margin: "-100px" }}
              transition={{ duration: 1, delay: 0.4 }}
              className="px-8 py-4 glass-panel border-b-2 border-b-cyber/50 pointer-events-auto self-center bg-black/40 backdrop-blur-sm shadow-xl"
            >
              <p className="text-gray-400 text-base font-mono italic text-center">
                {">"} &quot;we do wanna grow big as a community in the college&quot;
              </p>
            </motion.div>
          </div>
        </div>

      </div>

      {/* Vercel Analytics */}
      <Analytics />
    </div>
  );
};

export default Page;
