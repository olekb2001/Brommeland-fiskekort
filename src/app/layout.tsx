import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { site } from "@/config/site";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export const viewport: Viewport = {
  themeColor: "#123c36",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} – ${site.tagline} | Laksefiske i Suldalslågen`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "fiskekort Suldalslågen",
    "Brommeland",
    "laksefiske Suldal",
    "døgnkort laks",
    "fluefiske Rogaland",
    "fiskekort Suldalslågen kjøp",
    "laksefiske Rogaland",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: site.locale,
    siteName: site.name,
    url: "/",
    title: `${site.name} – ${site.tagline}`,
    description: site.description,
    images: [{ url: "/images/og.jpg", width: 1200, height: 630, alt: "Suldalslågen ved Brommeland" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} – ${site.tagline}`,
    description: site.description,
    images: ["/images/og.jpg"],
  },
  // Sett NEXT_PUBLIC_NOINDEX=1 i Vercel mens siden er under utvikling. Fjern den ved lansering.
  robots: process.env.NEXT_PUBLIC_NOINDEX === "1" ? { index: false, follow: false } : { index: true, follow: true },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  url: site.url,
  logo: `${site.url}/icon.svg`,
  email: site.contact.email,
  ...(site.contact.phone ? { telephone: site.contact.phone } : {}),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nb" className={`${fraunces.variable} ${manrope.variable}`}>
      <body>
        <a
          href="#innhold"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-glacier focus:px-5 focus:py-2 focus:font-bold"
        >
          Hopp til innhold
        </a>
        <Header />
        <main id="innhold">{children}</main>
        <Footer />
        <JsonLd data={orgJsonLd} />
      </body>
    </html>
  );
}
