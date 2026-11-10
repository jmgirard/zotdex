import { join, resolve } from "node:path";
import process, { argv } from "node:process";
import { readSites } from "../check/sites.ts";
import { refreshHolds } from "./refresh-holds.ts";

const USAGE = "usage: pnpm refresh-holds [--apply], with GITHUB_REPOSITORY set, and with --apply GITHUB_TOKEN too";
const PACKAGE_ROOT = resolve(import.meta.dirname, "../..");

// Prints the detail lines of each open held bot pull request, matching names against this
// checkout's plugins/ folder. With `--apply` it also writes them to the pull request's
// body. It exits 1 on a refused argument or GITHUB_REPOSITORY, on `--apply` with no
// GITHUB_TOKEN, when any pull request failed, or when the list of pull requests, the
// plugins/ folder, or sites.json could not be read.
async function main(): Promise<number> {
  const args = argv.slice(2);
  if (args.length > 1 || (args.length === 1 && args[0] !== "--apply")) {
    console.error(USAGE);
    return 1;
  }
  const apply = args.length === 1;
  const indexRepo = process.env.GITHUB_REPOSITORY ?? "";
  if (!/^[\w.-]+\/[\w.-]+$/.test(indexRepo)) {
    console.error(`GITHUB_REPOSITORY must name the index repo as <owner>/<repo>\n${USAGE}`);
    return 1;
  }
  if (apply && !process.env.GITHUB_TOKEN) {
    console.error(`--apply needs GITHUB_TOKEN to edit pull requests\n${USAGE}`);
    return 1;
  }
  let result: Awaited<ReturnType<typeof refreshHolds>>;
  try {
    const sites = await readSites();
    result = await refreshHolds({ fetch: (url: string, init?: RequestInit) => fetch(url, init), indexRepo, root: join(PACKAGE_ROOT, "plugins"), sites, apply });
  } catch (error) {
    console.error(`refreshed nothing: ${(error as Error).message}`);
    return 1;
  }
  for (const { number, lines } of result.changed) console.log(`${apply ? "edited" : "to edit"} #${number}:\n${lines.join("\n")}`);
  for (const number of result.unchanged) console.log(`unchanged #${number}`);
  for (const { number, reason } of result.skipped) console.log(`skipped #${number}: ${reason}`);
  for (const { number, message } of result.failed) console.error(`failed #${number}: ${message}`);
  return result.failed.length > 0 ? 1 : 0;
}

// Set exitCode rather than calling exit(), so piped output is not cut off.
process.exitCode = await main();
