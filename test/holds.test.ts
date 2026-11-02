import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, describe, expect, test } from "vitest";
import { draftEntry, indexed } from "../src/discover/discover.ts";
import { holdDetails, holdReasons, type IndexedName } from "../src/discover/holds.ts";
import { fixtureFetch, type Responses } from "./support/fixture-fetch.ts";
import { pluginRepo } from "./support/plugin-repo.ts";

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
    const facts = { repo: "Bob/zotero-tagger", updateHost: "BOB.github.io", topics: ["zotero-plugin"], issueRun: false, ownerCreatedAt: new Date(ago(1000)), now: NOW, indexed: [] };
    expect(holdReasons(facts)).toEqual([]);
  });

  test.each(["alice.github.io", "bob.github.io:8443", "sub.bob.github.io", "bob.evil.github.io", "bobx.github.io", "bob-x.github.io", "bob.github.io.example.org", "bob.gitlab.io", "github.io"])(
    "update-host for %s, which is not bob's own site",
    async (updateHost) => {
      expect(await holds("bob/zotero-tagger", pluginRepo("bob/zotero-tagger", "x@example.org", { name: "Tagger", updateHost }))).toEqual(["update-host"]);
    },
  );

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

describe("the hold details", () => {
  const facts = { repo: "bob/zotero-tagger", name: "Paper Sidebar", updateHost: "updates.example.org:8443", ownerCreatedAt: new Date(ago(10)), indexed: INDEXED };

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
});
