import { Redis } from "@upstash/redis";

/**
 * Minimal nøkkel/verdi-lagring.
 * - Produksjon: Upstash Redis (sett UPSTASH_REDIS_REST_URL og UPSTASH_REDIS_REST_TOKEN).
 * - Utvikling: minnelagring som nullstilles ved restart.
 */
export interface Store {
  /** true når data lagres varig (Redis). Minnelagring er bare for utvikling. */
  readonly persistent: boolean;
  get<T = unknown>(key: string): Promise<T | null>;
  set(key: string, value: unknown, opts?: { ex?: number; nx?: boolean }): Promise<boolean>;
  del(key: string): Promise<void>;
  incrby(key: string, n: number): Promise<number>;
  decrby(key: string, n: number): Promise<number>;
  mget<T = unknown>(keys: string[]): Promise<(T | null)[]>;
  /** Legger verdi først i en liste. */
  lpush(key: string, value: string): Promise<void>;
  lrange(key: string, start: number, stop: number): Promise<string[]>;
  /** Øker teller og setter utløp første gang. Brukes til rate limiting. */
  incrWithTtl(key: string, ttlSeconds: number): Promise<number>;
}

class MemoryStore implements Store {
  readonly persistent = false;
  private data = new Map<string, { v: unknown; exp?: number }>();

  private read(key: string) {
    const e = this.data.get(key);
    if (!e) return undefined;
    if (e.exp && e.exp < Date.now()) {
      this.data.delete(key);
      return undefined;
    }
    return e;
  }
  async get<T>(key: string) {
    return (this.read(key)?.v as T) ?? null;
  }
  async set(key: string, value: unknown, opts?: { ex?: number; nx?: boolean }) {
    if (opts?.nx && this.read(key)) return false;
    this.data.set(key, { v: value, exp: opts?.ex ? Date.now() + opts.ex * 1000 : undefined });
    return true;
  }
  async del(key: string) {
    this.data.delete(key);
  }
  async incrby(key: string, n: number) {
    const cur = Number(this.read(key)?.v ?? 0) + n;
    this.data.set(key, { v: cur });
    return cur;
  }
  async decrby(key: string, n: number) {
    return this.incrby(key, -n);
  }
  async mget<T>(keys: string[]) {
    return keys.map((k) => (this.read(k)?.v as T) ?? null);
  }
  async incrWithTtl(key: string, ttlSeconds: number) {
    const e = this.read(key);
    const n = Number(e?.v ?? 0) + 1;
    this.data.set(key, { v: n, exp: e?.exp ?? Date.now() + ttlSeconds * 1000 });
    return n;
  }
  async lpush(key: string, value: string) {
    const list = (this.read(key)?.v as string[] | undefined) ?? [];
    this.data.set(key, { v: [value, ...list] });
  }
  async lrange(key: string, start: number, stop: number) {
    const list = (this.read(key)?.v as string[] | undefined) ?? [];
    return list.slice(start, stop + 1);
  }
}

class UpstashStore implements Store {
  readonly persistent = true;
  constructor(private r: Redis) {}
  async incrWithTtl(key: string, ttlSeconds: number) {
    const n = await this.r.incr(key);
    if (n === 1) await this.r.expire(key, ttlSeconds);
    return n;
  }
  async get<T>(key: string) {
    return (await this.r.get<T>(key)) ?? null;
  }
  async set(key: string, value: unknown, opts?: { ex?: number; nx?: boolean }) {
    const res = await this.r.set(key, value as string, {
      ...(opts?.ex ? { ex: opts.ex } : {}),
      ...(opts?.nx ? { nx: true } : {}),
    } as never);
    return res === "OK";
  }
  async del(key: string) {
    await this.r.del(key);
  }
  incrby(key: string, n: number) {
    return this.r.incrby(key, n);
  }
  decrby(key: string, n: number) {
    return this.r.decrby(key, n);
  }
  async lpush(key: string, value: string) {
    await this.r.lpush(key, value);
  }
  async lrange(key: string, start: number, stop: number) {
    const res = await this.r.lrange<string>(key, start, stop);
    return res.map(String);
  }
  async mget<T>(keys: string[]) {
    if (keys.length === 0) return [];
    const res = await this.r.mget<(T | null)[]>(...keys);
    return res.map((v) => v ?? null);
  }
}

const globalForStore = globalThis as unknown as { __store?: Store };

export function getStore(): Store {
  if (globalForStore.__store) return globalForStore.__store;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    globalForStore.__store = new UpstashStore(new Redis({ url, token }));
  } else {
    if (process.env.NODE_ENV === "production") {
      console.warn("[store] Upstash er ikke konfigurert. Bruker midlertidig minnelagring.");
    }
    globalForStore.__store = new MemoryStore();
  }
  return globalForStore.__store;
}
