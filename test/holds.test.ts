import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { readSites, type Site } from "../src/check/sites.ts";
import { draftEntry, indexed } from "../src/discover/discover.ts";
import { holdDetails, holdReasons, identicalPercent, type IndexedName, matchEvidence, type RepoFacts } from "../src/discover/holds.ts";
import { fixtureFetch, type Responses } from "./support/fixture-fetch.ts";
import { pluginRepo, repoGit, sha } from "./support/plugin-repo.ts";

const NOW = new Date("2026-10-29T12:00:00Z");
const DAY = 24 * 60 * 60 * 1000;
const publicLookup = async () => ["140.82.112.3"];

const temps: string[] = [];
afterAll(() => {
  for (const dir of temps.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function tempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "zpi-holds-"));
  temps.push(dir);
  return dir;
}

// The index holds one entry, "Paper Sidebar" from alice/zotero-paper-sidebar.
const INDEXED: IndexedName[] = [{ owner: "alice", repoPart: "zotero-paper-sidebar", name: "Paper Sidebar" }];

// The hold reasons of the entry that draftEntry drafts from `responses` for `repo`.
async function holds(repo: string, responses: Responses, issueRun = false) {
  const { fetch } = fixtureFetch(responses);
  const drafted = await draftEntry(`https://github.com/${repo}`, {
    fetch,
    lookup: publicLookup,
    outDir: tempDir(),
    ids: new Set(),
    names: INDEXED,
    now: NOW,
    issueRun,
  });
  if (!drafted.ok) throw new Error(`draftEntry refused: ${drafted.message}`);
  return drafted.holds;
}

const ago = (days: number) => new Date(NOW.getTime() - days * DAY).toISOString();

describe("the hold reasons", () => {
  test("an entry that meets none gets none", async () => {
    expect(await holds("bob/zotero-tagger", pluginRepo("bob/zotero-tagger", "tagger@example.org", { name: "Tagger" }))).toEqual([]);
  });

  test.each<[string, string, Parameters<typeof pluginRepo>[2], boolean, string[]]>([
    ["name-match by the manifest name", "bob/sidebar-tool", { name: "Zotero Paper Sidebar" }, false, ["name-match"]],
    ["name-match by the repo part", "bob/Paper-Sidebar", { name: "Reading Pane" }, false, ["name-match"]],
    ["owner-unread for an account with no created_at", "bob/zotero-tagger", { name: "Tagger", ownerCreatedAt: "not a date" }, false, ["owner-unread"]],
    ["new-account for an account 29 days old", "bob/zotero-tagger", { name: "Tagger", ownerCreatedAt: ago(29) }, false, ["new-account"]],
    ["update-host for an update.json on another host", "bob/zotero-tagger", { name: "Tagger", updateHost: "updates.example.org" }, false, ["update-host"]],
    ["update-host for github.com with a port", "bob/zotero-tagger", { name: "Tagger", updateHost: "github.com:8443" }, false, ["update-host"]],
    ["issue-no-topic for an issue run's repo with neither topic", "bob/zotero-tagger", { name: "Tagger", topics: ["zotero"] }, true, ["issue-no-topic"]],
  ])("%s", async (_name, repo, options, issueRun, expected) => {
    expect(await holds(repo, pluginRepo(repo, "x@example.org", options), issueRun)).toEqual(expected);
  });

  test.each([
    ["bob/zotero-tagger", "bob.github.io"],
    ["Juris-M/zotero-odf-scan-plugin", "juris-m.github.io"],
    ["forrtproject/flora-zotero", "forrtproject.github.io"],
  ])("an update.json on the owner's own site does not hold: %s on %s", async (repo, updateHost) => {
    expect(await holds(repo, pluginRepo(repo, "x@example.org", { name: "Tagger", updateHost }))).toEqual([]);
  });

  test("the owner's own site is compared in lowercase on both sides", () => {
    const facts = { repo: "Bob/zotero-tagger", updateHost: "BOB.github.io", updateRoute: ["https://BOB.github.io/update.json"], topics: ["zotero-plugin"], issueRun: false, ownerCreatedAt: new Date(ago(1000)), now: NOW, indexed: [] };
    expect(holdReasons(facts)).toEqual([]);
  });

  test.each(["alice.github.io", "bob.github.io:8443", "sub.bob.github.io", "bob.evil.github.io", "bobx.github.io", "bob-x.github.io", "bob.github.io.example.org", "bob.gitlab.io", "github.io"])(
    "update-host for %s, which is not bob's own site",
    async (updateHost) => {
      expect(await holds("bob/zotero-tagger", pluginRepo("bob/zotero-tagger", "x@example.org", { name: "Tagger", updateHost }))).toEqual(["update-host"]);
    },
  );

  describe("the update file read", () => {
    const BOB = "bob/zotero-tagger";
    const SITE = "https://bob.github.io/tagger/update.json";
    const held = (updateRoute: string[]) => holds(BOB, pluginRepo(BOB, "x@example.org", { name: "Tagger", updateRoute }));

    test.each<[string, string[]]>([
      ["a custom domain as the last host", [SITE, "https://updates.example.org/update.json"]],
      ["a custom domain as an earlier host, then a return to the owner's site", [SITE, "https://updates.example.org/a", "https://bob.github.io/tagger/b.json"]],
      ["another owner's site", [SITE, "https://alice.github.io/tagger/update.json"]],
      ["raw.githubusercontent.com", [SITE, "https://raw.githubusercontent.com/bob/zotero-tagger/main/update.json"]],
      ["the owner's site with a non-default port", [SITE, "https://bob.github.io:8443/update.json"]],
    ])("update-host when the owner's site redirects to %s", async (_name, route) => {
      expect(await held(route)).toEqual(["update-host"]);
    });

    test.each<[string, string[]]>([
      ["no redirect", [SITE]],
      ["a redirect to another path on the same host", [SITE, "https://bob.github.io/other/update.json"]],
    ])("no update-host for the owner's site with %s", async (_name, route) => {
      expect(await held(route)).toEqual([]);
    });

    test.each<[string, string[]]>([
      ["github.com to release-assets.githubusercontent.com", ["https://github.com/bob/zotero-tagger/releases/download/release/update.json", "https://release-assets.githubusercontent.com/asset"]],
      ["raw.githubusercontent.com to another host", ["https://raw.githubusercontent.com/bob/zotero-tagger/main/update.json", "https://cdn.example.org/update.json"]],
    ])("no update-host for %s", async (_name, route) => {
      expect(await held(route)).toEqual([]);
    });

    test.each<[string, string[]]>([
      ["raw.githubusercontent.com", ["https://updates.example.org/update.json", "https://raw.githubusercontent.com/bob/zotero-tagger/main/update.json"]],
      ["the owner's site", ["https://updates.example.org/update.json", SITE]],
    ])("update-host for another named host that redirects to %s", async (_name, route) => {
      expect(await held(route)).toEqual(["update-host"]);
    });

    test.each<[string, string[]]>([
      ["github.com, no redirect", ["http://github.com/bob/zotero-tagger/raw/main/update.json"]],
      ["raw.githubusercontent.com, no redirect", ["http://raw.githubusercontent.com/bob/zotero-tagger/main/update.json"]],
      ["the owner's site, no redirect", ["http://bob.github.io/tagger/update.json"]],
      ["github.com, to https on its host", ["http://github.com/bob/zotero-tagger/raw/main/update.json", "https://github.com/bob/zotero-tagger/raw/main/update.json"]],
      ["raw.githubusercontent.com, to https on its host", ["http://raw.githubusercontent.com/bob/zotero-tagger/main/update.json", "https://raw.githubusercontent.com/bob/zotero-tagger/main/update.json"]],
      ["the owner's site, to https on its host", ["http://bob.github.io/tagger/update.json", SITE]],
      ["https on the owner's site, to http on its host", [SITE, "http://bob.github.io/tagger/update.json"]],
      ["https on github.com, to http on another host", ["https://github.com/bob/zotero-tagger/raw/main/update.json", "http://release-assets.githubusercontent.com/asset"]],
      ["http between https URLs", ["https://raw.githubusercontent.com/bob/zotero-tagger/main/a.json", "http://raw.githubusercontent.com/bob/zotero-tagger/main/b.json", "https://raw.githubusercontent.com/bob/zotero-tagger/main/c.json"]],
    ])("update-host for http: %s", async (_name, route) => {
      expect(await held(route)).toEqual(["update-host"]);
    });
  });

  test("an account exactly 30 days old does not hold", async () => {
    expect(await holds("bob/zotero-tagger", pluginRepo("bob/zotero-tagger", "x@example.org", { name: "Tagger", ownerCreatedAt: ago(30) }))).toEqual([]);
  });

  test("owner-unread for a failed account read", async () => {
    const responses = pluginRepo("bob/zotero-tagger", "x@example.org", { name: "Tagger" });
    responses["https://api.github.com/users/bob"] = { status: 404, json: { message: "Not Found" } };
    expect(await holds("bob/zotero-tagger", responses)).toEqual(["owner-unread"]);
  });

  test("a name that matches an entry of the same owner does not hold", async () => {
    expect(await holds("alice/paper-sidebar-2", pluginRepo("alice/paper-sidebar-2", "x@example.org", { name: "Paper Sidebar" }))).toEqual([]);
  });

  test("a discover run's repo with neither topic does not hold", async () => {
    expect(await holds("bob/zotero-tagger", pluginRepo("bob/zotero-tagger", "x@example.org", { name: "Tagger", topics: [] }))).toEqual([]);
  });

  test("name-match reads the owners, repo parts, and names that indexed() gives for the entries under a root", async () => {
    // test/fixtures/build/plugins holds "Second Plugin" from example/second-plugin.
    const { names } = await indexed(resolve(import.meta.dirname, "fixtures/build/plugins"));
    const draft = async (repo: string, name: string) => {
      const { fetch } = fixtureFetch(pluginRepo(repo, "x@example.org", { name }));
      const drafted = await draftEntry(`https://github.com/${repo}`, { fetch, lookup: publicLookup, outDir: tempDir(), ids: new Set(), names, now: NOW });
      return drafted.ok ? drafted.holds : drafted.message;
    };
    expect(await draft("bob/zotero-second-plugin", "Tagger")).toEqual(["name-match"]);
    expect(await draft("bob/tagger", "Zotero Second")).toEqual(["name-match"]);
    expect(await draft("example/tagger", "Second")).toEqual([]);
  });

  test("an entry that meets several reasons gets them in order", async () => {
    const options = { name: "Paper Sidebar", ownerCreatedAt: ago(1), updateHost: "updates.example.org", topics: [] };
    expect(await holds("bob/zotero-tagger", pluginRepo("bob/zotero-tagger", "x@example.org", options), true)).toEqual([
      "name-match",
      "new-account",
      "update-host",
      "issue-no-topic",
    ]);
  });
});

describe("the listed-site hold", () => {
  // The committed file, so each site that it lists gets a held case.
  let sites: Site[];
  beforeAll(async () => {
    sites = await readSites(join(resolve(import.meta.dirname, ".."), "sites.json"));
  });

  async function drafted(repo: string, options: Parameters<typeof pluginRepo>[2]) {
    const { fetch } = fixtureFetch(pluginRepo(repo, "x@example.org", options));
    const result = await draftEntry(`https://github.com/${repo}`, { fetch, lookup: publicLookup, outDir: tempDir(), ids: new Set(), names: INDEXED, now: NOW, sites });
    if (!result.ok) throw new Error(`draftEntry refused: ${result.message}`);
    return result;
  }

  test.each<[string, string, Parameters<typeof pluginRepo>[2], string]>([
    ["the manifest name", "bob/pdf-getter", { name: "Sci-Hub Getter" }, "name"],
    ["the manifest description", "bob/pdf-getter", { name: "PDF Getter", description: "Downloads PDFs from Sci-Hub" }, "description"],
    ["the GitHub description", "bob/pdf-getter", { name: "PDF Getter", repoDescription: "A Sci-Hub client for Zotero" }, "repoDescription"],
    ["the repo name", "bob/zotero-scihub-getter", { name: "PDF Getter" }, "repoName"],
    ["a topic", "bob/pdf-getter", { name: "PDF Getter", topics: ["zotero-plugin", "sci-hub"] }, "topics"],
  ])("holds a repo whose %s names a listed site, and names that text", async (_name, repo, options, field) => {
    const result = await drafted(repo, options);
    expect(result.holds).toEqual(["listed-site"]);
    expect(result.holdDetails?.sites).toEqual([{ site: "Sci-Hub", fields: [field] }]);
  });

  test.each(["Sci-Hub", "Anna's Archive"])("holds a repo that names %s, each site in the file", async (site) => {
    const result = await drafted("bob/pdf-getter", { name: "PDF Getter", description: `Downloads PDFs from ${site}` });
    expect(result.holds).toEqual(["listed-site"]);
    expect(result.holdDetails?.sites).toEqual([{ site, fields: ["description"] }]);
  });

  test.each(["SCI HUB", "sci_hub", "SciHub", "ANNAS-ARCHIVE"])("holds the case and punctuation variant %j", async (text) => {
    expect((await drafted("bob/pdf-getter", { name: `PDF Getter for ${text}` })).holds).toEqual(["listed-site"]);
  });

  test("names every text that names a site, and each site once", async () => {
    const result = await drafted("bob/zotero-scihub", { name: "Sci-Hub PDF", description: "From Sci-Hub or Anna's Archive", topics: ["zotero-plugin", "scihub"] });
    expect(result.holdDetails?.sites).toEqual([
      { site: "Sci-Hub", fields: ["name", "description", "repoName", "topics"] },
      { site: "Anna's Archive", fields: ["description"] },
    ]);
  });

  test.each([
    ["a near-miss name", { name: "SciHubble Notes" }],
    ["a near-miss description", { name: "PDF Getter", description: "Downloads from sci-hubs of open papers" }],
    ["a near-miss topic", { name: "PDF Getter", topics: ["zotero-plugin", "scihubs"] }],
  ])("does not hold %s", async (_name, options) => {
    const result = await drafted("bob/pdf-getter", options);
    expect(result.holds).toEqual([]);
    expect(result.holdDetails).toBeUndefined();
  });

  test("does not hold a repo that names a site when no sites are given", async () => {
    const { fetch } = fixtureFetch(pluginRepo("bob/zotero-scihub", "x@example.org", { name: "Sci-Hub PDF" }));
    const result = await draftEntry("https://github.com/bob/zotero-scihub", { fetch, lookup: publicLookup, outDir: tempDir(), ids: new Set(), names: INDEXED, now: NOW });
    expect(result.ok && result.holds).toEqual([]);
  });
});

describe("the name-match tests", () => {
  const OWN_DAY = new Date("2026-06-01T00:00:00Z");
  const EARLIER = new Date("2026-01-01T00:00:00Z");
  const own: RepoFacts = { createdAt: OWN_DAY, stars: 2, firstCommit: "own", blobs: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"] };
  const other: RepoFacts = { createdAt: new Date("2026-09-01T00:00:00Z"), stars: 0, firstCommit: "other", blobs: ["x"] };
  const MATCH: IndexedName = { owner: "alice", repoPart: "zotero-paper-sidebar", name: "Paper Sidebar", github: true };
  const SECOND: IndexedName = { owner: "carol", repoPart: "paper-sidebar", name: "Paper Sidebar", github: true };
  const reasons = (entries: [IndexedName, RepoFacts][], ownFacts: RepoFacts = own) =>
    holdReasons({
      repo: "bob/paper-tool",
      name: "Paper Sidebar",
      updateHost: "github.com",
      updateRoute: ["https://github.com/update.json"],
      topics: [],
      issueRun: false,
      ownerCreatedAt: new Date("2015-01-01T00:00:00Z"),
      now: NOW,
      indexed: entries.map(([entry]) => entry),
      evidence: { own: ownFacts, entries: new Map(entries.map(([entry, facts]) => [`${entry.owner}/${entry.repoPart}`, facts])) },
    });
  const held = (facts: RepoFacts, ownFacts?: RepoFacts) => reasons([[MATCH, { ...other, ...facts }]], ownFacts).includes("name-match");

  test("an entry that passes no test does not hold", () => {
    expect(held({})).toBe(false);
  });

  // `same` blobs that both have, then blobs that only `prefix` has, up to `total`.
  const files = (same: number, total: number, prefix: string) => [...Array.from({ length: same }, (_, n) => `same${n}`), ...Array.from({ length: total - same }, (_, n) => `${prefix}${n}`)];

  test("a shared first commit holds with no file in common", () => {
    expect(held({ firstCommit: "own" })).toBe(true);
  });

  test.each<[string, number, number, number, boolean]>([
    ["30% of the new repo's files", 30, 100, 1000, true],
    ["29% of the new repo's files", 29, 100, 1000, false],
    ["30% of the entry's files", 30, 1000, 100, true],
    ["29% of the entry's files", 29, 1000, 100, false],
  ])("shared code: %s", (_name, same, ownTotal, entryTotal, expected) => {
    expect(held({ blobs: files(same, entryTotal, "entry") }, { ...own, blobs: files(same, ownTotal, "own") })).toBe(expected);
  });

  test("a repo with no counted files has a share of 0", () => {
    expect(held({ blobs: [] })).toBe(false);
    expect(held({}, { ...own, blobs: [] })).toBe(false);
  });

  test("a blob repeated in one repo counts for each of its paths", () => {
    expect(identicalPercent(["a", "a", "b", "c"], ["a", "t", "u", "v", "w", "x", "y", "z"])).toBe(50);
  });

  test.each<[string, RepoFacts, boolean]>([
    ["older, 20 stars, 10 times", { createdAt: EARLIER, stars: 20 }, true],
    ["older, 19 stars, 9.5 times", { createdAt: EARLIER, stars: 19 }, false],
    ["created at the same time", { createdAt: OWN_DAY, stars: 200 }, false],
    ["created later", { createdAt: new Date("2026-07-01T00:00:00Z"), stars: 200 }, false],
  ])("namesake against 2 stars: %s", (_name, facts, expected) => {
    expect(held(facts)).toBe(expected);
  });

  test("namesake: 49 stars against 5 is under 10 times, and 50 is not", () => {
    expect(held({ createdAt: EARLIER, stars: 49 }, { ...own, stars: 5 })).toBe(false);
    expect(held({ createdAt: EARLIER, stars: 50 }, { ...own, stars: 5 })).toBe(true);
  });

  test("namesake: a new repo with 0 stars needs only the 20", () => {
    expect(held({ createdAt: EARLIER, stars: 20 }, { ...own, stars: 0 })).toBe(true);
    expect(held({ createdAt: EARLIER, stars: 19 }, { ...own, stars: 0 })).toBe(false);
  });

  test("the second of two entries can hold alone", () => {
    expect(reasons([[MATCH, other], [SECOND, { ...other, firstCommit: "own" }]])).toEqual(["name-match"]);
  });

  test("facts split across two entries do not hold", () => {
    const older = { ...other, createdAt: EARLIER };
    const starred = { ...other, stars: 500 };
    expect(reasons([[MATCH, older], [SECOND, starred]])).toEqual([]);
  });

  test.each<[string, keyof RepoFacts]>([
    ["created date", "createdAt"],
    ["star count", "stars"],
    ["first commit", "firstCommit"],
    ["tree", "blobs"],
  ])("an entry with no %s holds, and so does a new repo with none", (_name, fact) => {
    const { [fact]: _gone, ...entryLess } = other;
    const { [fact]: _ownGone, ...ownLess } = own;
    expect(reasons([[MATCH, entryLess]])).toEqual(["name-match"]);
    expect(reasons([[MATCH, other]], ownLess)).toEqual(["name-match"]);
  });

  test("a matched entry with no evidence holds", () => {
    const facts = { repo: "bob/paper-tool", name: "Paper Sidebar", updateHost: "github.com", updateRoute: ["https://github.com/update.json"], topics: [], issueRun: false, ownerCreatedAt: new Date("2015-01-01T00:00:00Z"), now: NOW, indexed: [MATCH] };
    expect(holdReasons(facts)).toEqual(["name-match"]);
    expect(holdReasons({ ...facts, evidence: { own, entries: new Map() } })).toEqual(["name-match"]);
  });
});

describe("the name-match reads through draftEntry", () => {
  const OWN = "bob/sidebar-tool";
  const FIRST = "alice/zotero-paper-sidebar";
  const SECOND = "carol/paper-sidebar";
  const api = (repo: string) => `https://api.github.com/repos/${repo}`;
  const NAMES: IndexedName[] = [
    { owner: "alice", repoPart: "zotero-paper-sidebar", name: "Paper Sidebar", github: true },
    { owner: "carol", repoPart: "paper-sidebar", name: "Paper Sidebar", github: true },
  ];
  const entryMeta = { json: { created_at: "2026-02-01T00:00:00Z", stargazers_count: 1 } };
  // A new repo and two entries that it matches and that pass no test.
  const clean = (): Responses => ({
    ...pluginRepo(OWN, "x@example.org", { name: "Paper Sidebar", stars: 2 }),
    ...repoGit(OWN, { head: sha("1"), first: sha("2"), files: { "a.ts": sha("a"), "LICENSE": sha("9") } }),
    [api(FIRST)]: entryMeta,
    ...repoGit(FIRST, { head: sha("3"), first: sha("4"), files: { "b.ts": sha("b"), "LICENSE": sha("9") } }),
    [api(SECOND)]: entryMeta,
    ...repoGit(SECOND, { head: sha("5"), first: sha("6"), files: { "c.ts": sha("c"), "LICENSE": sha("9") } }),
  });
  async function draft(responses: Responses, options: { names?: IndexedName[]; evidenceMs?: number } = {}) {
    const { fetch, requests } = fixtureFetch(responses);
    const drafted = await draftEntry(`https://github.com/${OWN}`, { fetch, lookup: publicLookup, outDir: tempDir(), ids: new Set(), names: options.names ?? NAMES, now: NOW, evidenceMs: options.evidenceMs });
    if (!drafted.ok) throw new Error(`draftEntry refused: ${drafted.message}`);
    return { drafted, urls: requests.map(({ url }) => url) };
  }

  test("a matched entry that passes no test gets no name-match, and a clean entry no hold at all", async () => {
    const { drafted } = await draft(clean());
    expect(drafted.holds).toEqual([]);
    expect(drafted.holdDetails).toBeUndefined();
  });

  test("a name-match stands beside another reason", async () => {
    const responses = { ...clean(), ...pluginRepo(OWN, "x@example.org", { name: "Paper Sidebar", stars: 2, updateHost: "updates.example.org" }), ...repoGit(OWN, { head: sha("1"), first: sha("2"), files: { "a.ts": sha("a") } }) };
    expect((await draft(responses)).drafted.holds).toEqual(["update-host"]);
    responses[api(FIRST)] = { status: 500, json: {} };
    expect((await draft(responses)).drafted.holds).toEqual(["name-match", "update-host"]);
  });

  test("a shared first commit, and a far larger and older namesake, each hold", async () => {
    const shared = { ...clean(), ...repoGit(SECOND, { head: sha("5"), first: sha("2"), files: { "c.ts": sha("c") } }) };
    expect((await draft(shared)).drafted.holds).toEqual(["name-match"]);
    const namesake = { ...clean(), [api(FIRST)]: { json: { created_at: "2020-01-01T00:00:00Z", stargazers_count: 20 } } };
    expect((await draft(namesake)).drafted.holds).toEqual(["name-match"]);
  });

  test("an identical empty file does not count as shared code", async () => {
    const EMPTY = "e69de29bb2d1d6434b8b29ae775ad8c2e48c5391";
    const responses = {
      ...clean(),
      ...repoGit(OWN, { head: sha("1"), first: sha("2"), files: { "a.ts": sha("a"), ".nojekyll": EMPTY } }),
      ...repoGit(FIRST, { head: sha("3"), first: sha("4"), files: { "b.ts": sha("b"), ".nojekyll": EMPTY } }),
    };
    expect((await draft(responses)).drafted.holds).toEqual([]);
  });

  test("a next-page link with no last-page link leaves the first commit unread", async () => {
    const responses = clean();
    responses[`${api(FIRST)}/commits?per_page=1`] = { json: [{ sha: sha("3") }], headers: { link: `<${api(FIRST)}/commits?per_page=1&page=2>; rel="next"` } };
    const { drafted } = await draft(responses);
    expect(drafted.holds).toEqual(["name-match"]);
    expect(drafted.holdDetails?.matches?.find(({ repo }) => repo === FIRST)?.sharedFirstCommit).toBeUndefined();
  });

  test.each([403, 429])("an HTTP %i sends no more of these reads", async (status) => {
    const refused = `${api(FIRST)}/commits?per_page=1`;
    const { drafted, urls } = await draft({ ...clean(), [refused]: { status, json: {} } }, { names: [NAMES[1], NAMES[0]] });
    expect(drafted.holds).toEqual(["name-match"]);
    expect(urls.at(-1)).toBe(refused);
  });

  test("an HTTP 403 on the new repo stops the entries' later reads", async () => {
    const { urls } = await draft({ ...clean(), [`${api(OWN)}/commits?per_page=1`]: { status: 403, json: {} } });
    expect(urls.filter((url) => url.startsWith(`${api(FIRST)}/git/trees`))).toEqual([]);
  });

  test("an entry on another host has no facts from a repo of its name on github.com", async () => {
    const onGitlab = { owner: "alice", repoPart: "zotero-paper-sidebar", name: "Paper Sidebar", github: false };
    const { drafted } = await draft(clean(), { names: [NAMES[0], onGitlab] });
    expect(drafted.holds).toEqual(["name-match"]);
  });

  test("an HTTP 404 sends the later reads", async () => {
    const { urls } = await draft({ ...clean(), [api(FIRST)]: { status: 404, json: {} } });
    expect(urls).toContain(api(SECOND));
  });

  // The new repo and the entry each have one other file, and this file is identical in both.
  const withFile = (path: string): Responses => ({
    ...clean(),
    ...repoGit(OWN, { head: sha("1"), first: sha("2"), files: { "a.ts": sha("a"), [path]: sha("9") } }),
    ...repoGit(FIRST, { head: sha("3"), first: sha("4"), files: { "b.ts": sha("b"), [path]: sha("9") } }),
  });

  test.each(["sub/LICENSE.md", ".gitattributes", ".editorconfig", ".prettierrc", ".npmrc", ".github/workflows/ci.yml", "tsconfig.json", "pnpm-lock.yaml", "yarn.lock", "bun.lockb", ".eslintrc.json", "typings/global.d.ts", "zotero-plugin.config.ts", ".gitlab-ci.yml"])(
    "%s is boilerplate",
    async (path) => {
      expect((await draft(withFile(path))).drafted.holds).toEqual([]);
    },
  );

  test.each(["src/license-check.ts", "eslint-rules.ts", "src/typings.ts", "licenses/data.json", "package-lock-tool.js"])("%s is counted", async (path) => {
    expect((await draft(withFile(path))).drafted.holds).toEqual(["name-match"]);
  });

  test("the details of a match with no named entry on github.com still give the new repo's date and stars", async () => {
    const names = [{ owner: "alice", repoPart: "zotero-paper-sidebar", name: "Paper Sidebar", github: false }];
    const { drafted } = await draft(clean(), { names });
    expect(drafted.holdDetails).toMatchObject({ repoCreatedOn: "2025-01-10", repoStars: 2 });
  });

  const READS: [string, string][] = [
    ["the entry's meta", api(FIRST)],
    ["the entry's newest commit", `${api(FIRST)}/commits?per_page=1`],
    ["the entry's oldest commit", `${api(FIRST)}/commits?per_page=1&page=7`],
    ["the entry's tree", `${api(FIRST)}/git/trees/${sha("3")}?recursive=1`],
    ["the new repo's newest commit", `${api(OWN)}/commits?per_page=1`],
    ["the new repo's oldest commit", `${api(OWN)}/commits?per_page=1&page=7`],
    ["the new repo's tree", `${api(OWN)}/git/trees/${sha("1")}?recursive=1`],
  ];
  const CAUSES: [string, Responses[string], number?][] = [
    ["an error answer", { status: 500, json: {} }],
    ["a failed request", { error: "connection reset" }],
    ["a body with no such field", { json: {} }],
    ["a read past the time limit", { stall: "headers" }, 50],
  ];
  test.each(READS.flatMap(([read, url]) => CAUSES.map(([cause, answer, evidenceMs]) => [read, cause, url, answer, evidenceMs] as const)))("%s with %s holds beside a read entry", async (_read, _cause, url, answer, evidenceMs) => {
    const { drafted } = await draft({ ...clean(), [url]: answer }, { evidenceMs, names: [NAMES[1], NAMES[0]] });
    expect(drafted.holds).toEqual(["name-match"]);
    expect(drafted.holdDetails?.matches?.find(({ repo }) => repo === SECOND)?.stars).toBe(1);
  });

  test.each<[string, string]>([
    ["the entry's", `${api(FIRST)}/git/trees/${sha("3")}?recursive=1`],
    ["the new repo's", `${api(OWN)}/git/trees/${sha("1")}?recursive=1`],
  ])("%s truncated tree holds", async (_name, url) => {
    expect((await draft({ ...clean(), [url]: { json: { truncated: true, tree: [] } } })).drafted.holds).toEqual(["name-match"]);
  });

  test.each<[string, object]>([
    ["a malformed created date", { created_at: "not a date", stargazers_count: 1 }],
    ["no star count", { created_at: "2026-02-01T00:00:00Z" }],
    ["a negative star count", { created_at: "2026-02-01T00:00:00Z", stargazers_count: -1 }],
  ])("an entry with %s holds", async (_name, json) => {
    expect((await draft({ ...clean(), [api(FIRST)]: { json } })).drafted.holds).toEqual(["name-match"]);
  });

  test.each<[string, object]>([
    ["a malformed created date", { created_at: "not a date", stargazers_count: 2 }],
    ["no star count", { created_at: "2025-01-10T09:00:00Z" }],
  ])("a new repo with %s holds", async (_name, change) => {
    const responses = clean();
    responses[api(OWN)] = { json: { full_name: OWN, html_url: `https://github.com/${OWN}`, fork: false, open_issues_count: 0, topics: ["zotero-plugin"], ...change } };
    expect((await draft(responses)).drafted.holds).toEqual(["name-match"]);
  });

  test("an entry that is not on github.com holds, and the bot sends no read for it", async () => {
    const names = [{ owner: "alice", repoPart: "zotero-paper-sidebar", name: "Paper Sidebar", github: false }, NAMES[1]];
    const { drafted, urls } = await draft(clean(), { names });
    expect(drafted.holds).toEqual(["name-match"]);
    expect(urls.filter((url) => url.startsWith(api(FIRST)))).toEqual([]);
  });

  test("a sixth matched entry, which the details do not name, holds, and the bot sends no read for it", async () => {
    const owners = ["o1", "o2", "o3", "o4", "o5"];
    const responses = clean();
    for (const owner of owners) {
      Object.assign(responses, { [api(`${owner}/p`)]: entryMeta }, repoGit(`${owner}/p`, { head: sha("7"), first: sha("8"), files: { "d.ts": sha("d") } }));
    }
    const named: IndexedName[] = owners.map((owner) => ({ owner, repoPart: "p", name: "Paper Sidebar", github: true }));
    expect((await draft(responses, { names: named })).drafted.holds).toEqual([]);
    const { drafted, urls } = await draft(responses, { names: [...named, { owner: "o6", repoPart: "p", name: "Paper Sidebar", github: true }] });
    expect(drafted.holds).toEqual(["name-match"]);
    expect(urls.filter((url) => url.startsWith(api("o6/p")))).toEqual([]);
  });

  test("a repo with one commit has no last-page link, and its head is its first commit", async () => {
    const responses = clean();
    responses[`${api(FIRST)}/commits?per_page=1`] = { json: [{ sha: sha("2") }] };
    responses[`${api(FIRST)}/git/trees/${sha("2")}?recursive=1`] = { json: { truncated: false, tree: [{ path: "b.ts", type: "blob", sha: sha("b") }] } };
    expect((await draft(responses)).drafted.holds).toEqual(["name-match"]);
  });

  test("an odd repo goes into the address encoded", async () => {
    const { fetch, requests } = fixtureFetch({});
    await matchEvidence(fetch, { repo: "bob/x y", name: "Paper Sidebar", indexed: NAMES });
    expect(requests[0].url).toBe(api("bob/x%20y"));
  });

  test.each<[string, IndexedName[]]>([
    ["no matched entry", [{ owner: "alice", repoPart: "other", name: "Other", github: true }]],
    ["only an entry of its own owner", [{ owner: "bob", repoPart: "paper-sidebar", name: "Paper Sidebar", github: true }]],
  ])("a repo with %s sends no request for these tests", async (_name, names) => {
    const { drafted, urls } = await draft(pluginRepo(OWN, "x@example.org", { name: "Paper Sidebar", stars: 2 }), { names });
    expect(drafted.holds).toEqual([]);
    expect(urls.filter((url) => url.includes("/commits") || url.includes("/git/trees") || url === api("alice/other") || url === api("bob/paper-sidebar"))).toEqual([]);
  });

  test("indexed() marks which entries are on github.com", async () => {
    const root = tempDir();
    for (const [dir, repoUrl] of [["a@x", "https://github.com/Alice/A"], ["b@x", "https://www.github.com/bob/b"], ["c@x", "https://gitlab.com/carol/c"]]) {
      mkdirSync(join(root, dir));
      writeFileSync(join(root, dir, "meta.json"), JSON.stringify({ repoUrl }));
    }
    const { names } = await indexed(root);
    expect(names.map(({ owner, github }) => [owner, github]).sort()).toEqual([
      ["alice", true],
      ["bob", true],
      ["carol", false],
    ]);
  });
});

describe("the hold details", () => {
  const facts = {
    repo: "bob/zotero-tagger",
    name: "Paper Sidebar",
    updateHost: "updates.example.org:8443",
    updateRoute: ["https://updates.example.org:8443/update.json"],
    ownerCreatedAt: new Date(ago(10)),
    indexed: INDEXED,
  };

  test("update-host gives each other host of the read once, in request order, and its http use", () => {
    const updateRoute = ["https://bob.github.io/a", "https://b.example.org/b", "http://a.example.org/c", "https://b.example.org/d", "https://bob.github.io/e"];
    expect(holdDetails({ ...facts, updateHost: "bob.github.io", updateRoute }, ["update-host"])).toEqual({
      updateHost: "bob.github.io",
      updateHosts: ["b.example.org", "a.example.org"],
      updateHttp: true,
      ownerCreatedOn: expect.any(String),
    });
  });

  test("name-match names 5 of 6 matches and counts the other", () => {
    const indexed = Array.from({ length: 6 }, (_, n) => ({ owner: `owner${n}`, repoPart: `part${n}`, name: "Paper Sidebar" }));
    const details = holdDetails({ ...facts, indexed }, ["name-match"]);
    expect(details?.matches?.map(({ repo }) => repo)).toEqual(["owner0/part0", "owner1/part1", "owner2/part2", "owner3/part3", "owner4/part4"]);
    expect(details?.moreMatches).toBe(1);
  });

  test("a repo-part match with an entry that has no name names its repo alone", () => {
    const details = holdDetails({ ...facts, repo: "bob/paper-sidebar", name: "Reading Pane", indexed: [{ owner: "alice", repoPart: "zotero-paper-sidebar" }] }, ["name-match"]);
    expect(details?.matches).toEqual([{ repo: "alice/zotero-paper-sidebar" }]);
  });

  test("an entry of the same owner with the same name is not named", () => {
    expect(holdDetails({ ...facts, repo: "alice/other" }, ["name-match"])?.matches).toEqual([]);
  });

  test("an entry whose repo the handoff would refuse counts as a further match", () => {
    const refused = [
      { owner: "a b", repoPart: "c", name: "Paper Sidebar" },
      { owner: "a", repoPart: "c".repeat(199), name: "Paper Sidebar" },
    ];
    const details = holdDetails({ ...facts, indexed: [...refused, ...INDEXED] }, ["name-match"]);
    expect(details?.matches).toEqual([{ repo: "alice/zotero-paper-sidebar", name: "Paper Sidebar" }]);
    expect(details?.moreMatches).toBe(2);
  });

  test("a long matched name is cut to 100 characters after its outer spaces go, and a blank one is left out", () => {
    const emoji = String.fromCodePoint(0x1f600);
    const entry = (name: string) => [{ owner: "alice", repoPart: "zotero-tagger", name }];
    expect(holdDetails({ ...facts, indexed: entry(emoji.repeat(101)) }, ["name-match"])?.matches?.[0].name).toBe(emoji.repeat(100));
    expect(holdDetails({ ...facts, indexed: entry(`${" ".repeat(100)}x`) }, ["name-match"])?.matches?.[0].name).toBe("x");
    expect(holdDetails({ ...facts, indexed: entry("  ") }, ["name-match"])?.matches).toEqual([{ repo: "alice/zotero-tagger" }]);
  });

  test.each<[string, Parameters<typeof holdDetails>[1], object]>([
    ["name-match", ["name-match"], { matches: [{ repo: "alice/zotero-paper-sidebar", name: "Paper Sidebar" }], ownerCreatedOn: "2026-10-19" }],
    ["new-account", ["new-account"], { ownerCreatedOn: "2026-10-19" }],
    ["update-host, with its port", ["update-host"], { updateHost: "updates.example.org:8443", ownerCreatedOn: "2026-10-19" }],
    ["issue-no-topic", ["issue-no-topic"], { ownerCreatedOn: "2026-10-19" }],
  ])("%s gives its facts and the account day", (_name, reasons, expected) => {
    expect(holdDetails(facts, reasons)).toEqual(expected);
  });

  test("owner-unread gives no account day", () => {
    expect(holdDetails({ ...facts, ownerCreatedAt: undefined }, ["owner-unread"])).toEqual({});
  });

  test("an entry with no hold has no details", () => {
    expect(holdDetails(facts, [])).toBeUndefined();
  });

  test("replaces-entry gives both repos' facts and leaves out what the bot could not read", () => {
    const replaced = { repo: "carol/copy", listed: { stars: 2, releasedOn: "none" }, own: { createdAt: new Date("2025-01-10T09:00:00Z"), stars: 300, releasedOn: "2026-03-01" } };
    expect(holdDetails({ ...facts, replaced }, ["replaces-entry"])).toEqual({
      repoCreatedOn: "2025-01-10",
      repoStars: 300,
      repoReleasedOn: "2026-03-01",
      listed: { repo: "carol/copy", stars: 2, releasedOn: "none" },
      ownerCreatedOn: expect.any(String),
    });
  });
});
