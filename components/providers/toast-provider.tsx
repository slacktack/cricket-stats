"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AlertCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastTone = "default" | "error";

type Toast = {
  id: number;
  message: string;
  tone: ToastTone;
};

const ToastContext = createContext<{
  toast: (message: string, tone?: ToastTone) => void;
} | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, tone: ToastTone = "default") => {
      counter.current += 1;
      const id = counter.current;
      setToasts((current) => [...current.slice(-2), { id, message, tone }]);
      const timer = setTimeout(() => dismiss(id), 3200);
      timers.current.set(id, timer);
    },
    [dismiss]
  );

  useEffect(() => {
    const currentTimers = timers.current;
    return () => {
      currentTimers.forEach((timer) => clearTimeout(timer));
      currentTimers.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex flex-col items-center gap-2 px-4 lg:bottom-8"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            role={item.tone === "error" ? "alert" : "status"}
            className={cn(
              "pointer-events-auto flex min-h-11 w-full max-w-sm items-center gap-2.5 border px-4 py-2.5 text-[12px] animate-slide-in",
              item.tone === "error"
                ? "border-live bg-surface text-ink"
                : "border-line-strong bg-ink text-bg"
            )}
          >
            <span
              className={cn(
                "grid h-5 w-5 shrink-0 place-items-center border",
                item.tone === "error"
                  ? "border-live/40 text-live"
                  : "border-bg/20 text-inherit"
              )}
            >
              {item.tone === "error" ? (
                <AlertCircle className="h-3.5 w-3.5" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
            </span>
            <span className="leading-snug">{item.message}</span>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              className="mono ml-auto text-[10px] font-medium uppercase tracking-[0.12em] text-current/60 transition-opacity hover:text-current"
              aria-label="Dismiss notification"
            >
              Close
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
