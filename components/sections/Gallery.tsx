"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { Lightbox } from "@/components/ui/Lightbox";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

type GalleryProps = { images: string[]; coupleNames: string };

/**
 * Pola bento berulang per 6 foto, rapat tanpa lubang:
 * mobile 2 kolom (8 sel = 4 baris), desktop 4 kolom (12 sel = 3 baris).
 */
const BENTO = [
  "row-span-2 md:col-span-2 md:row-span-2",
  "md:row-span-2",
  "",
  "col-span-2",
  "",
  "md:col-span-2",
];

export function Gallery({ images, coupleNames }: GalleryProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const triggers = useRef<Array<HTMLButtonElement | null>>([]);
  const alt = (i: number) => `Foto ${coupleNames} ${i + 1} dari ${images.length}`;

  const close = () => {
    const last = openIndex;
    setOpenIndex(null);
    if (last !== null) triggers.current[last]?.focus();
  };

  return (
    <section id="galeri" className="mx-auto max-w-[1100px] px-6 py-24 md:px-10 md:py-32">
      <SectionHeading label="Galeri" title="Momen yang kami simpan." />

      <Reveal>
        <ul className="grid auto-rows-[150px] grid-cols-2 gap-3 [grid-auto-flow:dense] sm:auto-rows-[200px] md:grid-cols-4 md:auto-rows-[220px] md:gap-4">
          {images.map((src, i) => (
            <li key={src} className={cn("relative overflow-hidden rounded-2xl bg-line", BENTO[i % BENTO.length])}>
              <button
                ref={(el) => {
                  triggers.current[i] = el;
                }}
                type="button"
                onClick={() => setOpenIndex(i)}
                aria-label={`Perbesar ${alt(i).charAt(0).toLowerCase()}${alt(i).slice(1)}`}
                className="group absolute inset-0 size-full"
              >
                <Image
                  src={src}
                  alt={alt(i)}
                  fill
                  sizes="(min-width: 768px) 50vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-editorial group-hover:scale-105"
                />
              </button>
            </li>
          ))}
        </ul>
      </Reveal>

      <Lightbox images={images} alt={alt} index={openIndex} onIndexChange={setOpenIndex} onClose={close} />
    </section>
  );
}
