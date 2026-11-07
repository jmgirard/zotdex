import { resolve } from "node:path";
import process, { argv } from "node:process";
import { INDEX_REPO } from "../build/build.ts";
import { screenshotRequest } from "./request.ts";

const USAGE = "usage: pnpm screenshot-request <issue> --data <file> [--file <image>] [--apply [--owner-checked]]";
const PACKAGE_ROOT = resolve(import.meta.dirname, "../..");

// Prints the report on the screenshot issue that <issue> names, and with --apply writes the
// entry. --data is a v1/plugins.json file, such as the deployed one, and --file an image to use
// in place of the field's link. Exit status: see RequestResult, and 2 for a wrong command line.
async function main(): Promise<number> {
  const args = argv.slice(2);
  const issue = args.shift() ?? "";
  let data: string | undefined;
  let file: string | undefined;
  let apply = false;
  let ownerChecked = false;
  let wrong = false;
  while (args.length > 0) {
    const arg = args.shift();
    if (arg === "--data" && data === undefined && args.length > 0) data = args.shift();
    else if (arg === "--file" && file === undefined && args.length > 0) file = args.shift();
    else if (arg === "--apply") apply = true;
    else if (arg === "--owner-checked") ownerChecked = true;
    else wrong = true;
  }
  if (!/^[1-9]\d*$/.test(issue) || !data || wrong || (ownerChecked && !apply)) {
    console.error(USAGE);
    return 2;
  }
  // pnpm runs scripts from the package root and keeps the caller's directory in INIT_CWD.
  const here = process.env.INIT_CWD ?? process.cwd();
  const result = await screenshotRequest({
    root: resolve(PACKAGE_ROOT, "plugins"),
    dataPath: resolve(here, data),
    fetch: (url, init) => fetch(url, init),
    indexRepo: process.env.GITHUB_REPOSITORY ?? INDEX_REPO,
    issue: Number(issue),
    file: file === undefined ? undefined : resolve(here, file),
    apply,
    ownerChecked,
  });
  for (const line of result.lines) console.log(line);
  return result.status;
}

// Set exitCode rather than calling exit(), so piped output is not cut off.
process.exitCode = await main();
