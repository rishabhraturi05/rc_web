import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import RecruitmentConfig from "@/app/models/RecruitmentConfig";
import {
  DEFAULT_YEAR_OPTIONS,
  ensureDefaultRecruitmentFields,
  getRecruitmentFormTitle,
  isRecruitmentActive,
} from "@/app/lib/recruitment";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    await connectDB();

    const forms = await RecruitmentConfig.find({})
      .sort({ updatedAt: -1 })
      .lean();

    const activeForms = forms
      .filter((form) => isRecruitmentActive(form))
      .map((form) => {
        const years = Array.isArray(form.years) && form.years.length
          ? form.years
          : DEFAULT_YEAR_OPTIONS;
        const title = (form.title && form.title.trim())
          ? form.title.trim()
          : getRecruitmentFormTitle({ ...form, years });
        return {
          ...form,
          years,
          title,
          fields: ensureDefaultRecruitmentFields(form.fields || []),
        };
      });

    return NextResponse.json(
      {
        success: true,
        data: activeForms,
        count: activeForms.length,
      },
      {
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  } catch (error) {
    console.error("GET ACTIVE RECRUITMENT FORMS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
