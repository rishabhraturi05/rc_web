// Central configuration for Freshers Event
// All event content, dates, venues, trailer links, and rules are managed here.
// Update placeholders when official event details are confirmed.

export const freshersEvent = {
  eventName: "RC NITW FRESHERS 2026",
  eventSubtitle: "Robotics Club NIT Warangal presents the ultimate spaceship adventure!",
  tagline: "EMERGENCY MEETING: JOIN THE CREW OR BE LEFT IN THE VENT",
  eventDate: "TBD — EVENT DATE",
  eventTime: "TBD — EVENT TIME",
  venue: "TBD — VENUE",
  registrationDeadline: "TBD — REGISTRATION DEADLINE",
  registrationOpen: true,
  prizes: "TBD — EXCITING PRIZES & CERTIFICATES",
  teamSize: "6 Crewmates per Team",
  eligibility: "All First-Year Students of NIT Warangal",

  // Media
  posterUrl: "/freshers/posters/event-poster.webp", // Drop asset in public/freshers/posters/
  trailerUrl: "", // Add video URL or /freshers/trailers/event-trailer.mp4 when available

  // Mission Overview / Description
  description:
    "Prepare for an immersive, tech-driven freshers experience inspired by Among Us! Navigate through interactive task stations, solve robotics puzzles, identify impostors, and experience life inside the Robotics Club NITW spaceship.",

  // Rules list for Rules Terminal
  rules: [
    "01. Teams must contain 6 members. Individual participants will be merged into teams.",
    "02. Time Commitment: Expect Round 1 to take 1.5 hours. Squads that qualify for Round 2 will need at least another 30 minutes.",
    "03. Arriving late, violating game rules, unsportsmanlike behavior, or task tampering will lead to immediate ejection.",
    "04. Phones are strictly for scanning tasks and event verification.",
    "05. All decisions made by the organising team are final.",
  ],

  // Task list for Task Navigation
  tasks: [
    { id: "lobby", label: "COSMIC LOBBY", icon: "🚀", category: "OVERVIEW" },
    { id: "register", label: "SUBMIT CREWMATE DATA", icon: "💳", category: "CRITICAL" },
    { id: "intel", label: "EVENT INTEL", icon: "📡", category: "BRIEFING" },
    { id: "map", label: "SECURITY MAP", icon: "🗺️", category: "NAV" },
    { id: "rules", label: "MISSION RULES", icon: "📜", category: "ADMIN" },
    { id: "comms", label: "COMMUNICATIONS", icon: "📻", category: "CREW" },
  ],
};
