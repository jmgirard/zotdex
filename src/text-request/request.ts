// A repository owner's request to change a plugin's shown name or description (D-049). The
// maintainer runs this by hand, so it prints what the maintainer needs and answers no issue.
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Override, PluginRecord } from "../build/build.ts";
import { nameKey } from "../discover/holds.ts";
import { categories, OTHER } from "../site/categories.ts";
import { gapOf } from "../site/description-gaps.ts";
import { appliedValue, usedOverride } from "../site/version.ts";
import { failed, type IssueOptions, ownerLines, quoted, readOwnerRequest, type RequestResult } from "./owner.ts";
import { parseTextRequest, type TextRequest } from "./parse.ts";
import { textProblems } from "./rules.ts";

export type { RequestResult } from "./owner.ts";

const TEXT_CHANGE_LABEL = "text-change";

export interface RequestOptions extends IssueOptions {
  apply?: boolean;
  ownerChecked?: boolean;
}

// The overrides after the edit that --apply makes. Only an override of the field with no
// `version` changes: a new text takes its place, or joins the end, and a blank text removes it.
function editedOverrides(overrides: Override[], { field, text }: TextRequest, issue: number): Override[] {
  const at = overrides.findIndex((override) => override.field === field && override.version === undefined);
  if (text === "") return overrides.filter((_, index) => index !== at);
  const edited: Override = { field, value: text, reason: `The repository's owner asked for this text in issue #${issue}.` };
  return at === -1 ? [...overrides, edited] : overrides.map((override, index) => (index === at ? edited : override));
}

export function shownName(record: PluginRecord): string {
  return appliedValue(record, "name", record.upstream?.name) ?? record.id;
}

// Reads the issue, the data file, the entry, and the repository's owner, prints the report, and
// with `apply` writes the entry's index.json. Status 0 with `apply` and a blank text with no
// override writes nothing.
export async function textRequest(options: RequestOptions): Promise<RequestResult> {
  const { issue, apply = false, ownerChecked = false } = options;
  const read = await readOwnerRequest(options, TEXT_CHANGE_LABEL, parseTextRequest);
  if (!read.ok) return read.result;
  const { request, record, entry, data, matches, organization, overrides } = read.read;

  const edited = editedOverrides(overrides, request, issue);
  const before = { ...record, overrides };
  const after = { ...record, overrides: edited };
  const problems = request.text === "" ? [] : textProblems(request.field, request.text, shownName(before));

  const lines = [`plugin: ${quoted(record.id)}`, `field: ${quoted(request.field)}`, `text: ${quoted(request.text)}`, ...ownerLines(read.read)];
  if (!record.upstream) lines.push("not-read: the data file has no read of this plugin, so an override shows only after a read succeeds");
  const replaced = overrides.find(({ field, version }) => field === request.field && version === undefined);
  if (replaced) lines.push(`${request.text === "" ? "removes" : "replaces"}-override: ${quoted(replaced.value)}`);
  for (const problem of problems) lines.push(`problem: ${problem}`);
  if (request.field === "name" && request.text !== "") {
    const key = nameKey(request.text);
    for (const other of data.plugins) {
      if (key !== "" && other.id !== record.id && nameKey(shownName(other)) === key) lines.push(`name-match: ${quoted(other.id)} ${quoted(shownName(other))}`);
    }
  }
  const had = new Set(categories(before));
  for (const slug of categories(after)) if (!had.has(slug) && slug !== OTHER) lines.push(`adds-category: ${quoted(slug)}`);
  const winner = usedOverride(after, request.field);
  if (winner?.version !== undefined) lines.push(`version-override-wins: ${quoted(winner.version)} ${quoted(winner.value)}`);
  // A new name can also leave a gap, since a description that only repeats it is dropped.
  const gap = gapOf(after);
  if (request.text === "" || gap) lines.push(`description-gap: ${gap ?? "none"}`);

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
    const written = editedOverrides(index.overrides ?? [], request, issue);
    if (written.length > 0) index.overrides = written;
    else delete index.overrides;
    await writeFile(path, `${JSON.stringify(index, null, 2)}\n`);
  } catch (error) {
    return failed("write-failed", `${path}: ${(error as Error).message}`);
  }
  return { status: 0, lines: [...lines, `wrote: ${quoted(path)}`] };
}
