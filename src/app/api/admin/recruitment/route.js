import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { connectDB } from "@/app/lib/db";
import RecruitmentConfig from "@/app/models/RecruitmentConfig";
import RecruitmentApplication from "@/app/models/RecruitmentApplication";
import { DEFAULT_YEAR_OPTIONS, getRecruitmentFormTitle, normalizeRecruitmentConfig } from "@/app/lib/recruitment";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

export async function GET() {
  try {
    const authResult = await validateAdmin();
    if (authResult.response) return authResult.response;

    await connectDB();

    const forms = await RecruitmentConfig.find({}).sort({ updatedAt: -1 }).lean();

    const enrichedForms = await Promise.all(
      forms.map(async (form) => {
        const applicantCount = await RecruitmentApplication.countDocuments({ formId: form._id });
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
          applicantCount,
        };
      })
    );

    return NextResponse.json(
      { success: true, data: enrichedForms },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    console.error("GET RECRUITMENT FORMS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const authResult = await validateAdmin();
    if (authResult.response) return authResult.response;

    const body = await req.json();
    const normalized = normalizeRecruitmentConfig(body);

    if (!Array.isArray(normalized.fields) || normalized.fields.length === 0) {
      return NextResponse.json(
        { success: false, message: "At least one field is required." },
        { status: 400 }
      );
    }

    if (!Array.isArray(normalized.departments) || normalized.departments.length === 0) {
      return NextResponse.json(
        { success: false, message: "At least one department is required." },
        { status: 400 }
      );
    }

    if (!Array.isArray(normalized.years) || normalized.years.length === 0) {
      return NextResponse.json(
        { success: false, message: "At least one eligible year is required." },
        { status: 400 }
      );
    }

    await connectDB();

    const doc = {
      title: normalized.title,
      isOpen: Boolean(normalized.isOpen),
      deadline: normalized.deadline,
      fields: normalized.fields,
      departments: normalized.departments,
      years: normalized.years,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    let form;
    try {
      const insertResult = await RecruitmentConfig.collection.insertOne(doc);
      form = { _id: insertResult.insertedId, ...doc };
    } catch {
      form = await RecruitmentConfig.create(doc);
    }

    return NextResponse.json(
      { success: true, data: form },
      {
        status: 201,
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  } catch (error) {
    console.error("CREATE RECRUITMENT FORM ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
