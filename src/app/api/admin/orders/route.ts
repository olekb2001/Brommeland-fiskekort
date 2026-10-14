import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { listOrders } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  return NextResponse.json({ orders: await listOrders(100) });
}
