import { CalendarPlus, ChevronDown, Download, ExternalLink, MapPin, Video } from "lucide-react";

import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { googleCalendarUrl } from "@/lib/calendar";
import type { WeddingEvent } from "@/lib/config";
import { formatDateLong, formatTime } from "@/lib/utils";

type EventsProps = {
  slug: string;
  coupleNames: string;
  events: WeddingEvent[];
  liveStreamUrl?: string | null;
  invitationUrl: string;
};

export function Events({ slug, coupleNames, events, liveStreamUrl, invitationUrl }: EventsProps) {
  return (
    <section id="acara" className="mx-auto max-w-[1100px] px-6 py-24 md:px-10 md:py-32">
      <SectionHeading label="Detail Acara" title="Simpan tanggalnya." />

      <ol className="grid gap-6 md:grid-cols-2">
        {events.map((event, i) => {
          const calendarUrl = googleCalendarUrl({
            uid: `${slug}-${i}@undangan-digital`,
            title: `${event.type} ${coupleNames}`,
            start: event.start,
            end: event.end,
            location: `${event.venue}, ${event.address}`,
            description: `Undangan ${event.type} ${coupleNames}`,
            url: invitationUrl,
          });

          return (
            <Reveal as="li" key={`${event.type}-${i}`} delay={i * 0.1} className="flex flex-col rounded-3xl border border-line p-6 md:p-8">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-[clamp(1.75rem,7vw,2.25rem)]">{event.type}</h3>
                <span className="font-serif text-lg text-muted" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="my-6 h-px bg-line" aria-hidden="true" />

              <dl className="space-y-4">
                <div>
                  <dt className="label-caps text-muted">Tanggal</dt>
                  <dd className="mt-1 text-lg">{formatDateLong(event.start)}</dd>
                </div>
                <div>
                  <dt className="label-caps text-muted">Waktu</dt>
                  <dd className="mt-1 text-lg">
                    {formatTime(event.start)} – {formatTime(event.end)} WIB
                  </dd>
                </div>
                <div>
                  <dt className="label-caps text-muted">Tempat</dt>
                  <dd className="mt-1">
                    <span className="block text-lg">{event.venue}</span>
                    <span className="mt-1 flex gap-2 text-muted">
                      <MapPin className="mt-1 size-4 shrink-0" aria-hidden="true" />
                      {event.address}
                    </span>
                  </dd>
                </div>
              </dl>

              <details className="group mt-8 md:mt-auto md:pt-8">
                <summary className="btn-pill w-full cursor-pointer list-none hover:bg-fg hover:text-bg [&::-webkit-details-marker]:hidden">
                  <CalendarPlus className="size-4" aria-hidden="true" />
                  Simpan ke Kalender
                  <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <a
                    href={calendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-pill px-3 text-xs hover:bg-fg hover:text-bg"
                  >
                    <ExternalLink className="size-4" aria-hidden="true" />
                    Google
                    <span className="sr-only">Calendar (buka di tab baru)</span>
                  </a>
                  <a
                    href={`/api/ics?slug=${encodeURIComponent(slug)}&event=${i}`}
                    download
                    className="btn-pill px-3 text-xs hover:bg-fg hover:text-bg"
                  >
                    <Download className="size-4" aria-hidden="true" />
                    Unduh .ics
                  </a>
                </div>
              </details>
            </Reveal>
          );
        })}
      </ol>

      {liveStreamUrl ? (
        <Reveal className="mt-12 flex flex-col items-start gap-4 border-t border-line pt-8 md:flex-row md:items-center md:justify-between">
          <p className="text-muted">Tidak dapat hadir? Saksikan secara langsung.</p>
          <a href={liveStreamUrl} target="_blank" rel="noopener noreferrer" className="btn-pill hover:bg-fg hover:text-bg">
            <Video className="size-4" aria-hidden="true" />
            Tonton Live Streaming
          </a>
        </Reveal>
      ) : null}
    </section>
  );
}
