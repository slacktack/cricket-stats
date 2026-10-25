import { NextResponse } from "next/server";
import { upstreamError } from "@/lib/api-error";

export function jsonResponse(
  data: unknown,
  options?: { maxAge?: number; staleWhileRevalidate?: number }
) {
  const maxAge = options?.maxAge ?? 0;
  const swr = options?.staleWhileRevalidate ?? 0;
  return NextResponse.json(data, {
    headers: {
      "cache-control": `public, max-age=0, s-maxage=${maxAge}, stale-while-revalidate=${swr}`,
    },
  });
}

export function errorResponse(error: unknown) {
  const { status, body } = upstreamError(error);
  return NextResponse.json(body, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

export function parsePositiveInt(value: string | undefined | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}
