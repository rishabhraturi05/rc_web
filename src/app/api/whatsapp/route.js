import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const link =
    process.env.NEXT_PUBLIC_WHATSAPP_GROUP_LINK ||
    process.env.WHATSAPP_GROUP_LINK ||
    process.env.NEXT_PUBLIC_WHATSAPP_LINK ||
    process.env.WHATSAPP_LINK ||
    "";

  return NextResponse.json({ link: link.trim() });
}
