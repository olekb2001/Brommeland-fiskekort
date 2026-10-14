import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Regler og grenser for fisket",
  description:
    "Grenser, regler og praktisk informasjon for fiske på Brommeland i Suldalslågen. Nedre grense er hølen ved gapahuken, øvre grense er skiltet «Brommeland Øvre».",
  alternates: { canonical: "/regler" },
};

export default function Regler() {
  return (
    <div className="bg-paper pb-24 pt-32 md:pt-40">
      <div className="container-x max-w-3xl">
        <p className="eyebrow">Regler</p>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-6xl">Regler og grenser</h1>

        <div className="prose-brom mt-10">
          <h2>Grenser for fisket</h2>
          <p>
            Hølen nede ved gapahuken er nedre grense for fisket. Øvre grense er merket med skiltet «Brommeland Øvre». Det er ikke tillatt å fiske ovenfor dette skiltet.
          </p>

          <h2>Hvor du fisker</h2>
          <p>
            Fisk på nordsiden av elva, motfiske mot Hiim. Valdet er {site.beatLengthM} meter langt og godt egnet for fluefiske, slukfiske og markfiske.
          </p>

          <h2>Kort og kvote</h2>
          <ul>
            <li>Det selges {site.cardsPerDay} døgnkort per døgn, til kr {site.priceNok} per døgn.</li>
            <li>Vil du fiske alene, kjøper du alle {site.cardsPerDay} kortene på en dag og får det siste gratis (kr {(site.cardsPerDay - 1) * site.priceNok} for hele dagen).</li>
            <li>Kortet gjelder på datoen som står på kortet, og for personen som er oppført.</li>
            <li>Ha med kortet som utskrift eller på mobil, og vis det ved kontroll.</li>
          </ul>

          <h2>Rapportering</h2>
          <p>Husk å rapportere all fangst.</p>

          <h2>Sesong</h2>
          <p>Sesongen varer ut september, så her kan du fiske når andre elver er stengt.</p>

          {site.extraRules.length > 0 && (
            <>
              <h2>Flere regler</h2>
              <ul>
                {site.extraRules.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </>
          )}
        </div>

        <Link href="/fiskekort" className="btn btn-dark mt-6">Kjøp fiskekort</Link>
      </div>
    </div>
  );
}
