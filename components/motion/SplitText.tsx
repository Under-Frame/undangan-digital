"use client";

import { m, useReducedMotion, type Variants } from "framer-motion";
import type { CSSProperties } from "react";

import { EASE_EDITORIAL } from "./easing";

type SplitTextProps = {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  /** Jeda sebelum kata pertama muncul (detik). */
  delay?: number;
  /**
   * true: animasi langsung jalan saat halaman tampil, memakai CSS murni (tanpa menunggu JavaScript)
   * — dipakai untuk judul di atas lipatan (cover) agar LCP cepat.
   * false: animasi saat masuk viewport (Framer Motion).
   */
  immediate?: boolean;
};

const STAGGER = 0.08;

const word: Variants = {
  hidden: { opacity: 0, y: "0.6em" },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_EDITORIAL } },
};

/** Judul muncul per kata (stagger 0.08 s). Teks utuh tetap terbaca screen reader. */
export function SplitText({ text, as = "h2", className, delay = 0, immediate = false }: SplitTextProps) {
  const reduce = useReducedMotion();
  const words = text.split(/\s+/).filter(Boolean);

  if (immediate) {
    const Tag = as;
    return (
      <Tag className={className} aria-label={text}>
        {words.map((w, i) => (
          <span key={`${w}-${i}`} aria-hidden="true" className="inline-block overflow-hidden align-bottom">
            <span
              className="animate-word inline-block"
              style={{ animationDelay: `${delay + i * STAGGER}s` } as CSSProperties}
            >
              {w}
            </span>
            {i < words.length - 1 ? "\u00A0" : null}
          </span>
        ))}
      </Tag>
    );
  }

  const Component = m[as];
  return (
    <Component
      className={className}
      aria-label={text}
      // Struktur DOM sama dengan render server (hindari hydration mismatch);
      // saat reduced-motion, kata langsung tampil di posisi akhir.
      initial={reduce ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      variants={{ visible: { transition: { staggerChildren: STAGGER, delayChildren: delay } } }}
    >
      {words.map((w, i) => (
        <span key={`${w}-${i}`} aria-hidden="true" className="inline-block overflow-hidden align-bottom">
          <m.span className="inline-block" variants={word}>
            {w}
          </m.span>
          {i < words.length - 1 ? "\u00A0" : null}
        </span>
      ))}
    </Component>
  );
}
