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
        className="rounded-2xl bg-cover bg-center absolute inset-0 opacity-70 group-hover:opacity-90 transition-opacity duration-300"
        style={{ backgroundImage: `url('${event.image}')` }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent rounded-2xl"></div>
      
      {/* Status Badge */}
      {getStatusBadge(event.status)}
      
      <div className="relative z-10 p-6 text-center">
        <h3 className="text-2xl font-bold mb-2 batman-font">{event.title}</h3>
        <p className="text-sm mb-2 destruct-font">{event.date}</p>
        <p className="text-xs opacity-90">{event.shortDescription}</p>
      </div>
    </div>
  )
}

const EventModal = ({ event, isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Modal Header */}
        <div className="relative">
          <div
            className="h-48 bg-cover bg-center rounded-t-2xl"
            style={{ backgroundImage: `url('${event.image}')` }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent rounded-t-2xl"></div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 transition-colors"
          >
            ×
          </button>
          <div className="absolute bottom-4 left-4 text-white">
            <h2 className="text-3xl font-bold batman-font">{event.title}</h2>
            <p className="text-lg destruct-font">{event.date}</p>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Event Details */}
            <div>
              <h3 className="text-xl font-bold mb-4 batman-font text-blue-400">Event Details</h3>
              <div className="space-y-3">
                <div>
                  <span className="font-semibold text-gray-300">Date:</span>
                  <p className="text-white">{event.date}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-300">Time:</span>
                  <p className="text-white">{event.time}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-300">Venue:</span>
                  <p className="text-white">{event.venue}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-300">Duration:</span>
                  <p className="text-white">{event.duration}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-300">Registration Fee:</span>
                  <p className="text-white">{event.fee}</p>
                </div>
              </div>
            </div>

            {/* Event Description */}
            <div>
              <h3 className="text-xl font-bold mb-4 batman-font text-blue-400">Description</h3>
              <p className="text-gray-300 leading-relaxed destruct-font">{event.description}</p>
            </div>
          </div>

          {/* Requirements */}
          <div className="mt-6">
            <h3 className="text-xl font-bold mb-4 batman-font text-blue-400">Requirements</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              {event.requirements.map((req, index) => (
                <li key={index} className="destruct-font">{req}</li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="mt-6 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-lg font-bold mb-2 batman-font text-blue-400">Contact</h3>
            <p className="text-gray-300 destruct-font">{event.contact}</p>
          </div>

          {/* Register Button */}
          <div className="mt-6 text-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition-colors duration-300 batman-font">
              Register Now
            </button>
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
      title: "Robotics Workshop",
      date: "March 15, 2024",
      time: "9:00 AM - 5:00 PM",
      venue: "Main Auditorium, NIT Warangal",
      duration: "8 hours",
      fee: "₹500",
      status: "completed",
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=2070&auto=format&fit=crop",
      shortDescription: "Learn the fundamentals of robotics and automation",
      description: "Join us for an intensive hands-on robotics workshop where you'll learn about robot design, programming, and control systems. This workshop is perfect for beginners and intermediate students who want to dive deep into the world of robotics.",
      requirements: [
        "Basic knowledge of programming (Python/C++)",
        "Laptop with Arduino IDE installed",
        "Enthusiasm to learn and build",
        "Team of 2-3 members (optional)"
      ],
      contact: "Contact: robotics@nitw.ac.in | Phone: +91-9876543210"
    },
    {
      id: 2,
      title: "AI & Machine Learning Seminar",
      date: "March 22, 2024",
      time: "2:00 PM - 6:00 PM",
      venue: "Computer Science Department",
      duration: "4 hours",
      fee: "Free",
      status: "active",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2070&auto=format&fit=crop",
      shortDescription: "Explore the latest trends in AI and ML",
      description: "An interactive seminar featuring industry experts and researchers discussing the latest developments in Artificial Intelligence and Machine Learning. Learn about practical applications and career opportunities in AI.",
      requirements: [
        "Basic understanding of mathematics",
        "Interest in AI/ML concepts",
        "Laptop (optional for hands-on sessions)"
      ],
      contact: "Contact: ai@nitw.ac.in | Phone: +91-9876543211"
    },
    {
      id: 3,
      title: "Robocon Preparation Bootcamp",
      date: "April 5-7, 2024",
      time: "9:00 AM - 6:00 PM",
      venue: "Robotics Lab, NIT Warangal",
      duration: "3 days",
      fee: "₹1000",
      status: "upcoming",
      image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070&auto=format&fit=crop",
      shortDescription: "Intensive preparation for Robocon competition",
      description: "A comprehensive 3-day bootcamp designed to prepare teams for the upcoming Robocon competition. Learn advanced robotics concepts, team management, and competition strategies from experienced mentors.",
      requirements: [
        "Team of 4-6 members",
        "Basic robotics knowledge",
        "Commitment to attend all sessions",
        "Laptop with required software"
      ],
      contact: "Contact: robocon@nitw.ac.in | Phone: +91-9876543212"
    },
    {
      id: 4,
      title: "Innovation Challenge",
      date: "April 20, 2024",
      time: "10:00 AM - 4:00 PM",
      venue: "Innovation Center",
      duration: "6 hours",
      fee: "₹300",
      status: "upcoming",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop",
      shortDescription: "Showcase your innovative robotics solutions",
      description: "A day-long innovation challenge where participants will work in teams to solve real-world problems using robotics. The challenge includes problem identification, solution design, and prototype development.",
      requirements: [
        "Team of 3-4 members",
        "Creative thinking skills",
        "Basic electronics knowledge",
        "Presentation skills"
      ],
      contact: "Contact: innovation@nitw.ac.in | Phone: +91-9876543213"
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
        <p className="destruct-font text-xl text-gray-300 max-w-2xl mx-auto">
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
