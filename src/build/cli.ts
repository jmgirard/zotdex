import { resolve } from "node:path";
import process, { argv } from "node:process";
import { buildData, writeData, writePlan } from "./build.ts";
import { timingLines } from "./timing.ts";

const USAGE = "usage: pnpm build [<dir>] [--out <dir>] [--plan <file>] [--previous <url>]";

async function main(): Promise<number> {
  const args = argv.slice(2);
  // Each option takes the argument after it, and may appear once.
  const options = new Map<string, string | undefined>();
  const positional: string[] = [];
  let repeated = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--out" || args[i] === "--plan" || args[i] === "--previous") {
      repeated ||= options.has(args[i]);
      options.set(args[i], args[++i]);
    } else positional.push(args[i]);
  }
  const out = options.get("--out");
  const planFile = options.get("--plan");
  const previous = options.get("--previous");
  const missing = ["--out", "--plan", "--previous"].some((option) => options.has(option) && !options.get(option));
  if (repeated || positional.length > 1 || missing) {
    console.error(USAGE);
    return 1;
  }

  // pnpm runs scripts from the package root and keeps the caller's directory in
  // INIT_CWD, so relative paths resolve against where the user typed them.
  const cwd = process.env.INIT_CWD ?? process.cwd();
  const root = positional[0] ? resolve(cwd, positional[0]) : "plugins";
  const outDir = out ? resolve(cwd, out) : "dist";

  // A message can hold upstream text, such as an update_url. Each goes on one line, so no
  // part of it starts a line that GitHub Actions reads as a workflow command.
  const oneLine = (text: string) => text.replace(/[\r\n]+/g, " ");

  // GitHub Actions names the repo the workflow runs in. An empty value reads as unset.
  // With --previous, a record whose read fails for a build-level reason can keep the facts of the
  // deployed data at that address (D-066).
  const built = await buildData(root, (url, init) => fetch(url, init), undefined, process.env.GITHUB_REPOSITORY || undefined, { previous });
  // An invalid entry, a failed read of the report issues, or output that the schema
  // rejects writes no file and exits 1, so the daily build deploys nothing.
  if (!built.ok) {
    for (const problem of built.problems) console.error(oneLine(problem));
    console.error("wrote no file");
    return 1;
  }
  // Without zoteroRelease, only the current major's marks fall back to the N.9 rule, until a
  // later build reads it, so this read does not change the exit code. The line comes before
  // the writes, so a failed write still leaves it in the log. GitHub Actions shows it as a
  // warning on the run.
  if (built.releaseProblem) console.log(`::warning::cannot read the Zotero release: ${oneLine(built.releaseProblem)}`);
  // Without sourceInRepo, a record shows no source fact until a later build reads it, so this
  // read does not change the exit code either.
  if (built.sourceProblem) console.log(`::warning::cannot read every repo's top-level names: ${oneLine(built.sourceProblem)}`);
  // A list in src/site/version.ts that a Zotero release left behind keeps its marks as they
  // were until someone edits it, so these lines do not change the exit code either.
  for (const warning of built.releaseWarnings) console.log(`::warning::${oneLine(warning)}`);
  // A failed read of the deployed data keeps no earlier facts, and the build goes on as it did
  // before it kept them, so this read does not change the exit code either.
  if (built.previousProblem) console.log(`::warning::cannot read the deployed data, so no record keeps earlier facts: ${oneLine(built.previousProblem)}`);
  const written = await writeData(outDir, built.text, built.icons, built.screenshots);
  if (!written.ok) {
    console.error(`write-failed: ${written.message}`);
    return 1;
  }
  // The start plan lists the XPI of each plugin that was read, for the start-test jobs.
  if (planFile) {
    const planned = await writePlan(resolve(cwd, planFile), built.plan);
    if (!planned.ok) {
      console.error(`write-failed: ${planned.message}`);
      return 1;
    }
    console.log(`wrote a start plan of ${built.plan.plugins.length} plugins to ${resolve(cwd, planFile)}`);
  }
  // A kept record's read failed too, so it counts here and in both bars below, under the name of
  // this build's failure.
  const failed = built.data.plugins.flatMap(({ id, failure, kept }) => {
    const why = failure ?? kept?.failure;
    return why ? [{ id, failure: why, readAt: kept?.readAt }] : [];
  });
  // How long the plugin reads took, so a build that its time limit cuts shows where the time
  // went. These lines come before the failure lines, which the tests read as one block.
  for (const line of timingLines(built.timings, built.readsMs)) console.log(line);
  for (const { id, failure, readAt } of failed) {
    const keptLine = readAt ? ` (kept the facts read at ${readAt})` : "";
    console.log(`${id}: ${failure.name}: ${oneLine(failure.message)}${keptLine}`);
  }
  const counts = new Map<string, number>();
  for (const { failure } of failed) counts.set(failure.name, (counts.get(failure.name) ?? 0) + 1);
  for (const name of [...counts.keys()].sort()) console.log(`failed with ${name}: ${counts.get(name)}`);
  const total = built.data.plugins.length;
  const buildLevel = built.buildLevel.length;
  console.log(`build-level failures: ${buildLevel} of ${total} records`);
  // Without --previous no record can keep earlier facts, so the line is left out.
  if (previous) console.log(`kept earlier facts: ${built.kept.length} of ${total} records`);
  // GitHub Actions shows this line as a warning on the run.
  if (buildLevel > 0) console.log(`::warning::${buildLevel} of ${total} records carry a build-level failure`);
  const keptPart = previous ? `, ${built.kept.length} of them with kept facts` : "";
  console.log(`wrote ${total} records to ${written.path}, ${failed.length} with a failed upstream read${keptPart}`);
  // A build-level failure, such as a rate limit or a network error, usually points at the
  // build, not at the plugin. When more than half of the records carry one, exit 1, so the daily
  // build deploys nothing and the last good data stays. Also exit 1 when
  // every record carries a failure of any name, since a reader or schema bug can fail them
  // all with named failures.
  const tooManyBuildLevel = buildLevel * 2 > total;
  const allFailed = failed.length === total;
  if (tooManyBuildLevel) console.error(`${buildLevel} of ${total} records carry a build-level failure, more than half`);
  if (allFailed) console.error(`all ${total} records carry a failure`);
  return tooManyBuildLevel || allFailed ? 1 : 0;
}

// A host lookup whose wait a time limit ended keeps running, since dns.lookup cannot be
// canceled, and it would hold the process open. So exit once stdout and stderr have
// written everything before them; an exit before that could cut off piped output.
const code = await main();
await Promise.all([process.stdout, process.stderr].map((stream) => new Promise<void>((done) => stream.write("", () => done()))));
process.exit(code);
