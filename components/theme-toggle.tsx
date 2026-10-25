"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "dark" | "light";

export function ThemeToggle({ variant = "header" }: { variant?: "header" | "panel" }) {
  const [theme, setTheme] = useState<Theme>("light");

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
      ?.setAttribute("content", next === "dark" ? "#121939" : "#1F30B4");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "group grid h-10 w-10 place-items-center rounded-md border transition-colors duration-150",
        variant === "header"
          ? "border-header-ink/25 text-header-ink hover:border-header-ink hover:bg-header-ink/10"
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
