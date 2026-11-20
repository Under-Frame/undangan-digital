"use client";

import { Copy, MessageCircle, Sparkles } from "lucide-react";
import { useState } from "react";

import { inputClass } from "@/components/ui/form";
import { useToast } from "@/components/ui/Toast";
import { copyText } from "@/lib/clipboard";
import { cn, sanitizeGuestName } from "@/lib/utils";

type LinkGeneratorProps = {
  slug: string;
  coupleNames: string;
  fullNames: string;
  dateLabel: string;
};

type GuestLink = { name: string; url: string; text: string };

const MAX_GUESTS = 500;

function buildMessage(name: string, url: string, { coupleNames, fullNames, dateLabel }: Omit<LinkGeneratorProps, "slug">) {
  return [
    "Kepada Yth.",
    "Bapak/Ibu/Saudara/i",
    `*${name}*`,
    "",
    "Tanpa mengurangi rasa hormat, kami bermaksud mengundang Anda untuk hadir di acara pernikahan kami:",
    "",
    `*${fullNames}*`,
    dateLabel,
    "",
    "Informasi lengkap acara dan konfirmasi kehadiran dapat dilihat melalui tautan berikut:",
    url,
    "",
    "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Anda berkenan hadir dan memberikan doa restu.",
    "",
    "Terima kasih.",
    `Kami yang berbahagia, ${coupleNames}`,
  ].join("\n");
}

export function LinkGenerator({ slug, coupleNames, fullNames, dateLabel }: LinkGeneratorProps) {
  const toast = useToast();
  const [input, setInput] = useState("");
  const [links, setLinks] = useState<GuestLink[]>([]);

  const generate = () => {
    const origin = window.location.origin;
    const seen = new Set<string>();
    const result: GuestLink[] = [];
    for (const line of input.split(/\r?\n/)) {
      if (!line.trim()) continue;
      const name = sanitizeGuestName(line);
      const key = name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      const url = `${origin}/${slug}?to=${encodeURIComponent(name)}`;
      result.push({ name, url, text: buildMessage(name, url, { coupleNames, fullNames, dateLabel }) });
      if (result.length >= MAX_GUESTS) break;
    }
    setLinks(result);
    toast(result.length ? `${result.length} link dibuat` : "Masukkan minimal satu nama");
  };

  const copy = async (text: string, message: string) => {
    toast((await copyText(text)) ? message : "Gagal menyalin");
  };

  return (
    <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-12">
      <div className="min-w-0 lg:col-span-4">
        <label htmlFor="guest-names" className="label-caps text-muted">
          Nama tamu — satu nama per baris
        </label>
        <textarea
          id="guest-names"
          rows={8}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={"Pak Hadi\nBu Ani & Keluarga\nRizky"}
          className={cn(inputClass, "resize-y")}
        />
        <button type="button" onClick={generate} className="btn-pill mt-6 bg-fg text-bg hover:opacity-90">
          <Sparkles className="size-4" aria-hidden="true" />
          Buat Link
        </button>
        <p className="mt-4 text-xs text-muted">Nama ganda dilewati. Maksimal {MAX_GUESTS} nama sekali buat.</p>
      </div>

      <div className="min-w-0 lg:col-span-8">
        {links.length === 0 ? (
          <p className="rounded-3xl border border-line px-5 py-10 text-center text-muted">
            Link undangan per tamu akan muncul di sini.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted">{links.length} link siap dikirim</p>
              <button
                type="button"
                onClick={() => copy(links.map((l) => `${l.name}\t${l.url}`).join("\n"), "Semua link disalin")}
                className="btn-pill border-line px-4 text-xs hover:border-fg"
              >
                <Copy className="size-4" aria-hidden="true" />
                Salin semua link
              </button>
            </div>
            <ul className="mt-4 divide-y divide-line rounded-3xl border border-line">
              {links.map((l) => (
                <li key={l.url} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{l.name}</p>
                    <p className="truncate text-xs text-muted">{l.url}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => copy(l.text, "Teks undangan disalin")}
                      className="btn-pill border-line px-4 text-xs hover:border-fg"
                      aria-label={`Salin teks undangan untuk ${l.name}`}
                    >
                      <Copy className="size-4" aria-hidden="true" />
                      Salin teks
                    </button>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(l.text)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-pill px-4 text-xs hover:bg-fg hover:text-bg"
                      aria-label={`Kirim undangan untuk ${l.name} via WhatsApp (tab baru)`}
                    >
                      <MessageCircle className="size-4" aria-hidden="true" />
                      Kirim via WA
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
