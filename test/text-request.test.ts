import { spawnSync } from "node:child_process";
import { chmodSync, cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import { parseTextRequest, TEXT_REQUEST_LABELS } from "../src/text-request/parse.ts";
import { type RequestOptions, textRequest } from "../src/text-request/request.ts";
import { DESCRIPTION_MAX, DESCRIPTION_MIN_WORDS, DESCRIPTION_SHOWN, NAME_MAX, NAME_MIN, textProblems } from "../src/text-request/rules.ts";
import { fixtureFetch, type Responses } from "./support/fixture-fetch.ts";

const ROOT = resolve(import.meta.dirname, "..");

const GOOD = "Adds citation counts to each item in your library.";
const words = (count: number) => Array.from({ length: count }, (_, i) => `word${i}`).join(" ");

const body = (plugin: string, field: string, text: string) =>
  `### ${TEXT_REQUEST_LABELS.plugin}\n\n${plugin}\n\n### ${TEXT_REQUEST_LABELS.field}\n\n${field}\n\n### ${TEXT_REQUEST_LABELS.text}\n\n${text}\n`;

describe("the text-change form", () => {
  const form = readFileSync(resolve(ROOT, ".github/ISSUE_TEMPLATE/text-change.yml"), "utf8");

  test("has the label, the inputs, and the headings that parseTextRequest reads", () => {
    expect(form).toMatch(/^labels: \["text-change"\]$/m);
    const inputs = form.split(/^ {2}- type: (?:input|dropdown)$/m).slice(1);
    expect(inputs.map((block) => block.match(/^ {4}id: (\w+)$/m)?.[1])).toEqual(["plugin", "field", "text"]);
    for (const block of inputs) {
      const id = block.match(/^ {4}id: (\w+)$/m)![1] as keyof typeof TEXT_REQUEST_LABELS;
      expect(block).toMatch(new RegExp(`^ {6}label: ${TEXT_REQUEST_LABELS[id]}$`, "m"));
      expect(block).toMatch(new RegExp(`^ {6}required: ${id !== "text"}$`, "m"));
    }
    expect(inputs[1]).toMatch(/options:\n {8}- name\n {8}- description\n/);
  });

  test("states the owner, the upstream edit, the blank text, the language, the format, and each limit", () => {
    const text = form.replace(/\s+/g, " ");
    for (const words of [
      "The repository's owner files this form.",
      "Edit the plugin's manifest or GitHub About text upstream first.",
      "leave the new text blank",
      "Write in English",
      "one or two plain sentences that say what the plugin does",
      `A name has ${NAME_MIN} to ${NAME_MAX} characters`,
      `at least ${DESCRIPTION_MIN_WORDS} words and at most ${DESCRIPTION_MAX} characters`,
      `the first ${DESCRIPTION_SHOWN} characters`,
    ]) {
      expect(text).toContain(words);
    }
  });
});

describe("parseTextRequest", () => {
  test("reads the three values", () => {
    expect(parseTextRequest(body("a@example.org", "description", GOOD))).toEqual({ ok: true, request: { plugin: "a@example.org", field: "description", text: GOOD } });
  });

  test("reads an empty input as a blank text", () => {
    expect(parseTextRequest(body("a@example.org", "name", "_No response_"))).toEqual({ ok: true, request: { plugin: "a@example.org", field: "name", text: "" } });
  });

  test("keeps every line under a heading, so a line break reaches the rules", () => {
    const result = parseTextRequest(body("a@example.org", "description", "First line\r\nSecond line").replaceAll("\n\n", "\r\n\r\n"));
    expect(result).toMatchObject({ ok: true, request: { text: "First line\nSecond line" } });
  });

  test("fails with no heading", () => {
    const result = parseTextRequest(body("a@example.org", "name", "New").replace("### Field", "### Other"));
    expect(result).toEqual({ ok: false, failure: "missing-heading", message: 'the issue body has no "### Field" heading' });
  });

  test("fails on a heading that a hidden comment repeats", () => {
    const result = parseTextRequest(`<!--\n### Plugin id\nother@example.org\n-->\n${body("a@example.org", "name", "New")}`);
    expect(result).toEqual({ ok: false, failure: "duplicate-heading", message: 'the issue body has more than one "### Plugin id" heading' });
  });

  test("ends a value at a heading with a space before it", () => {
    const result = parseTextRequest(body("a@example.org", "name", "New").replace("### New text", " ### New text"));
    expect(result).toMatchObject({ ok: true, request: { field: "name", text: "New" } });
  });

  test("fails on another field", () => {
    expect(parseTextRequest(body("a@example.org", "homepage", "New"))).toMatchObject({ ok: false, failure: "bad-field" });
  });
});

describe("textProblems", () => {
  test.each([
    ["description", GOOD],
    ["description", `  ${GOOD}  `],
    ["description", words(DESCRIPTION_MIN_WORDS)],
    ["description", `${words(6)} ${"x".repeat(DESCRIPTION_MAX - words(6).length - 1)}`],
    ["name", "ab"],
    ["name", "x".repeat(NAME_MAX)],
    ["name", "9 Lives"],
    ["name", "Счётчик цитат"],
  ] as const)("finds no problem in the %s %j", (field, text) => {
    expect(textProblems(field, text, "Other")).toEqual([]);
  });

  test.each([
    ["description", words(DESCRIPTION_MIN_WORDS - 1), "too-short"],
    ["description", `${words(6)} ${"x".repeat(DESCRIPTION_MAX)}`, "too-long"],
    ["description", `${GOOD}\nSecond line.`, "format-character"],
    ["description", `${GOOD} ‮txt`, "format-character"],
    ["description", `${GOOD} Second line.`, "format-character"],
    ["description", `${GOOD} Second line.`, "format-character"],
    ["description", `${GOOD} See HTTPS://example.org`, "url"],
    ["description", `${GOOD} See http://example.org`, "url"],
    ["description", `${GOOD} See WWW.example.org`, "url"],
    ["description", `${GOOD} <b>`, "angle-bracket"],
    ["description", "为每个条目添加引用次数和 two more English words here", "cjk"],
    ["description", "Citation Counter for Zotero plugin add on", "repeats-name"],
    ["name", "x".repeat(NAME_MIN - 1), "too-short"],
    ["name", "x".repeat(NAME_MAX + 1), "too-long"],
    ["name", "Two\nlines", "format-character"],
    ["name", "www.example.org", "url"],
    ["name", "Best <3", "angle-bracket"],
    ["name", "!AAA first", "first-character"],
    ["name", "引用计数", "cjk"],
  ] as const)("finds in the %s %j the problem %s", (field, text, problem) => {
    expect(textProblems(field, text, "Citation Counter")).toEqual([problem]);
  });

  test("counts code points, so characters outside the basic plane count once", () => {
    expect(textProblems("name", `x${"😀".repeat(NAME_MAX - 1)}`, "Other")).toEqual([]);
  });

  test("names each rule that a text breaks", () => {
    expect(textProblems("description", "<a> http://x", "Other")).toEqual(["too-short", "url", "angle-bracket"]);
  });
});

const ID = "first-plugin@example.org";
const { generatedAt } = JSON.parse(readFileSync(resolve(ROOT, "test/fixtures/site/plugins.json"), "utf8")) as { generatedAt: string };
const ISSUE_URL = "https://api.github.com/repos/jmgirard/zotero-plugin-index/issues/7";
const REPO_URL = "https://api.github.com/repos/example/first-plugin";
const temps: string[] = [];
afterEach(() => {
  for (const dir of temps.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function checkout(changeData?: (plugins: { id: string; upstream?: Record<string, unknown> }[]) => void) {
  const dir = mkdtempSync(join(tmpdir(), "zpi-text-"));
  temps.push(dir);
  const root = join(dir, "plugins");
  cpSync(resolve(ROOT, "test/fixtures/check/valid"), root, { recursive: true });
  const data = JSON.parse(readFileSync(resolve(ROOT, "test/fixtures/site/plugins.json"), "utf8"));
  changeData?.(data.plugins);
  const dataPath = join(dir, "plugins.json");
  writeFileSync(dataPath, JSON.stringify(data));
  const indexPath = join(root, ID, "index.json");
  return { root, dataPath, indexPath, overrides: (overrides: unknown[]) => writeFileSync(indexPath, `${JSON.stringify({ schemaVersion: 1, overrides }, null, 2)}\n`) };
}

function responses({ text = GOOD, field = "description", plugin = ID, author = "EXAMPLE", ownerType = "User" } = {}): Responses {
  return {
    [ISSUE_URL]: { json: { body: body(plugin, field, text), labels: [{ name: "text-change" }], state: "open", user: { login: author } } },
    [REPO_URL]: { json: { owner: { login: "example", type: ownerType } } },
  };
}

function run(tree: ReturnType<typeof checkout>, answers: Responses, extra: Partial<RequestOptions> = {}) {
  return textRequest({ root: tree.root, dataPath: tree.dataPath, fetch: fixtureFetch(answers).fetch, indexRepo: "jmgirard/zotero-plugin-index", issue: 7, ...extra });
}

describe("textRequest's report", () => {
  test("prints the facts and exits 0 for a good text from the owner, ignoring letter case", async () => {
    const text = "Keeps a plain list of every item here.";
    const result = await run(checkout(), responses({ text }));
    expect(result).toEqual({
      status: 0,
      lines: [`plugin: "${ID}"`, 'field: "description"', `text: "${text}"`, 'author: "EXAMPLE"', 'owner: "example"', "author-matches-owner: true", `data-generated: "${generatedAt}"`],
    });
  });

  test("prints the override that a request replaces or removes", async () => {
    const tree = checkout();
    tree.overrides([{ field: "description", value: "The index's text.", reason: "Test." }]);
    expect((await run(tree, responses())).lines).toContain(`replaces-override: "The index's text."`);
    expect((await run(tree, responses({ text: "" }))).lines).toContain(`removes-override: "The index's text."`);
  });

  test("notes a plugin with no read in the data file", async () => {
    const tree = checkout((plugins) => {
      const record = plugins.find(({ id }) => id === ID)! as { upstream?: unknown; failure?: unknown };
      delete record.upstream;
      record.failure = { name: "no-xpi-release", message: "no release has an .xpi asset" };
    });
    expect((await run(tree, responses())).lines).toContain("not-read: the data file has no read of this plugin, so an override shows only after a read succeeds");
  });

  test("prints the gap that a new name leaves, when the description only repeats it", async () => {
    const tree = checkout((plugins) => {
      const { upstream } = plugins.find(({ id }) => id === ID)!;
      upstream!.description = "Citation counts tool items here today";
      delete upstream!.repoDescription;
    });
    const result = await run(tree, responses({ field: "name", text: "Citation Counts Tool Items Here Today" }));
    expect(result.lines).toContain("description-gap: missing");
  });

  test("prints a mismatch and exits 1", async () => {
    const result = await run(checkout(), responses({ author: "someone" }));
    expect(result.status).toBe(1);
    expect(result.lines).toContain("author-matches-owner: false");
  });

  test("says to check an organization's author by hand and exits 1", async () => {
    const result = await run(checkout(), responses({ author: "example", ownerType: "Organization" }));
    expect(result.status).toBe(1);
    expect(result.lines).toContain("owner-check: the owner is an organization, so check the author by hand");
  });

  test("prints each problem and exits 1", async () => {
    const result = await run(checkout(), responses({ text: "Too short <b>" }));
    expect(result.status).toBe(1);
    expect(result.lines.filter((line) => line.startsWith("problem: "))).toEqual(["problem: too-short", "problem: angle-bracket"]);
  });

  test("escapes control and format characters in the text it prints", async () => {
    const result = await run(checkout(), responses({ text: `${GOOD}‮​\nSecond` }));
    expect(result.lines).toContain(`text: "${GOOD}\\u{202e}\\u{200b}\\nSecond"`);
    expect(result.lines).toContain("problem: format-character");
  });

  test("prints a name that another plugin shows, and does not refuse it", async () => {
    const result = await run(checkout(), responses({ field: "name", text: "First-Plugin" }));
    expect(result.status).toBe(0);
    expect(result.lines).toContain('name-match: "same-name-plugin@example.org" "First Plugin"');
  });

  test("finds no name match for a name with no Latin letters or digits", async () => {
    const result = await run(checkout((plugins) => (plugins[3]!.upstream!.name = "Другое")), responses({ field: "name", text: "Счётчик" }));
    expect(result.lines.filter((line) => line.startsWith("name-match: "))).toEqual([]);
  });

  test("prints the categories that the request adds", async () => {
    const result = await run(checkout(), responses({ text: "Translates the titles of items into English." }));
    expect(result.lines).toContain('adds-category: "translation"');
  });

  test("leaves out a category that the checkout's override already gives", async () => {
    const tree = checkout();
    tree.overrides([{ field: "description", value: "Translates the titles of items into French.", reason: "Test." }]);
    const result = await run(tree, responses({ text: "Translates the titles of items into English." }));
    expect(result.lines.filter((line) => line.startsWith("adds-category: "))).toEqual([]);
  });

  test("prints an override with a version that would still win", async () => {
    const tree = checkout();
    tree.overrides([{ field: "description", version: "1.2.0", value: "Older text.", reason: "Test." }]);
    const result = await run(tree, responses());
    expect(result.lines).toContain('version-override-wins: "1.2.0" "Older text."');
  });

  test.each([
    ["Notes", "short"],
    ["A plugin for the site tests.", "none"],
  ])("prints the gap that a blank text leaves over the upstream text %j", async (description, gap) => {
    const tree = checkout((plugins) => {
      const { upstream } = plugins.find(({ id }) => id === ID)!;
      upstream!.description = description;
      delete upstream!.repoDescription;
    });
    tree.overrides([{ field: "description", value: "The index's text for this plugin.", reason: "Test." }]);
    const result = await run(tree, responses({ text: "_No response_" }));
    expect(result.status).toBe(0);
    expect(result.lines).toContain(`description-gap: ${gap}`);
  });

  test.each<[string, Responses, string]>([
    ["unknown-plugin", responses({ plugin: "other@example.org" }), "unknown-plugin"],
    ["no-entry", responses({ plugin: "old-plugin@example.org" }), "no-entry"],
    ["no label", { ...responses(), [ISSUE_URL]: { json: { body: body(ID, "name", "New"), labels: [{ name: "report" }], state: "open", user: { login: "example" } } } }, "no-text-change-label"],
    ["a closed issue", { ...responses(), [ISSUE_URL]: { json: { body: body(ID, "name", "New"), labels: ["text-change"], state: "closed", user: { login: "example" } } } }, "issue-not-open"],
    ["another field", responses({ field: "homepage" }), "bad-field"],
    ["a missing heading", { ...responses(), [ISSUE_URL]: { json: { body: "No form here", labels: ["text-change"], state: "open", user: { login: "example" } } } }, "missing-heading"],
    ["a failed issue read", { ...responses(), [ISSUE_URL]: { status: 500, text: "{}" } }, "issue-read-failed"],
    ["an issue with no author", { ...responses(), [ISSUE_URL]: { json: { body: body(ID, "name", "New"), labels: ["text-change"], user: null } } }, "issue-read-failed"],
    ["a failed owner read", { ...responses(), [REPO_URL]: { status: 404, text: "{}" } }, "owner-read-failed"],
    ["an answer with no owner", { ...responses(), [REPO_URL]: { json: {} } }, "owner-read-failed"],
  ])("fails with exit 2 on %s", async (_name, answers, failure) => {
    const result = await run(checkout(), answers);
    expect(result.status).toBe(2);
    expect(result.lines).toHaveLength(1);
    expect(result.lines[0]).toMatch(new RegExp(`^failure: ${failure}: `));
  });

  test("fails with exit 2 on an unreadable data file", async () => {
    const tree = checkout();
    const result = await run({ ...tree, dataPath: `${tree.dataPath}.missing` }, responses());
    expect(result.status).toBe(2);
    expect(result.lines[0]).toMatch(/^failure: data-unreadable: /);
  });

  test("fails with exit 2 on an entry whose index.json is not valid", async () => {
    const tree = checkout();
    writeFileSync(tree.indexPath, "not JSON");
    const result = await run(tree, responses());
    expect(result.status).toBe(2);
    expect(result.lines[0]).toMatch(/^failure: entry-not-json: /);
  });

  test("fails with exit 2 when the entry's repo URL is not on GitHub", async () => {
    const tree = checkout();
    const meta = join(tree.root, ID, "meta.json");
    writeFileSync(meta, JSON.stringify({ ...JSON.parse(readFileSync(meta, "utf8")), repoUrl: "https://gitlab.com/example/first-plugin" }));
    const result = await run(tree, responses());
    expect(result.status).toBe(2);
    expect(result.lines[0]).toMatch(/^failure: owner-read-failed: .*not a GitHub repo URL/);
  });
});

describe("textRequest with apply", () => {
  const entry = (tree: ReturnType<typeof checkout>) => JSON.parse(readFileSync(tree.indexPath, "utf8"));
  const OWNER_TEXT = { field: "description", value: GOOD, reason: "The repository's owner asked for this text in issue #7." };
  const OTHERS = [
    { field: "description", version: "1.0.0", value: "For one release.", reason: "Test." },
    { field: "homepage", value: "https://example.org", reason: "Test." },
  ];
  const check = (root: string) => spawnSync(process.env.npm_execpath!, ["--silent", "check", root], { encoding: "utf8", cwd: ROOT, timeout: 50_000 });

  test("adds an override with no version, and the entry passes the check", async () => {
    const tree = checkout();
    const result = await run(tree, responses(), { apply: true });
    expect(result.status).toBe(0);
    expect(result.lines.at(-1)).toMatch(/^wrote: /);
    expect(entry(tree)).toEqual({ schemaVersion: 1, overrides: [OWNER_TEXT] });
    expect(check(tree.root).status).toBe(0);
  });

  test("replaces the override with no version, and leaves others as they are", async () => {
    const tree = checkout();
    tree.overrides([OTHERS[0], { field: "description", value: "The index's text.", reason: "Test." }, OTHERS[1]]);
    await run(tree, responses(), { apply: true });
    expect(entry(tree).overrides).toEqual([OTHERS[0], OWNER_TEXT, OTHERS[1]]);
    expect(check(tree.root).status).toBe(0);
  });

  test("removes the override with no version on a blank text, and leaves others as they are", async () => {
    const tree = checkout();
    tree.overrides([OTHERS[0], { field: "description", value: "The index's text.", reason: "Test." }, OTHERS[1]]);
    await run(tree, responses({ text: "" }), { apply: true });
    expect(entry(tree).overrides).toEqual(OTHERS);
    expect(check(tree.root).status).toBe(0);
  });

  test("leaves no overrides key after removing the last override", async () => {
    const tree = checkout();
    tree.overrides([{ field: "name", value: "Other Name", reason: "Test." }]);
    await run(tree, responses({ field: "name", text: "_No response_" }), { apply: true });
    expect(entry(tree)).toEqual({ schemaVersion: 1 });
    expect(check(tree.root).status).toBe(0);
  });

  test("changes nothing on a blank text with no such override", async () => {
    const tree = checkout();
    tree.overrides(OTHERS);
    const before = readFileSync(tree.indexPath, "utf8");
    const result = await run(tree, responses({ text: "" }), { apply: true });
    expect(result.status).toBe(0);
    expect(result.lines.at(-1)).toBe("wrote nothing: the entry has no such override to remove");
    expect(readFileSync(tree.indexPath, "utf8")).toBe(before);
  });

  test.each<[string, ReturnType<typeof responses>, string]>([
    ["a problem", responses({ text: "Too short" }), "wrote nothing: the text breaks a rule"],
    ["a mismatch", responses({ author: "someone" }), "wrote nothing: check the author, then use --owner-checked"],
    ["an organization owner", responses({ ownerType: "Organization" }), "wrote nothing: check the author, then use --owner-checked"],
  ])("writes nothing on %s", async (_name, answers, line) => {
    const tree = checkout();
    const before = readFileSync(tree.indexPath, "utf8");
    const result = await run(tree, answers, { apply: true });
    expect(result.status).toBe(1);
    expect(result.lines.at(-1)).toBe(line);
    expect(readFileSync(tree.indexPath, "utf8")).toBe(before);
  });

  test("writes nothing on a named failure", async () => {
    const tree = checkout();
    const before = readFileSync(tree.indexPath, "utf8");
    const result = await run(tree, responses({ field: "homepage" }), { apply: true, ownerChecked: true });
    expect(result.status).toBe(2);
    expect(readFileSync(tree.indexPath, "utf8")).toBe(before);
  });

  test("writes past a mismatch or an organization owner with ownerChecked, but never past a problem", async () => {
    for (const answers of [responses({ author: "someone" }), responses({ ownerType: "Organization" })]) {
      const tree = checkout();
      const result = await run(tree, answers, { apply: true, ownerChecked: true });
      expect(result.status).toBe(0);
      expect(entry(tree).overrides).toEqual([OWNER_TEXT]);
    }
    const tree = checkout();
    const result = await run(tree, responses({ text: "Too short" }), { apply: true, ownerChecked: true });
    expect(result.status).toBe(1);
    expect(entry(tree).overrides).toBeUndefined();
  });

  test("fails with exit 2 when it cannot write", async () => {
    const tree = checkout();
    chmodSync(tree.indexPath, 0o444);
    const result = await run(tree, responses(), { apply: true });
    expect(result.status).toBe(2);
    expect(result.lines[0]).toMatch(/^failure: write-failed: /);
  });
});

describe("pnpm text-request", () => {
  test.each([[[]], [["7"]], [["x", "--data", "f"]], [["7", "--data"]], [["7", "--data", "f", "--other"]], [["7", "--data", "f", "--owner-checked"]]])(
    "prints the usage and exits 2 for the arguments %j",
    (args) => {
      const result = spawnSync(process.execPath, [resolve(ROOT, "src/text-request/cli.ts"), ...args], { encoding: "utf8", cwd: ROOT });
      expect(result.status).toBe(2);
      expect(result.stderr).toContain("usage: pnpm text-request <issue> --data <file>");
    },
  );
});
