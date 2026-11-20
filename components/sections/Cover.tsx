"use client";

import { ChevronDown, MailOpen } from "lucide-react";
import Image from "next/image";

import { Parallax } from "@/components/motion/Parallax";
import { SplitText } from "@/components/motion/SplitText";

export type CoverProps = {
  coupleNames: string;
  dateLabel: string;
  image: string;
  guestName: string;
  /** id section tujuan untuk petunjuk "gulir" setelah dibuka. */
  nextSectionId: string;
  opened: boolean;
  onOpen: () => void;
};

export function Cover({ coupleNames, dateLabel, image, guestName, nextSectionId, opened, onOpen }: CoverProps) {
  // Animasi masuk memakai CSS (bukan Framer Motion) agar cover tampil tanpa menunggu JavaScript.
  const fadeUp = (delay: number) => ({ style: { animationDelay: `${delay}s` } });

  return (
    <header id="home" className="relative h-svh min-h-[600px] overflow-hidden text-on-image">
      <Parallax mode="hero" className="absolute inset-0">
        <Image src={image} alt={`Foto sampul ${coupleNames}`} fill priority sizes="100vw" className="object-cover" />
      </Parallax>
      <div className="absolute inset-0 bg-overlay" aria-hidden="true" />

      <div className="relative mx-auto flex h-full max-w-[1100px] flex-col px-6 pt-[max(3rem,env(safe-area-inset-top))] pb-12 md:px-10">
        <p {...fadeUp(0)} className="label-caps animate-fade-up">
          The Wedding of
        </p>

        <div className="mt-auto">
          <SplitText
            as="h1"
            text={coupleNames}
            immediate
            delay={0.15}
            className="text-[clamp(3.5rem,17vw,4.5rem)] leading-[0.95] md:text-[clamp(4.5rem,8vw,6.5rem)]"
          />
          <div {...fadeUp(0.5)} className="animate-fade-up mt-6 flex items-center gap-4">
            <span className="h-px w-12 bg-on-image/60" aria-hidden="true" />
            <p className="label-caps">{dateLabel}</p>
          </div>

          <div {...fadeUp(0.7)} className="animate-fade-up mt-14 border-t border-on-image/30 pt-6">
            <p className="label-caps opacity-80">Kepada Yth.</p>
            <p className="mt-2 font-serif text-2xl break-words md:text-3xl">{guestName}</p>
            <p className="mt-1 text-sm opacity-80">Tanpa mengurangi rasa hormat, kami mengundang Anda.</p>

            <div className="mt-8 min-h-12">
              {opened ? (
                <a
                  href={`#${nextSectionId}`}
                  className="label-caps inline-flex min-h-11 items-center gap-2 opacity-80 hover:opacity-100"
                >
                  Gulir ke bawah
                  <ChevronDown className="size-4 motion-safe:animate-bounce" aria-hidden="true" />
                </a>
              ) : (
                <button type="button" onClick={onOpen} className="btn-pill bg-on-image text-ink hover:bg-transparent hover:text-on-image">
                  <MailOpen className="size-4" aria-hidden="true" />
                  Buka Undangan
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
