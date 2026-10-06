import { NextResponse } from "next/server";
import { ensureDefaultAddSecs } from "@/app/lib/seedAddSecs";

export async function POST() {
  try {
    await ensureDefaultAddSecs();
    return NextResponse.json({
      success: true,
      message: "Default AddSec accounts verified/seeded successfully.",
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { success: false, message: "Error seeding AddSec accounts." },
      { status: 500 }
    );
  }
}
