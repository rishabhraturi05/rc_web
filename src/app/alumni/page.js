"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaLinkedin,
  FaInstagram,
  FaEnvelope,
  FaGraduationCap,
  FaUsers,
  FaQuoteLeft,
  FaTimes
} from 'react-icons/fa';
import Link from 'next/link';

const defaultAlumni = [
  // Class of 2026
  {
    name: 'G. Sai Sasivardhan',
    role: 'Former General Secretary (2025–2026)',
    year: '2026',
    description: "Former General Secretary (2025–2026) who spearheaded club governance, high-impact technical initiatives, competition prep, and team mentorship for Robotics Club NITW.",
    imageUrl: '/alumini/sasi.jpeg',
    linkedin: 'https://in.linkedin.com/in/sai-sasivardhan-gampa-59559a254',
    instagram: 'https://www.instagram.com/sasivardhansai',
    email: ''
  },
  {
    name: 'Sudhakar',
    role: 'Former General Secretary (2025–2026)',
    year: '2026',
    description: "Former General Secretary (2025–2026) and senior mentor guiding autonomous robotics research, embedded microcontrollers, and flagship hardware projects.",
    imageUrl: '/alumini/sudhakar.jpeg',
    linkedin: 'https://www.linkedin.com/in/sudhakar-kumar-38a9a4282/',
    instagram: 'https://www.instagram.com/_sudhakar.08',
    email: 'krsudhakar1103@gmail.com'
  },
  {
    name: 'Anand A.L',
    role: 'Former General Secretary (2025–2026)',
    year: '2026',
    description: "Former General Secretary (2025–2026) and mechanical systems lead directing rover chassis dynamics, CAD kinematics, and precision hardware fabrication.",
    imageUrl: '/alumini/Anand_A_L.jpg',
    linkedin: 'https://www.linkedin.com/in/anand-al',
    instagram: 'https://www.instagram.com/anandd_alx',
    email: ''
  },

  // Class of 2025
  {
    name: 'Kevin Amal Darren',
    role: 'Former General Secretary (2024–2025)',
    year: '2025',
    description: "Robot Software Engineer at Clutterbot. Specialises in ROS, Motion planning, and Manipulation for Multi-DOF robotic systems.",
    imageUrl: '/alumini/Kevin.jpg',
    linkedin: 'https://www.linkedin.com/in/kevin-amal-darren-794707209',
    instagram: 'https://www.instagram.com/kiwikev23',
    email: 'kad232003@gmail.com'
  },
  {
    name: 'Potnuri Sri Anjali Pravallika',
    role: 'Electronics & Hardware Lead',
    year: '2025',
    description: "Electronics Engineer specializing in PCB design, antenna design, and VLSI research. Focused on practical hands-on robotic hardware.",
    imageUrl: '/alumini/ANJALI.jpg',
    linkedin: 'https://www.linkedin.com/in/potnuri-sri-anjali-pravallika-451979237',
    instagram: '',
    email: 'potnuripravallika2504@gmail.com'
  },
  {
    name: 'Sarvepalli Mahathi',
    role: 'Analog & RF Systems Lead',
    year: '2025',
    description: "ECE'25 graduate interested in analog electronics, RF/wireless communication systems, and sustainable hardware engineering.",
    imageUrl: '/alumini/S.Mahathi.jpg',
    linkedin: 'https://in.linkedin.com/in/mahathi-sarvepalli',
    instagram: '',
    email: 's.mahathi1319@gmail.com'
  },
  {
    name: 'Vattam Sai Sharanya',
    role: 'Embedded Systems Lead',
    year: '2025',
    description: "Electronics enthusiast passionate about embedded architectures, sensor integration, and diving deep into how robotic systems tick.",
    imageUrl: '/alumini/SAISHARANYA.jpeg',
    linkedin: 'https://www.linkedin.com/in/sai-sharanya-vattam-5b342130a',
    instagram: 'https://www.instagram.com/_saisharanya_vattam_',
    email: 'sharanyavattam1@gmail.com'
  },
  {
    name: 'Mydam Umamaheshwar',
    role: 'Data Analytics & ML Lead',
    year: '2025',
    description: "Passionate about data analytics and applying machine learning to robotics to solve engineering problems through data-driven insight.",
    imageUrl: '/alumini/UMAMAHESHWAR_MYDAM.jpg',
    linkedin: 'https://www.linkedin.com/in/mydam-umamaheshwar-605726227/',
    instagram: 'https://www.instagram.com/umamaheshwarchintu_20',
    email: 'mu21btb0a44@student.nitw.ac.in'
  },

  // Class of 2024
  {
    name: 'VSK Kumar (Kaushik Vempati)',
    role: 'Former General Secretary (2023–2024)',
    year: '2024',
    description: "Served as General Secretary of the Robotics Club from 2023–2024. Currently working as a Data Scientist at AT&T. Always do what you like!",
    imageUrl: '/alumini/KaushikVempati.jpg',
    linkedin: 'https://www.linkedin.com/in/kaushik-vempati/',
    instagram: 'https://www.instagram.com/vsk.kumar_',
    email: 'kaushik.vempati@gmail.com'
  },
  {
    name: 'Varun Gupta Tallam',
    role: 'Former Joint Secretary (2023–2024)',
    year: '2024',
    description: "Member of the club for 4 years (2020–2024). Currently pursuing a Master's degree in Chemical Engineering at TU Delft.",
    imageUrl: '/alumini/VarunTallam.jpg',
    linkedin: 'https://www.linkedin.com/in/varun-tallam/',
    instagram: 'https://instagram.com/varun_tallam',
    email: 'varungupta.tallam@gmail.com'
  },
  {
    name: 'SK Munawwar Ali',
    role: 'Former Joint Secretary (2023–2024)',
    year: '2024',
    description: "R&D Mechanical Engineer at ideaForge (India's leading drone manufacturer). Led mechanical design and fabrication for the 2024 batch.",
    imageUrl: '/alumini/SKMunawwarAli.jpg',
    linkedin: 'https://www.linkedin.com/in/sk-munawwar-ali',
    instagram: 'https://www.instagram.com/skmunawwarali',
    email: 'munawwarali2402@gmail.com'
  },
  {
    name: 'Aryan Panhale',
    role: 'Autonomous Systems & Analytics',
    year: '2024',
    description: "ROS enthusiast and problem solver who leveraged deep understanding of telemetry and data flow to drive data-informed decisions.",
    imageUrl: '/alumini/Aryan_Rajan.jpg',
    linkedin: 'https://www.linkedin.com/in/aryan-panhale-a49bb11b9',
    instagram: '',
    email: 'aryanrajan24@gmail.com'
  },

  // Class of 2023
  {
    name: 'Shaik Abdullah',
    role: 'Robotics Lead & Research Head',
    year: '2023',
    description: "Overhauled the club through 2020–2023 by establishing research pathways and training programmes. Authored multiple papers; now leads a startup robotics department.",
    imageUrl: '/alumini/ShaikAbdullah.jpg',
    linkedin: 'https://www.linkedin.com/in/shaik-abdullah-6ab62219b',
    instagram: 'https://www.instagram.com/milkshaik203',
    email: 'abdullah.sk203@gmail.com'
  },
  {
    name: 'Aaditya Prakash Kattekola',
    role: 'Co-Founder & Communications Researcher',
    year: '2023',
    description: "PhD student in the Mostofi Lab at UC Santa Barbara. Researching robotic communication frameworks and network-enhanced multi-robot coordination.",
    imageUrl: '/alumini/Aaditya.jpeg',
    linkedin: 'https://www.linkedin.com/in/kapi2910/',
    instagram: '',
    email: 'aadityapra2910@gmail.com'
  },

  // Class of 2022
  {
    name: 'Raj Kumar Darshanala',
    role: 'Founding Member & Software Engineer',
    year: '2022',
    description: "Founding generation member who served from the club's inception to 2022. Currently working as a Software Engineer.",
    imageUrl: '/alumini/KumarDarshanala.jpeg',
    linkedin: 'http://linkedin.com/in/rajkumar-darshanala',
    instagram: 'https://www.instagram.com/raj.kumar.darshanala',
    email: 'rkdarshanala@gmail.com'
  }
];

const tabs = [
  { id: 'all', label: 'All Batches', icon: <FaUsers /> },
  { id: '2026', label: 'Class of 2026', icon: <FaGraduationCap /> },
  { id: '2025', label: 'Class of 2025', icon: <FaGraduationCap /> },
  { id: '2024', label: 'Class of 2024', icon: <FaGraduationCap /> },
  { id: '2023', label: 'Class of 2023', icon: <FaGraduationCap /> },
  { id: '2022', label: 'Class of 2022', icon: <FaGraduationCap /> },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 }
};

const AlumniCard = ({ person, index = 0, onSelectBio }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group relative overflow-hidden glass-panel glass-panel-hover flex flex-col rounded-2xl border border-white/10 hover:border-cyan-400/50 bg-black/60 backdrop-blur-md hover:-translate-y-1 transition-all duration-300 shadow-xl"
    >
      {/* Photo Area */}
      <div className="relative h-72 w-full overflow-hidden bg-cyan-950/20">
        <img
          src={person.imageUrl || person.img || "/favicon.ico"}
          alt={person.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/favicon.ico";
          }}
        />

        {/* Graduating Batch Pill */}
        <div className="absolute top-3.5 right-3.5 z-10">
          <span className="px-3 py-1 rounded-full font-mono text-[11px] font-bold uppercase tracking-wider bg-black/80 border border-cyan-400/50 text-cyan-300 shadow-md backdrop-blur-md">
            Class of {person.year}
          </span>
        </div>

        {/* Gradient Overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
      </div>

      {/* Info Block */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3
            className="text-lg font-bold font-mono tracking-tight text-white group-hover:text-cyan-300 transition-colors leading-snug"
          >
            {person.name}
          </h3>
          <p className="text-xs font-mono text-cyan-400/90 mt-1 mb-3">
            {person.role || `Robotics Club Alumnus`}
          </p>

          {/* Bio Snippet */}
          {person.description && (
            <p className="text-xs font-mono text-gray-300 leading-relaxed line-clamp-3 italic">
              &quot;{person.description}&quot;
            </p>
          )}

          {person.description && person.description.length > 120 && (
            <button
              onClick={() => onSelectBio(person)}
              className="text-[11px] font-mono text-cyan-400 hover:text-white mt-1 cursor-pointer underline underline-offset-2 flex items-center gap-1"
            >
              Read full note →
            </button>
          )}
        </div>

        {/* Social Connectors */}
        <div className="flex items-center gap-3 mt-5 pt-3.5 border-t border-white/10">
          {person.email && person.email !== '/' && (
            <button
              onClick={() => copyToClipboard(person.email)}
              className="text-gray-400 hover:text-cyan-400 transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-cyan-950/30"
              title="Copy email address"
            >
              <FaEnvelope size={15} />
            </button>
          )}

          {person.linkedin && person.linkedin !== '#' && person.linkedin !== '/' && (
            <Link
              href={person.linkedin.startsWith("http") ? person.linkedin : `https://${person.linkedin}`}
              target="_blank"
              rel="noreferrer"
              className="text-gray-400 hover:text-blue-400 transition-colors p-1.5 rounded-lg hover:bg-cyan-950/30"
              title="LinkedIn profile"
            >
              <FaLinkedin size={15} />
            </Link>
          )}

          {person.instagram && person.instagram !== '#' && person.instagram !== '/' && (
            <Link
              href={person.instagram.startsWith("http") ? person.instagram : `https://www.instagram.com/${person.instagram.replace('@', '')}`}
              target="_blank"
              rel="noreferrer"
              className="text-gray-400 hover:text-pink-400 transition-colors p-1.5 rounded-lg hover:bg-cyan-950/30"
              title="Instagram profile"
            >
              <FaInstagram size={15} />
            </Link>
          )}
        </div>
      </div>

      {/* Copy Notification Toast */}
      {copied && (
        <div className="absolute top-3.5 left-3.5 bg-black/95 backdrop-blur border border-cyan-400 text-cyan-300 px-3 py-1 rounded-full text-xs font-mono font-medium shadow-xl">
          Email copied!
        </div>
      )}
    </motion.div>
  );
};

const Section = ({ title, people = [], onSelectBio }) => (
  <div className="mb-16">
    <div className="flex items-center gap-4 mb-8">
      <span className="w-12 h-[2px] bg-cyan-400"></span>
      <h2
        className="text-2xl md:text-3xl font-bold text-white uppercase tracking-widest"
        style={{ fontFamily: 'var(--font-orbitron)' }}
      >
        {title}
      </h2>
      <span className="text-xs font-mono text-cyan-400/80 px-2.5 py-0.5 rounded-full border border-cyan-500/30 bg-cyan-950/30">
        {people.length} {people.length === 1 ? 'Alumnus' : 'Alumni'}
      </span>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {people.map((person, idx) => (
        <AlumniCard
          key={`${person.name}-${idx}`}
          person={person}
          index={idx % 8}
          onSelectBio={onSelectBio}
        />
      ))}
    </div>
  </div>
);

export default function AlumniPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [alumniList, setAlumniList] = useState(defaultAlumni);
  const [selectedBioPerson, setSelectedBioPerson] = useState(null);
  const [loading, setLoading] = useState(true);

  function getAlumniKey(name) {
    if (!name) return "";
    const rawClean = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (rawClean.includes("vsk") || rawClean.includes("kaushik") || rawClean.includes("vempati")) {
      return "vskkumar";
    }
    if (rawClean.includes("sasivardhan") || (rawClean.includes("sasi") && rawClean.includes("gampa"))) {
      return "sasivardhan";
    }
    if (rawClean.includes("sudhakar")) {
      return "sudhakar";
    }
    if (rawClean.includes("anand")) {
      return "anandal";
    }
    if (rawClean.includes("kevin")) {
      return "kevinamal";
    }
    if (rawClean.includes("anjali") || rawClean.includes("pravallika")) {
      return "anjalipravallika";
    }
    if (rawClean.includes("mahathi")) {
      return "mahathi";
    }
    if (rawClean.includes("sharanya")) {
      return "saisharanya";
    }
    if (rawClean.includes("umamaheshwar") || rawClean.includes("mydam")) {
      return "umamaheshwar";
    }
    if (rawClean.includes("tallam") || rawClean.includes("varungupta")) {
      return "varuntallam";
    }
    if (rawClean.includes("munawwar")) {
      return "munawwarali";
    }
    if (rawClean.includes("panhale") || rawClean.includes("aryanrajan")) {
      return "aryanpanhale";
    }
    if (rawClean.includes("abdullah")) {
      return "shaikabdullah";
    }
    if (rawClean.includes("aaditya") || rawClean.includes("kattekola")) {
      return "aadityaprakash";
    }
    if (rawClean.includes("darshanala") || rawClean.includes("rajkumar")) {
      return "rajkumardarshanala";
    }
    return rawClean;
  }

  // Fetch live alumni from MongoDB with strict deduplication
  useEffect(() => {
    fetch('/api/members', { cache: 'no-store' })
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data?.alumni) && res.data.alumni.length > 0) {
          const apiAlumni = res.data.alumni.map((m) => {
            let yr = null;
            if (m.year) {
              const match = String(m.year).match(/\d{4}/);
              if (match) yr = match[0];
            }
            return {
              name: m.name,
              role: m.role || 'Alumnus',
              year: yr,
              description: (m.bio && m.bio.trim()) ? m.bio.trim() : (m.description || ''),
              imageUrl: m.img || m.imageUrl || '/favicon.ico',
              linkedin: m.linkedin || '',
              instagram: m.instagram || '',
              email: m.email || '',
            };
          });

          // Index live Mongo records by normalized key
          const apiMap = new Map();
          apiAlumni.forEach((a) => {
            const key = getAlumniKey(a.name);
            if (key) apiMap.set(key, a);
          });

          // Merge live updates over defaults
          const updatedDefaults = defaultAlumni.map((def) => {
            const key = getAlumniKey(def.name);
            if (apiMap.has(key)) {
              const live = apiMap.get(key);
              apiMap.delete(key);
              return {
                ...def,
                ...live,
                name: live.name || def.name,
                year: live.year || def.year || '2026',
                role: (live.role && live.role !== "Member" && live.role !== "Alumnus") ? live.role : def.role,
                description: (live.description && !live.description.includes("Former member of the Robotics Club")) ? live.description : def.description,
                imageUrl: live.imageUrl || def.imageUrl,
              };
            }
            return def;
          });

          // Add any new alumni registered directly in MongoDB
          const extra = Array.from(apiMap.values()).map((a) => ({
            ...a,
            year: a.year || '2024',
            description: a.description || 'Former member of the Robotics Club.',
          }));

          // Strict global deduplication: ensures NO duplicate cards exist
          const seenKeys = new Set();
          const deduped = [];
          for (const item of [...updatedDefaults, ...extra]) {
            const key = getAlumniKey(item.name);
            if (!seenKeys.has(key)) {
              seenKeys.add(key);
              deduped.push(item);
            }
          }
          setAlumniList(deduped);
        }
      })
      .catch((err) => {
        console.error("Alumni live sync notice:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Group alumni by graduating year
  const groupedByYear = useMemo(() => {
    const map = {
      '2026': [],
      '2025': [],
      '2024': [],
      '2023': [],
      '2022': [],
    };

    alumniList.forEach((person) => {
      let y = '2026';
      if (person.year) {
        const match = String(person.year).match(/\d{4}/);
        if (match) y = match[0];
      }
      if (!map[y]) map[y] = [];
      map[y].push(person);
    });

    return map;
  }, [alumniList]);

  return (
    <main className="relative min-h-screen bg-transparent text-white overflow-x-hidden pb-24">
      {/* Hero Header */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pt-32 pb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-cyan-400 mb-3 px-3.5 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/20">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span>ALUMNI NETWORK</span>
          </div>
          <h1
            className="mb-4 text-5xl md:text-7xl font-black text-white title-glow tracking-tighter uppercase"
            style={{ fontFamily: 'var(--font-orbitron)' }}
          >
            OUR ALUMNI
          </h1>
          <p className="text-gray-300 font-mono text-sm sm:text-base max-w-2xl mx-auto">
            Meet the engineers, researchers, and mentors who shaped the foundations and engineering legacy of Robotics Club NIT Warangal.
          </p>
        </motion.div>
      </div>

      {/* Year Filter Tabs */}
      <div className="relative z-20 mx-auto max-w-5xl px-4 mb-14">
        <div className="flex flex-wrap justify-center gap-2.5 md:gap-3.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-mono text-xs md:text-sm uppercase tracking-wider transition-all duration-200 cursor-pointer active:scale-95 ${
                activeTab === tab.id
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

      {/* Alumni Grid Render */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 min-h-[50vh]">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="relative h-96 rounded-2xl border border-white/10 bg-black/60 overflow-hidden animate-pulse flex flex-col justify-between p-5"
              >
                <div className="w-full h-56 bg-white/5 rounded-xl mb-4" />
                <div className="space-y-2">
                  <div className="w-3/4 h-4 bg-white/10 rounded" />
                  <div className="w-1/2 h-3 bg-cyan-400/20 rounded" />
                  <div className="w-full h-2 bg-white/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
          {activeTab === 'all' ? (
            <motion.div
              key="all"
              initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
              transition={{ duration: 0.3 }}
            >
              {groupedByYear['2026']?.length > 0 && (
                <Section
                  title="Class of 2026"
                  people={groupedByYear['2026']}
                  onSelectBio={setSelectedBioPerson}
                />
              )}
              {groupedByYear['2025']?.length > 0 && (
                <Section
                  title="Class of 2025"
                  people={groupedByYear['2025']}
                  onSelectBio={setSelectedBioPerson}
                />
              )}
              {groupedByYear['2024']?.length > 0 && (
                <Section
                  title="Class of 2024"
                  people={groupedByYear['2024']}
                  onSelectBio={setSelectedBioPerson}
                />
              )}
              {groupedByYear['2023']?.length > 0 && (
                <Section
                  title="Class of 2023"
                  people={groupedByYear['2023']}
                  onSelectBio={setSelectedBioPerson}
                />
              )}
              {groupedByYear['2022']?.length > 0 && (
                <Section
                  title="Class of 2022"
                  people={groupedByYear['2022']}
                  onSelectBio={setSelectedBioPerson}
                />
              )}
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
              transition={{ duration: 0.3 }}
            >
              <Section
                title={`Class of ${activeTab}`}
                people={groupedByYear[activeTab] || []}
                onSelectBio={setSelectedBioPerson}
              />
            </motion.div>
          )}
        </AnimatePresence>
        )}
      </div>

      {/* Full Bio Modal */}
      {selectedBioPerson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-panel p-6 sm:p-8 rounded-2xl max-w-lg w-full border border-cyan-400/50 bg-black/90 shadow-[0_0_40px_rgba(34,211,238,0.25)] relative"
          >
            <button
              onClick={() => setSelectedBioPerson(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-lg cursor-pointer"
            >
              <FaTimes size={18} />
            </button>

            <div className="flex items-center gap-4 mb-4">
              <img
                src={selectedBioPerson.imageUrl || selectedBioPerson.img || "/favicon.ico"}
                alt={selectedBioPerson.name}
                className="w-14 h-14 rounded-full object-cover border border-cyan-400"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/favicon.ico";
                }}
              />
              <div>
                <h3 className="font-mono text-lg font-bold text-white">{selectedBioPerson.name}</h3>
                <p className="font-mono text-xs text-cyan-400">Class of {selectedBioPerson.year} • {selectedBioPerson.role}</p>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <FaQuoteLeft className="text-cyan-400/40 text-xl mb-2" />
              <p className="font-mono text-sm text-gray-200 leading-relaxed italic">
                {selectedBioPerson.description}
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}
