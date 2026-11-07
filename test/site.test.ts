import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { runInNewContext } from "node:vm";
import { Ajv } from "ajv";
import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import pluginsSchema from "../schemas/plugins.v1.schema.json" with { type: "json" };
import {
  displayName,
  githubRepo,
  homeOrder,
  LICENSE_HREF,
  longDay,
  majorReport,
  pluginHref,
  rangeText,
  REMOVE_PLUGIN_HREF,
  reportHref,
  safeHref,
  starsText,
  SUPPORT_MARKS as MARKS,
  type PluginRecord,
} from "../site/src/data.ts";
import type { PluginsFile } from "../src/build/build.ts";
import { KEEP_MS } from "../src/build/keep.ts";
import { CATEGORIES, categories } from "../src/site/categories.ts";
import { cutDescription, shownDescription } from "../src/site/description.ts";
import { PAGE_SIZE, prePaintStyle } from "../src/site/home-filter.ts";
import { appliedLanguages, languageName } from "../src/site/languages.ts";
import { FULL_MARK, PICTURES, pictureSvg } from "../src/site/logo.ts";
import { START_LIMIT_MS } from "../src/start-test/start-test.ts";
import { compareVersions, declaredRange, majorSupport, ZOTERO_MAJORS } from "../src/site/version.ts";
import { partAt, type Part } from "./support/logo-geometry.ts";
import { PRE_PAINT_CASES } from "./support/pre-paint.ts";
import { themePage } from "./support/theme-page.ts";

const ROOT = resolve(import.meta.dirname, "..");
const FIXTURE = resolve(ROOT, "test/fixtures/site/plugins.json");
const DISCLAIMER_TEXT = "Zotdex is an independent project, not part of Zotero, and it doesn't test the safety or features of the plugins it lists.";
const DATA_FILES = ["v1/plugins.json", "schemas/plugins.v1.schema.json", "schemas/index.v1.schema.json"];
const fixture = JSON.parse(readFileSync(FIXTURE, "utf8")) as { plugins: { id: string }[] };
const ids = fixture.plugins.map((plugin) => plugin.id);

let out: string;
let before: Map<string, Buffer>;
let result: ReturnType<typeof spawnSync>;

// pnpm sets npm_execpath to its own binary when it runs `pnpm test`.
function pnpmSite(args: string[]) {
  const pnpmPath = process.env.npm_execpath;
  if (!pnpmPath) throw new Error("run the tests with `pnpm test`, so they can call pnpm");
  const { INIT_CWD: _outer, ...env } = process.env;
  // A zone behind UTC, so a release date written in local time shows the wrong month here.
  return spawnSync(pnpmPath, ["--silent", "--dir", ROOT, "site", ...args], {
    encoding: "utf8",
    env: { ...env, TZ: "America/New_York" },
    timeout: 50_000,
  });
}

// An out directory holding data, for the failure cases.
function outWith(data: string): string {
  const dir = mkdtempSync(join(tmpdir(), "zpi-site-fail-"));
  temps.push(dir);
  mkdirSync(join(dir, "v1"));
  writeFileSync(join(dir, "v1/plugins.json"), data);
  return dir;
}

const temps: string[] = [];

function htmlFiles(dir: string): string[] {
  return (readdirSync(dir, { recursive: true }) as string[]).filter((path) => path.endsWith(".html"));
}

beforeAll(() => {
  out = mkdtempSync(join(tmpdir(), "zpi-site-test-"));
  mkdirSync(join(out, "v1"));
  cpSync(FIXTURE, join(out, "v1/plugins.json"));
  cpSync(resolve(ROOT, "schemas"), join(out, "schemas"), { recursive: true });
  // A page left by an earlier build, for a plugin the data no longer lists.
  mkdirSync(join(out, "plugins/removed-plugin@example.org"), { recursive: true });
  writeFileSync(join(out, "plugins/removed-plugin@example.org/index.html"), "<p>old</p>");
  before = new Map(DATA_FILES.map((file) => [file, readFileSync(join(out, file))]));
  result = pnpmSite(["--out", out]);
}, 120_000);

afterAll(() => {
  if (out) rmSync(out, { recursive: true, force: true });
  for (const dir of temps.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe("pnpm site", () => {
  test("the site fixture is valid against the v1 schema", () => {
    const validate = new Ajv({ allErrors: true }).compile(pluginsSchema);
    expect(validate(fixture), JSON.stringify(validate.errors)).toBe(true);
    expect(ids).toContain("first-plugin@example.org");
    expect(ids.some((id) => /^\{[0-9a-f-]+\}$/.test(id))).toBe(true);    expect(fixture.plugins.some((plugin) => "failure" in plugin)).toBe(true);
  });

  test("exits 0", () => {
    expect(result.stderr).toBe("");
    expect(result.status).toBe(0);
  });

  test("writes the home page, the About page, and one page for each record under its raw id", () => {
    expect(existsSync(join(out, "index.html"))).toBe(true);
    expect(readdirSync(join(out, "about"))).toEqual(["index.html"]);
    expect(readdirSync(join(out, "plugins")).sort()).toEqual([...ids].sort());
    for (const id of ids) expect(readdirSync(join(out, "plugins", id))).toEqual(["index.html"]);
  });

  test("writes a 404 page at the top that says what happened, links home and to About, and asks not to be indexed", () => {
    const html = readFileSync(join(out, "404.html"), "utf8");
    const main = /<main>(.*?)<\/main>/s.exec(html)![1]!;
    expect(main).toContain("<h1>Page not found</h1>");
    expect(blockText(html)).toBe(
      "Page not found No page is at this address. A plugin's page goes away when Zotdex no longer lists the plugin. " +
        "See all plugins or read the About page.",
    );
    expect(main).toContain('<a href="/">See all plugins</a>');
    expect(main).toContain('<a href="/about/">About page</a>');
    expect(html).toContain('<meta name="robots" content="noindex">');
    expect(html).not.toMatch(/rel="canonical"|property="og:url"/);
  });

  test("asks only the 404 page not to be indexed", () => {
    const indexed = htmlFiles(out).filter((file) => readFileSync(join(out, file), "utf8").includes('name="robots"'));
    expect(indexed).toEqual(["404.html"]);
  });

  test("writes a sitemap in the urlset form that lists exactly the canonical address of each page", () => {
    const xml = readFileSync(join(out, "sitemap.xml"), "utf8");
    expect(xml).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>\n<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">\n/);
    expect(xml).toMatch(/<\/urlset>\n$/);
    const locs = [...xml.matchAll(/<url><loc>([^<]*)<\/loc><\/url>/g)].map(([, loc]) => loc!);
    const canonicals = htmlFiles(out).flatMap((file) => {
      const canonical = /<link rel="canonical" href="([^"]*)"/.exec(readFileSync(join(out, file), "utf8"))?.[1];
      return canonical ? [canonical] : [];
    });
    expect(locs).toHaveLength(ids.length + 2);
    expect(locs.toSorted()).toEqual(canonicals.toSorted());
  });

  test("writes no badge files", () => {
    expect(readdirSync(out)).not.toContain("badges");
  });

  test("writes a robots.txt at the top that allows every path and names the sitemap", () => {
    expect(readFileSync(join(out, "robots.txt"), "utf8")).toBe(
      "User-agent: *\nAllow: /\n\nSitemap: https://zotdex.jmgirard.com/sitemap.xml\n",
    );
  });

  test("links the sitemap from the head of every page", () => {
    for (const file of htmlFiles(out)) {
      const head = /<head>(.*?)<\/head>/s.exec(readFileSync(join(out, file), "utf8"))![1]!;
      expect(head, file).toContain('<link rel="sitemap" type="application/xml" href="/sitemap.xml">');
    }
  });

  test("leaves the data and schema files byte-identical", () => {
    for (const [file, bytes] of before) expect(readFileSync(join(out, file)).equals(bytes), file).toBe(true);
  });

  test("starts every link inside the site with the root path", () => {
    const files = htmlFiles(out);
    expect(files).toHaveLength(ids.length + 3);
    const inside = files.flatMap((file) =>
      [...readFileSync(join(out, file), "utf8").matchAll(/\s(?:href|src)="([^"]*)"/g)]
        .map((match) => match[1]!)
        .filter((url) => !/^[a-z][a-z0-9+.-]*:/i.test(url))
        .map((url) => ({ file, url })),
    );
    // Each plugin page links home, and the home page links each plugin page.
    expect(inside.length).toBeGreaterThanOrEqual(2 * ids.length);
    // The old Pages path is a pattern, not a string, so a repo search for that path skips this line.
    expect(inside.filter(({ url }) => !/^\/(?!\/)/.test(url) || /^\/zotero-plugin-index(?:[/?#]|$)/.test(url))).toEqual([]);
  });
});

describe("how to install a plugin", () => {
  const INSTALL_NOTE =
    "To install, save the .xpi file and drag it onto the Plugins window in Zotero (Tools → Plugins). " +
    "In Firefox, right-click the download link and choose Save Link As. " +
    "A plugin has full access to Zotero and your computer, and Zotdex doesn't test plugins' safety or features, " +
    "so look into a plugin before you trust it with your library. More about installing";
  const noteOf = (html: string) => [...html.matchAll(/<p class="install-note" data-fact="install-note">(.*?)<\/p>/gs)].map(([, text]) => text!);
  // Tags go with no space added, so a space that the template drops before a link shows here.
  const textOf = (html: string) => unescaped(html.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();

  test("each plugin page with a download link has one note after its page head, and a page with none has no note", () => {
    const pages = htmlFiles(join(out, "plugins")).map((file) => readFileSync(join(out, "plugins", file), "utf8"));
    const withLink = pages.filter((html) => html.includes('data-link="download"'));
    expect(withLink.length).toBeGreaterThan(0);
    expect(withLink.length).toBeLessThan(pages.length);
    for (const html of pages) {
      const hasLink = html.includes('data-link="download"');
      expect(noteOf(html)).toHaveLength(hasLink ? 1 : 0);
      if (!hasLink) continue;
      expect(html.replace(/>\s+</g, "><")).toMatch(/<div class="page-head" data-page-head>.*?<div class="actions" data-links>.*?<\/div><\/div><p class="install-note" data-fact="install-note">/s);
      expect(noteOf(html)[0]).toMatch(/<a href="\/about\/#installing">More about installing<\/a>/);
    }
  });

  test("the note gives the steps, the Firefox step, and the risk", () => {
    const html = htmlFiles(join(out, "plugins"))
      .map((file) => readFileSync(join(out, "plugins", file), "utf8"))
      .find((page) => page.includes('data-link="download"'))!;
    expect(textOf(noteOf(html)[0]!)).toBe(INSTALL_NOTE);
  });
});

function fact(html: string, name: string): string | undefined {
  const match = new RegExp(`data-fact="${name}"[^>]*>(.*?)</(?:p|dd|li|span)>`).exec(html);
  return match?.[1]!.replace(/<[^>]+>/g, "");
}

const page = (id: string) => readFileSync(join(out, "plugins", id, "index.html"), "utf8");
const home = () => readFileSync(join(out, "index.html"), "utf8");
const records = (fixture as unknown as PluginsFile).plugins;
const NO_SOURCE_TEXT = "No obvious source code in its repository";
// The icon paths in this file come from Lucide and Feather. site/src/components/Icon.astro holds the notices.
const LOCK_SVG =
  '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z"></path><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>';
const noSourceMark = (icon: string) => `<span class="no-source" data-no-source><span aria-hidden="true" title="${NO_SOURCE_TEXT}">${icon}</span><span class="visually-hidden">${NO_SOURCE_TEXT}</span></span>`;
const PAID_TEXT = "Requires paying its maker";
const GITHUB_SVG =
  '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>';
const STAR_SVG =
  '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>';
const CARD_SVG =
  '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"></path><path d="M2 10h20"></path></svg>';
const paidMark = (icon: string) => `<span class="paid-service" data-paid-service><span aria-hidden="true" title="${PAID_TEXT}">${icon}</span><span class="visually-hidden">${PAID_TEXT}</span></span>`;
// GitHub's longest owner length, with no hyphen to break at.
const LONG_OWNER = "abcdefghijklmnopqrstuvwxyzabcdefghijklm";
// The failure records whose repo URL each break one part of the repo line's URL form, in
// home table order.
const NO_REPO_LINE_IDS = [
  "repo-fragment@example.org",
  "repo-gitlab@example.org",
  "repo-http@example.org",
  "repo-owner-query@example.org",
  "repo-path@example.org",
  "repo-query@example.org",
];

// Text as Astro writes it into the page.
function escaped(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// Text as the browser reads it from the page.
function unescaped(html: string): string {
  return html.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
}

function hasBound(record: PluginRecord): boolean {
  const { min, max } = declaredRange(record);
  return min !== undefined || max !== undefined;
}

// Each marker is found, after the one before it.
function expectInOrder(html: string, markers: string[]): void {
  let last = -1;
  for (const marker of markers) {
    const at = html.indexOf(marker, last + 1);
    expect(at, marker).toBeGreaterThan(last);
    last = at;
  }
}

interface CompatRow {
  major: string;
  declared: string;
  // The declared cell's text for screen readers, which the visible mark and word hide from them.
  spoken?: string;
  cells: string[];
}

const HIDDEN = /<span class="visually-hidden">([^<]*)<\/span>/;

// The rows of a page's compatibility table, or undefined when the page has none: each row's
// major, its declared kind and spoken text, and the visible text of its declared, start, and
// reports cells.
function compatRows(html: string): CompatRow[] | undefined {
  const table = /<table class="compat-table">(.*?)<\/table>/s.exec(html)?.[1];
  if (table === undefined) return undefined;
  const text = (cell: string) => unescaped(cell.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
  const row =
    /<tr data-major="([^"]+)">\s*<th scope="row">([^<]*)<\/th>\s*<td data-declared="([^"]+)">(.*?)<\/td>\s*<td data-start-cell>(.*?)<\/td>\s*<td data-reports-cell>(.*?)<\/td>\s*<\/tr>/gs;
  const rows = [...table.matchAll(row)].map(([, major, heading, declared, declaredCell, ...cells]) => {
    expect(heading).toBe(major);
    const spoken = HIDDEN.exec(declaredCell!)?.[1];
    if (spoken !== undefined) {
      // Outside the hidden text, the cell holds only spans hidden from screen readers.
      expect(declaredCell!.replace(HIDDEN, "").match(/<span(?![^>]*aria-hidden="true")[^>]*>/g)).toBeNull();
    }
    const visible = text(declaredCell!.replace(HIDDEN, ""));
    return { major: major!, declared: declared!, ...(spoken === undefined ? {} : { spoken: unescaped(spoken) }), cells: [visible, ...cells.map((cell) => text(cell!))] };
  });
  expect(table.split("<tr data-major=").length - 1).toBe(rows.length);
  return rows;
}

const DECLARED_CELL: Record<string, string> = { all: "✓ Yes", some: "◐ Partly", none: "– No" };
const START_CELL: Record<string, string> = {
  started: "● Loaded",
  "start-error": "✕ Failed to load",
  "not-installed": "✕ Didn't install",
  "timed-out": "✕ Didn't finish loading",
};

// The rows a record's table holds: each major of ZOTERO_MAJORS and each major its reports or
// start results name, newest first, with the newest start result of each major.
function expectedRows(record: PluginRecord): CompatRow[] {
  const majorOf = (zotero: string) => zotero.split(".")[0]!;
  const majors = new Set([
    ...ZOTERO_MAJORS,
    ...(record.reports ?? []).map(({ zoteroMajor }) => String(zoteroMajor)),
    ...(record.startTests ?? []).map(({ zotero }) => majorOf(zotero)),
  ]);
  return [...majors]
    .sort((a, b) => Number(b) - Number(a))
    .map((major) => {
      const support = majorSupport(record, major);
      const start = (record.startTests ?? []).filter(({ zotero }) => majorOf(zotero) === major).sort((a, b) => compareVersions(b.zotero, a.zotero))[0];
      const report = record.reports?.find(({ zoteroMajor }) => String(zoteroMajor) === major);
      const spoken =
        support === "all"
          ? `Supports Zotero ${major}`
          : support === "some"
            ? `Supports some of Zotero ${major} (${rangeText(record)})`
            : support === "none"
              ? `Doesn't support Zotero ${major}`
              : undefined;
      return {
        major,
        declared: support ?? "no-range",
        ...(spoken === undefined ? {} : { spoken }),
        cells: [
          support ? DECLARED_CELL[support]! : "Not stated",
          start ? `${START_CELL[start.result]} Zotero ${start.zotero}` : "Not checked",
          report ? `${report.works} works ${report.broken} broken` : "None yet",
        ],
      };
    });
}

describe("the site fixture", () => {
  test("holds each shape of row and page", () => {
    const bounded = records.filter((record) => !record.failure && hasBound(record));
    expect(records.some((record) => record.failure)).toBe(true);
    expect(records.some((record) => !record.failure && !hasBound(record))).toBe(true);
    expect(records.some((record) => record.upstream?.archived === true)).toBe(true);
    expect(records.some((record) => record.upstream?.description && !shownDescription(record))).toBe(true);
    expect(records.some((record) => record.overrides.some((o) => o.field === "description"))).toBe(true);
    for (const support of ["all", "some", "none"]) {
      expect(bounded.some((record) => ZOTERO_MAJORS.some((major) => majorSupport(record, major) === support)), support).toBe(true);
    }
    expect(records.some((record) => (record.reports?.length ?? 0) > 0)).toBe(true);
    expect(records.some((record) => record.upstream && record.reports?.length === 0)).toBe(true);
    expect(records.some((record) => record.upstream && !("reports" in record))).toBe(true);
    const extra = (majors: string[]) => majors.some((major) => !ZOTERO_MAJORS.includes(major));
    expect(records.some((record) => (record.reports ?? []).some(({ zoteroMajor }) => zoteroMajor === 11))).toBe(true);
    expect(records.some((record) => extra((record.startTests ?? []).map(({ zotero }) => zotero.split(".")[0]!)))).toBe(true);
    const majors = (record: PluginRecord) => (record.startTests ?? []).map(({ zotero }) => zotero.split(".")[0]);
    expect(records.some((record) => majors(record).some((major, i) => majors(record).indexOf(major) !== i))).toBe(true);
  });

  test("holds each shape of home table row", () => {
    const names = records.map(displayName);
    expect(
      names.some((a, i) => names.some((b, j) => i !== j && a !== b && a.localeCompare(b, "en", { sensitivity: "base" }) === 0)),
    ).toBe(true);
    expect(
      records.some((record) => {
        const declared = ZOTERO_MAJORS.filter((major) => majorSupport(record, major) === "all");
        const tested = new Set((record.startTests ?? []).map(({ zotero }) => zotero.split(".")[0]));
        return declared.some((major) => tested.has(major)) && declared.some((major) => !tested.has(major));
      }),
    ).toBe(true);
    expect(records.some((record) => new Set(appliedLanguages(record).map((tag) => new Intl.Locale(tag).language)).size >= 4)).toBe(true);
    expect(records.some((record) => record.upstream?.xpiUrl && safeHref(record.upstream.xpiUrl))).toBe(true);
    expect(records.some((record) => record.upstream?.xpiUrl && !safeHref(record.upstream.xpiUrl))).toBe(true);
    expect(records.some((record) => record.upstream && record.upstream.xpiUrl === undefined)).toBe(true);
    expect(records.some((record) => !safeHref(record.upstream?.repoUrl ?? record.repoUrl))).toBe(true);
  });
});

// The href of the report link `verdict` in a page, with the HTML escapes undone.
function reportLink(html: string, verdict: string): string | undefined {
  const href = new RegExp(`<a data-report="${verdict}" href="([^"]*)"`).exec(html)?.[1];
  return href?.replace(/&amp;/g, "&");
}

describe("the compatibility table", () => {
  test.each(ids)("shows the table of %s, or the failure of a record that was not read", (id) => {
    const record = records.find((r) => r.id === id)!;
    const section = sections(page(id)).find(({ name }) => name === "compatibility")!;
    expect(section.heading).toBe("Zotero versions");
    if (record.upstream) {
      expect(compatRows(section.body)).toEqual(expectedRows(record));
      expect(fact(section.body, "read-version")).toBe(`For version ${escaped(record.upstream.version)}, the release this page shows`);
      expect(section.body).not.toContain('data-fact="failure"');
    } else {
      expect(compatRows(section.body)).toBeUndefined();
      expect(unescaped(fact(section.body, "failure")!)).toBe(
        `Zotdex couldn't read this plugin when it last updated this page, on October 25, 2026: ${record.failure!.name}: ${record.failure!.message}`,
      );
    }
  });

  test("names the table's columns", () => {
    const head = /<table class="compat-table"><thead>(.*?)<\/thead>/s.exec(page("first-plugin@example.org").replace(/>\s+</g, "><"))![1]!;
    expect([...head.matchAll(/<th scope="col">(.*?)<\/th>/g)].map(([, text]) => text)).toEqual(["Zotero", "Supports", "Startup check", "User reports"]);
  });

  test("adds a row for each other major that reports or start results name, newest first, with the newest start result of a major", () => {
    const next = compatRows(page("next-plugin@example.org"))!;
    expect(next.map(({ major }) => major)).toEqual(["12", "11", "10", "9", "8", "7"]);
    const cells = (major: string) => next.find((row) => row.major === major)!.cells;
    expect(cells("12")).toEqual(["– No", "✕ Didn't install Zotero 12.0.1", "None yet"]);
    expect(cells("11")).toEqual(["✓ Yes", "Not checked", "2 works 1 broken"]);
    expect(cells("8")).toEqual(["✓ Yes", "● Loaded Zotero 8.0.4", "1 works 0 broken"]);
    expect(cells("7")).toEqual(["– No", "Not checked", "None yet"]);
    expect(compatRows(page("a-cafe@example.org"))!.find((row) => row.major === "8")!.cells[1]).toBe("● Loaded Zotero 8.0.10");
  });

  test("tells screen readers how much of a major the range declares, with the range for part of one", () => {
    const spoken = compatRows(page("min-only-plugin@example.org"))!.map(({ major, spoken }) => [major, spoken]);
    expect(spoken).toEqual([
      ["10", "Supports Zotero 10"],
      ["9", "Supports Zotero 9"],
      ["8", "Supports some of Zotero 8 (Zotero 8.0.1 or newer)"],
      ["7", "Doesn't support Zotero 7"],
    ]);
    expect(page("no-range-plugin@example.org")).toMatch(/<span class="start" data-start="started" aria-hidden="true">●<\/span>/);
  });

  // The build writes one item per major; the schema lets a file hold two.
  test("adds the counts of two report items on one major", () => {
    const record = { ...records.find((r) => r.id === "first-plugin@example.org")!, reports: [
      { zoteroMajor: 8, works: 1, broken: 0 },
      { zoteroMajor: 8, works: 0, broken: 3 },
    ] };
    expect(majorReport(record, "8")).toEqual({ works: 1, broken: 3 });
    expect(majorReport(record, "7")).toBeUndefined();
  });
});

describe("the report row", () => {
  test.each(ids)("puts the report links of %s under the table, after a line that names the version read", (id) => {
    const record = records.find((r) => r.id === id)!;
    const html = page(id);
    if (!record.upstream) {
      expect(html).not.toMatch(/\sdata-reports[\s>]|\sdata-report="|\sdata-fact="(?:read-version|report-prompt)"/);
      return;
    }
    expect(reportLink(html, "works")).toBe(reportHref(record, "works"));
    expect(reportLink(html, "broken")).toBe(reportHref(record, "broken"));
    expect(fact(html, "report-prompt")).toBe(`Tried version ${escaped(record.upstream.version)} on Zotero? Report what you found:`);
    expectInOrder(html, ['class="compat-table"', "</table>", 'data-fact="report-prompt"', 'data-report="works"', 'data-report="broken"']);
  });

  test("names each button by its verdict and describes it by the line above it", () => {
    const html = page("first-plugin@example.org");
    expect(html).toContain('<p id="report-prompt" data-fact="report-prompt">');
    expect(html).toMatch(/<a data-report="works" href="[^"]*" class="button" aria-describedby="report-prompt">Works<\/a>/);
    expect(html).toMatch(/<a data-report="broken" href="[^"]*" class="button" aria-describedby="report-prompt">Broken<\/a>/);
  });

  // A record with reports and one with no reports field.
  test.each(["first-plugin@example.org", "{c2a6e4c8-1b7d-4f3a-9e2b-5d8f0a1c3e7b}"])(
    "links %s to both report forms with its id and version filled in",
    (id) => {
      const record = records.find((r) => r.id === id)!;
      for (const verdict of ["works", "broken"]) {
        const href = reportLink(page(id), verdict)!;
        const url = new URL(href);
        expect(`${url.origin}${url.pathname}`).toBe("https://github.com/jmgirard/zotdex/issues/new");
        expect([...url.searchParams.entries()]).toEqual([
          ["template", `${verdict}.yml`],
          ["plugin", id],
          ["version", record.upstream!.version],
        ]);
      }
    },
  );

  test("URL-encodes an id and a version that need it", () => {
    const href = reportLink(page("{c2a6e4c8-1b7d-4f3a-9e2b-5d8f0a1c3e7b}"), "works")!;
    expect(href.slice(href.indexOf("?") + 1)).toBe("template=works.yml&plugin=%7Bc2a6e4c8-1b7d-4f3a-9e2b-5d8f0a1c3e7b%7D&version=3.0.0%2Br1");
  });

});

// The h2 card sections of the main content, each with its markup.
function sections(html: string): { name: string; heading: string; body: string }[] {
  const main = html.slice(html.indexOf("<main>"), html.indexOf("</main>"));
  return [...main.matchAll(/<section class="card[^"]*" data-section="([^"]+)"[^>]*>\s*<h2>([^<]*)<\/h2>(.*?)<\/section>/gs)].map(
    ([, name, heading, body]) => ({ name: name!, heading: heading!, body: body! }),
  );
}

const ICON = /<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">(?:<path d="[^"]*"><\/path>)+<\/svg>/.source;

// The links of a page head in order: each one's kind, its href (undefined for plain text),
// and its text, with the HTML escapes undone.
function headLinks(actions: string): { kind: string; href?: string; text: string }[] {
  const item = new RegExp(`<a class="btn" href="([^"]*)" data-link="([^"]+)">${ICON}(.*?)</a>|<span class="link-text" data-link="([^"]+)">(.*?)</span>`, "gs");
  const found = [...actions.matchAll(item)];
  // Nothing but these items sits in the links block.
  expect(actions.replace(item, "").trim()).toBe("");
  return found.map(([, href, kind, text, plainKind, plainText]) =>
    href === undefined
      ? { kind: plainKind!, text: unescaped(plainText!) }
      : { kind: kind!, href: unescaped(href), text: unescaped(text!).replace(/\s+/g, " ").trim() },
  );
}

describe("the plugin page", () => {
  test.each(ids)("opens the main content of %s with a back link, the name, any repo line, the description, and the links", (id) => {
    const record = records.find((r) => r.id === id)!;
    const html = page(id);
    const description = shownDescription(record);
    // A space keeps the name and the badge apart in the heading's text.
    const archived = record.upstream?.archived === true ? ' <span class="badge" data-archived>Archived</span>' : "";
    const noSource = record.upstream?.sourceInRepo === false ? ` ${noSourceMark("<svg>")}` : "";
    const paid = record.paidService ? ` ${paidMark("<svg>")}` : "";
    const main = html.slice(html.indexOf("<main>") + "<main>".length, html.indexOf("</main>"));
    const head = new RegExp(
      `^<a class="back" href="/" data-back>${ICON}All plugins</a>` +
        `<div class="page-head" data-page-head><div class="head-text">(.*?)<div class="actions" data-links>(.*?)</div></div>((?:<div class="head-side[^"]*">.*?</div>)?)</div>`,
      "s",
    ).exec(main.replace(/>\s+</g, "><").trim());
    const { upstream, screenshot } = record;
    const icon = upstream?.icon ? `<span class="icon-tile" data-icon-tile><img src="/v1/${upstream.icon}" alt="" width="64" height="64" data-icon></span>` : "";
    const shot = screenshot
      ? `<a class="screenshot" href="/v1/${screenshot.file}" data-screenshot><img src="/v1/${screenshot.file}" alt="${escaped(screenshot.alt).replaceAll("&#39;", "'")}" decoding="async"></a>`
      : "";
    expect(head?.[3]).toBe(icon || shot ? `<div class="head-side${shot ? " with-screenshot" : ""}">${icon}${shot}</div>` : "");
    const repoUrl = upstream?.repoUrl ?? record.repoUrl;
    const github = githubRepo(repoUrl);
    const shownCategories = CATEGORIES.filter(({ slug }) => categories(record).includes(slug)).map(
      ({ slug, name }) =>
        `<a href="/?category=${slug}" aria-label="${escaped(name)}: plugins in this category" data-category="${slug}">${escaped(name)}</a>`,
    );
    const categoryLine =
      shownCategories.length > 0
        ? `<p class="categories" data-categories><a href="/about/#categories" data-categories-about>Zotdex categories</a>: ` +
          `${shownCategories.join(", ")}</p>`
        : "";
    const stars =
      upstream?.stars !== undefined
        ? `<span aria-hidden="true">·</span><span data-repo-stars><span aria-hidden="true" title="${starsText(upstream.stars)}"><svg> ` +
          `${upstream.stars.toLocaleString("en")}</span><span class="visually-hidden">${starsText(upstream.stars)}</span></span>`
        : "";
    expect(head?.[1]?.replace(new RegExp(ICON, "g"), "<svg>")).toBe(
      `<h1>${escaped(displayName(record))}${archived}${noSource}${paid}</h1>` +
        (github
          ? `<p class="repo-line" data-repo-line>By <a href="https://github.com/${escaped(github.owner)}" data-repo-owner>${escaped(github.owner)}</a>` +
            `<span aria-hidden="true">·</span><a href="${escaped(repoUrl)}" data-repo-name>${escaped(github.repo)}</a>${stars}</p>`
          : "") +
        (description ? `<p class="description" data-description>${escaped(description)}</p>` : "") +
        categoryLine,
    );
    const repo = safeHref(repoUrl) !== undefined;
    expect(headLinks(head![2]!)).toEqual([
      ...(upstream?.xpiUrl && safeHref(upstream.xpiUrl)
        ? [{ kind: "download", href: upstream.xpiUrl, text: `Download ${upstream.version} (.xpi)` }]
        : []),
      repo ? { kind: "source", href: repoUrl, text: upstream?.sourceInRepo === false ? "Repository" : "Source code" } : { kind: "source", text: repoUrl },
      ...(upstream
        ? [repo ? { kind: "releases", href: `${repoUrl}/releases`, text: "Releases" } : { kind: "releases", text: `${repoUrl}/releases` }]
        : []),
    ]);
    expect(main).not.toMatch(/<header[\s>]/);
  });

  test("lists a page's categories in list order, which need not be the order of their names, and shows no list for a plugin with none", () => {
    const line = (id: string) => /<p class="categories" data-categories>(.*?)<\/p>/s.exec(page(id))?.[1];
    const names = [...line("locale-plugin@example.org")!.matchAll(/data-category="[^"]*">([^<]*)</g)].map(([, name]) => name);
    expect(names).toEqual(["Translation and dictionaries", "PDF reading"]);
    expect(names.toSorted()).not.toEqual(names);
    expect(line("broken-plugin@example.org")).toBeUndefined();
    expect(page("broken-plugin@example.org")).not.toContain("data-categories");
  });

  test.each<[string, string, string, string, string, string | undefined]>([
    ["first-plugin@example.org", "https://github.com/example", "https://github.com/example/first-plugin", "first-plugin", "By example · first-plugin · 1,234", "1,234 stars on GitHub"],
    ["old-plugin@example.org", "https://github.com/example", "https://github.com/example/old-plugin", "old-plugin", "By example · old-plugin · 1", "1 star on GitHub"],
    ["{c2a6e4c8-1b7d-4f3a-9e2b-5d8f0a1c3e7b}", "https://github.com/example", "https://github.com/example/guid-plugin", "guid-plugin", "By example · guid-plugin · 0", "0 stars on GitHub"],
    ["no-range-plugin@example.org", "https://github.com/example", "https://github.com/example/no-range-plugin", "no-range-plugin", "By example · no-range-plugin", undefined],
    ["broken-plugin@example.org", "https://github.com/example", "https://github.com/example/broken-plugin", "broken-plugin", "By example · broken-plugin", undefined],
  ])("shows the owner, the repo, and any stars of %s under the name", (id, ownerHref, repoHref, repoText, visible, words) => {
    const line = /<p class="repo-line" data-repo-line>(.*?)<\/p>/s.exec(page(id))?.[1];
    const text = (html: string) => unescaped(html.replace(/<[^>]*>/g, "")).replace(/\s+/g, " ").trim();
    expect(/<a href="([^"]*)" data-repo-owner>([^<]*)<\/a>/.exec(line ?? "")?.slice(1)).toEqual([ownerHref, "example"]);
    expect(/<a href="([^"]*)" data-repo-name>([^<]*)<\/a>/.exec(line ?? "")?.slice(1)).toEqual([repoHref, repoText]);
    expect(text(line!.replace(/<span class="visually-hidden">[^<]*<\/span>/g, ""))).toBe(visible);
    if (words === undefined) {
      expect(line).not.toMatch(/data-repo-stars|<svg/);
    } else {
      expect(/<span aria-hidden="true" title="([^"]*)">/.exec(line!)?.[1]).toBe(words);
      expect(/<span class="visually-hidden">([^<]*)<\/span>/.exec(line!)?.[1]).toBe(words);
      expect(line).toMatch(/<path d="M12 2l3\.09 6\.26L22 9\.27l-5 4\.87 1\.18 6\.88L12 17\.77l-6\.18 3\.25L7 14\.14 2 9\.27l6\.91-1\.01L12 2z">/);
    }
  });

  test.each([
    ["a GitHub URL with an extra path segment", "repo-path@example.org"],
    ["an http: GitHub URL", "repo-http@example.org"],
    ["a non-GitHub host", "repo-gitlab@example.org"],
    ["a GitHub URL with a query after the repo", "repo-query@example.org"],
    ["a GitHub URL with a query after the owner", "repo-owner-query@example.org"],
    ["a GitHub URL with a fragment", "repo-fragment@example.org"],
  ])("shows no repo line for %s", (_name, id) => {
    expect(page(id)).not.toContain("data-repo-line");
  });

  test("covers each shape of page head link in the site fixture", () => {
    const repoFails = (record: PluginRecord) => !safeHref(record.upstream?.repoUrl ?? record.repoUrl);
    expect(records.some((record) => record.upstream && repoFails(record))).toBe(true);
    expect(records.some((record) => !record.upstream && repoFails(record))).toBe(true);
    expect(records.some((record) => record.upstream?.xpiUrl && !safeHref(record.upstream.xpiUrl))).toBe(true);
    expect(records.some((record) => record.upstream?.xpiUrl && safeHref(record.upstream.xpiUrl) && !repoFails(record))).toBe(true);
    expect(records.some((record) => record.upstream?.icon)).toBe(true);
    expect(records.some((record) => record.upstream && !record.upstream.icon)).toBe(true);
  });

  test.each(ids)("shows the sections of %s in order, each with its facts", (id) => {
    const record = records.find((r) => r.id === id)!;
    const html = page(id);
    const read = record.upstream !== undefined;
    const found = sections(html);
    // No other section or h2 sits in the main content.
    const main = html.slice(html.indexOf("<main>"), html.indexOf("</main>"));
    expect(main.split("<section").length - 1).toBe(found.length);
    expect(main.split("<h2").length - 1).toBe(found.length);
    expect(found.map(({ name, heading }) => [name, heading])).toEqual([
      ["compatibility", "Zotero versions"],
      ["details", "Details"],
    ]);
    const body = (name: string) => found.find((section) => section.name === name)!.body;
    const holds: [string, string[]][] = [
      [
        "compatibility",
        read
          ? [
              'data-fact="read-version"',
              'class="compat-table"',
              ...(hasBound(record) ? ['data-fact="declared-range"'] : []),
              'data-fact="report-prompt"',
              'data-report="works"',
              'data-report="broken"',
            ]
          : ['data-fact="failure"'],
      ],
    ];
    for (const [name, markers] of holds) {
      expectInOrder(body(name), markers);
      // Each fact sits in its section and nowhere else on the page.
      for (const marker of markers) expect(html.split(marker).length - 1, marker).toBe(1);
    }
    if (!hasBound(record)) expect(html).not.toContain('data-fact="declared-range"');
  });

  test.each(ids)("lists the facts of %s in an open Details section, with the overrides under an h3", (id) => {
    const record = records.find((r) => r.id === id)!;
    const html = page(id);
    expect(html).not.toMatch(/<details[\s>]|<summary[\s>]/);
    const details = sections(html).find(({ name }) => name === "details")!.body;
    const facts = /^\s*<dl class="facts">(.*?)<\/dl>/s.exec(details)?.[1];
    const items = [...facts!.matchAll(/<div>\s*<dt>([^<]*)<\/dt>\s*<dd data-fact="([^"]+)">/g)].map(([, label, name]) => [label, name]);
    expect(facts!.split("<dt>").length - 1).toBe(items.length);
    const { upstream } = record;
    expect(items).toEqual([
      ["Plugin ID", "id"],
      ...(record.paidService ? [[PAID_TEXT, "paid-service"]] : []),
      ...(upstream
        ? [
            ...(upstream.description?.trim() ? [["Description in the plugin file", "manifest-description"]] : []),
            ...(upstream.repoDescription !== undefined ? [["Description on GitHub", "github-description"]] : []),
            ...(typeof upstream.archived === "boolean" ? [["Archived on GitHub", "archived"]] : []),
            ...(typeof upstream.sourceInRepo === "boolean" ? [["Source code in the repository's top folder", "source-in-repo"]] : []),
            ["Repository created", "repo-created"],
            ["Release on this page", "latest-release"],
            ["Releases with an .xpi file", "release-count"],
            ["Open issues and pull requests", "open-issues"],
            ["Checks for updates at", "update-host"],
            ["Languages", "languages"],
          ]
        : []),
    ]);
    if (record.overrides.length > 0) {
      const overrides = /<div class="overrides" data-overrides>\s*<h3>Corrections by Zotdex<\/h3>(.*?)<\/table>/s.exec(details)?.[1];
      expect(overrides?.split("<tr data-override=").length).toBe(record.overrides.length + 1);
    } else {
      expect(details).not.toMatch(/\sdata-overrides[\s>]|<h3[\s>]/);
    }
    expect(html).not.toMatch(/<h2>Overrides<\/h2>/);
    expect(html.indexOf('data-fact="disclaimer"')).toBeGreaterThan(html.indexOf('data-section="details"'));
  });

  test("shows the declared range with the override that applies", () => {
    expect(fact(page("first-plugin@example.org"), "declared-range")).toBe("Zotero 7.0 to 8.*");
  });

  test("shows the repository facts", () => {
    const html = page("first-plugin@example.org");
    expect(fact(html, "repo-created")).toBe("March 14, 2023");
    expect(fact(html, "latest-release")).toBe("1.2.0, published September 30, 2026");
    expect(fact(html, "release-count")).toBe("27");
    expect(fact(html, "open-issues")).toBe("12");
    expect(fact(html, "update-host")).toBe("example.org");
    expect(fact(html, "disclaimer")).toBe(escaped(DISCLAIMER_TEXT));
  });

  test("introduces the corrections and names their columns", () => {
    const block = /<div class="overrides" data-overrides>(.*?)<tbody>/s.exec(page("first-plugin@example.org"))![1]!;
    expect(/<p>(.*?)<\/p>/s.exec(block)?.[1]).toBe("Zotdex corrects, fills in, or replaces these facts from the plugin's own files or GitHub page.");
    expect([...block.matchAll(/<th>(.*?)<\/th>/g)].map(([, text]) => unescaped(text!))).toEqual([
      "Fact",
      "Plugin's value",
      "Zotdex's value",
      "For version",
      "In use",
      "Reason",
    ]);
  });

  test("shows each override beside the upstream value", () => {
    const rows = [...page("first-plugin@example.org").matchAll(/<tr data-override="[^"]*">(.*?)<\/tr>/g)].map((row) =>
      [...row[1]!.matchAll(/<td>(.*?)<\/td>/g)].map((cell) => cell[1]!.replace(/<[^>]+>/g, "")),
    );
    // Fact, plugin's value, Zotdex's value, version, in use, reason.
    expect(rows).toEqual([
      ["strict_max_version", "7.*", "8.*", "every version", "yes", "The author confirmed that the plugin works on Zotero 8."],
      ["strict_min_version", "7.0", "8.5", "0.9.0", "no", "Version 0.9.0 needs an API that Zotero 8.5 added."],
    ]);
  });

  test.each([
    ["three upstream tags", "first-plugin@example.org", "English (United States), Spanish, Chinese (China)"],
    ["an empty upstream list", "old-plugin@example.org", "Language not listed"],
    ["no languages field", "{c2a6e4c8-1b7d-4f3a-9e2b-5d8f0a1c3e7b}", "Language not listed"],
    ["an override for every version, in its own order", "no-range-plugin@example.org", "French, German"],
    ["an override for another version only", "min-only-plugin@example.org", "Chinese (China), Chinese (Taiwan)"],
    ["an override for the version read beside one for every version", "locale-plugin@example.org", "Portuguese (Brazil), Spanish (Latin America)"],
  ])("shows the interface languages for %s", (_, id, text) => {
    expect(fact(page(id), "languages")).toBe(text);
  });

  test("labels the languages fact as languages", () => {
    expect(page("first-plugin@example.org")).toMatch(/<dt>Languages<\/dt>\s*<dd data-fact="languages">/);
  });

  test("leaves the old languages label off every plugin page", () => {
    const pages = htmlFiles(join(out, "plugins"));
    expect(pages.length).toBe(ids.length);
    for (const path of pages) {
      const html = readFileSync(join(out, "plugins", path), "utf8");
      for (const label of ["Interface languages:", "Menus and settings in"]) expect(html, path).not.toContain(label);
    }
  });

  test.each([
    ["a non-empty", "no-range-plugin@example.org", [["en", "fr, de"]]],
    ["an empty", "locale-plugin@example.org", [["none", "es"], ["none", "pt-BR, es-419"]]],
  ])("shows %s upstream list beside a languages override", (_, id, cells) => {
    const rows = [...page(id).matchAll(/<tr data-override="languages">(.*?)<\/tr>/g)].map((row) =>
      [...row[1]!.matchAll(/<td>(.*?)<\/td>/g)].slice(1, 3).map((cell) => cell[1]),
    );
    expect(rows).toEqual(cells);
  });

  test.each([
    ["old-plugin@example.org", "Yes"],
    ["first-plugin@example.org", "No"],
  ])("shows whether the repo of %s is archived", (id, text) => {
    expect(page(id)).toMatch(/<dt>Archived on GitHub<\/dt>\s*<dd data-fact="archived">/);
    expect(fact(page(id), "archived")).toBe(text);
  });

  test.each<[string, string | undefined, string | undefined]>([
    ["first-plugin@example.org", "A plugin for the site tests.", "Tests the site &amp; its &lt;pages&gt;."],
    ["old-plugin@example.org", undefined, "An old plugin kept for history."],
    ["b-cafe@example.org", "Keeps a log of item edits.", undefined],
    ["zotero6-plugin@example.org", undefined, undefined],
  ])("shows the manifest and GitHub descriptions of %s that its record holds", (id, manifest, github) => {
    expect(fact(page(id), "manifest-description")).toBe(manifest);
    expect(fact(page(id), "github-description")).toBe(github);
  });

  test.each([
    ["first-plugin@example.org", "Yes"],
    ["b-cafe@example.org", "No"],
  ])("shows whether the repo of %s holds source", (id, text) => {
    expect(page(id)).toMatch(/<dt>Source code in the repository's top folder<\/dt>\s*<dd data-fact="source-in-repo">/);
    expect(fact(page(id), "source-in-repo")).toBe(text);
  });

  test("shows no source fact when the record has no such value", () => {
    expect(page("no-range-plugin@example.org")).not.toMatch(/\sdata-fact="source-in-repo"/);
  });

  test.each([
    ["next-plugin@example.org", "Needs credits bought from the maker.", "https://example.org/pricing?plan=a&amp;b=c", "November 2, 2026"],
    ["repo-path@example.org", "Stops after a 7-day trial.", "https://example.org/trial", "November 1, 2026"],
  ])("shows the paid service fact on %s", (id, note, href, read) => {
    const dd = /<dd data-fact="paid-service">(.*?)<\/dd>/s.exec(page(id))?.[1]?.replace(/\s+/g, " ").trim();
    expect(dd).toBe(`${note} <a href="${href}" data-paid-source>Source</a>, checked ${read}`);
  });

  test("shows no paid service words on a page without the field", () => {
    expect(page("first-plugin@example.org")).not.toContain(PAID_TEXT);
  });

  test("shows the mark and calls the link the repository only for false", () => {
    const link = (id: string) => /data-link="source">\s*<svg[\s\S]*?<\/svg>\s*([A-Za-z ]+?)\s*<\/a>/.exec(page(id))?.[1];
    expect(page("b-cafe@example.org")).toContain(noSourceMark(LOCK_SVG));
    expect(link("b-cafe@example.org")).toBe("Repository");
    for (const id of ["first-plugin@example.org", "no-range-plugin@example.org"]) {
      expect(page(id)).not.toContain("data-no-source");
      expect(link(id)).toBe("Source code");
    }
  });

  test("shows no archived fact when the record has no archived value", () => {
    expect(page("{c2a6e4c8-1b7d-4f3a-9e2b-5d8f0a1c3e7b}")).not.toMatch(/\sdata-fact="archived"/);
  });

  test("labels the release fact as the release on this page", () => {
    expect(page("first-plugin@example.org")).toMatch(/<dt>Release on this page<\/dt>\s*<dd data-fact="latest-release">/);
  });

  test.each([
    ["old-plugin@example.org", "0.4.1, published July 1, 2024 (prerelease)"],
    ["first-plugin@example.org", "1.2.0, published September 30, 2026"],
    ["{c2a6e4c8-1b7d-4f3a-9e2b-5d8f0a1c3e7b}", "3.0.0+r1, published October 1, 2026"],
  ])("marks the release of %s as a prerelease only when the record says so", (id, text) => {
    expect(fact(page(id), "latest-release")).toBe(text);
  });
});

// The text of a page's main content, with tags removed, the HTML escapes undone, and spaces
// collapsed. A tag adds no space, so text that Astro joins to an element stays joined.
function mainText(html: string): string {
  const main = html.slice(html.indexOf("<main>"), html.indexOf("</main>"));
  return unescaped(main.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
}

// mainText with a space at the end of each heading and paragraph, since Astro writes no space
// between blocks.
function blockText(html: string): string {
  return mainText(html.replace(/<\/(?:h1|h2|p)>/g, " $&"));
}

describe("the About page", () => {
  const about = () => readFileSync(join(out, "about/index.html"), "utf8");

  // The "About page (M111)" section of cairn/references/plain-words-copy.md, as page text: each
  // section's id, its h2, and its prose with the lists left out. The marks come from the code.
  const COPY: [id: string, h2: string, prose: string][] = [
    [
      "declared",
      "Supported Zotero versions",
      "Each plugin says which Zotero versions it supports, and Zotdex shows that range, with any corrections. " +
        `${MARKS.all} means it supports every release of that version, ${MARKS.some} some releases, and ${MARKS.none} none. ` +
        "A plugin that doesn't say shows no mark. The range is what the author says, not a test result. " +
        "This update counted these as the newest releases:",
    ],
    [
      "start-test",
      "Startup check",
      "Zotdex installs each plugin in a clean Zotero setup, once for each Zotero version the plugin says it supports, and waits 3 seconds. " +
        "● means Zotero lists it as active and it logged no startup error. " +
        "✕ means it failed to load, didn't install, or didn't finish loading within 90 seconds. " +
        "Passing doesn't mean the plugin works, because the check doesn't use any of its features, and the plugin's own code can change its result. " +
        "Zotdex checks a plugin again when its file changes, after a failed check, and once a week, so a result is usually less than a week old.",
    ],
    [
      "older-data",
      "Older data",
      "When Zotdex can't reach a plugin because of a time limit or a server problem, it keeps what it found in the past 7 days " +
        'and marks the plugin "Older data". A plugin it can\'t read for another reason, such as a deleted repository, shows "Not read".',
    ],
    [
      "reports",
      "User reports",
      "Anyone with a GitHub account can report that a plugin works or is broken, with the buttons on its page. " +
        "A bot checks each report, and Zotdex counts the ones that pass, keeping each person's latest for each Zotero version. " +
        "The counts start over with each new release of the plugin, and they show what people found, not what Zotdex tested.",
    ],
    [
      "descriptions",
      "Descriptions",
      "A plugin's description comes from its own file or its GitHub page. If a plugin comes in several languages, Zotdex uses its English text. " +
        "For a description that's mostly Chinese, Japanese, or Korean, Zotdex shows just the part in Latin letters, if there is one. " +
        "The Details card shows both descriptions when a plugin has both.",
    ],
    [
      "icons",
      "Icons and screenshots",
      "A plugin's icon is the one its author made for Zotero's Plugins window. " +
        "Zotdex doesn't look at icons before it shows them, and a maintainer can hide one. " +
        "A screenshot comes from the plugin's owner, who asks for it with the link on the plugin's page. " +
        "A maintainer looks at each one before it's shown.",
    ],
    [
      "overrides",
      "Corrections",
      "When a fact from a plugin is wrong and its author can't or won't fix it, Zotdex can correct it, such as its name, description, or supported versions. " +
        "A plugin's owner can also ask for a new name or description with the link on its page, and a maintainer reads each request. " +
        'Each plugin page lists its corrections in the "Corrections by Zotdex" table, beside the plugin\'s own values.',
    ],
    [
      "categories",
      "Categories",
      "Zotdex sorts plugins into its own categories, from words in their names and descriptions plus some fixes by hand, so you can find plugins of one kind. " +
        "A category can be wrong or missing, and plugin authors don't choose them.",
    ],
    [
      "source",
      "Source code",
      "A lock means Zotdex found no obvious source code in the top folder of the plugin's repository. " +
        "It only looks at file and folder names, not at the code, so it can be wrong either way, and a plugin without the lock isn't always open source. " +
        "A plugin with the lock stays listed.",
    ],
    [
      "paid-service",
      "Paid service",
      "A card icon means the plugin's main use stops unless you pay its maker, or stops after a trial. A maintainer checks this by hand. " +
        "A free plan with paid extras, a plugin that also works with another service's key, or a donation gets no mark. " +
        "A plugin with no mark can still cost money, because new plugins get checked later.",
    ],
    [
      "removing",
      "Removing a plugin",
      "A maintainer removes a plugin when its owner asks, when it's spam, when its entry misleads people about what it is or who makes it, " +
        "or when someone shows evidence that it causes harm. " +
        "To ask, use the form for removing a plugin or reporting harm, or the link on the plugin's page. A removed plugin stays off Zotdex.",
    ],
    [
      "installing",
      "Installing a plugin",
      "Save the plugin's .xpi file, then in Zotero go to Tools → Plugins and drag the file onto the Plugins window. " +
        "In Firefox, right-click the download link and choose Save Link As. " +
        "A plugin has full access to Zotero and your computer, and Zotdex doesn't test plugins' safety or features, " +
        "so look into a plugin before you trust it with your library. " +
        "A bot adds most new plugins, and a maintainer steps in when the bot flags one, " +
        "mainly to keep out entries that mislead people about what a plugin is or who makes it.",
    ],
    [
      "not-vetted",
      "What Zotdex doesn't do",
      "Zotdex is independent and unofficial, and it's not part of Zotero. " +
        "It can't vet the plugins it lists, because one person runs it and any plugin can change with each release. " +
        "It doesn't host plugin files: download links go to each author's own file.",
    ],
    [
      "license",
      "License",
      "Zotdex's code is under the MIT License, and its data, categories, and own text are under CC0 1.0. " +
        "Names, descriptions, icons, screenshots, and other work from plugin authors keep their authors' terms. " +
        "The license page gives the details, including the exceptions.",
    ],
  ];
  // One section's markup, found by its id.
  const sectionOf = (id: string) => new RegExp(`<section class="card" id="${id}" data-about="${id}">(.*?)</section>`, "s").exec(about())?.[1] ?? "";
  // A section's h2 and prose as text, with its lists left out.
  const proseOf = (id: string) => blockText(`<main>${sectionOf(id).replace(/<ul[^>]*>.*?<\/ul>/gs, "")}</main>`);

  test("has the copy's sections in its order, each under its h2 and with its id", () => {
    expect([...about().matchAll(/<section class="card" id="([^"]+)" data-about="\1">\s*<h2>([^<]*)<\/h2>/g)].map(([, id, h2]) => [id, unescaped(h2!)])).toEqual(
      COPY.map(([id, h2]) => [id, h2]),
    );
  });

  test.each(COPY)("the %s section reads as the copy", (id, h2, prose) => {
    expect(proseOf(id)).toBe(`${h2} ${prose}`);
  });

  test("gives each mark in the prose a name that screen readers read", () => {
    const marks = (id: string) => [...sectionOf(id).matchAll(/<span class="(?:mark|start)"[^>]*aria-label="([^"]*)"[^>]*>([^<]*)<\/span>/g)].map(([, label, mark]) => [mark, label]);
    expect(marks("declared")).toEqual([[MARKS.all, "check mark"], [MARKS.some, "half circle"], [MARKS.none, "dash"]]);
    expect(marks("start-test")).toEqual([["●", "dot"], ["✕", "cross"]]);
  });

  test("the title, the meta description, the h1, and the intro read as the copy, and the intro links the site docs", () => {
    const html = about();
    expect(/<title>([^<]*)<\/title>/.exec(html)?.[1]).toBe("About: Zotdex");
    expect(unescaped(/<meta name="description" content="([^"]*)">/.exec(html)?.[1] ?? "")).toBe(
      "How Zotdex works: what the facts on a plugin page mean and what they don't tell you.",
    );
    const hero = /<div class="hero">(.*?)<\/div>/s.exec(html)![1]!;
    expect(blockText(`<main>${hero}</main>`)).toBe(
      "How Zotdex works Every day, Zotdex reads each listed plugin's GitHub repository and releases. " +
        "Here's what the facts on a plugin page mean, and what they don't tell you. The site docs on GitHub have the full rules.",
    );
    expect(hero).toContain("<h1>How Zotdex works</h1>");
    expect([...hero.matchAll(/<a href="([^"]*)"[^>]*>([^<]*)<\/a>/g)].map(([, href, text]) => [href, text])).toEqual([
      ["https://github.com/jmgirard/zotdex/blob/main/docs/site.md", "site docs"],
    ]);
  });

  test("links the removal form and the license page from their phrases, and nothing else from those sections", () => {
    const links = (id: string) => [...sectionOf(id).matchAll(/<a href="([^"]*)"[^>]*>([^<]*)<\/a>/g)].map(([, href, text]) => [unescaped(href!), text]);
    expect(links("removing")).toEqual([[REMOVE_PLUGIN_HREF, "form for removing a plugin or reporting harm"]]);
    expect(links("license")).toEqual([[LICENSE_HREF, "license page"]]);
  });

  test("says 3 seconds, 90 seconds, and 7 days: the reporter's wait after the install, the start's time limit, and how long older data stays", () => {
    const reporter = readFileSync(resolve(ROOT, "src/start-test/reporter/bootstrap.js"), "utf8");
    expect(/^const SETTLE_MS = (\d+);$/m.exec(reporter)?.[1]).toBe("3000");
    expect(START_LIMIT_MS).toBe(90 * 1000);
    expect(KEEP_MS).toBe(7 * 24 * 60 * 60 * 1000);
  });

  test.each(["about/index.html", "404.html"])("%s says none of the index's old names", (file) => {
    const text = unescaped(readFileSync(join(out, file), "utf8").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").toLowerCase();
    expect(text).toContain("zotdex");
    for (const words of ["the index", "start test", "declared range"]) expect(text, words).not.toContain(words);
  });

  test("lists every category, and links each that the home menu offers to the home page filtered by it", () => {
    const section = /<section class="card" id="categories" data-about="categories">(.*?)<\/section>/s.exec(about());
    expect(section).not.toBeNull();
    expect(section![1]).toContain('<ul class="about-list" role="list" data-category-list>');
    const items = [...section![1]!.matchAll(/<li>(?:<a href="([^"]*)">)?([^<:]*)(?:<\/a>)?: ([^<]*)<\/li>/g)].map(([, href, name, text]) => [
      href,
      unescaped(name!),
      unescaped(text!),
    ]);
    // The fixture's records have 5 of the categories, so the others name no link.
    const offered = new Set((fixture.plugins as PluginRecord[]).flatMap((record) => categories(record)));
    expect(offered.size).toBe(5);
    expect(items).toEqual(
      CATEGORIES.map(({ slug, name, about }) => [offered.has(slug) ? `/?category=${slug}` : undefined, name, about]),
    );
  });

  // Each sentence that moved to the About page, as it read on a plugin page before.
  const MOVED = ["waits 3 seconds", "A start test does not show that the plugin works", "An override marked", "The declared range above uses"];

  test.each(ids)("leaves the moved method sentences off the page of %s, and links the About page once in the compatibility card", (id) => {
    const html = page(id);
    // The whole page, as markup and as text with the tags removed.
    const text = unescaped(html.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ");
    for (const sentence of MOVED) {
      expect(html, sentence).not.toContain(sentence);
      expect(text, sentence).not.toContain(sentence);
    }
    const main = html.slice(html.indexOf("<main>"), html.indexOf("</main>"));
    expect(main.split('href="/about/"').length - 1).toBe(1);
    const line = /<p class="fineprint" data-about-line>(.*?)<\/p>/s.exec(main)?.[1];
    expect(line).toMatch(/<a href="\/about\/">How Zotdex reads plugins<\/a>\s*$/);
    if (hasBound(records.find((r) => r.id === id)!)) expect(line).toMatch(/^\s*Supported versions: <span data-fact="declared-range">/);
    const card = sections(html).find(({ name }) => name === "compatibility")!.body;
    expect(card).toContain("data-about-line");
    if (records.find((r) => r.id === id)!.upstream) expectInOrder(card, ["</table>", "data-about-line", 'data-fact="report-prompt"']);
    else expectInOrder(card, ['data-fact="failure"', "data-about-line"]);
  });
});

describe("the home page", () => {
  test("links each plugin to the directory of its raw id", () => {
    const html = readFileSync(join(out, "index.html"), "utf8");
    const linked = [...html.matchAll(/href="\/plugins\/([^/"]+)\/"/g)].map((m) =>
      decodeURIComponent(m[1]!),
    );
    expect(linked.sort()).toEqual([...ids].sort());
    for (const id of linked) expect(existsSync(join(out, "plugins", id, "index.html")), id).toBe(true);
  });

  // The table's body rows, each with its attributes and its cells, the row header first.
  function rows() {
    const html = home();
    const body = html.slice(html.indexOf("<tbody>"), html.indexOf("</tbody>"));
    return [...body.matchAll(/<tr([^>]*)>(.*?)<\/tr>/gs)].map(([, attributes, inner]) => ({
      attributes: attributes!,
      id: unescaped(/^ data-plugin="([^"]*)"/.exec(attributes!)![1]!),
      cells: [...inner!.matchAll(/<(t[dh])([^>]*)>(.*?)<\/\1>/gs)].map(([, tag, cellAttributes, cell]) => ({
        attributes: cellAttributes!,
        html: cell!,
        tag: tag!,
      })),
    }));
  }

  function row(id: string) {
    const found = rows().find((r) => r.id === id);
    expect(found, id).toBeDefined();
    return found!;
  }

  test("holds one table whose body has one row per record, most stars first and then by name and id", () => {
    expect(home().match(/<table[\s>]/g)).toHaveLength(1);
    expect(rows().map(({ id }) => id)).toEqual([
      "same-name-plugin@example.org",
      "first-plugin@example.org",
      "old-plugin@example.org",
      // A count of 0 comes before the rows with no count.
      "{c2a6e4c8-1b7d-4f3a-9e2b-5d8f0a1c3e7b}",
      "_x-y+z.w@{v}",
      "broken-plugin@example.org",
      // "Café Tools" and "cafe tools" compare equal, so their ids order them.
      "a-cafe@example.org",
      "b-cafe@example.org",
      "locale-plugin@example.org",
      "min-only-plugin@example.org",
      "next-plugin@example.org",
      "no-range-plugin@example.org",
      "repo-fragment@example.org",
      "repo-gitlab@example.org",
      "repo-http@example.org",
      "repo-owner-query@example.org",
      "repo-path@example.org",
      "repo-query@example.org",
      "ssh-plugin@example.org",
      "zotero6-plugin@example.org",
    ]);
  });

  test.each(ids)("shows the name cell of %s", (id) => {
    const record = records.find((r) => r.id === id)!;
    const description = shownDescription(record);
    const owner = githubRepo(record.upstream?.repoUrl ?? record.repoUrl)?.owner;
    expect(row(id).cells[0]!.attributes).toBe(' scope="row" class="name"');
    expect(row(id).cells.map(({ tag }) => tag)).toEqual(["th", ...row(id).cells.slice(1).map(() => "td")]);
    expect(row(id).cells[0]!.html).toBe(
      `<a href="${escaped(pluginHref(id))}" data-name>${escaped(displayName(record))}</a>` +
        (record.upstream?.archived === true ? '<span class="badge" data-archived>Archived</span>' : "") +
        (record.upstream?.sourceInRepo === false ? ` ${noSourceMark(LOCK_SVG)}` : "") +
        (record.paidService ? ` ${paidMark(CARD_SVG)}` : "") +
        (owner
          ? `<div class="owner" data-owner><span class="owner-name">By ${escaped(owner)}</span> ` +
            (record.upstream?.stars === undefined
              ? ""
              : `<span class="row-stars"><span aria-hidden="true" title="${starsText(record.upstream.stars)}">· ${STAR_SVG} ${record.upstream.stars.toLocaleString("en")}</span> <span class="visually-hidden">${starsText(record.upstream.stars)}</span></span>`) +
            "</div>"
          : "") +
        (description ? `<div class="desc" data-description>${escaped(description)}</div>` : ""),
    );
  });

  const shownOwner = (id: string) => /<div class="owner" data-owner><span class="owner-name">By ([^<]*)<\/span>/.exec(row(id).cells[0]!.html)?.[1];

  // same-name-plugin's two repo URLs name different owners, so its row also shows that the
  // upstream URL comes first.
  test.each([
    ["first-plugin@example.org", "example"],
    ["broken-plugin@example.org", "example"],
    ["same-name-plugin@example.org", LONG_OWNER],
    ["repo-gitlab@example.org", undefined],
    ["ssh-plugin@example.org", undefined],
  ])("shows the owner of %s as %s", (id, owner) => {
    expect(shownOwner(id)).toBe(owner);
  });

  test("shows a record's star count after the owner, with the plugin page's words, and 0 as a count", () => {
    const stars = (id: string) => /<span class="owner-name">[^<]*<\/span> (<span class="row-stars">.*?)<\/div>/s.exec(row(id).cells[0]!.html)?.[1];
    const shown = (count: string, words: string) =>
      new RegExp(`^<span class="row-stars"><span aria-hidden="true" title="${words}">· <svg [^]*?</svg> ${count}</span> <span class="visually-hidden">${words}</span></span>$`);
    expect(stars("same-name-plugin@example.org")).toMatch(shown("98,765", starsText(98765)));
    expect(stars("{c2a6e4c8-1b7d-4f3a-9e2b-5d8f0a1c3e7b}")).toMatch(shown("0", starsText(0)));
    // A record with no count, and a failed read, show none.
    expect(stars("next-plugin@example.org")).toBeUndefined();
    expect(stars("broken-plugin@example.org")).toBeUndefined();
  });

  test("cuts only the owner's name, so a count stays whole", () => {
    const rules = cssRules(readFileSync(resolve(ROOT, "site/src/layouts/Base.astro"), "utf8"));
    const declared = (selector: string) => Object.fromEntries(rules.find((rule) => rule.selector === selector)?.declarations ?? []);
    expect(declared(".owner-name")).toMatchObject({ "min-width": "0", overflow: "hidden", "text-overflow": "ellipsis" });
    expect(declared(".row-stars")).toMatchObject({ flex: "none", color: "var(--muted)" });
    expect(declared(".row-stars .icon")).toMatchObject({ fill: "currentColor", stroke: "none" });
    expect(home()).not.toMatch(/class="row-stars"[^>]*data-repo-stars/);
  });

  test("says in the legend that the stars come from GitHub, that the list is sorted by them, and that they show popularity", () => {
    const item = /<li data-legend-stars>(.*?)<\/li>/s.exec(home())?.[1]?.replace(/\s+/g, " ");
    expect(item).toContain("GitHub stars. The list is sorted by stars, which shows popularity (not necessarily quality).");
  });

  test("reads the owner of a repo URL with a trailing slash", () => {
    expect(githubRepo("https://github.com/example/first-plugin/")?.owner).toBe("example");
  });

  test("shows each owner on two rows of one name", () => {
    const same = ["first-plugin@example.org", "same-name-plugin@example.org"];
    expect(same.map((id) => displayName(records.find((r) => r.id === id)!))).toEqual(["First Plugin", "First Plugin"]);
    expect(same.map(shownOwner)).toEqual(["example", LONG_OWNER]);
  });

  test("marks only the archived plugin", () => {
    expect(home().match(/\sdata-archived/g)).toHaveLength(1);
  });

  test("marks only the records with a paid service, one read and one failed", () => {
    const marked = rows().flatMap(({ id }) => (row(id).cells[0]!.html.includes("data-paid-service") ? [id] : []));
    expect(marked.sort()).toEqual(["next-plugin@example.org", "repo-path@example.org"]);
  });

  describe("marks a repo with no source", () => {
    const sourceLink = (id: string) => /<a href="[^"]*" data-link="source" title="([^"]*)" aria-label="([^"]*)">/.exec(row(id).cells.at(-1)!.html)?.slice(1);

    // A false record stays listed: its row is there, with its links.
    test("shows the mark and calls the link the repository for false", () => {
      expect(row("b-cafe@example.org").cells[0]!.html).toContain(noSourceMark(LOCK_SVG));
      expect(sourceLink("b-cafe@example.org")).toEqual(["Repository", expect.stringMatching(/^Repository of /)]);
    });

    test.each([
      ["true", "first-plugin@example.org"],
      ["no field", "no-range-plugin@example.org"],
    ])("shows no mark and keeps the source code link for %s", (_, id) => {
      expect(row(id).cells[0]!.html).not.toContain("data-no-source");
      expect(sourceLink(id)).toEqual(["Source code", expect.stringMatching(/^Source code of /)]);
    });

    test("marks only the one false record", () => {
      expect(home().match(/\sdata-no-source/g)).toHaveLength(1);
    });
  });

  // The declared mark and the start mark of one version cell.
  const MARK = /^(?:<span class="mark" data-support="([^"]+)" title="([^"]*)"><span aria-hidden="true">([^<]*)<\/span><span class="visually-hidden">([^<]*)<\/span><\/span>)?(?:<span class="start" data-start="([^"]+)" title="([^"]*)"><span aria-hidden="true">([^<]*)<\/span><span class="visually-hidden">([^<]*)<\/span><\/span>)?$/;

  // The start result for a major, found here without majorStart: the newest of the major's results.
  function newestStart(record: PluginRecord, major: string) {
    const results = (record.startTests ?? []).filter(({ zotero }) => zotero.split(".")[0] === major);
    return results.sort((a, b) => compareVersions(b.zotero, a.zotero))[0];
  }

  const START_WORDS: Record<string, string> = {
    started: "loaded",
    "start-error": "failed to load",
    "not-installed": "didn't install",
    "timed-out": "didn't finish loading",
  };

  test.each(ids)("shows the version cells of %s: a declared mark and a start mark per major, or Not read", (id) => {
    const record = records.find((r) => r.id === id)!;
    const cells = row(id).cells.slice(1, record.failure ? 2 : 1 + ZOTERO_MAJORS.length);
    if (record.failure) {
      expect(cells[0]).toEqual({ attributes: ' class="v not-read" colspan="4" data-status="failure"', html: "Not read", tag: "td" });
      expect(row(id).cells.some(({ attributes }) => attributes.includes("data-major"))).toBe(false);
      return;
    }
    const marks: Record<string, string> = { all: "✓", some: "◐", none: "–" };
    const label = (major: string, support: string) =>
      support === "all"
        ? `Supports Zotero ${major}`
        : support === "some"
          ? `Supports some of Zotero ${major} (${rangeText(record)})`
          : `Doesn't support Zotero ${major}`;
    expect(cells.map(({ attributes }) => attributes)).toEqual(ZOTERO_MAJORS.map((major) => ` class="v" data-major="${major}"`));
    ZOTERO_MAJORS.forEach((major, i) => {
      const found = MARK.exec(cells[i]!.html);
      expect(found, `${id} ${major}: ${cells[i]!.html}`).not.toBeNull();
      const [, support, title, visible, hidden, start, startTitle, startVisible, startHidden] = found!;
      const declared = majorSupport(record, major);
      expect(support, major).toBe(declared);
      if (declared) {
        expect([unescaped(title!), visible, unescaped(hidden!)]).toEqual([label(major, declared), marks[declared], label(major, declared)]);
      }
      const result = newestStart(record, major);
      expect(start, major).toBe(result?.result);
      if (result) {
        const words = `Startup check: ${START_WORDS[result.result]} in Zotero ${result.zotero}`;
        expect([unescaped(startTitle!), startVisible, unescaped(startHidden!)]).toEqual([words, result.result === "started" ? "●" : "✕", words]);
      }
    });
  });

  test("shows the newest start result of a major and none for a declared major with no result", () => {
    const cells = row("a-cafe@example.org").cells;
    const starts = cells.slice(1, 5).map(({ html }) => /<span class="start" data-start="([^"]+)" title="([^"]*)"/.exec(html)?.slice(1));
    expect(starts).toEqual([["started", "Startup check: loaded in Zotero 7.0.32"], ["started", "Startup check: loaded in Zotero 8.0.10"], undefined, undefined]);
    const bare = row("no-range-plugin@example.org").cells.slice(1, 5).map(({ html }) => [html.includes('class="mark"'), /data-start="([^"]+)"/.exec(html)?.[1]]);
    expect(bare).toEqual([[false, "started"], [false, "start-error"], [false, "not-installed"], [false, "timed-out"]]);
  });

  // The language codes a row shows, found here without shortLanguages.
  function codes(record: PluginRecord): string[] {
    const subtags = [...new Set(appliedLanguages(record).map((tag) => new Intl.Locale(tag).language))];
    return subtags.length <= 3 ? subtags : [...subtags.slice(0, 2), `+${subtags.length - 2}`];
  }

  test.each(ids)("shows the languages, the release date, and the links of %s", (id) => {
    const record = records.find((r) => r.id === id)!;
    const cells = row(id).cells;
    const [languages, date, links] = cells.slice(-3);
    expect(cells).toHaveLength((record.failure ? 2 : 1 + ZOTERO_MAJORS.length) + 3);
    expect(languages!.attributes).toBe(' class="lang" data-languages-shown');
    expect([...languages!.html.matchAll(/<abbr[^>]*>([^<]*)<\/abbr>/g)].map(([, text]) => text)).toEqual(codes(record));
    // One space between codes, so a screen reader does not read them as one word.
    expect(languages!.html.replace(/<abbr[^>]*>[^<]*<\/abbr>/g, "")).toBe(" ".repeat(Math.max(0, codes(record).length - 1)));
    const released = record.upstream?.latestReleaseDate;
    expect(date!.html).toBe(
      released
        ? `<time datetime="${released.slice(0, 7)}">${released.slice(0, 7)}</time>`
        : "",
    );
    const linked = [...links!.html.matchAll(/<a href="([^"]*)" data-link="([^"]+)"/g)].map(([, href, kind]) => [kind, unescaped(href!)]);
    const source = safeHref(record.upstream?.repoUrl ?? record.repoUrl);
    const xpi = record.upstream?.xpiUrl && safeHref(record.upstream.xpiUrl);
    expect(linked).toEqual([...(source ? [["source", source]] : []), ...(xpi ? [["download", xpi]] : [])]);
  });

  test("shows the first two of four or more language codes and names the rest", () => {
    const html = row("a-cafe@example.org").cells.at(-3)!.html;
    expect(html).toBe('<abbr title="French">fr</abbr> <abbr title="German">de</abbr> <abbr class="more" title="Japanese, English, Italian">+3</abbr>');
    expect(row("b-cafe@example.org").cells.at(-3)!.html).toBe(`<abbr title="${languageName("en")}">en</abbr>`);
  });

  // The site builds in New York time (pnpmSite), where 02:00 UTC on the 1st is still the month before.
  test("shows the release month in UTC", () => {
    expect(row("a-cafe@example.org").cells.at(-2)!.html).toBe('<time datetime="2026-11">2026-11</time>');
  });

  test("links a source and a download only when the address passes", () => {
    const kinds = (id: string) => [...row(id).cells.at(-1)!.html.matchAll(/data-link="([^"]+)"/g)].map(([, kind]) => kind);
    expect(kinds("a-cafe@example.org")).toEqual(["source", "download"]);
    // An ftp: xpiUrl, no xpiUrl, and a repoUrl that is not a web address.
    expect(kinds("b-cafe@example.org")).toEqual(["source"]);
    expect(kinds("first-plugin@example.org")).toEqual(["source"]);
    expect(kinds("ssh-plugin@example.org")).toEqual([]);
    expect(row("a-cafe@example.org").cells.at(-1)!.html).toContain(
      'title="Download version 2.0.0 (.xpi)" aria-label="Download Café Tools 2.0.0 (.xpi)"',
    );
  });

  test("names each declared mark and each start mark in a legend under the table, and says the startup check tests no features", () => {
    const html = home();
    const legend = /<ul class="legend" role="list" data-legend>(.*?)<\/ul>/s.exec(html);
    expect(legend).not.toBeNull();
    expect(html.indexOf("<ul class=\"legend\"")).toBeGreaterThan(html.indexOf("</table>"));
    const items = [...legend![1]!.matchAll(/<li[^>]*>(.*?)<\/li>/gs)].map(([, item]) => item!.replace(/\s+/g, " "));
    expect(items).toEqual([
      '<span class="mark" data-support="all" aria-hidden="true">✓</span> Supports this version of Zotero',
      '<span class="mark" data-support="some" aria-hidden="true">◐</span> Supports some releases of this version',
      '<span class="mark" data-support="none" aria-hidden="true">–</span> Doesn\'t support this version',
      '<span class="badge" aria-hidden="true">Older data</span> Zotdex couldn\'t reach this plugin today, so this row shows what it found in the past week',
      `${LOCK_SVG} ${NO_SOURCE_TEXT}`,
      `${CARD_SVG} ${PAID_TEXT}`,
      '<span class="start" data-start="started" aria-hidden="true">●</span> Passed Zotdex\'s startup check: it installs and loads, but its features aren\'t tested',
      '<span class="start" data-start="start-error" aria-hidden="true">✕</span> Failed Zotdex\'s startup check: it didn\'t install or load',
      `<span class="row-stars" aria-hidden="true">${STAR_SVG}</span> GitHub stars. The list is sorted by stars, which shows popularity (not necessarily quality).`,
    ]);
  });

  test("gives each row its record's star count and release date, and neither to a record without them", () => {
    const value = (attributes: string, name: string) => new RegExp(`\\s${name}="([^"]*)"`).exec(attributes)?.[1];
    const facts = Object.fromEntries(rows().map(({ id, attributes }) => [id, [value(attributes, "data-stars"), value(attributes, "data-released")]]));
    expect(facts).toEqual(
      Object.fromEntries(records.map(({ id, upstream }) => [id, [upstream?.stars?.toString(), upstream?.latestReleaseDate]])),
    );
    // A count of 0 is written, and a failed read writes neither.
    expect(facts["{c2a6e4c8-1b7d-4f3a-9e2b-5d8f0a1c3e7b}"]![0]).toBe("0");
    expect(facts["broken-plugin@example.org"]).toEqual([undefined, undefined]);
  });

  test("holds a sort menu whose first option is Most stars", () => {
    const menu = /<p class="sort-menu"><label for="sort">Sort by<\/label> <select id="sort" data-sort autocomplete="off">(.*?)<\/select><\/p>/.exec(home());
    expect(menu).not.toBeNull();
    expect([...menu![1]!.matchAll(/<option value="([^"]*)">([^<]*)<\/option>/g)].map(([, value, text]) => [value, text])).toEqual([
      ["", "Most stars"],
      ["name", "Name"],
      ["latest", "Recently updated"],
    ]);
  });

  test("gives each row the language subtags it applies", () => {
    expect(Object.fromEntries(rows().map(({ id, attributes }) => [id, /\sdata-languages="([^"]*)"/.exec(attributes)?.[1]]))).toEqual(Object.fromEntries([
      ["_x-y+z.w@{v}", ""],
      ["broken-plugin@example.org", ""],
      ["a-cafe@example.org", "de en fr it ja"],
      ["b-cafe@example.org", "en"],
      ["first-plugin@example.org", "en es zh"],
      ["same-name-plugin@example.org", ""],
      ["{c2a6e4c8-1b7d-4f3a-9e2b-5d8f0a1c3e7b}", ""],
      ["locale-plugin@example.org", "es pt"],
      ["min-only-plugin@example.org", "zh"],
      ["next-plugin@example.org", ""],
      ["no-range-plugin@example.org", "de fr"],
      ["old-plugin@example.org", ""],
      ...NO_REPO_LINE_IDS.map((id) => [id, ""]),
      ["ssh-plugin@example.org", ""],
      ["zotero6-plugin@example.org", ""],
    ]));
  });

  test("gives each row the Zotero majors it declares all or part of", () => {
    expect(Object.fromEntries(rows().map(({ id, attributes }) => [id, /\sdata-zotero="([^"]*)"/.exec(attributes)?.[1]]))).toEqual(Object.fromEntries([
      ["_x-y+z.w@{v}", ""],
      ["broken-plugin@example.org", ""],
      ["a-cafe@example.org", "7 8 9"],
      ["b-cafe@example.org", "7"],
      ["first-plugin@example.org", "7 8"],
      ["same-name-plugin@example.org", ""],
      ["{c2a6e4c8-1b7d-4f3a-9e2b-5d8f0a1c3e7b}", "9"],
      ["locale-plugin@example.org", "7 8 9"],
      ["min-only-plugin@example.org", "8 9 10"],
      ["next-plugin@example.org", "8 9 10"],
      ["no-range-plugin@example.org", ""],
      ["old-plugin@example.org", "7"],
      ...NO_REPO_LINE_IDS.map((id) => [id, ""]),
      ["ssh-plugin@example.org", ""],
      ["zotero6-plugin@example.org", ""],
    ]));
  });

  test("holds version buttons, Any pressed, then one for each major", () => {
    const group = /<div class="version-filter"><span id="([^"]+)">Supports Zotero<\/span><div role="group" aria-labelledby="([^"]+)" data-version-filter>(.*?)<\/div><\/div>/.exec(home());
    expect(group).not.toBeNull();
    expect(group![2]).toBe(group![1]);
    const buttons = [...group![3]!.matchAll(/<button([^>]*)>([^<]*)<\/button>/g)].map(([, attributes, text]) => [attributes, text]);
    expect(group![3]!.replace(/<button[^>]*>[^<]*<\/button>/g, "")).toBe("");
    expect(buttons).toEqual([
      [' type="button" aria-pressed="true"', "Any"],
      ...["7", "8", "9", "10"].map((major) => [` type="button" value="${major}" aria-pressed="false"`, major]),
    ]);
  });

  test("holds a language menu with one option for each subtag, most plugins first", () => {
    const menu = /<p class="language-filter"><label for="language">Language<\/label> <select id="language" data-language-filter autocomplete="off">(.*?)<\/select><\/p>/.exec(home());
    expect(menu).not.toBeNull();
    const options = [...menu![1]!.matchAll(/<option value="([^"]*)">([^<]*)<\/option>/g)].map(([, value, text]) => [value, text]);
    expect(options).toEqual([
      ["", "Any language"],
      ["en", "English (3)"],
      ["zh", "Chinese (2)"],
      ["fr", "French (2)"],
      ["de", "German (2)"],
      ["es", "Spanish (2)"],
      ["it", "Italian (1)"],
      ["ja", "Japanese (1)"],
      ["pt", "Portuguese (1)"],
    ]);
  });

  test("gives each row the slugs of its record's categories", () => {
    const expected = homeOrder(fixture.plugins as PluginRecord[]).map((record) => [record.id, categories(record).join(" ")]);
    expect(rows().map(({ id, attributes }) => [id, /\sdata-categories="([^"]*)"/.exec(attributes)?.[1]])).toEqual(expected);
    expect(expected.filter(([, slugs]) => slugs !== "").length).toBeGreaterThan(1);
    expect(expected.filter(([, slugs]) => slugs === "").length).toBeGreaterThan(1);
  });

  test("holds a category menu with one option for each category a row has, most rows first, ties in list order, and Other tools last", () => {
    const menu = /<p class="category-filter"><label for="category">Category<\/label> <select id="category" data-category-filter autocomplete="off">(.*?)<\/select><\/p>/.exec(home());
    expect(menu).not.toBeNull();
    const options = [...menu![1]!.matchAll(/<option value="([^"]*)">([^<]*)<\/option>/g)].map(([, value, text]) => [value, text]);
    // Three categories tie at 1, and their names in alphabetical order would put "Library
    // organization" first; Notes and the other categories have no row.
    expect(options).toEqual([
      ["", "All categories"],
      ["attachments", "Attachments and full text (2)"],
      ["translation", "Translation and dictionaries (1)"],
      ["pdf-reading", "PDF reading (1)"],
      ["organization", "Library organization (1)"],
      ["other", "Other tools (7)"],
    ]);
  });

  test("holds every row without hidden, and the search box, the menus, the buttons, the sort menu, the count, and the pager inside hidden elements", () => {
    const html = home();
    expect(rows().length).toBe(ids.length);
    for (const { id, attributes } of rows()) expect(attributes, id).not.toMatch(/\shidden[\s=]|\shidden$/);
    const controls = /<div class="controls" hidden>(.*?)<\/div><div class="results" hidden>(.*?)<\/div><div class="table-card">/s.exec(html);
    expect(controls).not.toBeNull();
    const [, filters, results] = controls!;
    expect(filters).toMatch(/^<p class="search"><label for="search" class="visually-hidden">Search plugins<\/label><svg [^]*?<\/svg><input type="search" id="search" data-search placeholder="Search plugins" autocomplete="off"><\/p>/);
    expect(filters).toMatch(/<p class="category-filter"><label[^>]*>[^<]*<\/label> <select[^>]*>(?:<option[^>]*>[^<]*<\/option>)+<\/select><\/p>/);
    expect(filters).toMatch(/<p class="language-filter"><label[^>]*>[^<]*<\/label> <select[^>]*>(?:<option[^>]*>[^<]*<\/option>)+<\/select><\/p>/);
    expect(filters).toMatch(/<div class="version-filter"><span[^>]*>[^<]*<\/span><div role="group"[^>]*>(?:<button[^>]*>[^<]*<\/button>)+<\/div><\/div>$/);
    expect(results).toMatch(/^<p class="filter-status" role="status" data-filter-status hidden><\/p><p class="sort-menu"><label[^>]*>[^<]*<\/label> <select[^>]*>(?:<option[^>]*>[^<]*<\/option>)+<\/select><\/p>$/);
    expect(html.match(/<input[\s>]/g)).toHaveLength(1);
    expect(html.match(/<select[\s>]/g)).toHaveLength(3);
    expect(html.match(/<button[\s>]/g)).toHaveLength(ZOTERO_MAJORS.length + 4);
    expect(html.match(/\sdata-filter-status/g)).toHaveLength(1);
    expect(html).toContain(
      '</table></div><nav class="pager" aria-label="Pages" data-pager hidden><button type="button" data-page-step="-1">Previous</button><span role="status" data-page-status></span><button type="button" data-page-step="1">Next</button></nav></div><ul class="legend"',
    );
  });

  test("hides each control's element while it has hidden, whatever display its other rules give it", () => {
    const hiding = cssRules(readFileSync(resolve(ROOT, "site/src/layouts/Base.astro"), "utf8")).filter(({ declarations }) =>
      declarations.some(([property, value]) => property === "display" && value === "none"),
    );
    const selectors = hiding.flatMap(({ selector }) => selector.split(",").map((part) => part.trim()));
    for (const control of ["[data-theme-toggle][hidden]", ".controls[hidden]", ".results[hidden]", ".filter-status[hidden]", ".pager[hidden]"]) {
      expect(selectors, control).toContain(control);
    }
  });
});

// The built home page script run against stand-ins for the elements it reads, so a test can
// type in the search box, load an address, or go Back, and read which rows it hides.
// A generated row, "gen-<n>@example.org" named "Bulk <n>" with n from 001, after the built
// rows. Its description holds "alpha" for n up to 50, "beta" up to 51, and "gamma" up to 20,
// so a search can pass exactly 50, 51, or 20 of them. Each one is in the translation category.
function generatedRow(n: number) {
  const tags = [n <= 20 && "gamma", n <= 50 && "alpha", n <= 51 && "beta"].filter(Boolean).join(" ");
  const fields: Record<string, string> = { name: `Bulk ${String(n).padStart(3, "0")}`, description: tags };
  return {
    hidden: false,
    dataset: { plugin: `gen-${n}@example.org`, languages: "", zotero: "", categories: "translation", stars: undefined as string | undefined, released: undefined as string | undefined },
    querySelector: (selector: string) => {
      const field = fields[selector.slice(6, -1)];
      return field ? { textContent: field } : null;
    },
  };
}

function homeScript(href: string, generated = 0, missing?: "search" | "category" | "menu" | "buttons" | "sort" | "tbody") {
  const html = home();
  const script = /<script type="module">(.*?)<\/script>/s.exec(html)![1]!;
  const shown = new Set<string>();
  const wrapper = (name: string) => ({ removeAttribute: (attribute: string) => attribute === "hidden" && shown.add(name) });
  const events = new Map<string, () => void>();
  const listen = (name: string) => (type: string, handler: () => void) => events.set(`${name}:${type}`, handler);
  const search = { value: "", addEventListener: listen("search"), closest: () => wrapper("search") };
  // The options of the select whose attribute is marker.
  const optionsOf = (marker: string) => {
    const menu = new RegExp(`<select[^>]*\\s${marker}[\\s>][^]*?</select>`).exec(html)![0];
    return [...menu.matchAll(/<option value="([^"]*)">/g)].map(([, value]) => ({ value: unescaped(value!) }));
  };
  const select = { value: "", options: optionsOf("data-language-filter"), addEventListener: listen("select"), closest: () => wrapper("menu") };
  const categorySelect = {
    value: "",
    options: optionsOf("data-category-filter"),
    addEventListener: listen("category"),
    closest: () => wrapper("category"),
  };
  const sortSelect = { value: "", options: optionsOf("data-sort"), addEventListener: listen("sort"), closest: () => wrapper("sort") };
  const buttons = [...html.matchAll(/<button type="button"(?: value="([^"]*)")? aria-pressed="[^"]*">/g)].map(([, value]) => ({
    value: value ?? "",
    addEventListener: () => {},
    setAttribute: () => {},
    closest: () => wrapper("buttons"),
  }));
  const status = { textContent: "", removeAttribute: () => shown.add("count") };
  const body = html.slice(html.indexOf("<tbody>"), html.indexOf("</tbody>"));
  const tableRows = [
    ...body.matchAll(/<tr data-plugin="([^"]*)" data-languages="([^"]*)" data-zotero="([^"]*)" data-categories="([^"]*)"(?: data-stars="([^"]*)")?(?: data-released="([^"]*)")?>(.*?)<\/tr>/gs),
  ].map(([, plugin, languages, zotero, categories, stars, released, inner]) => {
    const text = (attribute: string) => {
      const found = new RegExp(`\\s${attribute}>([^<]*)<`).exec(inner!);
      return found ? { textContent: unescaped(found[1]!) } : null;
    };
    return {
      hidden: false,
      dataset: { plugin: unescaped(plugin!), languages, zotero, categories, stars: stars as string | undefined, released: released as string | undefined },
      querySelector: (selector: string) => text(selector.slice(1, -1)),
    };
  });
  tableRows.push(...Array.from({ length: generated }, (_, i) => generatedRow(i + 1)));
  // Appending rows that the body holds moves them, in that order.
  const tbody = { append: (...moved: typeof tableRows) => tableRows.splice(0, tableRows.length, ...moved) };
  const pager = { hidden: true };
  const pageStatus = { textContent: "" };
  const steps = [
    ["previous", "-1"],
    ["next", "1"],
  ].map(([name, pageStep]) => {
    const attributes = new Map<string, string>();
    return {
      name,
      dataset: { pageStep },
      attributes,
      setAttribute: (attribute: string, value: string) => attributes.set(attribute, value),
      getAttribute: (attribute: string) => attributes.get(attribute) ?? null,
      addEventListener: listen(name),
    };
  });
  let scrolls = 0;
  const table = { scrollIntoView: () => scrolls++ };
  // The style that the classic script adds to the head.
  // How many rows were hidden when the module script removed it, or undefined before then.
  let hiddenAtRemoval: number | undefined;
  const prePaint = { remove: () => (hiddenAtRemoval = tableRows.filter((row) => row.hidden).length) };
  const lookups: Record<string, unknown> = {
    "input[data-search]": missing === "search" ? null : search,
    "select[data-category-filter]": missing === "category" ? null : categorySelect,
    "select[data-language-filter]": missing === "menu" ? null : select,
    "select[data-sort]": missing === "sort" ? null : sortSelect,
    tbody: missing === "tbody" ? null : tbody,
    "[data-filter-status]": status,
    "[data-pager]": pager,
    "[data-page-status]": pageStatus,
    ".table-card": table,
    "style[data-pre-paint]": prePaint,
  };
  const lists: Record<string, unknown[]> = {
    "[data-version-filter] button": missing === "buttons" ? [] : buttons,
    "tbody tr[data-plugin]": tableRows,
    "[data-pager] button": steps,
  };
  const location = { href };
  const document = {
    querySelector: (selector: string) => {
      if (!(selector in lookups)) throw new Error(`the script asks for ${selector}`);
      return lookups[selector];
    },
    querySelectorAll: (selector: string) => {
      if (!(selector in lists)) throw new Error(`the script asks for all ${selector}`);
      return lists[selector];
    },
  };
  const writes: string[] = [];
  const pushes: string[] = [];
  const history = {
    replaceState: (_state: unknown, _title: string, next: string) => {
      location.href = String(next);
      writes.push(location.href);
    },
    pushState: (_state: unknown, _title: string, next: string) => {
      location.href = String(next);
      pushes.push(location.href);
    },
  };
  // Timers wait until the test runs them, as the page's would wait for a pause in typing.
  const timers = new Map<number, { run: () => void; delay: number }>();
  let nextTimer = 0;
  const setTimeout = (run: () => void, delay: number) => (timers.set(++nextTimer, { run, delay }), nextTimer);
  const clearTimeout = (timer?: number) => timers.delete(timer!);
  runInNewContext(script, { document, location, history, URL, setTimeout, clearTimeout, addEventListener: listen("window") });
  return {
    search,
    select,
    categorySelect,
    sortSelect,
    status,
    location,
    shown,
    writes,
    pushes,
    timers,
    pager,
    pageStatus,
    steps,
    scrolls: () => scrolls,
    hiddenAtRemoval: () => hiddenAtRemoval,
    all: () => tableRows.map((r) => r.dataset.plugin),
    visible: () => tableRows.filter((r) => !r.hidden).map((r) => r.dataset.plugin),
    fire: (name: string) => events.get(name)!(),
    runTimers: () => {
      for (const [timer, { run }] of [...timers]) (timers.delete(timer), run());
    },
  };
}

describe("the home page script", () => {
  const PAGE = "https://zotdex.jmgirard.com/";

  test("reads q into the search box on load and shows only the rows it matches", () => {
    const page = homeScript(`${PAGE}?q=TOOLS`);
    expect(page.search.value).toBe("TOOLS");
    expect(page.visible()).toEqual(["a-cafe@example.org", "b-cafe@example.org"]);
    expect(page.status.textContent).toBe(`2 of ${ids.length} plugins`);
    expect([...page.shown].sort()).toEqual(["buttons", "category", "count", "menu", "search", "sort"]);
  });

  describe("the sort menu", () => {
    const built = homeOrder(fixture.plugins as PluginRecord[]);
    const named = [
      "_x-y+z.w@{v}",
      "broken-plugin@example.org",
      "a-cafe@example.org",
      "b-cafe@example.org",
      "first-plugin@example.org",
    ];

    test("leaves the built order and the address alone by default", () => {
      const page = homeScript(PAGE);
      expect(page.sortSelect.value).toBe("");
      expect(page.all()).toEqual(built.map(({ id }) => id));
      expect(page.location.href).toBe(PAGE);
    });

    test("reads sort=name and sort=latest on load, and each gives its order", () => {
      const byName = homeScript(`${PAGE}?sort=name`);
      expect(byName.sortSelect.value).toBe("name");
      expect(byName.all().slice(0, named.length)).toEqual(named);
      expect(byName.location.href).toBe(`${PAGE}?sort=name`);
      const byDate = homeScript(`${PAGE}?sort=latest`);
      const dates = byDate.all().map((id) => built.find((record) => record.id === id)!.upstream?.latestReleaseDate);
      const known = dates.filter((date) => date !== undefined);
      expect(known.length).toBeGreaterThan(1);
      expect(known).toEqual(known.toSorted().toReversed());
      expect(dates.slice(0, known.length)).toEqual(known);
      expect(byDate.location.href).toBe(`${PAGE}?sort=latest`);
    });

    test.each(["stars", "x", ""])("removes sort=%s and keeps the built order", (value) => {
      const page = homeScript(`${PAGE}?sort=${value}&zotero=7`);
      expect(page.sortSelect.value).toBe("");
      expect(page.location.href).toBe(`${PAGE}?zotero=7`);
      expect(page.all()).toEqual(built.map(({ id }) => id));
    });

    test("a change reorders the rows, shows page 1, and writes the address, and Stars removes the parameter", () => {
      const page = homeScript(`${PAGE}?page=2`, 60);
      expect(page.pageStatus.textContent).toMatch(/^Page 2 /);
      page.sortSelect.value = "name";
      page.fire("sort:change");
      expect(page.pageStatus.textContent).toMatch(/^Page 1 /);
      expect(page.location.href).toBe(`${PAGE}?sort=name`);
      // "Bulk 001" sorts after "Broken", so the generated rows follow.
      expect(page.visible().slice(0, 3)).toEqual(["_x-y+z.w@{v}", "broken-plugin@example.org", "gen-1@example.org"]);
      page.sortSelect.value = "";
      page.fire("sort:change");
      expect(page.location.href).toBe(PAGE);
      expect(page.visible()[0]).toBe(built[0]!.id);
    });

    test("Back and Forward read the order from the address", () => {
      const page = homeScript(PAGE);
      page.location.href = `${PAGE}?sort=name`;
      page.fire("window:popstate");
      expect(page.sortSelect.value).toBe("name");
      expect(page.all().slice(0, named.length)).toEqual(named);
      page.location.href = PAGE;
      page.fire("window:popstate");
      expect(page.sortSelect.value).toBe("");
      expect(page.all().slice(0, built.length)).toEqual(built.map(({ id }) => id));
    });

    test("the filters pass rows in the chosen order", () => {
      // Stars puts same-name-plugin first, and Name ties them and orders by id.
      expect(homeScript(`${PAGE}?q=first+plugin`).visible()).toEqual(["same-name-plugin@example.org", "first-plugin@example.org"]);
      expect(homeScript(`${PAGE}?q=first+plugin&sort=name`).visible()).toEqual(["first-plugin@example.org", "same-name-plugin@example.org"]);
    });

    test("pages the rows in the chosen order", () => {
      const first = homeScript(`${PAGE}?sort=name`, 60);
      expect(first.visible()).toEqual(first.all().slice(0, 50));
      const second = homeScript(`${PAGE}?sort=name&page=2`, 60);
      expect(second.visible()).toEqual(second.all().slice(50, 100));
      expect(second.all()).toEqual(first.all());
    });

    test("going back to Stars restores the built order, not a new sort", () => {
      // The generated rows sit last in the page but would sort among the rows with no count.
      const page = homeScript(PAGE, 3);
      const before = page.all();
      page.sortSelect.value = "name";
      page.fire("sort:change");
      expect(page.all()).not.toEqual(before);
      page.sortSelect.value = "";
      page.fire("sort:change");
      expect(page.all()).toEqual(before);
    });

    test.each(["sort", "tbody"] as const)("wires no control when the %s is missing", (missing) => {
      expect([...homeScript(PAGE, 0, missing).shown]).toEqual([]);
    });
  });

  test("matches a row on its name but not on its owner's text alone", () => {
    expect(homeScript(`${PAGE}?q=first+plugin`).visible()).toEqual(["same-name-plugin@example.org", "first-plugin@example.org"]);
    expect(homeScript(`${PAGE}?q=${LONG_OWNER}`).visible()).toEqual([]);
  });

  test("passes what the visitor types to the row test and writes it to q once typing stops", () => {
    const page = homeScript(PAGE);
    expect(page.visible()).toHaveLength(ids.length);
    expect(page.status.textContent).toBe(`${ids.length} plugins`);
    for (const value of [" L", " LO", " LOG "]) {
      page.search.value = value;
      page.fire("search:input");
    }
    expect(page.visible()).toEqual(["b-cafe@example.org"]);
    expect(page.writes).toEqual([]);
    expect([...page.timers.values()].map(({ delay }) => delay)).toEqual([500]);
    page.runTimers();
    expect(page.writes).toEqual([`${PAGE}?q=LOG`]);
    page.search.value = "";
    page.fire("search:input");
    page.runTimers();
    expect(page.visible()).toHaveLength(ids.length);
    expect(page.location.href).toBe(PAGE);
  });

  test("removes a language parameter that names no option and keeps q", () => {
    const page = homeScript(`${PAGE}?language=xx&q=log`);
    expect(page.writes).toEqual([`${PAGE}?q=log`]);
    expect(page.visible()).toEqual(["b-cafe@example.org"]);
  });

  describe("the category menu", () => {
    test("shows only the rows of the chosen category, counts them, and writes category", () => {
      const page = homeScript(PAGE);
      page.categorySelect.value = "attachments";
      page.fire("category:change");
      expect(page.visible()).toEqual(["a-cafe@example.org", "min-only-plugin@example.org"]);
      expect(page.status.textContent).toBe(`2 of ${ids.length} plugins`);
      expect(page.writes).toEqual([`${PAGE}?category=attachments`]);
    });

    test("All categories shows every row and removes category from the address", () => {
      const page = homeScript(`${PAGE}?category=attachments`);
      page.categorySelect.value = "";
      page.fire("category:change");
      expect(page.visible()).toHaveLength(ids.length);
      expect(page.status.textContent).toBe(`${ids.length} plugins`);
      expect(page.location.href).toBe(PAGE);
    });

    test("reads category on load and when Back or Forward changes the address", () => {
      const page = homeScript(`${PAGE}?category=translation`);
      expect(page.categorySelect.value).toBe("translation");
      expect(page.visible()).toEqual(["locale-plugin@example.org"]);
      expect(page.writes).toEqual([]);
      page.location.href = `${PAGE}?category=organization`;
      page.fire("window:popstate");
      expect(page.categorySelect.value).toBe("organization");
      expect(page.visible()).toEqual(["next-plugin@example.org"]);
    });

    test("selects All categories for a value that no option has and removes it, keeping q", () => {
      const page = homeScript(`${PAGE}?category=notes&q=log`);
      expect(page.categorySelect.value).toBe("");
      expect(page.writes).toEqual([`${PAGE}?q=log`]);
      expect(page.visible()).toEqual(["b-cafe@example.org"]);
    });

    test.each([
      ["the search box", "q=tools", ["a-cafe@example.org"]],
      ["the language menu", "language=zh", ["min-only-plugin@example.org"]],
      ["the version buttons", "zotero=7", ["a-cafe@example.org"]],
    ])("shows only the rows that it and %s both pass", (_, other, visible) => {
      const page = homeScript(`${PAGE}?category=attachments&${other}`);
      expect(page.visible()).toEqual(visible);
      expect(page.status.textContent).toBe(`1 of ${ids.length} plugins`);
    });

    test("a menu change on page 2 goes back to page 1 of the rows it passes", () => {
      const page = homeScript(`${PAGE}?page=2`, 120);
      page.categorySelect.value = "translation";
      page.fire("category:change");
      const translated = page.all().filter((id) => id === "locale-plugin@example.org" || id!.startsWith("gen-"));
      expect(translated.length).toBeGreaterThan(50);
      expect(page.visible()).toEqual(translated.slice(0, 50));
      expect(page.pageStatus.textContent).toBe("Page 1 of 3");
      expect(page.writes).toEqual([`${PAGE}?category=translation`]);
    });
  });

  test("counts every row for a query of spaces only", () => {
    const page = homeScript(PAGE);
    page.search.value = "   ";
    page.fire("search:input");
    expect(page.visible()).toHaveLength(ids.length);
    expect(page.status.textContent).toBe(`${ids.length} plugins`);
  });

  describe("pages", () => {
    // The built rows and 120 generated ones, 3 pages with no filter on while the fixture
    // holds 30 rows or fewer.
    const GENERATED = 120;
    const PAGES = Math.ceil((ids.length + GENERATED) / 50);
    const gen = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => `gen-${from + i}@example.org`);
    const pressed = (page: ReturnType<typeof homeScript>) => page.steps.map((step) => step.getAttribute("aria-disabled"));

    // The tests below walk pages 1 to 3, so a larger fixture fails here first, by name.
    test("the fixture and the generated rows fill 3 pages", () => {
      expect(PAGES).toBe(3);
    });

    test("shows the first 50 rows, the pager, and a count of every row", () => {
      const page = homeScript(PAGE, GENERATED);
      const total = ids.length + GENERATED;
      expect(page.visible()).toEqual(page.all().slice(0, 50));
      expect([page.pager.hidden, page.pageStatus.textContent, pressed(page)]).toEqual([false, `Page 1 of ${PAGES}`, ["true", "false"]]);
      expect(page.status.textContent).toBe(`${total} plugins`);
    });

    test("pages the rows a filter passes and counts them all", () => {
      const page = homeScript(`${PAGE}?q=bulk`, GENERATED);
      expect(page.visible()).toEqual(gen(1, 50));
      expect(page.status.textContent).toBe(`${GENERATED} of ${ids.length + GENERATED} plugins`);
      expect(page.pageStatus.textContent).toBe("Page 1 of 3");
    });

    test.each([
      ["alpha", 50, true, "Page 1 of 1"],
      ["beta", 51, false, "Page 1 of 2"],
    ])("a filter that passes %s's %i rows sets the pager's hidden to %s", (query, count, hidden, text) => {
      const page = homeScript(`${PAGE}?q=${query}`, GENERATED);
      expect(page.visible()).toEqual(gen(1, Math.min(count, 50)));
      expect([page.pager.hidden, page.pageStatus.textContent]).toEqual([hidden, text]);
    });

    test("Next and Previous move a page, add a history entry, and scroll to the table, and do nothing at an end", () => {
      const page = homeScript(PAGE, GENERATED);
      const next = () => page.fire("next:click");
      const previous = () => page.fire("previous:click");
      previous();
      expect(page.pushes).toEqual([]);
      next();
      expect(page.visible()).toEqual(page.all().slice(50, 100));
      next();
      expect(page.visible()).toEqual(page.all().slice(100));
      expect(pressed(page)).toEqual(["false", "true"]);
      next();
      previous();
      previous();
      expect(page.pushes).toEqual([`${PAGE}?page=2`, `${PAGE}?page=3`, `${PAGE}?page=2`, PAGE]);
      expect(page.visible()).toEqual(page.all().slice(0, 50));
      expect(page.scrolls()).toBe(4);
      expect(page.writes).toEqual([]);
    });

    test("Next drops a write that typing left waiting, and its address keeps the search text", () => {
      const page = homeScript(PAGE, GENERATED);
      page.search.value = "bulk";
      page.fire("search:input");
      page.fire("next:click");
      page.runTimers();
      expect(page.pushes).toEqual([`${PAGE}?q=bulk&page=2`]);
      expect(page.writes).toEqual([]);
      expect(page.visible()).toEqual(gen(51, 100));
    });

    test("a search input or a menu change on page 2 goes back to page 1 and drops page from the address", () => {
      const typed = homeScript(`${PAGE}?page=2`, GENERATED);
      typed.search.value = "bulk";
      typed.fire("search:input");
      expect(typed.visible()).toEqual(gen(1, 50));
      expect(typed.location.href).toBe(`${PAGE}?page=2`);
      typed.runTimers();
      expect(typed.location.href).toBe(`${PAGE}?q=bulk`);
      const picked = homeScript(`${PAGE}?page=2`, GENERATED);
      picked.select.value = "";
      picked.fire("select:change");
      expect(picked.visible()).toEqual(picked.all().slice(0, 50));
      expect(picked.writes).toEqual([PAGE]);
    });

    test("reads page on load and shows that page", () => {
      const page = homeScript(`${PAGE}?page=3`, GENERATED);
      expect(page.visible()).toEqual(page.all().slice(100));
      expect(page.writes).toEqual([]);
    });

    test.each(["1", "", "0", "-2", "x", "02", String(PAGES + 1)])("shows page 1 for page=%j and removes it from the address", (value) => {
      const page = homeScript(`${PAGE}?page=${value}`, GENERATED);
      expect(page.visible()).toEqual(page.all().slice(0, 50));
      expect(page.writes).toEqual([PAGE]);
    });

    test("judges page against the pages the filters on the address leave", () => {
      const page = homeScript(`${PAGE}?q=gamma&page=2`, GENERATED);
      expect(page.visible()).toEqual(gen(1, 20));
      expect(page.writes).toEqual([`${PAGE}?q=gamma`]);
    });

    test("Back and Forward read page again", () => {
      const page = homeScript(PAGE, GENERATED);
      page.location.href = `${PAGE}?page=2`;
      page.fire("window:popstate");
      expect(page.visible()).toEqual(page.all().slice(50, 100));
      page.location.href = PAGE;
      page.fire("window:popstate");
      expect(page.visible()).toEqual(page.all().slice(0, 50));
      expect(page.writes).toEqual([]);
    });
  });

  test("reads q again when Back or Forward changes the address, and drops a write that typing left waiting", () => {
    const page = homeScript(PAGE);
    page.search.value = "tools";
    page.fire("search:input");
    page.location.href = `${PAGE}?q=edits`;
    page.fire("window:popstate");
    expect(page.search.value).toBe("edits");
    expect(page.visible()).toEqual(["b-cafe@example.org"]);
    expect(page.timers.size).toBe(0);
  });

  test("removes the classic script's style once its first pass has hidden the rows off page 1", () => {
    const page = homeScript(PAGE, 120);
    expect(page.hiddenAtRemoval()).toBe(page.all().length - 50);
  });

  test.each(["search", "category", "menu", "buttons"] as const)("removes the classic script's style on a page with no %s", (missing) => {
    const page = homeScript(PAGE, 0, missing);
    expect(page.hiddenAtRemoval()).toBe(0);
  });
});

// The built home page's classic script run against a stand-in head, location, and window. It
// returns the attributes and text of each element the script appends to the head, and runs
// the window's error listeners on fire().
function prePaintScript(search: string, modules = true) {
  const html = home();
  const script = /<script>(.*?)<\/script>/s.exec(html.slice(html.indexOf("<main>")))![1]!;
  type Element = { attributes: Record<string, string>; textContent: string; removed: boolean };
  const appended: Element[] = [];
  const document = {
    createElement: (tag: string) => {
      if (tag !== "style") throw new Error(`the script creates ${tag}`);
      const element: Element & { setAttribute: unknown; remove: unknown } = {
        attributes: {},
        textContent: "",
        removed: false,
        setAttribute: (name: string, value: string) => (element.attributes[name] = value),
        remove: () => (element.removed = true),
      };
      return element;
    },
    head: { append: (element: Element) => appended.push(element) },
  };
  const errors: (() => void)[] = [];
  const addEventListener = (type: string, listener: () => void) => {
    if (type !== "error") throw new Error(`the script listens for ${type}`);
    errors.push(listener);
  };
  const HTMLScriptElement = { prototype: modules ? { noModule: false } : {} };
  runInNewContext(script, { document, location: { search }, HTMLScriptElement, URLSearchParams, addEventListener });
  return {
    styles: () => appended.map(({ attributes, textContent }) => ({ attributes, textContent })),
    removed: () => appended.map(({ removed }) => removed),
    fire: () => errors.forEach((listener) => listener()),
  };
}

describe("the home page's classic script", () => {
  test("comes before the table", () => {
    const html = home();
    const script = html.indexOf("<script>", html.indexOf("<main>"));
    expect(script).toBeGreaterThan(-1);
    expect(script).toBeLessThan(html.indexOf('<table class="plugins">'));
  });

  test.each(PRE_PAINT_CASES.map(([search]) => search))("adds the style that prePaintStyle writes for %j", (search) => {
    expect(prePaintScript(search).styles()).toEqual([{ attributes: { "data-pre-paint": "" }, textContent: prePaintStyle(search, PAGE_SIZE) }]);
  });

  test("adds no style in a browser that does not run module scripts", () => {
    expect(prePaintScript("?page=2", false).styles()).toEqual([]);
  });

  test("removes its style on a window error, so a module script that failed leaves every row shown", () => {
    const page = prePaintScript("?page=2");
    expect(page.removed()).toEqual([false]);
    page.fire();
    expect(page.removed()).toEqual([true]);
  });
});

describe("the built site", () => {
  test("puts the top bar and the footer on every page", () => {
    const files = htmlFiles(out);
    expect(files).toHaveLength(ids.length + 3);
    for (const path of files) {
      const html = readFileSync(join(out, path), "utf8");
      const bar = /<body><header class="topbar"><div class="topbar-inner">(.*?)<\/div><\/header><main>/s.exec(html)?.[1];
      // The logo's shapes have their own tests in "the logo".
      // The GitHub mark is the source icon that each home row's repository link also draws.
      expect(bar, path).toContain(`<a href="https://github.com/jmgirard/zotdex" class="repo-link" data-repo title="Zotdex on GitHub" aria-label="Zotdex on GitHub">${GITHUB_SVG}</a>`);
      expect(bar?.replace(/<button .*<\/script>/s, "").replace(/(<svg class="logo"[^>]*>).*?<\/svg>/s, "$1</svg>").replace(/(data-repo [^>]*>).*?<\/a>/, "$1</a>"), path).toBe(
        '<a class="brand" href="/"><svg class="logo" viewBox="0 0 16 16" aria-hidden="true" focusable="false"></svg>Zotdex</a><nav aria-label="Site">' +
          '<a href="/about/">About</a>' +
          '<a href="https://github.com/jmgirard/zotdex/issues/new?template=add-plugin.yml" data-add-plugin>Add a plugin</a>' +
          '<a href="https://github.com/jmgirard/zotdex/discussions" data-feedback>Feedback</a>' +
          '<a href="/v1/plugins.json">Data</a>' +
          '<a href="https://github.com/jmgirard/zotdex" class="repo-link" data-repo title="Zotdex on GitHub" aria-label="Zotdex on GitHub"></a></nav>',
      );
      const foot = /<\/main><footer class="foot"><div class="foot-inner foot-rule">(.*?)<\/div><\/footer><\/body>/s.exec(html)?.[1];
      expect(foot, path).toBe(
        `<p data-fact="disclaimer">${escaped(DISCLAIMER_TEXT)}</p>` +
          "<p>Updated October 25, 2026.</p>" +
          '<p><a href="/v1/plugins.json">Get all the data as JSON</a></p>' +
          '<p><a href="https://github.com/jmgirard/zotdex" data-repo-footer>Zotdex on GitHub</a></p>',
      );
    }
    expect(existsSync(join(ROOT, ".github/ISSUE_TEMPLATE/add-plugin.yml"))).toBe(true);
  });

  test("leaves the old words off every page", () => {
    for (const file of htmlFiles(out)) expect(readFileSync(join(out, file), "utf8"), file).not.toContain("does not vet");
  });

  test("calls the home page a field guide in its title, description, and their link-preview tags", () => {
    const html = home();
    const title = "Zotdex: your field guide to Zotero plugins";
    const description = "Your field guide to Zotero plugins: browse hundreds of them and see what each one does, who makes it, and which Zotero versions it supports.";
    expect(unescaped(/<title>(.*?)<\/title>/s.exec(html)![1]!)).toBe(title);
    expect(unescaped(tagValue(html, "property", "og:title"))).toBe(title);
    expect(unescaped(tagValue(html, "name", "description"))).toBe(description);
    expect(unescaped(tagValue(html, "property", "og:description"))).toBe(description);
  });

  test("gives the home page one h1, its field guide heading", () => {
    const h1s = [...home().matchAll(/<h1[\s>]/g)];
    expect(h1s).toHaveLength(1);
    expect(/<h1>([^<]*)<\/h1>/.exec(home())?.[1]).toBe("Your field guide to Zotero plugins");
  });

  test("says what Zotdex is for in the home intro, that it reviews no code, and links to the install steps, above the table", () => {
    const intro = /<p class="intro">(.*?)<\/p>/s.exec(home())![1]!;
    // Tags go with no space added, so a space that the template drops before the link shows here.
    expect(unescaped(intro.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim()).toBe(
      "Zotero can do a lot more with the right plugins. Browse hundreds of them, from AI assistants and translation tools to better ways to read PDFs and take notes. Each entry tells you what a plugin does, who makes it, and which Zotero versions it supports. Zotdex is independent and unofficial, and it doesn't review anyone's code, so look into a plugin before you trust it with your library. How to install a plugin.",
    );
    expect(intro).toMatch(/<a href="\/about\/#installing">How to install a plugin<\/a>\./);
    expect(home().indexOf('<p class="intro">')).toBeLessThan(home().indexOf('<table class="plugins">'));
  });

  test("carries its styles in each page and links no stylesheet", () => {
    for (const path of htmlFiles(out)) {
      const html = readFileSync(join(out, path), "utf8");
      // The minified rules can hold "<", as in @media (width<=760px).
      expect(/<style>(.*?)<\/style>/s.exec(html)?.[1], path).toContain(".card");
      expect(html, path).not.toMatch(/<link[^>]*rel="stylesheet"/);
    }
  });

  test("has two classic theme scripts on every page, and on the home page also a classic one and then a module", () => {
    const files = htmlFiles(out);
    expect(files).toContain("index.html");
    for (const file of files) {
      const scripts = readFileSync(join(out, file), "utf8").match(/<script[\s>]/g);
      expect(scripts, file).toEqual(file === "index.html" ? ["<script>", "<script>", "<script>", "<script "] : ["<script>", "<script>"]);
    }
  });

  test("starts every page with no scheme on <html>, a theme script in <head>, and the hidden button before its script", () => {
    const files = htmlFiles(out);
    expect(files).toHaveLength(ids.length + 3);
    for (const file of files) {
      const html = readFileSync(join(out, file), "utf8");
      expect(html, file).toMatch(/^<!DOCTYPE html><html lang="en"><head>/);
      const head = html.slice(0, html.indexOf("<body>"));
      expect(head.match(/<script[\s>]/g), file).toEqual(["<script>"]);
      const bar = html.slice(html.indexOf("<body>"), html.indexOf("<main>"));
      expect(bar.match(/<button[\s>]/g), file).toHaveLength(1);
      expect(bar, file).toMatch(
        /<\/a><button type="button" data-theme-toggle hidden><span data-theme-icon="moon"><svg [^]*?<\/svg><\/span><span data-theme-icon="sun"><svg [^]*?<\/svg><\/span><\/button><script>[^]*?<\/script><\/nav>/,
      );
    }
  });

  test("links each plugin page's Details card to the text-change form, and no other page", () => {
    const files = htmlFiles(out);
    expect(files).toHaveLength(ids.length + 3);
    for (const id of ids) {
      const html = page(id);
      const links = [...html.matchAll(/<a href="([^"]*)" data-text-change>/g)];
      expect(links, id).toHaveLength(1);
      expect(links[0]![1]!.replace(/&amp;/g, "&").replace(/&#38;/g, "&"), id).toBe(
        `https://github.com/jmgirard/zotdex/issues/new?template=text-change.yml&plugin=${encodeURIComponent(id)}`,
      );
      const details = html.indexOf('data-section="details"');
      expect(links[0]!.index, id).toBeGreaterThan(details);
      expect(links[0]!.index, id).toBeLessThan(html.indexOf("</section>", details));
      expect(mainText(html), id).toContain("Is this your plugin? Ask to change its name or description or add a screenshot.");
    }
    expect(home()).not.toContain("data-text-change");
    expect(readFileSync(join(out, "about/index.html"), "utf8")).not.toContain("data-text-change");
  });

  test("links each plugin page's owner line to the screenshot form with the plugin id, and no other page", () => {
    for (const id of ids) {
      const html = page(id);
      const links = [...html.matchAll(/<a href="([^"]*)" data-screenshot-request>add a screenshot<\/a>/g)];
      expect(links, id).toHaveLength(1);
      expect(links[0]![1]!.replace(/&amp;/g, "&").replace(/&#38;/g, "&"), id).toBe(
        `https://github.com/jmgirard/zotdex/issues/new?template=screenshot.yml&plugin=${encodeURIComponent(id)}`,
      );
      expect(links[0]!.index, id).toBeGreaterThan(html.indexOf("data-text-change>"));
    }
    expect(home()).not.toContain("data-screenshot-request");
    expect(readFileSync(join(out, "about/index.html"), "utf8")).not.toContain("data-screenshot-request");
  });

  test("shows a record's screenshot as one link to its file holding an image with its alt text, and none on another page", () => {
    const withShot = records.filter(({ screenshot }) => screenshot);
    expect(withShot.map(({ id }) => id).sort()).toEqual(["a-cafe@example.org", "first-plugin@example.org"]);
    for (const { id, screenshot } of records) {
      const html = page(id);
      const links = [...html.matchAll(/<a class="screenshot" href="([^"]*)" data-screenshot><img src="([^"]*)" alt="([^"]*)"/g)];
      expect(html.match(/data-screenshot[\s>]/g) ?? [], id).toHaveLength(screenshot ? 1 : 0);
      if (!screenshot) continue;
      expect(links, id).toHaveLength(1);
      expect(unescaped(links[0]![1]!), id).toBe(`/v1/${screenshot.file}`);
      expect(unescaped(links[0]![3]!), id).toBe(screenshot.alt);
    }
    expect(home()).not.toMatch(/data-screenshot[\s>]/);
  });

  test("puts the screenshot after the links and before the install note, or before the version card with no note", () => {
    for (const id of ["first-plugin@example.org", "a-cafe@example.org"]) {
      const html = page(id);
      const at = html.indexOf("data-screenshot>");
      const next = html.includes('data-fact="install-note"') ? html.indexOf('data-fact="install-note"') : html.indexOf('data-section="compatibility"');
      expect(at, id).toBeGreaterThan(html.indexOf('<div class="actions" data-links>'));
      expect(at, id).toBeGreaterThan(html.indexOf("data-icon-tile"));
      expect(at, id).toBeLessThan(next);
    }
    expect(page("a-cafe@example.org")).toContain('data-fact="install-note"');
    expect(page("first-plugin@example.org")).not.toContain('data-fact="install-note"');
  });

  test("offers no badge on any page", () => {
    const files = htmlFiles(out);
    expect(files).toHaveLength(ids.length + 3);
    for (const file of files) {
      const html = readFileSync(join(out, file), "utf8");
      expect(html, file).not.toContain("img.shields.io");
    }
  });

  test("links each plugin page to the remove-plugin form with its id, and no other page with an id", () => {
    const form = "https://github.com/jmgirard/zotdex/issues/new?template=remove-plugin.yml";
    const links = (html: string) => [...html.matchAll(/<a href="([^"]*remove-plugin\.yml[^"]*)"[^>]*>([^<]*)<\/a>/g)].map((match) => [match[1]!.replace(/&amp;|&#38;/g, "&"), match[2]!]);
    const files = htmlFiles(out);
    expect(files).toHaveLength(ids.length + 3);
    for (const file of files) {
      const html = readFileSync(join(out, file), "utf8");
      const id = ids.find((each) => file === join("plugins", each, "index.html"));
      if (id) {
        expect(links(html), id).toEqual([[`${form}&plugin=${encodeURIComponent(id)}`, "Ask to remove this plugin or report harm"]]);
      } else {
        expect(links(html).filter(([href]) => href!.includes("plugin=")), file).toEqual([]);
      }
    }
  });

  test("runs the built theme scripts", () => {
    const html = home();
    const scripts = {
      head: /<head>.*?<script>(.*?)<\/script>/s.exec(html)![1]!,
      button: /<\/button><script>(.*?)<\/script>/s.exec(html.slice(0, html.indexOf("<main>")))![1]!,
    };
    const page = themePage({ system: "light", saved: "dark" }, scripts);
    expect(page.theme()).toBe("dark");
    expect(page.hidden()).toBe(false);
    page.press();
    expect(page.theme()).toBeNull();
    expect(page.saved()).toBeNull();
    expect(page.gives()).toBe("dark");
  });

  test("has no trace of the Zotero version field", () => {
    const files = (readdirSync(out, { recursive: true }) as string[]).filter((path) => statSync(join(out, path)).isFile());
    expect(files.length).toBeGreaterThan(ids.length);
    const traces = ['id="zotero-version"', 'for="zotero-version"', "Your Zotero version", "zotero-plugin-index:zotero-version", "data-result-for"];
    for (const file of files) {
      const text = readFileSync(join(out, file), "utf8");
      for (const trace of traces) expect(text.includes(trace), `${file}: ${trace}`).toBe(false);
    }
  });
});

// Each meta and link tag of a page, with the character references in its attribute values decoded.
function tagsOf(html: string): Record<string, string>[] {
  return [...html.matchAll(/<(?:meta|link)\b((?:[^>"]|"[^"]*")*)>/g)].map(
    ([, attributes]) => Object.fromEntries([...attributes!.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, name, value]) => [name!, decoded(value!)])),
  );
}

// One pass, so an escaped "&quot;" in the text stays as it is.
function decoded(text: string): string {
  const named: Record<string, string> = { lt: "<", gt: ">", quot: '"', amp: "&" };
  return text.replace(/&(?:#(\d+)|(lt|gt|quot|amp));/g, (_, code, name) => (code ? String.fromCodePoint(Number(code)) : named[name]!));
}

// One attribute's value in an element's start tag.
function attribute(tag: string, name: string): string {
  return new RegExp(`\\s${name}="([^"]*)"`).exec(tag)![1]!;
}

// The lens mark's three shapes in an SVG: the rim's two circles, read from its path, the disc,
// and the Z's corners.
function lensParts(svg: string) {
  const tags = svg.match(/<(?:path|circle|rect|ellipse|polygon|polyline|line|image|text|use)\b[^>]*>/g) ?? [];
  const rim = [...attribute(tags[0]!, "d").matchAll(/M([-\d.]+) ([-\d.]+)A([-\d.]+) \3 0 1 0 ([-\d.]+) \2A\3 \3 0 1 0 \1 \2Z/g)].map(
    ([, left, cy, r, right]) => ({ cx: (Number(left) + Number(right)) / 2, cy: Number(cy), r: Number(r), across: Number(right) - Number(left) }),
  );
  for (const circle of rim) expect(circle.across).toBeCloseTo(2 * circle.r, 6);
  const disc = { cx: Number(attribute(tags[1]!, "cx")), cy: Number(attribute(tags[1]!, "cy")), r: Number(attribute(tags[1]!, "r")) };
  const z = [...attribute(tags[2]!, "d").matchAll(/([-\d.]+) ([-\d.]+)/g)].map(([, x, y]) => [Number(x), Number(y)] as [number, number]);
  return { tags, rim, disc, z };
}

// The one tag whose attribute has this value, as content or href.
function tagValue(html: string, attribute: string, value: string): string {
  const tags = tagsOf(html).filter((tag) => tag[attribute] === value);
  expect(tags, value).toHaveLength(1);
  return tags[0]!.content ?? tags[0]!.href!;
}

describe("the link preview tags", () => {
  const SITE = "https://zotdex.jmgirard.com/";
  const read = (file: string) => readFileSync(join(out, file), "utf8");
  const previewOf = (file: string) => {
    const html = read(file);
    return {
      title: decoded(/<title>(.*?)<\/title>/s.exec(html)![1]!),
      description: tagValue(html, "name", "description"),
      ogTitle: tagValue(html, "property", "og:title"),
      ogDescription: tagValue(html, "property", "og:description"),
      ogType: tagValue(html, "property", "og:type"),
      ogSiteName: tagValue(html, "property", "og:site_name"),
      ogUrl: tagValue(html, "property", "og:url"),
      twitterCard: tagValue(html, "name", "twitter:card"),
      canonical: tagValue(html, "rel", "canonical"),
    };
  };

  test("puts each tag once on every page with an address, with the page's own address and text", () => {
    const files = htmlFiles(out).filter((file) => file !== "404.html");
    expect(files).toHaveLength(ids.length + 2);
    for (const file of files) {
      const preview = previewOf(file);
      const address = SITE + file.replace(/index\.html$/, "").split("/").map(encodeURIComponent).join("/");
      expect(preview.canonical, file).toBe(address);
      expect(preview.ogUrl, file).toBe(address);
      expect(preview.ogTitle, file).toBe(preview.title);
      expect(preview.ogDescription, file).toBe(preview.description);
      expect(preview.title, file).not.toBe("");
      expect(preview.description.trim(), file).not.toBe("");
      expect(preview.ogType, file).toBe("website");
      expect(preview.twitterCard, file).toBe("summary");
    }
  });

  test("gives every page the preview picture, its size, and its alt text", () => {
    const files = htmlFiles(out);
    expect(files).toHaveLength(ids.length + 3);
    for (const file of files) {
      const page = read(file);
      expect(tagValue(page, "property", "og:image"), file).toBe(`${SITE}preview.png`);
      expect(tagValue(page, "property", "og:image:width"), file).toBe("1200");
      expect(tagValue(page, "property", "og:image:height"), file).toBe("1200");
      expect(tagValue(page, "property", "og:image:alt"), file).toBe("The Zotdex logo");
      expect(tagValue(page, "name", "twitter:card"), file).toBe("summary");
    }
  });

  test("names the site Zotdex in every page's site name and title", () => {
    const files = htmlFiles(out);
    expect(files).toHaveLength(ids.length + 3);
    for (const file of files) {
      const page = read(file);
      const title = decoded(/<title>(.*?)<\/title>/s.exec(page)![1]!);
      expect(tagValue(page, "property", "og:site_name"), file).toBe("Zotdex");
      const home = file === "index.html";
      if (home) expect(title).toBe("Zotdex: your field guide to Zotero plugins");
      else expect(title, file).toMatch(/: Zotdex$/);
      // Only the home page's title and og:title may say what Zotdex is.
      const rest = home ? page.replace(/<title>[^<]*<\/title>|<meta property="og:title" content="[^"]*">/g, "") : page;
      expect(rest, file).not.toMatch(/zotero plugin index/i);
    }
  });

  test("differs across the home, About, and plugin pages", () => {
    const pages = ["index.html", "about/index.html", "plugins/first-plugin@example.org/index.html"].map(previewOf);
    expect(new Set(pages.map(({ title }) => title)).size).toBe(3);
    expect(new Set(pages.map(({ description }) => description)).size).toBe(3);
  });
});

describe("the plugin page's preview description", () => {
  const base = records.find((record) => record.id === "first-plugin@example.org")!;
  const { description: _manifest, repoDescription: _github, ...upstream } = base.upstream!;
  const withText = (id: string, description?: string): PluginRecord => ({
    ...base,
    id,
    upstream: { ...upstream, id, name: "Tidy Notes", ...(description === undefined ? {} : { description }) },
    reports: [],
    overrides: [],
  });
  // Each 𝐀 and 𠮷 is one code point and two UTF-16 units, so a cut by units gives another text.
  const spaced = `${"𝐀".repeat(150)} ${"b".repeat(30)}`;
  const quoted = 'Reads "quoted" <tags> & more &quot; in notes.';
  const plugins = [
    withText("spaced@example.org", `${spaced} ${"c".repeat(100)}`),
    withText("unbroken@example.org", "𠮷".repeat(250)),
    withText("no-text@example.org"),
    withText("quoted@example.org", quoted),
    withText("blank-head@example.org", `${" ".repeat(205)}Keeps notes tidy in folders.`),
    { ...withText("blank-override@example.org"), overrides: [{ field: "description", value: " \t\n", reason: "A reason." }] },
    {
      id: "failed-read@example.org",
      repoUrl: "https://github.com/example/failed-read",
      failure: { name: "no-xpi-release", message: "The repo has no release with an .xpi." },
      overrides: [],
    },
  ];
  let dir = "";
  beforeAll(() => {
    dir = outWith(JSON.stringify({ schemaVersion: 1, generatedAt: "2026-11-03T06:17:00.000Z", plugins }));
    const run = pnpmSite(["--out", dir]);
    if (run.status !== 0) throw new Error(run.stderr);
  }, 120_000);

  test.each<[string, string]>([
    ["spaced@example.org", spaced],
    ["unbroken@example.org", "𠮷".repeat(200)],
    ["no-text@example.org", "Tidy Notes is a Zotero plugin listed in Zotdex."],
    ["failed-read@example.org", "failed-read@example.org is a Zotero plugin listed in Zotdex."],
    ["quoted@example.org", quoted],
    ["blank-head@example.org", "Tidy Notes is a Zotero plugin listed in Zotdex."],
    ["blank-override@example.org", "Tidy Notes is a Zotero plugin listed in Zotdex."],
  ])("on %s", (id, expected) => {
    const html = readFileSync(join(dir, "plugins", id, "index.html"), "utf8");
    expect(tagValue(html, "name", "description")).toBe(expected);
  });
});

describe("a kept record", () => {
  // The shared fixture has no kept record, so these get their own build: a kept record and its
  // twin, which differs only in its id and in having no kept.
  const base = records.find((record) => record.id === "first-plugin@example.org")!;
  const KEPT = "kept-plugin@example.org";
  const TWIN = "kept-twin@example.org";
  const failure = { name: "not-read", message: "the build reads no plugin after 18 minutes, its time limit" };
  const kept = { readAt: "2026-11-03T06:17:00.000Z", failure };
  const ARCHIVED = "kept-archived@example.org";
  const plugins = [
    { ...base, id: KEPT, kept },
    { ...base, id: TWIN },
    { ...base, id: ARCHIVED, upstream: { ...base.upstream!, id: ARCHIVED, archived: true }, kept },
  ];
  let dir = "";
  beforeAll(() => {
    dir = outWith(JSON.stringify({ schemaVersion: 1, generatedAt: "2026-11-05T06:17:00.000Z", plugins }));
    const run = pnpmSite(["--out", dir]);
    if (run.status !== 0) throw new Error(run.stderr);
  }, 120_000);
  const home = () => readFileSync(join(dir, "index.html"), "utf8");
  const page = (id: string) => readFileSync(join(dir, "plugins", id, "index.html"), "utf8");
  const rowOf = (id: string) => new RegExp(`<tr data-plugin="${escaped(id)}"[\\s\\S]*?</tr>`).exec(home())![0];
  const BADGE =
    `<span class="badge" data-kept title="Zotdex couldn't reach this plugin in its latest update, so these facts are from November 3, 2026">Older data</span>`;

  test("the data file is valid against the v1 schema", () => {
    const validate = new Ajv({ allErrors: true }).compile(pluginsSchema);
    const data = JSON.parse(readFileSync(join(dir, "v1/plugins.json"), "utf8"));
    expect(validate(data), JSON.stringify(validate.errors)).toBe(true);
  });

  test("shows the row that the same record with no kept shows, plus an Older data badge after the name and any Archived badge", () => {
    const keptRow = rowOf(KEPT);
    expect(keptRow).toContain(BADGE);
    // An archived kept record shows the badge after Archived.
    expect(rowOf(ARCHIVED)).toMatch(/data-archived>Archived<\/span><span class="badge" data-kept /);
    expect(keptRow).not.toContain("Not read");
    expect(keptRow.replace(BADGE, "").replaceAll(KEPT, TWIN).replaceAll(encodeURIComponent(KEPT), encodeURIComponent(TWIN))).toBe(rowOf(TWIN));
    expect(rowOf(TWIN)).not.toContain("data-kept");
  });

  test("names the badge in the home legend", () => {
    expect(/<li data-legend-kept>(.*?)<\/li>/s.exec(home())?.[1]).toBe(
      '<span class="badge" aria-hidden="true">Older data</span> Zotdex couldn\'t reach this plugin today, so this row shows what it found in the past week',
    );
  });

  test("says on the plugin page that the build of the data could not read it, with the failure and the day of the read", () => {
    const text = /<p class="fineprint kept-note" data-fact="kept">(.*?)<\/p>/s.exec(page(KEPT))?.[1].replace(/\s+/g, " ").trim();
    expect(text).toBe(
      "Zotdex couldn't reach this plugin on November 5, 2026: <code>not-read</code>: the build reads no plugin after 18 minutes, its time limit. " +
        'This page shows what it found on November 3, 2026. <a href="/about/#older-data">About older data</a>',
    );
    expect(/<h1>.*?<\/h1>/s.exec(page(KEPT))![0]).toContain(BADGE);
    expect(page(TWIN)).not.toContain("data-kept");
    // The kept facts still show as the facts of a read record.
    expect(page(KEPT)).toContain('data-fact="read-version">For version 1.2.0, the release this page shows</p>');
  });

  test("writes the footer's day in UTC, so a build just after midnight UTC names that day in any time zone", () => {
    expect(longDay("2026-10-26T02:00:00Z")).toBe("October 26, 2026");
    expect(longDay("2026-10-25T23:30:00Z")).toBe("October 25, 2026");
  });

  test("writes a text that is not a date as its first 10 characters", () => {
    expect(longDay("not a date at all")).toBe("not a date");
  });

  test("says in the footer the day of the build the data comes from", () => {
    expect(home()).toContain("<p>Updated November 5, 2026.</p>");
  });
});

describe("cutDescription", () => {
  test.each<[string, string, string]>([
    ["keeps a text of 200 code points", "a".repeat(200), "a".repeat(200)],
    ["keeps a text of 200 code points with spaces", `${"a".repeat(99)} ${"b".repeat(100)}`, `${"a".repeat(99)} ${"b".repeat(100)}`],
    ["cuts at the last space of the first 200", `${"a".repeat(99)} ${"b".repeat(101)}`, "a".repeat(99)],
    ["cuts at 200 with no space there", `${"a".repeat(205)} b`, "a".repeat(200)],
    ["cuts at 200 when two spaces open the text", `  ${"a".repeat(205)}`, `  ${"a".repeat(198)}`],
    ["cuts at a later space after opening spaces", `  ${"a".repeat(50)} ${"b".repeat(205)}`, `  ${"a".repeat(50)}`],
    ["does not cut at a space after opening whitespace of another kind", `\t ${"a".repeat(205)}`, `\t ${"a".repeat(198)}`],
    ["cuts only at a space, not at a newline", `aaa\n${"b".repeat(205)}`, `aaa\n${"b".repeat(196)}`],
  ])("%s", (_, text, expected) => {
    expect(cutDescription(text)).toBe(expected);
  });
});

describe("the description facts", () => {
  // The shared fixture has no blank text, so these records get their own build.
  const base = records.find((record) => record.id === "first-plugin@example.org")!;
  const { description: _manifest, repoDescription: _github, ...upstream } = base.upstream!;
  const override = { field: "description", value: "Index text.", reason: "A reason." };
  const withTexts = (id: string, texts: { description?: string; repoDescription?: string }): PluginRecord => ({
    ...base,
    id,
    upstream: { ...upstream, id, ...texts },
    reports: [],
    overrides: [override],
  });
  const both = withTexts("both-texts@example.org", { description: "Keeps notes tidy.", repoDescription: "Sorts notes by date." });
  const plugins = [
    { ...both, overrides: [override, { field: "name", value: "Index name.", reason: "A reason." }] },
    withTexts("manifest-only@example.org", { description: "Keeps notes tidy." }),
    withTexts("github-only@example.org", { repoDescription: "Sorts notes by date." }),
    withTexts("blank-with-github@example.org", { description: " \n", repoDescription: "Sorts notes by date." }),
    withTexts("blank-manifest@example.org", { description: " \n" }),
    withTexts("no-text@example.org", {}),
    {
      id: "failed-read@example.org",
      repoUrl: "https://github.com/example/failed-read",
      failure: { name: "no-xpi-release", message: "The repo has no release with an .xpi." },
      overrides: [override],
    },
  ];
  let dir = "";
  beforeAll(() => {
    dir = outWith(JSON.stringify({ schemaVersion: 1, generatedAt: "2026-11-03T06:17:00.000Z", plugins }));
    const run = pnpmSite(["--out", dir]);
    if (run.status !== 0) throw new Error(run.stderr);
  }, 120_000);
  const pageOf = (id: string) => readFileSync(join(dir, "plugins", id, "index.html"), "utf8");

  test("shows no plugin file description row for a blank text and keeps it for a text", () => {
    expect(pageOf("blank-manifest@example.org")).not.toContain("<dt>Description in the plugin file</dt>");
    expect(pageOf("both-texts@example.org")).toMatch(/<dt>Description in the plugin file<\/dt>\s*<dd data-fact="manifest-description">/);
    expect(fact(pageOf("both-texts@example.org"), "manifest-description")).toBe("Keeps notes tidy.");
  });

  // The Plugin's value cell of an override, one item per line.
  const upstreamCell = (id: string, field: string) => {
    const row = new RegExp(`<tr data-override="${field}">(.*?)</tr>`).exec(pageOf(id))![1]!;
    return [...row.matchAll(/<td>(.*?)<\/td>/g)][1]![1]!.split(/<br\s*\/?>/);
  };

  test.each<[string, string[]]>([
    ["both-texts@example.org", ["Plugin file: Keeps notes tidy.", "GitHub: Sorts notes by date."]],
    ["manifest-only@example.org", ["Plugin file: Keeps notes tidy."]],
    ["github-only@example.org", ["GitHub: Sorts notes by date."]],
    ["blank-with-github@example.org", ["GitHub: Sorts notes by date."]],
    ["blank-manifest@example.org", ["none"]],
    ["no-text@example.org", ["none"]],
    ["failed-read@example.org", ["none"]],
  ])("the Plugin's value cell of a description override on %s lists its texts", (id, lines) => {
    expect(upstreamCell(id, "description")).toEqual(lines);
  });

  test("the Plugin's value cell of another override keeps its one value", () => {
    expect(upstreamCell("both-texts@example.org", "name")).toEqual([upstream.name]);
  });
});

describe("the newest Zotero release", () => {
  // The shared fixture has no zoteroRelease, so these records get their own two builds.
  const base = records.find((record) => record.id === "first-plugin@example.org")!;
  const UP_TO = "up-to-10-0@example.org";
  const FROM = "from-10-1@example.org";
  const ranged = (id: string, range: { strictMinVersion?: string; strictMaxVersion?: string }): PluginRecord => {
    const { strictMinVersion: _min, strictMaxVersion: _max, ...upstream } = base.upstream!;
    return { ...base, id, upstream: { ...upstream, id, ...range }, reports: [], overrides: [] };
  };
  const plugins = [ranged(UP_TO, { strictMinVersion: "7.0", strictMaxVersion: "10.0.*" }), ranged(FROM, { strictMinVersion: "10.1" })];
  const built: Record<"known" | "unknown", string> = { known: "", unknown: "" };
  beforeAll(() => {
    for (const [name, zoteroRelease] of [["known", "10.0.7"], ["unknown", undefined]] as const) {
      const dir = outWith(JSON.stringify({ schemaVersion: 1, generatedAt: "2026-10-30T06:17:00.000Z", zoteroRelease, plugins }));
      const run = pnpmSite(["--out", dir]);
      if (run.status !== 0) throw new Error(run.stderr);
      built[name] = dir;
    }
  }, 120_000);

  const homeOf = (name: keyof typeof built) => readFileSync(join(built[name], "index.html"), "utf8");
  const pageOf = (name: keyof typeof built, id: string) => readFileSync(join(built[name], "plugins", id, "index.html"), "utf8");
  // The row's data-zotero value and its home mark for 10.
  const row = (html: string, id: string) => {
    const tr = new RegExp(`<tr data-plugin="${escaped(id)}"[^>]*data-zotero="([^"]*)"[^>]*>([\\s\\S]*?)</tr>`).exec(html)!;
    return { majors: tr[1], mark: /<td class="v" data-major="10">\s*<span class="mark" data-support="(\w+)"/.exec(tr[2])?.[1] };
  };
  const declared = (html: string) => /<tr data-major="10">[\s\S]*?<td data-declared="([^"]+)"/.exec(html)?.[1];

  test("the data files are valid against the v1 schema", () => {
    const validate = new Ajv({ allErrors: true }).compile(pluginsSchema);
    for (const dir of Object.values(built)) {
      const data = JSON.parse(readFileSync(join(dir, "v1/plugins.json"), "utf8"));
      expect(validate(data), JSON.stringify(validate.errors)).toBe(true);
    }
  });

  test("with zoteroRelease 10.0.7, marks a maximum of 10.0.* as all of 10 and leaves 10 out of a 10.1 minimum's row", () => {
    expect(row(homeOf("known"), UP_TO)).toEqual({ majors: "7 8 9 10", mark: "all" });
    expect(declared(pageOf("known", UP_TO))).toBe("all");
    expect(pageOf("known", UP_TO)).toContain('<span class="visually-hidden">Supports Zotero 10</span>');
    expect(row(homeOf("known"), FROM)).toEqual({ majors: "", mark: "none" });
  });

  test("with no zoteroRelease, marks a maximum of 10.0.* as part of 10 and keeps 10 in a 10.1 minimum's row", () => {
    expect(row(homeOf("unknown"), UP_TO)).toEqual({ majors: "7 8 9 10", mark: "some" });
    expect(declared(pageOf("unknown", UP_TO))).toBe("some");
    expect(row(homeOf("unknown"), FROM).majors).toBe("10");
  });

  // The About page's list of the newest release of each major, one item per major.
  const releases = (name: keyof typeof built) => {
    const list = /<ul[^>]*data-newest-releases>([\s\S]*?)<\/ul>/.exec(readFileSync(join(built[name], "about/index.html"), "utf8"))![1]!;
    return [...list.matchAll(/<li data-major="(\d+)">\s*([^<]*?)\s*<\/li>/g)].map(([, major, text]) => [major, text]);
  };

  test("the About page names the newest release of each major: 10.0.7 from the data and the last releases of 7, 8, and 9", () => {
    expect(releases("known")).toEqual([
      ["7", "Zotero 7: 7.0.32"],
      ["8", "Zotero 8: 8.0.5"],
      ["9", "Zotero 9: 9.0.6"],
      ["10", "Zotero 10: 10.0.7"],
    ]);
  });

  test("the About page says that no release of 10 is known when the data has no zoteroRelease", () => {
    expect(releases("unknown").at(-1)).toEqual(["10", "Zotero 10: no known release"]);
  });
});

describe("pnpm site failures", () => {
  test.each([[["extra"]], [["--out"]]])("rejects %j with the usage line", (args) => {
    const usage = pnpmSite(args);
    expect(usage.status).toBe(1);
    expect(usage.stderr).toContain("usage: pnpm site [--out <dir>]");
  }, 60_000);

  test("reports an Astro build failure and writes no page", () => {
    const dir = outWith("{}");
    const failed = pnpmSite(["--out", dir]);
    expect(failed.status).toBe(1);
    expect(failed.stderr).toContain(`site-failed: ${join(dir, "v1", "plugins.json")} has no plugins list`);
    expect(readdirSync(dir)).toEqual(["v1"]);
  }, 60_000);

  test("refuses a site build that writes v1/ and leaves the data as it was", () => {
    const dir = outWith(readFileSync(FIXTURE, "utf8"));
    const clashRoot = resolve(ROOT, "test/fixtures/site-clash");
    const script = `import { buildSite } from ${JSON.stringify(resolve(ROOT, "src/site/site.ts"))};
      console.log(JSON.stringify(await buildSite(process.argv[1], process.argv[2])));`;
    const run = spawnSync(process.execPath, ["--input-type=module", "-e", script, dir, clashRoot], {
      cwd: ROOT,
      encoding: "utf8",
      timeout: 50_000,
    });
    expect(JSON.parse(run.stdout.trim().split("\n").at(-1)!)).toEqual({
      ok: false,
      message: "the site build wrote v1, which holds the data",
    });
    expect(readdirSync(dir)).toEqual(["v1"]);
    expect(readFileSync(join(dir, "v1/plugins.json"), "utf8")).toBe(readFileSync(FIXTURE, "utf8"));
  }, 60_000);
});

describe("pnpm site with no data file", () => {
  test("exits 1 and names the missing file", () => {
    const empty = mkdtempSync(join(tmpdir(), "zpi-site-empty-"));
    try {
      const missing = pnpmSite(["--out", empty]);
      expect(missing.status).toBe(1);
      expect(missing.stderr).toContain(`site-failed: cannot read ${join(empty, "v1", "plugins.json")}`);
      expect(readdirSync(empty)).toEqual([]);
    } finally {
      rmSync(empty, { recursive: true, force: true });
    }
  }, 60_000);
});

// The rules of the layout's style element, comments removed. A rule inside @media keeps
// its own selector.
function cssRules(layout: string): { selector: string; declarations: [string, string][] }[] {
  const css = /<style is:global>(.*?)<\/style>/s.exec(layout)![1]!.replace(/\/\*.*?\*\//gs, "");
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selector, body]) => ({
    selector: selector!.trim().replace(/\s+/g, " "),
    declarations: body!
      .split(";")
      .map((declaration) => declaration.trim())
      .filter(Boolean)
      .map((declaration) => {
        const at = declaration.indexOf(":");
        return [declaration.slice(0, at).trim(), declaration.slice(at + 1).trim()];
      }),
  }));
}

describe("the site styles", () => {
  const layout = readFileSync(resolve(ROOT, "site/src/layouts/Base.astro"), "utf8");

  test("takes each margin, padding, gap, corner radius, and font size outside :root and .visually-hidden from a custom property, 0, or auto", () => {
    const sized = cssRules(layout)
      .filter(({ selector }) => selector !== ":root" && selector !== ".visually-hidden")
      .flatMap(({ selector, declarations }) =>
        declarations
          .filter(([property]) => /^(?:border-radius|padding(?:-[a-z-]+)?|margin(?:-[a-z-]+)?|(?:row-|column-)?gap|font-size)$/.test(property))
          .map(([property, value]) => ({ selector, property, value })),
      );
    for (const property of ["border-radius", "padding", "margin", "margin-left", "gap", "font-size"]) {
      expect(sized.map((declaration) => declaration.property)).toContain(property);
    }
    // Each value part, split at spaces outside parentheses.
    const literal = sized.flatMap(({ selector, property, value }) =>
      (value.match(/(?:[^\s(]+|\([^)]*\))+/g) ?? [])
        .filter((part) => !/^(?:var\(--[\w-]+\)|0|auto)$/.test(part))
        .map((part) => `${selector} { ${property}: ${part} }`),
    );
    expect(literal).toEqual([]);
  });

  test("hides the languages and release columns at 760 px or less, and the descriptions and source links at 560 px or less", () => {
    expect(layout).toMatch(/@media \(max-width: 760px\) \{\s*\.plugins \.lang,\s*\.plugins \.date \{\s*display: none;\s*\}/);
    expect(layout).toMatch(
      /@media \(max-width: 560px\) \{\s*\.plugins \.desc,\s*\.plugins \.links a\[data-link="source"\] \{\s*display: none;\s*\}/,
    );
    const html = home();
    expect(html.match(/<t[dh][^>]* class="lang"/g)).toHaveLength(ids.length + 2);
    expect(html.match(/<t[dh][^>]* class="date"/g)).toHaveLength(ids.length + 2);
  });

  test("draws the language, category, and sort menus' arrow in currentColor, inset from the right by the left padding", () => {
    const menu = cssRules(layout).filter(({ selector }) => selector === "[data-language-filter], [data-category-filter], [data-sort]");
    const drawn = new Map(menu.find(({ declarations }) => declarations.some(([property]) => property === "appearance"))!.declarations);
    expect(drawn.get("appearance")).toBe("none");
    const gradients = drawn.get("background-image")!.match(/linear-gradient\([^)]*\)/g)!;
    expect(gradients).toHaveLength(2);
    for (const gradient of gradients) expect(gradient).toContain("currentColor");
    const left = drawn.get("padding")!.split(" ")[3];
    // The last layer is the arrow's right half, so its offset is the arrow's inset.
    expect(drawn.get("background-position")!.split(",").at(-1)!.trim()).toBe(`right ${left} top 50%`);
    // Forced colors drop gradients, so there the browser draws its own arrow.
    expect(layout).toMatch(/@media \(forced-colors: active\) \{\s*\[data-language-filter\],\s*\[data-category-filter\],\s*\[data-sort\] \{[^}]*appearance: auto;/);
  });

  test("leaves styles out of every other .astro file", () => {
    const files = (readdirSync(resolve(ROOT, "site/src"), { recursive: true }) as string[]).filter(
      (path) => path.endsWith(".astro") && path !== join("layouts", "Base.astro"),
    );
    for (const file of ["pages/index.astro", "pages/plugins/[id]/index.astro", "components/Icon.astro"]) {
      expect(files).toContain(join(file));
    }
    for (const file of files) {
      const source = readFileSync(resolve(ROOT, "site/src", file), "utf8");
      expect(source, file).not.toMatch(/<style[\s>]/);
      expect(source, file).not.toMatch(/\sstyle=/);
    }
  });
});

// The color variables of one :root block of the layout.
function colors(block: string): Map<string, string> {
  return new Map([...block.matchAll(/(--[\w-]+):\s*(#[0-9a-f]{6});/gi)].map(([, name, value]) => [name!, value!.toLowerCase()]));
}

// WCAG 2.2 contrast ratio of two #rrggbb colors.
function contrast(a: string, b: string): number {
  const luminance = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map((at) => {
      const c = parseInt(hex.slice(at, at + 2), 16) / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
  };
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light! + 0.05) / (dark! + 0.05);
}

describe("the site colors", () => {
  const layout = readFileSync(resolve(ROOT, "site/src/layouts/Base.astro"), "utf8");
  const light = colors(/\n {6}:root \{(.*?)\n {6}\}/s.exec(layout)![1]!);
  const darkBlock = /@media \(prefers-color-scheme: dark\) \{\s*:root:not\(\[data-theme="light"\]\) \{(.*?)\}/s.exec(layout)![1]!;
  const dark =new Map([...light, ...colors(darkBlock)]);
  // Each text token on each surface, and each status token on its own background and on
  // the surface, at 4.5:1; each mark or icon token on the surface at 3:1, the star, which
  // the plugin page head shows on the page background, on both, and the pressed version
  // button's bar on that button's fill.
  const PAIRS: [string, string, number][] = [
    ...["--text", "--muted", "--link"].flatMap((text) =>
      ["--bg", "--surface", "--hover"].map((surface): [string, string, number] => [text, surface, 4.5]),
    ),
    ...["--ok", "--part", "--bad"].flatMap((status): [string, string, number][] => [
      [status, `${status}-bg`, 4.5],
      [status, "--surface", 4.5],
    ]),
    ["--faint", "--surface", 3],
    ["--none", "--surface", 3],
    ["--star", "--bg", 3],
    ["--star", "--surface", 3],
    ["--accent", "--surface", 3],
    ["--accent", "--hover", 3],
  ];

  describe("the favicon", () => {
    const icon = () => readFileSync(join(out, "favicon.svg"), "utf8");

    test("is linked from every page as a PNG, then an SVG, beside the touch icon", () => {
      const files = htmlFiles(out);
      expect(files).toHaveLength(ids.length + 3);
      for (const file of files) {
        const icons = tagsOf(readFileSync(join(out, file), "utf8")).filter((tag) => tag.rel === "icon" || tag.rel === "apple-touch-icon");
        expect(icons, file).toEqual([
          { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon.png" },
          { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
          { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
        ]);
      }
    });

    test("draws the lens mark in a 16 by 16 view box: an even-odd rim of two circles, a disc, and a Z of M and L commands", () => {
      const lens = lensParts(icon());
      expect(icon()).toContain('viewBox="0 0 16 16"');
      expect(lens.tags.map((tag) => /^<(\w+)/.exec(tag)![1])).toEqual(["path", "circle", "path"]);
      expect(lens.tags[0]).toContain('fill-rule="evenodd"');
      expect(lens.rim).toHaveLength(2);
      expect(lens.rim[0]!.cx).toBe(lens.rim[1]!.cx);
      expect(lens.rim[0]!.cy).toBe(lens.rim[1]!.cy);
      expect(attribute(lens.tags[2]!, "d")).toMatch(/^M[-\d. ]+(?:L[-\d. ]+)+$/);
    });

    test("fills the rim, disc, and Z with each scheme's colors, the Z readable on the disc and the rim on the page", () => {
      const fills = lensParts(icon()).tags.map((tag) => attribute(tag, "fill"));
      expect(fills).toEqual(["#1d5fb8", "#a9cbff", "#0e2f5c"]);
      const darkRules = /@media \(prefers-color-scheme: dark\) \{([^}]*\}[^}]*\}[^}]*\})/.exec(icon())![1]!;
      const darkFills = ["logo-rim", "logo-disc", "logo-z"].map((name) => new RegExp(`\\.${name} \\{ fill: (#[0-9a-f]{6}) \\}`).exec(darkRules)![1]);
      expect(darkFills).toEqual(["#7fb0ff", "#1d5fb8", "#ffffff"]);
      expect(lensParts(icon()).tags.map((tag) => attribute(tag, "class"))).toEqual(["logo-rim", "logo-disc", "logo-z"]);
      for (const [[rim, disc, z], scheme] of [[fills, light], [darkFills, dark]] as const) {
        expect(contrast(z!, disc!)).toBeGreaterThanOrEqual(4.5);
        expect(contrast(rim!, scheme.get("--bg")!)).toBeGreaterThanOrEqual(3);
        expect(contrast(rim!, scheme.get("--surface")!)).toBeGreaterThanOrEqual(3);
      }
    });

    test("is the full mark's lens cut out and scaled so the rim's outer edge has radius 7.5 at the center", () => {
      // The rim reaches 1 grid unit past the full mark's lens opening.
      const { opening, disc, z } = FULL_MARK;
      const scale = 7.5 / (opening.r + 1);
      const at = (x: number, y: number) => [8 + (x - opening.cx) * scale, 8 + (y - opening.cy) * scale] as const;
      const lens = lensParts(icon());
      const expected = [
        { cx: 8, cy: 8, r: 7.5 },
        { cx: at(opening.cx, opening.cy)[0], cy: at(opening.cx, opening.cy)[1], r: opening.r * scale },
        { cx: at(disc.cx, disc.cy)[0], cy: at(disc.cx, disc.cy)[1], r: disc.r * scale },
      ];
      [...lens.rim, lens.disc].forEach((circle, i) => {
        for (const key of ["cx", "cy", "r"] as const) expect(Math.abs(circle[key] - expected[i]![key]), `${i} ${key}`).toBeLessThan(0.001);
      });
      expect(lens.z).toHaveLength(z.length);
      lens.z.forEach(([x, y], i) => {
        const [ex, ey] = at(...z[i]!);
        expect(Math.abs(x - ex) + Math.abs(y - ey), `Z corner ${i}`).toBeLessThan(0.001);
      });
    });
  });

  describe("the PNG icons", () => {
    const pictures = Object.entries(PICTURES);
    // Bytes 16 to 25 of a PNG hold its IHDR chunk's width, height, bit depth, and color type.
    const header = (png: Buffer) => ({ width: png.readUInt32BE(16), height: png.readUInt32BE(20), depth: png[24], type: png[25] });
    function chunks(png: Buffer): string[] {
      const names: string[] = [];
      for (let at = 8; at < png.length; at += 12 + png.readUInt32BE(at)) names.push(png.toString("latin1", at + 4, at + 8));
      return names;
    }
    const WHITE = [255, 255, 255];
    const COLORS: [Part, number[]][] = [
      ["body", [0x1d, 0x5f, 0xb8]],
      ["disc", [0xa9, 0xcb, 0xff]],
      ["z", [0x0e, 0x2f, 0x5c]],
      ["ring", WHITE],
    ];
    // The full mark's cuts, which only it has.
    const FULL_CUTS: [Part, number[]][] = [
      ["light", WHITE],
      ["lid gap", WHITE],
    ];
    const SIZES: Record<string, number> = { "favicon.png": 32, "apple-touch-icon.png": 180, "preview.png": 1200 };

    test.each(pictures)("writes %s at its size as 8-bit RGB with no transparency", (name) => {
      const png = readFileSync(join(out, name));
      const size = SIZES[name];
      expect(header(png)).toEqual({ width: size, height: size, depth: 8, type: 2 });
      expect(chunks(png).at(-1)).toBe("IEND");
      expect(chunks(png)).not.toContain("tRNS");
    });

    test.each(pictures)("draws %s's mark in the light fills on white", async (name, { mark, margin, size }) => {
      const { data, info } = await sharp(readFileSync(join(out, name))).raw().toBuffer({ resolveWithObject: true });
      const pixel = (x: number, y: number) => [...data.subarray((y * size + x) * info.channels, (y * size + x) * info.channels + 3)];
      expect(pixel(0, 0)).toEqual([255, 255, 255]);
      const unit = (16 + 2 * margin) / size;
      // The part that holds a pixel's whole square, read at 5 by 5 points over it, corners included.
      const partOf = (x: number, y: number) => {
        const parts = new Set<Part>();
        for (let i = 0; i <= 4; i++) for (let j = 0; j <= 4; j++) parts.add(partAt(mark, [(x + i / 4) * unit - margin, (y + j / 4) * unit - margin]));
        return parts.size === 1 ? [...parts][0] : undefined;
      };
      const step = Math.max(1, Math.floor(size / 64));
      for (const [part, color] of mark === "full" ? [...COLORS, ...FULL_CUTS] : COLORS) {
        let probe: [number, number] | undefined;
        for (let y = 0; y < size && !probe; y += step) for (let x = 0; x < size && !probe; x += step) if (partOf(x, y) === part) probe = [x, y];
        expect(probe, `${name} ${part}`).toBeDefined();
        pixel(...probe!).forEach((value, i) => expect(Math.abs(value - color[i]!), `${name} ${part} at ${probe}`).toBeLessThanOrEqual(8));
      }
    });
  });

  describe("the logo", () => {
    test("writes logo.svg: the phone icon's three shapes and fills in a 16 by 16 view box, with nothing else to draw a background", () => {
      const svg = readFileSync(join(out, "logo.svg"), "utf8");
      const elements = (text: string) => text.match(/<[a-z][^\s>/]*/g) ?? [];
      const shapes = (text: string) => text.match(/<(?:path|circle)\b[^>]*>/g) ?? [];
      expect(svg).toMatch(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 16 16">/);
      expect(elements(svg)).toEqual(["<svg", "<path", "<circle", "<path"]);
      expect(shapes(svg)).toEqual(shapes(pictureSvg("apple-touch-icon.png")));
    });

    test("is the full mark's three shapes, as the phone icon draws them, hidden from screen readers, before the site's name on every page", () => {
      const shapes = (svg: string) => svg.match(/<(?:path|circle|rect|ellipse|polygon|polyline|line|image|text|use)\b[^>]*>/g) ?? [];
      const bare = (tag: string) => tag.replace(/ (?:fill|class)="[^"]*"/g, "");
      const full = shapes(pictureSvg("apple-touch-icon.png")).map(bare);
      expect(full.map((tag) => /^<(\w+)/.exec(tag)![1])).toEqual(["path", "circle", "path"]);
      for (const file of htmlFiles(out)) {
        const brand = /<a class="brand"[^>]*>(.*?)<\/a>/s.exec(readFileSync(join(out, file), "utf8"))![1]!;
        const icons = brand.match(/<svg\b.*?<\/svg>/gs);
        expect(icons, file).toHaveLength(1);
        expect(icons![0], file).toContain('aria-hidden="true"');
        expect(icons![0], file).toContain('viewBox="0 0 16 16"');
        expect(shapes(icons![0]!).map(bare), file).toEqual(full);
        expect(shapes(icons![0]!).map((tag) => attribute(tag, "class")), file).toEqual(["logo-body", "logo-disc", "logo-z"]);
        expect(brand.startsWith(icons![0]!), file).toBe(true);
        expect(brand.replace(icons![0]!, ""), file).toBe("Zotdex");
      }
    });

    test("draws the mark 2rem square beside the site's name at the type scale's --text-xl", () => {
      const rule = (selector: string) => new RegExp(`\\n {6}${selector.replace(/\./g, "\\.")} \\{([^}]*)\\}`).exec(layout)![1]!;
      expect(rule(".brand")).toMatch(/font-size: var\(--text-xl\);/);
      expect(rule(".brand .logo")).toMatch(/width: 2rem;\s*height: 2rem;/);
    });

    test("leaves nothing of the old puzzle piece in any built file", () => {
      const files = (readdirSync(out, { recursive: true }) as string[]).filter((path) => statSync(join(out, path)).isFile());
      expect(files).toContain("favicon.png");
      for (const file of files) {
        const text = readFileSync(join(out, file), "latin1");
        expect(/puzzle/i.test(text), file).toBe(false);
        expect(text.includes("M15.39 4.39"), file).toBe(false);
      }
    });

    test("fills the body, disc, and Z from each scheme's tokens, with CanvasText and Canvas in forced colors, and leaves no square behind", () => {
      expect(layout).not.toContain(".brand::before");
      const base = /\n {6}\.brand \.logo-body \{\s*fill: var\(--accent\);\s*\}\s*\.brand \.logo-disc \{\s*fill: var\(--logo-disc\);\s*\}\s*\.brand \.logo-z \{\s*fill: var\(--logo-z\);/.exec(layout);
      const forced = /@media \(forced-colors: active\) \{\s*\.brand \.logo-body,\s*\.brand \.logo-disc \{\s*fill: CanvasText;\s*\}\s*\.brand \.logo-z \{\s*fill: Canvas;/.exec(layout);
      expect(base).not.toBeNull();
      expect(forced).not.toBeNull();
      // The rules have one specificity, so the forced-colors fills win only when they come later.
      expect(forced!.index).toBeGreaterThan(base!.index);
      expect(layout.match(/--logo-disc: #[0-9a-f]{6};/g)).toEqual(["--logo-disc: #a9cbff;", "--logo-disc: #1d5fb8;", "--logo-disc: #1d5fb8;"]);
      expect(layout.match(/--logo-z: #[0-9a-f]{6};/g)).toEqual(["--logo-z: #0e2f5c;", "--logo-z: #ffffff;", "--logo-z: #ffffff;"]);
    });
  });

  test("sets --accent to the site's blue in the light block and both dark blocks, and the pressed version button's bar draws from it", () => {
    expect(layout.match(/--accent: #[0-9a-f]{6};/g)).toEqual(["--accent: #1d5fb8;", "--accent: #7fb0ff;", "--accent: #7fb0ff;"]);
    expect(layout).toMatch(/\[data-version-filter\] button\[aria-pressed="true"\] \{[^}]*box-shadow: inset 0 -2px 0 var\(--accent\);/);
  });

  test.each([
    ["light", light],
    ["dark", dark],
  ])("gives each listed token pair its contrast in the %s scheme", (_, scheme) => {
    for (const [text, background, least] of PAIRS) {
      expect(scheme.get(text), text).toMatch(/^#/);
      expect(scheme.get(background), background).toMatch(/^#/);
      expect(contrast(scheme.get(text)!, scheme.get(background)!), `${text} on ${background}`).toBeGreaterThanOrEqual(least);
    }
  });

  test("redefines every hex color of the light block in the dark block, so none falls back to it", () => {
    expect([...colors(darkBlock).keys()].sort()).toEqual([...light.keys()].sort());
  });

  test("holds the same dark custom properties for the system setting and a saved scheme", () => {
    const properties = (selector: string) =>
      cssRules(layout)
        .find((rule) => rule.selector === selector)!
        .declarations.filter(([property]) => property.startsWith("--"))
        .sort();
    const system = properties(':root:not([data-theme="light"])');
    expect(system.length).toBeGreaterThan(0);
    expect(properties(':root[data-theme="dark"]')).toEqual(system);
  });

  test.each(["light", "dark"])("sets the browser's color scheme to match a saved %s scheme", (scheme) => {
    const rule = cssRules(layout).find(({ selector }) => selector === `:root[data-theme="${scheme}"]`);
    expect(rule?.declarations).toContainEqual(["color-scheme", scheme]);
  });

  test("shows the moon when a press gives dark and the sun when it gives light", () => {
    const hidden = cssRules(layout)
      .filter(({ declarations }) => declarations.some(([property, value]) => property === "display" && value === "none"))
      .flatMap(({ selector }) => selector.split(",").map((part) => part.trim()));
    expect(hidden).toContain('[data-gives="dark"] [data-theme-icon="sun"]');
    expect(hidden).toContain('[data-gives="light"] [data-theme-icon="moon"]');
  });

  const together = cssRules(layout).flatMap(({ selector, declarations }) => {
    const get = (name: string) => declarations.find(([property]) => property === name)?.[1];
    const text = get("color");
    const background = get("background") ?? get("background-color");
    return text && background ? [{ selector, text, background }] : [];
  });

  test.each([
    ["light", light],
    ["dark", dark],
  ])("gives the text and background that each rule sets together a contrast of at least 4.5:1 in the %s scheme", (_, scheme) => {
    expect(together.map(({ selector }) => selector)).toEqual(
      expect.arrayContaining(["body", ".btn", '.mark[data-support="all"]', '[data-version-filter] button[aria-pressed="true"]']),
    );
    for (const { selector, text, background } of together) {
      const [, textName] = /^var\((--[\w-]+)\)$/.exec(text) ?? [];
      const [, backgroundName] = /^var\((--[\w-]+)\)$/.exec(background) ?? [];
      expect(scheme.get(textName!), `${selector} color`).toMatch(/^#/);
      expect(scheme.get(backgroundName!), `${selector} background`).toMatch(/^#/);
      expect(contrast(scheme.get(textName!)!, scheme.get(backgroundName!)!), selector).toBeGreaterThanOrEqual(4.5);
    }
  });

  test("colors each report button from its verdict's pair", () => {
    expect(layout).toMatch(/\.button\[data-report="works"\] \{\s*background: var\(--ok-bg\);\s*color: var\(--ok\);\s*\}/);
    expect(layout).toMatch(/\.button\[data-report="broken"\] \{\s*background: var\(--bad-bg\);\s*color: var\(--bad\);\s*\}/);
  });

  test("fills the plugin page's star with --star and no stroke, with CanvasText in forced colors, and keeps it on one line", () => {
    const base = /\n {6}\[data-repo-stars\] \.icon \{[^}]*fill: var\(--star\);[^}]*stroke: none;/.exec(layout);
    const forced = /@media \(forced-colors: active\) \{\s*\[data-repo-stars\] \.icon \{\s*fill: CanvasText;/.exec(layout);
    expect(base).not.toBeNull();
    expect(forced).not.toBeNull();
    // Both rules have one specificity, so the forced-colors fill wins only when it comes later.
    expect(forced!.index).toBeGreaterThan(base!.index);
    expect(layout).toMatch(/\[data-repo-stars\] \{\s*white-space: nowrap;/);
  });

  // A report button's border takes its text color, and WCAG 2.2 asks 3:1 for a control's edge.
  test.each([
    ["light", light],
    ["dark", dark],
  ])("gives each report button's edge a contrast of at least 3:1 with the surface in the %s scheme", (_, scheme) => {
    expect(layout).toMatch(/\.button \{[^}]*border: 1px solid currentColor;/);
    for (const border of ["--ok", "--bad"]) {
      expect(contrast(scheme.get(border)!, scheme.get("--surface")!), `${border} on --surface`).toBeGreaterThanOrEqual(3);
    }
  });

  test.each([
    ["light", light],
    ["dark", dark],
  ])("gives the edges of the search box, the menus, including the sort menu, the version buttons, the pager buttons, and the plugin page links a contrast of at least 3:1 with the surface and the page in the %s scheme", (_, scheme) => {
    const edges = cssRules(layout).flatMap(({ selector, declarations }) =>
      declarations
        .filter(([property, value]) => (property === "border" || property === "border-left") && value.includes("var("))
        .filter(() => [".search input", "[data-language-filter]", "[data-version-filter]", ".btn", ".pager button"].some((control) => selector.includes(control)))
        .map(([, value]) => ({ selector, token: /var\((--[\w-]+)\)/.exec(value)?.[1] })),
    );
    expect(edges.map(({ selector }) => selector)).toEqual([
      ".search input, [data-language-filter], [data-category-filter], [data-sort], [data-version-filter], .pager button",
      "[data-version-filter] button",
      ".btn",
    ]);
    // The home controls sit on the card and the plugin page links on the page background.
    for (const { selector, token } of edges) {
      for (const background of ["--surface", "--bg"]) {
        expect(contrast(scheme.get(token!)!, scheme.get(background)!), `${selector}: ${token} on ${background}`).toBeGreaterThanOrEqual(3);
      }
    }
  });
});
