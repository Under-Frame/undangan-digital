"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Loader2, Send } from "lucide-react";
import { useCallback, useEffect, useId, useState, type FormEvent } from "react";

import { EASE_EDITORIAL } from "@/components/motion/easing";
import { Reveal } from "@/components/motion/Reveal";
import { DemoBadge } from "@/components/ui/DemoBadge";
import { FieldError, inputClass } from "@/components/ui/form";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useToast } from "@/components/ui/Toast";
import { fieldErrors, WISH_MAX, wishSchema, type Wish } from "@/lib/schemas";
import { cn, initials, timeAgo } from "@/lib/utils";

type WishesProps = { slug: string; defaultName: string; demo: boolean };

export function Wishes({ slug, defaultName, demo }: WishesProps) {
  const id = useId();
  const toast = useToast();
  const reduce = useReducedMotion();

  const [name, setName] = useState(defaultName);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  const [wishes, setWishes] = useState<Wish[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  // Waktu "sekarang" untuk label relatif; diperbarui tiap menit.
  const [now, setNow] = useState(() => Date.now());

  const load = useCallback(
    async (offset: number) => {
      setLoading(true);
      setLoadError(false);
      try {
        const res = await fetch(`/api/wishes?slug=${encodeURIComponent(slug)}&offset=${offset}`);
        if (!res.ok) throw new Error();
        const data: { items: Wish[]; hasMore: boolean } = await res.json();
        setWishes((list) => {
          // Hindari duplikat jika ada ucapan baru yang sudah ditambahkan di atas.
          const seen = new Set(list.map((w) => w.id));
          return offset === 0 ? data.items : [...list, ...data.items.filter((w) => !seen.has(w.id))];
        });
        setHasMore(data.hasMore);
        setNow(Date.now());
      } catch {
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    },
    [slug],
  );

  useEffect(() => {
    void load(0);
    const t = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(t);
  }, [load]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (sending) return;
    const payload = { slug, name, message };
    const parsed = wishSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setSending(true);
    try {
      const res = await fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.fields) setErrors(data.fields);
        toast(data.error ?? "Ucapan gagal dikirim.");
        return;
      }
      setWishes((list) => [data.wish as Wish, ...list]);
      setNow(Date.now());
      setMessage("");
      toast("Terima kasih atas ucapan & doanya");
    } catch {
      toast("Koneksi bermasalah. Silakan coba lagi.");
    } finally {
      setSending(false);
    }
  };

  // Offset untuk "muat lebih" = jumlah ucapan dari server yang sudah tampil.
  const loadMore = () => void load(wishes.length);

  return (
    <section id="ucapan" className="border-t border-line">
      <div className="mx-auto max-w-[1100px] px-6 py-24 md:px-10 md:py-32">
        <SectionHeading label="Ucapan & Doa" title="Titipkan doa terbaik." />

        <div className="grid gap-16 md:grid-cols-12">
          <Reveal className="md:col-span-5">
            {demo ? <DemoBadge /> : null}
            <form onSubmit={onSubmit} noValidate className="space-y-8">
              <div>
                <label htmlFor={`${id}-name`} className="label-caps text-muted">
                  Nama
                </label>
                <input
                  id={`${id}-name`}
                  type="text"
                  autoComplete="name"
                  maxLength={50}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Anda"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? `${id}-name-error` : undefined}
                  className={inputClass}
                />
                <FieldError id={`${id}-name-error`} message={errors.name} />
              </div>

              <div>
                <div className="flex items-baseline justify-between">
                  <label htmlFor={`${id}-msg`} className="label-caps text-muted">
                    Ucapan
                  </label>
                  <span className="text-xs text-muted tabular-nums" aria-live="polite">
                    {message.length}/{WISH_MAX}
                  </span>
                </div>
                <textarea
                  id={`${id}-msg`}
                  rows={4}
                  maxLength={WISH_MAX}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tulis ucapan dan doa untuk kedua mempelai"
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? `${id}-msg-error` : undefined}
                  className={cn(inputClass, "resize-none")}
                />
                <FieldError id={`${id}-msg-error`} message={errors.message} />
              </div>

              <button type="submit" disabled={sending} className="btn-pill hover:bg-fg hover:text-bg disabled:opacity-70">
                {sending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Send className="size-4" aria-hidden="true" />
                )}
                {sending ? "Mengirim…" : "Kirim Ucapan"}
              </button>
            </form>
          </Reveal>

          <div className="md:col-span-6 md:col-start-7">
            {loadError && wishes.length === 0 ? (
              <div className="text-muted">
                Ucapan gagal dimuat.{" "}
                <button type="button" onClick={() => void load(0)} className="min-h-11 underline underline-offset-4 hover:text-fg">
                  Coba lagi
                </button>
              </div>
            ) : !loading && wishes.length === 0 ? (
              <p className="border-t border-line pt-6 text-muted">
                Belum ada ucapan. Jadilah yang pertama mengirimkan doa.
              </p>
            ) : null}

            <ul className="divide-y divide-line border-y border-line empty:border-0" aria-label="Daftar ucapan" aria-busy={loading}>
              <AnimatePresence initial={false}>
                {wishes.map((wish) => (
                  <motion.li
                    key={wish.id}
                    layout={!reduce}
                    initial={reduce ? false : { opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: EASE_EDITORIAL }}
                    className="flex gap-4 py-6"
                  >
                    <span
                      className="grid size-11 shrink-0 place-items-center rounded-full border border-line font-serif text-base"
                      aria-hidden="true"
                    >
                      {initials(wish.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-baseline gap-x-3">
                        <span className="font-medium">{wish.name}</span>
                        <time dateTime={wish.createdAt} className="text-xs text-muted">
                          {timeAgo(wish.createdAt, now)}
                        </time>
                      </p>
                      <p className="mt-1 break-words whitespace-pre-line text-muted">{wish.message}</p>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>

            {loading && wishes.length === 0 ? (
              <div className="space-y-6 py-6" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex animate-pulse gap-4">
                    <span className="size-11 rounded-full bg-line" />
                    <div className="flex-1 space-y-2 pt-1">
                      <span className="block h-3 w-1/3 rounded bg-line" />
                      <span className="block h-3 w-2/3 rounded bg-line" />
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {hasMore ? (
              <button
                type="button"
                onClick={loadMore}
                disabled={loading}
                className="btn-pill mt-8 border-line hover:border-fg disabled:opacity-70"
              >
                {loading ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
                Muat lebih banyak
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
