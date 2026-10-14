"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav } from "@/config/site";
import { Logo } from "./Logo";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const overHero = pathname === "/" && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const dark = overHero || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open
          ? "bg-paper/90 shadow-[0_1px_0_0_var(--color-line)] backdrop-blur-md"
          : "bg-transparent"
      } ${open ? "!bg-forest" : ""}`}
    >
      <div className="container-x flex h-[4.5rem] items-center justify-between">
        <Link href="/" aria-label="Brommeland, til forsiden">
          <Logo light={dark} />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Hovedmeny">
          {nav
            .filter((n) => n.href !== "/fiskekort")
            .map((n) => (
              <Link
                key={n.href}
                href={n.href}
                aria-current={pathname === n.href ? "page" : undefined}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  overHero ? "text-white/90 hover:bg-white/10" : "text-ink/80 hover:bg-mist"
                } ${pathname === n.href ? "underline decoration-glacier decoration-2 underline-offset-8" : ""}`}
              >
                {n.label}
              </Link>
            ))}
          <Link href="/fiskekort" className="btn btn-primary ml-3 !px-5 !py-2.5 text-sm">
            Kjøp fiskekort
          </Link>
        </nav>

        <button
          type="button"
          className={`relative z-10 grid h-11 w-11 place-items-center rounded-full md:hidden ${dark ? "text-white" : "text-ink"}`}
          aria-expanded={open}
          aria-controls="mobilmeny"
          aria-label={open ? "Lukk meny" : "Åpne meny"}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="relative block h-4 w-6">
            <span
              className={`absolute left-0 h-0.5 w-6 rounded bg-current transition-all ${open ? "top-1.5 rotate-45" : "top-0"}`}
            />
            <span
              className={`absolute left-0 top-1.5 h-0.5 w-6 rounded bg-current transition-opacity ${open ? "opacity-0" : ""}`}
            />
            <span
              className={`absolute left-0 h-0.5 w-6 rounded bg-current transition-all ${open ? "top-1.5 -rotate-45" : "top-3"}`}
            />
          </span>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobilmeny"
            aria-label="Mobilmeny"
            className="overflow-hidden bg-forest md:hidden"
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <ul className="container-x flex flex-col gap-1 pb-8 pt-2">
              {nav.map((n, i) => (
                <motion.li
                  key={n.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i + 0.1 }}
                >
                  <Link
                    href={n.href}
                    className={`block rounded-xl px-3 py-3 font-display text-2xl ${
                      n.href === "/fiskekort" ? "text-glacier" : "text-white"
                    }`}
                  >
                    {n.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
