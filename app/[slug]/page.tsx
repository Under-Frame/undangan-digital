import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import { SplitText } from "@/components/motion/SplitText";
import { getWeddingConfig } from "@/lib/config";
import { formatDateDots, formatDateLong, formatTime } from "@/lib/utils";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const config = await getWeddingConfig(slug);
  if (!config) return { title: "Undangan tidak ditemukan" };

  const couple = `${config.bride.nickname} & ${config.groom.nickname}`;
  return {
    title: `The Wedding of ${couple}`,
    description: `Undangan pernikahan ${couple} — ${formatDateLong(config.events[0].start)}.`,
  };
}

/**
 * Fase 1: kerangka halaman untuk menguji config, palet, font, dan komponen motion.
 * Section lengkap (Cover, Mempelai, dst.) dibangun di Fase 2.
 */
export default async function WeddingPage({ params }: PageProps) {
  const { slug } = await params;
  const config = await getWeddingConfig(slug);
  if (!config) notFound();

  const { bride, groom, events, quote } = config;
  const couple = `${bride.nickname} & ${groom.nickname}`;

  return (
    <div data-palette={config.palette} className="min-h-dvh bg-bg text-fg">
      <header className="relative h-dvh min-h-[560px] text-on-image">
        <Parallax mode="hero" className="absolute inset-0">
          <Image
            src={config.coverImage}
            alt={`Foto sampul ${couple}`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </Parallax>
        <div className="absolute inset-0 bg-overlay" aria-hidden="true" />
        <div className="relative mx-auto flex h-full max-w-[1100px] flex-col justify-end px-6 pb-20">
          <p className="label-caps">The Wedding of</p>
          <SplitText
            as="h1"
            text={couple}
            immediate
            delay={0.2}
            className="mt-4 text-[clamp(3.5rem,15vw,4.5rem)]"
          />
          <div className="my-6 h-px w-16 bg-on-image/60" aria-hidden="true" />
          <p className="label-caps">{formatDateDots(events[0].start)}</p>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-6">
        {quote ? (
          <section className="py-24 md:py-32">
            <Reveal>
              <p className="label-caps text-muted">{quote.source}</p>
              <blockquote className="mt-6 max-w-2xl font-serif text-2xl leading-snug md:text-3xl">
                “{quote.text}”
              </blockquote>
            </Reveal>
          </section>
        ) : null}

        <section className="border-t border-line py-24 md:py-32">
          <SplitText text="Rangkaian Acara" className="text-[clamp(2.5rem,10vw,4rem)]" />
          <ul className="mt-12 grid gap-6 md:grid-cols-2">
            {events.map((event, i) => (
              <Reveal as="li" key={event.type} delay={i * 0.1} className="rounded-2xl border border-line p-6 md:p-8">
                <p className="label-caps text-accent">{event.type}</p>
                <p className="mt-4 font-serif text-2xl">{formatDateLong(event.start)}</p>
                <p className="mt-1 text-muted">
                  {formatTime(event.start)} – {formatTime(event.end)} WIB
                </p>
                <div className="my-6 h-px bg-line" aria-hidden="true" />
                <p className="font-medium">{event.venue}</p>
                <p className="text-muted">{event.address}</p>
              </Reveal>
            ))}
          </ul>
        </section>
      </main>

      <footer className="relative h-[70vh] min-h-[420px] text-on-image">
        <Parallax className="absolute inset-0">
          <Image src={config.coverImage} alt="" fill sizes="100vw" className="object-cover" />
        </Parallax>
        <div className="absolute inset-0 bg-overlay" aria-hidden="true" />
        <div className="relative mx-auto flex h-full max-w-[1100px] flex-col justify-center px-6">
          <Reveal>
            <p className="max-w-xl">{config.closing}</p>
            <p className="mt-8 font-serif text-4xl">{couple}</p>
          </Reveal>
        </div>
      </footer>
    </div>
  );
}
