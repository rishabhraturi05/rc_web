import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // NextAuth handles session invalidation on the client side
    // This endpoint is kept for backward compatibility
    return NextResponse.json({ 
      success: true, 
      message: "Logged out successfully" 
    });
  } catch (err) {
    console.log("LOGOUT ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

