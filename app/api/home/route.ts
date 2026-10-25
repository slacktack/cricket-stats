import { NextResponse } from "next/server";
import { getHomeFeed } from "@/lib/data/home";
import { upstreamError } from "@/lib/api-error";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const feed = await getHomeFeed();
    return NextResponse.json(feed, {
      headers: {
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
      },
    });
  } catch (error) {
    const { body, status } = upstreamError(error);
    return NextResponse.json(body, { status });
  }
}
