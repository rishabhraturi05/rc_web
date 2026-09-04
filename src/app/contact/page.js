"use client"
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);

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
        alert(data.msg || "TRANSMISSION FAILED!");
        setIsSubmitting(false);
        return;
      }

      alert("DATA TRANSMITTED SUCCESSFULLY!");

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
      alert("SERVER ERROR! PLEASE TRY AGAIN.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden pb-24">

      {/* Header Section */}
      <div className="relative z-10 text-center pt-32 pb-12 px-4">
        <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
        >
          <h1 className="mb-4 text-5xl md:text-7xl font-black text-white title-glow tracking-tighter uppercase" style={{ fontFamily: 'var(--font-orbitron)' }}>
            Contact Us
          </h1>
          <p className="text-cyan-400 font-mono text-lg max-w-2xl mx-auto bg-black/40 backdrop-blur-sm p-4 rounded-lg shadow-xl border border-white/10">
            Have a question or want to get in touch? We&apos;d love to hear from you.
          </p>
        </motion.div>
      </div>

      {/* Contact Form Section */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-2xl mx-auto">
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="glass-panel p-6 sm:p-8 lg:p-10 space-y-6"
          >
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-cyan-400 mb-2 font-mono tracking-widest uppercase">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-cyan-950/30 border border-cyan-500/30 rounded-md text-white placeholder-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 focus:bg-cyan-900/50 transition-all duration-300 font-mono"
                placeholder="Enter your name"
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-cyan-400 mb-2 font-mono tracking-widest uppercase">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-cyan-950/30 border border-cyan-500/30 rounded-md text-white placeholder-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 focus:bg-cyan-900/50 transition-all duration-300 font-mono"
                placeholder="Enter your email"
              />
            </div>

            {/* Phone Number Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-cyan-400 mb-2 font-mono tracking-widest uppercase">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-cyan-950/30 border border-cyan-500/30 rounded-md text-white placeholder-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 focus:bg-cyan-900/50 transition-all duration-300 font-mono"
                placeholder="Enter your phone number"
              />
            </div>

            {/* Type of Query Dropdown */}
            <div>
              <label htmlFor="queryType" className="block text-sm font-semibold text-cyan-400 mb-2 font-mono tracking-widest uppercase">
                Query Type <span className="text-red-500">*</span>
              </label>
              <select
                id="queryType"
                name="queryType"
                value={formData.queryType}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-cyan-950/30 border border-cyan-500/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 focus:bg-cyan-900/50 transition-all duration-300 font-mono appearance-none cursor-pointer"
              >
                <option value="" className="bg-gray-900 text-gray-300">Select query type</option>
                <option value="general" className="bg-gray-900 text-cyan-300">General Inquiry</option>
                <option value="Recruitment" className="bg-gray-900 text-cyan-300">Recruitment</option>
                <option value="events" className="bg-gray-900 text-cyan-300">Events</option>
                <option value="projects" className="bg-gray-900 text-cyan-300">Projects</option>
                <option value="collaboration" className="bg-gray-900 text-cyan-300">Collaboration</option>
                <option value="others" className="bg-gray-900 text-cyan-300">Others</option>
              </select>
            </div>

            {/* Other Query Input - Shows when "Others" is selected */}
            <AnimatePresence>
              {showOtherInput && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label htmlFor="otherQuery" className="block text-sm font-semibold text-cyan-400 mb-2 font-mono tracking-widest uppercase mt-4">
                    Please Specify <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="otherQuery"
                    name="otherQuery"
                    value={formData.otherQuery}
                    onChange={handleChange}
                    required={showOtherInput}
                    className="w-full px-4 py-3 bg-cyan-950/30 border border-cyan-500/30 rounded-md text-white placeholder-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 focus:bg-cyan-900/50 transition-all duration-300 font-mono"
                    placeholder="Enter your query type"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Message Field */}
            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-cyan-400 mb-2 font-mono tracking-widest uppercase">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-3 bg-cyan-950/30 border border-cyan-500/30 rounded-md text-white placeholder-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 focus:bg-cyan-900/50 transition-all duration-300 resize-none font-mono"
                placeholder="Enter your message here..."
              />
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-4 bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-400 text-cyan-300 hover:text-white font-bold rounded-md transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-black uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:shadow-[0_0_25px_rgba(34,211,238,0.6)] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'var(--font-orbitron)' }}
              >
                {isSubmitting ? 'SENDING...' : 'SEND MESSAGE'}
              </button>
            </div>
          </motion.form>
        </div>
      </div>
    </main>
  );
};

export default Contact;