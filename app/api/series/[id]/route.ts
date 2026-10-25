import { getSeriesInfo } from "@/lib/data/series";
import { CricbuzzError } from "@/lib/cricbuzz/http";
import { errorResponse, jsonResponse, parsePositiveInt } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const seriesId = parsePositiveInt(id);
  if (!seriesId) {
    return errorResponse(new CricbuzzError("Invalid series id", 400, "BAD_REQUEST"));
  }
  try {
    const series = await getSeriesInfo(seriesId);
    return jsonResponse(series, { maxAge: 60, staleWhileRevalidate: 300 });
  } catch (error) {
    return errorResponse(error);
  }
}
