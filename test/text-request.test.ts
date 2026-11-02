import { describe, expect, test } from "vitest";
import { DESCRIPTION_MAX, DESCRIPTION_MIN_WORDS, NAME_MAX, NAME_MIN, textProblems } from "../src/text-request/rules.ts";

const GOOD = "Adds citation counts to each item in your library.";
const words = (count: number) => Array.from({ length: count }, (_, i) => `word${i}`).join(" ");

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
