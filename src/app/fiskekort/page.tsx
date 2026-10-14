import type { Metadata } from "next";
import { Booking } from "@/components/Booking";
import { site } from "@/config/site";
import { formatNok } from "@/lib/dates";

export const metadata: Metadata = {
  title: "Kjøp fiskekort",
  description: `Velg dato og kjøp døgnkort til Brommeland i Suldalslågen for ${formatNok(site.priceNok)}. Betal med Vipps eller kort og få fiskekortet på e-post med en gang.`,
  alternates: { canonical: "/fiskekort" },
};

export default async function FiskekortPage({
  searchParams,
}: {
  searchParams: Promise<{ avbrutt?: string }>;
}) {
  const { avbrutt } = await searchParams;
  return (
    <div className="bg-paper pb-24 pt-32 md:pt-40">
      <div className="container-x">
        <p className="eyebrow">Fiskekort</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-tight md:text-6xl">
          Velg dato og kjøp døgnkort
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-ink/70">
          {formatNok(site.priceNok)} per døgn. Maks {site.cardsPerDay} kort selges per dag, og du kan kjøpe opptil {site.maxPerOrder} per bestilling.
        </p>
        <div className="mt-12">
          <Booking cancelled={avbrutt === "1"} />
        </div>
      </div>
    </div>
  );
}
