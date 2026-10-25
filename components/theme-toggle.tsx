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
      className="group grid h-9 w-9 place-items-center rounded-full border border-header-ink/15 bg-surface2/70 text-header-ink transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent"
      aria-label="Toggle colour theme"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      <Moon className="theme-moon h-[18px] w-[18px] transition-transform group-hover:-rotate-12" />
      <Sun className="theme-sun h-[18px] w-[18px] transition-transform group-hover:rotate-45" />
    </button>
  );
}
