import { ArrowUpRight } from "lucide-react";

import { Reveal } from "@/components/motion/Reveal";
import { LazyMap } from "@/components/ui/LazyMap";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { WeddingEvent } from "@/lib/config";

type LocationProps = { events: WeddingEvent[] };

export function Location({ events }: LocationProps) {
  // Satu peta per tempat; acara di tempat yang sama digabung.
  const places = new Map<string, { venue: string; address: string; mapsUrl: string; mapsEmbed?: string | null; types: string[] }>();
  for (const e of events) {
    const existing = places.get(e.mapsUrl);
    if (existing) existing.types.push(e.type);
    else places.set(e.mapsUrl, { venue: e.venue, address: e.address, mapsUrl: e.mapsUrl, mapsEmbed: e.mapsEmbed, types: [e.type] });
  }

  return (
    <section id="lokasi" className="mx-auto max-w-[1100px] px-6 py-24 md:px-10 md:py-32">
      <SectionHeading label="Lokasi" title="Sampai jumpa di sana." />

      <div className="grid gap-12 md:grid-cols-2 md:gap-8">
        {[...places.values()].map((place) => (
          <Reveal key={place.mapsUrl} as="article">
            <p className="label-caps text-muted">{place.types.join(" & ")}</p>
            <h3 className="mt-3 text-[clamp(1.75rem,7vw,2.25rem)]">{place.venue}</h3>
            <p className="mt-2 text-muted">{place.address}</p>

            {place.mapsEmbed ? <LazyMap src={place.mapsEmbed} title={`Peta lokasi ${place.venue}`} /> : null}

            <a
              href={place.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-pill mt-6 hover:bg-fg hover:text-bg"
            >
              Buka di Google Maps
              <ArrowUpRight className="size-4" aria-hidden="true" />
              <span className="sr-only">(tab baru)</span>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
