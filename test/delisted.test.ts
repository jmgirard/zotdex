import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, describe, expect, test } from "vitest";
import { delistedPath, readDelisted } from "../src/check/delisted.ts";

const ROOT = resolve(import.meta.dirname, "..");

const temps: string[] = [];
afterAll(() => {
  for (const dir of temps.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function tempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "zpi-delisted-"));
  temps.push(dir);
  return dir;
}

function addEntry(root: string, id: string, repoUrl: string) {
  mkdirSync(join(root, id));
  writeFileSync(
    join(root, id, "meta.json"),
    JSON.stringify({ id, name: "A plugin", description: "A plugin for a test.", repoUrl, updateUrl: "https://example.org/update.json" }),
  );
  writeFileSync(join(root, id, "index.json"), JSON.stringify({ schemaVersion: 1 }));
}

function listFile(text: string): string {
  const path = join(tempDir(), "list.json");
  writeFileSync(path, text);
  return path;
}

// The command runs from another directory than the list, as the bot's checks of temporary directories do.
function check(dir: string, list: string) {
  const pnpm = process.env.npm_execpath;
  if (!pnpm) throw new Error("run the tests with `pnpm test`, so they can call `pnpm check`");
  const { INIT_CWD: _outer, ...env } = process.env;
  const result = spawnSync(pnpm, ["--silent", "--dir", ROOT, "check", dir], { encoding: "utf8", env: { ...env, ZPI_DELISTED: list }, timeout: 50_000 });
  const lines = result.stdout.split("\n").filter((line) => line.includes(": ") && !line.startsWith("checked "));
  return { status: result.status, findings: lines.map((line) => line.split(": ").slice(0, 2)) };
}

const LIST = JSON.stringify([{ repo: "example/removed", ids: ["removed@example.org"], issue: 5, date: "2026-11-04" }]);

describe("the remove-plugin form", () => {
  const form = readFileSync(resolve(ROOT, ".github/ISSUE_TEMPLATE/remove-plugin.yml"), "utf8");

  test("has the label, the required inputs, the plugin id that a link fills in, and the four reasons", () => {
    expect(form).toMatch(/^labels: \["remove-plugin"\]$/m);
    const inputs = form.split(/^ {2}- type: (?:input|dropdown|textarea)$/m).slice(1);
    expect(inputs.map((block) => block.match(/^ {4}id: (\w+)$/m)?.[1])).toEqual(["plugin", "reason", "evidence"]);
    for (const block of inputs) expect(block).toMatch(/^ {6}required: true$/m);
    expect(inputs[1]).toContain(
      [
        "- I own this plugin's repository",
        "- It is spam",
        "- It misleads people about what it is or who makes it",
        "- It does harm, and I can show it",
      ].join("\n        "),
    );
  });

  test("says that the issue is public and that a claim with no evidence removes nothing", () => {
    const text = form.replace(/\s+/g, " ");
    expect(text).toContain("This issue is public.");
    expect(text).toContain("A claim with no evidence removes nothing.");
  });
});

describe("delisted.json in pnpm check", () => {
  test("names a listed id in another letter case and a listed repo in mixed case with .git, and passes other entries", () => {
    const dir = tempDir();
    addEntry(dir, "Removed@Example.org", "https://github.com/example/kept-id");
    addEntry(dir, "moved@example.org", "https://github.com/Example/REMOVED.git");
    addEntry(dir, "kept@example.org", "https://github.com/example/kept");
    addEntry(dir, "other-host@example.org", "https://gitlab.com/example/removed");
    const { status, findings } = check(dir, listFile(LIST));
    expect(status).toBe(1);
    expect(findings.filter(([, rule]) => rule.startsWith("delisted-"))).toEqual([
      ["Removed@Example.org", "delisted-id"],
      ["moved@example.org", "delisted-repo"],
    ]);
    expect(findings.map(([entry]) => entry)).not.toContain("kept@example.org");
  });

  test.each([
    ["is not JSON", "not json"],
    ["is not a list", "{}"],
    ["has a repo in upper case", JSON.stringify([{ repo: "Example/Removed", ids: [], issue: 5, date: "2026-11-04" }])],
    ["has a record with no issue", JSON.stringify([{ repo: "example/removed", ids: [], date: "2026-11-04" }])],
  ])("names the file when it %s", (_name, text) => {
    const dir = tempDir();
    addEntry(dir, "kept@example.org", "https://github.com/example/kept");
    const { status, findings } = check(dir, listFile(text));
    expect(status).toBe(1);
    expect(findings).toEqual([["delisted.json", "delisted-file"]]);
  });

  test("names the file when it is missing", () => {
    const { status, findings } = check(tempDir(), join(tempDir(), "missing.json"));
    expect(status).toBe(1);
    expect(findings).toEqual([["delisted.json", "delisted-file"]]);
  });

  test("reads the package root's committed list when no variable names another", async () => {
    const { ZPI_DELISTED: saved } = process.env;
    delete process.env.ZPI_DELISTED;
    try {
      expect(delistedPath()).toBe(join(ROOT, "delisted.json"));
      await expect(readDelisted()).resolves.toMatchObject({ repos: expect.any(Map), ids: expect.any(Map) });
    } finally {
      if (saved !== undefined) process.env.ZPI_DELISTED = saved;
    }
  });
});
