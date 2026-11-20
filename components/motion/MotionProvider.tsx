"use client";

import { LazyMotion } from "framer-motion";
import type { ReactNode } from "react";

const loadFeatures = () => import("./features").then((mod) => mod.default);

/**
 * Framer Motion versi ringan: komponen memakai `m.*` (bukan `motion.*`) dan fitur animasinya
 * dimuat asinkron setelah halaman tampil → JavaScript awal lebih kecil, halaman lebih cepat interaktif.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      {children}
    </LazyMotion>
  );
}
