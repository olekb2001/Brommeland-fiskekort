"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

type Photo = { src: string; alt: string; w: number; h: number; span?: string };

const photos: Photo[] = [
  {
    src: "/images/elv-oppefra.jpg",
    alt: "Suldalslågen sett ovenfra med turkisk, krystallklart vann og furuskog",
    w: 899,
    h: 1599,
    span: "md:row-span-2",
  },
  {
    src: "/images/laks-i-vann.jpg",
    alt: "Laks som holdes i det klare elvevannet før den slippes ut igjen",
    w: 1350,
    h: 1800,
  },
  {
    src: "/images/elv-sol.jpg",
    alt: "Solskinn på strykene i Suldalslågen mellom furutrær",
    w: 1212,
    h: 899,
  },
  {
    src: "/images/laks-fluestang.jpg",
    alt: "Laks ved siden av fluestang og fluehjul på steinene ved elva",
    w: 1070,
    h: 1046,
  },
  {
    src: "/images/laks-wobbler.jpg",
    alt: "Laks tatt på wobbler, liggende i gresset ved elvebredden",
    w: 1170,
    h: 1560,
    span: "md:row-span-2",
  },
  {
    src: "/images/laks-fluehjul.jpg",
    alt: "Fersk laks på bredden ved siden av fluestang med fluehjul",
    w: 1080,
    h: 1421,
  },
];

export function Gallery() {
  const [active, setActive] = useState<number | null>(null);
  const close = useCallback(() => setActive(null), []);

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") setActive((i) => (i === null ? i : (i + 1) % photos.length));
      if (e.key === "ArrowLeft") setActive((i) => (i === null ? i : (i - 1 + photos.length) % photos.length));
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active, close]);

  return (
    <>
      <ul className="grid auto-rows-[14rem] grid-cols-2 gap-3 md:auto-rows-[16rem] md:grid-cols-3 md:gap-4">
        {photos.map((p, i) => (
          <motion.li
            key={p.src}
            className={`group relative overflow-hidden rounded-3xl ${p.span ?? ""}`}
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: (i % 3) * 0.08 }}
          >
            <button
              type="button"
              onClick={() => setActive(i)}
              className="absolute inset-0 block h-full w-full cursor-zoom-in"
              aria-label={`Forstørr bilde: ${p.alt}`}
            >
              <Image
                src={p.src}
                alt={p.alt}
                fill
                sizes="(min-width: 768px) 33vw, 50vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-ink/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </button>
          </motion.li>
        ))}
      </ul>

      <AnimatePresence>
        {active !== null && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Bildevisning"
            className="fixed inset-0 z-[70] grid place-items-center bg-ink/95 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <motion.div
              key={active}
              className="relative h-[85vh] w-full max-w-4xl"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image src={photos[active].src} alt={photos[active].alt} fill sizes="100vw" className="object-contain" />
            </motion.div>
            <button
              type="button"
              onClick={close}
              className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20"
              aria-label="Lukk"
            >
              ×
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActive((active - 1 + photos.length) % photos.length);
              }}
              className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20"
              aria-label="Forrige bilde"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActive((active + 1) % photos.length);
              }}
              className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20"
              aria-label="Neste bilde"
            >
              ›
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
