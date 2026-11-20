"use client";

import { CalendarDays, Gift, Heart, House, Images, MailCheck, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export const NAV_ICONS = {
  home: House,
  couple: Heart,
  events: CalendarDays,
  gallery: Images,
  rsvp: MailCheck,
  gift: Gift,
} satisfies Record<string, LucideIcon>;

export type NavItem = {
  label: string;
  icon: keyof typeof NAV_ICONS;
  /** Section pertama = tujuan scroll; section lain ikut mengaktifkan ikon ini. */
  sectionIds: string[];
};

type BottomNavProps = { items: NavItem[]; visible: boolean };

/** Bar kaca buram melayang di bawah; ikon aktif mengikuti posisi scroll. */
export function BottomNav({ items, visible }: BottomNavProps) {
  const [active, setActive] = useState<string | undefined>(items[0]?.sectionIds[0]);

  useEffect(() => {
    const owner = new Map<string, string>();
    items.forEach((item) => item.sectionIds.forEach((id) => owner.set(id, item.sectionIds[0])));

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(owner.get(entry.target.id));
        }
      },
      // Section dianggap aktif saat melewati garis tengah layar.
      { rootMargin: "-45% 0px -54% 0px" },
    );
    owner.forEach((_, id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav
      aria-label="Navigasi undangan"
      aria-hidden={!visible}
      inert={!visible}
      className={cn(
        "fixed inset-x-4 z-40 mx-auto max-w-md rounded-full border border-line bg-bg/70 backdrop-blur-md transition-[opacity,translate] duration-500 ease-editorial",
        "bottom-[calc(1rem+env(safe-area-inset-bottom))]",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0",
      )}
    >
      <ul className="flex items-stretch justify-around px-2">
        {items.map((item) => {
          const target = item.sectionIds[0];
          const Icon = NAV_ICONS[item.icon];
          const isActive = active === target;
          return (
            <li key={target} className="flex-1">
              <a
                href={`#${target}`}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 rounded-full text-[11px] font-medium transition-colors",
                  isActive ? "text-fg" : "text-muted hover:text-fg",
                )}
              >
                <Icon className="size-5" strokeWidth={isActive ? 2 : 1.5} aria-hidden="true" />
                <span>{item.label}</span>
                <span
                  className={cn("h-px w-4 bg-fg transition-opacity", isActive ? "opacity-100" : "opacity-0")}
                  aria-hidden="true"
                />
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
