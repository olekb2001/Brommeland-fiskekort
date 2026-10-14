import type { Metadata } from "next";
import { capitalize, formatLongDate, todayOslo } from "@/lib/dates";
import { getCard, isCardVoid } from "@/lib/orders";

export const metadata: Metadata = {
  title: "Kontroll av fiskekort",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function Kontroll({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const safe = /^[A-Za-z0-9-]{5,16}$/.test(code) ? code.toUpperCase() : null;
  const card = safe ? await getCard(safe) : null;
  const today = todayOslo();

  let state: "valid" | "future" | "expired" | "void" | "unknown" = "unknown";
  if (card) {
    if (await isCardVoid(card.code)) state = "void";
    else state = card.date === today ? "valid" : card.date > today ? "future" : "expired";
  }

  const ui = {
    valid: { bg: "bg-water", title: "Gyldig i dag", text: "Kortet er gyldig for dagens dato." },
    future: { bg: "bg-timber", title: "Gyldig, men ikke i dag", text: "Kortet gjelder en senere dato." },
    void: { bg: "bg-red-700", title: "Kansellert", text: "Kortet er refundert og er ikke gyldig." },
    expired: { bg: "bg-ink/70", title: "Utløpt", text: "Datoen på kortet er passert." },
    unknown: { bg: "bg-red-700", title: "Ukjent kort", text: "Fant ikke noe fiskekort med denne koden." },
  }[state];

  return (
    <div className="bg-paper pb-24 pt-36">
      <div className="container-x max-w-lg">
        <div className={`rounded-3xl p-8 text-white ${ui.bg}`}>
          <p className="eyebrow !text-white/70">Brommeland · Kontroll</p>
          <h1 className="mt-2 font-display text-4xl font-semibold">{ui.title}</h1>
          <p className="mt-2 text-white/85">{ui.text}</p>
        </div>
        {card && (
          <dl className="mt-6 divide-y divide-line rounded-3xl border border-line bg-white">
            <div className="flex justify-between gap-4 px-6 py-4"><dt className="text-ink/60">Fisker</dt><dd className="font-semibold">{card.holder}</dd></div>
            <div className="flex justify-between gap-4 px-6 py-4"><dt className="text-ink/60">Dato</dt><dd className="font-semibold">{capitalize(formatLongDate(card.date))}</dd></div>
            <div className="flex justify-between gap-4 px-6 py-4"><dt className="text-ink/60">Kortkode</dt><dd className="font-mono font-semibold">{card.code}</dd></div>
          </dl>
        )}
      </div>
    </div>
  );
}
