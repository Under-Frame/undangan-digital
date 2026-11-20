import Image from "next/image";

import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import { SplitText } from "@/components/motion/SplitText";
import type { WeddingConfig } from "@/lib/config";
import { DEVELOPER } from "@/lib/site";

type ClosingProps = {
  image: string;
  quote?: WeddingConfig["quote"];
  closing: string;
  coupleNames: string;
};

export function Closing({ image, quote, closing, coupleNames }: ClosingProps) {
  return (
    <section id="penutup" aria-label="Penutup">
      <div className="relative min-h-svh overflow-hidden text-on-image">
        <Parallax className="absolute inset-0">
          <Image src={image} alt="" fill sizes="100vw" className="object-cover" />
        </Parallax>
        <div className="absolute inset-0 bg-overlay" aria-hidden="true" />

        <div className="relative mx-auto flex min-h-svh max-w-[1100px] flex-col justify-between gap-16 px-6 py-24 md:px-10 md:py-32">
          {quote ? (
            <Reveal as="article" className="max-w-2xl">
              <p className="label-caps opacity-80">{quote.source}</p>
              <blockquote className="mt-6 font-serif text-[clamp(1.375rem,5.5vw,2rem)] leading-snug">
                “{quote.text}”
              </blockquote>
            </Reveal>
          ) : (
            <span />
          )}

          <div>
            <Reveal>
              <p className="max-w-xl text-lg">{closing}</p>
              <p className="label-caps mt-10 opacity-80">Kami yang berbahagia</p>
            </Reveal>
            <SplitText text={coupleNames} className="mt-4 text-[clamp(3rem,15vw,6rem)] leading-[0.95]" />
          </div>
        </div>
      </div>

      <p className="mx-auto max-w-[1100px] px-6 py-8 text-xs text-muted md:px-10">
        Made by{" "}
        <a
          href={DEVELOPER.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-fg"
        >
          {DEVELOPER.name}
        </a>
      </p>
    </section>
  );
}
