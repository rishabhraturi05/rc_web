'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!<>-_\\\\/[]{}—=+*^?#________';

const ScrambleText = ({ text, delay = 0 }) => {
  const [displayText, setDisplayText] = useState('');
  
  useEffect(() => {
    let timeout;
    let scrambleInterval;
    
    // Initial state before delay
    setDisplayText(text.replace(/[a-zA-Z0-9]/g, '_'));
    
    timeout = setTimeout(() => {
      let frame = 0;
      const totalFrames = 25; // Snappier overall duration
      
      scrambleInterval = setInterval(() => {
        frame++;
        
        const scrambled = text.split('').map((char, index) => {
          if (char === ' ') return ' ';
          
          // First 8 frames: PURE CHAOS (everything scrambles)
          // Frame 8 to 25: Rapidly lock characters from left to right
          const lockFrame = 8 + (17 / text.length) * index;
          
          if (frame >= lockFrame) {
            return char;
          }
          
          return CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
        }).join('');
        
        setDisplayText(scrambled);
        
        if (frame >= totalFrames) {
          clearInterval(scrambleInterval);
          setDisplayText(text);
        }
      }, 30); // 30ms updates for buttery smoothness
    }, delay);

    return () => {
      clearTimeout(timeout);
      clearInterval(scrambleInterval);
    };
  }, [text, delay]);

  return <span>{displayText}</span>;
};
import { usePathname } from 'next/navigation';

const PageLoader = () => {
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  // Hide loader once the current page finishes loading
  useEffect(() => {
    // Only show loader on homepage
    if (pathname !== '/') {
      setIsLoading(false);
      return;
    }

    const finishLoading = () => {
      setTimeout(() => {
        setIsLoading(false);
      }, 2000); 
    };

    if (document.readyState === 'complete') {
      finishLoading();
    } else {
      window.addEventListener('load', finishLoading);
    }

    return () => window.removeEventListener('load', finishLoading);
  }, []);

  // Show loader again whenever the user refreshes/navigates away
  useEffect(() => {
    if (pathname !== '/') return;
    
    const handleBeforeUnload = () => {
      setIsLoading(true);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [pathname]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div 
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#020202] overflow-hidden"
        >
          {/* Subtle grid background matching the site's tech theme */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-transparent to-[#020202]"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Soft cyan center glow matching the navbar/comets */}
            <div className="w-96 h-96 bg-cyan-500/10 rounded-full blur-[80px]"></div>
          </div>

          <div className="flex flex-col items-center gap-2 relative z-10">
            <motion.div 
              className="text-cyan-400 font-mono text-xs sm:text-sm tracking-[0.3em] uppercase opacity-70 flex gap-2 mb-2"
            >
              <span>[</span>
              <ScrambleText text="SYSTEM_INIT" delay={0} />
              <span>]</span>
            </motion.div>
            
            <h1 
              className="text-white text-5xl sm:text-7xl font-black uppercase tracking-[0.2em] title-glow pl-[0.2em]"
              style={{ fontFamily: 'var(--font-orbitron)' }}
            >
              <ScrambleText text="RC NITW" delay={200} />
            </h1>
            
            <motion.div 
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.2, ease: "circOut" }}
              className="h-[2px] bg-cyan-400 mt-6 shadow-[0_0_15px_#00e5ff] relative"
              style={{ width: '280px' }}
            >
              {/* Scanning laser head matching the high-tech robotics vibe */}
              <motion.div 
                initial={{ x: 0, opacity: 1 }}
                animate={{ x: 280, opacity: 0 }}
                transition={{ duration: 1.2, ease: "circOut" }}
                className="absolute top-1/2 -translate-y-1/2 right-0 w-4 h-4 bg-white rounded-full blur-[2px] shadow-[0_0_20px_#fff]"
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PageLoader;
