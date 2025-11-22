import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { connectDB } from "@/app/lib/db";
import Contact from "@/app/models/ContactResponse";

export async function GET(req) {
  try {
    // Verify admin session using NextAuth
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
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
