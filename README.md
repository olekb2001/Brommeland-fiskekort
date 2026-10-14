# Brommeland – fiskekort på nett

Nettside og bestillingssystem for fiskekort til Brommeland i Suldalslågen. Bygget med Next.js (React), Tailwind, Motion (animasjoner), Stripe (betaling), Resend (e-post) og Upstash Redis (lagring).

**Flyt:** velg dato i kalender → betal med Vipps/kort i Stripe → webhook lager kortkoder → PDF med QR-kode sendes på e-post. QR-koden åpner `/kontroll/<kode>` som viser om kortet er gyldig i dag.

## 1. Kom i gang lokalt

```bash
npm install
cp .env.example .env.local     # fyll inn nøkler, se under
npm run dev                    # http://localhost:3000
```

Uten nøkler vises siden og kalenderen fungerer (minnelagring), men betaling og e-post krever Stripe og Resend.

## 2. GitHub

```bash
git init
git add .
git commit -m "Første versjon av Brommeland"
git branch -M main
git remote add origin https://github.com/<bruker>/brommeland.git
git push -u origin main
```

## 3. Stripe (betaling)

1. Opprett konto på stripe.com og fullfør bedriftsverifiseringen (norsk foretak).
2. Kopier **Secret key** (`sk_test_...`) til `STRIPE_SECRET_KEY`.
3. Lokal webhook-testing: installer Stripe CLI og kjør
   `stripe listen --forward-to localhost:3000/api/webhook`. Kopier `whsec_...` til `STRIPE_WEBHOOK_SECRET`.
4. Testbetaling: kort `4242 4242 4242 4242`, valgfri fremtidig utløpsdato og CVC.
5. Produksjon: Dashboard → Developers → Webhooks → legg til `https://ditt-domene.no/api/webhook` med hendelsene
   `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired` og `charge.refunded`. Full refusjon i Stripe gjør da kortene ugyldige og frigir datoene automatisk. Bruk den nye `whsec_...`-verdien og bytt til live-nøkkel (`sk_live_...`).

**Vipps:** Siden bruker Stripe Checkout uten fast liste over betalingsmetoder, så alt du slår på under Dashboard → Settings → Payment methods dukker opp automatisk (kort, Apple Pay, Google Pay). Vipps via Stripe var da dette ble skrevet i privat forhåndsvisning og må søkes om hos Stripe (se docs.stripe.com/payments/vipps). Hvis du ikke får tilgang kan du i stedet koble til Vipps MobilePay direkte (ePayment API). Si fra, så bygger vi det som en ekstra betalingsmetode.

## 4. E-post (Resend)

1. Opprett konto på resend.com, legg til og verifiser domenet ditt (DNS-oppføringer hos domeneleverandøren).
2. `RESEND_API_KEY` = API-nøkkel, `MAIL_FROM` = for eksempel `Brommeland <fiskekort@ditt-domene.no>`.
3. `ORDER_NOTIFY_EMAIL` (valgfri) får en skjult kopi av hver bestilling.

## 5. Lagring (Upstash Redis)

Tilgjengelighet (3 kort per døgn) og fiskekort lagres i Redis. Opprett en gratis database på upstash.com (eller via Vercel Marketplace) og sett `UPSTASH_REDIS_REST_URL` og `UPSTASH_REDIS_REST_TOKEN`. **Uten disse brukes minnelagring som nullstilles, og skal aldri brukes i produksjon.**

## 6. Hosting

Siden trenger en server (API-ruter og webhook), så vanlig webhotell med bare statiske filer/PHP fungerer ikke. Anbefalt: **Vercel** (gratis for å starte, støtter Next.js direkte).

1. vercel.com → New Project → importer GitHub-repoet.
2. Legg inn alle miljøvariablene fra `.env.example` (sett `NEXT_PUBLIC_SITE_URL` til det ekte domenet, uten skråstrek på slutten).
3. Deploy, legg til eget domene under Settings → Domains, og oppdater Stripe-webhooken til det domenet.

## 7. Må fylles ut før lansering

- `src/config/site.ts`: `contact` (e-post, telefon), `company` (navn, org.nr., adresse), `season.start` (bekreft sesongstart), `extraRules` (fangstregler, fredningstid, utstyr m.m.).
- `src/app/vilkar/page.tsx`: les gjennom vilkår og personvern og få dem godkjent.
- Bytt `MAIL_FROM`-domenet og test hele kjøpet i Stripes testmodus før live.
- Finn ut om dagens regler krever noe mer på kortet (for eksempel fiskeavgift eller lokale vilkår) og legg det i `extraRules`.

## Admin (`/admin`)

Sett `ADMIN_PASSWORD` (et langt passord) i `.env.local` og i Vercel, og start serveren på nytt. Gå til `/admin` for å:

- **Stenge og åpne dager** (flom, privat bruk): stengte dager vises som «Stengt» i kalenderen og kan ikke kjøpes.
- **Legge inn kort solgt utenom nettsiden** (+/−): trekkes fra det som er ledig.
- **Se de siste 100 bestillingene** med navn, e-post, kortkoder og beløp.

Innloggingen varer i 12 timer. Siden er blokkert for søkemotorer.

## Struktur

```
src/app/            sider og API-ruter (checkout, webhook, availability, ordre)
src/components/     Hero, Booking (kalender), Gallery, Faq, Header, Footer m.m.
src/config/site.ts  tekster, pris, kvote, sesong, FAQ
src/lib/            lagring, tilgjengelighet, ordre, PDF, e-post
public/images/      bilder
```

## SEO

Metadata og Open Graph per side, `sitemap.xml` og `robots.txt` (genereres), JSON-LD (Organization, TouristAttraction, Product/Offer, FAQPage), semantisk HTML, norsk `lang`, bilder med alt-tekst og automatisk optimalisering (AVIF/WebP). Etter lansering: legg domenet inn i Google Search Console og send inn `sitemap.xml`.
