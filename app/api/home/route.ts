import { getHomeFeed } from "@/lib/data/home";
import { errorResponse, jsonResponse } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const feed = await getHomeFeed();
    return jsonResponse(feed, { maxAge: 15, staleWhileRevalidate: 60 });
  } catch (error) {
    return errorResponse(error);
  }
}
