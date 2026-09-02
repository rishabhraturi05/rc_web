"use client";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { FaStar, FaRegStar, FaTrash, FaArrowLeft } from 'react-icons/fa';

const Responses = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  const checkAuth = useCallback(async () => {
    // Check if session is loading
    if (status === "loading") {
      return;
    }

    // Check if user is authenticated
    if (status === "unauthenticated" || !session || session.user?.role !== "admin") {
      router.push("/admin/login");
      return;
    }

    // If authenticated, fetch responses
    try {
      const res = await fetch("/api/admin/responses");
      const data = await res.json();

      if (!data.success && res.status === 401) {
        router.push("/admin/login");
        return;
      }

      if (data.success) {
        setResponses(
          [...data.data].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )
        );
      } else {
        alert(data.message || "Failed to fetch responses");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  }, [router, session, status]);

  useEffect(() => {
    // Check authentication before fetching responses
    checkAuth();
  }, [checkAuth]);



  const handleToggleSpecial = async (id, currentStatus) => {
    try {
      setUpdating(id);
      const res = await fetch(`/api/admin/responses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSpecial: !currentStatus }),
      });

      const data = await res.json();

      if (data.success) {
        // Update the response in the local state
        setResponses((prev) =>
          prev.map((response) =>
            response._id === id ? { ...response, isSpecial: !currentStatus } : response
          )
        );
      } else {
        alert(data.message || "Failed to update response");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update response. Please try again.");
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteResponse = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this response? This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      setDeleting(id);
      const res = await fetch(`/api/admin/responses/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        setResponses((prev) => prev.filter((response) => response._id !== id));
      } else {
        alert(data.message || "Failed to delete response");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete response. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getQueryTypeLabel = (queryType) => {
    const labels = {
      general: "General Inquiry",
      membership: "Membership",
      events: "Events",
      projects: "Projects",
      collaboration: "Collaboration",
      others: "Others",
    };
    return labels[queryType] || queryType;
  };

  const sortedResponses = useMemo(
    () => [...responses].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [responses]
  );

  const savedResponses = useMemo(
    () => sortedResponses.filter((response) => response.isSpecial),
    [sortedResponses]
  );

  const otherResponses = useMemo(
    () => sortedResponses.filter((response) => !response.isSpecial),
    [sortedResponses]
  );

  const renderResponseCard = (response) => (
    <div
      key={response._id}
      className={`glass-panel p-6 sm:p-8 transition-all duration-300 ${response.isSpecial
          ? "border-white bg-white/5"
          : "border-white/20"
        }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <h3 className="font-mono text-xl sm:text-2xl font-bold text-white">
              {response.name}
            </h3>
            <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-lg text-sm font-mono border border-blue-600/30">
              {getQueryTypeLabel(response.queryType)}
            </span>
            {response.isSpecial && (
              <span className="px-3 py-1 bg-yellow-600/20 text-yellow-400 rounded-lg text-sm font-mono border border-yellow-600/30">
                Special
              </span>
            )}
          </div>

          <div className="space-y-2 mb-4 font-mono text-gray-300">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Email:</span>
              <a
                href={`mailto:${response.email}`}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                {response.email}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Phone:</span>
              <a
                href={`tel:${response.phone}`}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                {response.phone}
              </a>
            </div>
            {response.queryType === "others" && response.otherQuery && (
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Query Type:</span>
                <span className="text-white">{response.otherQuery}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Date:</span>
              <span className="text-white">{formatDate(response.createdAt)}</span>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <p className="font-mono text-white leading-relaxed whitespace-pre-wrap">
              {response.message}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => handleToggleSpecial(response._id, response.isSpecial)}
            disabled={updating === response._id}
            className={`p-3 rounded-lg transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${response.isSpecial
                ? "text-yellow-400 hover:text-yellow-300"
                : "text-gray-400 hover:text-yellow-400"
              } ${updating === response._id ? "opacity-50 cursor-not-allowed" : ""}`}
            title={response.isSpecial ? "Remove from special" : "Mark as special"}
            aria-label={response.isSpecial ? "Remove from special" : "Mark as special"}
          >
            {response.isSpecial ? <FaStar size={24} /> : <FaRegStar size={24} />}
          </button>
          <button
            onClick={() => handleDeleteResponse(response._id)}
            disabled={deleting === response._id}
            className={`p-3 rounded-lg transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 text-red-400 hover:text-red-300 ${deleting === response._id ? "opacity-50 cursor-not-allowed" : ""
              }`}
            title="Delete response"
            aria-label="Delete response"
          >
            <FaTrash size={22} />
          </button>
        </div>
      </div>
    </div>
  );

  // Show loading while checking session
  if (status === "loading") {
    return (
      <div className="relative min-h-screen text-white">
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 pt-24 pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gray-900/50 border border-gray-700/80 rounded-2xl p-6 sm:p-8 text-center">
              <p className="font-mono text-gray-300 text-lg">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated (handled by middleware, but just in case)
  if (status === "unauthenticated" || !session || session.user?.role !== "admin") {
    return null;
  }

  return (
    <div className="relative min-h-screen text-white">
      {/* Header Section with Logout Button */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <div className="max-w-7xl mx-auto flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <Link href="/admin" className="inline-flex items-center gap-2 text-gray-400 hover:text-white font-mono text-sm mb-3 transition-colors">
                <FaArrowLeft size={12} /> Back to Admin Panel
              </Link>
              <h1 className="font-mono text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-2">
                Admin Responses
              </h1>
              <p className="font-mono text-gray-300 text-lg sm:text-xl">
                View and manage contact form responses
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowSavedOnly((prev) => !prev)}
                className={`mx-2 px-6 py-2 border font-mono rounded transition-colors uppercase text-sm tracking-widest ${showSavedOnly
                    ? "bg-white text-black border-white"
                    : "bg-transparent text-white border-white/50 hover:border-white"
                  }`}
              >
                {showSavedOnly ? "All Messages" : "Saved Messages"}
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-transparent border border-white text-white font-mono rounded hover:bg-white hover:text-black transition-colors uppercase text-sm tracking-widest"
              >
                [ LOGOUT ]
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="glass-panel p-6 sm:p-8 text-center">
              <p className="font-mono text-gray-300 text-lg animate-pulse">Loading responses[...]_</p>
            </div>
          ) : sortedResponses.length === 0 ? (
            <div className="glass-panel p-6 sm:p-8 text-center">
              <p className="font-mono text-gray-300 text-lg">No responses found.</p>
            </div>
          ) : showSavedOnly ? (
            <div className="space-y-8">
              <section className="space-y-4">
                <div>
                  <h2 className="font-mono text-3xl font-bold mb-2">Saved Messages</h2>
                  <p className="font-mono text-gray-300">Newest saved responses first</p>
                </div>
                {savedResponses.length === 0 ? (
                  <div className="glass-panel p-6 sm:p-8 text-center">
                    <p className="font-mono text-gray-300 text-lg">
                      No saved responses available.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {savedResponses.map((response) => renderResponseCard(response))}
                  </div>
                )}
              </section>
            </div>
          ) : (
            <div className="space-y-8">
              <section className="space-y-4">
                <div>
                  <h2 className="font-mono text-3xl font-bold mb-2">All Messages</h2>
                  <p className="font-mono text-gray-300">
                    All responses in newest-first order
                  </p>
                </div>
                <div className="space-y-4">
                  {sortedResponses.map((response) => renderResponseCard(response))}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Responses;