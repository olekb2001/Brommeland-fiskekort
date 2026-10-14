import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, ADMIN_MAX_AGE, adminEnabled, checkPassword, makeToken } from "@/lib/admin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!adminEnabled()) {
    return NextResponse.json({ error: "ADMIN_PASSWORD er ikke satt på serveren" }, { status: 503 });
  }
  const body = (await req.json().catch(() => ({}))) as { password?: unknown };
  if (typeof body.password !== "string" || !checkPassword(body.password)) {
    await new Promise((r) => setTimeout(r, 800)); // bremser gjetting
    return NextResponse.json({ error: "Feil passord" }, { status: 401 });
  }
  (await cookies()).set(ADMIN_COOKIE, makeToken(), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_MAX_AGE,
  });
  return NextResponse.json({ ok: true });
}
