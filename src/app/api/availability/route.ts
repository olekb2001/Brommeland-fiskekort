import { NextResponse } from "next/server";
import { getBlocked, getRemaining } from "@/lib/availability";
import { datesInMonth, isBookableDate } from "@/lib/dates";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const month = new URL(req.url).searchParams.get("month") ?? "";
  const m = /^(\d{4})-(\d{2})$/.exec(month);
  if (!m || Number(m[2]) < 1 || Number(m[2]) > 12) {
    return NextResponse.json({ error: "Ugyldig måned" }, { status: 400 });
  }

  const dates = datesInMonth(Number(m[1]), Number(m[2]));
  const [remaining, blocked] = await Promise.all([getRemaining(dates), getBlocked(dates)]);
  const days = Object.fromEntries(
    dates.map((d) => [d, { bookable: isBookableDate(d), remaining: remaining[d] ?? 0, blocked: blocked[d] ?? false }]),
  );

  return NextResponse.json({ month, days }, { headers: { "Cache-Control": "no-store" } });
}
