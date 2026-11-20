import { SplitText } from "@/components/motion/SplitText";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  label: string;
  title: string;
  className?: string;
  /** Untuk heading di atas foto. */
  inverted?: boolean;
};

/** Label kapital kecil + garis tipis + judul Fraunces besar. */
export function SectionHeading({ label, title, className, inverted = false }: SectionHeadingProps) {
  return (
    <div className={cn("mb-12 md:mb-16", className)}>
      <div className="flex items-center gap-4">
        <p className={cn("label-caps", inverted ? "text-on-image" : "text-muted")}>{label}</p>
        <span className={cn("h-px flex-1", inverted ? "bg-on-image/40" : "bg-line")} aria-hidden="true" />
      </div>
      <SplitText text={title} className="mt-6 text-[clamp(2.5rem,11vw,4.5rem)]" />
    </div>
  );
}
