import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/admin";

export async function POST() {
  (await cookies()).delete(ADMIN_COOKIE);
  return NextResponse.json({ ok: true });
}
