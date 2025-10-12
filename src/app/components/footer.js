import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className=" text-white pt-12 pb-4 destruct-font">
      <div className="max-w-6xl mx-auto px-4">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row justify-between text-center md:text-left">

          {/* Left Section: Club Info */}
          <div className="mb-8 md:mb-0">
            <h3 className="text-2xl font-bold mb-2">Robotics Club NITW</h3>
            <p className="text-gray-400">National Institute of Technology Warangal</p>
            <p className="text-gray-400"><Link href="mailto:roboticsclub@nitw.ac.in">Email: roboticsclub@nitw.ac.in</Link></p>
            <p className="text-gray-400">Phone: 7661991859</p>
          </div>
          {/* Right Section: Social Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
            <div className="flex justify-center md:justify-start space-x-6">
              <Link
                href="https://www.instagram.com/rc.nitw?igsh=dGg0azNiZDV0cjRj"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors duration-300"
                aria-label="Instagram"
              >
                <FaInstagram size={24} />
              </Link>
              <Link
                href="http://www.linkedin.com/in/sai-sasivardhan-gampa-59559a254"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors duration-300"
                aria-label="LinkedIn"
              >
                <FaLinkedin size={24} />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section: Copyright */}
        <div className="text-center text-gray-500 border-t border-gray-800 mt-8 pt-4">
          <p>&copy; {new Date().getFullYear()} Robotics Club. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;