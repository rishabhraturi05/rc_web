import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import RecruitmentFile from "@/app/models/RecruitmentFile";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, message: "No file was provided." },
        { status: 400 }
      );
    }

    const originalName = file.name || "resume.pdf";
    const mimeType = (file.type || "").toLowerCase();
    const isPdf =
      mimeType.includes("pdf") ||
      originalName.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      return NextResponse.json(
        { success: false, message: "Only PDF documents (.pdf) are allowed." },
        { status: 400 }
      );
    }

    // 500KB limit
    const MAX_SIZE_BYTES = 500 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, message: "File size exceeds the 500KB limit. Please compress or upload a PDF under 500KB." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await connectDB();
    const savedFile = await RecruitmentFile.create({
      filename: originalName,
      contentType: "application/pdf",
      size: file.size,
      data: buffer,
    });

    const fileUrl = `/api/recruitment/files/${savedFile._id}`;

    return NextResponse.json(
      {
        success: true,
        fileId: String(savedFile._id),
        filename: originalName,
        size: file.size,
        url: fileUrl,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("UPLOAD RECRUITMENT FILE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to upload PDF file. Please try again." },
      { status: 500 }
    );
  }
}
