import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { getBlocked, getBooked, getManual } from "@/lib/availability";
import { datesInMonth } from "@/lib/dates";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  const m = /^(\d{4})-(\d{2})$/.exec(new URL(req.url).searchParams.get("month") ?? "");
  if (!m || Number(m[2]) < 1 || Number(m[2]) > 12) {
    return NextResponse.json({ error: "Ugyldig måned" }, { status: 400 });
  }
  const dates = datesInMonth(Number(m[1]), Number(m[2]));
  const [booked, blocked, manual] = await Promise.all([getBooked(dates), getBlocked(dates), getManual(dates)]);
  return NextResponse.json({
    days: dates.map((date) => ({
      date,
      booked: booked[date] ?? 0,
      manual: manual[date] ?? 0,
      blocked: blocked[date] ?? false,
    })),
  });
}
