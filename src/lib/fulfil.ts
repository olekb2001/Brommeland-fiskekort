import type Stripe from "stripe";
import { z } from "zod";
import { site } from "@/config/site";
import { isValidDateString } from "./dates";
import { sendOrderEmail } from "./mail";
import { getStripe } from "./stripe";
import {
  claimOrder,
  getOrder,
  markRefunded,
  newCode,
  releaseClaim,
  saveOrder,
  takeReservation,
  voidOrderCards,
  type Card,
  type Order,
} from "./orders";
import { release, type CartLine } from "./availability";

const linesSchema = z
  .array(
    z.object({
      date: z.string().refine(isValidDateString),
      qty: z.number().int().min(1).max(site.maxPerOrder),
    }),
  )
  .min(1);

export function parseLines(raw: string | undefined | null): CartLine[] {
  if (!raw) throw new Error("Mangler linjer i metadata");
  return linesSchema.parse(JSON.parse(raw));
}

/** Kalles når en betaling er bekreftet. Trygg å kalle flere ganger for samme økt. */
export async function fulfil(session: Stripe.Checkout.Session): Promise<void> {
  const claimed = await claimOrder(session.id);
  if (!claimed) return; // allerede behandlet

  try {
    let order = await getOrder(session.id);

    if (!order) {
      const lines = parseLines(session.metadata?.lines);
      const holder = (session.metadata?.holder ?? session.customer_details?.name ?? "Gjest").slice(0, 80);
      const email = session.customer_details?.email ?? session.customer_email;
      if (!email) throw new Error("Fant ingen e-postadresse på økten");

      const issuedAt = new Date().toISOString();
      const cards: Card[] = lines.flatMap((l) =>
        Array.from({ length: l.qty }, () => ({
          code: newCode(),
          date: l.date,
          holder,
          orderId: session.id,
          issuedAt,
        })),
      );
      order = {
        id: session.id,
        email,
        holder,
        lines,
        cards,
        amountNok: Math.round((session.amount_total ?? 0) / 100),
        paidAt: issuedAt,
        termsAcceptedAt: session.metadata?.terms,
      } satisfies Order;
      await saveOrder(order);
    }

    // Reservasjonen er nå et faktisk salg, så den skal ikke frigis senere.
    await takeReservation(session.id);
    await sendOrderEmail(order);
  } catch (err) {
    // Gi Stripe mulighet til å prøve på nytt. Ordren er lagret, så koder blir ikke laget på nytt.
    await releaseClaim(session.id);
    throw err;
  }
}

/** Kalles når en økt utløper eller betalingen feiler. Frigir de reserverte kortene. */
export async function releaseSession(sessionId: string): Promise<void> {
  const lines = await takeReservation(sessionId);
  if (lines) await release(lines);
}

/** Full refusjon: gjør kortene ugyldige og frigir datoene i kalenderen. */
export async function handleRefund(charge: Stripe.Charge): Promise<void> {
  if (!charge.refunded) return; // bare helt refunderte betalinger
  const pi = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
  if (!pi) return;
  const sessions = await getStripe().checkout.sessions.list({ payment_intent: pi, limit: 1 });
  const session = sessions.data[0];
  if (!session) return;
  const order = await getOrder(session.id);
  if (!order) return;
  if (!(await markRefunded(order.id))) return;
  await voidOrderCards(order);
  await release(order.lines);
}
