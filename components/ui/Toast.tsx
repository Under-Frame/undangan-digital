"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CircleCheck } from "lucide-react";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

import { EASE_EDITORIAL } from "@/components/motion/easing";

type ToastItem = { id: number; message: string };

const ToastContext = createContext<(message: string) => void>(() => {});

/** Tampilkan toast singkat: `const toast = useToast(); toast("Nomor disalin")`. */
export function useToast() {
  return useContext(ToastContext);
}

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const reduce = useReducedMotion();

  const show = useCallback((message: string) => {
    const id = ++nextId;
    setToasts((list) => [...list.slice(-2), { id, message }]);
    window.setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 2800);
  }, []);

  return (
    <ToastContext value={show}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-[max(1rem,env(safe-area-inset-top))] z-[60] flex flex-col items-center gap-2 px-4"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout={!reduce}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              transition={{ duration: 0.4, ease: EASE_EDITORIAL }}
              className="flex items-center gap-2 rounded-full bg-fg px-5 py-3 text-sm font-medium text-bg"
            >
              <CircleCheck className="size-4" aria-hidden="true" />
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext>
  );
}
