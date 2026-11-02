import { describe, expect, test } from "vitest";
import { holdsSource, readSourceFacts } from "../src/build/source.ts";
import { fixtureFetch } from "./support/fixture-fetch.ts";

describe("holdsSource", () => {
  test.each<[string, string[]]>([
    ["no names", []],
    ["a dotfile and a dot-folder", [".gitignore", ".github"]],
    ["a README stem", ["README"]],
    ["a README with an extension no other test names", ["README.rst"]],
    ["license stems", ["LICENSE", "LICENCE.rst", "COPYING"]],
    ["other project file stems", ["NOTICE", "CHANGELOG", "CHANGES.rst"]],
    ["an XPI", ["plugin-1.0.xpi"]],
    ["Markdown and text", ["guide.md", "notes.txt"]],
    ["an update.rdf", ["update.rdf"]],
    ["images", ["a.png", "b.jpg", "c.jpeg", "d.gif", "e.svg", "f.webp"]],
    ["update files", ["update.json", "updates.json", "update-beta.json"]],
    ["doc and image folders", ["docs", "doc", "images", "image", "img", "assets", "screenshots"]],
    ["build and release folders", ["dist", "build", "releases", "update", "updates"]],
    ["upper-case names", [".GITHUB", "ReadMe.MD", "PLUGIN.XPI", "UPDATE.JSON", "DOCS"]],
    ["a release repo", [".github", "README.md", "zotero-magic-for-user.xpi"]],
  ])("no source: %s", (_, names) => {
    expect(holdsSource(names)).toBe(false);
  });

  test.each<[string, string[]]>([
    ["one source file beside non-source names", [".github", "README.md", "plugin.xpi", "bootstrap.js"]],
    ["a source folder", ["README.md", "src"]],
    ["a JSON file that is not an update file", ["README.md", "package.json"]],
    ["a name that only starts with a folder's name", ["docs-site"]],
    ["a name that only starts with a license stem", ["LICENSE-MIT"]],
    ["a repo with source", [".eslintrc.json", ".github", ".gitignore", "README.md", "bootstrap.ts", "client", "esbuild.js", "gen", "images", "lib.ts", "package-lock.json", "package.json", "schema", "tsconfig.json"]],
  ])("source: %s", (_, names) => {
    expect(holdsSource(names)).toBe(true);
  });
});

describe("readSourceFacts", () => {
  const GRAPHQL = "POST https://api.github.com/graphql";
  const urls = Array.from({ length: 41 }, (_, i) => `https://github.com/alice/repo-${i}`);
  const page = (count: number) => ({ json: { data: Object.fromEntries(Array.from({ length: count }, (_, i) => [`r${i}`, { object: { entries: [{ name: "src" }] } }])) } });

  test("reads 41 repos in two requests", async () => {
    const { fetch, requests } = fixtureFetch({ [`${GRAPHQL} #1`]: page(40), [`${GRAPHQL} #2`]: page(1) });
    const { facts, problem } = await readSourceFacts(fetch, urls);
    expect(requests).toHaveLength(2);
    expect(facts.size).toBe(41);
    expect(problem).toBeUndefined();
  });

  test("keeps the first batch when the second request fails", async () => {
    const { fetch } = fixtureFetch({ [`${GRAPHQL} #1`]: page(40), [`${GRAPHQL} #2`]: { status: 502, text: "Bad Gateway" } });
    const { facts, problem } = await readSourceFacts(fetch, urls);
    expect(facts.size).toBe(40);
    expect(problem).toBe("1 of 41 repos stay unread: POST https://api.github.com/graphql returned HTTP 502");
  });

  test("asks once for a repo that two entries name", async () => {
    const { fetch, requests } = fixtureFetch({ [GRAPHQL]: page(1) });
    const { facts, problem } = await readSourceFacts(fetch, [urls[0]!, urls[0]!]);
    expect(requests).toHaveLength(1);
    expect(facts.size).toBe(1);
    expect(problem).toBeUndefined();
  });

  test("names GitHub's message when an answer leaves a repo out", async () => {
    const { fetch } = fixtureFetch({ [GRAPHQL]: { json: { data: { r0: { object: { entries: [{ name: "src" }] } }, r1: null }, errors: [{ message: "Could not resolve to a Repository" }] } } });
    expect((await readSourceFacts(fetch, urls.slice(0, 2))).problem).toBe("GitHub gave no top-level names for 1 of 2 repos: Could not resolve to a Repository");
  });

  test("sends no request for no repos", async () => {
    const { fetch, requests } = fixtureFetch({});
    expect(await readSourceFacts(fetch, [])).toEqual({ facts: new Map() });
    expect(requests).toHaveLength(0);
  });
});
