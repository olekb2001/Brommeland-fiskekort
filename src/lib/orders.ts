import { randomBytes } from "node:crypto";
import { getStore } from "./store";
import type { CartLine } from "./availability";

export type Card = {
  code: string;
  date: string;
  holder: string;
  orderId: string;
  issuedAt: string;
};

export type Order = {
  id: string; // Stripe checkout session id
  email: string;
  holder: string;
  lines: CartLine[];
  cards: Card[];
  amountNok: number;
  paidAt: string;
  /** Når kunden godtok vilkårene (ISO). */
  termsAcceptedAt?: string;
};

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // uten forvekslingsbare tegn

export function newCode(): string {
  const bytes = randomBytes(10);
  let out = "";
  for (let i = 0; i < 10; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return `${out.slice(0, 5)}-${out.slice(5)}`;
}

/** Kunne ikke bestillingen markeres? Da er den allerede behandlet (Stripe kan sende webhook flere ganger). */
export async function claimOrder(sessionId: string): Promise<boolean> {
  return getStore().set(`order-claim:${sessionId}`, "1", { nx: true, ex: 60 * 60 * 24 * 30 });
}

export async function releaseClaim(sessionId: string) {
  await getStore().del(`order-claim:${sessionId}`);
}

export async function saveOrder(order: Order) {
  const store = getStore();
  await store.set(`order:${order.id}`, JSON.stringify(order));
  for (const card of order.cards) {
    await store.set(`card:${card.code}`, JSON.stringify(card));
  }
  await store.lpush("orders", order.id); // indeks for adminsiden, nyeste først
}

/** Nyeste bestillinger, til adminsiden. */
export async function listOrders(limit = 100): Promise<Order[]> {
  const ids = await getStore().lrange("orders", 0, limit - 1);
  const orders = await Promise.all(ids.map((id) => getOrder(id)));
  return orders.filter((o): o is Order => o !== null);
}

export async function getOrder(sessionId: string): Promise<Order | null> {
  const raw = await getStore().get<string | Order>(`order:${sessionId}`);
  if (!raw) return null;
  return typeof raw === "string" ? (JSON.parse(raw) as Order) : raw;
}

export async function getCard(code: string): Promise<Card | null> {
  const raw = await getStore().get<string | Card>(`card:${code.toUpperCase()}`);
  if (!raw) return null;
  return typeof raw === "string" ? (JSON.parse(raw) as Card) : raw;
}

/** Reservasjon som hører til en Stripe-økt, slik at den kan frigis ved utløp. */
export async function saveReservation(sessionId: string, lines: CartLine[]) {
  await getStore().set(`reservation:${sessionId}`, JSON.stringify(lines), { ex: 60 * 60 * 24 });
}

export async function takeReservation(sessionId: string): Promise<CartLine[] | null> {
  const store = getStore();
  const raw = await store.get<string | CartLine[]>(`reservation:${sessionId}`);
  if (!raw) return null;
  await store.del(`reservation:${sessionId}`);
  return typeof raw === "string" ? (JSON.parse(raw) as CartLine[]) : raw;
}

/** Marker kort som ugyldige etter refusjon. */
export async function voidOrderCards(order: Order) {
  const store = getStore();
  for (const card of order.cards) await store.set(`void:${card.code}`, "1");
}

export async function isCardVoid(code: string): Promise<boolean> {
  return (await getStore().get(`void:${code.toUpperCase()}`)) != null;
}

/** true første gang; hindrer at samme refusjon behandles to ganger. */
export async function markRefunded(orderId: string): Promise<boolean> {
  return getStore().set(`refunded:${orderId}`, "1", { nx: true });
}
