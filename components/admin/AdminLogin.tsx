"use client";

import { Loader2, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { FieldError, inputClass } from "@/components/ui/form";

type AdminLoginProps = { slug: string; coupleNames: string };

export function AdminLogin({ slug, coupleNames }: AdminLoginProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [sending, setSending] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Masukkan password.");
      return;
    }
    setSending(true);
    setError(undefined);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", slug, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Login gagal.");
        return;
      }
      router.refresh();
    } catch {
      setError("Koneksi bermasalah. Silakan coba lagi.");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6 py-16">
      <p className="label-caps text-muted">Dashboard</p>
      <h1 className="mt-4 text-[clamp(2.5rem,12vw,3.5rem)]">{coupleNames}</h1>
      <p className="mt-3 text-muted">Masuk untuk melihat RSVP, ucapan, dan membuat link undangan.</p>

      <form onSubmit={onSubmit} noValidate className="mt-10 space-y-8">
        <div>
          <label htmlFor="admin-password" className="label-caps text-muted">
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "admin-password-error" : undefined}
            className={inputClass}
          />
          <FieldError id="admin-password-error" message={error} />
        </div>
        <button type="submit" disabled={sending} className="btn-pill w-full bg-fg text-bg hover:opacity-90 disabled:opacity-70">
          {sending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <LockKeyhole className="size-4" aria-hidden="true" />
          )}
          Masuk
        </button>
      </form>
    </main>
  );
}
