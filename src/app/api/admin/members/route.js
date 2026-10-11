import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { connectDB } from "@/app/lib/db";
import Member from "@/app/models/Member";
import { ensureDefaultMembers, removeDuplicateMembers } from "@/app/lib/seedMembers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function validateAdmin() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "admin") {
    return {
      session: null,
      response: NextResponse.json(
        { success: false, message: "Unauthorized: Admin privileges required" },
        { status: 401 }
      ),
    };
  }

  return { session, response: null };
}

// GET /api/admin/members
export async function GET(request) {
  try {
    const { response } = await validateAdmin();
    if (response) return response;

    await connectDB();
    await ensureDefaultMembers();
    await removeDuplicateMembers();

    const members = await Member.find({}).sort({ createdAt: -1, name: 1 }).lean();

    // Deduplicate in response
    const seen = new Set();
    const uniqueMembers = [];
    for (const m of members) {
      const key = (m.name || "").trim().toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        uniqueMembers.push(m);
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: uniqueMembers,
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    console.error("GET /api/admin/members error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load members" },
      { status: 500 }
    );
  }
}

// POST /api/admin/members
export async function POST(request) {
  try {
    const { session, response } = await validateAdmin();
    if (response) return response;

    await connectDB();

    const body = await request.json();
    const {
      name,
      department = "Software",
      category = "member",
      role = "Member",
      year = "",
      rollNumber = "",
      email = "",
      phone = "",
      img = "",
      linkedin = "",
      instagram = "",
      bio = "",
      points = "",
      comments = "",
      positiveRemarks = [],
      negativeRemarks = [],
      feedback = "",
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Member name is required" },
        { status: 400 }
      );
    }

    const cleanCategory = String(category || "").toLowerCase();
    const cleanDept = String(department || "").trim();

    const isAlumni =
      body.isAlumni === true ||
      cleanCategory === "alumni" ||
      cleanDept.toLowerCase() === "alumni" ||
      role.toLowerCase().includes("alumn");

    const isProf =
      body.isProf === true ||
      cleanCategory === "professor" ||
      cleanCategory === "prof" ||
      cleanDept.toLowerCase() === "professor" ||
      cleanDept.toLowerCase() === "faculty" ||
      role.toLowerCase().includes("faculty") ||
      role.toLowerCase().includes("prof");

    const isCore =
      Boolean(body.isCore) ||
      cleanCategory === "core" ||
      cleanDept === "Core Command" ||
      role.toLowerCase().includes("secretary");

    const isAddlSec =
      Boolean(body.isAddlSec) ||
      role.toLowerCase().includes("additional secretary") ||
      role.toLowerCase().includes("addl secretary") ||
      role.toLowerCase().includes("joint secretary");

    const hasEvaluation =
      (positiveRemarks && positiveRemarks.length > 0) ||
      (negativeRemarks && negativeRemarks.length > 0) ||
      (points && String(points).trim() !== "") ||
      (comments && String(comments).trim() !== "");

    const newMember = await Member.create({
      name: name.trim(),
      department: isAlumni ? "Alumni" : isProf ? "Professor" : cleanDept || "Software",
      category: isAlumni ? "alumni" : isProf ? "professor" : isCore ? "core" : "member",
      isAlumni,
      isProf,
      isCore,
      isAddlSec,
      role: role.trim() || (isProf ? "Faculty Advisor" : isAlumni ? "Alumnus" : isAddlSec ? "Additional Secretary" : "Member"),
      year: year.trim(),
      rollNumber: rollNumber.trim(),
      email: email.trim(),
      phone: phone.trim(),
      img: img.trim(),
      linkedin: linkedin.trim(),
      instagram: instagram.trim(),
      bio: bio.trim(),
      points: points !== undefined && points !== null ? String(points).trim() : "",
      comments: comments ? String(comments).trim() : "",
      positiveRemarks: Array.isArray(positiveRemarks) ? positiveRemarks : [],
      negativeRemarks: Array.isArray(negativeRemarks) ? negativeRemarks : [],
      feedback: feedback ? String(feedback).trim() : "",
      evaluatedBy: hasEvaluation ? session.user?.username || "admin" : "",
      evaluatedAt: hasEvaluation ? new Date() : null,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Member added successfully",
        data: newMember,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/members error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to add member" },
      { status: 500 }
    );
  }
}
