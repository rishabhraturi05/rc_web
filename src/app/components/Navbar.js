'use client';
import React, { useState } from 'react';
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

    return (
        <motion.nav 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl h-18 flex items-center justify-between px-4 sm:px-8 py-2 glass-panel rounded-full font-mono transition-all duration-500 hover:bg-white/10"
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
                    aria-label="Toggle mobile menu"
                >
                    {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
                    {/* Close Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="absolute top-4 right-4 text-white p-2 hover:text-gray-300 transition-colors duration-300 z-60"
                        aria-label="Close mobile menu"
                    >
                        <FaTimes size={28} />
                    </button>

                    <div className="text-center">
                        <div className="space-y-6">
                            {navLinks.map((link, index) => {
                                const isActive = pathname === link.href;

                                return (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`block text-2xl sm:text-3xl uppercase tracking-wide transition-all duration-300 hover:scale-110 ${
                                            isActive ? 'text-cyan-400 font-bold' : 'text-white hover:text-blue-400'
                                        } ${link.isFreshers ? 'text-red-400 font-bold tracking-widest' : ''}`}
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        {link.isFreshers ? '🚀 ' : ''}
                                        {link.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </motion.nav>
    );
};

export default Navbar;