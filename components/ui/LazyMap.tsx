"use client";

import { useEffect, useRef, useState } from "react";

type LazyMapProps = { src: string; title: string };

/**
 * Embed Google Maps yang baru dimuat saat mendekati layar (± 600 px),
 * agar skrip Maps (~400 KB) tidak memperlambat pembukaan undangan.
 */
export function LazyMap({ src, title }: LazyMapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="mt-6 aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-line">
      {visible ? (
        <iframe
          src={src}
          title={title}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          className="size-full grayscale-[35%]"
        />
      ) : null}
    </div>
  );
}
