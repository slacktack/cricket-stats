function scanBalanced(
  source: string,
  start: number
): { value: string; end: number } | null {
  const opener = source[start];
  if (opener !== "{" && opener !== "[") return null;
  const stack: string[] = [opener === "{" ? "}" : "]"];
  let inString = false;
  let escaped = false;

  for (let index = start + 1; index < source.length; index += 1) {
    const char = source[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') {
      inString = true;
      continue;
    }
    if (char === "{" || char === "[") {
      stack.push(char === "{" ? "}" : "]");
      continue;
    }
    if (char === "}" || char === "]") {
      if (stack[stack.length - 1] !== char) return null;
      stack.pop();
      if (stack.length === 0) {
        return { value: source.slice(start, index + 1), end: index + 1 };
      }
    }
  }
  return null;
}

export function extractFlight(html: string): string {
  const chunks: string[] = [];
  let cursor = 0;
  while (cursor < html.length) {
    const marker = html.indexOf("self.__next_f.push(", cursor);
    if (marker < 0) break;
    const arrayStart = html.indexOf("[", marker);
    if (arrayStart < 0) break;
    const scanned = scanBalanced(html, arrayStart);
    if (!scanned) break;
    try {
      const parsed = JSON.parse(scanned.value);
      if (Array.isArray(parsed) && typeof parsed[1] === "string") {
        chunks.push(parsed[1]);
      }
    } catch {
      // Ignore non-flight payloads.
    }
    cursor = scanned.end;
  }
  return chunks.join("");
}

export function findAllJSON<T = unknown>(text: string, key: string): T[] {
  const results: T[] = [];
  const needle = `"${key}"`;
  let cursor = 0;
  while (cursor < text.length) {
    const keyIndex = text.indexOf(needle, cursor);
    if (keyIndex < 0) break;
    let valueStart = keyIndex + needle.length;
    while (valueStart < text.length && /\s|:/.test(text[valueStart])) valueStart += 1;
    if (text[valueStart] === "{" || text[valueStart] === "[") {
      const scanned = scanBalanced(text, valueStart);
      if (scanned) {
        try {
          results.push(JSON.parse(scanned.value) as T);
        } catch {
          // Ignore malformed fragments.
        }
      }
    }
    cursor = keyIndex + needle.length;
  }
  return results;
}

export function findJSON<T = unknown>(text: string, key: string): T | null {
  const all = findAllJSON<T>(text, key);
  return all.length ? all[0] : null;
}

export function findLastJSON<T = unknown>(text: string, key: string): T | null {
  const all = findAllJSON<T>(text, key);
  return all.length ? all[all.length - 1] : null;
}

export function findRichestJSON<T extends Record<string, unknown>>(
  text: string,
  key: string,
  score: (value: T) => number
): T | null {
  const all = findAllJSON<T>(text, key);
  let best: T | null = null;
  let bestScore = -1;
  for (const value of all) {
    const valueScore = score(value);
    if (valueScore > bestScore) {
      best = value;
      bestScore = valueScore;
    }
  }
  return best;
}
