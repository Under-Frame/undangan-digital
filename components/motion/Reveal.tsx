"use client";

import { m, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import { EASE_EDITORIAL } from "./easing";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Jeda sebelum mulai (detik). */
  delay?: number;
  as?: "div" | "section" | "li" | "article";
};

/** Fade + naik 24 px saat masuk viewport, sekali saja. Tanpa gerak jika reduced-motion. */
export function Reveal({ children, className, delay = 0, as = "div" }: RevealProps) {
  const reduce = useReducedMotion();
  const Component = m[as];

  return (
    <Component
      className={className}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: EASE_EDITORIAL, delay }}
    >
      {children}
    </Component>
  );
}
