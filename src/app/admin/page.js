"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { FaEnvelope, FaUserAstronaut, FaKey } from "react-icons/fa";
import ChangeCredentialsModal from "@/app/components/ChangeCredentialsModal";

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [credsModalOpen, setCredsModalOpen] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated" || session?.user?.role !== "admin") {
      router.push("/admin/login");
    }
  }, [status, session, router]);

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

  if (status === "unauthenticated" || session?.user?.role !== "admin") {
    return null;
  }

  return (
    <div className="relative min-h-screen text-white">
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
            <div>
              <h1 className="font-mono text-4xl sm:text-5xl font-bold tracking-tight mb-2 text-white">
                {">_"} ADMIN_PANEL
              </h1>
              <p className="font-mono text-gray-400 text-lg">
                Welcome, {session.user?.username || "sysadmin"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setCredsModalOpen(true)}
                className="px-5 py-2 bg-white/10 border border-white/30 text-white font-mono rounded hover:bg-white hover:text-black transition-colors uppercase text-sm tracking-widest flex items-center gap-2 cursor-pointer"
                title="Change User ID and Password"
              >
                <FaKey className="text-cyan-400" />
                [ CREDENTIALS ]
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-transparent border border-white text-white font-mono rounded hover:bg-white hover:text-black transition-colors uppercase text-sm tracking-widest cursor-pointer"
              >
                [ LOGOUT ]
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
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
              href="/admin/recruitment"
              className="group glass-panel p-8 glass-panel-hover flex flex-col sm:col-span-2"
            >
              <FaUserAstronaut className="text-3xl text-white mb-6 group-hover:scale-110 transition-transform" />
              <h2 className="font-mono text-xl font-bold mb-2 text-white">RECRUITMENT_MANAGEMENT</h2>
              <p className="font-mono text-gray-400 text-sm leading-relaxed">
                Create and manage multiple recruitment forms, deadlines, departments, and applications
              </p>
            </Link>
          </div>
        </div>
      </div>
      {/* Change Credentials Modal */}
      <ChangeCredentialsModal
        isOpen={credsModalOpen}
        onClose={() => setCredsModalOpen(false)}
        session={session}
      />
    </div>
  );
}
