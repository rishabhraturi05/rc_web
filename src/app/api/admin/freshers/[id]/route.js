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

export async function PUT(req, { params }) {
  try {
    const authResult = await validateAdmin();
    if (authResult.response) return authResult.response;

    await connectDB();
    const { id } = await params;
    const { attended, isDeleted } = await req.json();

    const updateData = {};
    if (attended !== undefined) updateData.attended = !!attended;
    if (isDeleted !== undefined) updateData.isDeleted = !!isDeleted;

    const updated = await FreshersRegistration.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Team not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.log("UPDATE FRESHERS ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const authResult = await validateAdmin();
    if (authResult.response) return authResult.response;

    await connectDB();
    const { id } = await params;
    
    const url = new URL(req.url);
    const permanent = url.searchParams.get("permanent");

    let deleted;
    if (permanent === "true") {
      deleted = await FreshersRegistration.findByIdAndDelete(id);
    } else {
      deleted = await FreshersRegistration.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    }

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Team not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Team deleted" });
  } catch (err) {
    console.log("DELETE FRESHERS ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
