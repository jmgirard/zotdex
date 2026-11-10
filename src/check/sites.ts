import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";
import { Ajv } from "ajv";
import schema from "../../schemas/sites.schema.json" with { type: "json" };

// One court ruling against a site, as `sites.json` records it. `date` is YYYY-MM when the
// ruling's day could not be found.
export interface Ruling {
  country: string;
  court: string;
  date: string;
  case: string;
  kind: "contested judgment" | "default judgment" | "blocking order";
  url: string;
}

// A listed site: courts in at least two countries ordered it blocked or shut down for
// copyright infringement. `names` are the names that the bot matches in a plugin's text.
export interface Site {
  site: string;
  names: string[];
  rulings: Ruling[];
}

// The fewest countries whose courts must have ruled against a site.
export const COUNTRIES_MIN = 2;

const validate = new Ajv({ allErrors: true }).compile(schema);

// The file every command reads. Tests name another file.
export function sitesPath(): string {
  return process.env.ZPI_SITES || resolve(import.meta.dirname, "../../sites.json");
}

// A text's runs of the letters a to z and digits, in lower case, after NFKC folds
// full-width and other compatibility forms. A run also ends where a lower-case letter or a
// digit meets an upper-case one, so `SciHub` gives `sci` and `hub`.
export function textRuns(text: string): string[] {
  const split = text.normalize("NFKC").replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  return split.toLowerCase().match(/[a-z0-9]+/g) ?? [];
}

// A name's runs joined, which a text names when some of its runs in a row join to it.
export function siteKey(name: string): string {
  return textRuns(name).join("");
}

// Whether some whole runs of `text` in a row join to `key`. So `Sci-Hub` names `scihub`,
// as do `sci hub`, `SciHub`, and `zotero-scihub`, but `scihubble` does not.
export function textNames(text: string, key: string): boolean {
  if (key === "") return false;
  const runs = textRuns(text);
  for (let start = 0; start < runs.length; start++) {
    let joined = "";
    for (let end = start; end < runs.length && joined.length < key.length; end++) {
      joined += runs[end];
      if (joined === key) return true;
    }
  }
  return false;
}

// The sites that `text` names, in the file's order.
export function sitesNamedIn(text: string, sites: readonly Site[]): Site[] {
  return sites.filter((site) => site.names.some((name) => textNames(text, siteKey(name))));
}

// The file's problems that its schema does not see: a site that an earlier record already
// gives, a ruling dated on a day that its month does not have, a site with rulings from fewer
// than COUNTRIES_MIN countries, a name with no letter or digit, and a name that matches the
// same texts as another name.
export function sitesProblems(sites: readonly Site[]): string[] {
  const problems: string[] = [];
  const keys = new Map<string, string>();
  const seen = new Set<string>();
  for (const [index, site] of sites.entries()) {
    if (seen.has(site.site)) problems.push(`/${index} ${JSON.stringify(site.site)} is the site of an earlier record`);
    seen.add(site.site);
    for (const [at, { date }] of site.rulings.entries()) {
      const day = new Date(`${date}T00:00:00Z`);
      if (date.length === 10 && (Number.isNaN(day.getTime()) || day.toISOString().slice(0, 10) !== date)) {
        problems.push(`/${index}/rulings/${at} ${JSON.stringify(site.site)} has the date ${date}, a day that its month does not have`);
      }
    }
    const countries = new Set(site.rulings.map(({ country }) => country));
    if (countries.size < COUNTRIES_MIN) problems.push(`/${index} ${JSON.stringify(site.site)} has rulings from ${countries.size} country, and needs ${COUNTRIES_MIN}`);
    for (const name of site.names) {
      const key = siteKey(name);
      if (key === "") {
        problems.push(`/${index} ${JSON.stringify(site.site)} has the name ${JSON.stringify(name)} with no letter a to z or digit`);
      } else if (keys.has(key)) {
        problems.push(`/${index} ${JSON.stringify(site.site)} has the name ${JSON.stringify(name)}, which matches what ${JSON.stringify(keys.get(key))} matches`);
      } else {
        keys.set(key, name);
      }
    }
  }
  return problems;
}

// Throws with the file's problems when it cannot be read, its schema refuses it, or
// sitesProblems finds any. A missing file is such a problem, so a lost file cannot let
// pull requests that name a listed site through unheld.
export async function readSites(path = sitesPath()): Promise<Site[]> {
  let value: unknown;
  try {
    value = JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    throw new Error(`cannot read the sites file: ${(error as Error).message}`);
  }
  if (!validate(value)) {
    const problems = (validate.errors ?? []).map((error) => `${error.instancePath || "(root)"} ${error.message ?? "is invalid"}`);
    throw new Error(`the sites file does not match schemas/sites.schema.json: ${problems.join("; ")}`);
  }
  const problems = sitesProblems(value as Site[]);
  if (problems.length > 0) throw new Error(`the sites file breaks the listed-site rules: ${problems.join("; ")}`);
  return value as Site[];
}
