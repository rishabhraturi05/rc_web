'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navLinks = [
        { name: 'Home', href: '/', active: false, sum: 1000 },
        { name: 'Members', href: '/members', active: false, sum: 1200 },
        { name: 'Competitions', href: '/competitions', active: false, sum: 1500 },
        { name: 'Events', href: '/events_page', active: false, sum: 1700 },
        { name: 'Projects', href: '/projects', active: false, sum: 2000 },
        { name: 'Alumni', href: '/alumni', active: false, sum: 2200 },
        { name: 'Contact', href: '/contact', active: false, sum: 2200 }
    ];

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <nav className="relative w-full h-18 flex items-center justify-between px-4 sm:px-8 pt-3 overflow-hidden destruct-font">
            {/* Logo Section */}
            <div className="relative z-10 flex items-center space-x-2 sm:space-x-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                    {/* Logo Image */}
                    <Image data-aos="fade-down"
                        data-aos-easing="linear"
                        data-aos-duration="1000"
                        src="/Robotics Club, NITW.png"
                        alt="Robotics Club Logo"
                        width={40}
                        height={40}
                        className="object-contain sm:w-[60px] sm:h-[60px]"
                    />
                    <div className="text-white" data-aos="fade-down"
                        data-aos-easing="linear"
                        data-aos-duration="1500">
                        <div className="text-xs sm:text-sm font-bold uppercase tracking-wide">ROBOTICS CLUB</div>
                        <div className="text-xs uppercase tracking-wider">NITW</div>
                    </div>
                </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex relative z-10 items-center gap-3 xl:gap-5">
                {navLinks.map((link) => (
                    <Link
                        data-aos="fade-down"
                        data-aos-easing="linear"
                        data-aos-duration={link.sum}
                        key={link.name}
                        href={link.href}
                        className={`relative px-3 xl:px-4 py-2 rounded-b-xl rounded-t-md text-white uppercase font-extralight tracking-wide transition-all duration-500 ease-in-out hover:text-gray-300 group overflow-hidden text-sm xl:text-base ${link.active
                            ? 'bg-gray-800'
                            : 'hover:bg-gray-800'
                            }`}
                    >
                        {/* Active link - static borders */}
                        {link.active && (
                            <div className="absolute inset-0 rounded-b-xl rounded-t-md border-l-2 border-t-2 border-b-2 border-r-2 border-l-blue-500 border-t-blue-500 border-b-red-500 border-r-red-500"></div>
                        )}

                        {/* Hover animation - only for non-active links */}
                        {!link.active && (
                            <div className="absolute inset-0 rounded-b-xl rounded-t-md border-l-2 border-t-2 border-b-2 border-r-2 border-l-blue-500 border-t-blue-500 border-b-red-500 border-r-red-500 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-in-out"></div>
                        )}

                        {/* Text content */}
                        <span className="relative z-10" data-aos="fade-down"
                            data-aos-easing="linear"
                            data-aos-duration={link.sum}>{link.name}</span>
                    </Link>
                ))}
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
                <div className="lg:hidden fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
                    {/* Close Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="absolute top-4 right-4 text-white p-2 hover:text-gray-300 transition-colors duration-300 z-60"
                        aria-label="Close mobile menu"
                    >
                        <FaTimes size={28} />
                    </button>

                    <div className="text-center">
                        <div className="space-y-8">
                            {navLinks.map((link, index) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block text-2xl sm:text-3xl text-white uppercase font-extralight tracking-wide transition-all duration-300 hover:text-blue-400 hover:scale-110"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;