import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, describe, expect, test } from "vitest";
import { readSites, type Ruling, type Site, sitesNamedIn, sitesPath } from "../src/check/sites.ts";

const ROOT = resolve(import.meta.dirname, "..");

const temps: string[] = [];
afterAll(() => {
  for (const dir of temps.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function sitesFile(value: unknown): string {
  const dir = mkdtempSync(join(tmpdir(), "zpi-sites-"));
  temps.push(dir);
  const path = join(dir, "sites.json");
  writeFileSync(path, typeof value === "string" ? value : JSON.stringify(value));
  return path;
}

const ruling = (country: string): Ruling => ({ country, court: "A court", date: "2020-01-02", case: "A v. B", kind: "blocking order", url: "https://example.org/ruling" });
const site = (name: string, countries: string[], names = [name]): Site => ({ site: name, names, rulings: countries.map(ruling) });

describe("readSites", () => {
  test("reads the committed file, where each site has rulings from two countries or more", async () => {
    const { ZPI_SITES: saved } = process.env;
    delete process.env.ZPI_SITES;
    try {
      expect(sitesPath()).toBe(join(ROOT, "sites.json"));
      const sites = await readSites();
      expect(sites.map(({ site }) => site)).toEqual(["Sci-Hub", "Anna's Archive"]);
      for (const { rulings } of sites) expect(new Set(rulings.map(({ country }) => country)).size).toBeGreaterThanOrEqual(2);
    } finally {
      if (saved !== undefined) process.env.ZPI_SITES = saved;
    }
  });

  test("takes a site with rulings from two countries", async () => {
    await expect(readSites(sitesFile([site("Example Hub", ["US", "FR"])]))).resolves.toHaveLength(1);
  });

  test.each([
    ["two rulings from one country", [site("Example Hub", ["US", "US"])], "has rulings from 1 country, and needs 2"],
    ["a name with no letter or digit", [site("Example Hub", ["US", "FR"], ["Example Hub", "--"])], 'has the name "--" with no letter a to z or digit'],
    ["two names that match the same texts", [site("Example Hub", ["US", "FR"]), site("Example-Hub", ["IN", "NL"])], 'has the name "Example-Hub", which matches what "Example Hub" matches'],
  ])("refuses %s", async (_name, sites, message) => {
    await expect(readSites(sitesFile(sites))).rejects.toThrow(message);
  });

  test.each([
    ["a ruling kind outside the three", [{ ...site("Example Hub", ["US", "FR"]), rulings: [{ ...ruling("US"), kind: "regulator block" }, ruling("FR")] }], "/0/rulings/0/kind must be equal to one of the allowed values"],
    ["a ruling with no link", [{ ...site("Example Hub", ["US", "FR"]), rulings: [{ ...ruling("US"), url: undefined }, ruling("FR")] }], "/0/rulings/0 must have required property 'url'"],
  ])("refuses %s by the schema", async (_name, sites, message) => {
    await expect(readSites(sitesFile(sites))).rejects.toThrow(message);
  });

  test("refuses a missing file", async () => {
    await expect(readSites(join(tmpdir(), "zpi-no-such-dir", "sites.json"))).rejects.toThrow("cannot read the sites file");
  });
});

describe("sitesNamedIn", () => {
  const sites = [site("Sci-Hub", ["US", "FR"]), site("Anna's Archive", ["NL", "US"])];

  test.each(["Sci-Hub", "sci hub", "SCIHUB", "SciHub", "zotero-scihub", "Sci_Hub mirrors", "Ｓｃｉ－Ｈｕｂ"])("names Sci-Hub in %j", (text) => {
    expect(sitesNamedIn(text, sites).map(({ site }) => site)).toEqual(["Sci-Hub"]);
  });

  test.each(["annas-archive", "Anna’s Archive", "AnnasArchive"])("names Anna's Archive in %j", (text) => {
    expect(sitesNamedIn(text, sites).map(({ site }) => site)).toEqual(["Anna's Archive"]);
  });

  test.each(["SciHubble", "sci-hubs", "basic hub", "Sci-PDF", "Scihubfetcher"])("names no site in the near miss %j", (text) => {
    expect(sitesNamedIn(text, sites)).toEqual([]);
  });
});

describe("sites.json in pnpm check", () => {
  // The command runs from another directory than the file, as the bot's checks of temporary directories do.
  function check(sites: string) {
    const pnpm = process.env.npm_execpath;
    if (!pnpm) throw new Error("run the tests with `pnpm test`, so they can call `pnpm check`");
    const { INIT_CWD: _outer, ...env } = process.env;
    const dir = mkdtempSync(join(tmpdir(), "zpi-sites-entries-"));
    temps.push(dir);
    const result = spawnSync(pnpm, ["--silent", "--dir", ROOT, "check", dir], { encoding: "utf8", env: { ...env, ZPI_SITES: sites }, timeout: 50_000 });
    const lines = result.stdout.split("\n").filter((line) => line.includes(": ") && !line.startsWith("checked "));
    return { status: result.status, findings: lines.map((line) => line.split(": ").slice(0, 2)), stdout: result.stdout };
  }

  test("names the file when a site has rulings from one country", () => {
    const { status, findings, stdout } = check(sitesFile([site("Example Hub", ["US"])]));
    expect(status).toBe(1);
    expect(findings).toEqual([["sites.json", "sites-file"]]);
    expect(stdout).toContain("has rulings from 1 country, and needs 2");
  });

  test("passes a file whose sites each have rulings from two countries", () => {
    const { status, findings } = check(sitesFile([site("Example Hub", ["US", "FR"])]));
    expect(findings).toEqual([]);
    expect(status).toBe(0);
  });
});
