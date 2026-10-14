import { NextResponse } from "next/server";
import { z } from "zod";
import { site } from "@/config/site";
import { release, reserve } from "@/lib/availability";
import { formatLongDate, isBookableDate } from "@/lib/dates";
import { isFullDay, linePrice } from "@/lib/pricing";
import { saveReservation } from "@/lib/orders";
import { rateLimit } from "@/lib/ratelimit";
import { getStore } from "@/lib/store";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

const body = z.object({
  name: z.string().trim().min(2, "Skriv inn fullt navn").max(80),
  email: z.string().trim().toLowerCase().email("Ugyldig e-postadresse").max(200),
  acceptTerms: z.literal(true, { errorMap: () => ({ message: "Du må godta vilkårene" }) }),
  lines: z
    .array(z.object({ date: z.string(), qty: z.number().int().min(1).max(site.maxPerOrder) }))
    .min(1, "Velg minst én dato")
    .max(site.maxPerOrder),
});

export async function POST(req: Request) {
  // Uten varig lagring (Redis) kan kalenderen bli feil og kort dobbeltsolgt. Nekt heller enn å risikere det.
  if (process.env.NODE_ENV === "production" && !getStore().persistent) {
    console.error("[checkout] Upstash Redis er ikke konfigurert. Salg er stengt.");
    return NextResponse.json({ error: "Bestilling er midlertidig utilgjengelig. Prøv igjen senere." }, { status: 503 });
  }
  if (!(await rateLimit(req, "checkout", 8, 600))) {
    return NextResponse.json({ error: "For mange forsøk. Vent noen minutter og prøv igjen." }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Ugyldig forespørsel" }, { status: 400 });
  }

  const parsed = body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Ugyldig data" }, { status: 400 });
  }
  const { name, email, lines } = parsed.data;

  const dates = lines.map((l) => l.date);
  if (new Set(dates).size !== dates.length) {
    return NextResponse.json({ error: "Samme dato er valgt flere ganger" }, { status: 400 });
  }
  if (lines.reduce((n, l) => n + l.qty, 0) > site.maxPerOrder) {
    return NextResponse.json({ error: `Maks ${site.maxPerOrder} kort per bestilling` }, { status: 400 });
  }
  const bad = lines.find((l) => !isBookableDate(l.date));
  if (bad) {
    return NextResponse.json({ error: "En av datoene kan ikke kjøpes (utenfor sesong eller i fortiden)" }, { status: 400 });
  }

  const reservation = await reserve(lines);
  if (!reservation.ok) {
    const msg =
      reservation.remaining === 0
        ? `${formatLongDate(reservation.date)} er dessverre utsolgt.`
        : `Det er bare ${reservation.remaining} ledig${reservation.remaining === 1 ? "t" : "e"} kort ${formatLongDate(reservation.date)}.`;
    return NextResponse.json({ error: msg, soldOut: true }, { status: 409 });
  }

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      // Ingen payment_method_types: Stripe viser metodene som er slått på i Dashboard (kort, Apple Pay, Google Pay, Vipps m.m.)
      customer_email: email,
      locale: "nb",
      // Én linje per dato med ferdig utregnet pris, slik at «siste kort gratis» blir riktig i Stripe.
      line_items: lines.map((l) => ({
        quantity: 1,
        price_data: {
          currency: "nok",
          unit_amount: linePrice(l.qty) * 100,
          product_data: {
            name: isFullDay(l.qty)
              ? `Hele dagen alene (${l.qty} døgnkort, ett gratis) – ${formatLongDate(l.date)}`
              : `Døgnkort Brommeland${l.qty > 1 ? ` x${l.qty}` : ""} – ${formatLongDate(l.date)}`,
            description: "Fiskekort for Brommeland i Suldalslågen",
          },
        },
      })),
      metadata: { holder: name, lines: JSON.stringify(lines), terms: new Date().toISOString() },
      payment_intent_data: { description: `Fiskekort Brommeland (${dates.join(", ")})` },
      success_url: `${site.url}/takk?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site.url}/fiskekort?avbrutt=1`,
      // Stripe krever minst 30 minutter. Legger på litt slingringsmonn.
      expires_at: Math.floor(Date.now() / 1000) + site.reservationMinutes * 60 + 120,
    });

    await saveReservation(session.id, lines);

    if (!session.url) throw new Error("Stripe ga ingen betalingslenke");
    return NextResponse.json({ url: session.url });
  } catch (err) {
    await release(lines);
    console.error("[checkout]", err);
    return NextResponse.json({ error: "Kunne ikke starte betaling. Prøv igjen om litt." }, { status: 500 });
  }
}
