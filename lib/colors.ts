const TEAM_COLORS: Record<string, string> = {
  IND: "#3B82F6",
  AUS: "#FACC15",
  ENG: "#5B7FDB",
  PAK: "#22A06B",
  SA: "#10B981",
  NZ: "#94A3B8",
  SL: "#4F76D8",
  WI: "#B91C1C",
  BAN: "#0F9D70",
  AFG: "#3B82F6",
  ZIM: "#DC2626",
  IRE: "#22C55E",
  SCO: "#4F46E5",
  NED: "#F97316",
  UAE: "#10B981",
  NAM: "#3B82F6",
  USA: "#2563EB",
  OMA: "#EF4444",
  NEP: "#E11D48",
  CAN: "#EF4444",
  PNG: "#F59E0B",
  HK: "#EF4444",
  KEN: "#22C55E",
  BER: "#2563EB",
  UGA: "#F59E0B",
  JER: "#F59E0B",
  ITA: "#22C55E",
  GER: "#64748B",
  CSK: "#FACC15",
  MI: "#3B82F6",
  RCB: "#EF4444",
  KKR: "#8B5CF6",
  SRH: "#F97316",
  DC: "#3B82F6",
  RR: "#EC4899",
  PBKS: "#EF4444",
  LSG: "#06B6D4",
  GT: "#64748B",
  SIX: "#EF4444",
  STA: "#22C55E",
  HUR: "#8B5CF6",
  REN: "#EF4444",
  THU: "#22C55E",
  STR: "#EF4444",
  HEA: "#FACC15",
};

const FALLBACK_COLORS = [
  "#3B82F6",
  "#F59E0B",
  "#10B981",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#F97316",
  "#6366F1",
  "#84CC16",
];

function hash(value: string): number {
  let result = 0;
  for (let index = 0; index < value.length; index += 1) {
    result = (result * 31 + value.charCodeAt(index)) | 0;
  }
  return Math.abs(result);
}

export function getTeamColor(shortName: string, id?: number): string {
  const normalized = (shortName || "").toUpperCase();
  if (TEAM_COLORS[normalized]) return TEAM_COLORS[normalized];
  if (normalized.endsWith("W") && normalized.length > 2) {
    const base = normalized.slice(0, -1);
    if (TEAM_COLORS[base]) return TEAM_COLORS[base];
  }
  if (normalized.endsWith("U19")) {
    const base = normalized.slice(0, -3);
    if (TEAM_COLORS[base]) return TEAM_COLORS[base];
  }
  const key = normalized || String(id ?? "team");
  return FALLBACK_COLORS[hash(key) % FALLBACK_COLORS.length];
}

export function getPlayerColor(id: number | string, name?: string): string {
  const key = `${id}${name ?? ""}`;
  return FALLBACK_COLORS[hash(key) % FALLBACK_COLORS.length];
}

export function teamImageUrl(imageId: number, size = "200x200"): string {
  return `https://static.cricbuzz.com/a/img/v1/${size}/i1/c${imageId}/team.png`;
}

export function playerImageUrl(faceImageId: number, size = "200x200"): string {
  return `https://static.cricbuzz.com/a/img/v1/${size}/i1/c${faceImageId}/player.png`;
}

export function isPlaceholderTeam(name?: string, imageId?: number): boolean {
  const value = (name || "").trim().toLowerCase();
  return (
    !value ||
    value === "tbc" ||
    value === "to be confirmed" ||
    value === "tba" ||
    imageId === 172198
  );
}
