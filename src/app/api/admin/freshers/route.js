import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { connectDB } from "@/app/lib/db";
import FreshersRegistration from "@/app/models/FreshersRegistration";

async function validateAdmin() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "admin") {
    return {
      response: NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  return { response: null };
}

export async function GET() {
  try {
    const authResult = await validateAdmin();
    if (authResult.response) return authResult.response;

    await connectDB();

    const teams = await FreshersRegistration.find({})
      .sort({ createdAt: -1 })
      .lean();

    const activeTeams = teams.filter(t => !t.isDeleted);
    const totalTeams = activeTeams.length;
    const totalAttended = activeTeams.filter((t) => t.attended).length;
    const totalParticipants = activeTeams.reduce(
      (sum, t) => sum + 1 + (t.participants?.length || 0),
      0
    );

    return NextResponse.json({
      success: true,
      data: teams,
      stats: { totalTeams, totalAttended, totalParticipants },
    });
  } catch (err) {
    console.log("GET FRESHERS ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const authResult = await validateAdmin();
    if (authResult.response) return authResult.response;

    const body = await req.json();
    const {
      teamName,
      name,
      email,
      contactNo,
      rollNo,
      branch,
      participants,
      considerRecruitment,
    } = body;

    if (
      !teamName ||
      !name ||
      !email ||
      !contactNo ||
      !rollNo ||
      !branch
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const rawParticipants = Array.isArray(participants) ? participants : [];
    const cleanedParticipants = rawParticipants
      .map((p) => (typeof p === "string" ? p.trim() : (p?.name || "").trim()))
      .filter(Boolean);

    await connectDB();

    const registration = await FreshersRegistration.create({
      teamName: teamName.trim(),
      name: name.trim(),
      email: email.trim(),
      contactNo: contactNo.trim(),
      rollNo: rollNo.trim(),
      branch: branch.trim(),
      participants: cleanedParticipants,
      considerRecruitment: !!considerRecruitment,
      isWalkIn: true,
    });

    return NextResponse.json({ success: true, data: registration }, { status: 201 });
  } catch (err) {
    console.log("POST FRESHERS ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
