/**
 * Alt innhold og alle regler som eier av Brommeland kan måtte endre, samlet ett sted.
 * Felt merket TODO må bekreftes før lansering.
 */
export const site = {
  name: "Brommeland",
  tagline: "Fiskekort til Suldalslågen",
  description:
    "Kjøp fiskekort til Brommeland i Suldalslågen. 600 meter elv for fluefiske, slukfiske og markfiske. Betal med Vipps eller kort og få døgnkortet på e-post med en gang.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  locale: "nb_NO",

  /** Pris og kvote */
  priceNok: 350,
  cardsPerDay: 3,
  maxPerOrder: 3,
  beatLengthM: 600,

  /**
   * Sesong som måned-dag, gjelder hvert år.
   * TODO: Bekreft start. Elveguiden oppgir bare at sesongen varer ut september.
   */
  season: { start: "06-01", end: "09-30" },

  /** Kontaktinfo. TODO: Fyll inn ekte verdier. */
  contact: {
    email: "post@brommeland.no",
    phone: "" as string,
  },

  /** Juridisk info som vises i bunnteksten hvis utfylt. TODO */
  company: {
    legalName: "Brommeland",
    orgNr: "" as string,
    address: "" as string,
  },

  /**
   * Flere regler som vises på /regler (fangstbegrensning, fredningstid, utstyr, fiskeavgift osv.).
   * TODO: Eier fyller inn. Hold listen tom hvis ingenting skal vises.
   */
  extraRules: [] as string[],

  /** Hvor lenge en dato holdes av en pågående betaling (minutter). Stripe tillater minst 30. */
  reservationMinutes: 30,
} as const;

export const nav = [
  { href: "/", label: "Forside" },
  { href: "/veibeskrivelse", label: "Veibeskrivelse" },
  { href: "/regler", label: "Regler og grenser" },
  { href: "/fiskekort", label: "Kjøp fiskekort" },
] as const;

export const faq = [
  {
    q: "Hvordan får jeg fiskekortet?",
    a: "Du betaler på nettsiden med Vipps eller kort. Rett etter betaling sendes fiskekortet som PDF til e-postadressen du oppgir. Du kan skrive det ut eller vise det på mobilen.",
  },
  {
    q: "Hvor mange fiskekort selges per døgn?",
    a: "Det selges tre døgnkort per døgn. Det gir god plass langs de 600 meterne, og når en dato er utsolgt vises den som utilgjengelig i kalenderen.",
  },
  {
    q: "Hva koster fiskekortet?",
    a: "Et døgnkort koster 350 kroner per døgn. Kjøper du alle tre kortene samme dag, får du det tredje gratis, så hele dagen koster 700 kroner.",
  },
  {
    q: "Kan jeg fiske alene?",
    a: "Ja. Kjøper du alle tre kortene på en dag, har du valdet for deg selv, og det tredje kortet er gratis. Hele dagen koster da 700 kroner.",
  },
  {
    q: "Hvilke fiskemetoder passer?",
    a: "Valdet er godt egnet for fluefiske, slukfiske og markfiske.",
  },
  {
    q: "Hvor kan jeg fiske?",
    a: "Fisk fra nordsiden av elva og mot Hiim. Nedre grense er hølen ved gapahuken. Øvre grense er merket med skiltet «Brommeland Øvre», og fiske ovenfor skiltet er ikke tillatt.",
  },
  {
    q: "Når er sesongen?",
    a: "Sesongen varer ut september, så her kan du fiske når andre elver er stengt.",
  },
  {
    q: "Må jeg rapportere fangst?",
    a: "Ja, husk å rapportere all fangst.",
  },
] as const;
