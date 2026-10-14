"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { site } from "@/config/site";
import { isFullDay, linePrice, orderTotal } from "@/lib/pricing";
import {
  capitalize,
  datesInMonth,
  defaultMonth,
  formatLongDate,
  formatNok,
  nextSeasonStart,
  todayOslo,
} from "@/lib/dates";

type Day = { bookable: boolean; remaining: number; blocked?: boolean };
type Cart = Record<string, number>;

const WEEKDAYS = ["man", "tir", "ons", "tor", "fre", "lør", "søn"];
const MONTHS = [
  "januar", "februar", "mars", "april", "mai", "juni",
  "juli", "august", "september", "oktober", "november", "desember",
];

const monthKey = (y: number, m: number) => `${y}-${String(m).padStart(2, "0")}`;

export function Booking({ cancelled = false }: { cancelled?: boolean }) {
  const [ym, setYm] = useState(() => defaultMonth());
  const [days, setDays] = useState<Record<string, Day>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [cart, setCart] = useState<Cart>({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [terms, setTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMonth = useCallback(async (y: number, m: number, signal?: AbortSignal) => {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await fetch(`/api/availability?month=${monthKey(y, m)}`, { signal, cache: "no-store" });
      if (!res.ok) throw new Error();
      const json = (await res.json()) as { days: Record<string, Day> };
      setDays((prev) => ({ ...prev, ...json.days }));
    } catch (e) {
      if ((e as Error).name !== "AbortError") setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    loadMonth(ym.year, ym.month, ac.signal);
    return () => ac.abort();
  }, [ym, loadMonth]);

  const today = todayOslo();
  const startNext = nextSeasonStart();
  const cells = useMemo(() => {
    const dates = datesInMonth(ym.year, ym.month);
    const offset = (new Date(Date.UTC(ym.year, ym.month - 1, 1)).getUTCDay() + 6) % 7;
    return { dates, offset };
  }, [ym]);

  const totalQty = Object.values(cart).reduce((a, b) => a + b, 0);
  const total = orderTotal(Object.values(cart).map((qty) => ({ qty })));

  // Man kan bla fritt fremover. Måneder utenfor sesong vises som ikke tilgjengelige.
  const first = defaultMonth();
  const cur = ym.year * 12 + ym.month;
  const canPrev = cur > first.year * 12 + first.month;
  const canNext = true;

  const go = (delta: number) => {
    const idx = ym.year * 12 + (ym.month - 1) + delta;
    setYm({ year: Math.floor(idx / 12), month: (idx % 12) + 1 });
  };

  const toggle = (date: string) => {
    setError(null);
    setCart((c) => {
      if (c[date]) {
        const { [date]: _removed, ...rest } = c;
        return rest;
      }
      if (totalQty >= site.maxPerOrder) {
        setError(`Du kan kjøpe maks ${site.maxPerOrder} kort per bestilling.`);
        return c;
      }
      return { ...c, [date]: 1 };
    });
  };

  const step = (date: string, delta: number) => {
    setError(null);
    setCart((c) => {
      const next = (c[date] ?? 0) + delta;
      const remaining = days[date]?.remaining ?? 0;
      if (next < 1) {
        const { [date]: _r, ...rest } = c;
        return rest;
      }
      if (next > remaining) {
        setError(`Det er bare ${remaining} ledig${remaining === 1 ? "t" : "e"} kort denne dagen.`);
        return c;
      }
      if (delta > 0 && totalQty >= site.maxPerOrder) {
        setError(`Du kan kjøpe maks ${site.maxPerOrder} kort per bestilling.`);
        return c;
      }
      return { ...c, [date]: next };
    });
  };

  /** Kan kunden ta alle kortene denne dagen innenfor grensen per bestilling? */
  const canTakeWholeDay = (date: string) =>
    (days[date]?.remaining ?? 0) >= site.cardsPerDay &&
    totalQty - (cart[date] ?? 0) + site.cardsPerDay <= site.maxPerOrder;

  const takeWholeDay = (date: string) => {
    setError(null);
    setCart((c) => ({ ...c, [date]: site.cardsPerDay }));
  };

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const ready = totalQty > 0 && name.trim().length >= 2 && emailOk && terms && !submitting;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          acceptTerms: true,
          lines: Object.entries(cart).map(([date, qty]) => ({ date, qty })),
        }),
      });
      const json = (await res.json()) as { url?: string; error?: string; soldOut?: boolean };
      if (!res.ok || !json.url) {
        setError(json.error ?? "Noe gikk galt. Prøv igjen.");
        if (json.soldOut) {
          setCart({});
          loadMonth(ym.year, ym.month);
        }
        setSubmitting(false);
        return;
      }
      window.location.href = json.url;
    } catch {
      setError("Fikk ikke kontakt med serveren. Sjekk nettforbindelsen og prøv igjen.");
      setSubmitting(false);
    }
  }

  const sortedCart = Object.keys(cart).sort();

  return (
    <div className="grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:gap-12">
      {/* Kalender */}
      <div>
        {cancelled && (
          <p className="mb-5 rounded-2xl border border-timber/40 bg-timber/10 px-5 py-4 text-sm text-ink">
            Betalingen ble avbrutt, og du er ikke belastet. Datoene dine er frigitt, så velg på nytt hvis du vil prøve igjen.
          </p>
        )}
        {startNext && (
          <p className="mb-5 rounded-2xl border border-water/30 bg-water/10 px-5 py-4 text-sm text-ink">
            Sesongen er ikke åpen akkurat nå. Neste sesong starter{" "}
            <strong>{capitalize(formatLongDate(startNext))}</strong>, og du kan kjøpe kort på forhånd.
          </p>
        )}

        <div className="rounded-3xl border border-line bg-white p-4 shadow-[0_20px_60px_-30px_rgba(10,31,29,0.35)] sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              className="grid h-11 w-11 place-items-center rounded-full bg-mist text-xl text-forest transition hover:bg-line disabled:opacity-30"
              onClick={() => go(-1)}
              disabled={!canPrev}
              aria-label="Forrige måned"
            >
              ‹
            </button>
            <h2 className="font-display text-2xl font-semibold" aria-live="polite">
              {capitalize(MONTHS[ym.month - 1])} {ym.year}
            </h2>
            <button
              type="button"
              className="grid h-11 w-11 place-items-center rounded-full bg-mist text-xl text-forest transition hover:bg-line disabled:opacity-30"
              onClick={() => go(1)}
              disabled={!canNext}
              aria-label="Neste måned"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-bold uppercase tracking-wider text-ink/45">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-2">{d}</div>
            ))}
          </div>

          <motion.div
            key={monthKey(ym.year, ym.month)}
            className="grid grid-cols-7 gap-1.5"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: loading ? 0.5 : 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {Array.from({ length: cells.offset }).map((_, i) => (
              <div key={`b${i}`} />
            ))}
            {cells.dates.map((date) => {
              const d = days[date];
              const bookable = d?.bookable ?? false;
              const remaining = d?.remaining ?? 0;
              const soldOut = bookable && remaining === 0;
              const selected = Boolean(cart[date]);
              const disabled = !bookable || soldOut;
              const isToday = date === today;
              return (
                <button
                  key={date}
                  type="button"
                  disabled={disabled}
                  onClick={() => toggle(date)}
                  aria-pressed={selected}
                  aria-label={`${capitalize(formatLongDate(date))}. ${
                    !bookable ? "Ikke tilgjengelig" : soldOut ? (d?.blocked ? "Stengt" : "Utsolgt") : `${remaining} ledige kort`
                  }`}
                  className={`relative flex aspect-square flex-col items-center justify-center rounded-2xl text-sm font-semibold transition-all duration-200 sm:text-base ${
                    selected
                      ? "scale-[1.04] bg-forest text-white shadow-lg"
                      : disabled
                        ? "cursor-not-allowed bg-transparent text-ink/25"
                        : "bg-mist text-ink hover:-translate-y-0.5 hover:bg-glacier/60"
                  } ${isToday && !selected ? "ring-2 ring-timber/60" : ""}`}
                >
                  <span className={soldOut ? "line-through" : ""}>{Number(date.slice(8))}</span>
                  {bookable && !soldOut && (
                    <span className="mt-0.5 flex gap-0.5" aria-hidden="true">
                      {Array.from({ length: site.cardsPerDay }).map((_, i) => (
                        <span
                          key={i}
                          className={`h-1 w-1 rounded-full ${
                            i < remaining ? (selected ? "bg-glacier" : "bg-water") : selected ? "bg-white/25" : "bg-ink/15"
                          }`}
                        />
                      ))}
                    </span>
                  )}
                  {soldOut && <span className="text-[0.55rem] font-bold uppercase tracking-wider text-ink/40">{d?.blocked ? "Stengt" : "Utsolgt"}</span>}
                </button>
              );
            })}
          </motion.div>

          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink/60" aria-hidden="true">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-mist" /> Ledig</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-forest" /> Valgt</span>
            <span className="flex items-center gap-1.5"><span className="flex gap-0.5"><i className="h-1 w-1 rounded-full bg-water" /><i className="h-1 w-1 rounded-full bg-water" /><i className="h-1 w-1 rounded-full bg-ink/15" /></span> Antall ledige kort</span>
          </div>
          {loadError && (
            <p role="alert" className="mt-4 text-sm text-red-700">
              Kunne ikke hente ledige datoer.{" "}
              <button className="underline" onClick={() => loadMonth(ym.year, ym.month)}>
                Prøv igjen
              </button>
            </p>
          )}
        </div>
      </div>

      {/* Sammendrag */}
      <form onSubmit={submit} className="h-fit rounded-3xl bg-forest p-6 text-white shadow-xl sm:p-8 lg:sticky lg:top-24" noValidate>
        <h2 className="font-display text-2xl font-semibold">Din bestilling</h2>

        <div className="mt-5 min-h-[4.5rem]">
          <AnimatePresence initial={false} mode="popLayout">
            {sortedCart.length === 0 ? (
              <motion.p
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm text-white/65"
              >
                Velg en eller flere datoer i kalenderen. Du kan kjøpe opptil {site.maxPerOrder} kort per bestilling.
              </motion.p>
            ) : (
              sortedCart.map((date) => (
                <motion.div
                  key={date}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center justify-between gap-3 border-b border-white/10 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{capitalize(formatLongDate(date))}</p>
                    {isFullDay(cart[date]) ? (
                      <p className="text-sm font-semibold text-glacier">
                        Hele dagen alene · ett kort gratis · {formatNok(linePrice(cart[date]))}
                      </p>
                    ) : (
                      <p className="text-sm text-white/60">
                        {formatNok(linePrice(cart[date]))}
                        {canTakeWholeDay(date) && (
                          <>
                            {" · "}
                            <button
                              type="button"
                              onClick={() => takeWholeDay(date)}
                              className="font-semibold text-glacier underline underline-offset-2"
                            >
                              Fisk alene: ta alle {site.cardsPerDay}, det siste er gratis
                            </button>
                          </>
                        )}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => step(date, -1)} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label={`Færre kort ${date}`}>−</button>
                    <span className="w-5 text-center font-bold" aria-live="polite">{cart[date]}</span>
                    <button type="button" onClick={() => step(date, 1)} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label={`Flere kort ${date}`}>+</button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        <div className="mt-5 flex items-baseline justify-between border-t border-white/15 pt-5">
          <span className="text-white/70">Totalt</span>
          <motion.span key={total} initial={{ scale: 1.15 }} animate={{ scale: 1 }} className="font-display text-3xl font-semibold text-glacier">
            {formatNok(total)}
          </motion.span>
        </div>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-white/80">Fullt navn (fisker)</span>
            <input
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/40 outline-none transition focus:border-glacier focus:bg-white/15"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              placeholder="Ola Nordmann"
              maxLength={80}
              required
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-white/80">E-post (her får du fiskekortet)</span>
            <input
              type="email"
              inputMode="email"
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/40 outline-none transition focus:border-glacier focus:bg-white/15"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="ola@eksempel.no"
              required
            />
          </label>
          <label className="flex cursor-pointer items-start gap-3 text-sm text-white/75">
            <input
              type="checkbox"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 accent-[#5fe0c2]"
            />
            <span>
              Jeg har lest og godtar{" "}
              <Link href="/vilkar" target="_blank" className="underline decoration-glacier underline-offset-2">
                vilkårene
              </Link>{" "}
              og{" "}
              <Link href="/regler" target="_blank" className="underline decoration-glacier underline-offset-2">
                reglene for fisket
              </Link>
              .
            </span>
          </label>
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              role="alert"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 overflow-hidden rounded-xl bg-red-500/20 px-4 py-3 text-sm text-red-100"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <button type="submit" disabled={!ready} className="btn btn-primary mt-6 w-full text-lg disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0">
          {submitting ? "Sender deg til betaling…" : totalQty > 0 ? `Gå til betaling · ${formatNok(total)}` : "Velg dato for å fortsette"}
        </button>
        <p className="mt-3 text-center text-xs text-white/55">
          Sikker betaling med Vipps eller kort via Stripe. Fiskekortet sendes på e-post rett etter betaling. Datoene holdes av for deg i {site.reservationMinutes} minutter mens du betaler.
        </p>
      </form>
    </div>
  );
}
