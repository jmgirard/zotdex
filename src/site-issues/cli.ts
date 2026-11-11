import { readFile } from "node:fs/promises";
import process from "node:process";
import { parseArgs } from "node:util";
import type { PluginsFile } from "../build/build.ts";
import { readSites, type Site } from "../check/sites.ts";
import { matchesOf, reportMatches } from "./site-issues.ts";

const USAGE = "usage: pnpm site-issues --data <file> --sites <file> [--assignee <login>]";

// Opens a GitHub issue for each listed plugin and site that no issue names yet (see
// reportMatches), in the repository that GITHUB_REPOSITORY names, with GITHUB_TOKEN. It exits 0
// whatever GitHub answers, and 1 only for a usage error, an unset or empty GITHUB_REPOSITORY,
// data it cannot read or that has no plugins list, or a sites file that readSites refuses.
async function main(): Promise<number> {
  let values: { data?: string; sites?: string; assignee?: string };
  try {
    ({ values } = parseArgs({
      options: { data: { type: "string" }, sites: { type: "string" }, assignee: { type: "string" } },
      allowPositionals: false,
    }));
  } catch (error) {
    console.error(`${(error as Error).message}\n${USAGE}`);
    return 1;
  }
  const repo = process.env.GITHUB_REPOSITORY;
  if (values.data === undefined || values.sites === undefined || !repo) {
    console.error(repo ? USAGE : `GITHUB_REPOSITORY is not set\n${USAGE}`);
    return 1;
  }
  let data: PluginsFile;
  try {
    data = JSON.parse(await readFile(values.data, "utf8"));
  } catch (error) {
    console.error(`cannot read the data: ${(error as Error).message}`);
    return 1;
  }
  if (!Array.isArray(data?.plugins)) {
    console.error(`${values.data} has no plugins list`);
    return 1;
  }
  let sites: Site[];
  try {
    sites = await readSites(values.sites);
  } catch (error) {
    console.error((error as Error).message);
    return 1;
  }
  const matches = matchesOf(data, sites);
  const outcome = await reportMatches({ matches, fetch, repo, token: process.env.GITHUB_TOKEN, assignee: values.assignee || undefined });
  for (const line of outcome.lines) console.log(line);
  console.log(`${matches.length} listed-site matches, ${outcome.opened.length} issues opened`);
  return 0;
}

// Set exitCode rather than calling exit(), so piped output is not cut off.
process.exitCode = await main();
