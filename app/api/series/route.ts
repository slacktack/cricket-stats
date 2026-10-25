import { getSeriesList } from "@/lib/data/series";
import { errorResponse, jsonResponse } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const series = await getSeriesList();
    return jsonResponse(
      { series, updatedAt: Date.now() },
      { maxAge: 60, staleWhileRevalidate: 300 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}
