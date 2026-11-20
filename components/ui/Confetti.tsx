"use client";

import { m, useReducedMotion } from "framer-motion";
import { useMemo } from "react";

type ConfettiProps = {
  /** Naikkan angka ini untuk meledakkan konfeti lagi; 0 = tidak tampil. */
  burst: number;
};

const COLORS = ["var(--accent)", "var(--fg)", "var(--muted)", "var(--line)"];
const COUNT = 26;

/** Konfeti kecil dari tengah elemen induk (induk harus `relative`). Mati saat reduced-motion. */
export function Confetti({ burst }: ConfettiProps) {
  const reduce = useReducedMotion();

  const pieces = useMemo(
    () =>
      Array.from({ length: burst ? COUNT : 0 }, (_, i) => {
        const angle = (Math.PI * 2 * i) / COUNT + Math.random() * 0.4;
        const distance = 70 + Math.random() * 90;
        return {
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance - 40,
          rotate: Math.random() * 540 - 270,
          color: COLORS[i % COLORS.length],
          size: 5 + Math.random() * 5,
          round: i % 3 === 0,
        };
      }),
    [burst],
  );

  if (!burst || reduce) return null;

  return (
    <div key={burst} className="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden="true">
      {pieces.map((p, i) => (
        <m.span
          key={i}
          className="absolute"
          style={{
            width: p.size,
            height: p.round ? p.size : p.size * 0.5,
            backgroundColor: p.color,
            borderRadius: p.round ? "9999px" : "1px",
          }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{ x: p.x, y: [0, p.y, p.y + 60], opacity: [1, 1, 0], rotate: p.rotate, scale: [1, 1, 0.6] }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], times: [0, 0.6, 1] }}
        />
      ))}
    </div>
  );
}
