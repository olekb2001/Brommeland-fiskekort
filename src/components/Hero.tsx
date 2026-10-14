"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { site } from "@/config/site";
import { formatNok } from "@/lib/dates";

const word = {
  hidden: { opacity: 0, y: 40, rotateX: -40 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { delay: 0.25 + i * 0.12, duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "18%"]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const headline = ["Fisk", "i", "Suldalslågens", "grønne", "vann"];

  return (
    <section ref={ref} className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-forest">
      <motion.div className="absolute inset-0 -z-10" style={{ y: imgY }}>
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src="/images/hero-elv.jpg"
            alt="Suldalslågen ved Brommeland en solskinnsdag, med skog langs elva og fjell i bakgrunnen"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/35 to-ink/45" />
      </motion.div>

      <motion.div style={{ opacity: fade }} className="container-x relative pb-24 pt-40 md:pb-32">
        <motion.p
          className="eyebrow !text-glacier"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.7 }}
        >
          {site.beatLengthM} meter elv · Fiskekort på nett
        </motion.p>

        <h1 className="mt-5 max-w-4xl font-display text-[2.7rem] font-semibold leading-[1.04] text-white sm:text-6xl md:text-7xl" style={{ perspective: 800 }}>
          {headline.map((w, i) => (
            <motion.span
              key={w + i}
              custom={i}
              variants={word}
              initial="hidden"
              animate="show"
              className="mr-[0.25em] inline-block origin-bottom"
            >
              {w}
            </motion.span>
          ))}
        </h1>

        <motion.p
          className="mt-6 max-w-xl text-lg leading-relaxed text-white/85"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          Døgnkort til Brommeland for flue, sluk og mark. Betal med Vipps eller kort, og få fiskekortet på e-post i løpet av sekunder.
        </motion.p>

        <motion.div
          className="mt-9 flex flex-wrap items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <Link href="/fiskekort" className="btn btn-primary text-lg">
            Kjøp fiskekort · {formatNok(site.priceNok)}
            <span aria-hidden="true">→</span>
          </Link>
          <Link href="/veibeskrivelse" className="btn btn-ghost">
            Se veibeskrivelse
          </Link>
        </motion.div>
      </motion.div>

      {/* Rullindikator */}
      <motion.div
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 md:block"
        style={{ opacity: fade }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        aria-hidden="true"
      >
        <div className="relative grid h-10 w-6 place-items-start justify-center rounded-full border border-white/50 pt-2">
          <motion.span
            className="block h-2 w-1 rounded-full bg-white"
            animate={{ y: [0, 14, 0], opacity: [1, 0.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </section>
  );
}
