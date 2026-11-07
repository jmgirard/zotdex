import { copyFile, mkdir, readdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { Ajv, type ErrorObject } from "ajv";
import indexSchema from "../../schemas/index.v1.schema.json" with { type: "json" };
import pluginsSchema from "../../schemas/plugins.v1.schema.json" with { type: "json" };
import { listEntries } from "../check/check.ts";
import { countReports, type ReportCount } from "../reports/count.ts";
import type { StartResultName } from "../start-test/start-test.ts";
import { boundFetch, type Fetch, githubClient, ReadFailure, readUpstream, type UpstreamFacts, type XpiRead } from "../upstream/reader.ts";
import { redrawIcon } from "../upstream/icon.ts";
import { duration, READ_LIMIT_MS, withinLimit } from "../upstream/time-limit.ts";
import { LAST_RELEASES } from "../site/version.ts";
import { type Kept, keptFacts } from "./keep.ts";
import { PREVIOUS_LIMIT_MS, readPrevious, readPreviousIcons } from "./previous.ts";
import { readSourceFacts, SOURCE_READ_LIMIT_MS } from "./source.ts";
import type { ReadTiming } from "./timing.ts";
import { readChangelogRelease, readZoteroRelease, releaseListWarnings, ZOTERO_RELEASE_LIMIT_MS } from "./zotero-release.ts";

export interface Override {
  field: string;
  version?: string;
  value: string;
  reason: string;
}

// A maintainer's read that the plugin's main use needs a paid service from its maker (D-054).
export interface PaidService {
  note: string;
  source: string;
  read: string;
}

// One entry's record. The upstream facts and the overrides stay in separate blocks.
export interface PluginRecord {
  id: string;
  repoUrl: string;
  paidService?: PaidService;
  // `xpiUrl` addresses the XPI file that the reader read, and `xpiSha256` is the SHA-256 of its
  // bytes, the one the start plan names; data written before the build wrote them has none.
  // `sourceInRepo` says whether the top level of the repo's default branch holds a name that can
  // be source code; a failed read of those names leaves it out. `icon` is the path of the icon
  // file that the build drew (see redrawIcon), relative to the data file's folder.
  upstream?: UpstreamFacts & { xpiUrl?: string; xpiSha256?: string; sourceInRepo?: boolean; icon?: string };
  // The counted user reports on the version in upstream, by Zotero major. Every record with
  // upstream that the build writes has it; data written before reports existed has none.
  reports?: ReportCount[];
  // Whether the version in upstream started in each tested Zotero release that its manifest
  // range covers, ordered by Zotero version. `pnpm add-start-results` adds it after the build.
  startTests?: StartTestRecord[];
  // On a record whose read failed for a build-level reason, when it holds the upstream and
  // startTests of the deployed record of an earlier build (D-066): when that build started,
  // and this build's failure. Such a record has no `failure`.
  kept?: Kept;
  failure?: { name: string; message: string };
  overrides: Override[];
}

export interface StartTestRecord {
  zotero: string;
  result: StartResultName;
}

export interface PluginsFile {
  schemaVersion: 1;
  generatedAt: string;
  // The current Zotero release that zotero.org gave, such as 10.0.7. A build whose read of it
  // failed, and data written before the build read it, have none.
  zoteroRelease?: string;
  plugins: PluginRecord[];
}

// One plugin to start in Zotero: the entry id, the plugin id and version, and the range of
// the manifest that the build read, without overrides, since Zotero installs by the manifest.
// `xpiUrl` and `sha256` name the XPI that the build read, so a start-test job downloads the
// same file and no artifact holds plugin files.
export interface StartPlanItem {
  entry: string;
  id: string;
  version: string;
  strictMinVersion?: string;
  strictMaxVersion?: string;
  xpiUrl: string;
  sha256: string;
  // The `started` results of the deployed data that `pnpm carry-start-results` reuses for this
  // XPI, one for each Zotero version, ordered by version. Absent when it reuses none.
  carried?: CarriedResult[];
}

export interface CarriedResult {
  zotero: string;
  result: "started";
}

export interface StartPlan {
  plugins: StartPlanItem[];
}

// `buildLevel` lists the ids of the records whose failure usually points at the build, such as a
// rate limit or a network error, in record order, kept records included. It and the plan stay
// out of the data. `kept` lists the ids of the kept records, in record order, and
// `previousProblem` names why the read of the deployed data failed, when it did. `timings`
// holds one ReadTiming for each plugin read the build started, in id order, and `readsMs` the
// milliseconds from the first read's start to the last read's end, absent when no read
// started; both stay out of the data. The
// plan has one item for each record whose upstream this build read, in record order, so a
// kept record has none. `releaseProblem` names why
// the read of the current Zotero release failed, when it did, and `sourceProblem` why the build
// has no source fact for some records. `releaseWarnings` says where the
// Zotero release lists in src/site/version.ts fall behind and which changelog reads failed, and
// stays out of the data. `icons` holds the bytes of each icon file that a record of the data
// names, keyed by that record's `upstream.icon`.
export type BuildResult =
  | {
      ok: true;
      data: PluginsFile;
      text: string;
      icons: Map<string, Uint8Array>;
      buildLevel: string[];
      kept: string[];
      timings: ReadTiming[];
      readsMs?: number;
      plan: StartPlan;
      previousProblem?: string;
      releaseProblem?: string;
      sourceProblem?: string;
      releaseWarnings: string[];
    }
  | { ok: false; problems: string[] };

const ajv = new Ajv({ allErrors: true });
const validateIndex = ajv.compile(indexSchema);
const validatePlugins = ajv.compile(pluginsSchema);
const validateRecord = ajv.getSchema(`${pluginsSchema.$id}#/definitions/record`)!;

// The repo whose report issues the build counts, when GITHUB_REPOSITORY is unset.
export const INDEX_REPO = "jmgirard/zotdex";

// The time after which the build starts no plugin read. Each read also stops at
// READ_LIMIT_MS. The build job stops at 30 minutes, so these leave time for the steps
// around it.
export const BUILD_LIMIT_MS = 18 * 60 * 1000;

// The plugin reads that may be open at once (D-058).
export const READS_AT_ONCE = 4;

// The least time between the starts of two GitHub API requests of the plugin reads. It holds
// the requests it paces to 750 a minute, and a redirect that fetch follows adds to that.
// GitHub's rate-limit page, read on 2026-11-03, allows 900 (D-058).
export const API_GAP_MS = 80;

const DAY_MS = 24 * 60 * 60 * 1000;

// The longest the read of the report label and every report issue page may take in all.
export const REPORTS_LIMIT_MS = 3 * 60 * 1000;

// `startedAt` is a performance.now() time. Its default, 0, is when the process started.
// `reportsMs` bounds the label read and every page of the report issues together, `releaseMs`
// the read of the current Zotero release and each changelog read, and `sourceMs` all the requests
// of the source read together. `readsAtOnce` and `apiGapMs` set the pace of the plugin reads.
// `previous` is the address of the deployed data, which the build reads within `previousMs`
// only when a record's read failed for a build-level reason; without it the build keeps no
// earlier facts.
export interface TimeLimits {
  readMs?: number;
  reportsMs?: number;
  releaseMs?: number;
  sourceMs?: number;
  buildMs?: number;
  startedAt?: number;
  readsAtOnce?: number;
  apiGapMs?: number;
  previous?: string;
  previousMs?: number;
}

// Reads every entry under root, then the report label and the report issues of indexRepo,
// then each plugin upstream, up to `readsAtOnce` at once. A failed upstream read goes into that
// entry's record. An entry that cannot be read, or whose meta.json or index.json is invalid,
// stops the build before any request. The counts come only from the issues, so a failed label
// or issue read, a listed issue with no closed_by key, or a report read that passes
// `reportsMs`, also stops it, before any upstream read (D-013). A plugin read that passes
// `readMs` fails as request-failed. Once `buildMs` has passed since `startedAt`, the build
// starts no more plugin reads, and each entry left gets the failure not-read. Both count as
// build-level. The UTC day of `now` sets the order in which reads start. Then it reads the top-level names of
// each repo it read, and a failed read leaves that record's sourceInRepo out. Last, it reads the
// current Zotero release and the changelog page of each LAST_RELEASES major from zotero.org. A
// failed read of the release leaves zoteroRelease out, and no read of these stops the build.
// Between the source read and the report count, a record whose read failed for a build-level
// reason keeps the deployed record's facts by `keptFacts`, and stays build-level; a failed read
// of the deployed data keeps nothing and sets previousProblem. A kept record keeps its icon only
// when `readPreviousIcons` reads the deployed file back within `previousMs`. A record's read
// icon is drawn by `redrawIcon`, and an entry with `iconHidden` gets none, kept or read.
export async function buildData(
  root: string,
  fetch: Fetch,
  now = new Date(),
  indexRepo = INDEX_REPO,
  {
    readMs = READ_LIMIT_MS,
    reportsMs = REPORTS_LIMIT_MS,
    releaseMs = ZOTERO_RELEASE_LIMIT_MS,
    sourceMs = SOURCE_READ_LIMIT_MS,
    buildMs = BUILD_LIMIT_MS,
    startedAt = 0,
    readsAtOnce = READS_AT_ONCE,
    apiGapMs = API_GAP_MS,
    previous,
    previousMs = PREVIOUS_LIMIT_MS,
  }: TimeLimits = {},
): Promise<BuildResult> {
  let listed: Awaited<ReturnType<typeof listEntries>>;
  try {
    listed = await listEntries(root);
  } catch (error) {
    return { ok: false, problems: [`cannot read ${root}: ${(error as Error).message}`] };
  }
  if (listed.length === 0) return { ok: false, problems: [`there are no entries in ${root}`] };

  const problems: string[] = [];
  const entries: { id: string; repoUrl: string; paidService?: PaidService; iconHidden: boolean; overrides: Override[] }[] = [];
  for (const { name, readError } of listed) {
    const entry = readError ? { problem: `cannot read the entry: ${readError}` } : await readEntry(join(root, name));
    if ("problem" in entry) problems.push(`${name}: ${entry.problem}`);
    else entries.push({ id: name, ...entry });
  }
  if (problems.length > 0) return { ok: false, problems };

  let issues: unknown[];
  try {
    issues = await withinLimit(reportsMs, async (signal) => {
      // A renamed or deleted label makes GitHub answer the list with no issues, so the label
      // must exist first. Any successful answer with a JSON body is enough, and its content
      // is not checked.
      const github = githubClient(boundFetch(fetch, signal));
      await github.json(`https://api.github.com/repos/${indexRepo}/labels/report`);
      // Oldest first, so a report closed during the read joins the last page rather than
      // moving each later report up one place, past a page boundary.
      const list = `https://api.github.com/repos/${indexRepo}/issues?labels=report&state=closed&sort=created&direction=asc&per_page=100`;
      return await github.pages(list);
    });
  } catch (error) {
    const name = error instanceof ReadFailure ? `${error.failure}: ` : "";
    return { ok: false, problems: [`cannot read the report issues: ${name}${(error as Error).message}`] };
  }
  // An issue with no closed_by key cannot be counted, so the counts cannot be read. An
  // item that is not an object, or a pull request, is left for countReports to drop.
  const unclosed = issues.find(
    (item) =>
      typeof item === "object" && item !== null && !Array.isArray(item) && !("pull_request" in item) && !("closed_by" in item),
  ) as { number?: unknown } | undefined;
  if (unclosed) {
    const which = typeof unclosed.number === "number" ? `issue #${unclosed.number}` : "an issue";
    return { ok: false, problems: [`cannot read the report issues: ${which} in the list has no closed_by field`] };
  }

  // The reads start in id order on even UTC days since 1970-01-01 and in reverse on odd ones,
  // so a build that `buildMs` cuts leaves the last ids unread one day and the first ids the
  // next. The records and the build-level list keep id order, whichever read ends first.
  const order = entries.map((_, i) => i);
  if (Math.floor(now.getTime() / DAY_MS) % 2 !== 0) order.reverse();
  const records: PluginRecord[] = new Array(entries.length);
  const buildLevelAt = new Set<number>();
  const xpis = new Map<string, XpiRead>();
  // The icon file of each read record that has one, keyed by its upstream.icon.
  const drawn = new Map<string, Uint8Array>();
  const paced = pacedApi(fetch, apiGapMs);
  const timed: (ReadTiming | undefined)[] = new Array(entries.length);
  let firstStart: number | undefined;
  let lastEnd: number | undefined;
  const readEntries = async () => {
    for (let next = order.shift(); next !== undefined; next = order.shift()) {
      const i = next;
      const { id, repoUrl, paidService, iconHidden, overrides } = entries[i];
      const paid = paidService ? { paidService } : {};
      if (performance.now() - startedAt >= buildMs) {
        const message = `the build reads no plugin after ${duration(buildMs)}, its time limit`;
        records[i] = { id, repoUrl, ...paid, failure: { name: "not-read", message }, overrides };
        buildLevelAt.add(i);
        continue;
      }
      const start = performance.now();
      firstStart ??= start;
      const { buildLevel: counts, xpi, icon, ...read } = await readRecord(repoUrl, paced, readMs);
      const end = performance.now();
      lastEnd = Math.max(lastEnd ?? end, end);
      // The result before the facts check and the keep step below, as readRecord gave it.
      timed[i] = { id, ms: end - start, result: read.failure?.name ?? "read" };
      if (counts) buildLevelAt.add(i);
      if (xpi) xpis.set(id, xpi);
      // After the timing, so drawing the icon does not count as read time.
      const file = icon && !iconHidden ? await redrawIcon(icon) : undefined;
      if (file && read.upstream) {
        read.upstream.icon = `icons/${file.sha256}.png`;
        drawn.set(read.upstream.icon, file.png);
      }
      const record: PluginRecord = { id, repoUrl, ...paid, ...read, overrides };
      // Facts that the schema rejects, such as a repo body with no created_at, become this
      // record's failure, so one plugin cannot stop the whole file.
      const recordProblems = validateRecord(JSON.parse(JSON.stringify(record)))
        ? []
        : (validateRecord.errors ?? []).map(describe);
      if (recordProblems.length > 0 && record.upstream) {
        records[i] = { id, repoUrl, ...paid, failure: { name: "facts-invalid", message: recordProblems.join("; ") }, overrides };
      } else {
        records[i] = record;
      }
    }
  };
  await Promise.all(Array.from({ length: readsAtOnce }, readEntries));
  const source = await readSourceFacts(fetch, records.flatMap(({ repoUrl, upstream }) => (upstream ? [repoUrl] : [])), sourceMs);
  for (const { repoUrl, upstream } of records) {
    const sourceInRepo = source.facts.get(repoUrl);
    if (upstream && sourceInRepo !== undefined) upstream.sourceInRepo = sourceInRepo;
  }
  // After the source read, so a kept upstream keeps its own sourceInRepo, and before the report
  // count, so a kept record's reports count for the version it shows.
  const keptAt = new Set<number>();
  let previousProblem: string | undefined;
  if (previous && buildLevelAt.size > 0) {
    const earlier = await readPrevious(previous, fetch, previousMs);
    if ("problem" in earlier) previousProblem = earlier.problem;
    else if (typeof earlier.generatedAt !== "string" || Number.isNaN(Date.parse(earlier.generatedAt))) {
      previousProblem = `${previous} has no readable generatedAt`;
    } else {
      for (const i of [...buildLevelAt].sort((a, b) => a - b)) {
        const { id, repoUrl, paidService, failure, overrides } = records[i];
        if (!failure) continue;
        const { iconHidden } = entries[i];
        const facts = keptFacts<NonNullable<PluginRecord["upstream"]>, StartTestRecord>(
          id,
          repoUrl,
          failure,
          earlier,
          now,
          (value) => validateRecord(value) === true,
        );
        if (!facts) continue;
        // A hidden icon stays hidden on a kept record.
        if (iconHidden && facts.upstream) delete facts.upstream.icon;
        const record: PluginRecord = { id, repoUrl, ...(paidService ? { paidService } : {}), ...facts, overrides };
        // The record as it will be written, with the report counts still to come.
        if (!validateRecord(JSON.parse(JSON.stringify({ ...record, reports: [] })))) continue;
        records[i] = record;
        keptAt.add(i);
      }
      // A kept record keeps its icon only when the deployed file reads back with the SHA-256 in
      // its name; the assembly below drops any other.
      const keptIcons = [...keptAt].flatMap((i) => (records[i].upstream?.icon ? [records[i].upstream!.icon!] : []));
      if (keptIcons.length > 0) {
        for (const [icon, bytes] of await readPreviousIcons(previous, keptIcons, fetch, previousMs)) drawn.set(icon, bytes);
      }
    }
  }
  const buildLevel = entries.flatMap(({ id }, i) => (buildLevelAt.has(i) ? [id] : []));
  const kept = entries.flatMap(({ id }, i) => (keptAt.has(i) ? [id] : []));
  const reports = countReports(issues, records);
  const plugins = records.map(({ id, repoUrl, paidService, upstream, startTests, kept: keptFrom, failure, overrides }): PluginRecord => {
    const paid = paidService ? { paidService } : {};
    if (!upstream) return { id, repoUrl, ...paid, failure, overrides };
    const tests = startTests ? { startTests } : {};
    return { id, repoUrl, ...paid, upstream, reports: reports.get(id) ?? [], ...tests, ...(keptFrom ? { kept: keptFrom } : {}), overrides };
  });
  // Each icon a record names, from this build's drawing or the kept icons. A record whose icon
  // file the build does not hold names none, so the data never names a file it lacks.
  const icons = new Map<string, Uint8Array>();
  for (const { upstream } of plugins) {
    if (!upstream?.icon) continue;
    const bytes = drawn.get(upstream.icon);
    if (bytes) icons.set(upstream.icon, bytes);
    else delete upstream.icon;
  }
  // The changelog reads run at the same time as the release read, so all of them end within
  // `releaseMs`.
  const majors = Object.keys(LAST_RELEASES);
  const [release, ...changelogs] = await Promise.all([
    readZoteroRelease(fetch, releaseMs),
    ...majors.map((major) => readChangelogRelease(fetch, major, releaseMs)),
  ]);
  const zoteroRelease = release.ok ? release.version : undefined;
  const data: PluginsFile = { schemaVersion: 1, generatedAt: now.toISOString(), zoteroRelease, plugins };
  const text = `${JSON.stringify(data, null, 2)}\n`;
  // Check the file as written, where undefined fields are gone.
  const outputProblems = checkOutput(JSON.parse(text));
  if (outputProblems.length > 0) return { ok: false, problems: outputProblems.map((p) => `the output ${p}`) };
  const plan: StartPlan = {
    plugins: plugins.flatMap(({ id: entry, upstream }) => {
      const xpi = xpis.get(entry);
      if (!upstream || !xpi) return [];
      const { id, version, strictMinVersion, strictMaxVersion } = upstream;
      return [{ entry, id, version, strictMinVersion, strictMaxVersion, xpiUrl: xpi.url, sha256: xpi.sha256 }];
    }),
  };
  const releaseWarnings = releaseListWarnings(zoteroRelease, majors.map((major, i) => [major, changelogs[i]]));
  return {
    ok: true,
    data,
    text,
    icons,
    buildLevel,
    kept,
    timings: timed.filter((timing): timing is ReadTiming => timing !== undefined),
    ...(firstStart !== undefined && lastEnd !== undefined ? { readsMs: lastEnd - firstStart } : {}),
    plan,
    releaseWarnings,
    ...(previousProblem ? { previousProblem } : {}),
    ...(release.ok ? {} : { releaseProblem: release.message }),
    ...(source.problem ? { sourceProblem: source.problem } : {}),
  };
}

// The problems schemas/plugins.v1.schema.json finds in value, or none.
export function checkOutput(value: unknown): string[] {
  return validatePlugins(value) ? [] : (validatePlugins.errors ?? []).map(describe);
}

const SCHEMAS = join(import.meta.dirname, "..", "..", "schemas");
const PUBLISHED_SCHEMAS = ["plugins.v1.schema.json", "index.v1.schema.json"];

// Copies the published schemas to <outDir>/schemas/, writes each of `icons` to <outDir>/v1/
// at its path, then writes text to <outDir>/v1/plugins.json, and last removes each other file
// in <outDir>/v1/icons/. Each file goes through a temporary file, so a failed write leaves any
// earlier file whole, and the data is written only after the icons it names.
export async function writeData(
  outDir: string,
  text: string,
  icons: ReadonlyMap<string, Uint8Array> = new Map(),
): Promise<{ ok: true; path: string } | { ok: false; message: string }> {
  for (const [name, bytes] of icons) {
    const target = join(outDir, "v1", name);
    try {
      await mkdir(dirname(target), { recursive: true });
      await writeFile(`${target}.tmp`, bytes);
      await rename(`${target}.tmp`, target);
    } catch (error) {
      await rm(`${target}.tmp`, { force: true }).catch(() => {});
      return { ok: false, message: `cannot write ${target}: ${(error as Error).message}` };
    }
  }
  for (const name of PUBLISHED_SCHEMAS) {
    const target = join(outDir, "schemas", name);
    try {
      await mkdir(join(outDir, "schemas"), { recursive: true });
      await copyFile(join(SCHEMAS, name), `${target}.tmp`);
      await rename(`${target}.tmp`, target);
    } catch (error) {
      await rm(`${target}.tmp`, { force: true }).catch(() => {});
      return { ok: false, message: `cannot write ${target}: ${(error as Error).message}` };
    }
  }
  const path = join(outDir, "v1", "plugins.json");
  const temporary = `${path}.tmp`;
  try {
    await mkdir(join(outDir, "v1"), { recursive: true });
    await writeFile(temporary, text);
    await rename(temporary, path);
  } catch (error) {
    await rm(temporary, { force: true }).catch(() => {});
    return { ok: false, message: `cannot write ${path}: ${(error as Error).message}` };
  }
  const iconDir = join(outDir, "v1", "icons");
  try {
    const keep = new Set([...icons.keys()].map((name) => basename(name)));
    for (const name of await readdir(iconDir)) if (!keep.has(name)) await rm(join(iconDir, name), { force: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") return { ok: false, message: `cannot clear ${iconDir}: ${(error as Error).message}` };
  }
  return { ok: true, path };
}

// Writes the start plan as JSON to path, through a temporary file as writeData does.
export async function writePlan(path: string, plan: StartPlan): Promise<{ ok: true } | { ok: false; message: string }> {
  const temporary = `${path}.tmp`;
  try {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(temporary, `${JSON.stringify(plan, null, 2)}\n`);
    await rename(temporary, path);
  } catch (error) {
    await rm(temporary, { force: true }).catch(() => {});
    return { ok: false, message: `cannot write ${path}: ${(error as Error).message}` };
  }
  return { ok: true };
}

async function readEntry(
  dir: string,
): Promise<{ repoUrl: string; paidService?: PaidService; iconHidden: boolean; overrides: Override[] } | { problem: string }> {
  const meta = await readJson(join(dir, "meta.json"));
  if ("problem" in meta) return meta;
  const repoUrl = (meta.value as { repoUrl?: unknown } | null)?.repoUrl;
  if (typeof repoUrl !== "string" || repoUrl.length === 0) return { problem: "meta.json has no repoUrl" };

  const index = await readJson(join(dir, "index.json"));
  if ("problem" in index) return index;
  if (!validateIndex(index.value)) {
    return { problem: `index.json: ${(validateIndex.errors ?? []).map(describe).join("; ")}` };
  }
  const { paidService, iconHidden, overrides } = index.value as { paidService?: PaidService; iconHidden?: unknown; overrides?: Override[] };
  return { repoUrl, ...(paidService ? { paidService } : {}), iconHidden: iconHidden !== undefined, overrides: overrides ?? [] };
}

// A fetch that starts each request to the GitHub API at least `gapMs` after the one before it,
// whichever read sends it. A request to another host does not wait. A redirect that fetch
// follows inside one call counts as that one call.
function pacedApi(fetch: Fetch, gapMs: number): Fetch {
  let queue = Promise.resolve();
  let lastStart = Number.NEGATIVE_INFINITY;
  return async (url, init) => {
    if (new URL(url).host !== "api.github.com") return fetch(url, init);
    const turn = queue.then(async () => {
      const wait = lastStart + gapMs - performance.now();
      // A timer can fire up to 1 ms early by this clock.
      if (wait > 0) await new Promise((done) => setTimeout(done, Math.ceil(wait) + 1));
      lastStart = performance.now();
      // In an array, so that the next request's turn does not wait for this answer.
      return [fetch(url, init)] as const;
    });
    queue = turn.then(
      () => {},
      () => {},
    );
    const [answer] = await turn;
    return answer;
  };
}

async function readRecord(
  repoUrl: string,
  fetch: Fetch,
  readMs: number,
): Promise<Pick<PluginRecord, "upstream" | "failure"> & { buildLevel?: boolean; xpi?: XpiRead; icon?: Uint8Array }> {
  try {
    const read = await withinLimit(readMs, (signal) => readUpstream(repoUrl, fetch, { signal }));
    if (read.ok) {
      return { upstream: { ...read.facts, xpiUrl: read.xpi.url, xpiSha256: read.xpi.sha256 }, xpi: read.xpi, ...(read.icon && { icon: read.icon }) };
    }
    return { failure: { name: read.failure, message: read.message }, buildLevel: read.buildLevel };
  } catch (error) {
    // The reader names each problem it knows. Anything else is a bug or a surprise, and
    // it stays in this record so the other plugins still build. It counts as build-level.
    const message = error instanceof Error ? error.message : String(error);
    return { failure: { name: "unexpected-error", message }, buildLevel: true };
  }
}

async function readJson(path: string): Promise<{ value: unknown } | { problem: string }> {
  const file = basename(path);
  let text: string;
  try {
    text = await readFile(path, "utf8");
  } catch (error) {
    return { problem: `cannot read ${file}: ${(error as Error).message}` };
  }
  try {
    return { value: JSON.parse(text) };
  } catch (error) {
    return { problem: `${file} is not valid JSON: ${(error as Error).message}` };
  }
}

function describe(error: ErrorObject): string {
  return `${error.instancePath || "(root)"} ${error.message ?? "is invalid"}`;
}
