"use client";

import { useEffect, useState } from "react";
import type { Palette } from "@/lib/theme";
import { applyPalette, readPalette } from "@/lib/theme";
import { cn } from "@/lib/utils";

const OPTIONS: { key: Palette; label: string; swatch: string }[] = [
  { key: "grid", label: "Grid", swatch: "#1f3bff" },
  { key: "crimson", label: "Crimson", swatch: "#e10600" },
  { key: "amber", label: "Amber", swatch: "#a87a26" },
];

/** Three printed colourways, each with its own day and night stock. */
export function PaletteSwitch({ className }: { className?: string }) {
  const [palette, setPalette] = useState<Palette>("grid");

  useEffect(() => {
    setPalette(readPalette());
  }, []);

  return (
    <div
      className={cn("grid gap-1.5", className)}
      role="group"
      aria-label="Colour theme"
    >
      {OPTIONS.map((item) => {
        const active = palette === item.key;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => {
              setPalette(item.key);
              applyPalette(item.key);
            }}
            aria-pressed={active}
            className={cn(
              "relative isolate overflow-hidden border px-2 py-2 text-left text-[10px] font-bold uppercase leading-none tracking-[0.08em] transition-colors duration-200",
              active ? "border-transparent text-white" : "border-line text-muted hover:text-ink"
            )}
          >
            {active ? (
              <span className="absolute inset-0 -z-1" style={{ background: item.swatch }} />
            ) : null}
            <span className="relative flex items-center gap-1.5">
              <span
                className="h-2 w-2 shrink-0"
                style={{ background: active ? "#fff" : item.swatch }}
              />
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
