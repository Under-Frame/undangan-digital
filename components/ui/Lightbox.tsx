"use client";

import { AnimatePresence, m, useReducedMotion, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef } from "react";

import { EASE_EDITORIAL } from "@/components/motion/easing";

type LightboxProps = {
  images: string[];
  alt: (index: number) => string;
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
};

const SWIPE_THRESHOLD = 60;

/** Foto fullscreen: swipe kiri/kanan, tombol tutup, keyboard ←/→/Esc. */
export function Lightbox({ images, alt, index, onIndexChange, onClose }: LightboxProps) {
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const open = index !== null;
  const total = images.length;

  const go = (delta: number) => {
    if (index === null) return;
    onIndexChange((index + delta + total) % total);
  };

  // Keyboard, kunci scroll, fokus awal.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Tab") {
        // Jebak fokus di dalam dialog.
        const focusables = dialogRef.current?.querySelectorAll<HTMLElement>("button");
        if (!focusables?.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
    // go/onClose berubah tiap render; cukup daftar ulang saat index berubah.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_THRESHOLD) go(1);
    else if (info.offset.x > SWIPE_THRESHOLD) go(-1);
  };

  return (
    <AnimatePresence>
      {index !== null ? (
        <m.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Galeri foto"
          className="fixed inset-0 z-50 flex flex-col bg-scrim text-on-image"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.3 }}
        >
          <div className="flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))]">
            <p className="label-caps tabular-nums" aria-live="polite">
              {index + 1} / {total}
            </p>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Tutup galeri"
              className="grid size-12 place-items-center rounded-full border border-on-image/30 hover:bg-on-image/10"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <div className="relative flex-1 overflow-hidden">
            <AnimatePresence initial={false} mode="popLayout">
              <m.div
                key={index}
                className="absolute inset-4 touch-pan-y md:inset-12"
                drag={total > 1 ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6}
                onDragEnd={onDragEnd}
                initial={reduce ? false : { opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0 }}
                transition={{ duration: 0.4, ease: EASE_EDITORIAL }}
              >
                <Image
                  src={images[index]}
                  alt={alt(index)}
                  fill
                  sizes="100vw"
                  draggable={false}
                  className="pointer-events-none object-contain select-none"
                />
              </m.div>
            </AnimatePresence>
          </div>

          {total > 1 ? (
            <div className="flex items-center justify-center gap-4 px-4 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Foto sebelumnya"
                className="grid size-12 place-items-center rounded-full border border-on-image/30 hover:bg-on-image/10"
              >
                <ChevronLeft className="size-5" aria-hidden="true" />
              </button>
              <p className="label-caps opacity-70">Geser untuk berpindah</p>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Foto berikutnya"
                className="grid size-12 place-items-center rounded-full border border-on-image/30 hover:bg-on-image/10"
              >
                <ChevronRight className="size-5" aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}
