import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import RecruitmentConfig from "@/app/models/RecruitmentConfig";
import { isRecruitmentActive } from "@/app/lib/recruitment";

export async function GET(req, { params }) {
  try {
    const { id } = await params;

    await connectDB();
    const form = await RecruitmentConfig.findById(id).lean();

    if (!form) {
      return NextResponse.json(
        { success: false, message: "Recruitment form not found" },
        { status: 404 }
      );
    }

    if (!isRecruitmentActive(form)) {
      return NextResponse.json(
        { success: false, message: "This recruitment form is currently closed." },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data: form });
  } catch (error) {
    console.error("GET SINGLE RECRUITMENT FORM ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
