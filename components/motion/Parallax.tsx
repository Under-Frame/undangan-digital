"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

type ParallaxProps = {
  children: ReactNode;
  className?: string;
  /**
   * "hero": progres dihitung dari atas halaman sampai elemen keluar layar (untuk cover).
   * "inview": progres selama elemen melintasi layar (untuk foto penutup).
   */
  mode?: "hero" | "inview";
};

/** Zoom pelan saat scroll (scale 1 → 1.1). Diam jika reduced-motion. */
export function Parallax({ children, className, mode = "inview" }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: mode === "hero" ? ["start start", "end start"] : ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1, 1.1]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className ?? ""}`}>
      <motion.div className="absolute inset-0 will-change-transform" style={{ scale }}>
        {children}
      </motion.div>
    </div>
  );
}
