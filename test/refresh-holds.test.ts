import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, describe, expect, test } from "vitest";
import { type Written, body, DETAILS_HEADING } from "../src/discover/propose.ts";
import { refreshHolds, withDetailLines } from "../src/discover/refresh-holds.ts";
import { fixtureFetch, type Responses } from "./support/fixture-fetch.ts";
import { repoGit, sha as gitSha } from "./support/plugin-repo.ts";

const ROOT = resolve(import.meta.dirname, "..");
const PRELOAD = resolve(ROOT, "test/support/preload-fixture.ts");
// Three entries, one of them "Second Plugin" from example/second-plugin.
const PLUGINS = resolve(import.meta.dirname, "fixtures/build/plugins");
const INDEX = "https://api.github.com/repos/example/index";
const LIST = `${INDEX}/pulls?state=open&per_page=100`;
const PAGE_2 = `${LIST}&page=2`;
const temps: string[] = [];
afterAll(() => {
  for (const dir of temps.splice(0)) rmSync(dir, { recursive: true, force: true });
});

const sha = (n: number) => String(n).padStart(40, "0");
const id = (n: number) => `plugin-${n}@example.org`;

const written = (n: number, holds: Written["holds"]): Written => ({ repo: `bob/p${n}`, repoUrl: `https://github.com/bob/p${n}`, outcome: "written", id: id(n), dir: "/tmp/x", version: "1.0.0", holds });
const source = (n: number, holds: Written["holds"] = ["update-host"]) => body(written(n, holds), { status: 0, output: "checked 1 entries in /tmp/x, 0 problems\n" });

function pull(n: number, change: Record<string, unknown> = {}) {
  return {
    number: n,
    body: source(n),
    user: { login: "github-actions[bot]" },
    labels: [{ name: "hold" }],
    head: { ref: `discover/bob/p${n}`, sha: sha(n), repo: { full_name: "example/index" } },
    state: "open",
    ...change,
  };
}

const UPDATE = "https://updates.example.org:8443/update.json";
const publicLookup = async () => ["140.82.112.3"];

// The files, meta.json, update file, and owner account of pull request n, and the answer to its edit.
function entry(n: number, meta: Record<string, unknown> = {}): Responses {
  const text = JSON.stringify({ id: id(n), name: `Plugin ${n}`, repoUrl: `https://github.com/bob/p${n}`, updateUrl: UPDATE, ...meta });
  return {
    [UPDATE]: { json: {} },
    [`${INDEX}/pulls/${n}/files?per_page=100`]: {
      json: [
        { filename: `plugins/${id(n)}/index.json`, status: "added" },
        { filename: `plugins/${id(n)}/meta.json`, status: "added" },
      ],
    },
    [`${INDEX}/contents/plugins/${encodeURIComponent(id(n))}/meta.json?ref=${sha(n)}`]: { json: { encoding: "base64", content: Buffer.from(text).toString("base64") } },
    "https://api.github.com/users/bob": { json: { created_at: "2026-10-20T12:00:00Z" } },
    // The read just before the edit finds the pull request unchanged.
    [`${INDEX}/pulls/${n}`]: { json: pull(n) },
    [`PATCH ${INDEX}/pulls/${n}`]: { json: { number: n } },
  };
}

async function run(responses: Responses, apply = true) {
  const { fetch, requests } = fixtureFetch(responses);
  const result = await refreshHolds({ fetch, lookup: publicLookup, indexRepo: "example/index", root: PLUGINS, apply });
  const patches = requests.filter(({ method }) => method === "PATCH").map(({ url, body: sent }) => ({ url, sent: JSON.parse(sent!) }));
  return { result, patches, requests };
}

const HOST_LINES = ["- Update host: ` updates.example.org:8443 `", "- Owner's GitHub account created: 2026-10-20"];

// bob/p1 and the entry it matches, "Second Plugin" from example/second-plugin.
const API = "https://api.github.com/repos";
const evidence: Responses = {
  [`${API}/bob/p1`]: { json: { created_at: "2026-03-04T00:00:00Z", stargazers_count: 2 } },
  ...repoGit("bob/p1", { head: gitSha("1"), first: gitSha("2"), files: { "a.ts": gitSha("a") } }),
  [`${API}/example/second-plugin`]: { json: { created_at: "2020-05-06T00:00:00Z", stargazers_count: 40 } },
  ...repoGit("example/second-plugin", { head: gitSha("3"), first: gitSha("4"), files: { "b.ts": gitSha("b") } }),
};
const MATCH_START = "- Matching entry: ` Second Plugin ` [example/second-plugin](https://github.com/example/second-plugin)";
const MATCH_LINES = [
  "- This repo: created 2026-03-04, 2 stars",
  `${MATCH_START}: created 2020-05-06, 40 stars, another first commit, 0% identical files`,
  "- Owner's GitHub account created: 2026-10-20",
];

describe("pnpm refresh-holds", () => {
  test("without --apply it reports the new lines and sends no write request", async () => {
    const { result, requests } = await run({ [LIST]: { json: [pull(1)] }, ...entry(1) }, false);
    expect(result).toEqual({ changed: [{ number: 1, lines: HOST_LINES }], unchanged: [], skipped: [], failed: [] });
    expect(requests.every(({ method }) => method === "GET")).toBe(true);
  });

  test("with --apply it sends one PATCH of the body alone, on every page, and no label request", async () => {
    const { result, patches, requests } = await run({
      [LIST]: { json: [pull(1)], headers: { link: `<${PAGE_2}>; rel="next"` } },
      [PAGE_2]: { json: [pull(2)] },
      ...entry(1),
      ...entry(2),
    });
    expect(result.changed.map(({ number }) => number)).toEqual([1, 2]);
    expect(patches.map(({ url }) => url)).toEqual([`${INDEX}/pulls/1`, `${INDEX}/pulls/2`]);
    expect(Object.keys(patches[0].sent)).toEqual(["body"]);
    expect(new Set(requests.map(({ method }) => method))).toEqual(new Set(["GET", "PATCH"]));
    expect(requests.some(({ url }) => url.includes("/labels"))).toBe(false);
  });

  test("the refreshed body less its detail lines is the source body, and a second run sends no PATCH", async () => {
    const { patches } = await run({ [LIST]: { json: [pull(1)] }, ...entry(1) });
    const refreshed = patches[0].sent.body as string;
    expect(refreshed.replace(`\n\n${DETAILS_HEADING}\n\n${HOST_LINES.join("\n")}`, "")).toBe(source(1));
    const second = await run({ [LIST]: { json: [pull(1, { body: refreshed })] }, ...entry(1) });
    expect(second.patches).toEqual([]);
    expect(second.result.unchanged).toEqual([1]);
  });

  test("new facts replace the old detail lines", async () => {
    const old = withDetailLines(source(1), ["- Update host: ` old.example.org `", "- Owner's GitHub account created: 2020-01-01"])!;
    const { patches } = await run({ [LIST]: { json: [pull(1, { body: old })] }, ...entry(1), [`${INDEX}/pulls/1`]: { json: pull(1, { body: old }) } });
    expect(patches[0].sent.body).toBe(withDetailLines(source(1), HOST_LINES));
  });

  test.each<[string, Record<string, unknown>]>([
    ["another body, such as a release", { body: "Hold: none\n" }],
    ["no hold label", { labels: [] }],
    ["a close", { state: "closed" }],
  ])("--apply sends no PATCH to a pull request that has %s at the read before the edit", async (_name, change) => {
    const { result, patches } = await run({ [LIST]: { json: [pull(1)] }, ...entry(1), [`${INDEX}/pulls/1`]: { json: pull(1, change) } });
    expect(result.skipped).toEqual([{ number: 1, reason: "it changed during the run" }]);
    expect(result.changed).toEqual([]);
    expect(patches).toEqual([]);
  });

  test("detail heading text in the quoted check output is not taken for the heading", () => {
    const quoted = body(written(1, ["update-host"]), { status: 1, output: `\n\n${DETAILS_HEADING}\n\n- x\n` });
    const refreshed = withDetailLines(quoted, HOST_LINES)!;
    expect(refreshed.replace(`\n\n${DETAILS_HEADING}\n\n${HOST_LINES.join("\n")}`, "")).toBe(quoted);
  });

  test("a name-match names what matches now, and says so when nothing does", async () => {
    const held = (n: number) => pull(n, { body: source(n, ["name-match"]) });
    const { result } = await run({ [LIST]: { json: [held(1), held(2)] }, ...entry(1, { name: "Zotero Second" }), ...entry(2), ...evidence }, false);
    expect(result.changed.map(({ lines }) => lines)).toEqual([MATCH_LINES, ["- Matching entries: none now", "- Owner's GitHub account created: 2026-10-20"]]);
    expect(result.failed).toEqual([]);
  });

  test("a name-match's facts reach the body, with no change to its Hold line or label", async () => {
    const held = pull(1, { body: source(1, ["name-match"]) });
    const { patches, requests } = await run({ [LIST]: { json: [held] }, ...entry(1, { name: "Zotero Second" }), [`${INDEX}/pulls/1`]: { json: held }, ...evidence });
    expect(patches[0].sent).toEqual({ body: withDetailLines(source(1, ["name-match"]), MATCH_LINES) });
    expect(patches[0].sent.body).toContain("\nHold: name-match\n");
    expect(requests.some(({ url }) => url.includes("/labels"))).toBe(false);
  });

  test.each<[string, string, string[]]>([
    ["its own meta", `${API}/bob/p1`, ["- This repo: created not read, stars not read", MATCH_LINES[1]]],
    ["the entry's meta", `${API}/example/second-plugin`, [MATCH_LINES[0], `${MATCH_START}: created not read, stars not read, another first commit, 0% identical files`]],
    ["the entry's newest commit", `${API}/example/second-plugin/commits?per_page=1`, [MATCH_LINES[0], `${MATCH_START}: created 2020-05-06, 40 stars, first commit not read, identical files not read`]],
    ["the entry's tree", `${API}/example/second-plugin/git/trees/${gitSha("3")}?recursive=1`, [MATCH_LINES[0], `${MATCH_START}: created 2020-05-06, 40 stars, another first commit, identical files not read`]],
  ])("a failed read of %s prints as not read and fails nothing", async (_name, url, lines) => {
    const { result } = await run({ [LIST]: { json: [pull(1, { body: source(1, ["name-match"]) })] }, ...entry(1, { name: "Zotero Second" }), ...evidence, [url]: { status: 500, json: {} } }, false);
    expect(result.failed).toEqual([]);
    expect(result.changed).toEqual([{ number: 1, lines: [...lines, "- Owner's GitHub account created: 2026-10-20"] }]);
  });

  test("a match with no entry on github.com reads and prints the new repo's facts", async () => {
    const root = mkdtempSync(join(tmpdir(), "zpi-refresh-root-"));
    temps.push(root);
    mkdirSync(join(root, "a@x"));
    writeFileSync(join(root, "a@x", "meta.json"), JSON.stringify({ name: "Zotero Second", repoUrl: "https://gitlab.com/carol/second" }));
    const { fetch } = fixtureFetch({ [LIST]: { json: [pull(1, { body: source(1, ["name-match"]) })] }, ...entry(1, { name: "Zotero Second" }), ...evidence });
    const result = await refreshHolds({ fetch, indexRepo: "example/index", root, apply: false });
    expect(result.changed[0].lines[0]).toBe("- This repo: created 2026-03-04, 2 stars");
  });

  test("a pull request held without name-match sends no request for these facts", async () => {
    const { requests } = await run({ [LIST]: { json: [pull(1)] }, ...entry(1, { name: "Zotero Second" }), ...evidence }, false);
    expect(requests.filter(({ url }) => url.startsWith(`${API}/bob/`) || url.startsWith(`${API}/example/second-plugin`))).toEqual([]);
  });

  test.each<[string, Record<string, unknown>, string]>([
    ["a head branch outside discover/", { head: { ref: "feature/p1", sha: sha(1), repo: { full_name: "example/index" } } }, "its head branch does not start with discover/"],
    ["another author", { user: { login: "someone" } }, "its author is not github-actions[bot]"],
    ["no label", { labels: [] }, "it has no hold label"],
    ["no Hold line", { body: "The discovery bot found it.\n" }, "its body does not have one Hold line"],
    ["Hold: none", { body: "Hold: none\n" }, "its Hold line says none"],
    ["an unknown reason", { body: "Intro.\n\nHold: too-new\n" }, "its Hold line names an unknown reason"],
    ["no closing sentence", { body: "Intro.\n\nHold: update-host\n" }, "its body has no closing sentence after its Hold line"],
  ])("skips a pull request with %s", async (_name, change, reason) => {
    const { result, patches } = await run({ [LIST]: { json: [pull(1, change)] }, ...entry(1) });
    expect(result.skipped).toEqual([{ number: 1, reason }]);
    expect(patches).toEqual([]);
  });

  describe("a pull request held for replaces-entry", () => {
    const LISTED_ID = "second-plugin@example.org";
    const encode = (text: string) => ({ json: { encoding: "base64", content: Buffer.from(text).toString("base64") } });
    const replacing = (kept: Record<string, unknown> = { schemaVersion: 1 }): Responses => ({
      ...evidence,
      "https://api.github.com/users/bob": { json: { created_at: "2026-10-20T12:00:00Z" } },
      [`${INDEX}/pulls/1/files?per_page=100`]: { json: [{ filename: `plugins/${LISTED_ID}/meta.json`, status: "modified" }] },
      [`${INDEX}/contents/plugins/${encodeURIComponent(LISTED_ID)}/meta.json?ref=${sha(1)}`]: encode(JSON.stringify({ id: LISTED_ID, name: "Second Plugin", repoUrl: "https://github.com/bob/p1", updateUrl: UPDATE })),
      [`${INDEX}/contents/plugins/${encodeURIComponent(LISTED_ID)}/index.json?ref=${sha(1)}`]: encode(JSON.stringify(kept)),
      [`${API}/bob/p1/releases/latest`]: { json: { published_at: "2026-03-01T12:00:00Z" } },
      [`${API}/example/second-plugin/releases/latest`]: { status: 404, json: {} },
      [`PATCH ${INDEX}/pulls/1`]: { json: { number: 1 } },
    });
    const LINES = [
      "- This repo: created 2026-03-04, 2 stars, newest stable release 2026-03-01",
      "- Listed repo: [example/second-plugin](https://github.com/example/second-plugin): created 2020-05-06, 40 stars, newest stable release none",
      "- Kept from `index.json`: no override and no paid-service mark",
    ];

    test.each<[string, Written["holds"], string]>([
      ["alone", ["replaces-entry"], "Hold: replaces-entry"],
      ["beside another reason", ["name-match", "replaces-entry"], "Hold: name-match, replaces-entry"],
    ])("keeps the reason %s on the Hold line and rewrites its detail lines", async (_name, holds, holdLine) => {
      const held = pull(1, { body: source(1, holds) });
      const { result, patches } = await run({ [LIST]: { json: [held] }, ...replacing(), [`${INDEX}/pulls/1`]: { json: held } });
      expect(result.failed).toEqual([]);
      expect(result.skipped).toEqual([]);
      expect(result.changed.map(({ number }) => number)).toEqual([1]);
      expect(result.changed[0].lines).toEqual(expect.arrayContaining(LINES));
      expect(patches[0].sent.body).toContain(`\n${holdLine}\n`);
      for (const line of LINES) expect(patches[0].sent.body).toContain(line);
    });

    test("says not read, not none, for the release of a listed repo that is gone", async () => {
      const held = pull(1, { body: source(1, ["replaces-entry"]) });
      const { result } = await run({ [LIST]: { json: [held] }, ...replacing(), [`${INDEX}/pulls/1`]: { json: held }, [`${API}/example/second-plugin`]: { status: 404, json: {} } });
      expect(result.changed[0].lines).toContain("- Listed repo: [example/second-plugin](https://github.com/example/second-plugin): created not read, stars not read, newest stable release not read");
    });

    test("says when no entry lists the id from another repo now", async () => {
      const held = pull(1, { body: source(1, ["replaces-entry"]) });
      const other = "not-listed@example.org";
      const { result } = await run({
        [LIST]: { json: [held] },
        ...replacing(),
        [`${INDEX}/pulls/1`]: { json: held },
        [`${INDEX}/pulls/1/files?per_page=100`]: { json: [{ filename: `plugins/${other}/meta.json`, status: "modified" }] },
        [`${INDEX}/contents/plugins/${encodeURIComponent(other)}/meta.json?ref=${sha(1)}`]: encode(JSON.stringify({ id: other, repoUrl: "https://github.com/bob/p1" })),
        [`${INDEX}/contents/plugins/${encodeURIComponent(other)}/index.json?ref=${sha(1)}`]: encode(JSON.stringify({ schemaVersion: 1 })),
      });
      expect(result.changed[0].lines).toContain("- Listed repo: no entry lists this id from another github.com repo now");
    });

    test.each<[string, Responses]>([
      ["the two added files of a new entry", entry(1)],
      ["a modified index.json", { [`${INDEX}/pulls/1/files?per_page=100`]: { json: [{ filename: `plugins/${LISTED_ID}/index.json`, status: "modified" }] } }],
      ["a meta.json in a dot folder", { [`${INDEX}/pulls/1/files?per_page=100`]: { json: [{ filename: "plugins/.hidden/meta.json", status: "modified" }] } }],
    ])("skips such a pull request whose files are %s", async (_name, responses) => {
      const held = pull(1, { body: source(1, ["replaces-entry"]) });
      const { result } = await run({ [LIST]: { json: [held] }, ...responses });
      expect(result.skipped).toEqual([{ number: 1, reason: "its one file is not a modified plugins/<id>/meta.json" }]);
    });
  });

  test("skips a pull request whose files are not exactly one new entry", async () => {
    const { result } = await run({ [LIST]: { json: [pull(1)] }, ...entry(1), [`${INDEX}/pulls/1/files?per_page=100`]: { json: [{ filename: "README.md", status: "modified" }] } });
    expect(result.skipped).toEqual([{ number: 1, reason: "its files are not exactly plugins/<id>/meta.json and plugins/<id>/index.json, both added" }]);
  });

  test.each<[string, Responses, Record<string, unknown>, RegExp]>([
    ["its files", { [`${INDEX}/pulls/1/files?per_page=100`]: { status: 500, json: {} } }, {}, /pulls\/1\/files.*returned HTTP 500/],
    ["its head SHA", {}, { head: { ref: "discover/bob/p1", repo: { full_name: "example/index" } } }, /^its head has no commit SHA$/],
    ["its repo", entry(1, { repoUrl: "not a url" }), {}, /^its meta\.json names no owner\/repo$/],
    ["its update URL", entry(1, { updateUrl: "not a url" }), {}, /^its meta\.json has no update URL$/],
    ["its edit", { [`PATCH ${INDEX}/pulls/1`]: { status: 403, json: { message: "Forbidden" } } }, {}, /returned HTTP 403: Forbidden/],
  ])("a pull request fails on %s", async (_name, responses, change, message) => {
    const { result } = await run({ [LIST]: { json: [pull(1, change)] }, ...entry(1), ...responses });
    expect(result.failed).toEqual([{ number: 1, message: expect.stringMatching(message) }]);
    expect(result.changed).toEqual([]);
  });

  test("a failed meta.json read leaves that body and goes on to the next", async () => {
    const { result, patches } = await run({
      [LIST]: { json: [pull(1), pull(2)] },
      ...entry(1),
      [`${INDEX}/contents/plugins/${encodeURIComponent(id(1))}/meta.json?ref=${sha(1)}`]: { status: 500, json: {} },
      ...entry(2),
    });
    expect(result.failed).toEqual([{ number: 1, message: expect.stringContaining("returned HTTP 500") }]);
    expect(patches.map(({ url }) => url)).toEqual([`${INDEX}/pulls/2`]);
  });

  test("it works out the update-host lines from a new read of the update file", async () => {
    const hops = ["https://bob.github.io/update.json", "http://forrt.example.org/a.json", "https://bob.github.io/b.json"];
    const { result } = await run(
      {
        [LIST]: { json: [pull(1)] },
        ...entry(1, { updateUrl: hops[0] }),
        [hops[0]]: { status: 301, headers: { location: hops[1] } },
        [hops[1]]: { status: 301, headers: { location: hops[2] } },
        [hops[2]]: { json: {} },
      },
      false,
    );
    expect(result.changed).toEqual([
      {
        number: 1,
        lines: ["- Update host: ` bob.github.io `", "- Update file redirects to: ` forrt.example.org `", "- Update file read used http: yes", "- Owner's GitHub account created: 2026-10-20"],
      },
    ]);
  });

  test("a pull request not held for its update host does not read the update file", async () => {
    const { requests } = await run({ [LIST]: { json: [pull(1, { body: source(1, ["new-account"]) })] }, ...entry(1) }, false);
    expect(requests.map(({ url }) => url)).not.toContain(UPDATE);
  });

  const refusedHop: Responses = { [UPDATE]: { status: 302, headers: { location: "https://127.0.0.1/update.json" } } };
  const tooManyHops: Responses = Object.fromEntries(
    Array.from({ length: 6 }, (_, n) => [n === 0 ? UPDATE : `https://hop.example.org/${n}`, { status: 302, headers: { location: `https://hop.example.org/${n + 1}` } }]),
  );
  test.each<[string, Responses, string]>([
    ["a final HTTP error", { [UPDATE]: { status: 404 } }, "returned HTTP 404"],
    ["a rejected request", { [UPDATE]: { error: "connection reset" } }, "connection reset"],
    ["a refused host", refusedHop, "127.0.0.1"],
    ["more than 5 redirects", tooManyHops, "more than 5 redirects"],
  ])("%s leaves the body as it is and lists the pull request as failed", async (_name, answers, message) => {
    const { result, patches } = await run({ [LIST]: { json: [pull(1)] }, ...entry(1), ...answers });
    expect(result.failed).toEqual([{ number: 1, message: expect.stringContaining(message) }]);
    expect(result.changed).toEqual([]);
    expect(patches).toEqual([]);
  });

  test("an update file read that stalls stops at its limit and lists the pull request as failed", async () => {
    const { fetch } = fixtureFetch({ [LIST]: { json: [pull(1)] }, ...entry(1), [UPDATE]: { stall: "headers" } });
    const result = await refreshHolds({ fetch, lookup: publicLookup, updateReadMs: 20, indexRepo: "example/index", root: PLUGINS, apply: true });
    expect(result.failed).toEqual([{ number: 1, message: expect.stringContaining("aborted due to timeout") }]);
  });

  test("an account read with no date leaves a body that does not say owner-unread", async () => {
    const { result, patches } = await run({ [LIST]: { json: [pull(1)] }, ...entry(1), "https://api.github.com/users/bob": { status: 404, json: {} } });
    expect(result.failed).toEqual([{ number: 1, message: "the read of its owner's account gave no date" }]);
    expect(patches).toEqual([]);
  });

  test("an account read with no date on an owner-unread pull request says that the bot could not read it", async () => {
    const { result } = await run({ [LIST]: { json: [pull(1, { body: source(1, ["owner-unread"]) })] }, ...entry(1), "https://api.github.com/users/bob": { status: 404, json: {} } }, false);
    expect(result.changed).toEqual([{ number: 1, lines: ["- Owner's GitHub account created: the bot could not read the date"] }]);
  });
});

describe("pnpm refresh-holds on the command line", () => {
  // Runs the command against `responses`, logging each request it sends to a file.
  function cli(args: string[], responses: Responses, env: Record<string, string>) {
    const pnpmPath = process.env.npm_execpath;
    if (!pnpmPath) throw new Error("run the tests with `pnpm test`, so they can call pnpm");
    const dir = mkdtempSync(join(tmpdir(), "zpi-refresh-"));
    temps.push(dir);
    const fixture = join(dir, "responses.json");
    writeFileSync(fixture, JSON.stringify({ source: "refresh test", repoUrl: "", responses }));
    const log = join(dir, "requests.jsonl");
    writeFileSync(log, "");
    const { INIT_CWD: _outer, GITHUB_TOKEN: _token, GITHUB_REPOSITORY: _repo, ...outer } = process.env;
    Object.assign(outer, { ZPI_FIXTURE: fixture, ZPI_REQUESTS: log, NODE_OPTIONS: `--import=${PRELOAD}` }, env);
    const result = spawnSync(pnpmPath, ["--silent", "--dir", ROOT, "refresh-holds", ...args], { cwd: dir, encoding: "utf8", env: outer, timeout: 50_000 });
    return { result, requests: readFileSync(log, "utf8") };
  }
  const printed = HOST_LINES.join("\n");
  const responses = { [LIST]: { json: [pull(1), pull(2, { labels: [] })] }, ...entry(1) };

  test("without --apply it prints what it would edit and what it skipped", () => {
    const { result, requests } = cli([], responses, { GITHUB_REPOSITORY: "example/index" });
    expect(result.stdout).toBe(`to edit #1:\n${printed}\nskipped #2: it has no hold label\n`);
    expect(requests).not.toContain("PATCH");
    expect(result.status).toBe(0);
  });

  test("with --apply it prints what it edited", () => {
    const { result, requests } = cli(["--apply"], responses, { GITHUB_REPOSITORY: "example/index", GITHUB_TOKEN: "t" });
    expect(result.stdout).toBe(`edited #1:\n${printed}\nskipped #2: it has no hold label\n`);
    expect(requests).toContain("PATCH");
    expect(result.status).toBe(0);
  });

  test("a failed pull request is printed on stderr, and the command exits 1", () => {
    const { result } = cli([], { ...responses, [`${INDEX}/pulls/1/files?per_page=100`]: { status: 500, json: {} } }, { GITHUB_REPOSITORY: "example/index" });
    expect(result.stderr).toMatch(/^failed #1: .*HTTP 500/);
    expect(result.status).toBe(1);
  });

  test("a failed list read refreshes nothing, and the command exits 1", () => {
    const { result } = cli([], { [LIST]: { status: 500, json: {} } }, { GITHUB_REPOSITORY: "example/index" });
    expect(result.stderr).toMatch(/^refreshed nothing: .*HTTP 500/);
    expect(result.status).toBe(1);
  });

  test.each<[string, string[], Record<string, string>, RegExp]>([
    ["another argument", ["--force"], { GITHUB_REPOSITORY: "example/index" }, /^usage: pnpm refresh-holds/],
    ["no index repo", [], {}, /^GITHUB_REPOSITORY must name the index repo/],
    ["--apply with no token", ["--apply"], { GITHUB_REPOSITORY: "example/index" }, /^--apply needs GITHUB_TOKEN/],
  ])("refuses %s and sends no request", (_name, args, env, message) => {
    const { result, requests } = cli(args, responses, env);
    expect(result.stderr).toMatch(message);
    expect(requests).toBe("");
    expect(result.status).toBe(1);
  });
});
