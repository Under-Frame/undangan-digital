"use client";

import { Disc3, Music } from "lucide-react";
import { useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";

import { cn } from "@/lib/utils";

export type MusicToggleHandle = { play: () => void };

type MusicToggleProps = {
  src: string;
  visible: boolean;
  ref?: Ref<MusicToggleHandle>;
};

const TARGET_VOLUME = 0.5;

/** Tombol bulat melayang kanan bawah. Musik tidak autoplay; mulai saat undangan dibuka. */
export function MusicToggle({ src, visible, ref }: MusicToggleProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  // true jika musik dijeda otomatis karena tab disembunyikan (bukan oleh tamu).
  const autoPaused = useRef(false);

  const play = () => {
    const audio = audioRef.current;
    if (!audio || failed) return;
    // Naik pelan supaya tidak mengagetkan (iOS mengabaikan volume, tidak masalah).
    audio.volume = 0;
    audio
      .play()
      .then(() => {
        const started = performance.now();
        const step = (now: number) => {
          const t = Math.min((now - started) / 2000, 1);
          audio.volume = TARGET_VOLUME * t;
          if (t < 1 && !audio.paused) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      })
      .catch(() => {
        // Diblokir browser atau file tidak ada: tamu masih bisa menekan tombol play.
      });
  };

  useImperativeHandle(ref, () => ({ play }));

  // Jeda saat tab/aplikasi ditinggalkan, lanjutkan saat kembali.
  useEffect(() => {
    const onVisibility = () => {
      const audio = audioRef.current;
      if (!audio) return;
      if (document.hidden && !audio.paused) {
        autoPaused.current = true;
        audio.pause();
      } else if (!document.hidden && autoPaused.current) {
        autoPaused.current = false;
        void audio.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) play();
    else audio.pause();
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={src}
        preload="none"
        loop
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => setFailed(true)}
      />
      {!failed ? (
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Jeda musik" : "Putar musik"}
          aria-pressed={playing}
          className={cn(
            "fixed right-4 z-40 grid size-12 place-items-center rounded-full border border-line bg-bg/75 text-fg backdrop-blur-md transition-[opacity,translate] duration-500 ease-editorial",
            "bottom-[calc(5.5rem+env(safe-area-inset-bottom))]",
            visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
          )}
          tabIndex={visible ? 0 : -1}
          aria-hidden={!visible}
        >
          {playing ? (
            <Disc3 className="size-5 animate-[spin_4s_linear_infinite] motion-reduce:animate-none" aria-hidden="true" />
          ) : (
            <Music className="size-5" aria-hidden="true" />
          )}
        </button>
      ) : null}
    </>
  );
}
