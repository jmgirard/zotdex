// One plugin read that the build started: the entry id, the milliseconds from the read's start
// to the end of `readRecord`, and the failure name that `readRecord` returned, or `read`.
export interface ReadTiming {
  id: string;
  ms: number;
  result: string;
}

// The most slow reads that the build log names.
export const SLOW_READS = 10;

const seconds = (ms: number) => (ms / 1000).toFixed(1);

// The build log's timing lines: the time from the first read's start to the last read's end,
// one line for each result in code-unit order with its count and summed time, then up to
// SLOW_READS of the slowest reads, slowest first and ties, by the shown tenth of a second, in
// id order. A line break in an id becomes a space, so no id starts a line that GitHub Actions
// reads as a workflow command. No read started gives no lines.
export function timingLines(timings: ReadTiming[], readsMs: number | undefined): string[] {
  if (timings.length === 0 || readsMs === undefined) return [];
  const oneLine = (text: string) => text.replace(/[\r\n]+/g, " ");
  const byResult = new Map<string, { count: number; ms: number }>();
  for (const { result, ms } of timings) {
    const sum = byResult.get(result) ?? { count: 0, ms: 0 };
    byResult.set(result, { count: sum.count + 1, ms: sum.ms + ms });
  }
  const results = [...byResult.keys()].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  // Reads that show the same tenth of a second count as ties.
  const tenths = (ms: number) => Math.round(ms / 100);
  const slowest = [...timings]
    .sort((a, b) => tenths(b.ms) - tenths(a.ms) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    .slice(0, SLOW_READS);
  return [
    `plugin reads took ${seconds(readsMs)} s`,
    ...results.map((result) => {
      const { count, ms } = byResult.get(result)!;
      return `${oneLine(result)}: ${count} reads, ${seconds(ms)} s in all`;
    }),
    ...slowest.map(({ id, ms, result }) => `slow read: ${oneLine(id)}: ${seconds(ms)} s (${oneLine(result)})`),
  ];
}
