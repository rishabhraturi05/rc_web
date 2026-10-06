"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaLaptopCode, FaCogs, FaMicrochip, FaBullhorn, FaLock, FaUser, FaArrowLeft } from "react-icons/fa";

const DEPARTMENTS = [
  {
    name: "Software",
    icon: FaLaptopCode,
    color: "text-blue-400",
    border: "border-blue-500/30",
  },
  {
    name: "Mechanical",
    icon: FaCogs,
    color: "text-amber-400",
    border: "border-amber-500/30",
  },
  {
    name: "Embedded",
    icon: FaMicrochip,
    color: "text-emerald-400",
    border: "border-emerald-500/30",
  },
  {
    name: "PR",
    icon: FaBullhorn,
    color: "text-purple-400",
    border: "border-purple-500/30",
  },
];

export default function AddSecLogin() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");

  useEffect(() => {
    if (status === "authenticated" && (session?.user?.role === "addsec" || session?.user?.role === "admin")) {
      router.push("/addsecs");
    }
  }, [status, session, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginMessage("");

    const { username, password } = credentials;

    try {
      const result = await signIn("credentials", {
        username: username.trim(),
        password: password.trim(),
        redirect: false,
      });

      if (result?.error) {
        setLoginMessage("Invalid ID or password. Please verify your credentials.");
        setIsSubmitting(false);
      } else if (result?.ok) {
        router.push("/addsecs");
        router.refresh();
      }
    } catch (error) {
      console.error("Login Error:", error);
      setLoginMessage("An error occurred during authentication.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen text-white flex flex-col justify-center pt-28 sm:pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      {/* Title Header */}
      <div className="relative z-10 text-center pb-8" data-aos="fade-up">
        <div className="inline-block px-3 py-1 mb-3 rounded-full text-xs font-mono uppercase tracking-widest bg-white/10 text-gray-300 border border-white/20">
          Department Additional Secretaries Portal
        </div>
        <h1 className="font-mono text-3xl sm:text-5xl font-bold tracking-tight mb-3 text-white">
          {">_"} ADDSEC_LOGIN
        </h1>
        <p className="font-mono text-gray-400 text-sm sm:text-base max-w-lg mx-auto">
          Sign in with your department ID to access recruitment applicant entries, scoring, and Excel reports.
        </p>
      </div>

      {/* 4 Department Badges */}
      <div className="max-w-xl mx-auto w-full mb-8">
        <div className="text-center mb-2.5">
          <span className="font-mono text-[11px] text-gray-400 uppercase tracking-wider">
            [ Additional Secretary Departments ]
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {DEPARTMENTS.map((dept) => {
            const Icon = dept.icon;
            return (
              <div
                key={dept.name}
                className={`p-3 text-center rounded border transition-all duration-200 flex flex-col items-center justify-center space-y-1.5 glass-panel ${dept.border}`}
              >
                <Icon className={`text-xl ${dept.color}`} />
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-gray-200">
                  {dept.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Login Form Container */}
      <div className="relative z-10 max-w-md mx-auto w-full">
        <form
          onSubmit={handleSubmit}
          className="glass-panel p-6 sm:p-8 space-y-6 shadow-2xl border border-white/20"
        >
          <div>
            <label
              htmlFor="username"
              className="block text-xs font-bold text-white mb-2 font-mono uppercase tracking-wider flex items-center gap-2"
            >
              <FaUser className="text-gray-400" />
              AddSec Department ID
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={credentials.username}
              onChange={handleChange}
              autoComplete="username"
              required
              className="w-full px-4 py-3 bg-black/60 border border-white/20 rounded text-white placeholder-gray-500 focus:outline-none focus:border-white transition-all duration-300 font-mono text-sm"
              placeholder="e.g. addsec_software"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-bold text-white mb-2 font-mono uppercase tracking-wider flex items-center gap-2"
            >
              <FaLock className="text-gray-400" />
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={credentials.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
              className="w-full px-4 py-3 bg-black/60 border border-white/20 rounded text-white placeholder-gray-500 focus:outline-none focus:border-white transition-all duration-300 font-mono text-sm"
              placeholder="••••••••"
            />
          </div>

          {loginMessage && (
            <div className="px-4 py-3 bg-red-950/40 border border-red-500/80 rounded">
              <p className="font-mono text-red-400 text-xs">{loginMessage}</p>
            </div>
          )}

          <div className="pt-2 space-y-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-3 bg-white text-black hover:bg-gray-200 disabled:opacity-60 disabled:cursor-not-allowed font-bold rounded transition-all duration-300 font-mono uppercase tracking-widest border border-white text-sm"
            >
              {isSubmitting ? "[ AUTHENTICATING... ]" : "[ ACCESS_DEPARTMENT_PORTAL ]"}
            </button>

            <div className="text-center pt-2">
              <Link
                href="/internal"
                className="inline-flex items-center gap-1.5 font-mono text-xs text-gray-400 hover:text-white transition-colors underline underline-offset-4"
              >
                <FaArrowLeft className="text-[10px]" />
                <span>[ Back to Internal Gateway ]</span>
              </Link>
            </div>
          </div>

          <div className="text-center pt-1">
            <p className="font-mono text-xs text-gray-500">
              Robotics Club NITW &bull; Internal Recruitment System
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
