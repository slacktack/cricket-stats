import { getMatchOvers } from "@/lib/data/overs";
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
    const overs = await getMatchOvers(matchId);
    return jsonResponse(overs, { maxAge: 15, staleWhileRevalidate: 60 });
  } catch (error) {
    return errorResponse(error);
  }
}
