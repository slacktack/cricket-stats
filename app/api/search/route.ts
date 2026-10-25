import { getSearchIndex } from "@/lib/data/search";
import { querySearchIndex } from "@/lib/search";
import { errorResponse, jsonResponse } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").slice(0, 80);
  const rawLimit = Number(searchParams.get("limit") ?? 10);
  const limit = Number.isInteger(rawLimit) ? Math.min(30, Math.max(1, rawLimit)) : 10;

  try {
    const index = await getSearchIndex();
    const results = querySearchIndex(index, query, limit);
    return jsonResponse(results, { maxAge: 60, staleWhileRevalidate: 300 });
  } catch (error) {
    return errorResponse(error);
  }
}
