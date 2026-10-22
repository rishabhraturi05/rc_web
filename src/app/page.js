"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import ThreeScene from "./components/ThreeScene";

gsap.registerPlugin(ScrollTrigger);

export default function Page() {
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const heroTitleRef = useRef(null);
  const heroDescRef = useRef(null);
  const heroCtasRef = useRef(null);
  const statsRef = useRef(null);
  const originRef = useRef(null);
  const missionRef = useRef(null);
  const domainsRef = useRef(null);
  const visionRef = useRef(null);

  const [scrollPercent, setScrollPercent] = useState(0);

  // Initialize Lenis smooth scroll and seamlessly sync with GSAP ScrollTrigger
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
    });

    lenis.on("scroll", (e) => {
      ScrollTrigger.update();
      if (document.documentElement.scrollHeight > window.innerHeight) {
        const p = Math.round(
          (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        );
        setScrollPercent(Math.min(100, Math.max(0, p)));
      }
    });

    const updateLenis = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateLenis);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  // GSAP Animations with Emil Kowalski & Impeccable principles
  useGSAP(
    () => {
      // 1. Hero Entrance Timeline (Fast start, snappy ease-out)
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        ".hero-title-line",
        { opacity: 0, y: 40, skewY: 3, filter: "blur(8px)" },
        { opacity: 1, y: 0, skewY: 0, filter: "blur(0px)", duration: 1, stagger: 0.15, delay: 0.1 }
      )
        .fromTo(
          heroDescRef.current,
          { opacity: 0, x: -30 },
          { opacity: 1, x: 0, duration: 0.8 },
          "-=0.6"
        )
        .fromTo(
          heroCtasRef.current?.children ? Array.from(heroCtasRef.current.children) : [],
          { opacity: 0, y: 20, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1 },
          "-=0.4"
        );

      // 2. Hero Scroll Scrubbing: Title dims and rises gracefully as you scroll
      gsap.to(heroRef.current, {
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
        },
        y: -120,
        opacity: 0.1,
        scale: 0.96,
        ease: "none",
      });

      // 3. Stats Telemetry Bar Reveal
      if (statsRef.current) {
        gsap.fromTo(
          statsRef.current.querySelectorAll(".stat-card"),
          { opacity: 0, y: 30, scale: 0.95 },
          {
            scrollTrigger: {
              trigger: statsRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            stagger: 0.12,
            ease: "power2.out",
          }
        );
      }

      // 4. Section 2: Origin (Left Entrance with GSAP)
      if (originRef.current) {
        gsap.fromTo(
          originRef.current,
          { opacity: 0, x: -50, filter: "blur(8px)" },
          {
            scrollTrigger: {
              trigger: originRef.current,
              start: "top 75%",
              end: "bottom 30%",
              toggleActions: "play none none reverse",
            },
            opacity: 1,
            x: 0,
            filter: "blur(0px)",
            duration: 0.9,
            ease: "power3.out",
          }
        );
      }

      // 5. Section 3: Mission (Right Entrance with GSAP)
      if (missionRef.current) {
        gsap.fromTo(
          missionRef.current,
          { opacity: 0, x: 50, filter: "blur(8px)" },
          {
            scrollTrigger: {
              trigger: missionRef.current,
              start: "top 75%",
              end: "bottom 30%",
              toggleActions: "play none none reverse",
            },
            opacity: 1,
            x: 0,
            filter: "blur(0px)",
            duration: 0.9,
            ease: "power3.out",
          }
        );
      }

      // 6. Section 4: Engineering Domains Stagger
      if (domainsRef.current) {
        gsap.fromTo(
          domainsRef.current.querySelectorAll(".domain-card"),
          { opacity: 0, y: 40, scale: 0.96 },
          {
            scrollTrigger: {
              trigger: domainsRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
          }
        );
      }

      // 7. Section 5: Vision Finale Card Reveal
      if (visionRef.current) {
        gsap.fromTo(
          visionRef.current,
          { opacity: 0, y: 60, scale: 0.96, filter: "blur(8px)" },
          {
            scrollTrigger: {
              trigger: visionRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: 1,
            ease: "power3.out",
          }
        );
      }
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="relative w-full bg-[#020202] text-[#f5f1ea] overflow-x-hidden">
      {/* 3D Background Space & CyberCore Scene */}
      <ThreeScene />

      {/* Content Stream */}
      <div className="relative z-10 w-full flex flex-col pointer-events-none">
        {/* ======================================================== */}
        {/* SECTION 1: HERO VIEWPORT                                  */}
        {/* ======================================================== */}
        <section
          ref={heroRef}
          className="min-h-screen w-full flex flex-col justify-center px-6 sm:px-12 md:px-16 lg:px-24 pt-28 pb-16 pointer-events-none"
        >
          <div className="max-w-4xl pointer-events-auto">

            {/* Main Cyber Typography with Split Lines */}
            <h1
              ref={heroTitleRef}
              className="text-6xl sm:text-7xl md:text-8xl lg:text-[6.8rem] font-black tracking-tighter text-white leading-[0.9] drop-shadow-[0_0_35px_rgba(255,255,255,0.35)] select-none"
              style={{ fontFamily: "var(--font-orbitron)" }}
            >
              <div className="hero-title-line overflow-hidden">NITW</div>
              <div className="hero-title-line overflow-hidden text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-400">
                ROBOTICS
              </div>
              <div className="hero-title-line overflow-hidden">CLUB</div>
            </h1>

            {/* Mission Statement Callout */}
            <div
              ref={heroDescRef}
              className="mt-8 max-w-2xl font-mono text-base sm:text-lg md:text-xl text-cyan-300 border-l-2 border-cyan-400 pl-5 py-2 bg-black/40 backdrop-blur-md rounded-r-lg shadow-xl"
            >
              Building the future of automation, one circuit at a time.
            </div>

            {/* Tactical CTA Actions */}
            <div ref={heroCtasRef} className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/projects"
                className="group relative inline-flex items-center gap-3 px-6 py-3 rounded-lg font-mono text-sm uppercase tracking-wider font-bold text-black bg-cyan-400 hover:bg-cyan-300 transition-all duration-200 active:scale-95 shadow-[0_0_25px_rgba(34,211,238,0.5)]"
              >
                <span>EXPLORE PROJECTS</span>
                <span className="transform group-hover:translate-x-1 transition-transform duration-200">
                  →
                </span>
              </Link>

              <Link
                href="/recruitment"
                className="group relative inline-flex items-center gap-3 px-6 py-3 rounded-lg font-mono text-sm uppercase tracking-wider font-semibold text-white bg-black/60 hover:bg-white/10 border border-white/20 hover:border-cyan-400 transition-all duration-200 active:scale-95 backdrop-blur-md"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span>JOIN RC NITW</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* STATS TELEMETRY RIBBON                                   */}
        {/* ======================================================== */}
        <section ref={statsRef} className="w-full px-6 sm:px-12 max-w-7xl mx-auto py-12 pointer-events-none">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "FOUNDED", value: "2019-20", detail: "NIT Warangal Campus" },
              { label: "PODIUMS", value: "5+ AWARDS", detail: "DD-Robocon & e-Yantra" },
              { label: "ACTIVE BOTS", value: "30+ SYSTEMS", detail: "AMR, Drone & Swerve" },
              { label: "COMMUNITY", value: "150+ MINDS", detail: "Students & Alumni" },
            ].map((stat, i) => (
              <div
                key={i}
                className="stat-card glass-panel p-5 border border-white/10 hover:border-cyan-500/50 transition-all duration-300 relative group overflow-hidden pointer-events-auto"
              >
                <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none opacity-20 group-hover:opacity-100 transition-opacity">
                  <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-cyan-400"></div>
                </div>
                <p className="font-mono text-xs uppercase tracking-widest text-cyan-400 mb-1">
                  {stat.label}
                </p>
                <p
                  className="text-2xl sm:text-3xl font-black text-white tracking-tight"
                  style={{ fontFamily: "var(--font-orbitron)" }}
                >
                  {stat.value}
                </p>
                <p className="font-mono text-xs text-gray-400 mt-1">{stat.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 2: ORIGIN                                        */}
        {/* ======================================================== */}
        <section className="min-h-screen w-full flex flex-col justify-center px-6 sm:px-12 max-w-7xl mx-auto py-20 pointer-events-none">
          <div ref={originRef} className="w-full md:w-3/5 lg:w-1/2 flex flex-col gap-5 self-start pointer-events-auto">
            <div className="glass-panel p-8 md:p-10 border-l-4 border-l-cyan-400 bg-black/70 backdrop-blur-md shadow-2xl relative">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-6 h-[2px] bg-cyan-400"></span>
                <h2
                  className="text-2xl text-cyan-400 font-bold tracking-widest uppercase"
                  style={{ fontFamily: "var(--font-orbitron)" }}
                >
                  ORIGIN
                </h2>
              </div>
              <p className="text-base sm:text-lg text-gray-200 font-mono leading-relaxed">
                Founded in 2019–20, the Robotics Club aims to introduce and promote the field of
                robotics at NIT Warangal. We strive to guide enthusiasts, bridge theoretical engineering
                with cutting-edge hardware, and build a community of relentless innovators.
              </p>
            </div>

            {/* Real engineering persona quote */}
            <div className="px-6 py-3.5 glass-panel border-l-2 border-l-cyan-400/50 self-start bg-black/50 backdrop-blur-sm shadow-xl">
              <p className="text-gray-300 text-sm font-mono italic">
                &quot;not the oldest club on campus, just the one with the most solder burns.&quot;
              </p>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 3: MISSION                                       */}
        {/* ======================================================== */}
        <section className="min-h-screen w-full flex flex-col justify-center px-6 sm:px-12 max-w-7xl mx-auto py-20 pointer-events-none">
          <div ref={missionRef} className="w-full md:w-3/5 lg:w-1/2 flex flex-col gap-5 self-end items-end pointer-events-auto">
            <div className="glass-panel p-8 md:p-10 border-r-4 border-r-cyan-400 bg-black/70 backdrop-blur-md shadow-2xl relative w-full">
              <div className="flex items-center justify-end gap-3 mb-5">
                <h2
                  className="text-2xl text-cyan-400 font-bold tracking-widest uppercase"
                  style={{ fontFamily: "var(--font-orbitron)" }}
                >
                  MISSION
                </h2>
                <span className="w-6 h-[2px] bg-cyan-400"></span>
              </div>
              <p className="text-base sm:text-lg text-gray-200 font-mono leading-relaxed text-right">
                We provide hands-on learning through rigorous fabrication bootcamps, hardware hackathons,
                and active participation in premier robotics competitions across India to push the
                boundaries of autonomous systems.
              </p>
            </div>

            {/* Quirky Quote */}
            <div className="px-6 py-3.5 glass-panel border-r-2 border-r-cyan-400/50 self-end bg-black/50 backdrop-blur-sm shadow-xl max-w-md">
              <p className="text-gray-300 text-sm font-mono italic text-right">
                &quot;theory is cool, but we prefer watching things actually move.&quot;
              </p>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 4: ENGINEERING DIVISIONS (Substance & Craft)      */}
        {/* ======================================================== */}
        <section ref={domainsRef} className="w-full px-6 sm:px-12 max-w-7xl mx-auto py-24 pointer-events-none">
          <div className="mb-12 pointer-events-auto">
            <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-cyan-400 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              <span>CORE DISCIPLINES</span>
            </div>
            <h2
              className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight"
              style={{ fontFamily: "var(--font-orbitron)" }}
            >
              CORE DISCIPLINES
            </h2>
            <p className="font-mono text-sm text-gray-400 mt-2 max-w-xl">
              From low-level microcode to multi-axis kinematics and deep neural vision, our members
              engineer across every layer of the robotic stack.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                id: "01",
                title: "AUTONOMOUS NAVIGATION",
                stack: "ROS 2 // LiDAR SLAM // Nav2",
                desc: "Real-time point-cloud mapping, obstacle avoidance, and global path planning for ground rovers.",
                accent: "border-cyan-500/40",
              },
              {
                id: "02",
                title: "EMBEDDED HARDWARE",
                stack: "STM32 // CAN Bus // Custom PCB",
                desc: "High-power motor ESCs, real-time telemetry busses, and battery management systems designed in-house.",
                accent: "border-cyan-500/40",
              },
              {
                id: "03",
                title: "COMPUTER VISION",
                stack: "OpenCV // Camera Feeds // Tracking",
                desc: "Real-time object detection, visual tracking, and camera-based obstacle identification for autonomous robots.",
                accent: "border-cyan-500/40",
              },
              {
                id: "04",
                title: "DYNAMIC MECHANISMS",
                stack: "SolidWorks // CNC // FEA Stress",
                desc: "Swerve-drive pods, multi-stage pneumatics, and high-torque planetary gearbox fabrication.",
                accent: "border-cyan-500/40",
              },
            ].map((domain) => (
              <div
                key={domain.id}
                className={`domain-card glass-panel p-6 border ${domain.accent} hover:border-cyan-400 transition-all duration-300 bg-black/60 hover:bg-black/80 hover:-translate-y-1 relative group rounded-xl pointer-events-auto`}
              >
                {/* Tech Bracket Indicator */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs text-cyan-400 font-bold">{domain.id}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/40 group-hover:bg-cyan-400 transition-colors"></span>
                </div>
                <h3
                  className="text-lg font-bold text-white mb-2 leading-snug group-hover:text-cyan-300 transition-colors"
                  style={{ fontFamily: "var(--font-orbitron)" }}
                >
                  {domain.title}
                </h3>
                <p className="font-mono text-[11px] text-cyan-400/80 mb-3 tracking-wide">{domain.stack}</p>
                <p className="font-mono text-xs text-gray-300 leading-relaxed">{domain.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 5: OUR VISION (Grand Showcase)                   */}
        {/* ======================================================== */}
        <section className="min-h-screen w-full flex flex-col justify-center px-6 sm:px-12 max-w-7xl mx-auto py-24 mb-16 pointer-events-none">
          <div
            ref={visionRef}
            className="w-full flex flex-col lg:flex-row items-center justify-between p-8 sm:p-12 md:p-16 gap-10 glass-panel border border-cyan-500/30 bg-black/80 backdrop-blur-xl rounded-2xl shadow-[0_0_50px_rgba(34,211,238,0.15)] relative overflow-hidden pointer-events-auto"
          >
            {/* Ambient Background Gradient Accent */}
            <div className="absolute -top-32 -left-32 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Left side - Official Robotics Club Crest */}
            <div className="flex-shrink-0 flex justify-center">
              <div className="relative group">
                <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-full glass-panel flex items-center justify-center bg-black/60 border border-cyan-400/40 p-4 shadow-[0_0_30px_rgba(34,211,238,0.25)] group-hover:border-cyan-300 transition-all duration-500">
                  <img
                    src="/Robotics Club, NITW.png"
                    alt="Robotics Club Logo"
                    className="w-[85%] h-[85%] object-contain filter drop-shadow-[0_0_20px_rgba(34,211,238,0.6)] group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Right side - Our Vision Manifesto */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-cyan-400 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span>MANIFESTO</span>
              </div>
              <h2
                className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight mb-4"
                style={{ fontFamily: "var(--font-orbitron)" }}
              >
                OUR VISION
              </h2>
              <p className="text-base sm:text-lg text-gray-200 font-mono leading-relaxed">
                To establish a vibrant, relentless robotics ecosystem at NIT Warangal — one that inspires
                creative engineering, fearless exploration, and technical mastery. We nurture future
                innovators who push beyond simulations to build autonomous hardware that transforms society.
              </p>

              <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/recruitment"
                  className="px-6 py-2.5 rounded-lg font-mono text-xs font-bold uppercase tracking-wider text-black bg-cyan-400 hover:bg-cyan-300 active:scale-95 transition-all shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                >
                  BECOME A MEMBER
                </Link>
                <Link
                  href="/contact"
                  className="px-6 py-2.5 rounded-lg font-mono text-xs font-semibold uppercase tracking-wider text-white hover:text-cyan-300 border border-white/20 hover:border-cyan-400 active:scale-95 transition-all"
                >
                  GET IN TOUCH
                </Link>
              </div>
            </div>
          </div>

          {/* Quirky Quote Footer */}
          <div className="mt-8 px-8 py-3.5 glass-panel border-b-2 border-b-cyan-400/50 self-center bg-black/40 backdrop-blur-sm shadow-xl">
            <p className="text-gray-400 text-sm sm:text-base font-mono italic text-center">
              &quot;room for anyone curious enough to make a machine come alive.&quot;
            </p>
          </div>
        </section>
      </div>

      {/* Vercel Analytics */}
      <Analytics />
    </div>
  );
}
