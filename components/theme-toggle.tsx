"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "dark" | "light";

export function ThemeToggle() {
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
      ?.setAttribute("content", next === "dark" ? "#070B12" : "#F4F7FB");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="grid h-9 w-9 place-items-center rounded-lg border border-header-ink/25 text-header-ink transition-colors hover:bg-header-ink/10"
      aria-label="Toggle colour theme"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      <Moon className="theme-moon h-[18px] w-[18px]" />
      <Sun className="theme-sun h-[18px] w-[18px]" />
    </button>
  );
}
