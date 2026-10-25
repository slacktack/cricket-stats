import { getMatchDetail } from "@/lib/data/match";
import { CricbuzzError } from "@/lib/cricbuzz/http";
import { errorResponse, jsonResponse, parsePositiveInt } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const matchId = parsePositiveInt(id);
  if (!matchId) {
    return errorResponse(new CricbuzzError("Invalid match id", 400, "BAD_REQUEST"));
  }
  try {
    const detail = await getMatchDetail(matchId);
    return jsonResponse(detail, { maxAge: 8, staleWhileRevalidate: 45 });
  } catch (error) {
    return errorResponse(error);
  }
}
