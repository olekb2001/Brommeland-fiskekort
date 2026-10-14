import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "brom_admin";
export const ADMIN_MAX_AGE = 60 * 60 * 12; // 12 timer

const secret = () => process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "";
const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("hex");

export const adminEnabled = () => Boolean(process.env.ADMIN_PASSWORD);

export function checkPassword(input: string): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false;
  const a = createHash("sha256").update(input).digest();
  const b = createHash("sha256").update(pw).digest();
  return timingSafeEqual(a, b);
}

export function makeToken(): string {
  const exp = String(Date.now() + ADMIN_MAX_AGE * 1000);
  return `${exp}.${sign(exp)}`;
}

export function verifyToken(token?: string | null): boolean {
  if (!token || !secret()) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || !(Number(exp) > Date.now())) return false;
  const a = Buffer.from(sig);
  const b = Buffer.from(sign(exp));
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function isAdmin(): Promise<boolean> {
  return verifyToken((await cookies()).get(ADMIN_COOKIE)?.value);
}
