"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { Cover, type CoverProps } from "@/components/sections/Cover";
import { BottomNav, type NavItem } from "@/components/ui/BottomNav";
import { MusicToggle, type MusicToggleHandle } from "@/components/ui/MusicToggle";
import { ToastProvider } from "@/components/ui/Toast";

type InvitationShellProps = {
  cover: Omit<CoverProps, "opened" | "onOpen">;
  music?: string | null;
  navItems: NavItem[];
  /** Section setelah cover; di-render server. */
  children: ReactNode;
};

/**
 * Mengatur status "undangan sudah dibuka":
 * - sebelum dibuka: scroll dikunci, musik & bottom nav disembunyikan.
 * - saat tombol Buka Undangan ditekan: musik mulai, scroll ke section berikutnya.
 */
export function InvitationShell({ cover, music, navItems, children }: InvitationShellProps) {
  const [opened, setOpened] = useState(false);
  const musicRef = useRef<MusicToggleHandle>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Kunci scroll sebelum undangan dibuka.
  useEffect(() => {
    if (opened) return;
    const { documentElement: html, body } = document;
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = "";
      body.style.overflow = "";
    };
  }, [opened]);

  const handleOpen = useCallback(() => {
    // play() harus dipanggil langsung di event klik agar diizinkan browser (iOS/in-app browser).
    musicRef.current?.play();
    setOpened(true);
    requestAnimationFrame(() => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      contentRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    });
  }, []);

  return (
    <ToastProvider>
      <Cover {...cover} opened={opened} onOpen={handleOpen} />
      <div ref={contentRef} className="pb-28">
        {children}
      </div>
      {music ? <MusicToggle ref={musicRef} src={music} visible={opened} /> : null}
      <BottomNav items={navItems} visible={opened} />
    </ToastProvider>
  );
}
