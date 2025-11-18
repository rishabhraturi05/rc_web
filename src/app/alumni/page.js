"use client"
import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { FaLinkedin, FaInstagram, FaEnvelope } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';

const alumniData = [
  {
    name: 'Raj Kumar Darshanala',
    description: 'Currently a software engineer. I was part of club from its start to 2022. Will be happy to collaborate for robotics advancements.',
    imageUrl: '/alumini/KumarDarshanala.jpeg',
    linkedin: 'http://linkedin.com/in/rajkumar-darshanala',
    instagram: 'https://www.instagram.com/raj.kumar.darshanala',
    email: 'rkdarshanala@gmail.com'
  },
  {
    name: 'Shaik Abdullah',
    description: "Overhauled the robotics club through 2020-2023 by establishing streamlined structure and training programmes. Defined robotics career pathway. Initiated research teams. Authored multiple robotics research papers and now lead a startup's robotics department. Interested in MAVs.",
    imageUrl: '/alumini/ShaikAbdullah.jpg',
    linkedin: 'https://www.linkedin.com/in/shaik-abdullah-6ab62219b?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app',
    instagram: 'https://www.instagram.com/milkshaik203?igsh=MXZ3bzYzNWNqcHZncw==',
    email: 'abdullah.sk203@gmail.com'
  },
  {
    name: 'Aaditya Prakash Kattekola',
    description: 'I am a Ph.D student in the Mostofi Lab at University of California, Santa Barbara. I am interested in creating robust communication frameworks for robots as well as utilizing robots in enhancing communication networks. I obtained my Bachelor of Technology from the National Institute of Technology, Warangal (NITW) in the Department of Electronics & Communication Engineering.',
    imageUrl: '/alumini/Aaditya.jpeg',
    linkedin: 'https://www.linkedin.com/in/kapi2910/',
    instagram: '@aham.kapi',
    email: 'aadityapra2910@gmail.com'
  },
  {
    name: 'VSK Kumar',
    description: 'Hi team! This is VSK, I served as the General Secretary of the Robotics Club from 2023-2024. I am currently working as a Data Scientist at AT&T. My rule in life is to always do what you like!',
    imageUrl: '/alumini/KaushikVempati.jpg',
    linkedin: 'https://www.linkedin.com/in/kaushik-vempati/',
    instagram: '@vsk.kumar_',
    email: 'kaushik.vempati@gmail.com'
  },
  {
    name: 'Varun Gupta Tallam',
    description: 'I am currently doing a masters in Chemical Engineering at TU Delft. I am a former Joint secretary at RC 2023-24. I was a member of the club for 4 years starting in 2020. I have seen the club grow from very humble beginnings and wish success to all the ones who come after me.',
    imageUrl: '/alumini/VarunTallam.jpg',
    linkedin: 'https://www.linkedin.com/in/varun-tallam/',
    instagram: 'https://instagram.com/varun_tallam',
    email: 'varungupta.tallam@gmail.com'
  },
  {
    name: 'SK Munawwar Ali',
    description: 'I’m fortunate to follow my passion as an R&D Mechanical Engineer at ideaForge, India’s leading drone manufacturer. I started my journey in 2022 with the robotics club and went on to serve as Joint Secretary for the 2024 batch. It makes me truly happy to see the club reach new heights each year.',
    imageUrl: '/alumini/SKMunawwarAli.jpg',
    linkedin: 'https://www.linkedin.com/in/sk-munawwar-ali',
    instagram: 'https://www.instagram.com/skmunawwarali',
    email: 'munawwarali2402@gmail.com'
  },
  {
    name: 'Aryan Panhale',
    description: "Started my journey as a ROS enthusiast driven by a passion for problem-solving, I leveraged my skills and deep understanding of data flow to pivot into an analyst role, where I help drive data-informed decisions.",
    imageUrl: '/alumini/Aryan_Rajan.jpg',
    linkedin: 'https://www.linkedin.com/in/aryan-panhale-a49bb11b9',
    instagram: '/',
    email: 'aryanrajan24@gmail.com'
  },
  {
    name: 'Kevin Amal Darren',
    description: "Hey guys, I was the General Secretary in the year 2024-2025. Currently working as a Robot Software Engineer at Clutterbot. I specialise in ROS, Motion planning and Manipulation for Multi-DOF systems.",
    imageUrl: '/alumini/Kevin.jpg',
    linkedin: 'https://www.linkedin.com/in/kevin-amal-darren-794707209',
    instagram: 'https://www.instagram.com/kiwikev23',
    email: 'kad232003@gmail.com'
  },
  {
    name: 'Potnuri Sri Anjali Pravallika',
    description: "I’m Anjali Pravallika, an Electronics Engineer who enjoys working on practical, hands-on projects. I’ve explored areas like PCB design, antenna design, and I’m interested in pursuing VLSI research. I like learning new things, solving problems, and building designs that help to make life easier.",
    imageUrl: '/alumini/ANJALI.jpg',
    linkedin: 'https://www.linkedin.com/in/potnuri-sri-anjali-pravallika-451979237',
    instagram: '/',
    email: 'potnuripravallika2504@gmail.com'
  },
  {
    name: 'Sarvepalli Mahathi',
    description: "I am a graduate of ECE'25 batch. Interested in analog electronics, RF and wireless comm. systems. Also a waste management enthusiast!",
    imageUrl: '/alumini/S.Mahathi.jpg',
    linkedin: 'https://in.linkedin.com/in/mahathi-sarvepalli',
    instagram: '/',
    email: 's.mahathi1319@gmail.com'
  },
  {
    name: 'Vattam Sai Sharanya',
    description: "I’m an electronics enthusiast who loves diving deep into how things work—even if my patience doesn’t always keep up with my curiosity. I enjoy experimenting, trying new tools, and breaking down tech until it actually makes sense. I’m always chasing that “aha!” moment in whatever I work on.",
    imageUrl: '/alumini/SAISHARANYA.jpeg',
    linkedin: 'https://www.linkedin.com/in/sai-sharanya-vattam-5b342130a',
    instagram: 'https://www.instagram.com/_saisharanya_vattam_',
    email: 'sharanyavattam1@gmail.com'
  },
  {
    name: 'Mydam Umamaheshwar',
    description: 'A passionate enthusiast in business analysis, data analytics. Passionate about ML in robotics solving problems through data-driven solutions and strategic thinking. ',
    imageUrl: '/alumini/UMAMAHESHWAR_MYDAM.jpg',
    linkedin: 'https://www.linkedin.com/in/mydam-umamaheshwar-605726227/',
    instagram: 'https://www.instagram.com/umamaheshwarchintu_20',
    email: 'mu21btb0a44@student.nitw.ac.in'
  },
];

const Alumni = () => {
  useEffect(() => {
    AOS.init({
      duration: 1500,
      once: true,
    });
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Alumni Section */}
      <div className="z-50 p-4 sm:p-8 md:p-12 lg:p-24">
        <div className="text-center mb-8 sm:mb-16" data-aos="fade-up" data-aos-duration="1000">
          <h2 className="text-2xl sm:text-4xl md:text-5xl text-white batman-font mb-4">Our Alumni</h2>
          <p className="text-base sm:text-lg text-gray-300 destruct-font px-4">Meet the brilliant minds who shaped our journey</p>
        </div>
        <div className="flex flex-col gap-4 sm:gap-8">
          {/* Map over the data array to render cards dynamically */}
          {alumniData.map((alumnus, index) => (
            <div key={index}>
              <div
                className="group"
                data-aos="fade-up"
                data-aos-delay={`${100 + index * 100}`}
                data-aos-duration="1000"
              >
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 p-4 sm:p-8 bg-gray-900/50 rounded-2xl hover:bg-gray-800/70 transition-all duration-500 hover:scale-105 hover:shadow-2xl min-h-70 max-w-4xl mx-auto">
                  <div className="relative">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-blue-500 group-hover:border-red-500 transition-colors duration-500">
                      <Image
                        src={alumnus.imageUrl}
                        alt={alumnus.name}
                        width={160}
                        height={160}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    {/* Social Media Icons - Always Visible */}
                    <div className="absolute -bottom-1 -right-1 sm:right-2 sm:-bottom-2 flex space-x-1 z-10">
                      <Link
                        href={alumnus.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-6 h-6 sm:w-7 sm:h-7 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors duration-200 shadow-lg"
                        title="LinkedIn"
                      >
                        <FaLinkedin className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      </Link>
                       <div
                         className="w-6 h-6 sm:w-7 sm:h-7 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors duration-200 cursor-pointer shadow-lg"
                         title={alumnus.instagram}
                         onClick={() => {
                           navigator.clipboard.writeText(alumnus.instagram);
                           alert(`Instagram handle copied: ${alumnus.instagram}`);
                         }}
                       >
                         <FaInstagram className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                       </div>
                       <div
                         className="w-6 h-6 sm:w-7 sm:h-7 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-700 transition-colors duration-200 cursor-pointer shadow-lg"
                         title={alumnus.email}
                         onClick={() => {
                           navigator.clipboard.writeText(alumnus.email);
                           alert(`Email copied: ${alumnus.email}`);
                         }}
                       >
                         <FaEnvelope className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                       </div>
                    </div>
                  </div>
                  <div className="text-center sm:text-left flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{alumnus.name}</h3>
                    <p className="text-gray-300 text-sm sm:text-base leading-relaxed">{alumnus.description}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

  );
};

export default Alumni;
