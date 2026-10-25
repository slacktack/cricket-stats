import type { ApiError } from "@/lib/types";
import { CricbuzzError } from "@/lib/cricbuzz/http";

export function upstreamError(error: unknown): {
  status: number;
  body: ApiError;
} {
  if (error instanceof CricbuzzError) {
    const status = error.status >= 400 && error.status < 600 ? error.status : 502;
    return {
      status,
      body: { error: error.message, code: error.code },
    };
  }
  console.error("Unexpected API error", error);
  return {
    status: 502,
    body: {
      error: "The cricket feed is temporarily unavailable.",
      code: "UPSTREAM_ERROR",
    },
  };
}
