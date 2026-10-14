import { getStore } from "./store";

/** Returnerer true hvis forespørselen er innenfor grensen. */
export async function rateLimit(req: Request, name: string, limit: number, windowSec: number): Promise<boolean> {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "ukjent";
  const n = await getStore().incrWithTtl(`rl:${name}:${ip}`, windowSec);
  return n <= limit;
}
