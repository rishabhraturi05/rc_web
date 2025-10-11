import React from 'react';
import Image from 'next/image';

const Navbar = () => {
    const navLinks = [
        { name: 'Home', href: '/', active: true },
        { name: 'Members', href: '/members' },
        { name: 'Competitions', href: '/competitions' },
        { name: 'Events', href: '/events' },
        { name: 'Projects', href: '/projects' },
        { name: 'Alumni', href: '/alumni' }
    ];

    return (
        <nav className="relative bg-black w-full h-18 flex items-center justify-between px-8 pt-3 overflow-hidden destruct-font">
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
                    <a
                        key={link.name}
                        href={link.href}
                        className={`relative px-4 py-2 rounded-b-xl text-white uppercase font-extralight tracking-wide transition-all duration-500 ease-in-out hover:text-gray-300 group overflow-hidden ${link.active
                            ? 'bg-gray-800 border-l-1 border-t-1 border-b-1 border-r-1 border-l-blue-500 border-t-blue-500 border-b-red-500 border-r-red-500'
                            : 'hover:bg-gray-800'
                            }`}
                    >
                        {/* Border sliding animation */}
                        <div className={`absolute inset-0 rounded-b-xl border-l-2 border-t-2 border-b-2 border-r-2 border-l-blue-500 border-t-blue-500 border-b-red-500 border-r-red-500 transform transition-transform duration-500 ease-in-out ${link.active
                                ? 'translate-x-0'
                                : 'translate-x-full group-hover:translate-x-0'
                            }`}></div>

                        {/* Text content */}
                        <span className="relative z-10">{link.name}</span>
                    </a>
                ))}
            </div>
        </nav>
    );
};

export default Navbar;
