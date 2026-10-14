import { NextResponse } from "next/server";
import { getOrder } from "@/lib/orders";

export const dynamic = "force-dynamic";

function maskEmail(email: string) {
  const [user, domain] = email.split("@");
  if (!domain) return "";
  return `${user.slice(0, 2)}${"•".repeat(Math.max(1, user.length - 2))}@${domain}`;
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!/^cs_[A-Za-z0-9_]{10,200}$/.test(id)) {
    return NextResponse.json({ error: "Ugyldig id" }, { status: 400 });
  }
  const order = await getOrder(id);
  if (!order) return NextResponse.json({ status: "pending" }, { headers: { "Cache-Control": "no-store" } });

  return NextResponse.json(
    {
      status: "ready",
      holder: order.holder,
      email: maskEmail(order.email),
      amountNok: order.amountNok,
      cards: order.cards.map((c) => ({ date: c.date, code: c.code })),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
