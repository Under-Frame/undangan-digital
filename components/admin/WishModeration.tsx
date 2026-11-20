"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { useToast } from "@/components/ui/Toast";
import type { AdminWish } from "@/lib/schemas";
import { cn, formatDateTime, initials } from "@/lib/utils";

type WishModerationProps = {
  slug: string;
  wishes: AdminWish[];
  onChange: (updater: (list: AdminWish[]) => AdminWish[]) => void;
};

export function WishModeration({ slug, wishes, onChange }: WishModerationProps) {
  const toast = useToast();
  const [pending, setPending] = useState<string | null>(null);
  const hiddenCount = wishes.filter((w) => w.hidden).length;

  const toggle = async (wish: AdminWish) => {
    const hidden = !wish.hidden;
    setPending(wish.id);
    // Optimistis: ubah dulu, kembalikan jika gagal.
    onChange((list) => list.map((w) => (w.id === wish.id ? { ...w, hidden } : w)));
    try {
      const res = await fetch("/api/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, wishId: wish.id, hidden }),
      });
      if (!res.ok) throw new Error();
      toast(hidden ? "Ucapan disembunyikan" : "Ucapan ditampilkan kembali");
    } catch {
      onChange((list) => list.map((w) => (w.id === wish.id ? { ...w, hidden: !hidden } : w)));
      toast("Gagal mengubah ucapan");
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="mt-8">
      <p className="text-sm text-muted">
        {wishes.length} ucapan · {hiddenCount} disembunyikan. Ucapan yang disembunyikan tidak tampil di undangan.
      </p>

      {wishes.length === 0 ? (
        <p className="mt-6 rounded-3xl border border-line px-5 py-10 text-center text-muted">Belum ada ucapan masuk.</p>
      ) : (
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {wishes.map((wish) => (
            <li key={wish.id} className={cn("flex gap-4 py-5", wish.hidden && "opacity-60")}>
              <span className="grid size-11 shrink-0 place-items-center rounded-full border border-line font-serif" aria-hidden="true">
                {initials(wish.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-baseline gap-x-3">
                  <span className="font-medium">{wish.name}</span>
                  <span className="text-xs text-muted">{formatDateTime(wish.createdAt)}</span>
                  {wish.hidden ? (
                    <span className="rounded-full border border-line px-2 py-0.5 text-xs text-muted">Disembunyikan</span>
                  ) : null}
                </p>
                <p className="mt-1 break-words whitespace-pre-line text-muted">{wish.message}</p>
              </div>
              <button
                type="button"
                onClick={() => toggle(wish)}
                disabled={pending === wish.id}
                aria-pressed={wish.hidden}
                aria-label={`${wish.hidden ? "Tampilkan" : "Sembunyikan"} ucapan dari ${wish.name}`}
                className="btn-pill shrink-0 self-start border-line px-3 text-xs hover:border-fg disabled:opacity-50"
              >
                {wish.hidden ? <Eye className="size-4" aria-hidden="true" /> : <EyeOff className="size-4" aria-hidden="true" />}
                <span className="hidden sm:inline">{wish.hidden ? "Tampilkan" : "Sembunyikan"}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
