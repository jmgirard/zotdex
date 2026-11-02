import { resolve } from "node:path";
import { describe, expect, test } from "vitest";
import { type Written, body, DETAILS_HEADING } from "../src/discover/propose.ts";
import { refreshHolds, withDetailLines } from "../src/discover/refresh-holds.ts";
import { fixtureFetch, type Responses } from "./support/fixture-fetch.ts";

// Three entries, one of them "Second Plugin" from example/second-plugin.
const PLUGINS = resolve(import.meta.dirname, "fixtures/build/plugins");
const INDEX = "https://api.github.com/repos/example/index";
const LIST = `${INDEX}/pulls?state=open&per_page=100`;
const PAGE_2 = `${LIST}&page=2`;
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
    ...change,
  };
}

// The files, meta.json, and owner account of pull request n, and the answer to its edit.
function entry(n: number, meta: Record<string, unknown> = {}): Responses {
  const text = JSON.stringify({ id: id(n), name: `Plugin ${n}`, repoUrl: `https://github.com/bob/p${n}`, updateUrl: "https://updates.example.org:8443/update.json", ...meta });
  return {
    [`${INDEX}/pulls/${n}/files?per_page=100`]: {
      json: [
        { filename: `plugins/${id(n)}/index.json`, status: "added" },
        { filename: `plugins/${id(n)}/meta.json`, status: "added" },
      ],
    },
    [`${INDEX}/contents/plugins/${encodeURIComponent(id(n))}/meta.json?ref=${sha(n)}`]: { json: { encoding: "base64", content: Buffer.from(text).toString("base64") } },
    "https://api.github.com/users/bob": { json: { created_at: "2026-10-20T12:00:00Z" } },
    [`PATCH ${INDEX}/pulls/${n}`]: { json: { number: n } },
  };
}

async function run(responses: Responses, apply = true) {
  const { fetch, requests } = fixtureFetch(responses);
  const result = await refreshHolds({ fetch, indexRepo: "example/index", root: PLUGINS, apply });
  const patches = requests.filter(({ method }) => method === "PATCH").map(({ url, body: sent }) => ({ url, sent: JSON.parse(sent!) }));
  return { result, patches, requests };
}

const HOST_LINES = ["- Update host: ` updates.example.org:8443 `", "- Owner's GitHub account created: 2026-10-20"];

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
    expect(refreshed).toContain(`\n\n${DETAILS_HEADING}\n\n${HOST_LINES.join("\n")}\n\n`);
    expect(refreshed.replace(`\n\n${DETAILS_HEADING}\n\n${HOST_LINES.join("\n")}`, "")).toBe(source(1));
    const second = await run({ [LIST]: { json: [pull(1, { body: refreshed })] }, ...entry(1) });
    expect(second.patches).toEqual([]);
    expect(second.result.unchanged).toEqual([1]);
  });

  test("new facts replace the old detail lines", async () => {
    const old = withDetailLines(source(1), ["- Update host: ` old.example.org `", "- Owner's GitHub account created: 2020-01-01"])!;
    const { patches } = await run({ [LIST]: { json: [pull(1, { body: old })] }, ...entry(1) });
    expect(patches[0].sent.body).toBe(withDetailLines(source(1), HOST_LINES));
  });

  test("detail heading text in the quoted check output is not taken for the heading", () => {
    const quoted = body(written(1, ["update-host"]), { status: 1, output: `\n\n${DETAILS_HEADING}\n\n- x\n` });
    const refreshed = withDetailLines(quoted, HOST_LINES)!;
    expect(refreshed).toContain(`\n\n${DETAILS_HEADING}\n\n- x\n`);
    expect(refreshed.replace(`\n\n${DETAILS_HEADING}\n\n${HOST_LINES.join("\n")}`, "")).toBe(quoted);
  });

  test("a name-match names what matches now, and says so when nothing does", async () => {
    const held = (n: number) => pull(n, { body: source(n, ["name-match"]) });
    const { result } = await run({ [LIST]: { json: [held(1), held(2)] }, ...entry(1, { name: "Zotero Second" }), ...entry(2) }, false);
    expect(result.changed.map(({ lines }) => lines[0])).toEqual(["- Matching entry: ` Second Plugin ` [example/second-plugin](https://github.com/example/second-plugin)", "- Matching entries: none now"]);
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

  test("an account read with no date leaves a body that does not say owner-unread", async () => {
    const { result, patches } = await run({ [LIST]: { json: [pull(1)] }, ...entry(1), "https://api.github.com/users/bob": { status: 404, json: {} } });
    expect(result.failed).toEqual([{ number: 1, message: "the read of its owner's account gave no date" }]);
    expect(patches).toEqual([]);
  });

  test("an account read with no date on an owner-unread pull request says that the bot could not read it", async () => {
    const { result } = await run({ [LIST]: { json: [pull(1, { body: source(1, ["owner-unread"]) })] }, ...entry(1), "https://api.github.com/users/bob": { status: 404, json: {} } });
    expect(result.changed).toEqual([{ number: 1, lines: ["- Owner's GitHub account created: the bot could not read the date"] }]);
  });
});
