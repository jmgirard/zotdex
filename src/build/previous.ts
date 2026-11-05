import type { Fetch } from "../upstream/reader.ts";
import { withinLimit } from "../upstream/time-limit.ts";

// The deployed data, which the daily build keeps facts from (src/build/keep.ts) and
// `pnpm carry-start-results` reuses start results from.
export const PREVIOUS_URL = "https://jmgirard.github.io/zotero-plugin-index/v1/plugins.json";

// The largest earlier data read, counted in decoded bytes. The deployed file of 272 plugins was
// 375,942 bytes (observed 2026-10-30).
export const PREVIOUS_MAX_BYTES = 16 * 1024 * 1024;

// The longest the earlier data read may take.
export const PREVIOUS_LIMIT_MS = 60_000;

// The plugins list and generatedAt of the earlier data, read within `limitMs` and
// PREVIOUS_MAX_BYTES of decoded body, or the problem that stopped the read. generatedAt is
// whatever the file holds, unchecked.
export async function readPrevious(
  url: string,
  fetch: Fetch,
  limitMs: number,
): Promise<{ plugins: unknown[]; generatedAt: unknown } | { problem: string }> {
  return withinLimit(limitMs, async (signal) => {
    let text: string;
    try {
      const response = await fetch(url, { signal });
      if (response.status !== 200) {
        await response.body?.cancel().catch(() => {});
        return { problem: `GET ${url} returned HTTP ${response.status}` };
      }
      const bytes = await readCapped(response, PREVIOUS_MAX_BYTES);
      if (!bytes) return { problem: `the body of ${url} is over ${PREVIOUS_MAX_BYTES} bytes` };
      text = new TextDecoder().decode(bytes);
    } catch (error) {
      const reason = signal.aborted ? (signal.reason as Error).message : (error as Error).message;
      return { problem: `cannot read ${url}: ${reason}` };
    }
    let value: unknown;
    try {
      value = JSON.parse(text);
    } catch (error) {
      return { problem: `${url} is not JSON: ${(error as Error).message}` };
    }
    const { plugins, generatedAt } = (value ?? {}) as { plugins?: unknown; generatedAt?: unknown };
    return Array.isArray(plugins) ? { plugins, generatedAt } : { problem: `${url} has no plugins list` };
  });
}

// The body's bytes, or undefined once more than `max` have arrived.
async function readCapped(response: Response, max: number): Promise<Uint8Array | undefined> {
  if (!response.body) return new Uint8Array();
  const chunks: Uint8Array[] = [];
  let size = 0;
  const reader = response.body.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > max) {
      await reader.cancel().catch(() => {});
      return undefined;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let at = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, at);
    at += chunk.length;
  }
  return bytes;
}
