import type { Metadata } from "next";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Vilkår og personvern",
  description: "Kjøpsvilkår og personvernerklæring for fiskekort til Brommeland.",
  alternates: { canonical: "/vilkar" },
};

/**
 * TODO (eier): Les gjennom og tilpass før lansering. Dette er et utgangspunkt, ikke juridisk rådgivning.
 * Sjekk særlig angrerett, refusjon ved flom/stengt elv og behandlingsansvarlig.
 */
export default function Vilkar() {
  const { company, contact } = site;
  return (
    <div className="bg-paper pb-24 pt-32 md:pt-40">
      <div className="container-x max-w-3xl">
        <p className="eyebrow">Juridisk</p>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-6xl">Vilkår og personvern</h1>

        <div className="prose-brom mt-10">
          <h2>Selger</h2>
          <p>
            {company.legalName}
            {company.orgNr ? `, org.nr. ${company.orgNr}` : ""}
            {company.address ? `, ${company.address}` : ""}. Kontakt: <a href={`mailto:${contact.email}`}>{contact.email}</a>
            {contact.phone ? `, ${contact.phone}` : ""}.
          </p>

          <h2>Kjøp og betaling</h2>
          <p>
            Fiskekort kjøpes for en bestemt dato. Prisen er {site.priceNok} kroner per døgnkort, inkludert eventuelle avgifter. Betaling skjer med Vipps eller kort via betalingsleverandøren Stripe. Du mottar fiskekortet som PDF på e-postadressen du oppgir så snart betalingen er bekreftet. Oppgi riktig e-postadresse.
          </p>

          <h2>Angrerett og refusjon</h2>
          <p>
            Fiskekort gjelder en bestemt dato og er en tjeneste knyttet til en fastsatt tidsperiode, og er derfor unntatt fra angreretten etter angrerettloven. Kontakt oss hvis du ikke kan bruke kortet, så vurderer vi saken, for eksempel ved stengt elv eller sykdom.
          </p>

          <h2>Bruk av kortet</h2>
          <p>
            Kortet er personlig og gjelder bare på datoen som er oppgitt. Du må følge <a href="/regler">reglene og grensene for fisket</a>, og rapportere all fangst.
          </p>

          <h2>Personvern</h2>
          <p>
            Vi behandler navn og e-postadresse for å levere fiskekortet, kontrollere kortet i elva og oppfylle regnskapskrav. Betalingsopplysninger behandles av Stripe og lagres ikke hos oss. Vi bruker Resend for utsendelse av e-post og Upstash for lagring av bestillinger. Opplysningene deles ikke med andre og brukes ikke til markedsføring. Du kan be om innsyn, retting eller sletting ved å kontakte oss på <a href={`mailto:${contact.email}`}>{contact.email}</a>.
          </p>
          <p>
            Nettstedet bruker bare teknisk nødvendige informasjonskapsler, og ingen sporings- eller markedsføringsverktøy.
          </p>
        </div>
      </div>
    </div>
  );
}
