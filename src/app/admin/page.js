"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { FaEnvelope, FaUserAstronaut, FaUsers, FaMicrochip } from "react-icons/fa";

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const userRole = session?.user?.role;

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated" || userRole !== "admin") {
      router.push("/admin/login");
    }
  }, [status, userRole, router]);

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      router.push("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      alert("Logout failed. Please try again.");
    }
  };

  if (status === "loading") {
    return (
      <div className="relative min-h-screen text-white flex items-center justify-center">
        <p className="font-mono text-gray-300 text-lg animate-pulse">Loading[...]_</p>
      </div>
    );
  }

  if (status === "unauthenticated" || userRole !== "admin") {
    return null;
  }

  return (
    <div className="relative min-h-screen text-white">
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
            <div>
              <h1 className="font-mono text-4xl sm:text-5xl font-bold tracking-tight mb-2 text-white">
                {">_"} ADMIN_PANEL
              </h1>
              <p className="font-mono text-gray-400 text-lg">
                Welcome, {session.user?.username || "sysadmin"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-transparent border border-white text-white font-mono rounded hover:bg-white hover:text-black transition-colors uppercase text-sm tracking-widest cursor-pointer"
            >
              [ LOGOUT ]
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              href="/admin/recruitment"
              className="group glass-panel p-8 glass-panel-hover flex flex-col sm:col-span-2 lg:col-span-2"
            >
              <FaUserAstronaut className="text-3xl text-white mb-6 group-hover:scale-110 transition-transform" />
              <h2 className="font-mono text-xl font-bold mb-2 text-white">RECRUITMENT_MANAGEMENT</h2>
              <p className="font-mono text-gray-400 text-sm leading-relaxed">
                Create and manage multiple recruitment forms, deadlines, departments, candidate scoring, and applications
              </p>
            </Link>

            <Link
              href="/admin/members"
              className="group glass-panel p-8 glass-panel-hover flex flex-col"
            >
              <FaUsers className="text-3xl text-white mb-6 group-hover:scale-110 transition-transform" />
              <h2 className="font-mono text-xl font-bold mb-2 text-white">MANAGE_MEMBERS</h2>
              <p className="font-mono text-gray-400 text-sm leading-relaxed">
                View members department-wise, alumni, professors, and evaluate member scores & remarks
              </p>
            </Link>

            <Link
              href="/admin/technozian"
              className="group glass-panel p-8 glass-panel-hover flex flex-col"
            >
              <FaMicrochip className="text-3xl text-white mb-6 group-hover:scale-110 transition-transform" />
              <h2 className="font-mono text-xl font-bold mb-2 text-white">TECHNOZIAN_REGISTRATION</h2>
              <p className="font-mono text-gray-400 text-sm leading-relaxed">
                Manage RFID smart-box scanner entries, real-time attendance, and walk-in event registrations
              </p>
            </Link>

            <Link
              href="/admin/freshers"
              className="group glass-panel p-8 glass-panel-hover flex flex-col"
            >
              <FaUserAstronaut className="text-3xl text-white mb-6 group-hover:scale-110 transition-transform" />
              <h2 className="font-mono text-xl font-bold mb-2 text-white">FRESHERS_REGISTRATION</h2>
              <p className="font-mono text-gray-400 text-sm leading-relaxed">
                Manage team registrations, attendance, and walk-in entries
              </p>
            </Link>

            <Link
              href="/admin/responses"
              className="group glass-panel p-8 glass-panel-hover flex flex-col"
            >
              <FaEnvelope className="text-3xl text-white mb-6 group-hover:scale-110 transition-transform" />
              <h2 className="font-mono text-xl font-bold mb-2 text-white">CONTACT_RESPONSES</h2>
              <p className="font-mono text-gray-400 text-sm leading-relaxed">
                View and manage contact form submissions from the website
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
