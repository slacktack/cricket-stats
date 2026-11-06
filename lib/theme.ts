export type Theme = "dark" | "light";
export type Palette = "grid" | "crimson" | "amber";

const THEME_KEY = "chauka-theme";
const PALETTE_KEY = "chauka-palette";

function read<T>(key: string, fallback: T, allowed: readonly T[]): T {
  try {
    const value = localStorage.getItem(key) as T | null;
    return value && allowed.includes(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage can be unavailable in private mode.
  }
}

export function readTheme(): Theme {
  return read(THEME_KEY, "dark", ["dark", "light"] as const);
}

export function readPalette(): Palette {
  return read(PALETTE_KEY, "grid", ["grid", "crimson", "amber"] as const);
}

/** Keeps the browser chrome in step with whatever stock is actually on screen. */
export function syncThemeColor() {
  const triplet = getComputedStyle(document.documentElement)
    .getPropertyValue("--bg")
    .trim()
    .split(/\s+/)
    .map((part) => Math.round(Number(part) || 0));
  if (triplet.length !== 3) return;
  const hex = `#${triplet.map((n) => n.toString(16).padStart(2, "0")).join("")}`;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", hex);
  document.documentElement.style.colorScheme = readTheme() === "dark" ? "dark" : "light";
}

/** The surface cross-fades rather than snapping to the new stock. */
function fade() {
  const root = document.documentElement;
  root.classList.add("pal-fade");
  window.clearTimeout((root as HTMLElement & { _fade?: number })._fade);
  (root as HTMLElement & { _fade?: number })._fade = window.setTimeout(
    () => root.classList.remove("pal-fade"),
    420,
  );
}

export function applyTheme(next: Theme) {
  fade();
  document.documentElement.classList.toggle("dark", next === "dark");
  write(THEME_KEY, next);
  syncThemeColor();
}

export function applyPalette(next: Palette) {
  fade();
  if (next === "grid") document.documentElement.removeAttribute("data-pal");
  else document.documentElement.setAttribute("data-pal", next);
  write(PALETTE_KEY, next);
  syncThemeColor();
}
