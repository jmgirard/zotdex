import { boundFetch, type Fetch, githubClient, ReadFailure } from "../upstream/reader.ts";

// The GitHub topics that discovery searches.
export const TOPICS = ["zotero-plugin", "zotero-addon"];

// How discover found a repo. A repo that several sources name takes the first in this order.
export const SOURCES = ["topic", "catalog", "code-search"] as const;
export type Source = (typeof SOURCES)[number];

// Why the bot holds a pull request for the maintainer instead of letting
// `pnpm merge-discover` merge it, in the order a `holds` list gives them.
export const HOLD_REASONS = ["name-match", "owner-unread", "new-account", "update-host", "issue-no-topic"] as const;
export type HoldReason = (typeof HOLD_REASONS)[number];

// A lowercase owner/repo, as the bot keys repos.
export const REPO = /^[a-z0-9_.-]+\/[a-z0-9_.-]+$/;
// A day as YYYY-MM-DD.
export const DAY = /^\d{4}-\d{2}-\d{2}$/;
// The most matched entries that a hold's details name, and the most characters of a repo,
// a name, and an update host there.
export const MATCHES_MAX = 5;
export const REPO_MAX = 200;
export const NAME_MAX = 100;
export const HOST_MAX = 300;

const API = "https://api.github.com";
// An owner account younger than this holds the pull request.
const NEW_ACCOUNT_MS = 30 * 24 * 60 * 60 * 1000;
// The fixed hosts of an update.json that GitHub serves.
const GITHUB_HOSTS = ["github.com", "raw.githubusercontent.com"];
// Runs of a name that say nothing about which plugin it is.
const NOISE = new Set(["zotero", "plugin", "addon", "for"]);
// Two repos share code at this percent of either one's counted files.
const SHARED_PERCENT = 30;
// A matched entry's repo is a namesake to hold for at this many stars and this many times
// the new repo's.
const NAMESAKE_STARS = 20;
const NAMESAKE_TIMES = 10;
// Paths that many unrelated repos share, so their files are not counted.
const BOILERPLATE =
  /(^|\/)((licen[cs]e|copying)(\.[^/]*)?|\.gitignore|\.gitattributes|\.editorconfig|\.prettier[^/]*|\.npmrc|tsconfig[^/]*|package-lock\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lockb?|\.?eslint(rc|ignore)?(\.[^/]*)?|zotero-plugin\.config\.[^/]*|\.travis\.yml|\.gitlab-ci\.yml)$|(^|\/)(\.github|\.husky|\.vscode|typings)\//i;
// The longest wait for all the reads of one `matchEvidence` call.
const EVIDENCE_LIMIT_MS = 60 * 1000;

// One entry of the index: its repo's lowercase owner and repo part, its meta.json name, and
// whether its repo is on github.com, the only host where the bot can read that repo.
export interface IndexedName {
  owner: string;
  repoPart: string;
  name?: string;
  github?: boolean;
}

// What the bot read of a repo. A fact that it could not read is left out.
export interface RepoFacts {
  createdAt?: Date;
  stars?: number;
  // The SHA of the oldest commit of the default branch.
  firstCommit?: string;
  // The blob SHA of each counted file at the head of the default branch.
  blobs?: string[];
}

// The facts of the new repo, and of each matched entry that the bot read, by lowercase owner/repo.
export interface MatchEvidence {
  own: RepoFacts;
  entries: Map<string, RepoFacts>;
}

// A text lowercased and split into runs of a-z and 0-9, with the runs in NOISE dropped,
// then joined.
export function nameKey(text: string): string {
  return (text.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter((run) => !NOISE.has(run)).join("");
}

export interface HoldFacts {
  // The new repo as lowercase owner/repo.
  repo: string;
  // The manifest name, when the manifest has one.
  name?: string;
  updateHost: string;
  topics: string[];
  // Whether the entry comes from an issue run.
  issueRun: boolean;
  // The owner's account creation time, or undefined when it could not be read.
  ownerCreatedAt?: Date;
  now: Date;
  indexed: IndexedName[];
  // What the bot read for the matched entries. Without it, every matched entry is unread.
  evidence?: MatchEvidence;
}

// The index entries of other owners whose name or repo part matches the new repo's.
export function matchedEntries({ repo, name, indexed }: Pick<HoldFacts, "repo" | "name" | "indexed">): IndexedName[] {
  const [owner, repoPart] = repo.split("/");
  const nameKeyOf = name === undefined ? "" : nameKey(name);
  const repoKey = nameKey(repoPart);
  return indexed.filter(
    (entry) =>
      entry.owner.toLowerCase() !== owner.toLowerCase() &&
      ((nameKeyOf !== "" && entry.name !== undefined && nameKey(entry.name) === nameKeyOf) || (repoKey !== "" && nameKey(entry.repoPart) === repoKey)),
  );
}

const entryRepo = ({ owner, repoPart }: IndexedName) => `${owner}/${repoPart}`.toLowerCase();

// What the bot read for an entry. An entry on another host has none, even when a repo of the
// same owner and name on github.com was read for another entry.
const entryFacts = (evidence: MatchEvidence | undefined, entry: IndexedName) => (entry.github === true ? evidence?.entries.get(entryRepo(entry)) : undefined);

// The percent of one repo's counted files that are identical in the other, rounded down, for
// whichever repo gives the larger percent. A repo with no counted files gives 0.
export function identicalPercent(a: string[], b: string[]): number {
  const percentOf = (blobs: string[], other: Set<string>) => (blobs.length === 0 ? 0 : Math.floor((100 * blobs.filter((blob) => other.has(blob)).length) / blobs.length));
  return Math.max(percentOf(a, new Set(b)), percentOf(b, new Set(a)));
}

// Whether a matched entry holds the new repo: it shares code, it is a far larger and older
// namesake, or a fact that these tests need was not read.
function entryHolds(own: RepoFacts | undefined, entry: RepoFacts | undefined): boolean {
  if (own?.createdAt === undefined || own.stars === undefined || own.firstCommit === undefined || own.blobs === undefined) return true;
  if (entry?.createdAt === undefined || entry.stars === undefined || entry.firstCommit === undefined || entry.blobs === undefined) return true;
  const sharesCode = own.firstCommit === entry.firstCommit || identicalPercent(own.blobs, entry.blobs) >= SHARED_PERCENT;
  const namesake = entry.createdAt < own.createdAt && entry.stars >= NAMESAKE_STARS && entry.stars >= NAMESAKE_TIMES * own.stars;
  return sharesCode || namesake;
}

export function holdReasons(facts: HoldFacts): HoldReason[] {
  // Only the owner, and those it gives write access to its repos, can publish to its GitHub Pages site.
  const ownerSite = `${facts.repo.split("/")[0].toLowerCase()}.github.io`;
  const held: Record<HoldReason, boolean> = {
    "name-match": matchedEntries(facts).some((entry) => entryHolds(facts.evidence?.own, entryFacts(facts.evidence, entry))),
    "owner-unread": facts.ownerCreatedAt === undefined,
    "new-account": facts.ownerCreatedAt !== undefined && facts.now.getTime() - facts.ownerCreatedAt.getTime() < NEW_ACCOUNT_MS,
    "update-host": !GITHUB_HOSTS.includes(facts.updateHost) && facts.updateHost.toLowerCase() !== ownerSite,
    "issue-no-topic": facts.issueRun && !facts.topics.some((topic) => TOPICS.includes(topic)),
  };
  return HOLD_REASONS.filter((reason) => held[reason]);
}

// The matched entries that a pull request's details name: those whose repo the handoff
// schema takes, up to its limit. The bot reads evidence only for these.
export function namedEntries(matched: IndexedName[]): IndexedName[] {
  return matched
    .filter((entry) => {
      const repo = entryRepo(entry);
      return repo.length <= REPO_MAX && REPO.test(repo);
    })
    .slice(0, MATCHES_MAX);
}

// The facts behind a pull request's hold reasons, for the maintainer. `matches` is there
// for `name-match` and `updateHost` for `update-host`. `ownerCreatedOn` is the owner's
// account creation day, there for any reason, since it also helps to judge a name match.
// A fact of `name-match` that the bot could not read is left out.
export interface HoldDetails {
  matches?: { repo: string; name?: string; createdOn?: string; stars?: number; sharedFirstCommit?: boolean; identicalPercent?: number }[];
  // How many more entries matched than `matches` names.
  moreMatches?: number;
  repoCreatedOn?: string;
  repoStars?: number;
  updateHost?: string;
  ownerCreatedOn?: string;
}

const cut = (text: string, max: number) => [...text].slice(0, max).join("");

function dayOf(date: Date | undefined): string | undefined {
  const day = date?.toISOString().slice(0, 10);
  return day !== undefined && DAY.test(day) ? day : undefined;
}

// What a matched entry's detail line gives from the evidence.
function entryDetails(own: RepoFacts | undefined, entry: RepoFacts | undefined): Partial<NonNullable<HoldDetails["matches"]>[number]> {
  const createdOn = dayOf(entry?.createdAt);
  return {
    ...(createdOn && { createdOn }),
    ...(entry?.stars !== undefined && { stars: entry.stars }),
    ...(own?.firstCommit !== undefined && entry?.firstCommit !== undefined && { sharedFirstCommit: own.firstCommit === entry.firstCommit }),
    ...(own?.blobs !== undefined && entry?.blobs !== undefined && { identicalPercent: identicalPercent(own.blobs, entry.blobs) }),
  };
}

// The details of `reasons`, within the limits of the handoff schema, or undefined for no
// reason. A matched entry whose repo the schema refuses counts in `moreMatches`, so one odd
// entry in the index cannot refuse a whole handoff.
export function holdDetails(facts: Pick<HoldFacts, "repo" | "name" | "updateHost" | "ownerCreatedAt" | "indexed" | "evidence">, reasons: readonly HoldReason[]): HoldDetails | undefined {
  if (reasons.length === 0) return undefined;
  const details: HoldDetails = {};
  if (reasons.includes("name-match")) {
    const matched = matchedEntries(facts);
    const own = facts.evidence?.own;
    details.matches = namedEntries(matched).map((entry) => ({
      repo: entryRepo(entry),
      ...(entry.name?.trim() && { name: cut(entry.name.trim(), NAME_MAX) }),
      ...entryDetails(own, entryFacts(facts.evidence, entry)),
    }));
    if (matched.length > details.matches.length) details.moreMatches = matched.length - details.matches.length;
    const repoCreatedOn = dayOf(own?.createdAt);
    if (repoCreatedOn) details.repoCreatedOn = repoCreatedOn;
    if (own?.stars !== undefined) details.repoStars = own.stars;
  }
  if (reasons.includes("update-host")) details.updateHost = cut(facts.updateHost, HOST_MAX);
  const createdOn = dayOf(facts.ownerCreatedAt);
  if (createdOn !== undefined) details.ownerCreatedOn = createdOn;
  return details;
}

// A created_at or stargazers_count as GitHub gives it, or undefined when it is not one.
export function createdAtOf(value: unknown): Date | undefined {
  const created = typeof value === "string" ? Date.parse(value) : Number.NaN;
  return Number.isNaN(created) ? undefined : new Date(created);
}

export function starsOf(value: unknown): number | undefined {
  return Number.isInteger(value) && (value as number) >= 0 ? (value as number) : undefined;
}

// The reads of one `matchEvidence` call, which all stop at `ms`. Each gives the answer, or
// undefined when it fails. After a 403 or 429, which can mean a rate limit, it sends no more.
function evidenceReader(fetch: Fetch, ms: number) {
  const github = githubClient(boundFetch(fetch, AbortSignal.timeout(ms)));
  let refused = false;
  return async (url: string) => {
    if (refused) return undefined;
    try {
      return await github.get(url);
    } catch (error) {
      if (error instanceof ReadFailure && (error.status === 403 || error.status === 429)) refused = true;
      return undefined;
    }
  };
}

type EvidenceRead = ReturnType<typeof evidenceReader>;

const SHA = /^[0-9a-f]{40}$/;
// The blob of an empty file, which says nothing about a plugin's code.
const EMPTY_BLOB = "e69de29bb2d1d6434b8b29ae775ad8c2e48c5391";

// The SHA of the last commit on a page of the commits API.
function lastSha(page: unknown): string | undefined {
  const sha = Array.isArray(page) ? (page.at(-1) as { sha?: unknown } | undefined)?.sha : undefined;
  return typeof sha === "string" && SHA.test(sha) ? sha : undefined;
}

// The blob SHA of each counted file in a tree answer. A tree that GitHub truncated gives
// nothing, since a share of part of a repo says nothing.
function countedBlobs(tree: unknown): string[] | undefined {
  const { tree: items, truncated } = (tree ?? {}) as { tree?: unknown; truncated?: unknown };
  if (truncated !== false || !Array.isArray(items)) return undefined;
  const files = items.filter((item) => item?.type === "blob");
  if (!files.every((file) => typeof file.path === "string" && typeof file.sha === "string" && SHA.test(file.sha))) return undefined;
  return files.filter((file) => !BOILERPLATE.test(file.path) && file.sha !== EMPTY_BLOB).map((file) => file.sha as string);
}

// A repo's first commit and counted files. The commits come one to a page, so the last page
// holds the commit that GitHub lists last, taken as the first commit. A repo with one commit
// has no link at all; any other link with no last page does not say where the first commit
// is. With no newest commit, there is no tree to read.
async function gitFacts(read: EvidenceRead, base: string): Promise<Pick<RepoFacts, "firstCommit" | "blobs">> {
  const newest = await read(`${base}/commits?per_page=1`);
  const head = lastSha(newest?.body);
  if (head === undefined) return {};
  const link = newest?.link ?? "";
  const last = /<([^>]+)>;\s*rel="last"/.exec(link)?.[1];
  const firstCommit = last !== undefined ? lastSha((await read(last))?.body) : link === "" ? head : undefined;
  const blobs = countedBlobs((await read(`${base}/git/trees/${head}?recursive=1`))?.body);
  return { ...(firstCommit && { firstCommit }), ...(blobs && { blobs }) };
}

const repoBase = (repo: string) => `${API}/repos/${repo.split("/").map(encodeURIComponent).join("/")}`;

async function metaFacts(read: EvidenceRead, base: string): Promise<Pick<RepoFacts, "createdAt" | "stars">> {
  const meta = (await read(base))?.body as { created_at?: unknown; stargazers_count?: unknown } | null | undefined;
  const createdAt = createdAtOf(meta?.created_at);
  const stars = starsOf(meta?.stargazers_count);
  return { ...(createdAt && { createdAt }), ...(stars !== undefined && { stars }) };
}

// The evidence for the entries that `facts` matches and names on github.com. With no named
// match it sends no request. `ownMeta` gives the new repo's date and stars when the caller
// read them already; without it, a named match on any host reads them. The new repo's reads
// go beside the entries', so a stalled read of one leaves the other's facts. A read that
// fails or that `ms` cuts leaves its fact out, and it never throws.
export async function matchEvidence(
  fetch: Fetch,
  facts: Pick<HoldFacts, "repo" | "name" | "indexed">,
  ownMeta?: Pick<RepoFacts, "createdAt" | "stars">,
  ms = EVIDENCE_LIMIT_MS,
): Promise<MatchEvidence> {
  const named = namedEntries(matchedEntries(facts));
  if (named.length === 0) return { own: ownMeta ?? {}, entries: new Map() };
  const readable = named.filter((entry) => entry.github === true);
  const read = evidenceReader(fetch, ms);
  const ownBase = repoBase(facts.repo);
  const readOwn = async (): Promise<RepoFacts> => ({ ...(ownMeta ?? (await metaFacts(read, ownBase))), ...(readable.length > 0 ? await gitFacts(read, ownBase) : {}) });
  const readEntries = async () => {
    const entries = new Map<string, RepoFacts>();
    for (const entry of readable) {
      const base = repoBase(entryRepo(entry));
      entries.set(entryRepo(entry), { ...(await metaFacts(read, base)), ...(await gitFacts(read, base)) });
    }
    return entries;
  };
  const [own, entries] = await Promise.all([readOwn(), readEntries()]);
  return { own, entries };
}

// The owner's account creation time from `GET /users/<owner>`, or undefined when the read
// fails or gives no parseable `created_at`.
export async function ownerCreatedAt(fetch: Fetch, owner: string): Promise<Date | undefined> {
  try {
    const user = (await githubClient(fetch).json(`${API}/users/${owner}`)) as { created_at?: unknown } | null;
    return createdAtOf(user?.created_at);
  } catch {
    return undefined;
  }
}
