import { getRankingCategory } from "@/lib/data/rankings";
import { CricbuzzError } from "@/lib/cricbuzz/http";
import { errorResponse, jsonResponse } from "@/lib/api-response";
import type {
  RankingCategory,
  RankingFormat,
  RankingGender,
} from "@/lib/types";

export const dynamic = "force-dynamic";

const CATEGORIES: RankingCategory[] = ["batting", "bowling", "all-rounder", "teams"];
const FORMATS: RankingFormat[] = ["test", "odi", "t20"];

function oneOf<T extends string>(value: string | null, allowed: T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gender: RankingGender = searchParams.get("gender") === "women" ? "women" : "men";
  const category = oneOf(searchParams.get("category"), CATEGORIES, "batting");
  const format = oneOf(searchParams.get("format"), FORMATS, "odi");

  try {
    const formats = await getRankingCategory(gender, category);
    return jsonResponse(
      {
        gender,
        category,
        format,
        entries: formats[format],
        formats,
        updatedAt: Date.now(),
      },
      { maxAge: 3600, staleWhileRevalidate: 21600 }
    );
  } catch (error) {
    return errorResponse(
      error instanceof CricbuzzError
        ? error
        : new CricbuzzError("Rankings unavailable", 502, "RANKINGS_ERROR")
    );
  }
}
