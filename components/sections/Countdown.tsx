"use client";

import { useEffect, useState } from "react";

import { Reveal } from "@/components/motion/Reveal";

type CountdownProps = {
  /** ISO waktu mulai acara pertama. */
  target: string;
  dateLabel: string;
};

type Remaining = { days: number; hours: number; minutes: number; seconds: number };

function getRemaining(targetMs: number): Remaining | null {
  const diff = targetMs - Date.now();
  if (diff <= 0) return null;
  const s = Math.floor(diff / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

const UNITS: Array<{ key: keyof Remaining; label: string }> = [
  { key: "days", label: "Hari" },
  { key: "hours", label: "Jam" },
  { key: "minutes", label: "Menit" },
  { key: "seconds", label: "Detik" },
];

export function Countdown({ target, dateLabel }: CountdownProps) {
  const targetMs = new Date(target).getTime();
  // undefined = belum di-mount (hindari beda render server vs client); null = sudah lewat.
  const [remaining, setRemaining] = useState<Remaining | null | undefined>(undefined);

  useEffect(() => {
    const tick = () => setRemaining(getRemaining(targetMs));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [targetMs]);

  return (
    <section id="countdown" aria-label="Hitung mundur" className="border-y border-line">
      <div className="mx-auto max-w-[1100px] px-6 py-20 md:px-10 md:py-28">
        <Reveal>
          <p className="label-caps text-muted">Menuju hari bahagia · {dateLabel}</p>

          {remaining === null ? (
            <p className="mt-8 font-serif text-[clamp(2rem,9vw,3.5rem)] leading-tight">Acara telah berlangsung</p>
          ) : (
            <dl className="mt-10 grid grid-cols-4 divide-x divide-line">
              {UNITS.map(({ key, label }) => (
                <div key={key} className="flex flex-col-reverse px-2 first:pl-0 sm:px-6">
                  <dt className="label-caps mt-3 text-muted">{label}</dt>
                  <dd className="font-serif text-[clamp(2.25rem,11vw,5.5rem)] leading-none tabular-nums">
                    {remaining ? String(remaining[key]).padStart(2, "0") : "--"}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </Reveal>
      </div>
    </section>
  );
}
