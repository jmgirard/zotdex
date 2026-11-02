import { type Fetch, githubClient } from "../upstream/reader.ts";
import { indexed, repoName } from "./discover.ts";
import { HOLD_REASONS, type HoldReason, holdDetails, ownerCreatedAt } from "./holds.ts";
import { botPullProblem, contents, type FileJson, newEntry, type PullJson } from "./merge.ts";
import { CLOSING_START, DETAILS_HEADING, HOLD_LABEL, holdDetailLines, unfencedLines } from "./propose.ts";

const API = "https://api.github.com";

export interface RefreshOptions {
  fetch: Fetch;
  // The index repo as owner/repo, and its plugins/ folder, whose entries a name can match.
  indexRepo: string;
  root: string;
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

// The reasons on a body's one Hold line outside fenced code, or why it has none to refresh.
function heldReasons(body: unknown): { reasons: HoldReason[] } | { problem: string } {
  const lines = typeof body === "string" ? unfencedLines(body).filter((line) => line.startsWith("Hold:")) : [];
  if (lines.length !== 1) return { problem: "its body does not have one Hold line" };
  if (lines[0] === "Hold: none") return { problem: "its Hold line says none" };
  const reasons = lines[0].slice("Hold:".length).trim().split(", ") as HoldReason[];
  if (!reasons.every((reason) => HOLD_REASONS.includes(reason))) return { problem: "its Hold line names an unknown reason" };
  return { reasons };
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
// or a label. A failed read of a pull request, or of an owner's account that its Hold line
// does not call unread, leaves that body as it is, and the run goes on to the next. A
// failed read of the list of pull requests or of `root` throws.
export async function refreshHolds({ fetch, indexRepo, root, apply }: RefreshOptions): Promise<RefreshResult> {
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
    if (!(pull.labels ?? []).some((label) => typeof label?.name === "string" && label.name.toLowerCase() === HOLD_LABEL)) {
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
      const id = newEntry(files);
      if (!id) {
        skip("its files are not exactly plugins/<id>/meta.json and plugins/<id>/index.json, both added");
        continue;
      }
      const sha = pull.head?.sha;
      if (typeof sha !== "string" || !/^[0-9a-f]{40}$/.test(sha)) throw new Error("its head has no commit SHA");
      const meta = JSON.parse(await contents(github, `${API}/repos/${indexRepo}/contents/plugins/${encodeURIComponent(id)}/meta.json?ref=${sha}`));
      const repo = repoName(meta?.repoUrl);
      if (!repo) throw new Error("its meta.json names no owner/repo");
      const updateHost = URL.canParse(meta.updateUrl) ? new URL(meta.updateUrl).host : undefined;
      if (held.reasons.includes("update-host") && !updateHost) throw new Error("its meta.json has no update URL");
      const createdAt = await ownerCreatedAt(fetch, repo.split("/")[0]);
      if (!createdAt && !held.reasons.includes("owner-unread")) throw new Error("the read of its owner's account gave no date");
      const details = holdDetails(
        { repo, name: typeof meta.name === "string" ? meta.name : undefined, updateHost: updateHost ?? "", ownerCreatedAt: createdAt, indexed: names },
        held.reasons,
      );
      const lines = holdDetailLines(details ?? {});
      const next = withDetailLines(pull.body as string, lines);
      if (next === undefined) {
        skip("its body has no closing sentence after its Hold line");
      } else if (next === pull.body) {
        result.unchanged.push(number);
      } else {
        if (apply) await github.patch(`${API}/repos/${indexRepo}/pulls/${number}`, { body: next });
        result.changed.push({ number, lines });
      }
    } catch (error) {
      result.failed.push({ number, message: (error as Error).message });
    }
  }
  return result;
}
