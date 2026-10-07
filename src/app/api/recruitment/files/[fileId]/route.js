import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import RecruitmentFile from "@/app/models/RecruitmentFile";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  try {
    const { fileId } = await params;

    if (!fileId || !mongoose.Types.ObjectId.isValid(fileId)) {
      return new NextResponse("Invalid file identifier", { status: 400 });
    }

    await connectDB();
    const fileDoc = await RecruitmentFile.findById(fileId);

    if (!fileDoc || !fileDoc.data) {
      return new NextResponse("File not found", { status: 404 });
    }

    const filename = fileDoc.filename || "applicant_resume.pdf";
    const contentType = fileDoc.contentType || "application/pdf";

    return new NextResponse(fileDoc.data, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${encodeURIComponent(filename)}"`,
        "Content-Length": String(fileDoc.size || fileDoc.data.length),
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
      },
    });
  } catch (error) {
    console.error("GET RECRUITMENT FILE ERROR:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
