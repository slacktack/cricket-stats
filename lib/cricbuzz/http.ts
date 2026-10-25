const BASE_URL = "https://www.cricbuzz.com";

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const BASE_HEADERS: Record<string, string> = {
  "user-agent": USER_AGENT,
  accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "accept-language": "en-US,en;q=0.9",
  "cache-control": "no-cache",
  pragma: "no-cache",
  referer: "https://www.cricbuzz.com/",
  "upgrade-insecure-requests": "1",
};

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
  staleUntil: number;
};

const cache = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

function pruneCache() {
  if (cache.size < 240) return;
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (entry.staleUntil < now) cache.delete(key);
  }
}

export class CricbuzzError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 502, code = "UPSTREAM_ERROR") {
    super(message);
    this.name = "CricbuzzError";
    this.status = status;
    this.code = code;
  }
}

export async function cachedValue<T>(
  key: string,
  ttlMs: number,
  staleMs: number,
  loader: () => Promise<T>
): Promise<T> {
  const now = Date.now();
  const existing = cache.get(key) as CacheEntry<T> | undefined;
  if (existing && now < existing.expiresAt) return existing.value;

  const pending = inflight.get(key);
  if (pending) return pending as Promise<T>;

  const promise = loader()
    .then((value) => {
      cache.set(key, {
        value,
        expiresAt: Date.now() + ttlMs,
        staleUntil: Date.now() + ttlMs + staleMs,
      });
      pruneCache();
      return value;
    })
    .catch((error) => {
      if (existing && Date.now() < existing.staleUntil) return existing.value;
      throw error;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, promise);
  return promise;
}

async function requestHtml(path: string, attempt = 1): Promise<string> {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
  let response: Response;

  try {
    response = await fetch(url, {
      headers: BASE_HEADERS,
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
      redirect: "follow",
    });
  } catch (error) {
    if (attempt < 2) {
      await new Promise((resolve) => setTimeout(resolve, 350));
      return requestHtml(path, attempt + 1);
    }
    const message = error instanceof Error ? error.message : "Request failed";
    throw new CricbuzzError(message, 504, "TIMEOUT");
  }

  if (!response.ok) {
    if (response.status === 404) {
      throw new CricbuzzError("Match not found", 404, "NOT_FOUND");
    }
    if (response.status === 403) {
      throw new CricbuzzError("Upstream blocked the request", 502, "BLOCKED");
    }
    if (response.status === 429) {
      throw new CricbuzzError("Too many upstream requests", 429, "RATE_LIMIT");
    }
    if (response.status >= 500 && attempt < 2) {
      await new Promise((resolve) => setTimeout(resolve, 350));
      return requestHtml(path, attempt + 1);
    }
    throw new CricbuzzError(
      `Upstream responded with ${response.status}`,
      502,
      "UPSTREAM_ERROR"
    );
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) {
    throw new CricbuzzError("Unexpected upstream response", 502, "BAD_CONTENT");
  }

  const html = await response.text();
  if (html.length < 500) {
    throw new CricbuzzError("Upstream returned an empty page", 502, "EMPTY_PAGE");
  }
  return html;
}

export async function fetchCricbuzz(
  path: string,
  options?: { ttlMs?: number; staleMs?: number }
): Promise<string> {
  if (!path.startsWith("/")) {
    throw new CricbuzzError("Invalid upstream path", 400, "BAD_PATH");
  }
  const ttlMs = options?.ttlMs ?? 10_000;
  const staleMs = options?.staleMs ?? 5 * 60_000;
  return cachedValue(`html:${path}`, ttlMs, staleMs, () => requestHtml(path));
}

export function upstreamErrorResponse(error: unknown): {
  status: number;
  body: { error: string; code?: string };
} {
  if (error instanceof CricbuzzError) {
    return {
      status: error.status,
      body: { error: error.message, code: error.code },
    };
  }
  return {
    status: 500,
    body: { error: "Something went wrong while fetching cricket data." },
  };
}
