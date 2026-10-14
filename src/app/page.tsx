import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CountUp } from "@/components/CountUp";
import { Faq } from "@/components/Faq";
import { Gallery } from "@/components/Gallery";
import { Hero } from "@/components/Hero";
import { JsonLd } from "@/components/JsonLd";
import { Reveal } from "@/components/Reveal";
import { WaveDivider } from "@/components/WaveDivider";
import { faq, site } from "@/config/site";
import { formatNok } from "@/lib/dates";

export const metadata: Metadata = {
  title: { absolute: `Fiskekort Suldalslågen – Brommeland | Døgnkort laksefiske` },
  description: site.description,
  alternates: { canonical: "/" },
};

const methods = [
  {
    title: "Fluefiske",
    text: "Valdet er godt egnet for fluefiske, med 600 meter elv å boltre seg på.",
    icon: "M4 20c3-8 8-12 16-14M4 20l3-1M20 6l-1 4",
  },
  {
    title: "Slukfiske",
    text: "Kast med sluk eller wobbler fra nordsiden av elva, motfiske mot Hiim.",
    icon: "M12 3v6m0 0c-3 0-5 2-5 5s2 7 5 7 5-4 5-7-2-5-5-5z",
  },
  {
    title: "Markfiske",
    text: "Tillatt og godt egnet, for deg som foretrekker å fiske med mark.",
    icon: "M3 12c3-5 6-5 9 0s6 5 9 0",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "TouristAttraction",
      "@id": `${site.url}/#fisket`,
      name: "Brommeland – laksefiske i Suldalslågen",
      description: site.description,
      url: site.url,
      image: `${site.url}/images/og.jpg`,
      touristType: "Sportsfiskere",
      address: { "@type": "PostalAddress", addressRegion: "Rogaland", addressCountry: "NO", addressLocality: "Suldal" },
    },
    {
      "@type": "Product",
      name: "Døgnkort Brommeland",
      description: "Fiskekort for ett døgn til Brommeland i Suldalslågen. Sendes på e-post som PDF.",
      image: `${site.url}/images/og.jpg`,
      brand: { "@type": "Brand", name: site.name },
      offers: {
        "@type": "Offer",
        url: `${site.url}/fiskekort`,
        priceCurrency: "NOK",
        price: site.priceNok,
        availability: "https://schema.org/InStock",
        seller: { "@type": "Organization", name: site.name },
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

export default function Home() {
  return (
    <>
      <Hero />

      {/* Nøkkeltall */}
      <section aria-label="Nøkkeltall" className="relative bg-forest text-white">
        <div className="container-x grid grid-cols-2 gap-8 py-14 md:grid-cols-4">
          {[
            { v: site.beatLengthM, s: " m", l: "elv å fiske på" },
            { v: site.cardsPerDay, s: "", l: "kort per døgn" },
            { v: site.priceNok, s: " kr", l: "per døgnkort" },
            { v: 30, s: " sep", l: "sesongen varer ut" },
          ].map((s, i) => (
            <Reveal key={s.l} delay={i * 0.08} className="text-center md:text-left">
              <p className="font-display text-5xl font-semibold text-glacier md:text-6xl">
                <CountUp to={s.v} suffix={s.s} />
              </p>
              <p className="mt-2 text-sm uppercase tracking-widest text-white/60">{s.l}</p>
            </Reveal>
          ))}
        </div>
        <WaveDivider to="#f7f4ec" />
      </section>

      {/* Om fisket */}
      <section className="bg-paper py-20 md:py-28">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <p className="eyebrow">Om valdet</p>
            <h2 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-5xl">
              Et fint vald, godt tilrettelagt for fiskeren
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-ink/75">
              Brommeland er et fint vald i Suldalslågen, godt egnet for fluefiske, slukfiske og markfiske. Du fisker fra nordsiden av elva, motfiske mot Hiim, og det selges bare tre døgnkort per dag, så det er god plass.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-ink/75">
              Valdet er godt tilrettelagt med en stor gapahuk på stedet, med tak over hodet, bord og fin utsikt til elva. Sesongen varer ut september, så her kan du fiske når andre elver er stengt.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/fiskekort" className="btn btn-dark">Velg dato og kjøp kort</Link>
              <Link href="/regler" className="btn border border-line bg-white hover:bg-mist">Regler og grenser</Link>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-2xl">
                <Image
                  src="/images/gapahuk-utsikt.jpg"
                  alt="Utsikt over Suldalslågen fra gapahuken ved Brommeland, med ildsted i forgrunnen"
                  fill
                  sizes="(min-width: 1024px) 40vw, 90vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-4 rounded-2xl bg-white px-6 py-4 shadow-xl md:-left-8">
                <p className="eyebrow">Fra</p>
                <p className="font-display text-3xl font-semibold">{formatNok(site.priceNok)}</p>
                <p className="text-sm text-ink/60">per døgn</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Metoder */}
      <section className="bg-mist py-20 md:py-28">
        <div className="container-x">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Fiskemetoder</p>
            <h2 className="mt-3 font-display text-4xl font-semibold md:text-5xl">Fisk slik du liker best</h2>
          </Reveal>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {methods.map((m, i) => (
              <Reveal key={m.title} delay={i * 0.1} className="h-full">
                <article className="group h-full rounded-3xl border border-line bg-white p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_30px_60px_-30px_rgba(10,31,29,0.4)]">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-forest text-glacier transition-transform duration-300 group-hover:rotate-6">
                    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d={m.icon} />
                    </svg>
                  </span>
                  <h3 className="mt-6 font-display text-2xl font-semibold">{m.title}</h3>
                  <p className="mt-3 leading-relaxed text-ink/70">{m.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Galleri */}
      <section className="bg-paper py-20 md:py-28" aria-labelledby="galleri">
        <div className="container-x">
          <Reveal className="mb-12 max-w-2xl">
            <p className="eyebrow">Galleri</p>
            <h2 id="galleri" className="mt-3 font-display text-4xl font-semibold md:text-5xl">
              Se hva som venter
            </h2>
          </Reveal>
          <Gallery />
        </div>
      </section>

      {/* Slik fungerer det */}
      <section className="relative overflow-hidden bg-forest py-20 text-white md:py-28">
        <div className="container-x">
          <Reveal className="max-w-2xl">
            <p className="eyebrow !text-glacier">Slik fungerer det</p>
            <h2 className="mt-3 font-display text-4xl font-semibold md:text-5xl">Fra kalender til elvebredd på minutter</h2>
          </Reveal>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              { t: "Velg dato", d: "Se ledige kort i kalenderen og velg dagene du vil fiske." },
              { t: "Betal", d: "Betal trygt med Vipps eller kort. Datoene holdes av mens du betaler." },
              { t: "Få kortet på e-post", d: "Fiskekortet kommer som PDF med en gang. Skriv det ut eller vis det på mobilen." },
            ].map((s, i) => (
              <Reveal key={s.t} delay={i * 0.12} className="h-full">
                <div className="h-full rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
                  <span className="font-display text-6xl font-semibold text-glacier/80">{i + 1}</span>
                  <h3 className="mt-4 font-display text-2xl font-semibold">{s.t}</h3>
                  <p className="mt-2 leading-relaxed text-white/70">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.3} className="mt-12">
            <Link href="/fiskekort" className="btn btn-primary text-lg">Kjøp fiskekort →</Link>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-paper py-20 md:py-28" aria-labelledby="faq">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.6fr]">
          <Reveal>
            <p className="eyebrow">Spørsmål og svar</p>
            <h2 id="faq" className="mt-3 font-display text-4xl font-semibold md:text-5xl">Det de fleste lurer på</h2>
            <p className="mt-4 text-ink/70">
              Finner du ikke svaret? Skriv til <a className="underline decoration-water underline-offset-2" href={`mailto:${site.contact.email}`}>{site.contact.email}</a>.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <Faq />
          </Reveal>
        </div>
      </section>

      <JsonLd data={jsonLd} />
    </>
  );
}
