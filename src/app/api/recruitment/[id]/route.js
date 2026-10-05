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

    const years = Array.isArray(form.years) && form.years.length
      ? form.years
      : DEFAULT_YEAR_OPTIONS;
    const title = (form.title && form.title.trim())
      ? form.title.trim()
      : getRecruitmentFormTitle({ ...form, years });

    return NextResponse.json(
      {
        success: true,
        data: {
          ...form,
          years,
          title,
          fields: ensureDefaultRecruitmentFields(form.fields || []),
        },
      },
      {
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  } catch (error) {
    console.error("GET SINGLE RECRUITMENT FORM ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
