import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/admin";
import { addManual, removeManual, setBlocked } from "@/lib/availability";
import { isValidDateString } from "@/lib/dates";

export const runtime = "nodejs";

const body = z.object({
  date: z.string().refine(isValidDateString, "Ugyldig dato"),
  action: z.enum(["block", "unblock", "manual_add", "manual_remove"]),
});

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Ugyldig forespørsel" }, { status: 400 });
  const { date, action } = parsed.data;

  switch (action) {
    case "block":
      await setBlocked(date, true);
      break;
    case "unblock":
      await setBlocked(date, false);
      break;
    case "manual_add":
      if (!(await addManual(date))) {
        return NextResponse.json({ error: "Ingen ledige kort igjen denne dagen (eller dagen er sperret)." }, { status: 409 });
      }
      break;
    case "manual_remove":
      if (!(await removeManual(date))) {
        return NextResponse.json({ error: "Ingen manuelt solgte kort å fjerne." }, { status: 409 });
      }
      break;
  }
  return NextResponse.json({ ok: true });
}
