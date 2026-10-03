import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import RecruitmentConfig from "@/app/models/RecruitmentConfig";
import { isRecruitmentActive } from "@/app/lib/recruitment";

export async function GET() {
  try {
    await connectDB();

    const forms = await RecruitmentConfig.find({})
      .sort({ updatedAt: -1 })
      .lean();

    const activeForms = forms.filter((form) => isRecruitmentActive(form));

    return NextResponse.json({
      success: true,
      data: activeForms,
      count: activeForms.length,
    });
  } catch (error) {
    console.error("GET ACTIVE RECRUITMENT FORMS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
