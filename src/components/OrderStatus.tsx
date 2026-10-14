"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { capitalize, formatLongDate, formatNok } from "@/lib/dates";

type Ready = {
  status: "ready";
  holder: string;
  email: string;
  amountNok: number;
  cards: { date: string; code: string }[];
};

export function OrderStatus({ sessionId }: { sessionId: string }) {
  const [data, setData] = useState<Ready | null>(null);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    let stop = false;
    let tries = 0;
    async function poll() {
      while (!stop && tries < 40) {
        tries++;
        try {
          const res = await fetch(`/api/ordre/${sessionId}`, { cache: "no-store" });
          const json = await res.json();
          if (json.status === "ready") {
            if (!stop) setData(json);
            return;
          }
        } catch {
          /* prøv igjen */
        }
        await new Promise((r) => setTimeout(r, 2000));
      }
      if (!stop) setTimedOut(true);
    }
    poll();
    return () => {
      stop = true;
    };
  }, [sessionId]);

  if (data) {
    return (
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-glacier/30">
          <motion.svg viewBox="0 0 24 24" className="h-10 w-10 text-water" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3, duration: 0.6 }} />
          </motion.svg>
        </div>
        <h1 className="mt-6 text-center font-display text-4xl font-semibold md:text-5xl">Takk, {data.holder.split(" ")[0]}!</h1>
        <p className="mx-auto mt-4 max-w-xl text-center text-lg text-ink/75">
          Betalingen er mottatt. Vi har sendt fiskekortet som PDF til <strong>{data.email}</strong>. Sjekk søppelpost hvis du ikke ser det om et par minutter.
        </p>

        <ul className="mx-auto mt-8 max-w-xl divide-y divide-line rounded-3xl border border-line bg-white">
          {data.cards.map((c) => (
            <li key={c.code} className="flex items-center justify-between gap-4 px-6 py-4">
              <span className="font-semibold">{capitalize(formatLongDate(c.date))}</span>
              <span className="rounded-lg bg-mist px-3 py-1 font-mono text-sm tracking-wider">{c.code}</span>
            </li>
          ))}
          <li className="flex justify-between px-6 py-4 text-sm text-ink/60">
            <span>Totalt betalt</span>
            <span>{formatNok(data.amountNok)}</span>
          </li>
        </ul>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={`/api/ordre/${sessionId}/pdf`} target="_blank" rel="noopener" className="btn btn-dark">
            Last ned fiskekort (PDF)
          </a>
          <Link href="/veibeskrivelse" className="btn border border-line bg-white text-ink hover:bg-mist">
            Veibeskrivelse
          </Link>
        </div>
      </motion.div>
    );
  }

  if (timedOut) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <h1 className="font-display text-3xl font-semibold">Vi bekrefter fortsatt betalingen</h1>
        <p className="mt-4 text-ink/75">
          Det tar litt lengre tid enn vanlig. Hvis betalingen gikk gjennom, kommer fiskekortet på e-post i løpet av få minutter. Har du ikke fått det innen en halvtime, ta kontakt, så hjelper vi deg.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl text-center" role="status" aria-live="polite">
      <div className="relative mx-auto grid h-20 w-20 place-items-center">
        <span className="absolute h-full w-full animate-ripple rounded-full border-2 border-water" />
        <span className="absolute h-full w-full animate-ripple rounded-full border-2 border-water [animation-delay:1.1s]" />
        <span className="h-4 w-4 rounded-full bg-water" />
      </div>
      <h1 className="mt-8 font-display text-3xl font-semibold">Bekrefter betalingen…</h1>
      <p className="mt-3 text-ink/70">Dette tar vanligvis noen sekunder. Ikke lukk siden.</p>
    </div>
  );
}
