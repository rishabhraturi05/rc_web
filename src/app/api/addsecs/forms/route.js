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
    let userDepartment =
      session.user?.role === "addsec"
        ? session.user?.department
        : (requestedDept || "Software");

    if (!userDepartment) {
      userDepartment = "Software";
    }

    await connectDB();

    // Query for forms that contain this specific department
    const formQuery = { departments: userDepartment };
    const forms = await RecruitmentConfig.find(formQuery).sort({ createdAt: -1 }).lean();

    // For each form, get application statistics strictly for this department
    const formsWithStats = await Promise.all(
      forms.map(async (form) => {
        const appQuery = { formId: form._id, department: userDepartment };

        const totalApplications = await RecruitmentApplication.countDocuments(appQuery);
        const evaluatedApplications = await RecruitmentApplication.countDocuments({
          ...appQuery,
          $or: [
            { points: { $exists: true, $ne: "" } },
            { comments: { $exists: true, $ne: "" } },
          ],
        });

        const years = Array.isArray(form.years) && form.years.length
          ? form.years
          : DEFAULT_YEAR_OPTIONS;
        const title = form.title?.trim() || getRecruitmentFormTitle({ ...form, years });

        return {
          ...form,
          title,
          years,
          totalApplications,
          evaluatedApplications,
        };
      })
    );

    return NextResponse.json(
      {
        success: true,
        department: userDepartment,
        data: formsWithStats,
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    console.error("GET ADDSEC FORMS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error while fetching forms." },
      { status: 500 }
    );
  }
}
