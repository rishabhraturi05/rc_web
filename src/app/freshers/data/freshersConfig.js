// Central configuration for Freshers Event
// All event content, dates, venues, trailer links, and rules are managed here.
// Update placeholders when official event details are confirmed.

export const freshersEvent = {
  eventName: "RC NITW FRESHERS 2026",
  eventSubtitle: "Robotics Club NIT Warangal presents the ultimate spaceship adventure!",
  tagline: "EMERGENCY MEETING: JOIN THE CREW OR BE LEFT IN THE VENT",
  eventDate: "TBD — EVENT DATE",
  eventTime: "TBD — EVENT TIME",
  venue: "TBD — VENUE (Seminar Hall / SAC)",
  registrationDeadline: "TBD — REGISTRATION DEADLINE",
  registrationOpen: true,
  prizes: "TBD — EXCITING PRIZES & CERTIFICATES",
  teamSize: "3 to 6 Crewmates per Team",
  eligibility: "All First-Year Students of NIT Warangal",

  // Media
  posterUrl: "/freshers/posters/event-poster.webp", // Drop asset in public/freshers/posters/
  trailerUrl: "", // Add video URL or /freshers/trailers/event-trailer.mp4 when available

  // Mission Overview / Description
  description:
    "Prepare for an immersive, tech-driven freshers experience inspired by Among Us! Navigate through interactive task stations, solve robotics puzzles, identify impostors, and experience life inside the Robotics Club NITW spaceship.",

  // Rules list for Rules Terminal
  rules: [
    "01. All crewmates must present a valid NIT Warangal Student ID Card at entry.",
    "02. Teams must contain between 3 to 6 members. Individual participants will be merged into teams.",
    "03. Late arrivals after mission launch time may forfeit their task slots.",
    "04. Impostor tactics, unsportsmanlike behavior, or task tampering will lead to immediate ejection.",
    "05. Mobile phones are allowed only for event task verification.",
    "06. The decisions of the RC Flight Command (Organizers) are final and binding.",
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
