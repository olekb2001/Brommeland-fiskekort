import Link from "next/link";
import { nav, site } from "@/config/site";
import { Logo } from "./Logo";

export function Footer() {
  const { company, contact } = site;
  return (
    <footer className="bg-ink text-white/80">
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo light />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/65">
            {site.description}
          </p>
        </div>

        <nav aria-label="Bunnmeny">
          <h2 className="eyebrow !text-glacier">Sider</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="transition-colors hover:text-glacier">
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/vilkar" className="transition-colors hover:text-glacier">
                Vilkår og personvern
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="eyebrow !text-glacier">Kontakt</h2>
          <address className="mt-4 space-y-2 text-sm not-italic">
            <p>
              <a href={`mailto:${contact.email}`} className="transition-colors hover:text-glacier">
                {contact.email}
              </a>
            </p>
            {contact.phone && (
              <p>
                <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="transition-colors hover:text-glacier">
                  {contact.phone}
                </a>
              </p>
            )}
            {company.address && <p>{company.address}</p>}
            {company.orgNr && <p>Org.nr. {company.orgNr}</p>}
          </address>
          <p className="mt-6 text-xs text-white/50">Betaling med Vipps eller kort via Stripe.</p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col justify-between gap-2 py-5 text-xs text-white/45 sm:flex-row">
          <p>© {new Date().getFullYear()} {company.legalName}. Alle rettigheter reservert.</p>
          <p>Suldalslågen, Rogaland</p>
        </div>
      </div>
    </footer>
  );
}
