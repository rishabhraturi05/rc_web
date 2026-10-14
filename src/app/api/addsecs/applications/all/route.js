import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { connectDB } from "@/app/lib/db";
import RecruitmentConfig from "@/app/models/RecruitmentConfig";
import RecruitmentApplication from "@/app/models/RecruitmentApplication";
import { DEFAULT_YEAR_OPTIONS, getRecruitmentFormTitle } from "@/app/lib/recruitment";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user?.role !== "addsec" && session.user?.role !== "admin")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Additional Secretary access required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const requestedDept = searchParams.get("department");

    // AddSec is locked to their assigned department. Admin can specify a department (defaults to "Software").
    const rawDept =
      session.user?.role === "addsec"
        ? session.user?.department
        : (requestedDept || "Software");

    let userDepartment = String(rawDept || "Software").replace(/\s*department\s*$/i, "").trim() || "Software";
    if (userDepartment.toLowerCase() === "department") {
      userDepartment = "Software";
    }
    userDepartment = userDepartment.charAt(0).toUpperCase() + userDepartment.slice(1);

    await connectDB();

    const deptRegex = new RegExp(`^${userDepartment}$`, "i");
    const formQuery = { departments: deptRegex };
    const forms = await RecruitmentConfig.find(formQuery).lean();

    const formIds = forms.map((f) => f._id);
    const appQuery = { formId: { $in: formIds }, department: deptRegex };

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
        department: userDepartment,
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
