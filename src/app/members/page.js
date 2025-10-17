"use client";
import Link from 'next/link';
import React from 'react'
// import Image from 'next/image' // Replaced with standard <img> tag
import { FaLinkedin, FaInstagram } from 'react-icons/fa' // Replaced with inline SVGs

const profiles = {
  professor: [
    {
      name: 'Faculty Advisor',
      email: 'aadityapra2910@gmail.com',
      img: '/members/prof/gaurav.jpeg',
      linkedin: '#',
      instagram: '#'
    },
  ],
  secretaries: [
    {
      name: 'Secretary 1',
      email: 'sec1@nitw.ac.in',
      img: '/members/gensecs/_Sudhakar_photo - Sudhakar Kumar.jpg',
      linkedin: '#',
      instagram: '#'
    },
    {
      name: 'Secretary 2',
      email: 'sec2@nitw.ac.in',
      img: '/members/gensecs/Gampa Sai Sasivardhan.jpg',
      linkedin: '#',
      instagram: '#'
    },
  ],
  addlSecretaries: [
    {
      name: 'Addl Sec 1',
      email: 'addl1@nitw.ac.in',
      img: '/members/KumarDarshanala.jpeg',
      linkedin: '#',
      instagram: '#'
    },
    {
      name: 'Addl Sec 2',
      email: 'addl2@nitw.ac.in',
      img: '/alumini/S.Mahathi.jpg',
      linkedin: '#',
      instagram: '#'
    },
    {
      name: 'Addl Sec 3',
      email: 'addl3@nitw.ac.in',
      img: '/alumini/ShaikAbdullah.JPG',
      linkedin: '#',
      instagram: '#'
    },
    {
      name: 'Addl Sec 4',
      email: 'addl4@nitw.ac.in',
      img: '/events/freshers.jpg',
      linkedin: '#',
      instagram: '#'
    },
  ],
  embedded: Array.from({ length: 20 }).map((_, i) =>
  ({
    name: `Embedded ${i + 1}`,
    email: `embedded${i + 1}@nitw.ac.in`,
    img: `/members/embedded${i + 1}.png`,
    linkedin: '#',
    instagram: '#'
  })),
  software: Array.from({ length: 13 }).map((_, i) =>
  ({
    name: `Software ${i + 1}`,
    email: `software${i + 1}@nitw.ac.in`,
    img: '/events/workshop.jpg',
    linkedin: '#',
    instagram: '#'
  })),
  mechanical: Array.from({ length: 19 }).map((_, i) =>
  ({
    name: `Mechanical ${i + 1}`,
    email: `mechanical${i + 1}@nitw.ac.in`,
    img: '/events/Sumo Wars Event Poster.png',
    linkedin: '#',
    instagram: '#'
  })),
  pr: Array.from({ length: 7 }).map((_, i) =>
  ({
    name: `PR ${i + 1}`,
    email: `pr${i + 1}@nitw.ac.in`,
    img: '/events/RC_BLAZE_POSTER.png',
    linkedin: '#',
    instagram: '#'
  })),
}

const ProfileCard = ({ person, size = 'md' }) => {
  const isSmall = size === 'sm' || size === 'xs'
  const isExtraSmall = size === 'xs'
  return (
    <div className="group relative overflow-hidden rounded-xl shadow-lg bg-gray-900">
      <div className={`relative ${isExtraSmall ? 'h-40' : isSmall ? 'h-48' : 'h-64'} w-full`}>
        {/* Replaced Next.js Image with standard <img> tag */}
        <img src={person.img} alt={person.name} className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105" />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
      <div className="absolute inset-x-0 bottom-0 translate-y-full p-4 text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        <div className="flex items-center justify-between">
          <p className={`${isExtraSmall ? 'text-xs' : isSmall ? 'text-sm' : 'text-base'} font-semibold`}>{person.name}</p>
          <div className="flex gap-3">
            <Link href={person.linkedin} target="_blank" rel="noreferrer" className="pointer-events-auto hover:text-blue-400 transition-colors"><FaLinkedin /></Link>
            <Link href={person.instagram} target="_blank" rel="noreferrer" className="pointer-events-auto hover:text-pink-400 transition-colors"><FaInstagram /></Link>
          </div>
        </div>
      </div>
    </div>
  )
}

const Section = ({ title, people, cols = 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4', cardSize = 'md' }) => (
  <section className="mx-auto max-w-6xl px-4 py-10">
    <h2 className="mb-8 text-2xl font-bold text-center text-white">{title}</h2>
    <div className={`grid gap-6 ${cols}`}>
      {people.map((p, idx) => (
        <ProfileCard key={`${title}-${idx}`} person={p} size={cardSize} />
      ))}
    </div>
  </section>
)

const Page = () => {
  return (
    <main className="text-white">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 text-center">
        <h1 className="mb-3 text-3xl font-extrabold md:text-4xl batman-font">Meet Our Team</h1>
        <p className="text-white/80 destruct-font">Together we build, innovate, and inspire across robotics, software, and outreach.</p>
      </div>

      <section className="mx-auto max-w-6xl px-4 py-6">
        <h2 className="mb-6 text-center text-2xl font-bold text-white">Faculty Advisor</h2>
        <div className="flex justify-center">
          <div className="w-full max-w-sm">
            <ProfileCard person={profiles.professor[0]} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-6">
        <h2 className="mb-8 text-center text-2xl font-bold text-white">General Secretaries</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {profiles.secretaries.map((p, i) => (
            <ProfileCard key={`gensec-${i}`} person={p} />
          ))}
        </div>
      </section>

      <Section title="Additional Secretaries" people={profiles.addlSecretaries} cols="grid-cols-2 sm:grid-cols-2 md:grid-cols-4" />
      <Section title={`Embedded Systems Team (${profiles.embedded.length})`} people={profiles.embedded} cardSize="sm" />
      <Section title={`Software Team (${profiles.software.length})`} people={profiles.software} cardSize="sm" />
      <Section title={`Mechanical Team (${profiles.mechanical.length})`} people={profiles.mechanical} cardSize="sm" />
      <Section title={`Public Relations (${profiles.pr.length})`} people={profiles.pr} cols="grid-cols-1 sm:grid-cols-2 md:grid-cols-3" />
    </main >
  )
}

export default Page;

