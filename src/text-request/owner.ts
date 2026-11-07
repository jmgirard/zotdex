// The steps that a repository owner's requests share (D-049): the open issue with its label and
// form, the plugin's record in the data file, its entry in the checkout, and the repository's
// owner. The maintainer runs each request by hand, so a request prints what the maintainer needs
// and answers no issue.
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Override, PluginRecord, PluginsFile } from "../build/build.ts";
import { checkoutOverrides, readData } from "../site/description-gaps.ts";
import { type Fetch, githubClient, parseRepoUrl } from "../upstream/reader.ts";

export interface IssueOptions {
  // The checkout's plugins/ directory.
  root: string;
  dataPath: string;
  fetch: Fetch;
  // The index repo as <owner>/<repo>.
  indexRepo: string;
  issue: number;
}

// status 0: the report finds nothing that blocks --apply, or it ran. 1: a problem, or a
// mismatch or an organization owner that --owner-checked did not clear. 2: a named failure.
export interface RequestResult {
  status: 0 | 1 | 2;
  lines: string[];
}

export type FormResult<T> = { ok: true; request: T } | { ok: false; failure: string; message: string };

export interface OwnerRequest<T> {
  request: T;
  data: PluginsFile;
  record: PluginRecord;
  // The entry's directory in the checkout.
  entry: string;
  // The overrides of the entry's index.json, which passed its schema.
  overrides: Override[];
  author: string;
  owner: string;
  organization: boolean;
  // The author is the owner, ignoring letter case.
  matches: boolean;
}

// JSON quotes a value that came from an issue, and also escapes format and line-separator
// characters, which JSON leaves raw and which could change how the printed line reads.
export function quoted(text: string): string {
  return JSON.stringify(text).replace(/[\p{Cf}\p{Zl}\p{Zp}\u007f-\u009f]/gu, (character) => `\\u{${character.codePointAt(0)!.toString(16)}}`);
}

export function failed(name: string, message: string): RequestResult {
  return { status: 2, lines: [`failure: ${name}: ${message}`] };
}

// Reads the issue, which must be open and carry `label`, parses its body with `parse`, and
// reads the data file, the entry's repo URL, and the repository's owner.
export async function readOwnerRequest<T extends { plugin: string }>(
  { root, dataPath, fetch, indexRepo, issue }: IssueOptions,
  label: string,
  parse: (body: string) => FormResult<T>,
): Promise<{ ok: true; read: OwnerRequest<T> } | { ok: false; result: RequestResult }> {
  const stop = (result: RequestResult) => ({ ok: false as const, result });
  const data = await readData(dataPath);
  if (!data.ok) return stop({ status: 2, lines: [`failure: ${data.message}`] });

  const github = githubClient(fetch);
  let body: unknown;
  let labels: unknown;
  let author: unknown;
  let state: unknown;
  try {
    const answer = (await github.json(`https://api.github.com/repos/${indexRepo}/issues/${issue}`)) as { body?: unknown; labels?: unknown; state?: unknown; user?: { login?: unknown } | null };
    ({ body, labels, state } = answer);
    author = answer.user?.login;
  } catch (error) {
    return stop(failed("issue-read-failed", (error as Error).message));
  }
  if (typeof author !== "string") return stop(failed("issue-read-failed", "the issue has no author login"));
  if (state !== "open") return stop(failed("issue-not-open", `issue #${issue} is not open, so its request was answered`));
  const names = (Array.isArray(labels) ? labels : []).map((name: unknown) => (typeof name === "string" ? name : (name as { name?: unknown } | null)?.name));
  if (!names.includes(label)) return stop(failed(`no-${label}-label`, `issue #${issue} does not have the label ${label}`));

  const parsed = parse(typeof body === "string" ? body : "");
  if (!parsed.ok) return stop(failed(parsed.failure, parsed.message));
  const { request } = parsed;
  const record = data.data.plugins.find(({ id }) => id === request.plugin);
  if (!record) return stop(failed("unknown-plugin", `the data file has no plugin with the id ${quoted(request.plugin)}`));

  // The id equals a record's, so it is not any path that the issue's text chose.
  const entry = join(root, record.id);
  let repoUrl: unknown;
  try {
    repoUrl = (JSON.parse(await readFile(join(entry, "meta.json"), "utf8")) as { repoUrl?: unknown }).repoUrl;
  } catch (error) {
    return stop(failed("no-entry", `the checkout has no readable entry ${quoted(record.id)}: ${(error as Error).message}`));
  }
  // The checkout's own files fail before any request to the repository's owner.
  const overrides = await checkoutOverrides(join(entry, "index.json"));
  if (!Array.isArray(overrides)) return stop({ status: 2, lines: [`failure: ${overrides.message}`] });

  let owner: { login?: unknown; type?: unknown } | undefined;
  try {
    const { owner: name, repo } = parseRepoUrl(typeof repoUrl === "string" ? repoUrl : "");
    ({ owner } = (await github.json(`https://api.github.com/repos/${name}/${repo}`)) as { owner?: { login?: unknown; type?: unknown } });
  } catch (error) {
    return stop(failed("owner-read-failed", (error as Error).message));
  }
  if (typeof owner?.login !== "string") return stop(failed("owner-read-failed", "the repository answer names no owner"));

  return {
    ok: true,
    read: {
      request,
      data: data.data,
      record,
      entry,
      overrides,
      author,
      owner: owner.login,
      organization: owner.type === "Organization",
      matches: author.toLowerCase() === owner.login.toLowerCase(),
    },
  };
}

// The report lines that every owner request starts with, after its own lines about the request.
export function ownerLines({ author, owner, organization, matches, data }: OwnerRequest<unknown>): string[] {
  const lines = [`author: ${quoted(author)}`, `owner: ${quoted(owner)}`, `author-matches-owner: ${matches}`, `data-generated: ${quoted(data.generatedAt)}`];
  if (organization) lines.push("owner-check: the owner is an organization, so check the author by hand");
  return lines;
}
