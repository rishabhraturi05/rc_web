'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaBars, FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    const navLinks = [
        { name: 'Home', href: '/', sum: 1000 },
        { name: 'Members', href: '/members', sum: 1200 },
        { name: 'Competitions', href: '/competitions', sum: 1500 },
        { name: 'Events', href: '/events_page', sum: 1700 },
        { name: 'Freshers', href: '/freshers', sum: 1850, isFreshers: true },
        { name: 'Projects', href: '/projects', sum: 2000 },
        { name: 'Alumni', href: '/alumni', sum: 2200 },
        { name: 'Contact', href: '/contact', sum: 2200 },
    ];

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // Body scroll lock + Escape key handler when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
            const handleEscape = (e) => {
                if (e.key === 'Escape') setIsMobileMenuOpen(false);
            };
            window.addEventListener('keydown', handleEscape);
            return () => {
                document.body.style.overflow = '';
                window.removeEventListener('keydown', handleEscape);
            };
        } else {
            document.body.style.overflow = '';
        }
    }, [isMobileMenuOpen]);

    return (
        <motion.nav 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="fixed top-2 lg:top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl h-18 flex items-center justify-between px-4 sm:px-8 py-2 glass-panel rounded-full font-mono transition-all duration-500 hover:bg-white/10"
        >
            {/* Logo Section */}
            <div className="relative z-10 flex items-center space-x-2 sm:space-x-4">
                <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
                    {/* Logo Image */}
                    <Image
                        src="/Robotics Club, NITW.png"
                        alt="Robotics Club Logo"
                        width={40}
                        height={40}
                        className="object-contain sm:w-[60px] sm:h-[60px]"
                    />
                    <div className="text-white">
                        <div className="text-xs sm:text-sm font-bold uppercase tracking-wide">ROBOTICS CLUB</div>
                        <div className="text-xs uppercase tracking-wider">NITW</div>
                    </div>
                </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex relative z-10 items-center gap-3 xl:gap-5">
                {navLinks.map((link) => {
                    const isActive = pathname === link.href;

                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`cyber-link uppercase text-xs sm:text-sm xl:text-base ${
                                isActive ? 'text-white font-bold' : 'text-gray-300'
                            } ${link.isFreshers ? 'text-red-400 hover:text-red-400' : ''}`}
                        >
                            {link.isFreshers ? '🚀 ' : ''}
                            {link.name}
                        </Link>
                    );
                })}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden relative z-20">
                <button
                    onClick={toggleMobileMenu}
                    className="text-white p-2 hover:text-gray-300 transition-colors duration-300"
                    aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                    aria-expanded={isMobileMenuOpen}
                >
                    {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="lg:hidden absolute top-full left-0 right-0 mt-3 bg-black rounded-2xl z-50 flex flex-col overflow-hidden shadow-2xl border border-white/10"
                >
                    <div className="flex flex-col w-full py-4 space-y-1">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;

                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`px-6 py-3 text-base sm:text-lg uppercase tracking-wide transition-all duration-300 ${
                                        isActive ? 'bg-white/10 text-cyan-400 font-bold' : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                    } ${link.isFreshers ? 'text-red-400 font-bold' : ''}`}
                                >
                                    {link.isFreshers ? '🚀 ' : ''}
                                    {link.name}
                                </Link>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </motion.nav>
    );
};

export default Navbar;