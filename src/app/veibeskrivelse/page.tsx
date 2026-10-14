import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Veibeskrivelse til Brommeland",
  description:
    "Slik kommer du til Brommeland i Suldalslågen: kjør mot Grov, sving inn mot Juvåsen Ressurssenter og følg nettinggjerdet til stien.",
  alternates: { canonical: "/veibeskrivelse" },
};

const steps = [
  "Kjør mot Grov.",
  "Sving inn mot Juvåsen Ressurssenter.",
  "Når du kommer til Juvåsen svinger du til høyre og kjører utover kanten langs jordet til du er på parkeringsplassen.",
  "Fra parkeringsplassen følger du et nettinggjerde til du kommer til stien som leder ned til elva.",
];

export default function Veibeskrivelse() {
  return (
    <div className="bg-paper pb-24 pt-32 md:pt-40">
      <div className="container-x grid gap-14 lg:grid-cols-[1fr_1fr]">
        <div>
          <p className="eyebrow">Veibeskrivelse</p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-6xl">Slik finner du frem</h1>
          <div className="mt-10 space-y-5">
            {steps.map((s, i) => (
              <Reveal key={s} delay={i * 0.08}>
                <div className="flex gap-5 rounded-2xl border border-line bg-white p-5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-forest font-display text-lg font-semibold text-glacier">
                    {i + 1}
                  </span>
                  <p className="leading-relaxed text-ink/80">{s}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="mt-8 text-ink/70">
            Husk å lese <Link className="underline decoration-water underline-offset-2" href="/regler">reglene og grensene for fisket</Link> før du går ned til elva.
          </p>
          <Link href="/fiskekort" className="btn btn-dark mt-8">Kjøp fiskekort</Link>
        </div>

        <div className="grid gap-5">
          <Reveal>
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
              <Image src="/images/elv-sol.jpg" alt="Suldalslågen sett fra stien ved Brommeland" fill sizes="(min-width:1024px) 45vw, 100vw" className="object-cover" />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
              <Image src="/images/ildsted.jpg" alt="Ildsted under gapahuken ved Brommeland med utsikt til elva" fill sizes="(min-width:1024px) 45vw, 100vw" className="object-cover object-bottom" />
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
