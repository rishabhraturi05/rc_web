import { connectDB } from "@/app/lib/db";
import FreshersRegistration from "@/app/models/FreshersRegistration";

export async function POST(req) {
  try {
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
      !branch ||
      !participants?.length
    ) {
      return Response.json(
        { success: false, msg: "Missing required fields" },
        { status: 400 }
      );
    }

    const cleanedParticipants = participants
      .map((p) => p.trim())
      .filter(Boolean);

    if (cleanedParticipants.length === 0) {
      return Response.json(
        { success: false, msg: "At least one participant name is required" },
        { status: 400 }
      );
    }

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
    });

    return Response.json({ success: true, data: registration }, { status: 201 });
  } catch (err) {
    console.error("FRESHERS REGISTER ERROR:", err);

    const isDbError =
      err.message?.includes("connect") ||
      err.message?.includes("MONGODB_URI") ||
      err.name === "MongooseServerSelectionError";

    return Response.json(
      {
        success: false,
        msg: isDbError
          ? "Server could not reach the database. Please try again later."
          : err.message,
      },
      { status: isDbError ? 503 : 500 }
    );
  }
}
