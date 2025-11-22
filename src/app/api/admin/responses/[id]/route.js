import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { connectDB } from "@/app/lib/db";
import Contact from "@/app/models/ContactResponse";

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

export async function PUT(req, { params }) {
  try {
    const authResult = await validateAdmin();
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
    const authResult = await validateAdmin();
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

