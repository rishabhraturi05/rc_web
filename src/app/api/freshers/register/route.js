import { connectDB } from "@/app/lib/db";
import FreshersRegistration from "@/app/models/FreshersRegistration";
import { isCountdownActive } from "@/app/freshers/lib/countdownHelper";

export async function POST(req) {
  try {
    if (isCountdownActive()) {
      return Response.json(
        {
          success: false,
          msg: "SECURITY LOCKOUT: Registration is currently locked! Please wait for the countdown timer to expire.",
        },
        { status: 403 }
      );
    }

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

    const trimmedRollNo = rollNo.trim().toUpperCase();
    const trimmedEmail = email.trim().toLowerCase();

    // Clean and normalize participants data [{ name, rollNo }]
    const cleanedParticipants = participants
      .map((p) => {
        if (typeof p === "string") {
          return { name: p.trim(), rollNo: "" };
        }
        return {
          name: p.name ? p.name.trim() : "",
          rollNo: p.rollNo ? p.rollNo.trim().toUpperCase() : "",
        };
      })
      .filter((p) => p.name.length > 0);

    if (cleanedParticipants.length === 0) {
      return Response.json(
        { success: false, msg: "At least one participant name is required" },
        { status: 400 }
      );
    }

    // Check if any participant is missing a roll number
    const missingParticipantRoll = cleanedParticipants.some((p) => !p.rollNo);
    if (missingParticipantRoll) {
      return Response.json(
        { success: false, msg: "Roll Number is required for all team participants" },
        { status: 400 }
      );
    }

    // Collect all submitted roll numbers in this registration
    const allSubmittedRolls = [
      trimmedRollNo,
      ...cleanedParticipants.map((p) => p.rollNo),
    ].filter(Boolean);

    // 1. Check for internal duplicate roll numbers within the submitted form
    const uniqueSubmittedRolls = new Set(allSubmittedRolls);
    if (uniqueSubmittedRolls.size !== allSubmittedRolls.length) {
      return Response.json(
        {
          success: false,
          msg: "Duplicate Roll Numbers detected within your form entries! Each team participant must have a unique Roll Number.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // 2. Check if Email is already registered
    const existingEmail = await FreshersRegistration.findOne({
      email: trimmedEmail,
    });
    if (existingEmail) {
      return Response.json(
        {
          success: false,
          msg: `Email '${trimmedEmail}' is already registered in team '${existingEmail.teamName}'!`,
        },
        { status: 409 }
      );
    }

    // 3. Check if ANY submitted Roll Number (Leader or Member) already exists in DB
    const existingRoll = await FreshersRegistration.findOne({
      $or: [
        { rollNo: { $in: allSubmittedRolls } },
        { "participants.rollNo": { $in: allSubmittedRolls } },
      ],
    });

    if (existingRoll) {
      // Identify which specific roll number was duplicated
      let matchedRoll = trimmedRollNo;
      if (allSubmittedRolls.includes(existingRoll.rollNo)) {
        matchedRoll = existingRoll.rollNo;
      } else if (Array.isArray(existingRoll.participants)) {
        const found = existingRoll.participants.find(
          (p) =>
            typeof p === "object" &&
            p.rollNo &&
            allSubmittedRolls.includes(p.rollNo.toUpperCase())
        );
        if (found) matchedRoll = found.rollNo;
      }

      return Response.json(
        {
          success: false,
          msg: `Roll Number '${matchedRoll}' is already registered in team '${existingRoll.teamName}'! Duplicate registrations are not allowed.`,
        },
        { status: 409 }
      );
    }

    const registration = await FreshersRegistration.create({
      teamName: teamName.trim(),
      name: name.trim(),
      email: trimmedEmail,
      contactNo: contactNo.trim(),
      rollNo: trimmedRollNo,
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
