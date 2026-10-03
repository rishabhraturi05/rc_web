// Central configuration for Freshers Event
// Updated for Post-Event Celebration & Gallery Archive

export const freshersEvent = {
  eventName: "Project Skeld",
  eventSubtitle: "Robotics Club NIT Warangal presents Project Skeld — Mission Accomplished! Relive the highlights, victory podium, and security camera archives.",
  tagline: "MISSION ACCOMPLISHED: CREW CELEBRATION & GALLERY ARCHIVE",

  // Media
  posterUrl: "/freshers/posters/event-poster.webp",
  trailerUrl: "",

  // Mission Overview / Description
  description:
    "An unforgettable, tech-driven freshers experience inspired by Among Us! Freshers navigated through robotics task stations, solved engineering challenges, uncovered impostors, and celebrated victory inside the Robotics Club NITW spaceship.",

  // Nav shortcuts
  tasks: [
    { id: "podium", label: "VICTORY PODIUM", icon: "🏆", category: "AWARDS" },
    { id: "gallery", label: "SECURITY ARCHIVE", icon: "📷", category: "CCTV" },
  ],
};

// =========================================================================
// OFFICIAL WINNERS CONFIGURATION (EXACTLY 6 WINNERS: 1 IMPOSTOR + 5 CREWMATES)
// Note: Edit the winner and squad names below. No points or scores.
// =========================================================================
export const winnersConfig = {
  impostor: {
    name: "Rudra Shah",
    team: "O2 Technicians",
    title: "IMPOSTOR WINNER",
    badge: "SABOTEUR MASTERMIND",
    color: "#ef4444",
    shadowColor: "#991b1b",
    hat: "horns", // "crown" | "horns" | "mini" | "sprout" | "party" | "dum"
  },
  crewmates: [
    {
      id: 1,
      number: 1,
      name: "Dhruv",
      team: "THE SUS TEAM",
      badge: "CREW LEADER",
      color: "#06b6d4", // Cyan
      shadowColor: "#0e7490",
      hat: "crown",
    },
    {
      id: 2,
      number: 2,
      name: "Aishwarya",
      team: "THE SUS TEAM",
      badge: "TASK MASTER",
      color: "#22c55e", // Lime / Green
      shadowColor: "#15803d",
      hat: "sprout",
    },
    {
      id: 3,
      number: 3,
      name: "Pranav",
      team: "THE SUS TEAM",
      badge: "SECURITY CHIEF",
      color: "#eab308", // Yellow
      shadowColor: "#a16207",
      hat: "mini",
    },
    {
      id: 4,
      number: 4,
      name: "Srimedha",
      team: "THE SUS TEAM",
      badge: "REACTOR TECH",
      color: "#a855f7", // Purple
      shadowColor: "#7e22ce",
      hat: "party",
    },
    {
      id: 5,
      number: 5,
      name: "Keerthana",
      team: "THE SUS TEAM",
      badge: "MEDBAY OPERATOR",
      color: "#ec4899", // Pink
      shadowColor: "#be185d",
      hat: "dum",
    },
  ],
};


