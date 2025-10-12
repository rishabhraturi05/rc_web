'use client'

import React, { useRef, useState, useEffect } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import RoboconTimeline from '../components/Robocon'
import EyantraTimeline from '../components/Eyantra'


const CompeteTab = () => {
  const ref = useRef(null);
  const [currtab, setCurrtab] = useState('');

  useEffect(() => {
    AOS.init({
      duration: 1500,
      once: true,
    })
  }, [])

  const scrollToOut = () => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };
  const renderContent = () => {
    if (!currtab) return null;

    if (currtab === 'Robocon') {
      return <RoboconTimeline />;
    } else if (currtab === 'EYantra') {
      return <EyantraTimeline />;
    }

    return (
      <div className="text-center text-white py-10">
        <p>Content for {currtab} would be displayed here.</p>
      </div>
    );
  };

  return (
    <>
      <div className=" text-white text-center py-16" data-aos="fade-up"
        data-aos-duration="3000">
        <h1 className=" batman-font text-5xl font-bold mb-4">Competitions</h1>
        <p className="destruct-font text-xl text-gray-300 max-w-2xl mx-auto">
          Explore our journey through various robotics competitions and achievements
        </p>
      </div>

      <div className=" text-white " data-aos="fade-up"
        data-aos-duration="3000">
        <div className="p-5 flex flex-wrap justify-center">
          <div
            onClick={() => { scrollToOut(); setCurrtab('Robocon') }}
            className="group cursor-pointer m-4 w-full max-w-[300px] h-[300px] flex justify-center items-center relative transition duration-300 hover:scale-105"
          >
            <div
              className="rounded-2xl bg-cover bg-center absolute inset-0 opacity-50"
              style={{ backgroundImage: "url('./robocon.jpg')" }}
            ></div>
            <p className="z-10 text-2xl font-bold transition-all duration-300 group-hover:text-3xl batman-font">Robocon</p>
          </div>

          <div
            onClick={() => { scrollToOut(); setCurrtab('EYantra') }}
            className="group cursor-pointer m-4 w-full max-w-[300px] h-[300px] flex justify-center items-center relative transition duration-300 hover:scale-105 batman-font"
          >
            <div
              className="rounded-2xl bg-cover bg-center absolute inset-0 opacity-50"
              style={{ backgroundImage: "url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbibab7EdP2fmKweDXfC_SjeVo6uJNLM_A1w&usqp=CAU')" }}
            ></div>
            <p className="z-10 text-2xl font-bold transition-all duration-300 group-hover:text-3xl">EYantra</p>
          </div>

          {/* <div
            onClick={() => { scrollToOut(); setCurrtab('Other') }}
            className="group cursor-pointer m-4 w-full max-w-[300px] h-[300px] flex justify-center items-center relative transition duration-300 hover:scale-105"
          >
            <div
              className="rounded-2xl bg-cover bg-center absolute inset-0 opacity-50"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1554224154-260325c05c0a?q=80&w=2070&auto=format&fit=crop')" }}
            ></div>
            <p className="z-10 text-2xl font-bold transition-all duration-300 group-hover:text-3xl">Others</p>
          </div> */}

        </div>
      </div>

      <div ref={ref} className=" text-white text-center pt-[90px] pb-4 batman-font">
        <h2 className="text-4xl font-bold">{currtab} {currtab === '' ? 'Select a Competition' : 'Timeline'}</h2>
      </div>

      <div className="">
        {renderContent()}
      </div>
    </>
  )
}

export default CompeteTab;

// import CompeteTab from "@/components/CompeteTab";
// export default function CompetePage() {
//     return (
//         <main>
//             <CompeteTab />
//         </main>
//     )
// }