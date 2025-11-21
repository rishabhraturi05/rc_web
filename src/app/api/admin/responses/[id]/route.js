import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/app/lib/db";
import Contact from "@/app/models/ContactResponse";

async function validateAdmin(req) {
  const token = req.cookies.get("adminToken")?.value;
  if (!token) {
    return {
      response: NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return {
      response: NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      ),
    };
  }

  return { response: null };
}

export async function PUT(req, { params }) {
  try {
    const authResult = await validateAdmin(req);
    if (authResult.response) {
      return authResult.response;
    }

    await connectDB();
    const { id } = params;
    const { isSpecial } = await req.json();

    // Update the response's special status
    const updatedResponse = await Contact.findByIdAndUpdate(
      id,
      { isSpecial },
      { new: true }
    );

    if (!updatedResponse) {
      return NextResponse.json(
        { success: false, message: "Response not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedResponse });
  } catch (err) {
    console.log("UPDATE RESPONSE ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const authResult = await validateAdmin(req);
    if (authResult.response) {
      return authResult.response;
    }

    await connectDB();
    const { id } = params;

    const deletedResponse = await Contact.findByIdAndDelete(id);

    if (!deletedResponse) {
      return NextResponse.json(
        { success: false, message: "Response not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Response deleted" });
  } catch (err) {
    console.log("DELETE RESPONSE ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

