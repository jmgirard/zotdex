import { type Fetch, githubClient } from "../upstream/reader.ts";

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
// The hosts of an update.json that GitHub serves.
const GITHUB_HOSTS = ["github.com", "raw.githubusercontent.com"];
// Runs of a name that say nothing about which plugin it is.
const NOISE = new Set(["zotero", "plugin", "addon", "for"]);

// One entry of the index: its repo's lowercase owner and repo part, and its meta.json name.
export interface IndexedName {
  owner: string;
  repoPart: string;
  name?: string;
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
}

// The index entries of other owners whose name or repo part matches the new repo's.
function matchedEntries({ repo, name, indexed }: Pick<HoldFacts, "repo" | "name" | "indexed">): IndexedName[] {
  const [owner, repoPart] = repo.split("/");
  const nameKeyOf = name === undefined ? "" : nameKey(name);
  const repoKey = nameKey(repoPart);
  return indexed.filter(
    (entry) =>
      entry.owner.toLowerCase() !== owner.toLowerCase() &&
      ((nameKeyOf !== "" && entry.name !== undefined && nameKey(entry.name) === nameKeyOf) || (repoKey !== "" && nameKey(entry.repoPart) === repoKey)),
  );
}

export function holdReasons(facts: HoldFacts): HoldReason[] {
  const held: Record<HoldReason, boolean> = {
    "name-match": matchedEntries(facts).length > 0,
    "owner-unread": facts.ownerCreatedAt === undefined,
    "new-account": facts.ownerCreatedAt !== undefined && facts.now.getTime() - facts.ownerCreatedAt.getTime() < NEW_ACCOUNT_MS,
    "update-host": !GITHUB_HOSTS.includes(facts.updateHost),
    "issue-no-topic": facts.issueRun && !facts.topics.some((topic) => TOPICS.includes(topic)),
  };
  return HOLD_REASONS.filter((reason) => held[reason]);
}

// The facts behind a pull request's hold reasons, for the maintainer. `matches` is there
// for `name-match` and `updateHost` for `update-host`. `ownerCreatedOn` is the owner's
// account creation day, there for any reason, since it also helps to judge a name match.
export interface HoldDetails {
  matches?: { repo: string; name?: string }[];
  // How many more entries matched than `matches` names.
  moreMatches?: number;
  updateHost?: string;
  ownerCreatedOn?: string;
}

const cut = (text: string, max: number) => [...text].slice(0, max).join("");

// The details of `reasons`, within the limits of the handoff schema, or undefined for no
// reason. A matched entry whose repo the schema refuses counts in `moreMatches`, so one odd
// entry in the index cannot refuse a whole handoff.
export function holdDetails(facts: Pick<HoldFacts, "repo" | "name" | "updateHost" | "ownerCreatedAt" | "indexed">, reasons: readonly HoldReason[]): HoldDetails | undefined {
  if (reasons.length === 0) return undefined;
  const details: HoldDetails = {};
  if (reasons.includes("name-match")) {
    const matched = matchedEntries(facts);
    details.matches = matched
      .map(({ owner, repoPart, name }) => ({ repo: `${owner}/${repoPart}`.toLowerCase(), ...(name?.trim() && { name: cut(name.trim(), NAME_MAX) }) }))
      .filter(({ repo }) => repo.length <= REPO_MAX && REPO.test(repo))
      .slice(0, MATCHES_MAX);
    if (matched.length > details.matches.length) details.moreMatches = matched.length - details.matches.length;
  }
  if (reasons.includes("update-host")) details.updateHost = cut(facts.updateHost, HOST_MAX);
  const createdOn = facts.ownerCreatedAt?.toISOString().slice(0, 10);
  if (createdOn !== undefined && DAY.test(createdOn)) details.ownerCreatedOn = createdOn;
  return details;
}

// The owner's account creation time from `GET /users/<owner>`, or undefined when the read
// fails or gives no parseable `created_at`.
export async function ownerCreatedAt(fetch: Fetch, owner: string): Promise<Date | undefined> {
  try {
    const user = (await githubClient(fetch).json(`${API}/users/${owner}`)) as { created_at?: unknown } | null;
    const created = typeof user?.created_at === "string" ? Date.parse(user.created_at) : Number.NaN;
    return Number.isNaN(created) ? undefined : new Date(created);
  } catch {
    return undefined;
  }
}
