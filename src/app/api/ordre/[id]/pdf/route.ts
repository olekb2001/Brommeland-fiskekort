import { NextResponse } from "next/server";
import { getOrder } from "@/lib/orders";
import { buildCardsPdf } from "@/lib/pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!/^cs_[A-Za-z0-9_]{10,200}$/.test(id)) {
    return NextResponse.json({ error: "Ugyldig id" }, { status: 400 });
  }
  const order = await getOrder(id);
  if (!order) return NextResponse.json({ error: "Fant ikke bestillingen" }, { status: 404 });

  const pdf = await buildCardsPdf(order);
  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="fiskekort-brommeland.pdf"',
      "Cache-Control": "private, no-store",
    },
  });
}
