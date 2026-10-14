import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { fulfil, handleRefund, releaseSession } from "@/lib/fulfil";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  if (!secret || !signature) {
    return NextResponse.json({ error: "Mangler signatur" }, { status: 400 });
  }

  const raw = await req.text(); // må være uendret tekst for at signaturen skal stemme
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(raw, signature, secret);
  } catch (err) {
    console.error("[webhook] Ugyldig signatur", err);
    return NextResponse.json({ error: "Ugyldig signatur" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        // Ved forsinket betaling kommer completed før pengene er trukket. Da venter vi på async_payment_succeeded.
        if (session.payment_status === "paid") await fulfil(session);
        break;
      }
      case "checkout.session.expired":
      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await releaseSession(session.id);
        break;
      }
      case "charge.refunded": {
        await handleRefund(event.data.object as Stripe.Charge);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("[webhook] Feil ved behandling", event.type, err);
    return NextResponse.json({ error: "Behandling feilet" }, { status: 500 }); // Stripe prøver igjen
  }

  return NextResponse.json({ received: true });
}
