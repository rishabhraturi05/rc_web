import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { connectDB } from "@/app/lib/db";
import RecruitmentConfig from "@/app/models/RecruitmentConfig";
import RecruitmentApplication from "@/app/models/RecruitmentApplication";
import { DEFAULT_YEAR_OPTIONS, getRecruitmentFormTitle } from "@/app/lib/recruitment";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user?.role !== "addsec" && session.user?.role !== "admin")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Additional Secretary access required." },
        { status: 401 }
      );
    }

    const userDepartment = session.user?.department;
    await connectDB();

    const formQuery = userDepartment ? { departments: userDepartment } : {};
    const forms = await RecruitmentConfig.find(formQuery).lean();

    const formIds = forms.map((f) => f._id);
    const appQuery = { formId: { $in: formIds } };
    if (userDepartment) {
      appQuery.department = userDepartment;
    }

    const applications = await RecruitmentApplication.find(appQuery)
      .sort({ createdAt: -1 })
      .lean();

    const formsMap = {};
    for (const f of forms) {
      const years = Array.isArray(f.years) && f.years.length ? f.years : DEFAULT_YEAR_OPTIONS;
      const title = f.title?.trim() || getRecruitmentFormTitle({ ...f, years });
      formsMap[f._id.toString()] = { ...f, title, years };
    }

    return NextResponse.json(
      {
        success: true,
        department: userDepartment || "All",
        data: {
          formsMap,
          applications,
        },
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    console.error("GET ADDSEC ALL APPLICATIONS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error fetching all applications." },
      { status: 500 }
    );
  }
}
