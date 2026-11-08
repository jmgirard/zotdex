import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import process from "node:process";
import { promisify } from "node:util";
import { afterAll, describe, expect, test } from "vitest";
import type { MalwareScan, PluginRecord, PluginsFile } from "../src/build/build.ts";
import { bodyOf, codeSpan, type Find, findsOf, markerOf, reportFinds, SCAN_ISSUES_MAX, titleOf } from "../src/malware-scan/scan-issues.ts";
import { fixtureFetch, type Recorded } from "./support/fixture-fetch.ts";

const REPO = "example/zotdex";
const API = `https://api.github.com/repos/${REPO}`;
const LIST = `${API}/issues?labels=malware-scan&state=all&per_page=100`;
const LABEL = `${API}/labels/malware-scan`;
const CLAMAV = "ClamAV 1.5.4/28176/Sat Nov  7 06:24:18 2026";
const SIG = "Win.Test.EICAR_HDB-1";

function sha(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

function scanOf(id: string, found?: string, file = id): MalwareScan {
  return { xpiSha256: sha(file), scannedAt: "2026-11-09", clamav: CLAMAV, ...(found && { found }) };
}

function record(id: string, malwareScan?: MalwareScan, version = "1.0.0"): PluginRecord {
  return {
    id,
    repoUrl: `https://github.com/example/${id}`,
    upstream: {
      id: `${id}@example.org`,
      version,
      updateUrl: `https://example.org/${id}/update.json`,
      updateHost: "example.org",
      repoUrl: `https://github.com/example/${id}`,
      repoCreatedAt: "2026-01-01T00:00:00Z",
      openIssues: 0,
      releaseCount: 1,
      latestReleaseDate: "2026-10-01T00:00:00Z",
      xpiUrl: `https://github.com/example/${id}/releases/download/v1/p.xpi`,
      xpiSha256: sha(id),
    },
    reports: [],
    ...(malwareScan && { malwareScan }),
    overrides: [],
  };
}

function data(records: PluginRecord[]): PluginsFile {
  return { schemaVersion: 1, generatedAt: "2026-11-09T06:17:00.000Z", plugins: records };
}

function find(id: string, signature = SIG, version = "1.0.0"): Find {
  return record(id, scanOf(id, signature), version) as Find;
}

const resultsFile = (results: unknown[]) => `${JSON.stringify({ results })}\n`;

// An issue-create answer, with the label GitHub kept.
const created = (number: number) => ({ number, labels: [{ name: "malware-scan" }] });

describe("findsOf", () => {
  const carried = data([record("a", scanOf("a", SIG)), record("b", scanOf("b"))]);
  const ids = (out: { finds: Find[] }) => out.finds.map((item) => item.id);

  test.each<[string, string | undefined, string]>([
    ["is missing", undefined, "0".repeat(64)],
    ["has a bad --expect", resultsFile([]), "not-a-hash"],
    ["has another SHA-256", resultsFile([]), "0".repeat(64)],
    ["is malformed", "{", sha("{")],
  ])("keeps the carried finds when the results file %s", (_name, text, expected) => {
    const out = findsOf(carried, text, expected);
    expect(ids(out)).toEqual(["a"]);
    expect(out.problem).toEqual(expect.any(String));
  });

  test("takes a new find, and a clean new result clears a carried find", () => {
    const text = resultsFile([
      { id: "a", ...scanOf("a") },
      { id: "b", ...scanOf("b", SIG) },
    ]);
    expect(ids(findsOf(carried, text, sha(text)))).toEqual(["b"]);
  });

  test.each<[string, unknown[]]>([
    ["two results for one id", [{ id: "b", ...scanOf("b", SIG) }, { id: "b", ...scanOf("b", "Other.Sig") }]],
    ["a result for no record", [{ id: "z", ...scanOf("z", SIG) }]],
    ["a result for another file", [{ id: "b", ...scanOf("b", SIG, "else") }]],
  ])("adds no find from %s", (_name, results) => {
    const text = resultsFile(results);
    expect(ids(findsOf(carried, text, sha(text)))).toEqual(["a"]);
  });
});

describe("the issue text", () => {
  test("names the find in the title and holds each value and the marker in the body", () => {
    const item = find("a");
    expect(titleOf(item)).toBe("Malware scan flagged a");
    const lines = bodyOf(item).split("\n");
    expect(lines).toContain("- Plugin: ` a ` <https://zotdex.jmgirard.com/plugins/a/>");
    expect(lines).toContain(`- Signature: \` ${SIG} \``);
    expect(lines.at(-1)).toBe(`<!-- malware-scan ${sha("a")} ${sha("a")} ${sha(SIG)} -->`);
  });

  // Each value ends up on one line, inside a fence longer than any backtick run it holds.
  test.each(["a\r\nb", "a\rb", "a\n\n# x", "`lead", "trail`", "a ``` b", "x --> y", "@name"])("keeps %j inside one code span", (value) => {
    const span = codeSpan(value);
    expect(span).not.toMatch(/[\r\n]/);
    const fence = /^`+/.exec(span)![0];
    expect(span.endsWith(` ${fence}`)).toBe(true);
    const inner = span.slice(fence.length + 1, -fence.length - 1);
    expect(Math.max(0, ...Array.from(inner.matchAll(/`+/g), ([run]) => run.length))).toBeLessThan(fence.length);
  });

  test("keeps the body's lines fixed when the version and signature hold line breaks, -->, and @name", () => {
    const hostile = "x\n\n# y --> @name ``";
    const lines = bodyOf(find("a", hostile, hostile)).split("\n");
    expect(lines).toHaveLength(bodyOf(find("a")).split("\n").length);
    expect(lines.at(-1)).toBe(`<!-- malware-scan ${sha("a")} ${sha("a")} ${sha(hostile)} -->`);
    expect(lines.filter((line) => line.includes("<!--"))).toHaveLength(1);
  });

  // Each value the body shows, set on a find.
  const VALUES: [string, (item: Find, value: string) => void][] = [
    ["id", (item, value) => (item.id = value)],
    ["version", (item, value) => (item.upstream!.version = value)],
    ["signature", (item, value) => (item.malwareScan.found = value)],
    ["scan date", (item, value) => (item.malwareScan.scannedAt = value)],
    ["clamav line", (item, value) => (item.malwareScan.clamav = value)],
    ["file SHA-256", (item, value) => (item.malwareScan.xpiSha256 = value)],
  ];
  const HOSTILE = ["a\r\nb", "a\rb", "a\n\n# x", "`lead", "trail`", "x --> y", "@name"];

  test.each(VALUES.flatMap(([name, set]) => HOSTILE.map((value) => [name, value, set] as const)))(
    "keeps the body's lines fixed when the %s holds %j",
    (_name, value, set) => {
      const item = find("a");
      set(item, value);
      const body = bodyOf(item);
      // The text before the marker line, which the marker's own values do not reach.
      const text = body.slice(0, body.lastIndexOf("\n<!-- malware-scan "));
      const lines = text.split("\n");
      expect(lines).toHaveLength(bodyOf(find("a")).split("\n").length - 1);
      expect(lines.filter((line) => line.includes("<!--") || line.startsWith("#"))).toEqual([]);
      const valueLines = lines.filter((line) => line.startsWith("- "));
      expect(valueLines).toHaveLength(6);
      for (const line of valueLines) {
        const span = line.slice(line.indexOf(": ") + 2).replace(/ <[^>]*>$/, "");
        const fence = /^`+/.exec(span)![0];
        expect(span.endsWith(` ${fence}`)).toBe(true);
        expect(Math.max(0, ...Array.from(span.slice(fence.length, -fence.length).matchAll(/`+/g), ([run]) => run.length))).toBeLessThan(fence.length);
      }
    },
  );

  test("names an empty version as unknown", () => {
    expect(bodyOf(find("a", SIG, ""))).toContain("- Version: ` unknown `");
  });

  test("cuts a value to 200 characters", () => {
    expect(codeSpan("v".repeat(300))).toBe(`\` ${"v".repeat(200)} \``);
  });
});

describe("reportFinds", () => {
  const issueBody = (...lines: (string | null)[]) => ({ body: lines.every((line) => line === null) ? null : lines.join("\n") });

  async function run(finds: Find[], responses: Record<string, Recorded>, assignee?: string) {
    const { fetch, requests } = fixtureFetch(responses);
    const outcome = await reportFinds({ finds, fetch, repo: REPO, assignee });
    const posts = requests.filter((request) => request.method === "POST");
    return { outcome, requests, posts, payloads: posts.map((request) => JSON.parse(request.body!)) };
  }

  test("sends no request with no find", async () => {
    const { requests, outcome } = await run([], {});
    expect(requests).toEqual([]);
    expect(outcome.lines).toEqual([]);
  });

  test("opens an issue for a new find, with the label, the assignee, the title, and the body", async () => {
    const item = find("a");
    const { posts, payloads, outcome } = await run([item], { [LIST]: { json: [] }, [LABEL]: { json: {} }, [`POST ${API}/issues`]: { json: created(7) } }, "owner");
    expect(posts.map((request) => request.url)).toEqual([`${API}/issues`]);
    expect(payloads[0]).toEqual({ title: titleOf(item), body: bodyOf(item), labels: ["malware-scan"], assignees: ["owner"] });
    expect(outcome.lines).toEqual(["opened issue #7 for a"]);
  });

  test.each<[string, (marker: string) => Recorded, number]>([
    ["an open issue holds its marker", (marker) => ({ json: [{ state: "open", ...issueBody("Found.", marker) }] }), 0],
    ["a closed issue holds its marker", (marker) => ({ json: [{ state: "closed", ...issueBody(marker) }] }), 0],
    ["its marker sits as a whole line mid-body", (marker) => ({ json: [issueBody("a", marker, "b")] }), 0],
    ["its marker sits between bare \\r line breaks", (marker) => ({ json: [{ body: `a\r${marker}\rb` }] }), 0],
    ["its marker sits inside a value's code span", (marker) => ({ json: [issueBody(`- Version: \` ${marker} \``)] }), 1],
    ["an issue's body is null", () => ({ json: [issueBody(null)] }), 1],
    ["the marker names the same id with another file", () => ({ json: [issueBody(markerOf(record("a", scanOf("a", SIG, "else")) as Find))] }), 1],
    ["the marker names the same id with another signature", () => ({ json: [issueBody(markerOf(find("a", "Other.Sig")))] }), 1],
  ])("opens the number of issues it should when %s", async (_name, list, count) => {
    const item = find("a");
    const { posts } = await run([item], { [LIST]: list(markerOf(item)), [LABEL]: { json: {} }, [`POST ${API}/issues`]: { json: created(1) } });
    expect(posts).toHaveLength(count);
  });

  test.each<[string, number, number, string[]]>([
    ["exactly 5 new finds", 5, 0, []],
    ["6 new finds", 6, 0, ["p5"]],
    ["6 finds with 1 reported", 6, 1, []],
  ])("opens at most 5 issues for %s and names each find left", async (_name, count, reported, left) => {
    const finds = Array.from({ length: count }, (_, i) => find(`p${i}`));
    const listed = finds.slice(0, reported).map((item) => issueBody(markerOf(item)));
    const { posts, outcome } = await run(finds, { [LIST]: { json: listed }, [LABEL]: { json: {} }, [`POST ${API}/issues`]: { json: created(1) } });
    expect(posts).toHaveLength(Math.min(SCAN_ISSUES_MAX, count - reported));
    const warnings = outcome.lines.filter((line) => line.startsWith("::warning::"));
    expect(warnings).toEqual(left.length ? [expect.stringMatching(new RegExp(`past the limit of 5: ${left.join(", ")}$`))] : []);
  });

  test("creates the label when its read answers 404, then opens the issue", async () => {
    const { posts } = await run([find("a")], { [LIST]: { json: [] }, [LABEL]: { status: 404, json: { message: "Not Found" } }, [`POST ${API}/labels`]: { json: {} }, [`POST ${API}/issues`]: { json: created(1) } });
    expect(posts.map((request) => request.url)).toEqual([`${API}/labels`, `${API}/issues`]);
  });

  test.each<[string, Record<string, Recorded>, string[], RegExp]>([
    ["the issue list fails", { [LIST]: { status: 500 } }, [], /cannot list the malware-scan issues/],
    ["the label read answers 500", { [LIST]: { json: [] }, [LABEL]: { status: 500 } }, [], /cannot read the malware-scan label/],
    ["the label create fails", { [LIST]: { json: [] }, [LABEL]: { status: 404 }, [`POST ${API}/labels`]: { status: 500, json: {} } }, [`${API}/labels`], /cannot create the malware-scan label/],
  ])("opens no issue and warns once when %s", async (_name, responses, posted, message) => {
    const { posts, outcome } = await run([find("a")], responses);
    expect(posts.map((request) => request.url)).toEqual(posted);
    expect(outcome.lines).toEqual([expect.stringMatching(message)]);
    expect(outcome.lines[0]).toMatch(/^::warning::/);
  });

  test("skips a find whose create answers 422 and opens the next", async () => {
    const { posts, outcome } = await run([find("a"), find("b")], {
      [LIST]: { json: [] },
      [LABEL]: { json: {} },
      [`POST ${API}/issues #1`]: { status: 422, json: { message: "Validation Failed" } },
      [`POST ${API}/issues #2`]: { json: created(9) },
    });
    expect(posts).toHaveLength(2);
    expect(outcome.opened).toEqual(["b"]);
    expect(outcome.lines).toEqual([expect.stringMatching(/^::warning::opened no issue for a: .*HTTP 422/), "opened issue #9 for b"]);
  });

  test("stops when GitHub drops the label from a created issue", async () => {
    const { posts, outcome } = await run([find("a"), find("b")], { [LIST]: { json: [] }, [LABEL]: { json: {} }, [`POST ${API}/issues`]: { json: { number: 4, labels: [] } } });
    expect(posts).toHaveLength(1);
    expect(outcome.lines).toEqual(["opened issue #4 for a", expect.stringMatching(/^::warning::stopped opening malware scan issues: issue #4 for a lacks the malware-scan label$/)]);
  });

  test("finds a marker on the second page of the issue list", async () => {
    const item = find("a");
    const second = `${API}/issues?labels=malware-scan&state=all&per_page=100&page=2`;
    const { posts } = await run([item], {
      [LIST]: { json: [issueBody("other")], headers: { link: `<${second}>; rel="next"` } },
      [second]: { json: [issueBody(markerOf(item))] },
      [LABEL]: { json: {} },
      [`POST ${API}/issues`]: { json: created(1) },
    });
    expect(posts).toEqual([]);
  });

  test("stops at a create that answers 500", async () => {
    const { posts, outcome } = await run([find("a"), find("b")], { [LIST]: { json: [] }, [LABEL]: { json: {} }, [`POST ${API}/issues`]: { status: 500, json: {} } });
    expect(posts).toHaveLength(1);
    expect(outcome.opened).toEqual([]);
    expect(outcome.lines).toEqual([expect.stringMatching(/^::warning::stopped opening malware scan issues at a: .*HTTP 500/)]);
  });
});

describe("pnpm scan-issues", () => {
  const CLI = resolve(import.meta.dirname, "..", "src/malware-scan/scan-issues-cli.ts");
  const dir = mkdtempSync(join(tmpdir(), "zpi-scan-issues-"));
  afterAll(() => rmSync(dir, { recursive: true, force: true }));
  const path = join(dir, "plugins.json");
  writeFileSync(path, JSON.stringify(data([record("a", scanOf("a"))])));
  const args = (dataPath: string) => [CLI, "--data", dataPath, "--results", join(dir, "missing.json"), "--expect", "0".repeat(64)];
  // GITHUB_TOKEN is left out, so no run here can reach GitHub with a token.
  const env = (repo?: string) => ({ PATH: process.env.PATH, ...(repo !== undefined && { GITHUB_REPOSITORY: repo }) });
  const exitOf = (error: unknown) => (error as { code?: number }).code;

  test("warns once for a missing results file and sends nothing with no find", async () => {
    const { stdout } = await promisify(execFile)(process.execPath, args(path), { env: env("example/zotdex") });
    expect(stdout.split("\n").filter((line) => line.startsWith("::warning::"))).toEqual([expect.stringMatching(/^::warning::added no new scan results, so only the published finds count: /)]);
    expect(stdout).toContain("0 malware scan finds, 0 issues opened");
  });

  test.each<[string, string, string | undefined]>([
    ["GITHUB_REPOSITORY is unset", path, undefined],
    ["GITHUB_REPOSITORY is empty", path, ""],
    ["the data cannot be read", join(dir, "none.json"), "example/zotdex"],
  ])("exits with status 1 when %s", async (_name, dataPath, repo) => {
    const error = await promisify(execFile)(process.execPath, args(dataPath), { env: env(repo) }).catch((reason: unknown) => reason);
    expect(exitOf(error)).toBe(1);
  });
});
