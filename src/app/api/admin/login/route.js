import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { connectDB } from "@/app/lib/db";
import Admin from "@/app/models/admin";

export async function POST(req) {
  try {
    await connectDB();
    const { username, password } = await req.json();

    const adminUser = await Admin.findOne({ username });
    if (!adminUser)
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );

    const isMatch = await bcrypt.compare(password, adminUser.password);
    if (!isMatch)
      return NextResponse.json(
        { success: false, message: "Invalid password" },
        { status: 401 }
      );

    // Create JWT token
    const token = jwt.sign(
      { id: adminUser._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Set cookie
    const response = NextResponse.json({ success: true });

    response.cookies.set("adminToken", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (err) {
    console.log("LOGIN ERROR:", err);   // ADD THIS TO DEBUG
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
