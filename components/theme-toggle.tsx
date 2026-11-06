"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { applyTheme, readTheme, type Theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function ThemeToggle({ variant = "header" }: { variant?: "header" | "panel" | "rail" }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(readTheme());
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "grid h-8 w-8 place-items-center border transition-colors duration-150",
        variant === "rail"
          ? "h-10 w-10 border-white/25 text-white/70 hover:border-white hover:text-white"
          : variant === "header"
          ? "border-line bg-surface text-header-ink hover:border-slab hover:text-slab"
          : "border-line text-muted hover:border-slab hover:text-slab"
      )}
      aria-label="Toggle colour theme"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      <Moon className="theme-moon h-[17px] w-[17px]" />
      <Sun className="theme-sun h-[17px] w-[17px]" />
    </button>
  );
}
