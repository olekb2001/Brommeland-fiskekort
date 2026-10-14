import { site } from "@/config/site";
import { getStore } from "./store";

export type CartLine = { date: string; qty: number };

const key = (date: string) => `booked:${date}`;
const blockedKey = (date: string) => `blocked:${date}`;
const manualKey = (date: string) => `manual:${date}`;

/** Datoer eier har sperret (flom, privat bruk o.l.). */
export async function getBlocked(dates: string[]): Promise<Record<string, boolean>> {
  const vals = await getStore().mget(dates.map(blockedKey));
  return Object.fromEntries(dates.map((d, i) => [d, vals[i] != null]));
}

export async function setBlocked(date: string, blocked: boolean): Promise<void> {
  if (blocked) await getStore().set(blockedKey(date), "1");
  else await getStore().del(blockedKey(date));
}

/** Kort solgt utenom nettsiden og lagt inn av eier. Teller også med i «booked». */
export async function getManual(dates: string[]): Promise<Record<string, number>> {
  const vals = await getStore().mget<number | string>(dates.map(manualKey));
  return Object.fromEntries(dates.map((d, i) => [d, Number(vals[i] ?? 0)]));
}

export async function addManual(date: string): Promise<boolean> {
  const res = await reserve([{ date, qty: 1 }]);
  if (!res.ok) return false;
  await getStore().incrby(manualKey(date), 1);
  return true;
}

export async function removeManual(date: string): Promise<boolean> {
  const store = getStore();
  const after = await store.decrby(manualKey(date), 1);
  if (after < 0) {
    await store.incrby(manualKey(date), 1);
    return false;
  }
  await release([{ date, qty: 1 }]);
  return true;
}

/** Antall solgte eller reserverte kort for hver dato. */
export async function getBooked(dates: string[]): Promise<Record<string, number>> {
  const vals = await getStore().mget<number | string>(dates.map(key));
  return Object.fromEntries(dates.map((d, i) => [d, Number(vals[i] ?? 0)]));
}

export async function getRemaining(dates: string[]): Promise<Record<string, number>> {
  const [booked, blocked] = await Promise.all([getBooked(dates), getBlocked(dates)]);
  return Object.fromEntries(
    dates.map((d) => [d, blocked[d] ? 0 : Math.max(0, site.cardsPerDay - (booked[d] ?? 0))]),
  );
}

/**
 * Reserverer kort. Teller økes først og rulles tilbake hvis en dato blir overbooket,
 * så to samtidige kjøpere aldri begge får siste kort.
 * Returnerer feil med ledige antall hvis noe ikke gikk.
 */
export async function reserve(
  lines: CartLine[],
): Promise<{ ok: true } | { ok: false; date: string; remaining: number }> {
  const store = getStore();
  const done: CartLine[] = [];
  for (const line of lines) {
    if (await store.get(blockedKey(line.date))) {
      for (const d of done) await store.decrby(key(d.date), d.qty);
      return { ok: false, date: line.date, remaining: 0 };
    }
    const after = await store.incrby(key(line.date), line.qty);
    if (after > site.cardsPerDay) {
      await store.decrby(key(line.date), line.qty);
      for (const d of done) await store.decrby(key(d.date), d.qty);
      return { ok: false, date: line.date, remaining: Math.max(0, site.cardsPerDay - (after - line.qty)) };
    }
    done.push(line);
  }
  return { ok: true };
}

export async function release(lines: CartLine[]): Promise<void> {
  const store = getStore();
  for (const line of lines) {
    const after = await store.decrby(key(line.date), line.qty);
    if (after < 0) await store.incrby(key(line.date), -after);
  }
}
