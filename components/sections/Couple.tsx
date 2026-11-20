import { ArrowUpRight } from "lucide-react";
import Image from "next/image";

import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { WeddingConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

type Person = WeddingConfig["bride"];

type CoupleProps = { bride: Person; groom: Person };

export function Couple({ bride, groom }: CoupleProps) {
  const people = [
    { role: "Mempelai Wanita", person: bride },
    { role: "Mempelai Pria", person: groom },
  ];

  return (
    <section id="mempelai" className="mx-auto max-w-[1100px] px-6 py-24 md:px-10 md:py-32">
      <SectionHeading label="Mempelai" title="Dua hati, satu langkah." />

      <div className="space-y-20 md:space-y-28">
        {people.map(({ role, person }, i) => (
          <article
            key={role}
            className={cn("grid items-end gap-8 md:grid-cols-12 md:gap-12", i % 2 === 1 && "md:[&>*:first-child]:order-2")}
          >
            <Reveal className={cn("md:col-span-6", i % 2 === 1 ? "md:col-start-7" : "md:col-start-1")}>
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-line">
                <Image
                  src={person.photo}
                  alt={`Foto ${person.name}`}
                  fill
                  sizes="(min-width: 768px) 520px, 100vw"
                  className="object-cover"
                />
              </div>
            </Reveal>

            <Reveal delay={0.1} className={cn("md:col-span-5", i % 2 === 1 ? "md:col-start-1" : "md:col-start-8")}>
              <p className="label-caps text-muted">
                <span className="font-serif text-base tracking-normal text-fg">{String(i + 1).padStart(2, "0")}</span>
                <span className="mx-3 inline-block h-px w-8 bg-line align-middle" aria-hidden="true" />
                {role}
              </p>
              <h3 className="mt-5 text-[clamp(2.25rem,9vw,3.5rem)]">{person.name}</h3>
              <p className="mt-4 text-muted">{person.parents}</p>
              {person.instagram ? (
                <a
                  href={`https://instagram.com/${person.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex min-h-11 items-center gap-1 border-b border-line text-sm hover:border-fg"
                >
                  @{person.instagram}
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                  <span className="sr-only">(Instagram, buka di tab baru)</span>
                </a>
              ) : null}
            </Reveal>
          </article>
        ))}
      </div>
    </section>
  );
}
