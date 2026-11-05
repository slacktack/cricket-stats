"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "dark" | "light";

export function ThemeToggle({ variant = "header" }: { variant?: "header" | "panel" | "rail" }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      window.localStorage.setItem("chauka-theme", next);
    } catch {
      // Storage can be unavailable in private mode.
    }
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", next === "dark" ? "#070D1F" : "#EEF4FF");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "group grid h-9 w-9 place-items-center rounded-lg border transition-colors duration-150",
        variant === "rail"
          ? "h-11 w-11 rounded-xl border-transparent text-white/70 hover:bg-white/10 hover:text-white"
          : variant === "header"
          ? "border-line bg-surface/60 text-header-ink hover:border-line-strong hover:bg-surface2"
          : "border-line text-muted hover:border-line-strong hover:bg-surface2 hover:text-ink"
      )}
      aria-label="Toggle colour theme"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      <Moon className="theme-moon h-[17px] w-[17px]" />
      <Sun className="theme-sun h-[17px] w-[17px]" />
    </button>
  );
}
