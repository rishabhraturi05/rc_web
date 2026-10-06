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
    if (!userDepartment && session.user?.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "No department assigned to this account." },
        { status: 403 }
      );
    }

    await connectDB();

    // Query for forms that contain this department (or all forms if admin)
    const formQuery = userDepartment ? { departments: userDepartment } : {};
    const forms = await RecruitmentConfig.find(formQuery).sort({ createdAt: -1 }).lean();

    // For each form, get application statistics for this department
    const formsWithStats = await Promise.all(
      forms.map(async (form) => {
        const appQuery = { formId: form._id };
        if (userDepartment) {
          appQuery.department = userDepartment;
        }

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
        department: userDepartment || "All",
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
