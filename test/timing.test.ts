import { describe, expect, test } from "vitest";
import { SLOW_READS, timingLines } from "../src/build/timing.ts";

describe("timingLines", () => {
  test("gives the read phase, each result in code-unit order, and the slowest reads, slowest first and ties in id order", () => {
    const timings = [
      { id: "b@example.org", ms: 1500, result: "read" },
      { id: "a@example.org", ms: 1500, result: "read" },
      { id: "c@example.org", ms: 61_049, result: "xpi-unreadable" },
      { id: "d@example.org", ms: 250, result: "Read" },
    ];
    expect(timingLines(timings, 62_345)).toEqual([
      "plugin reads took 62.3 s",
      "Read: 1 reads, 0.3 s in all",
      "read: 2 reads, 3.0 s in all",
      "xpi-unreadable: 1 reads, 61.0 s in all",
      "slow read: c@example.org: 61.0 s (xpi-unreadable)",
      "slow read: a@example.org: 1.5 s (read)",
      "slow read: b@example.org: 1.5 s (read)",
      "slow read: d@example.org: 0.3 s (Read)",
    ]);
  });

  test(`names at most ${SLOW_READS} slow reads, and still counts every read by result`, () => {
    const timings = Array.from({ length: 11 }, (_, i) => ({ id: `p${String(i).padStart(2, "0")}@example.org`, ms: (i + 1) * 1000, result: "read" }));
    const lines = timingLines(timings, 11_000);
    expect(lines.filter((line) => line.startsWith("slow read: "))).toHaveLength(SLOW_READS);
    expect(lines).toContain("read: 11 reads, 66.0 s in all");
    expect(lines).not.toContain("slow read: p00@example.org: 1.0 s (read)");
  });

  test("writes a line break in an id as a space, so the id cannot start a workflow command", () => {
    const lines = timingLines([{ id: "x@example.org\n::stop-commands::planted", ms: 100, result: "read" }], 100);
    expect(lines).toContain("slow read: x@example.org ::stop-commands::planted: 0.1 s (read)");
    expect(lines.some((line) => line.startsWith("::"))).toBe(false);
  });

  test("gives no lines when no read started", () => {
    expect(timingLines([], undefined)).toEqual([]);
  });
});
