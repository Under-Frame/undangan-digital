"use client";

import { LogOut, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { LinkGenerator } from "@/components/admin/LinkGenerator";
import { RsvpTable } from "@/components/admin/RsvpTable";
import { StatCards } from "@/components/admin/StatCards";
import { WishModeration } from "@/components/admin/WishModeration";
import { DemoBadge } from "@/components/ui/DemoBadge";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import type { AdminRsvp, AdminWish } from "@/lib/schemas";
import { cn } from "@/lib/utils";

type AdminDashboardProps = {
  slug: string;
  coupleNames: string;
  fullNames: string;
  dateLabel: string;
  initialRsvp: AdminRsvp[];
  initialWishes: AdminWish[];
  demo: boolean;
};

const AUTO_REFRESH_MS = 30_000;

export function AdminDashboard(props: AdminDashboardProps) {
  return (
    <ToastProvider>
      <Dashboard {...props} />
    </ToastProvider>
  );
}

function Dashboard({ slug, coupleNames, fullNames, dateLabel, initialRsvp, initialWishes, demo }: AdminDashboardProps) {
  const router = useRouter();
  const toast = useToast();
  const [rsvp, setRsvp] = useState(initialRsvp);
  const [wishes, setWishes] = useState(initialWishes);
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const refresh = useCallback(
    async (silent = false) => {
      setRefreshing(true);
      try {
        const res = await fetch(`/api/admin?slug=${encodeURIComponent(slug)}`, { cache: "no-store" });
        if (res.status === 401) {
          router.refresh(); // sesi habis → kembali ke halaman login
          return;
        }
        if (!res.ok) throw new Error();
        const data: { rsvp: AdminRsvp[]; wishes: AdminWish[] } = await res.json();
        setRsvp(data.rsvp);
        setWishes(data.wishes);
        setUpdatedAt(new Date());
        if (!silent) toast("Data diperbarui");
      } catch {
        if (!silent) toast("Gagal memuat data terbaru");
      } finally {
        setRefreshing(false);
      }
    },
    [slug, router, toast],
  );

  // Pembaruan otomatis tiap 30 detik saat tab sedang dilihat.
  useEffect(() => {
    const id = window.setInterval(() => {
      if (!document.hidden) void refresh(true);
    }, AUTO_REFRESH_MS);
    return () => window.clearInterval(id);
  }, [refresh]);

  const logout = async () => {
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout", slug }),
    }).catch(() => {});
    router.refresh();
  };

  const nav = [
    { id: "ringkasan", label: "Ringkasan" },
    { id: "rsvp", label: "RSVP" },
    { id: "ucapan", label: "Ucapan" },
    { id: "link", label: "Link Tamu" },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-4 px-6 py-3 md:px-10">
          <div className="min-w-0">
            <p className="label-caps text-muted">Dashboard</p>
            <p className="truncate font-serif text-xl">{coupleNames}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void refresh()}
              disabled={refreshing}
              aria-label="Muat ulang data"
              className="grid size-11 place-items-center rounded-full border border-line hover:border-fg"
            >
              <RefreshCw className={cn("size-4", refreshing && "animate-spin")} aria-hidden="true" />
            </button>
            <button type="button" onClick={logout} className="btn-pill border-line px-4 hover:border-fg">
              <LogOut className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Keluar</span>
              <span className="sr-only sm:hidden">Keluar</span>
            </button>
          </div>
        </div>
        <nav aria-label="Bagian dashboard" className="mx-auto max-w-[1100px] overflow-x-auto px-6 md:px-10">
          <ul className="flex gap-6">
            {nav.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} className="label-caps inline-flex min-h-11 items-center whitespace-nowrap text-muted hover:text-fg">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="mx-auto max-w-[1100px] space-y-20 px-6 py-12 md:px-10 md:py-16">
        <section id="ringkasan" className="scroll-mt-32">
          {demo ? <DemoBadge /> : null}
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h1 className="text-[clamp(2rem,8vw,3rem)]">Ringkasan</h1>
            <p className="text-xs text-muted" aria-live="polite">
              {updatedAt
                ? `Diperbarui ${updatedAt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`
                : "Diperbarui otomatis tiap 30 detik"}
            </p>
          </div>
          <StatCards rsvp={rsvp} />
        </section>

        <section id="rsvp" className="scroll-mt-32">
          <h2 className="text-[clamp(2rem,8vw,3rem)]">RSVP</h2>
          <RsvpTable slug={slug} rsvp={rsvp} />
        </section>

        <section id="ucapan" className="scroll-mt-32">
          <h2 className="text-[clamp(2rem,8vw,3rem)]">Moderasi Ucapan</h2>
          <WishModeration slug={slug} wishes={wishes} onChange={setWishes} />
        </section>

        <section id="link" className="scroll-mt-32">
          <h2 className="text-[clamp(2rem,8vw,3rem)]">Generator Link Tamu</h2>
          <LinkGenerator slug={slug} coupleNames={coupleNames} fullNames={fullNames} dateLabel={dateLabel} />
        </section>
      </main>
    </>
  );
}
