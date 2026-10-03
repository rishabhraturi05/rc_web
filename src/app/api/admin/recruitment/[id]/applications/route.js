import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { connectDB } from "@/app/lib/db";
import RecruitmentConfig from "@/app/models/RecruitmentConfig";
import RecruitmentApplication from "@/app/models/RecruitmentApplication";

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

export async function GET(req, { params }) {
  try {
    const authResult = await validateAdmin();
    if (authResult.response) return authResult.response;

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const department = searchParams.get("department");

    await connectDB();

    const form = await RecruitmentConfig.findById(id).lean();
    if (!form) {
      return NextResponse.json(
        { success: false, message: "Recruitment form not found" },
        { status: 404 }
      );
    }

    const query = { formId: form._id };
    if (department && department !== "all") {
      query.department = department;
    }

    const applications = await RecruitmentApplication.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: { form, applications } });
  } catch (error) {
    console.error("GET RECRUITMENT APPLICATIONS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
