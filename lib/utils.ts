import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const IST_TIME_ZONE = "Asia/Kolkata";

export function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, ""));
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

export function asOptionalNumber(value: unknown): number | undefined {
  if (value === "$undefined" || value === null || value === undefined || value === "")
    return undefined;
  const parsed = asNumber(value, Number.NaN);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string" && value !== "$undefined") return value.trim();
  if (typeof value === "number") return String(value);
  return fallback;
}

export function asBoolean(value: unknown): boolean {
  return value === true || value === "true" || value === 1;
}

export function parseTimestamp(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value < 10_000_000_000 ? value * 1000 : value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed < 10_000_000_000 ? parsed * 1000 : parsed;
    }
    const date = Date.parse(value);
    if (Number.isFinite(date)) return date;
  }
  return 0;
}

export function formatOvers(overs: number | undefined): string {
  if (!overs || overs <= 0) return "0";
  return Number.isInteger(overs) ? String(overs) : overs.toFixed(1);
}

export function ballsFromOvers(overs: number): number {
  const whole = Math.floor(overs);
  const balls = Math.round((overs - whole) * 10);
  return whole * 6 + balls;
}

export function formatScore(
  runs: number,
  wickets: number,
  options?: { withWickets?: boolean }
): string {
  const withWickets = options?.withWickets ?? true;
  if (!withWickets) return String(runs);
  return `${runs}/${wickets}`;
}

export function displayFormat(formatRaw: string, matchType?: string): string {
  const raw = (formatRaw || "").trim();
  const upper = raw.toUpperCase();
  if (!upper) return "MATCH";
  if (upper === "T20") return matchType === "International" ? "T20I" : "T20";
  if (upper === "TEST") return "TEST";
  if (upper === "ODI") return "ODI";
  if (upper === "T10") return "T10";
  if (upper === "FIRST-CLASS" || upper === "FC") return "FC";
  if (upper === "LIST A") return "LIST A";
  if (upper === "THE HUNDRED") return "100B";
  if (upper === "T20I") return "T20I";
  return upper;
}

export function oversLimit(formatRaw: string): number | undefined {
  const raw = (formatRaw || "").toUpperCase();
  if (raw === "ODI" || raw === "LIST A") return 50;
  if (raw === "T20" || raw === "T20I") return 20;
  if (raw === "T10") return 10;
  if (raw === "THE HUNDRED") return 16.4;
  return undefined;
}

export function ballsLimit(formatRaw: string): number | undefined {
  const raw = (formatRaw || "").toUpperCase();
  if (raw === "ODI" || raw === "LIST A") return 300;
  if (raw === "T20" || raw === "T20I") return 120;
  if (raw === "T10") return 60;
  if (raw === "THE HUNDRED") return 100;
  return undefined;
}

export function normalizeState(raw: string): "live" | "upcoming" | "completed" {
  const value = (raw || "").toLowerCase();
  if (
    value.includes("complete") ||
    value.includes("abandon") ||
    value.includes("cancel") ||
    value.includes("no result")
  ) {
    return "completed";
  }
  if (
    value.includes("preview") ||
    value.includes("upcoming") ||
    value.includes("scheduled") ||
    value.includes("not started")
  ) {
    return "upcoming";
  }
  return "live";
}

export function isStateLive(raw: string): boolean {
  return normalizeState(raw) === "live";
}

const SERIES_NAME_FIXES: Record<number, string> = {
  13091: "India A tour of New Zealand, 2026",
};

export function cleanSeriesName(seriesId: number, name: string): string {
  const fixed = SERIES_NAME_FIXES[seriesId];
  if (fixed) return fixed;
  return name
    .replace(/\s+/g, " ")
    .replace(/NeIndia A tour of [^,]+?w Zealand/gi, "New Zealand")
    .trim();
}

export function getInitials(name: string): string {
  const parts = name
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function shortNameFrom(name: string): string {
  const cleaned = name.replace(/\b(women|woman|u19|a)\b/gi, "").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length >= 3) return parts.map((p) => p[0]).join("").slice(0, 4).toUpperCase();
  if (parts.length === 2) return `${parts[0][0]}${parts[1].slice(0, 2)}`.toUpperCase();
  return cleaned.slice(0, 3).toUpperCase();
}

export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const int = Number.parseInt(full, 16);
  if (!Number.isFinite(int)) return `rgba(201,245,79,${alpha})`;
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function decodeEntities(value: string): string {
  const named: Record<string, string> = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
    nbsp: " ",
    rsquo: "’",
    lsquo: "‘",
    ldquo: "“",
    rdquo: "”",
    ndash: "–",
    mdash: "—",
    hellip: "…",
  };
  return value
    .replace(/&([a-zA-Z]+);/g, (match, name: string) => named[name] ?? match)
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 10))
    )
    .replace(/&#x([a-fA-F0-9]+);/g, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16))
    );
}

export function sanitizeText(value: string): string {
  if (!value) return "";
  return decodeEntities(
    value
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim();
}

export function formatDate(
  timestamp: number,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!timestamp) return "TBD";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: IST_TIME_ZONE,
    ...options,
  }).format(new Date(timestamp));
}

export function formatDay(timestamp: number): string {
  if (!timestamp) return "TBD";
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: IST_TIME_ZONE,
  }).format(new Date(timestamp));
}

export function formatTime(timestamp: number, withSuffix = true): string {
  if (!timestamp) return "TBD";
  const formatted = new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: IST_TIME_ZONE,
  })
    .format(new Date(timestamp))
    .toUpperCase();
  return withSuffix ? `${formatted} IST` : formatted;
}

export function formatDateTime(timestamp: number): string {
  if (!timestamp) return "TBD";
  return `${formatDate(timestamp)} · ${formatTime(timestamp)}`;
}

export function formatDateRange(start?: number, end?: number): string {
  if (!start && !end) return "Dates TBD";
  if (start && end && start !== end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const sameMonth =
      startDate.getUTCMonth() === endDate.getUTCMonth() &&
      startDate.getUTCFullYear() === endDate.getUTCFullYear();
    if (sameMonth) {
      return `${formatDate(start, { year: undefined })} – ${formatDate(end)}`;
    }
    return `${formatDate(start)} – ${formatDate(end)}`;
  }
  return formatDate(start || end || 0);
}

export function relativeDayLabel(timestamp: number): string {
  if (!timestamp) return "TBD";
  const dayMs = 86_400_000;
  const startOfToday = new Date().setHours(0, 0, 0, 0);
  const startOfTarget = new Date(timestamp).setHours(0, 0, 0, 0);
  const diff = Math.round((startOfTarget - startOfToday) / dayMs);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return formatDay(timestamp);
}

export function timeAgo(timestamp: number): string {
  if (!timestamp) return "just now";
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export function countdownText(target: number, now = Date.now()): string {
  const diff = target - now;
  if (diff <= 0) return "Starting soon";
  const minutes = Math.ceil(diff / 60_000);
  if (minutes < 60) return `Starts in ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours < 24) {
    return remainingMinutes
      ? `Starts in ${hours}h ${remainingMinutes}m`
      : `Starts in ${hours}h`;
  }
  const days = Math.floor(hours / 24);
  return `Starts in ${days}d`;
}

export function normalizeSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function uniqueBy<T>(items: T[], key: (item: T) => string | number): T[] {
  const seen = new Set<string | number>();
  return items.filter((item) => {
    const id = key(item);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}

export function ordinal(value: number): string {
  const mod10 = value % 10;
  const mod100 = value % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${value}th`;
  if (mod10 === 1) return `${value}st`;
  if (mod10 === 2) return `${value}nd`;
  if (mod10 === 3) return `${value}rd`;
  return `${value}th`;
}

export function formatMatchStatus(match: {
  state: "live" | "upcoming" | "completed";
  status: string;
  startTime: number;
}): string {
  if (match.state === "upcoming") {
    return `${relativeDayLabel(match.startTime)} · ${formatTime(match.startTime)}`;
  }
  return match.status;
}

export function isSameDay(a: number, b: number): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getUTCFullYear() === db.getUTCFullYear() &&
    da.getUTCMonth() === db.getUTCMonth() &&
    da.getUTCDate() === db.getUTCDate()
  );
}

export function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
