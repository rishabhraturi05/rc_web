"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { FaEnvelope, FaUserAstronaut } from "react-icons/fa";

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated" || session?.user?.role !== "admin") {
      router.push("/admin/login");
    }
  }, [status, session, router]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/admin/login");
    router.refresh();
  };

  if (status === "loading") {
    return (
      <div className="relative min-h-screen text-white flex items-center justify-center">
        <p className="destruct-font text-gray-300 text-lg">Loading...</p>
      </div>
    );
  }

  if (status === "unauthenticated" || session?.user?.role !== "admin") {
    return null;
  }

  return (
    <div className="relative min-h-screen text-white">
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
            <div>
              <h1 className="batman-font text-4xl sm:text-5xl font-bold tracking-tight mb-2">
                Admin Panel
              </h1>
              <p className="destruct-font text-gray-300 text-lg">
                Welcome, {session.user?.username || "Admin"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 batman-font text-base tracking-wide"
            >
              Logout
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <Link
              href="/admin/responses"
              className="group bg-gray-900/50 border border-gray-700/80 rounded-2xl p-8 hover:border-blue-500/60 hover:bg-gray-900/70 transition-all duration-300"
            >
              <FaEnvelope className="text-4xl text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
              <h2 className="batman-font text-2xl font-bold mb-2">Contact Responses</h2>
              <p className="destruct-font text-gray-400">
                View and manage contact form submissions from the website
              </p>
            </Link>

            <Link
              href="/admin/freshers"
              className="group bg-gray-900/50 border border-gray-700/80 rounded-2xl p-8 hover:border-cyan-500/60 hover:bg-gray-900/70 transition-all duration-300"
            >
              <FaUserAstronaut className="text-4xl text-cyan-400 mb-4 group-hover:scale-110 transition-transform" />
              <h2 className="batman-font text-2xl font-bold mb-2">Freshers Registration</h2>
              <p className="destruct-font text-gray-400">
                Manage team registrations, attendance, and walk-in entries
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
