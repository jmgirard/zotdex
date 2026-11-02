// A repository owner's request to change a plugin's shown name or description (D-049). The
// maintainer runs this by hand, so it prints what the maintainer needs and answers no issue.
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Override, PluginRecord } from "../build/build.ts";
import { nameKey } from "../discover/holds.ts";
import { categories } from "../site/categories.ts";
import { checkoutOverrides, gapOf, readData } from "../site/description-gaps.ts";
import { appliedValue, usedOverride } from "../site/version.ts";
import { type Fetch, githubClient, parseRepoUrl } from "../upstream/reader.ts";
import { parseTextRequest, type TextRequest } from "./parse.ts";
import { textProblems } from "./rules.ts";

export const TEXT_CHANGE_LABEL = "text-change";

export interface RequestOptions {
  // The checkout's plugins/ directory.
  root: string;
  dataPath: string;
  fetch: Fetch;
  // The index repo as <owner>/<repo>.
  indexRepo: string;
  issue: number;
  apply?: boolean;
  ownerChecked?: boolean;
}

// status 0: --apply can write, or wrote, without a further check. 1: a problem, a mismatch, or
// an organization owner. 2: a named failure.
export interface RequestResult {
  status: 0 | 1 | 2;
  lines: string[];
}

// JSON quotes a value that came from an issue, and also escapes format and line-separator
// characters, which JSON leaves raw and which could change how the printed line reads.
function quoted(text: string): string {
  return JSON.stringify(text).replace(/[\p{Cf}\p{Zl}\p{Zp}\u007f-\u009f]/gu, (character) => `\\u{${character.codePointAt(0)!.toString(16)}}`);
}

function failed(name: string, message: string): RequestResult {
  return { status: 2, lines: [`failure: ${name}: ${message}`] };
}

// The overrides after the edit that --apply makes. Only an override of the field with no
// `version` changes: a new text takes its place, or joins the end, and a blank text removes it.
export function editedOverrides(overrides: Override[], { field, text }: TextRequest, issue: number): Override[] {
  const at = overrides.findIndex((override) => override.field === field && override.version === undefined);
  if (text === "") return overrides.filter((_, index) => index !== at);
  const edited: Override = { field, value: text, reason: `The repository's owner asked for this text in issue #${issue}.` };
  return at === -1 ? [...overrides, edited] : overrides.map((override, index) => (index === at ? edited : override));
}

function shownName(record: PluginRecord): string {
  return appliedValue(record, "name", record.upstream?.name) ?? record.id;
}

// Reads the issue, the data file, the entry, and the repository's owner, prints the report, and
// with `apply` writes the entry's index.json.
export async function textRequest(options: RequestOptions): Promise<RequestResult> {
  const { root, dataPath, fetch, indexRepo, issue, apply = false, ownerChecked = false } = options;
  const data = await readData(dataPath);
  if (!data.ok) return { status: 2, lines: [`failure: ${data.message}`] };

  const github = githubClient(fetch);
  let body: unknown;
  let labels: unknown;
  let author: unknown;
  try {
    const record = (await github.json(`https://api.github.com/repos/${indexRepo}/issues/${issue}`)) as { body?: unknown; labels?: unknown; user?: { login?: unknown } | null };
    ({ body, labels } = record);
    author = record.user?.login;
  } catch (error) {
    return failed("issue-read-failed", (error as Error).message);
  }
  if (typeof author !== "string") return failed("issue-read-failed", "the issue has no author login");
  const names = (Array.isArray(labels) ? labels : []).map((label: unknown) => (typeof label === "string" ? label : (label as { name?: unknown } | null)?.name));
  if (!names.includes(TEXT_CHANGE_LABEL)) return failed("no-text-change-label", `issue #${issue} does not have the label ${TEXT_CHANGE_LABEL}`);

  const parsed = parseTextRequest(typeof body === "string" ? body : "");
  if (!parsed.ok) return failed(parsed.failure, parsed.message);
  const { request } = parsed;
  const record = data.data.plugins.find(({ id }) => id === request.plugin);
  if (!record) return failed("unknown-plugin", `the data file has no plugin with the id ${quoted(request.plugin)}`);

  // The id equals a record's, so it is not any path that the issue's text chose.
  const entry = join(root, record.id);
  let repoUrl: unknown;
  try {
    repoUrl = (JSON.parse(await readFile(join(entry, "meta.json"), "utf8")) as { repoUrl?: unknown }).repoUrl;
  } catch (error) {
    return failed("no-entry", `the checkout has no readable entry ${quoted(record.id)}: ${(error as Error).message}`);
  }
  const overrides = await checkoutOverrides(join(entry, "index.json"));
  if (!Array.isArray(overrides)) return { status: 2, lines: [`failure: ${overrides.message}`] };

  let owner: { login?: unknown; type?: unknown } | undefined;
  try {
    const { owner: name, repo } = parseRepoUrl(typeof repoUrl === "string" ? repoUrl : "");
    ({ owner } = (await github.json(`https://api.github.com/repos/${name}/${repo}`)) as { owner?: { login?: unknown; type?: unknown } });
  } catch (error) {
    return failed("owner-read-failed", (error as Error).message);
  }
  if (typeof owner?.login !== "string") return failed("owner-read-failed", "the repository answer names no owner");

  const edited = editedOverrides(overrides, request, issue);
  const before = { ...record, overrides };
  const after = { ...record, overrides: edited };
  const organization = owner.type === "Organization";
  const matches = author.toLowerCase() === owner.login.toLowerCase();
  const problems = request.text === "" ? [] : textProblems(request.field, request.text, shownName(before));

  const lines = [
    `plugin: ${quoted(record.id)}`,
    `field: ${quoted(request.field)}`,
    `text: ${quoted(request.text)}`,
    `author: ${quoted(author)}`,
    `owner: ${quoted(owner.login)}`,
    `author-matches-owner: ${matches}`,
  ];
  if (organization) lines.push("owner-check: the owner is an organization, so check the author by hand");
  for (const problem of problems) lines.push(`problem: ${problem}`);
  if (request.field === "name" && request.text !== "") {
    const key = nameKey(request.text);
    for (const other of data.data.plugins) {
      if (key !== "" && other.id !== record.id && nameKey(shownName(other)) === key) lines.push(`name-match: ${quoted(other.id)} ${quoted(shownName(other))}`);
    }
  }
  const had = new Set(categories(before));
  for (const slug of categories(after)) if (!had.has(slug)) lines.push(`adds-category: ${quoted(slug)}`);
  const winner = usedOverride(after, request.field);
  if (winner?.version !== undefined) lines.push(`version-override-wins: ${quoted(winner.version)} ${quoted(winner.value)}`);
  if (request.text === "") lines.push(`gap-after-removal: ${gapOf(after) ?? "none"}`);

  const ownerOk = matches && !organization;
  const status = problems.length === 0 && ownerOk ? 0 : 1;
  if (!apply) return { status, lines };
  if (problems.length > 0) return { status: 1, lines: [...lines, "wrote nothing: the text breaks a rule"] };
  if (!ownerOk && !ownerChecked) return { status: 1, lines: [...lines, "wrote nothing: check the author, then use --owner-checked"] };
  if (request.text === "" && edited.length === overrides.length) {
    return { status: 0, lines: [...lines, "wrote nothing: the entry has no such override to remove"] };
  }
  const path = join(entry, "index.json");
  try {
    const index = JSON.parse(await readFile(path, "utf8")) as { overrides?: Override[] };
    if (edited.length > 0) index.overrides = edited;
    else delete index.overrides;
    await writeFile(path, `${JSON.stringify(index, null, 2)}\n`);
  } catch (error) {
    return failed("write-failed", `${path}: ${(error as Error).message}`);
  }
  return { status: 0, lines: [...lines, `wrote: ${quoted(path)}`] };
}
