// The longest that the build keeps a plugin's earlier facts: 7 days before the build's
// generatedAt (D-066).
export const KEEP_MS = 7 * 24 * 60 * 60 * 1000;

// Why a kept record holds earlier facts: when the build that read them started, and this
// build's failure to read them again.
export interface Kept {
  readAt: string;
  failure: { name: string; message: string };
}

// The facts that a kept record takes from the deployed record.
export interface KeptFacts<Upstream, StartTest> {
  upstream: Upstream;
  startTests?: StartTest[];
  kept: Kept;
}

// The earlier deployed record of `id` that a record whose read failed for a build-level reason
// can keep, or undefined. The deployed list must name the id exactly once, and that record must
// have the same repoUrl, have an upstream, and pass `isRecord` (the record schema). Its `readAt`
// is its own kept.readAt, or the deployed file's generatedAt, and must parse, fall at most
// KEEP_MS before `now`, and not after it. The deployed data can hold any shape, so each of these
// is checked here, and a record whose kept facts the schema rejects is the caller's to refuse.
export function keptFacts<Upstream, StartTest>(
  id: string,
  repoUrl: string,
  failure: { name: string; message: string },
  earlier: { plugins: unknown[]; generatedAt: unknown },
  now: Date,
  isRecord: (value: unknown) => boolean,
): KeptFacts<Upstream, StartTest> | undefined {
  const named = earlier.plugins.filter((record) => (record as { id?: unknown } | null)?.id === id);
  if (named.length !== 1) return undefined;
  const record = named[0] as { repoUrl?: unknown; upstream?: Upstream; startTests?: StartTest[]; kept?: { readAt?: unknown } };
  if (record.repoUrl !== repoUrl || record.upstream === undefined || !isRecord(record)) return undefined;
  const readAt = record.kept ? record.kept.readAt : earlier.generatedAt;
  if (typeof readAt !== "string") return undefined;
  const age = now.getTime() - Date.parse(readAt);
  if (!(age >= 0 && age <= KEEP_MS)) return undefined;
  return {
    upstream: record.upstream,
    ...(record.startTests ? { startTests: record.startTests } : {}),
    kept: { readAt, failure },
  };
}
