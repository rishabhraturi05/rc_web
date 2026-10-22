import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Member from "@/app/models/Member";
import { ensureDefaultMembers } from "@/app/lib/seedMembers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function classifyMember(m) {
  if (!m) return "software";

  const isAlumni = Boolean(m.isAlumni || m.alumni);
  const isProf = Boolean(m.isProf || m.professor);
  const category = String(m.category || "").trim().toLowerCase();
  const dept = String(m.department || m.dept || "").trim().toLowerCase();
  const role = String(m.role || "").trim().toLowerCase();
  const name = String(m.name || "").trim().toLowerCase();

  // Dhanvanth is in software
  if (name.includes("dhanvanth")) {
    return "software";
  }

  // 1. Alumni Section
  if (
    isAlumni ||
    category === "alumni" ||
    category === "alumini" ||
    dept === "alumni" ||
    dept === "alumini" ||
    role.includes("alumn")
  ) {
    return "alumni";
  }

  // 2. Professor Section
  if (
    isProf ||
    category === "professor" ||
    category === "prof" ||
    category === "facad" ||
    dept === "professor" ||
    dept === "prof" ||
    dept === "facad" ||
    role.includes("prof") ||
    role.includes("faculty") ||
    name.startsWith("prof")
  ) {
    return "professor";
  }

  // 3. Core Command
  if (
    category === "core" ||
    category === "secretaries" ||
    category === "addlsecretaries" ||
    dept === "core command" ||
    dept === "core" ||
    role.includes("secretary")
  ) {
    return "core";
  }

  // 4. Embedded
  if (dept === "embedded" || dept.includes("embed") || category === "embedded") {
    return "embedded";
  }

  // 5. Mechanical
  if (dept === "mechanical" || dept.includes("mech") || category === "mechanical") {
    return "mechanical";
  }

  // 6. Public Relations (PR)
  if (dept === "pr" || dept === "public relations" || dept.includes("public") || category === "pr") {
    return "pr";
  }

  // 7. Software
  if (dept === "software" || dept.includes("soft") || category === "software") {
    return "software";
  }

  return dept || "software";
}

// GET /api/members (Public endpoint for members page)
export async function GET() {
  try {
    await connectDB();
    await ensureDefaultMembers();

    const members = await Member.find({}).sort({ createdAt: 1, name: 1 }).lean();

    const grouped = {
      professor: [],
      secretaries: [],
      addlSecretaries: [],
      software: [],
      embedded: [],
      mechanical: [],
      pr: [],
      alumni: [],
    };

    members.forEach((m) => {
      if (!m) return;
      const isAlumni = Boolean(m.isAlumni || m.alumni || m.category === "alumni");
      const isProf = Boolean(
        m.isProf ||
        m.professor ||
        m.category === "professor" ||
        m.department?.toLowerCase() === "professor"
      );

      // 1. Professor
      if (isProf) {
        grouped.professor.push(m);
        return;
      }

      // 2. Alumni (populated for alumni page, excluded from active members tabs)
      if (isAlumni) {
        grouped.alumni.push(m);
        return;
      }

      const role = String(m.role || "").trim().toLowerCase();
      const dept = String(m.department || m.dept || "").trim().toLowerCase();
      const cat = String(m.category || "").trim().toLowerCase();
      const isCore = Boolean(
        m.isCore ||
        m.isAddlSec ||
        m.isGenSec ||
        cat === "core" ||
        dept === "core command" ||
        dept === "core"
      );

      const isGenSec =
        role.includes("general secretary") ||
        (isCore && (role === "secretary" || role === "gen sec"));

      const isAddlSec =
        Boolean(m.isAddlSec) ||
        role.includes("additional secretary") ||
        role.includes("addl secretary") ||
        role.includes("joint secretary") ||
        (isCore && !isGenSec);

      // 3. Put in Core Command if they are a General Secretary or Additional Secretary
      if (isGenSec) {
        grouped.secretaries.push(m);
      } else if (isAddlSec) {
        grouped.addlSecretaries.push(m);
      }

      // 4. ALSO place in technical department (Software, Embedded, Mechanical, PR)
      const name = String(m.name || "").toLowerCase();
      if (name.includes("dhanvanth")) {
        grouped.software.push(m);
      } else if (name.includes("dinesh pichaappan") || name.includes("shravya rangu")) {
        grouped.embedded.push(m);
      } else if (name.includes("soumilya dwivedi") || name.includes("mani kumar")) {
        grouped.mechanical.push(m);
      } else if (name.includes("rishabh raturi") || name.includes("aryan roy")) {
        grouped.software.push(m);
      } else if (dept === "embedded" || dept.includes("embed") || cat === "embedded") {
        grouped.embedded.push(m);
      } else if (dept === "mechanical" || dept.includes("mech") || cat === "mechanical") {
        grouped.mechanical.push(m);
      } else if (dept === "pr" || dept.includes("public") || cat === "pr") {
        grouped.pr.push(m);
      } else if (dept === "software" || dept.includes("soft") || cat === "software") {
        grouped.software.push(m);
      } else if (!isGenSec && !isAddlSec) {
        // If not in core and department is unspecified, default to software
        grouped.software.push(m);
      }
    });

    return NextResponse.json(
      {
        success: true,
        data: grouped,
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    console.error("GET /api/members error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load members" },
      { status: 500 }
    );
  }
}
