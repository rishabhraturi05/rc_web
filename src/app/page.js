"use client"
import React from 'react';
import Spline from '@splinetool/react-spline';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect } from 'react';
// import ConnectingDotsBackground from './components/bg';

const Page = () => {
  useEffect(() => {
    AOS.init({
      duration: 1500,
      once: true,
    })
  })
  return (
    <div className="relative min-h-screen">
      {/* Background Effects */}
      <div className='hidden md:block h-0 w-[20rem] md:w-[40rem] absolute top-[20%] right-0 translate-x-1/2 shadow-[0_0_900px_50px_#e99b63] -rotate-[30deg]'></div>

      {/* Spline 3D Model */}
      <Spline 
        data-aos="fade-zoom-in"
        data-aos-easing="ease-in-back"
        data-aos-delay="300"
        data-aos-offset="0"
        data-aos-duration="3000"
        className='important absolute top-[100px] md:top-[200px] -translate-y-1/2 w-full md:w-[70%] lg:w-[50%] right-[-200px] md:right-[-500px] md:-mr-32 lg:-mr-48' 
        scene="https://prod.spline.design/12P53t-4DXT3O2sb/scene.splinecode" 
      />

      {/* Hero Section */}
      <div className="relative z-10 px-4 md:px-8 lg:px-12 xl:px-24 py-8 md:py-12 lg:py-24">
        <div data-aos="fade-right"
          data-aos-offset="300"
          data-aos-easing="ease-in-sine" 
          className="max-w-3xl mx-auto lg:mx-0"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white mb-4 batman-font leading-tight">
            NIT WARANGAL ROBOTICS CLUB
          </h1>
          <p className='text-lg md:text-xl text-gray-300 destruct-font mb-4'>Our Mission</p>
          <p className="text-sm md:text-base text-gray-300 destruct-font leading-relaxed">
            Founded in 2019–20, the Robotics Club aims to introduce and promote the field of robotics at NIT Warangal. We strive to guide enthusiasts, build a community of like-minded innovators, and provide hands-on learning through workshops, training sessions, and participation in robotics competitions across India.
          </p>
        </div>
      </div>

      {/* Vision Section */}
      <div className="relative z-50 px-4 md:px-8 lg:px-12 xl:px-24 py-8 md:py-12 lg:py-24">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          {/* Left side - Robotics Club Logo */}
          <div className="flex-1 flex justify-center lg:justify-start" data-aos="fade-right" data-aos-duration="1000">
            <div className="relative group">
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64 overflow-hidden rounded-full">
                <img
                  src="/Robotics Club, NITW.png"
                  alt="Robotics Club Logo"
                  className="w-full h-full object-contain transform hover:animate-spin group-hover:drop-shadow-2xl transition-all duration-500"
                  data-aos="zoom-in"
                  data-aos-delay="200"
                  data-aos-duration="1200"
                />
              </div>
            </div>
          </div>

          {/* Right side - Our Vision */}
          <div className="flex-1 text-center lg:text-left" data-aos="fade-left" data-aos-duration="1000">
            <p className="text-xl md:text-2xl text-gray-300 destruct-font mb-4">Our Vision</p>
            <p className="text-base md:text-lg lg:text-xl text-gray-300 destruct-font leading-relaxed">
              To establish a vibrant and innovative robotics culture at NIT Warangal — one that inspires creativity, collaboration, and technical excellence. We aim to nurture future innovators who push the boundaries of technology, driving advancements in robotics that impact society and shape a smarter, more automated world.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;