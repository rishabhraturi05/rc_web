import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const response = NextResponse.json({ success: true, message: "Logged out successfully" });
    
    // Clear the adminToken cookie
    response.cookies.set("adminToken", "", {
      httpOnly: true,
      secure: true,
      path: "/",
      maxAge: 0, // Expire immediately
    });

    return response;
  } catch (err) {
    console.log("LOGOUT ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

