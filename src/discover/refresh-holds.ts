import type { Site } from "../check/sites.ts";
import type { Lookup } from "../upstream/host-guard.ts";
import { type Fetch, githubClient, readUpdateRoute } from "../upstream/reader.ts";
import { indexed, repoName, repoPartAsGiven } from "./discover.ts";
import { HOLD_REASONS, type HoldReason, holdDetails, matchEvidence, ownerCreatedAt, replacedEntry } from "./holds.ts";
import { botPullProblem, changedMeta, contents, type FileJson, newEntry, type PullJson } from "./merge.ts";
import { CLOSING_START, DETAILS_HEADING, HOLD_LABEL, holdDetailLines, keptLines, unfencedLines } from "./propose.ts";

const API = "https://api.github.com";
// The longest wait for the update.json read of one pull request. The update host is not GitHub.
const UPDATE_READ_LIMIT_MS = 60 * 1000;

export interface RefreshOptions {
  fetch: Fetch;
  // Resolves the hosts of an update.json read for the host check.
  lookup?: Lookup;
  // The longest wait for one update.json read, for a test.
  updateReadMs?: number;
  // The index repo as owner/repo, and its plugins/ folder, whose entries a name can match.
  indexRepo: string;
  root: string;
  // The listed sites of `sites.json`, for a `listed-site` hold.
  sites: readonly Site[];
  // Whether to send the new bodies, or only to report them.
  apply: boolean;
}

export interface RefreshResult {
  // The pull requests whose body has new detail lines, sent only with `apply`.
  changed: { number: number; lines: string[] }[];
  unchanged: number[];
  skipped: { number: number; reason: string }[];
  failed: { number: number; message: string }[];
}

// GitHub label names are unique ignoring case.
const hasHoldLabel = (pull: PullJson) => (pull.labels ?? []).some((label) => typeof label?.name === "string" && label.name.toLowerCase() === HOLD_LABEL);

// The reasons on a body's one Hold line outside fenced code, or why it has none to refresh.
function heldReasons(body: unknown): { reasons: HoldReason[] } | { problem: string } {
  const lines = typeof body === "string" ? unfencedLines(body).filter((line) => line.startsWith("Hold:")) : [];
  if (lines.length !== 1) return { problem: "its body does not have one Hold line" };
  if (lines[0] === "Hold: none") return { problem: "its Hold line says none" };
  const reasons = lines[0].slice("Hold:".length).trim().split(", ") as HoldReason[];
  if (!reasons.every((reason) => HOLD_REASONS.includes(reason))) return { problem: "its Hold line names an unknown reason" };
  return { reasons };
}

// A repo's GitHub description and its topics that are strings. It throws when the read fails.
async function repoTexts(fetch: Fetch, repo: string): Promise<{ repoDescription?: string; topics: string[] }> {
  const meta = (await githubClient(fetch).json(`${API}/repos/${repo.split("/").map(encodeURIComponent).join("/")}`)) as { description?: unknown; topics?: unknown } | null;
  const repoDescription = typeof meta?.description === "string" && meta.description.trim() !== "" ? meta.description.trim() : undefined;
  const topics = Array.isArray(meta?.topics) ? meta.topics.filter((topic): topic is string => typeof topic === "string") : [];
  return { ...(repoDescription && { repoDescription }), topics };
}

// The body with `lines` as its detail lines, in place of any it had, or undefined when it
// has no closing sentence after its Hold line. Only the text from the detail heading up to
// the closing sentence changes. The check output, which anyone's manifest can shape, comes
// before the Hold line, so its text is never taken for the heading.
export function withDetailLines(body: string, lines: string[]): string | undefined {
  const hold = body.lastIndexOf("\nHold: ");
  const closing = body.lastIndexOf(`\n\n${CLOSING_START}`);
  if (hold === -1 || closing < hold) return undefined;
  const heading = body.indexOf(`\n\n${DETAILS_HEADING}\n\n`, hold);
  const end = heading === -1 || heading > closing ? closing : heading;
  return `${body.slice(0, end)}\n\n${DETAILS_HEADING}\n\n${lines.join("\n")}${body.slice(closing)}`;
}

// Works out the details again for each open bot pull request that has the hold label and a
// Hold line that names reasons, and writes them to its body. It never changes a Hold line
// or a label. A failed read of a pull request, of an owner's account that its Hold line
// does not call unread, of the update.json of an `update-host` hold, or of the repo's
// GitHub description and topics for a `listed-site` hold leaves that body as it is, and
// the run goes on to the next. A failed read of a name match's evidence prints that
// fact as not read. A failed read of the list of pull requests or of `root` throws.
export async function refreshHolds({ fetch, lookup, updateReadMs = UPDATE_READ_LIMIT_MS, indexRepo, root, sites, apply }: RefreshOptions): Promise<RefreshResult> {
  const github = githubClient(fetch);
  const result: RefreshResult = { changed: [], unchanged: [], skipped: [], failed: [] };
  const pulls = (await github.pages(`${API}/repos/${indexRepo}/pulls?state=open&per_page=100`)) as PullJson[];
  const { names } = await indexed(root);

  for (const pull of pulls) {
    if (!Number.isSafeInteger(pull?.number)) continue;
    const number = pull.number as number;
    const skip = (reason: string) => result.skipped.push({ number, reason });
    const notBot = botPullProblem(pull, indexRepo);
    if (notBot) {
      skip(notBot);
      continue;
    }
    if (!hasHoldLabel(pull)) {
      skip(`it has no ${HOLD_LABEL} label`);
      continue;
    }
    const held = heldReasons(pull.body);
    if ("problem" in held) {
      skip(held.problem);
      continue;
    }
    try {
      const files = (await github.pages(`${API}/repos/${indexRepo}/pulls/${number}/files?per_page=100`)) as FileJson[];
      const replacing = held.reasons.includes("replaces-entry");
      const id = replacing ? changedMeta(files) : newEntry(files);
      if (!id) {
        skip(replacing ? "its one file is not a modified plugins/<id>/meta.json" : "its files are not exactly plugins/<id>/meta.json and plugins/<id>/index.json, both added");
        continue;
      }
      const sha = pull.head?.sha;
      if (typeof sha !== "string" || !/^[0-9a-f]{40}$/.test(sha)) throw new Error("its head has no commit SHA");
      const meta = JSON.parse(await contents(github, `${API}/repos/${indexRepo}/contents/plugins/${encodeURIComponent(id)}/meta.json?ref=${sha}`));
      const repo = repoName(meta?.repoUrl);
      if (!repo) throw new Error("its meta.json names no owner/repo");
      const updateHost = URL.canParse(meta.updateUrl) ? new URL(meta.updateUrl).host : undefined;
      if (held.reasons.includes("update-host") && !updateHost) throw new Error("its meta.json has no update URL");
      const updateRoute = held.reasons.includes("update-host") ? await readUpdateRoute(meta.updateUrl, fetch, { lookup, signal: AbortSignal.timeout(updateReadMs) }) : [];
      const createdAt = await ownerCreatedAt(fetch, repo.split("/")[0]);
      if (!createdAt && !held.reasons.includes("owner-unread")) throw new Error("the read of its owner's account gave no date");
      const name = typeof meta.name === "string" ? meta.name : undefined;
      const evidence = held.reasons.includes("name-match") ? await matchEvidence(fetch, { repo, name, indexed: names }) : undefined;
      const replaced = replacing ? await replacedEntry(fetch, { id, repo, indexed: names }) : undefined;
      const description = typeof meta.description === "string" ? meta.description : undefined;
      // The repo's GitHub description and topics are not in its entry, so a listed-site hold reads them again.
      const texts = held.reasons.includes("listed-site") ? await repoTexts(fetch, repo) : { topics: [] };
      const details = holdDetails(
        { repo, repoNameAsGiven: repoPartAsGiven(meta.repoUrl), name, description, ...texts, sites, updateHost: updateHost ?? "", updateRoute, ownerCreatedAt: createdAt, indexed: names, evidence, replaced },
        held.reasons,
      );
      const kept = replacing ? keptLines(JSON.parse(await contents(github, `${API}/repos/${indexRepo}/contents/plugins/${encodeURIComponent(id)}/index.json?ref=${sha}`))) : [];
      const lines = holdDetailLines(details ?? {}, kept);
      const next = withDetailLines(pull.body as string, lines);
      if (next === undefined) {
        skip("its body has no closing sentence after its Hold line");
      } else if (next === pull.body) {
        result.unchanged.push(number);
      } else {
        if (apply) {
          // Read again, so an edit, a lost label, or a close since the list read stops the
          // write, and a release that a person made stands.
          const fresh = (await github.json(`${API}/repos/${indexRepo}/pulls/${number}`)) as PullJson | null;
          if (fresh?.state !== "open" || fresh.body !== pull.body || !hasHoldLabel(fresh)) {
            skip("it changed during the run");
            continue;
          }
          await github.patch(`${API}/repos/${indexRepo}/pulls/${number}`, { body: next });
        }
        result.changed.push({ number, lines });
      }
    } catch (error) {
      result.failed.push({ number, message: (error as Error).message });
    }
  }
  return result;
}
