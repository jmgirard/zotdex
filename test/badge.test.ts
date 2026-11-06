import { describe, expect, test } from "vitest";
import type { PluginRecord, StartTestRecord } from "../src/build/build.ts";
import { badgeFor } from "../src/site/badge.ts";

const UPSTREAM = { version: "1.0.0" } as unknown as NonNullable<PluginRecord["upstream"]>;

function record(extra: Partial<PluginRecord>): PluginRecord {
  return { id: "x@example.org", repoUrl: "https://github.com/example/x", overrides: [], ...extra };
}

const tests = (...pairs: [string, StartTestRecord["result"]][]) => pairs.map(([zotero, result]) => ({ zotero, result }));

describe("badgeFor", () => {
  test("names each major whose newest result started, in number order, in Zotdex blue", () => {
    const badge = badgeFor(record({ upstream: UPSTREAM, startTests: tests(["10.0.6", "started"], ["7.0.32", "started"], ["8.0.4", "start-error"]) }));
    expect(badge).toEqual({ schemaVersion: 1, label: "Zotdex", message: "started in Zotero 7 · 10", color: "#1d5fb8", cacheSeconds: 3600 });
  });

  test("takes a major's newest result, so an older start does not count", () => {
    const badge = badgeFor(record({ upstream: UPSTREAM, startTests: tests(["8.0.3", "started"], ["8.0.4", "timed-out"], ["9.0.6", "started"]) }));
    expect(badge.message).toBe("started in Zotero 9");
  });

  test("names a major outside the home table's columns", () => {
    expect(badgeFor(record({ upstream: UPSTREAM, startTests: tests(["12.0.1", "started"]) })).message).toBe("started in Zotero 12");
  });

  test("says no start in tests, in grey, when no major's newest result started", () => {
    const badge = badgeFor(record({ upstream: UPSTREAM, startTests: tests(["7.0.32", "not-installed"], ["8.0.4", "start-error"]) }));
    expect([badge.message, badge.color]).toEqual(["no start in tests", "lightgrey"]);
  });

  test("says not start-tested, in grey, for a read plugin with no start results", () => {
    const badge = badgeFor(record({ upstream: UPSTREAM }));
    expect([badge.message, badge.color]).toEqual(["not start-tested", "lightgrey"]);
  });

  test("says no data, in grey, for a plugin the build could not read", () => {
    const badge = badgeFor(record({ failure: { name: "not-read", message: "not read" } }));
    expect([badge.message, badge.color]).toEqual(["no data", "lightgrey"]);
  });

  test("reads a record that keeps earlier facts like any other", () => {
    const kept = { readAt: "2026-11-04T06:17:00Z", failure: { name: "timeout", message: "timed out" } };
    expect(badgeFor(record({ upstream: UPSTREAM, startTests: tests(["8.0.4", "started"]), kept })).message).toBe("started in Zotero 8");
  });
});
