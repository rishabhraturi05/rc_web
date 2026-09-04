"use client"
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaLinkedin, FaInstagram, FaEnvelope } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';

const alumniData = [
  {
    name: 'Raj Kumar Darshanala',
    description: 'Currently a software engineer. I was part of club from its start to 2022. Will be happy to collaborate for robotics advancements.',
    imageUrl: '/alumini/KumarDarshanala.jpeg',
    linkedin: 'http://linkedin.com/in/rajkumar-darshanala',
    instagram: 'https://www.instagram.com/raj.kumar.darshanala',
    email: 'rkdarshanala@gmail.com'
  },
  {
    name: 'Shaik Abdullah',
    description: "Overhauled the robotics club through 2020-2023 by establishing streamlined structure and training programmes. Defined robotics career pathway. Initiated research teams. Authored multiple robotics research papers and now lead a startup's robotics department. Interested in MAVs.",
    imageUrl: '/alumini/ShaikAbdullah.jpg',
    linkedin: 'https://www.linkedin.com/in/shaik-abdullah-6ab62219b?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app',
    instagram: 'https://www.instagram.com/milkshaik203?igsh=MXZ3bzYzNWNqcHZncw==',
    email: 'abdullah.sk203@gmail.com'
  },
  {
    name: 'Aaditya Prakash Kattekola',
    description: 'I am a Ph.D student in the Mostofi Lab at University of California, Santa Barbara. I am interested in creating robust communication frameworks for robots as well as utilizing robots in enhancing communication networks. I obtained my Bachelor of Technology from the National Institute of Technology, Warangal (NITW) in the Department of Electronics & Communication Engineering.',
    imageUrl: '/alumini/Aaditya.jpeg',
    linkedin: 'https://www.linkedin.com/in/kapi2910/',
    instagram: '@aham.kapi',
    email: 'aadityapra2910@gmail.com'
  },
  {
    name: 'VSK Kumar',
    description: 'Hi team! This is VSK, I served as the General Secretary of the Robotics Club from 2023-2024. I am currently working as a Data Scientist at AT&T. My rule in life is to always do what you like!',
    imageUrl: '/alumini/KaushikVempati.jpg',
    linkedin: 'https://www.linkedin.com/in/kaushik-vempati/',
    instagram: '@vsk.kumar_',
    email: 'kaushik.vempati@gmail.com'
  },
  {
    name: 'Varun Gupta Tallam',
    description: 'I am currently doing a masters in Chemical Engineering at TU Delft. I am a former Joint secretary at RC 2023-24. I was a member of the club for 4 years starting in 2020. I have seen the club grow from very humble beginnings and wish success to all the ones who come after me.',
    imageUrl: '/alumini/VarunTallam.jpg',
    linkedin: 'https://www.linkedin.com/in/varun-tallam/',
    instagram: 'https://instagram.com/varun_tallam',
    email: 'varungupta.tallam@gmail.com'
  },
  {
    name: 'SK Munawwar Ali',
    description: 'I’m fortunate to follow my passion as an R&D Mechanical Engineer at ideaForge, India’s leading drone manufacturer. I started my journey in 2022 with the robotics club and went on to serve as Joint Secretary for the 2024 batch. It makes me truly happy to see the club reach new heights each year.',
    imageUrl: '/alumini/SKMunawwarAli.jpg',
    linkedin: 'https://www.linkedin.com/in/sk-munawwar-ali',
    instagram: 'https://www.instagram.com/skmunawwarali',
    email: 'munawwarali2402@gmail.com'
  },
  {
    name: 'Aryan Panhale',
    description: "Started my journey as a ROS enthusiast driven by a passion for problem-solving, I leveraged my skills and deep understanding of data flow to pivot into an analyst role, where I help drive data-informed decisions.",
    imageUrl: '/alumini/Aryan_Rajan.jpg',
    linkedin: 'https://www.linkedin.com/in/aryan-panhale-a49bb11b9',
    instagram: '/',
    email: 'aryanrajan24@gmail.com'
  },
  {
    name: 'Kevin Amal Darren',
    description: "Hey guys, I was the General Secretary in the year 2024-2025. Currently working as a Robot Software Engineer at Clutterbot. I specialise in ROS, Motion planning and Manipulation for Multi-DOF systems.",
    imageUrl: '/alumini/Kevin.jpg',
    linkedin: 'https://www.linkedin.com/in/kevin-amal-darren-794707209',
    instagram: 'https://www.instagram.com/kiwikev23',
    email: 'kad232003@gmail.com'
  },
  {
    name: 'Potnuri Sri Anjali Pravallika',
    description: "I’m Anjali Pravallika, an Electronics Engineer who enjoys working on practical, hands-on projects. I’ve explored areas like PCB design, antenna design, and I’m interested in pursuing VLSI research. I like learning new things, solving problems, and building designs that help to make life easier.",
    imageUrl: '/alumini/ANJALI.jpg',
    linkedin: 'https://www.linkedin.com/in/potnuri-sri-anjali-pravallika-451979237',
    instagram: '/',
    email: 'potnuripravallika2504@gmail.com'
  },
  {
    name: 'Sarvepalli Mahathi',
    description: "I am a graduate of ECE'25 batch. Interested in analog electronics, RF and wireless comm. systems. Also a waste management enthusiast!",
    imageUrl: '/alumini/S.Mahathi.jpg',
    linkedin: 'https://in.linkedin.com/in/mahathi-sarvepalli',
    instagram: '/',
    email: 's.mahathi1319@gmail.com'
  },
  {
    name: 'Vattam Sai Sharanya',
    description: "I’m an electronics enthusiast who loves diving deep into how things work—even if my patience doesn’t always keep up with my curiosity. I enjoy experimenting, trying new tools, and breaking down tech until it actually makes sense. I’m always chasing that “aha!” moment in whatever I work on.",
    imageUrl: '/alumini/SAISHARANYA.jpeg',
    linkedin: 'https://www.linkedin.com/in/sai-sharanya-vattam-5b342130a',
    instagram: 'https://www.instagram.com/_saisharanya_vattam_',
    email: 'sharanyavattam1@gmail.com'
  },
  {
    name: 'Mydam Umamaheshwar',
    description: 'A passionate enthusiast in business analysis, data analytics. Passionate about ML in robotics solving problems through data-driven solutions and strategic thinking. ',
    imageUrl: '/alumini/UMAMAHESHWAR_MYDAM.jpg',
    linkedin: 'https://www.linkedin.com/in/mydam-umamaheshwar-605726227/',
    instagram: 'https://www.instagram.com/umamaheshwarchintu_20',
    email: 'mu21btb0a44@student.nitw.ac.in'
  },
];

const Alumni = () => {
  const [copiedField, setCopiedField] = useState(null);

  const handleCopy = async (text, fieldId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden pb-24">

      <div className="relative z-10 pt-32 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="mb-4 text-5xl md:text-7xl font-black text-white title-glow tracking-tighter uppercase" style={{ fontFamily: 'var(--font-orbitron)' }}>
            Our Alumni
          </h1>
          <p className="text-cyan-400 font-mono text-lg max-w-2xl mx-auto bg-black/40 backdrop-blur-sm p-4 rounded-lg shadow-xl border border-white/10">
            Meet the brilliant minds who shaped our journey.
          </p>
        </motion.div>
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex flex-col gap-6 sm:gap-10 max-w-5xl mx-auto">
          {alumniData.map((alumnus, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 p-6 sm:p-8 glass-panel glass-panel-hover transition-all duration-500">

                {/* Profile Image & Socials */}
                <div className="flex flex-col items-center gap-4 shrink-0">
                  <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-lg overflow-hidden border-2 border-cyan-500/50 group-hover:border-cyan-400 transition-colors duration-500 shadow-[0_0_15px_rgba(34,211,238,0.2)] group-hover:shadow-[0_0_25px_rgba(34,211,238,0.6)]">
                    <Image
                      src={alumnus.imageUrl}
                      alt={alumnus.name}
                      width={160}
                      height={160}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-cyan-900/20 mix-blend-overlay group-hover:bg-transparent transition-colors duration-500"></div>
                  </div>

                  {/* Glowing Social Connectors */}
                  <div className="flex gap-3 mt-2">
                    {alumnus.linkedin && alumnus.linkedin !== '/' && (
                      <Link
                        href={alumnus.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 flex items-center justify-center bg-cyan-950/50 border border-cyan-500/30 text-cyan-500 hover:text-cyan-300 hover:border-cyan-400 hover:bg-cyan-900/80 rounded-md transition-all duration-300 shadow-[0_0_10px_rgba(34,211,238,0.1)] hover:shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                        title="LinkedIn"
                      >
                        <FaLinkedin className="w-5 h-5" />
                      </Link>
                    )}
                    {alumnus.instagram && alumnus.instagram !== '/' && (
                      <div
                        className="w-10 h-10 flex items-center justify-center bg-pink-950/50 border border-pink-500/30 text-pink-500 hover:text-pink-300 hover:border-pink-400 hover:bg-pink-900/80 rounded-md transition-all duration-300 shadow-[0_0_10px_rgba(236,72,153,0.1)] hover:shadow-[0_0_15px_rgba(236,72,153,0.5)] cursor-pointer"
                        title="Copy Instagram Handle"
                        onClick={() => handleCopy(alumnus.instagram, `ig-${index}`)}
                      >
                        <FaInstagram className="w-5 h-5" />
                      </div>
                    )}
                    {alumnus.email && alumnus.email !== '/' && (
                      <div
                        className="w-10 h-10 flex items-center justify-center bg-green-950/50 border border-green-500/30 text-green-500 hover:text-green-300 hover:border-green-400 hover:bg-green-900/80 rounded-md transition-all duration-300 shadow-[0_0_10px_rgba(34,197,94,0.1)] hover:shadow-[0_0_15px_rgba(34,197,94,0.5)] cursor-pointer"
                        title="Copy Email Address"
                        onClick={() => handleCopy(alumnus.email, `email-${index}`)}
                      >
                        <FaEnvelope className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="text-center sm:text-left flex-1 flex flex-col justify-center">
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-widest uppercase group-hover:text-cyan-300 transition-colors" style={{ fontFamily: 'var(--font-orbitron)' }}>
                    {alumnus.name}
                  </h3>
                  <p className="text-gray-300 font-mono text-sm sm:text-base leading-relaxed pl-0 sm:pl-4 sm:border-l-2 sm:border-cyan-500/30 group-hover:border-cyan-400 transition-colors duration-500">
                    {alumnus.description}
                  </p>
                </div>
              </div>

              {/* Terminal style copy notification */}
              {(copiedField === `ig-${index}` || copiedField === `email-${index}`) && (
                <div className="absolute top-4 right-4 bg-cyan-900/80 backdrop-blur border border-cyan-400 text-cyan-100 px-3 py-1 rounded-md text-xs font-mono font-medium animate-pulse z-10">
                  {'>'} COPIED
                </div>
              )}
            </motion.div>
          ))}
      </div>
    </div>
    </main >
  );
};

export default Alumni;
