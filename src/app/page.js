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
      <div className='hidden md:block h-0 w-[20rem] sm:w-[30rem] md:w-[40rem] absolute top-[20%] right-0 translate-x-1/2 shadow-[0_0_900px_50px_#e99b63] -rotate-[30deg]'></div>

      {/* 3D Spline Scene - Hidden on mobile for better performance */}
      <div className="hidden sm:block">
        {/* <Spline data-aos="fade-zoom-in"
          data-aos-easing="ease-in-back"
          data-aos-delay="300"
          data-aos-offset="0"
          data-aos-duration="2000"
          className='important absolute top-[150px] sm:top-[200px] -translate-y-1/2 w-full sm:w-[80%] md:w-[70%] lg:w-[50%] right-[-300px] sm:right-[-400px] md:right-[-500px] md:-mr-32 lg:-mr-48'
          scene="https://prod.spline.design/12P53t-4DXT3O2sb/scene.splinecode" /> */}
        <Spline
          data-aos="fade-zoom-in"
          data-aos-easing="ease-in-back"
          data-aos-delay="300"
          data-aos-offset="0"
          data-aos-duration="2000"
          className='important absolute top-[150px] sm:top-[200px] -translate-y-1/2 w-full sm:w-[80%] md:w-[70%] lg:w-[50%] left-[400px] right-[-300px] sm:right-[-400px] md:right-[-500px] md:-mr-32 lg:-mr-48'
          scene="https://prod.spline.design/al2kfe4tU-6AQZYs/scene.splinecode" />

      </div>

      {/* Hero Section */}
      <div data-aos="fade-right"
        data-aos-offset="300"
        data-aos-easing="ease-in-sine"
        className="relative z-10 p-4 sm:p-8 md:p-12 lg:p-24 max-w-3xl">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl text-white mb-4 batman-font leading-tight">
          NIT WARANGAL ROBOTICS CLUB
        </h1>
        <p className='text-lg sm:text-xl text-gray-300 destruct-font mb-2'>Our Mission</p>
        <p className="text-sm sm:text-base text-gray-300 destruct-font leading-relaxed">
          Founded in 2019–20, the Robotics Club aims to introduce and promote the field of robotics at NIT Warangal. We strive to guide enthusiasts, build a community of like-minded innovators, and provide hands-on learning through workshops, training sessions, and participation in robotics competitions across India.
        </p>
      </div>

      {/* Vision Section */}
      <div className="z-50 flex flex-col lg:flex-row items-center justify-between p-4 sm:p-8 md:p-12 lg:p-24 gap-6 sm:gap-8">
        {/* Left side - Robotics Club Logo */}
        <div className="flex-1 flex justify-center lg:justify-start" data-aos="fade-right" data-aos-duration="1000">
          <div className="relative group">
            <div className="relative ml-30 w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64 overflow-hidden rounded-full">
              <img
                src="/Robotics Club, NITW.png"
                alt="Robotics Club Logo"
                className="absolute w-full h-full object-contain inline-block transform hover:animate-spin group-hover:drop-shadow-2xl transition-all duration-300"
                data-aos="zoom-in"
                data-aos-delay="200"
                data-aos-duration="1200"
              />
            </div>
          </div>
        </div>

        {/* Right side - Our Vision */}
        <div className="flex-1 text-center lg:text-left" data-aos="fade-left" data-aos-duration="1000">
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 destruct-font mb-3 sm:mb-4">Our Vision</p>
          <p className="text-sm sm:text-base lg:text-xl text-gray-300 destruct-font leading-relaxed">
            To establish a vibrant and innovative robotics culture at NIT Warangal — one that inspires creativity, collaboration, and technical excellence. We aim to nurture future innovators who push the boundaries of technology, driving advancements in robotics that impact society and shape a smarter, more automated world.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Page;