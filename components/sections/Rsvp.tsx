"use client";

import { Check, Loader2, Send } from "lucide-react";
import { useId, useState, type FormEvent } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { Confetti } from "@/components/ui/Confetti";
import { DemoBadge } from "@/components/ui/DemoBadge";
import { FieldError, inputClass } from "@/components/ui/form";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useToast } from "@/components/ui/Toast";
import { ATTENDANCE, ATTENDANCE_LABEL, fieldErrors, rsvpSchema, type Attendance } from "@/lib/schemas";
import { cn } from "@/lib/utils";

type RsvpProps = {
  slug: string;
  /** Nama dari ?to= untuk prefill (kosong jika tamu umum). */
  defaultName: string;
  demo: boolean;
};

type Status = "idle" | "sending" | "done";

export function Rsvp({ slug, defaultName, demo }: RsvpProps) {
  const id = useId();
  const toast = useToast();
  const [name, setName] = useState(defaultName);
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [guestCount, setGuestCount] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [burst, setBurst] = useState(0);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status !== "idle") return;

    const payload = { slug, name, attendance: attendance ?? undefined, guestCount };
    const parsed = rsvpSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setStatus("sending");

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.fields) setErrors(data.fields);
        toast(data.error ?? "Konfirmasi gagal dikirim.");
        setStatus("idle");
        return;
      }
      setStatus("done");
      setBurst((n) => n + 1);
      toast("Konfirmasi kehadiran terkirim");
    } catch {
      toast("Koneksi bermasalah. Silakan coba lagi.");
      setStatus("idle");
    }
  };

  const locked = status !== "idle";

  return (
    <section id="rsvp" className="mx-auto max-w-[1100px] px-6 py-24 md:px-10 md:py-32">
      <SectionHeading label="RSVP" title="Konfirmasi kehadiran." />

      <div className="grid gap-12 md:grid-cols-12">
        <Reveal className="md:col-span-4">
          {demo ? <DemoBadge /> : null}
          <p className="text-muted">
            Mohon kabari kami kehadiran Anda agar kami dapat menyambut dengan sebaik-baiknya.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="md:col-span-7 md:col-start-6">
          <form onSubmit={onSubmit} noValidate className="space-y-10">
            <div>
              <label htmlFor={`${id}-name`} className="label-caps text-muted">
                Nama
              </label>
              <input
                id={`${id}-name`}
                name="name"
                type="text"
                autoComplete="name"
                maxLength={50}
                value={name}
                disabled={locked}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama lengkap Anda"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? `${id}-name-error` : undefined}
                className={inputClass}
              />
              <FieldError id={`${id}-name-error`} message={errors.name} />
            </div>

            <fieldset aria-describedby={errors.attendance ? `${id}-att-error` : undefined}>
              <legend className="label-caps text-muted">Kehadiran</legend>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {ATTENDANCE.map((value) => (
                  <label
                    key={value}
                    className={cn(
                      "btn-pill cursor-pointer has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent",
                      attendance === value ? "bg-fg text-bg" : "border-line hover:border-fg",
                      locked && "cursor-default",
                      locked && attendance !== value && "opacity-50",
                    )}
                  >
                    <input
                      type="radio"
                      name="attendance"
                      value={value}
                      checked={attendance === value}
                      disabled={locked}
                      onChange={() => setAttendance(value)}
                      className="sr-only"
                    />
                    {ATTENDANCE_LABEL[value]}
                  </label>
                ))}
              </div>
              <FieldError id={`${id}-att-error`} message={errors.attendance} />
            </fieldset>

            {attendance !== "tidak" ? (
              <fieldset aria-describedby={errors.guestCount ? `${id}-count-error` : undefined}>
                <legend className="label-caps text-muted">Jumlah tamu</legend>
                <div className="mt-4 flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <label
                      key={n}
                      className={cn(
                        "grid size-12 cursor-pointer place-items-center rounded-full border font-serif text-lg transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent",
                        guestCount === n ? "border-fg bg-fg text-bg" : "border-line hover:border-fg",
                        locked && "cursor-default",
                      locked && guestCount !== n && "opacity-50",
                      )}
                    >
                      <input
                        type="radio"
                        name="guestCount"
                        value={n}
                        checked={guestCount === n}
                        disabled={locked}
                        onChange={() => setGuestCount(n)}
                        className="sr-only"
                        aria-label={`${n} orang`}
                      />
                      <span aria-hidden="true">{n}</span>
                    </label>
                  ))}
                </div>
                <FieldError id={`${id}-count-error`} message={errors.guestCount} />
              </fieldset>
            ) : null}

            <div className="relative inline-block">
              <button
                type="submit"
                disabled={locked}
                className={cn(
                  "btn-pill min-w-56",
                  status === "done" ? "border-fg bg-fg text-bg" : "hover:bg-fg hover:text-bg",
                  status === "sending" && "opacity-70",
                )}
              >
                {status === "sending" ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Mengirim…
                  </>
                ) : status === "done" ? (
                  <>
                    <Check className="size-4" aria-hidden="true" />
                    Terima kasih!
                  </>
                ) : (
                  <>
                    <Send className="size-4" aria-hidden="true" />
                    Kirim Konfirmasi
                  </>
                )}
              </button>
              <Confetti burst={burst} />
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
