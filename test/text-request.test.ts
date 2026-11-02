import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";
import { parseTextRequest, TEXT_REQUEST_LABELS } from "../src/text-request/parse.ts";
import { DESCRIPTION_MAX, DESCRIPTION_MIN_WORDS, DESCRIPTION_SHOWN, NAME_MAX, NAME_MIN, textProblems } from "../src/text-request/rules.ts";

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
    expect(parseTextRequest(body("a@example.org", "name", "New")).ok).toBe(true);
  });

  test("reads an empty input as a blank text", () => {
    expect(parseTextRequest(body("a@example.org", "name", "_No response_"))).toEqual({ ok: true, request: { plugin: "a@example.org", field: "name", text: "" } });
  });

  test("keeps every line under a heading, so a line break reaches the rules", () => {
    const result = parseTextRequest(body("a@example.org", "description", "First line\r\nSecond line").replaceAll("\n\n", "\r\n\r\n"));
    expect(result).toMatchObject({ ok: true, request: { text: "First line\nSecond line" } });
  });

  test.each(["Plugin id", "Field", "New text"])("fails with no %s heading", (label) => {
    const result = parseTextRequest(body("a@example.org", "name", "New").replace(`### ${label}`, "### Other"));
    expect(result).toEqual({ ok: false, failure: "missing-heading", message: `the issue body has no "### ${label}" heading` });
  });

  test.each(["homepage", "", "name\nand more"])("fails on the field %j", (field) => {
    expect(parseTextRequest(body("a@example.org", field, "New"))).toMatchObject({ ok: false, failure: "bad-field" });
  });
});

describe("textProblems", () => {
  test.each([
    ["description", GOOD],
    ["description", `  ${GOOD}  `],
    ["description", words(DESCRIPTION_MIN_WORDS)],
    ["description", `${words(6)} ${"x".repeat(DESCRIPTION_MAX - words(6).length - 1)}`],
    ["name", "ab"],
    ["name", "Citation Counter"],
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
    expect(textProblems("name", "😀".repeat(NAME_MAX - 1) + "x", "Other")).toEqual(["first-character"]);
    expect(textProblems("name", `x${"😀".repeat(NAME_MAX - 1)}`, "Other")).toEqual([]);
  });

  test("names each rule that a text breaks", () => {
    expect(textProblems("description", "<a> http://x", "Other")).toEqual(["too-short", "url", "angle-bracket"]);
  });
});
