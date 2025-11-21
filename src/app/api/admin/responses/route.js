import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/app/lib/db";
import Contact from "@/app/models/ContactResponse";

export async function GET(req) {
  try {
    // Verify admin token
    const token = req.cookies.get("adminToken")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    await connectDB();

    // Fetch all responses, sorted by most recent first
    const responses = await Contact.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: responses });
  } catch (err) {
    console.log("FETCH RESPONSES ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
