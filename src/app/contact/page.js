"use client"
import React, { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    queryType: '',
    otherQuery: '',
    message: ''
  });
  const [showOtherInput, setShowOtherInput] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 1500,
      once: true,
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Show/hide other query input based on dropdown selection
    if (name === 'queryType') {
      setShowOtherInput(value === 'others');
      if (value !== 'others') {
        setFormData(prev => ({ ...prev, otherQuery: '' }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.msg || "Something went wrong!");
        return;
      }

      alert("Message sent successfully!");

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        queryType: "",
        otherQuery: "",
        message: "",
      });
      setShowOtherInput(false);

    } catch (error) {
      console.error(error);
      alert("Server error! Please try again later.");
    }
  };

  return (
    <div className="relative min-h-screen text-white">
      {/* Header Section */}
      <div className="relative z-10 text-center pt-24 pb-12 px-4" data-aos="fade-up">
        <h1 className="batman-font text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
          Contact Us
        </h1>
        <p className="destruct-font text-gray-300 text-lg sm:text-xl max-w-2xl mx-auto">
          Have a question or want to get in touch? We&apos;d love to hear from you.
        </p>
      </div>

      {/* Contact Form Section */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-2xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="bg-gray-900/50 border border-gray-700/80 rounded-2xl p-6 sm:p-8 lg:p-10 space-y-6"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-300 mb-2 destruct-font">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-800/70 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 destruct-font"
                placeholder="Enter your name"
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2 destruct-font">
                Email ID <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-800/70 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 destruct-font"
                placeholder="Enter your email"
              />
            </div>

            {/* Phone Number Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-300 mb-2 destruct-font">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-800/70 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 destruct-font"
                placeholder="Enter your phone number"
              />
            </div>

            {/* Type of Query Dropdown */}
            <div>
              <label htmlFor="queryType" className="block text-sm font-semibold text-gray-300 mb-2 destruct-font">
                Type of Query <span className="text-red-500">*</span>
              </label>
              <select
                id="queryType"
                name="queryType"
                value={formData.queryType}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-800/70 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 destruct-font appearance-none cursor-pointer"
              >
                <option value="" className="bg-gray-800">Select a query type</option>
                <option value="general" className="bg-gray-800">General Inquiry</option>
                <option value="membership" className="bg-gray-800">Membership</option>
                <option value="events" className="bg-gray-800">Events</option>
                <option value="projects" className="bg-gray-800">Projects</option>
                <option value="collaboration" className="bg-gray-800">Collaboration</option>
                <option value="others" className="bg-gray-800">Others</option>
              </select>
            </div>

            {/* Other Query Input - Shows when "Others" is selected */}
            {showOtherInput && (
              <div data-aos="fade-up" data-aos-duration="500">
                <label htmlFor="otherQuery" className="block text-sm font-semibold text-gray-300 mb-2 destruct-font">
                  Please specify <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="otherQuery"
                  name="otherQuery"
                  value={formData.otherQuery}
                  onChange={handleChange}
                  required={showOtherInput}
                  className="w-full px-4 py-3 bg-gray-800/70 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 destruct-font"
                  placeholder="Please specify your query type"
                />
              </div>
            )}

            {/* Message Field */}
            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-gray-300 mb-2 destruct-font">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-3 bg-gray-800/70 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none destruct-font"
                placeholder="Enter your message here..."
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 batman-font text-lg tracking-wide"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;