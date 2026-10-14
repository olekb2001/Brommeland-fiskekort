"use client";

import { useCallback, useEffect, useState } from "react";
import { site } from "@/config/site";
import { capitalize, defaultMonth, formatLongDate, formatNok, isInSeason, todayOslo } from "@/lib/dates";

const MONTHS = [
  "januar", "februar", "mars", "april", "mai", "juni",
  "juli", "august", "september", "oktober", "november", "desember",
];

type DayRow = { date: string; booked: number; manual: number; blocked: boolean };
type OrderRow = {
  id: string;
  email: string;
  holder: string;
  amountNok: number;
  paidAt: string;
  cards: { date: string; code: string }[];
};

export function AdminLogin() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    if (res.ok) {
      window.location.reload();
      return;
    }
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    setErr(json.error ?? "Innlogging feilet");
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-sm rounded-3xl bg-forest p-8 text-white">
      <h1 className="font-display text-3xl font-semibold">Admin</h1>
      <label className="mt-6 block">
        <span className="mb-1.5 block text-sm font-semibold text-white/80">Passord</span>
        <input
          type="password"
          autoFocus
          autoComplete="current-password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 outline-none focus:border-glacier"
        />
      </label>
      {err && <p role="alert" className="mt-3 text-sm text-red-200">{err}</p>}
      <button className="btn btn-primary mt-6 w-full" disabled={busy || !pw}>
        {busy ? "Logger inn…" : "Logg inn"}
      </button>
    </form>
  );
}

export function AdminDashboard() {
  const [ym, setYm] = useState(() => defaultMonth());
  const [days, setDays] = useState<DayRow[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [busyDate, setBusyDate] = useState<string | null>(null);
  const [onlySeason, setOnlySeason] = useState(true);

  const loadDays = useCallback(async () => {
    const m = `${ym.year}-${String(ym.month).padStart(2, "0")}`;
    const res = await fetch(`/api/admin/month?month=${m}`, { cache: "no-store" });
    if (res.status === 401) return window.location.reload();
    if (res.ok) setDays(((await res.json()) as { days: DayRow[] }).days);
  }, [ym]);

  const loadOrders = useCallback(async () => {
    const res = await fetch("/api/admin/orders", { cache: "no-store" });
    if (res.ok) setOrders(((await res.json()) as { orders: OrderRow[] }).orders);
  }, []);

  useEffect(() => {
    loadDays();
  }, [loadDays]);
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  async function act(date: string, action: "block" | "unblock" | "manual_add" | "manual_remove") {
    setBusyDate(date);
    setMsg(null);
    const res = await fetch("/api/admin/day", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, action }),
    });
    if (!res.ok) setMsg(((await res.json().catch(() => ({}))) as { error?: string }).error ?? "Noe gikk galt");
    await loadDays();
    setBusyDate(null);
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.reload();
  }

  const go = (d: number) => {
    const idx = ym.year * 12 + (ym.month - 1) + d;
    setYm({ year: Math.floor(idx / 12), month: (idx % 12) + 1 });
  };
  const today = todayOslo();
  const shown = days.filter((d) => !onlySeason || isInSeason(d.date));

  return (
    <div className="space-y-14">
      <section>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-display text-4xl font-semibold">Admin</h1>
          <button onClick={logout} className="btn border border-line bg-white text-sm hover:bg-mist">Logg ut</button>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button onClick={() => go(-1)} className="grid h-11 w-11 place-items-center rounded-full bg-mist text-xl" aria-label="Forrige måned">‹</button>
          <h2 className="min-w-44 text-center font-display text-2xl font-semibold">
            {capitalize(MONTHS[ym.month - 1])} {ym.year}
          </h2>
          <button onClick={() => go(1)} className="grid h-11 w-11 place-items-center rounded-full bg-mist text-xl" aria-label="Neste måned">›</button>
          <label className="ml-4 flex items-center gap-2 text-sm text-ink/70">
            <input type="checkbox" checked={onlySeason} onChange={(e) => setOnlySeason(e.target.checked)} className="h-4 w-4 accent-[#19a58a]" />
            Bare dager i sesong
          </label>
        </div>

        {msg && <p role="alert" className="mt-4 rounded-xl bg-red-100 px-4 py-3 text-sm text-red-800">{msg}</p>}

        <div className="mt-6 overflow-x-auto rounded-3xl border border-line bg-white">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="bg-mist text-xs uppercase tracking-wider text-ink/60">
              <tr>
                <th className="px-4 py-3">Dato</th>
                <th className="px-4 py-3">Solgt</th>
                <th className="px-4 py-3">Utenom nettsiden</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Handling</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {shown.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-ink/60">Ingen dager i sesong denne måneden. Fjern avkryssingen for å se alle dager.</td></tr>
              )}
              {shown.map((d) => {
                const busy = busyDate === d.date;
                const full = d.booked >= site.cardsPerDay;
                return (
                  <tr key={d.date} className={d.date < today ? "text-ink/40" : ""}>
                    <td className="px-4 py-3 font-semibold">{capitalize(formatLongDate(d.date))}</td>
                    <td className="px-4 py-3">{d.booked} / {site.cardsPerDay}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2">
                        <button disabled={busy || d.manual === 0} onClick={() => act(d.date, "manual_remove")} className="grid h-7 w-7 place-items-center rounded-full bg-mist disabled:opacity-30" aria-label="Fjern ett manuelt solgt kort">−</button>
                        <span className="w-4 text-center font-semibold">{d.manual}</span>
                        <button disabled={busy || full || d.blocked} onClick={() => act(d.date, "manual_add")} className="grid h-7 w-7 place-items-center rounded-full bg-mist disabled:opacity-30" aria-label="Legg til ett manuelt solgt kort">+</button>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {d.blocked ? (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800">Stengt</span>
                      ) : full ? (
                        <span className="rounded-full bg-timber/20 px-3 py-1 text-xs font-bold text-ink">Utsolgt</span>
                      ) : (
                        <span className="rounded-full bg-water/15 px-3 py-1 text-xs font-bold text-forest">{site.cardsPerDay - d.booked} ledig</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        disabled={busy}
                        onClick={() => act(d.date, d.blocked ? "unblock" : "block")}
                        className={`rounded-full px-4 py-1.5 text-xs font-bold ${d.blocked ? "bg-forest text-white" : "border border-line hover:bg-mist"} disabled:opacity-40`}
                      >
                        {d.blocked ? "Åpne dagen" : "Steng dagen"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-ink/60">
          «Steng dagen» skjuler dagen for kjøp. Bruk + for kort du har solgt andre steder, så blir de trukket fra det som er ledig på nettsiden.
          Kort som allerede er solgt på nettsiden påvirkes ikke av å stenge dagen.
        </p>
      </section>

      <section>
        <h2 className="font-display text-3xl font-semibold">Siste bestillinger</h2>
        <div className="mt-6 overflow-x-auto rounded-3xl border border-line bg-white">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead className="bg-mist text-xs uppercase tracking-wider text-ink/60">
              <tr>
                <th className="px-4 py-3">Betalt</th>
                <th className="px-4 py-3">Fisker</th>
                <th className="px-4 py-3">E-post</th>
                <th className="px-4 py-3">Kort</th>
                <th className="px-4 py-3 text-right">Beløp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-ink/60">Ingen bestillinger ennå.</td></tr>
              )}
              {orders.map((o) => (
                <tr key={o.id} className="align-top">
                  <td className="whitespace-nowrap px-4 py-3">{new Date(o.paidAt).toLocaleString("nb-NO", { dateStyle: "short", timeStyle: "short" })}</td>
                  <td className="px-4 py-3 font-semibold">{o.holder}</td>
                  <td className="px-4 py-3">{o.email}</td>
                  <td className="px-4 py-3">
                    {o.cards.map((c) => (
                      <div key={c.code}>{c.date} · <span className="font-mono">{c.code}</span></div>
                    ))}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">{formatNok(o.amountNok)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={loadOrders} className="btn mt-4 border border-line bg-white text-sm hover:bg-mist">Last på nytt</button>
      </section>
    </div>
  );
}
