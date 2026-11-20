"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

import { EASE_EDITORIAL } from "./easing";

type SplitTextProps = {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  /** Jeda sebelum kata pertama muncul (detik). */
  delay?: number;
  /** Jika true, animasi langsung jalan saat mount, bukan menunggu masuk viewport. */
  immediate?: boolean;
};

const word: Variants = {
  hidden: { opacity: 0, y: "0.6em" },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_EDITORIAL } },
};

/** Judul muncul per kata (stagger 0.08 s). Teks utuh tetap terbaca screen reader. */
export function SplitText({ text, as = "h2", className, delay = 0, immediate = false }: SplitTextProps) {
  const reduce = useReducedMotion();
  const Component = motion[as];
  const words = text.split(/\s+/).filter(Boolean);

  const trigger = immediate
    ? { animate: "visible" as const }
    : { whileInView: "visible" as const, viewport: { once: true, amount: 0.5 } };

  return (
    <Component
      className={className}
      aria-label={text}
      // Struktur DOM sama dengan render server (hindari hydration mismatch);
      // saat reduced-motion, kata langsung tampil di posisi akhir.
      initial={reduce ? false : "hidden"}
      {...trigger}
      variants={{ visible: { transition: { staggerChildren: 0.08, delayChildren: delay } } }}
    >
      {words.map((w, i) => (
        <span key={`${w}-${i}`} aria-hidden="true" className="inline-block overflow-hidden align-bottom">
          <motion.span className="inline-block" variants={word}>
            {w}
          </motion.span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </Component>
  );
}
