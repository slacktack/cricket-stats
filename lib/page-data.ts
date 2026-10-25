import { notFound } from "next/navigation";
import { CricbuzzError } from "@/lib/cricbuzz/http";

export async function loadPage<T>(promise: Promise<T>): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    if (error instanceof CricbuzzError && (error.status === 400 || error.status === 404)) {
      notFound();
    }
    throw error;
  }
}
