import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import process from "node:process";
import { promisify } from "node:util";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import type { PluginRecord, PluginsFile } from "../src/build/build.ts";
import type { Site } from "../src/check/sites.ts";
import { codeSpan } from "../src/malware-scan/scan-issues.ts";
import { bodyOf, type Match, markerOf, matchesOf, reportMatches, SITE_ISSUES_MAX, titleOf } from "../src/site-issues/site-issues.ts";
import { fixtureFetch, type Recorded } from "./support/fixture-fetch.ts";

const REPO = "example/zotdex";
const API = `https://api.github.com/repos/${REPO}`;
const LIST = `${API}/issues?labels=listed-site&state=all&per_page=100`;
const LABEL = `${API}/labels/listed-site`;

function sha(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

const RULINGS: Site["rulings"] = [];
const SCIHUB: Site = { site: "Sci-Hub", names: ["Sci-Hub"], rulings: RULINGS };
const LIBGEN: Site = { site: "Library Genesis", names: ["Library Genesis", "LibGen"], rulings: RULINGS };
const SITES = [SCIHUB, LIBGEN];

interface Texts {
  name?: string;
  description?: string;
  repoDescription?: string;
}

// `repoName` is the entry's own repo name, and `githubName` the name that GitHub gave the build.
function record(id: string, texts: Texts = {}, repoName = id, githubName = repoName): PluginRecord {
  return {
    id,
    repoUrl: `https://github.com/example/${repoName}`,
    upstream: {
      id: `${id}@example.org`,
      version: "1.0.0",
      updateUrl: `https://example.org/${id}/update.json`,
      updateHost: "example.org",
      repoUrl: `https://github.com/example/${githubName}`,
      repoCreatedAt: "2026-01-01T00:00:00Z",
      openIssues: 0,
      releaseCount: 1,
      latestReleaseDate: "2026-10-01T00:00:00Z",
      ...texts,
    },
    reports: [],
    overrides: [],
  };
}

function data(records: PluginRecord[]): PluginsFile {
  return { schemaVersion: 1, generatedAt: "2026-11-10T06:17:00.000Z", plugins: records };
}

// A match of a plugin named for Sci-Hub.
function match(id: string): Match {
  return matchesOf(data([record(id, { name: `${id} Sci-Hub` })]), SITES)[0];
}

// An issue-create answer, with the label GitHub kept.
const created = (number: number) => ({ number, labels: [{ name: "listed-site" }] });

describe("matchesOf", () => {
  const pairs = (records: PluginRecord[]) => matchesOf(data(records), SITES).map((item) => [item.record.id, item.site.site, item.fields.map(({ field }) => field)]);

  test("finds no match in texts that name no site, or a site only as part of a run", () => {
    expect(pairs([record("a", { name: "Reader", description: "Reads scihubble", repoDescription: "Opens DOIs" })])).toEqual([]);
  });

  test.each<[string, Texts, string]>([
    ["name", { name: "Sci-Hub Fetcher" }, "a"],
    ["description", { description: "Gets PDFs from sci hub" }, "a"],
    ["repoDescription", { repoDescription: "A SciHub button" }, "a"],
    ["repoName", {}, "zotero-scihub"],
  ])("finds a match in the %s field", (field, texts, repoName) => {
    expect(pairs([record("a", texts, repoName)])).toEqual([["a", "Sci-Hub", [field]]]);
  });

  test("reads the repository name that GitHub gives, in its letter case, after a rename", () => {
    expect(pairs([record("a", {}, "pdf-helper", "zotero-scihub"), record("b", {}, "zotero-scihub", "pdf-helper")])).toEqual([["a", "Sci-Hub", ["repoName"]]]);
    expect(pairs([record("a", {}, "scihubfetcher", "ScihubFetcher"), record("b", {}, "ScihubFetcher", "Scihubfetcher")])).toEqual([["a", "Sci-Hub", ["repoName"]]]);
  });

  test("gives one match for each site a record names, with every text that names it", () => {
    expect(pairs([record("a", { name: "Sci-Hub", description: "LibGen and Sci-Hub" })])).toEqual([
      ["a", "Sci-Hub", ["name", "description"]],
      ["a", "Library Genesis", ["description"]],
    ]);
  });

  test("reads the repository name of a record with no upstream from the entry's URL, past any further path", () => {
    const { upstream: _upstream, ...bare } = record("a", {}, "libgen-links/tree/main");
    expect(pairs([bare])).toEqual([["a", "Library Genesis", ["repoName"]]]);
  });
});

describe("the issue text", () => {
  test("names the plugin and site in the title, and the texts and marker in the body", () => {
    const item = matchesOf(data([record("a", { name: "Sci-Hub Fetcher" }, "zotero-scihub")]), SITES)[0];
    expect(titleOf(item)).toBe("a names Sci-Hub, a listed site");
    const lines = bodyOf(item).split("\n");
    expect(lines).toContain("- Plugin: ` a ` <https://zotdex.jmgirard.com/plugins/a/>");
    expect(lines).toContain("- Site: ` Sci-Hub `");
    expect(lines).toContain("- Manifest name: ` Sci-Hub Fetcher `");
    expect(lines).toContain("- Repository name: ` zotero-scihub `");
    expect(lines.at(-1)).toBe(`<!-- listed-site ${sha("a")} ${sha("Sci-Hub")} -->`);
  });

  test("keeps the body's lines fixed when a matched text holds line breaks, -->, and @name", () => {
    const hostile = "Sci-Hub\n\n# y --> @name ``";
    const lines = bodyOf(matchesOf(data([record("a", { name: hostile })]), SITES)[0]).split("\n");
    expect(lines).toHaveLength(bodyOf(match("a")).split("\n").length);
    expect(lines).toContain(`- Manifest name: ${codeSpan(hostile)}`);
    expect(lines.filter((line) => line.includes("<!--"))).toEqual([`<!-- listed-site ${sha("a")} ${sha("Sci-Hub")} -->`]);
    expect(lines.filter((line) => line.startsWith("#"))).toEqual([]);
  });
});

describe("reportMatches", () => {
  async function run(matches: Match[], responses: Record<string, Recorded>, assignee?: string) {
    const { fetch, requests } = fixtureFetch(responses);
    const outcome = await reportMatches({ matches, fetch, repo: REPO, assignee });
    const posts = requests.filter((request) => request.method === "POST");
    return { outcome, requests, posts, payloads: posts.map((request) => JSON.parse(request.body!)) };
  }

  test("sends no request with no match", async () => {
    const { requests, outcome } = await run([], {});
    expect(requests).toEqual([]);
    expect(outcome.lines).toEqual([]);
  });

  test("opens an issue for a new match, with the label, the assignee, the title, and the body", async () => {
    const item = match("a");
    const { posts, payloads, outcome } = await run([item], { [LIST]: { json: [] }, [LABEL]: { json: {} }, [`POST ${API}/issues`]: { json: created(7) } }, "owner");
    expect(posts.map((request) => request.url)).toEqual([`${API}/issues`]);
    expect(payloads[0]).toEqual({ title: titleOf(item), body: bodyOf(item), labels: ["listed-site"], assignees: ["owner"] });
    expect(outcome.lines).toEqual(["opened issue #7 for a (Sci-Hub)"]);
  });

  test.each<[string, (marker: string) => Recorded, number]>([
    ["an open issue holds its marker", (marker) => ({ json: [{ state: "open", body: `Found.\n${marker}` }] }), 0],
    ["a closed issue holds its marker", (marker) => ({ json: [{ state: "closed", body: marker }] }), 0],
    ["an issue holds the marker of another site", () => ({ json: [{ body: markerOf({ ...match("a"), site: LIBGEN }) }] }), 1],
  ])("opens the number of issues it should when %s", async (_name, list, count) => {
    const item = match("a");
    const { posts } = await run([item], { [LIST]: list(markerOf(item)), [LABEL]: { json: {} }, [`POST ${API}/issues`]: { json: created(1) } });
    expect(posts).toHaveLength(count);
  });

  test.each<[string, number, string[]]>([
    ["exactly 5 new matches", 5, []],
    ["6 new matches", 6, ["p5 (Sci-Hub)"]],
  ])("opens at most 5 issues for %s and names each match left", async (_name, count, left) => {
    const matches = Array.from({ length: count }, (_, i) => match(`p${i}`));
    const { posts, outcome } = await run(matches, { [LIST]: { json: [] }, [LABEL]: { json: {} }, [`POST ${API}/issues`]: { json: created(1) } });
    expect(posts).toHaveLength(Math.min(SITE_ISSUES_MAX, count));
    expect(outcome.opened).toEqual(["p0", "p1", "p2", "p3", "p4"]);
    const warnings = outcome.lines.filter((line) => line.startsWith("::warning::"));
    expect(warnings).toEqual(left.length ? [`::warning::left 1 listed-site matches for a later run, past the limit of 5: ${left.join(", ")}`] : []);
  });

  test("creates no label when its read finds it", async () => {
    const { posts } = await run([match("a")], { [LIST]: { json: [] }, [LABEL]: { json: { name: "listed-site" } }, [`POST ${API}/issues`]: { json: created(1) } });
    expect(posts.map((request) => request.url)).toEqual([`${API}/issues`]);
  });

  test("creates the label when its read answers 404, then opens the issue", async () => {
    const { posts, payloads } = await run([match("a")], { [LIST]: { json: [] }, [LABEL]: { status: 404, json: { message: "Not Found" } }, [`POST ${API}/labels`]: { json: {} }, [`POST ${API}/issues`]: { json: created(1) } });
    expect(posts.map((request) => request.url)).toEqual([`${API}/labels`, `${API}/issues`]);
    expect(payloads[0].name).toBe("listed-site");
  });

  test.each<[string, Record<string, Recorded>, string[], RegExp]>([
    ["the issue list fails", { [LIST]: { status: 500 } }, [], /^::warning::opened no listed-site issue: cannot list the listed-site issues: .*HTTP 500/],
    ["the label read answers 500", { [LIST]: { json: [] }, [LABEL]: { status: 500 } }, [], /^::warning::opened no listed-site issue: cannot read the listed-site label: .*HTTP 500/],
    ["the label create fails", { [LIST]: { json: [] }, [LABEL]: { status: 404 }, [`POST ${API}/labels`]: { status: 500, json: {} } }, [`${API}/labels`], /^::warning::opened no listed-site issue: cannot create the listed-site label: .*HTTP 500/],
  ])("opens no issue and warns once when %s", async (_name, responses, posted, message) => {
    const { posts, outcome } = await run([match("a"), match("b")], responses);
    expect(posts.map((request) => request.url)).toEqual(posted);
    expect(outcome.lines).toEqual([expect.stringMatching(message)]);
  });

  // A 422, which the malware scan's issues skip, stops this run too.
  test("stops at a create that answers 422 and opens no other issue", async () => {
    const { posts, outcome } = await run([match("a"), match("b")], { [LIST]: { json: [] }, [LABEL]: { json: {} }, [`POST ${API}/issues`]: { status: 422, json: {} } });
    expect(posts).toHaveLength(1);
    expect(outcome.opened).toEqual([]);
    expect(outcome.lines).toEqual([expect.stringMatching(/^::warning::stopped opening listed-site issues at a \(Sci-Hub\): .*HTTP 422/)]);
  });

  test("stops when GitHub drops the label from a created issue", async () => {
    const { posts, outcome } = await run([match("a"), match("b")], { [LIST]: { json: [] }, [LABEL]: { json: {} }, [`POST ${API}/issues`]: { json: { number: 4, labels: [] } } });
    expect(posts).toHaveLength(1);
    expect(outcome.lines).toEqual(["opened issue #4 for a (Sci-Hub)", "::warning::stopped opening listed-site issues: issue #4 for a (Sci-Hub) lacks the listed-site label"]);
  });
});

describe("pnpm site-issues", () => {
  const CLI = resolve(import.meta.dirname, "..", "src/site-issues/cli.ts");
  const SITES_FILE = resolve(import.meta.dirname, "..", "sites.json");
  let dir = "";
  let path = "";
  beforeAll(() => {
    dir = mkdtempSync(join(tmpdir(), "zpi-site-issues-"));
    path = join(dir, "plugins.json");
    writeFileSync(path, JSON.stringify(data([record("a", { name: "Reader" })])));
    writeFileSync(join(dir, "bad-sites.json"), JSON.stringify([{ site: "Sci-Hub" }]));
    writeFileSync(join(dir, "no-list.json"), JSON.stringify({ schemaVersion: 1 }));
  });
  afterAll(() => rmSync(dir, { recursive: true, force: true }));
  // GITHUB_TOKEN is left out, so no run here can reach GitHub with a token.
  const env = (repo?: string) => ({ PATH: process.env.PATH, ...(repo !== undefined && { GITHUB_REPOSITORY: repo }) });

  test("sends nothing and exits 0 with no match", async () => {
    const { stdout } = await promisify(execFile)(process.execPath, [CLI, "--data", path, "--sites", SITES_FILE], { env: env("example/zotdex") });
    expect(stdout).toBe("0 listed-site matches, 0 issues opened\n");
  });

  test.each<[string, () => string[], string | undefined, RegExp]>([
    ["GITHUB_REPOSITORY is unset", () => ["--data", path, "--sites", SITES_FILE], undefined, /^GITHUB_REPOSITORY is not set\n/],
    ["--sites is missing", () => ["--data", path], "example/zotdex", /^usage: pnpm site-issues /],
    ["the data cannot be read", () => ["--data", join(dir, "none.json"), "--sites", SITES_FILE], "example/zotdex", /^cannot read the data: /],
    ["the data has no plugins list", () => ["--data", join(dir, "no-list.json"), "--sites", SITES_FILE], "example/zotdex", /no-list\.json has no plugins list\n$/],
    ["the sites file breaks its schema", () => ["--data", path, "--sites", join(dir, "bad-sites.json")], "example/zotdex", /^the sites file does not match schemas\/sites.schema.json: /],
  ])("exits with status 1 when %s", async (_name, argv, repo, message) => {
    const error = await promisify(execFile)(process.execPath, [CLI, ...argv()], { env: env(repo) }).catch((reason: unknown) => reason);
    expect((error as { code?: number }).code).toBe(1);
    expect((error as { stderr?: string }).stderr).toMatch(message);
  });
});
