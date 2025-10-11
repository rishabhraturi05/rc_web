import React from 'react';
import Spline from '@splinetool/react-spline';

const Page = () => {
  return (
    <div className="relative min-h-screen bg-black">

      <img
        className='absolute top-0 right-0 opacity-60 -z-10 w-full max-w-4xl'
        src="/gradient.png"
        alt="gradient"
      />

      <div className='hidden md:block h-0 w-[40rem] absolute top-[20%] right-0 translate-x-1/2 shadow-[0_0_900px_50px_#e99b63] -rotate-[30deg]'></div>

      {/* <Spline 
        className='absolute top-[200] -translate-y-1/2 w-full md:w-[70%] lg:w-[50%] right-[-200] md:-mr-32 lg:-mr-48'
        scene="https://prod.spline.design/al2kfe4tU-6AQZYs/scene.splinecode" 
      /> */}
      <Spline className='absolute top-[200] -translate-y-1/2 w-full md:w-[70%] lg:w-[50%] right-[-500] md:-mr-32 lg:-mr-48' scene="https://prod.spline.design/12P53t-4DXT3O2sb/scene.splinecode" />


      <div className="relative z-10 p-8 md:p-12 lg:p-24 max-w-3xl">
        <h1 className="text-4xl md:text-6xl text-white mb-4 batman-font">
          NIT WARANGAL ROBOTICS CLUB
        </h1>
        <p className='text-lg  text-gray-300 destruct-font'>Our Mission</p>
        <p className="text-sm text-gray-300 destruct-font">
          The Robotics Club was founded in the academic year 2019–20 with the sole purpose of Introducing the field of Robotics to NITW, encourage and guide Robotics enthusiasts to pursue it as a career option and create it into a haven for all budding Roboticist looking for a community of like minded enthusiasts. We attempt to do this by conducting workshops and training sessions and applying the learned skills by competing in Robotics contests held across India each year.
        </p>
      </div>

    </div>
  );
};

export default Page;