import { getResolvedTargetTimestamp, isCountdownActive } from "@/app/freshers/lib/countdownHelper";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const serverTime = Date.now();
  const targetTimestamp = getResolvedTargetTimestamp();
  const locked = isCountdownActive();

  return Response.json(
    {
      serverTime,
      targetTimestamp,
      isLocked: locked,
      remainingMs: Math.max(0, targetTimestamp - serverTime),
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    }
  );
}
