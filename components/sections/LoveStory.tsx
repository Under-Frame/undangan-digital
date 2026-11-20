import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { WeddingConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

type LoveStoryProps = { stories: NonNullable<WeddingConfig["loveStory"]> };

/** Kartu geser horizontal dengan scroll-snap, mirip Instagram Stories. */
export function LoveStory({ stories }: LoveStoryProps) {
  return (
    <section id="cerita" className="py-24 md:py-32">
      <div className="mx-auto max-w-[1100px] px-6 md:px-10">
        <SectionHeading label="Cerita Kami" title="Perjalanan kami." />
      </div>

      <Reveal>
        <ol
          tabIndex={0}
          aria-label="Cerita kami, geser untuk melihat lainnya"
          className="mx-auto flex max-w-[1100px] snap-x snap-mandatory scroll-px-6 gap-4 overflow-x-auto px-6 pb-4 [scrollbar-width:none] md:scroll-px-10 md:px-10 [&::-webkit-scrollbar]:hidden"
        >
          {stories.map((story, i) => (
            <li
              key={`${story.year}-${i}`}
              className="flex min-h-[420px] w-[80%] max-w-[340px] shrink-0 md:w-[31%] md:max-w-none snap-start flex-col rounded-3xl border border-line bg-bg p-6"
            >
              {/* Indikator ala Stories */}
              <div className="flex gap-1" aria-hidden="true">
                {stories.map((_, j) => (
                  <span key={j} className={cn("h-0.5 flex-1 rounded-full", j <= i ? "bg-fg" : "bg-line")} />
                ))}
              </div>
              <p className="label-caps mt-6 text-muted">
                Bagian {i + 1} dari {stories.length}
              </p>
              <p className="mt-auto font-serif text-7xl leading-none tracking-tight">{story.year}</p>
              <div className="my-6 h-px bg-line" aria-hidden="true" />
              <h3 className="text-3xl">{story.title}</h3>
              <p className="mt-3 text-muted">{story.text}</p>
            </li>
          ))}
        </ol>
      </Reveal>
    </section>
  );
}
