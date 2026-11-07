import { readFileSync } from "node:fs";
import type { Override, PluginRecord, PluginsFile, StartTestRecord } from "../../src/build/build.ts";
import { CATEGORIES, categories, categoryOptions } from "../../src/site/categories.ts";
import { type SortRow, sortOrder } from "../../src/site/home-filter.ts";
import { cutDescription, shownDescription } from "../../src/site/description.ts";
import { appliedLanguages, languageName, languageOptions, listedSubtags, rowLanguages } from "../../src/site/languages.ts";
import {
  appliedValue,
  declaredRange,
  majorStart,
  rowMajors,
  usedOverride,
  ZOTERO_MAJORS,
  type MajorSupport,
} from "../../src/site/version.ts";
import { BASE, ORIGIN } from "./base.ts";

export { BASE, CATEGORIES, categories, categoryOptions, declaredRange, languageName, languageOptions, majorStart, shownDescription };
export type { Override, PluginRecord };

// The words of the paid service mark, its legend line, and its Details fact (D-054).
export const PAID_SERVICE_TEXT = "Needs a paid service from its maker";

let loaded: { path: string; data: PluginsFile } | undefined;

// pnpm site sets ZPI_SITE_DATA to the data file it builds the pages from. Every page
// calls this, so the file is parsed once per path.
export function loadData(): PluginsFile {
  const path = process.env.ZPI_SITE_DATA;
  if (!path) throw new Error("ZPI_SITE_DATA is not set; build the site with pnpm site");
  if (loaded?.path === path) return loaded.data;
  const data = JSON.parse(readFileSync(path, "utf8")) as PluginsFile;
  if (!Array.isArray(data?.plugins)) throw new Error(`${path} has no plugins list`);
  loaded = { path, data };
  return data;
}

export function pluginHref(id: string): string {
  return `${BASE}plugins/${encodeURIComponent(id)}/`;
}

// The Markdown of a plugin's README badge (D-071): the shields.io image of its badge file,
// linked to its page here.
export function badgeSnippet(id: string): string {
  const file = `${ORIGIN}${BASE}badges/${encodeURIComponent(id)}.json`;
  return `[![Zotdex](https://img.shields.io/endpoint?url=${encodeURIComponent(file)})](${ORIGIN}${pluginHref(id)})`;
}

// The name after overrides, or the id when neither the manifest nor an override gives one.
export function displayName(record: PluginRecord): string {
  return appliedValue(record, "name", record.upstream?.name) ?? record.id;
}

// A plugin page's link preview text: its shown description, cut to length, or a sentence that
// names the plugin when it has none or when the cut leaves only whitespace.
export function previewDescription(record: PluginRecord): string {
  const cut = cutDescription(shownDescription(record) ?? "");
  return cut.trim() === "" ? `${displayName(record)} is a Zotero plugin listed in Zotdex.` : cut;
}

// The records in the order of the built home table: the sort menu's Stars order.
export function homeOrder(records: PluginRecord[]): PluginRecord[] {
  const order = sortOrder("");
  return records
    .map((record) => ({ record, row: sortRow(record) }))
    .toSorted((a, b) => order(a.row, b.row))
    .map(({ record }) => record);
}

// What the sort menu's orders read from a record.
export function sortRow(record: PluginRecord): SortRow {
  return {
    id: record.id,
    name: displayName(record),
    stars: record.upstream?.stars,
    released: record.upstream?.latestReleaseDate,
  };
}

export function rangeText(record: PluginRecord): string {
  const { min, max } = declaredRange(record);
  if (min !== undefined && max !== undefined) return `Zotero ${min} to ${max}`;
  if (min !== undefined) return `Zotero ${min} or newer`;
  if (max !== undefined) return `Zotero ${max} or older`;
  return "No declared range";
}

// The sign for each kind of declared support, on a home table mark and a plugin page's
// compatibility table.
export const SUPPORT_MARKS: Record<MajorSupport, string> = { all: "✓", some: "◐", none: "–" };

// The word for each kind of declared support in a plugin page's compatibility table.
export const SUPPORT_WORDS: Record<MajorSupport, string> = { all: "Yes", some: "Partly", none: "No" };

// The words for one major's declared support, as a mark's title and hidden text say them.
export function supportText(record: PluginRecord, support: MajorSupport, major: string): string {
  if (support === "all") return `Declares all of Zotero ${major}`;
  if (support === "some") return `Declares part of Zotero ${major}. Declared range: ${rangeText(record)}`;
  return `Does not declare Zotero ${major}`;
}

// The names of the languages after overrides, in list order, or "Unknown (no translations
// found)" when none is left. The list is empty when, for example, a plugin writes its text in
// its code and ships no locale folders, so the index cannot tell which language that text is in.
export function languagesText(record: PluginRecord): string {
  const tags = appliedLanguages(record);
  return tags.length > 0 ? tags.map(languageName).join(", ") : "Unknown (no translations found)";
}

// The language subtags a home row shows (see listedSubtags): all of them when there are 3
// or fewer, else the first 2, with the rest under "+N".
export function shortLanguages(record: PluginRecord): { shown: string[]; rest: string[] } {
  const subtags = listedSubtags(record);
  return subtags.length <= 3 ? { shown: subtags, rest: [] } : { shown: subtags.slice(0, 2), rest: subtags.slice(2) };
}

// Astro writes an attribute whose value is "" as its bare name, and checks for "" with ===,
// so an empty value goes out as a String object, which Astro writes as name="".
function attributeValue(value: string): string | String {
  return value === "" ? new String("") : value;
}

// The row's data-languages value (see rowLanguages).
export function rowLanguagesAttribute(record: PluginRecord): string | String {
  return attributeValue(rowLanguages(record));
}

// The row's data-categories value: its categories' slugs joined by spaces (see categories).
export function rowCategoriesAttribute(record: PluginRecord): string | String {
  return attributeValue(categories(record).join(" "));
}

// The row's data-zotero value (see rowMajors), with the data's current Zotero release.
export function rowMajorsAttribute(record: PluginRecord, zoteroRelease: string | undefined): string | String {
  return attributeValue(rowMajors(record, zoteroRelease));
}

// The upstream value an override corrects, under the override's field name. A description has
// two upstream texts, so upstreamLines reads those.
export function upstreamValue(record: PluginRecord, field: string): string | undefined {
  const upstream = record.upstream;
  if (!upstream) return undefined;
  const fields: Record<string, string | undefined> = {
    name: upstream.name,
    homepage: upstream.homepage,
    strict_min_version: upstream.strictMinVersion,
    strict_max_version: upstream.strictMaxVersion,
    languages: upstream.languages?.length ? upstream.languages.join(", ") : undefined,
  };
  return fields[field];
}

// The lines of the Overrides table's Upstream value cell: for a description, each upstream text
// that is not blank under its label, and for another field, its one value; "none" with neither.
export function upstreamLines(record: PluginRecord, field: string): string[] {
  const value = upstreamValue(record, field);
  const lines =
    field === "description"
      ? [
          ...(record.upstream?.description?.trim() ? [`Manifest: ${record.upstream.description}`] : []),
          ...(record.upstream?.repoDescription?.trim() ? [`GitHub: ${record.upstream.repoDescription}`] : []),
        ]
      : value === undefined
        ? []
        : [value];
  return lines.length > 0 ? lines : ["none"];
}

// Whether this override is the one that applies to its field, for the version the index
// read (see usedOverride).
export function overrideUsed(record: PluginRecord, override: Override): boolean {
  return usedOverride(record, override.field) === override;
}

// What every page's footer and the home page's intro say about the index itself.
export const DISCLAIMER = "This index is unofficial and not affiliated with or endorsed by Zotero, and it cannot vet the plugins it lists.";

// The About page's section on installing a plugin.
export const INSTALL_HREF = `${BASE}about/#installing`;

// The license page of the index repo, docs/license.md.
export const LICENSE_HREF = "https://github.com/jmgirard/zotdex/blob/main/docs/license.md";

// The index repo's page for a new issue, where the report forms live.
const NEW_ISSUE = "https://github.com/jmgirard/zotdex/issues/new";

// The new-issue page with the add-plugin.yml form, which proposes a plugin for the index.
export const ADD_PLUGIN_HREF = `${NEW_ISSUE}?template=add-plugin.yml`;

// Where the top bar sends general feedback.
export const FEEDBACK_HREF = "https://github.com/jmgirard/zotdex/discussions";

// The new-issue page with the works.yml or broken.yml form, its plugin and version fields
// filled in with the record's id and the version the index read.
export function reportHref(record: PluginRecord, verdict: "works" | "broken"): string {
  const fields = [`template=${verdict}.yml`, `plugin=${encodeURIComponent(record.id)}`];
  if (record.upstream) fields.push(`version=${encodeURIComponent(record.upstream.version)}`);
  return `${NEW_ISSUE}?${fields.join("&")}`;
}

// The issue form where a plugin repository's owner asks for another name or description, with
// the plugin filled in.
export function textChangeHref(record: PluginRecord): string {
  return `${NEW_ISSUE}?template=text-change.yml&plugin=${encodeURIComponent(record.id)}`;
}

// The issue form that asks to remove a plugin or reports harm.
export const REMOVE_PLUGIN_HREF = `${NEW_ISSUE}?template=remove-plugin.yml`;

// That form with the plugin filled in.
export function removeHref(record: PluginRecord): string {
  return `${REMOVE_PLUGIN_HREF}&plugin=${encodeURIComponent(record.id)}`;
}

// Each start-test result in words.
const START_WORDS: Record<StartTestRecord["result"], string> = {
  started: "started",
  "start-error": "failed at startup",
  "not-installed": "did not install",
  "timed-out": "gave no answer in time",
};

// One start-test result in words, such as "Zotero 8.0.4 failed at startup".
export function startText({ zotero, result }: StartTestRecord): string {
  return `Zotero ${zotero} ${START_WORDS[result]}`;
}

// One start-test result in words that open a table cell, such as "Failed at startup".
export function startWords(result: StartTestRecord["result"]): string {
  const words = START_WORDS[result];
  return words[0]!.toUpperCase() + words.slice(1);
}

// The Zotero majors of a plugin page's compatibility table, newest first: each major of
// ZOTERO_MAJORS and each other major that the record's reports or start results name.
export function compatMajors(record: PluginRecord): string[] {
  const majors = new Set([
    ...ZOTERO_MAJORS,
    ...(record.reports ?? []).map(({ zoteroMajor }) => String(zoteroMajor)),
    ...(record.startTests ?? []).map(({ zotero }) => zotero.split(".")[0]!),
  ]);
  return [...majors].sort((a, b) => Number(b) - Number(a));
}

// The counted reports on Zotero major N, if any count. The build writes one item per major,
// and the schema allows more, so the counts of every item for N are added.
export function majorReport(record: PluginRecord, major: string): { works: number; broken: number } | undefined {
  const items = (record.reports ?? []).filter(({ zoteroMajor }) => String(zoteroMajor) === major);
  if (items.length === 0) return undefined;
  return items.reduce((sum, { works, broken }) => ({ works: sum.works + works, broken: sum.broken + broken }), { works: 0, broken: 0 });
}

// Only an http or https URL becomes a link; repoUrl in meta.json is any string.
export function safeHref(url: string): string | undefined {
  return /^https?:\/\//i.test(url) ? url : undefined;
}

// The owner and repo of a URL of the form https://github.com/<owner>/<repo>, with or without
// a trailing slash, or undefined for any other URL, such as one with a query or a fragment.
export function githubRepo(url: string): { owner: string; repo: string } | undefined {
  const match = /^https:\/\/github\.com\/([^/?#]+)\/([^/?#]+?)\/?$/.exec(url);
  return match ? { owner: match[1]!, repo: match[2]! } : undefined;
}

// A star count in words, such as "1 GitHub Star" or "1,234 GitHub Stars".
export function starsText(stars: number): string {
  return `${stars.toLocaleString("en")} ${stars === 1 ? "GitHub Star" : "GitHub Stars"}`;
}

export function day(timestamp: string): string {
  return timestamp.slice(0, 10);
}

// The year and month of a timestamp in UTC, such as "2026-09".
export function monthYear(timestamp: string): string {
  return new Date(timestamp).toISOString().slice(0, 7);
}
