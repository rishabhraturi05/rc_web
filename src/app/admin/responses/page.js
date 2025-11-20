"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaStar, FaRegStar } from 'react-icons/fa';

const Responses = () => {
  const router = useRouter();
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchResponses();
  }, []);

  const fetchResponses = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/responses");
      const data = await res.json();

      if (data.success) {
        setResponses(data.data);
      } else {
        alert(data.message || "Failed to fetch responses");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Failed to fetch responses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/admin/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (data.success) {
        router.push("/admin/login");
      } else {
        alert(data.message || "Logout failed");
      }
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

  return (
    <div className="relative min-h-screen text-white">
      {/* Header Section with Logout Button */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="batman-font text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-2">
              Admin Responses
            </h1>
            <p className="destruct-font text-gray-300 text-lg sm:text-xl">
              View and manage contact form responses
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 batman-font text-base tracking-wide"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="bg-gray-900/50 border border-gray-700/80 rounded-2xl p-6 sm:p-8 text-center">
              <p className="destruct-font text-gray-300 text-lg">Loading responses...</p>
            </div>
          ) : responses.length === 0 ? (
            <div className="bg-gray-900/50 border border-gray-700/80 rounded-2xl p-6 sm:p-8 text-center">
              <p className="destruct-font text-gray-300 text-lg">No responses found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {responses.map((response) => (
                <div
                  key={response._id}
                  className={`bg-gray-900/50 border rounded-2xl p-6 sm:p-8 transition-all duration-300 ${
                    response.isSpecial
                      ? "border-yellow-500/80 bg-gray-900/70"
                      : "border-gray-700/80"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <h3 className="batman-font text-xl sm:text-2xl font-bold text-white">
                          {response.name}
                        </h3>
                        <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-lg text-sm destruct-font border border-blue-600/30">
                          {getQueryTypeLabel(response.queryType)}
                        </span>
                        {response.isSpecial && (
                          <span className="px-3 py-1 bg-yellow-600/20 text-yellow-400 rounded-lg text-sm destruct-font border border-yellow-600/30">
                            Special
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 mb-4 destruct-font text-gray-300">
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
                        <p className="destruct-font text-white leading-relaxed whitespace-pre-wrap">
                          {response.message}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleSpecial(response._id, response.isSpecial)}
                      disabled={updating === response._id}
                      className={`flex-shrink-0 p-3 rounded-lg transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                        response.isSpecial
                          ? "text-yellow-400 hover:text-yellow-300"
                          : "text-gray-400 hover:text-yellow-400"
                      } ${updating === response._id ? "opacity-50 cursor-not-allowed" : ""}`}
                      title={response.isSpecial ? "Remove from special" : "Mark as special"}
                    >
                      {response.isSpecial ? (
                        <FaStar size={24} />
                      ) : (
                        <FaRegStar size={24} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Responses;