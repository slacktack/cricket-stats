import { getTeamOverview } from "@/lib/data/team";
import { CricbuzzError } from "@/lib/cricbuzz/http";
import { errorResponse, jsonResponse, parsePositiveInt } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const teamId = parsePositiveInt(id);
  if (!teamId) {
    return errorResponse(new CricbuzzError("Invalid team id", 400, "BAD_REQUEST"));
  }
  try {
    const team = await getTeamOverview(teamId);
    return jsonResponse(team, { maxAge: 30, staleWhileRevalidate: 120 });
  } catch (error) {
    return errorResponse(error);
  }
}
