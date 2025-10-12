'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';


const Navbar = () => {
    const navLinks = [
        { name: 'Home', href: '/', active: false, sum: 1000 },
        { name: 'Members', href: '/members', active: false, sum: 1200 },
        { name: 'Competitions', href: '/competitions', active: false, sum: 1500 },
        { name: 'Events', href: '/events_page', active: false, sum: 1700 },
        { name: 'Projects', href: '/projects', active: false, sum: 2000 },
        { name: 'Alumni', href: '/alumni', active: false, sum: 2200 }
    ];

    return (
        <nav className="relative w-full h-18 flex items-center justify-between px-8 pt-3 overflow-hidden destruct-font ">
            {/* Logo Section */}
            <div className="relative z-10 flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                    {/* Logo Image */}
                    <Image data-aos="fade-down"
                        data-aos-easing="linear"
                        data-aos-duration="1000"
                        src="/Robotics Club, NITW.png"
                        alt="Robotics Club Logo"
                        width={60}
                        height={60}
                        className="object-contain"
                    />

                    {/* Club Name */}
                    <div className="text-white" data-aos="fade-down"
                        data-aos-easing="linear"
                        data-aos-duration="1500">
                        <div className="text-sm font-bold uppercase tracking-wide">ROBOTICS CLUB</div>
                        <div className="text-xs uppercase tracking-wider">NITW</div>
                    </div>
                </div>
            </div>

            {/* Navigation Links */}
            <div className="relative z-10 flex items-center gap-5">
                {navLinks.map((link) => (
                    <Link
                        data-aos="fade-down"
                        data-aos-easing="linear"
                        data-aos-duration={link.sum}
                        key={link.name}
                        href={link.href}
                        className={`relative px-4 py-2 rounded-b-xl rounded-t-md text-white uppercase font-extralight tracking-wide transition-all duration-500 ease-in-out hover:text-gray-300 group overflow-hidden ${link.active
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
                        <span className="relative z-10 " data-aos="fade-down"
                            data-aos-easing="linear"
                            data-aos-duration={link.sum}>{link.name}</span>
                    </Link>
                ))}
            </div>
        </nav>
    );
};

export default Navbar;