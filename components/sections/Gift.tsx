"use client";

import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { ChevronDown, Copy, Gift as GiftIcon, MapPin } from "lucide-react";
import Image from "next/image";
import { useId, useState } from "react";

import { EASE_EDITORIAL } from "@/components/motion/easing";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useToast } from "@/components/ui/Toast";
import { copyText } from "@/lib/clipboard";
import type { WeddingConfig } from "@/lib/config";
import { groupDigits } from "@/lib/utils";

type GiftProps = {
  gifts: WeddingConfig["gifts"];
  qrisImage?: string | null;
  giftAddress?: string | null;
  coupleNames: string;
};

export function Gift({ gifts, qrisImage, giftAddress, coupleNames }: GiftProps) {
  const [open, setOpen] = useState(false);
  const toast = useToast();
  const reduce = useReducedMotion();
  const panelId = useId();

  const copy = async (text: string, message: string) => {
    toast((await copyText(text)) ? message : "Gagal menyalin, silakan salin manual");
  };

  return (
    <section id="hadiah" className="mx-auto max-w-[1100px] px-6 py-24 md:px-10 md:py-32">
      <SectionHeading label="Amplop Digital" title="Tanda kasih." />

      <Reveal className="max-w-xl">
        <p className="text-muted">
          Doa restu Anda adalah karunia terindah bagi kami. Namun jika ingin memberikan tanda kasih, Anda dapat
          mengirimkannya melalui pilihan berikut.
        </p>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          className="btn-pill mt-8 hover:bg-fg hover:text-bg"
        >
          <GiftIcon className="size-4" aria-hidden="true" />
          Kirim Hadiah
          <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
        </button>
      </Reveal>

      <AnimatePresence initial={false}>
        {open ? (
          <m.div
            id={panelId}
            key="panel"
            initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, height: "auto" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: reduce ? 0 : 0.5, ease: EASE_EDITORIAL }}
            className="overflow-hidden"
          >
            <div className="grid gap-6 pt-12 md:grid-cols-2">
              {gifts.map((gift) => (
                <article
                  key={`${gift.provider}-${gift.number}`}
                  className="relative flex aspect-[1.586/1] max-w-md flex-col justify-between overflow-hidden rounded-3xl bg-[linear-gradient(135deg,var(--fg)_0%,color-mix(in_oklab,var(--fg)_78%,var(--accent))_60%,color-mix(in_oklab,var(--fg)_55%,var(--accent))_100%)] p-6 text-bg"
                >
                  {/* Kilau halus ala kartu debit */}
                  <span
                    className="pointer-events-none absolute -top-1/2 -right-1/4 size-[120%] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--bg)_14%,transparent),transparent_60%)]"
                    aria-hidden="true"
                  />
                  <div className="relative flex items-start justify-between">
                    <p className="font-serif text-2xl">{gift.provider}</p>
                    <p className="label-caps opacity-70">{gift.type === "bank" ? "Rekening" : "E-Wallet"}</p>
                  </div>
                  <div className="relative">
                    <p className="font-serif text-[clamp(1.375rem,6.5vw,1.75rem)] tracking-wide tabular-nums">
                      {groupDigits(gift.number)}
                    </p>
                    <div className="mt-3 flex items-end justify-between gap-3">
                      <div className="min-w-0">
                        <p className="label-caps opacity-70">Atas nama</p>
                        <p className="truncate text-sm font-medium">{gift.holder}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => copy(gift.number.replace(/\D/g, ""), "Nomor disalin")}
                        className="btn-pill shrink-0 border-bg/50 px-4 text-xs hover:bg-bg hover:text-fg"
                        aria-label={`Salin nomor ${gift.provider} atas nama ${gift.holder}`}
                      >
                        <Copy className="size-3.5" aria-hidden="true" />
                        Salin
                      </button>
                    </div>
                  </div>
                </article>
              ))}

              {qrisImage ? (
                <article className="flex max-w-md flex-col items-start rounded-3xl border border-line p-6">
                  <p className="label-caps text-muted">QRIS</p>
                  <div className="relative mt-4 aspect-square w-full max-w-64 overflow-hidden rounded-2xl bg-on-image">
                    <Image src={qrisImage} alt={`Kode QRIS untuk hadiah ${coupleNames}`} fill sizes="256px" className="object-contain p-3" />
                  </div>
                  <p className="mt-4 text-sm text-muted">Pindai dengan aplikasi bank atau e-wallet apa pun.</p>
                </article>
              ) : null}

              {giftAddress ? (
                <article className="flex max-w-md flex-col items-start rounded-3xl border border-line p-6">
                  <p className="label-caps text-muted">Kirim kado</p>
                  <p className="mt-4 flex gap-2 text-lg">
                    <MapPin className="mt-1.5 size-4 shrink-0 text-muted" aria-hidden="true" />
                    {giftAddress}
                  </p>
                  <button
                    type="button"
                    onClick={() => copy(giftAddress, "Alamat disalin")}
                    className="btn-pill mt-6 hover:bg-fg hover:text-bg"
                  >
                    <Copy className="size-4" aria-hidden="true" />
                    Salin Alamat
                  </button>
                </article>
              ) : null}
            </div>
          </m.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
