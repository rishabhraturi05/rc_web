'use client'

import React, { useState, useEffect } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'

const EventCard = ({ event, onClick }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold batman-font animate-pulse">
            LIVE
          </div>
        )
      case 'upcoming':
        return (
          <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold batman-font">
            UPCOMING
          </div>
        )
      case 'completed':
        return (
          <div className="absolute top-4 right-4 bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-bold batman-font">
            COMPLETED
          </div>
        )
      case 'cancelled':
        return (
          <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold batman-font">
            CANCELLED
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div
      className="group cursor-pointer m-4 w-full max-w-[350px] h-[400px] flex flex-col justify-end items-center relative transition duration-300 hover:scale-105"
      onClick={onClick}
      data-aos="fade-up"
      data-aos-duration="1000"
    >
      <div
        className="rounded-2xl bg-cover bg-center absolute inset-0 opacity-70 group-hover:opacity-100 ease-in-out transition-opacity duration-300"
        style={{ backgroundImage: `url('${event.image}')` }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent rounded-2xl"></div>

      {/* Status Badge */}
      {getStatusBadge(event.status)}

      <div className="relative z-10 p-6 text-center">
        <h3 className="text-2xl font-bold mb-2 batman-font">{event.title}</h3>
        <p className="text-sm mb-2 batman-font">{event.date}</p>
        <p className="text-xs opacity-90 batman-font">{event.shortDescription}</p>
      </div>
    </div>
  )
}

const EventModal = ({ event, isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-opacity-75 flex items-center justify-center z-50 p-4 transition-all duration-300 backdrop-blur-lg ">
      <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar transition-all duration-300 ease-in-out">
        {/* Modal Header */}
        <div className="relative">
          {/* <div
            className="h-48 bg-cover bg-no-repeat bg-center rounded-t-2xl"
            style={{ backgroundImage: `url('${event.image}')` }}  
          ></div> */}
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent rounded-t-2xl"></div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 transition-colors"
          >
            ×
          </button>
          <div className="absolute bottom-4 left-4 text-white">
            <h2 className="text-3xl font-bold batman-font">{event.title}</h2>
            <p className="text-lg batman-font">{event.date}</p>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <div className="flex flex-col gap-6">
            {/* Event Details */}
            <div>
              <h3 className="text-xl font-bold mb-4 batman-font text-blue-400">Event Details</h3>
              <div className="space-y-3 batman-font">
                <div className='flex gap-2'>
                  <span className="font-semibold text-gray-300">Date :</span>
                  <p className="text-white">{event.date}</p>
                </div>
                <div className='flex gap-2'>
                  <span className="font-semibold text-gray-300">Time :</span>
                  <p className="text-white">{event.time}</p>
                </div>
                <div className='flex gap-2'>
                  <span className="font-semibold text-gray-300">Venue :</span>
                  <p className="text-white">{event.venue}</p>
                </div>
              </div>
            </div>

            {/* Event Description */}
            <div>
              <h3 className="text-xl font-bold mb-4 batman-font text-blue-400">Description</h3>
              <p className="text-gray-300 leading-relaxed batman-font">{event.description}</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-6 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-lg font-bold mb-2 batman-font text-blue-400">Contact</h3>
            <p className="text-gray-300 batman-font">{event.contact}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const EventsPage = () => {
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    AOS.init({
      duration: 1500,
      once: true,
    })
  }, [])

  const events = [
    {
      id: 1,
      title: "Fresher's Event",
      date: "Oct 17, 2025",
      time: "5:00 PM",
      venue: "MME Seminar Hall",
      duration: "3 hours",
      fee: "-",
      status: "upcoming",
      image: "/events/freshers.jpg",
      shortDescription: "Exclusive event for freshers",
      description: "The wait is finally OVER.\nThe heist of creativity is about to begin…\n🎭 LA CASA DE ROBOT\nHere’s the Masterplan, Crew:\n🔹 Rendezvous Point: MME Seminar Hall\n🔹 Mission: Crack codes, conquer challenges, outsmart the clock\n🔹 Goal: Unleash your inner innovator 🤖\n\nAnd the spoils of this heist ? 🏆\nRobotic Kits, Refreshments, Glory, and Bragging Rights! ⚙\nThis time, we’re not after gold or banks…\nWe’re after something bigger —\n⚡ Innovation.Imagination.The Future of Robotics! ⚡\n",
      contact: "Contact: robotics@nitw.ac.in | Phone: +91-7661991859"
    },
    {
      id: 2,
      title: "Sumo War",
      date: "October 24-25, 2025",
      time: "-",
      venue: "-",
      duration: "4 hours",
      fee: "N/A",
      status: "upcoming",
      image: "/events/Sumo Wars Event Poster.png",
      shortDescription: "Robotics Battle",
      description: "Where strategy meets strength! Step into the arena with your battle-ready sumobot and take control in an adrenaline-fueled showdown. Outsmart your rival, push them out of the warzone, and rack up points by landing hits and keeping them trapped in the danger zone. Skill decides the champion!",
      contact: "Contact: Srijoy | Phone: +91-75694 98783"
    },
    {
      id: 3,
      title: "Bombs Away",
      date: "October 24-25, 2025",
      time: "-",
      venue: "Robotics Lab, NIT Warangal",
      duration: "-",
      fee: "N/A",
      status: "upcoming",
      image: "/events/Bombs_Away_EventPoster.png",
      shortDescription: "Fly the Plane",
      description: "Bomb's Away is a skill-based challenge testing your timing and judgment. As a 'Bombardier,' you will control a single trigger to release an inert payload from a pilot-operated RC aircraft. Your mission is to account for speed and altitude to land the payload closest to the target's center.",
      contact: "Contact: Dhanvanth | Phone: 74180 56603"
    },
    {
      id: 4,
      title: "BLAZE",
      date: "October 24-25, 2025",
      time: "-",
      venue: "-",
      duration: "-",
      fee: "N/A",
      status: "upcoming",
      image: "/events/RC_BLAZE_POSTER.png",
      shortDescription: "Showcase your innovative robotics solutions",
      description: "BLAZE is your high-octane laser challenge by the Robotics Club. Enter the custom 'Alice in Borderland' arena for intense 4v4 combat. The map is loaded with secrets, and every day brings a new game mode! Play smart, hit hard, and fight your way to the top of the live leaderboard.",
      contact: "Contact: Soumilya | Phone: 84486 44855"
    },
    {
      id: 5,
      title: "Robotics Workshop",
      date: "Sept 14, 2025",
      time: "10:00 AM - 4:00 PM",
      venue: "ALC",
      duration: "6 hours",
      fee: "-",
      status: "completed",
      image: "/events/workshop.jpg",
      shortDescription: "Learn the basics of robotics",
      description: "Join this interactive, hands-on session to explore Arduino, Robot Design, and take on thrilling challenges like Cozmo Clench and Meshmerize—the perfect launchpad for Techfest IIT Bombay.This is not just a lecture—you will build, create, and compete with like-minded robotics enthusiasts.",
      contact: "Contact: roboticsclub@nitw.ac.in | Phone: +91-7661991859"
    },
    {
      id: 6,
      title: "Global Trends in Robotics",
      date: "March 19, 2025",
      time: "6:30 PM",
      venue: "ALC",
      duration: "3 hours",
      fee: "-",
      status: "completed",
      image: "/events/onlinewebinar25.png",
      shortDescription: "Global Trends in Robotics",
      description: "The field of robotics is evolving rapidly, opening up exciting opportunities across the globe in research, industry, and entrepreneurship. From AI-driven automation to space exploration and healthcare innovations, robotics is transforming the way we work and live.Join us for an insightful speaker session where our expert Nallamilli Venkata Reddy garu will discuss about global trends in robotics, career pathways, international research collaborations, and the skills needed to thrive in this dynamic field.Don't miss this opportunity to gain valuable knowledge and explore how you can be part of the global robotics revolution!",
      contact: "Contact: roboticsclub@nitw.ac.in | Phone: +91-7661991859"
    }
  ]

  const handleEventClick = (event) => {
    setSelectedEvent(event)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedEvent(null)
  }

  return (
    <div className=" text-white min-h-screen">
      {/* Header Section */}
      <div className=" text-white text-center py-16" data-aos="fade-up" data-aos-duration="3000">
        <h1 className="batman-font text-5xl font-bold mb-4">Events</h1>
        <p className="batman-font text-xl text-gray-300 max-w-2xl mx-auto">
          Join our exciting robotics events and workshops
        </p>
      </div>

      {/* Events Grid */}
      <div className=" text-white py-16" data-aos="fade-up" data-aos-duration="3000">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 justify-items-center">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => handleEventClick(event)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      <EventModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}

export default EventsPage
