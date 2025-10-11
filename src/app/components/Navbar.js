'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';


const Navbar = () => {
    const navLinks = [
        { name: 'Home', href: '/', active: false },
        { name: 'Members', href: '/members', active: false },
        { name: 'Competitions', href: '/competitions', active: false },
        { name: 'Events', href: '/events', active: false },
        { name: 'Projects', href: '/projects', active: false },
        { name: 'Alumni', href: '/alumni', active: false }
    ];

    return (
        <nav className="relative w-full h-18 flex items-center justify-between px-8 pt-3 overflow-hidden destruct-font">
            {/* Logo Section */}
            <div className="relative z-10 flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                    {/* Logo Image */}
                    <Image
                        src="/Robotics Club, NITW.png"
                        alt="Robotics Club Logo"
                        width={60}
                        height={60}
                        className="object-contain"
                    />

                    {/* Club Name */}
                    <div className="text-white">
                        <div className="text-sm font-bold uppercase tracking-wide">ROBOTICS CLUB</div>
                        <div className="text-xs uppercase tracking-wider">NITW</div>
                    </div>
                </div>
            </div>

            {/* Navigation Links */}
            <div className="relative z-10 flex items-center gap-5">
                {navLinks.map((link) => (
                    <Link
                        key={link.name}
                        href={link.href}
                        className={`relative px-4 py-2 rounded-b-xl text-white uppercase font-extralight tracking-wide transition-all duration-500 ease-in-out hover:text-gray-300 group overflow-hidden ${link.active
                            ? 'bg-gray-800'
                            : 'hover:bg-gray-800'
                            }`}
                    >
                        {/* Active link - static borders */}
                        {link.active && (
                            <div className="absolute inset-0 rounded-b-xl border-l-2 border-t-2 border-b-2 border-r-2 border-l-blue-500 border-t-blue-500 border-b-red-500 border-r-red-500"></div>
                        )}
                        
                        {/* Hover animation - only for non-active links */}
                        {!link.active && (
                            <div className="absolute inset-0 rounded-b-xl border-l-2 border-t-2 border-b-2 border-r-2 border-l-blue-500 border-t-blue-500 border-b-red-500 border-r-red-500 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-in-out"></div>
                        )}

                        {/* Text content */}
                        <span className="relative z-10">{link.name}</span>
                    </Link>
                ))}
            </div>
        </nav>
    );
};

export default Navbar;
