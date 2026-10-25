import { getPlayerProfile } from "@/lib/data/player";
import { CricbuzzError } from "@/lib/cricbuzz/http";
import { errorResponse, jsonResponse, parsePositiveInt } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const playerId = parsePositiveInt(id);
  if (!playerId) {
    return errorResponse(new CricbuzzError("Invalid player id", 400, "BAD_REQUEST"));
  }
  try {
    const player = await getPlayerProfile(playerId);
    return jsonResponse(player, { maxAge: 3600, staleWhileRevalidate: 21600 });
  } catch (error) {
    return errorResponse(error);
  }
}
