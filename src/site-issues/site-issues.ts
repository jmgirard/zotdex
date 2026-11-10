import { createHash } from "node:crypto";
import { BASE, ORIGIN } from "../../site/src/base.ts";
import type { PluginRecord, PluginsFile } from "../build/build.ts";
import { type Site, sitesNamedIn } from "../check/sites.ts";
import { oneLine } from "../malware-scan/add-results.ts";
import { codeSpan, holdsMarker } from "../malware-scan/scan-issues.ts";
import { type Fetch, githubClient, ReadFailure } from "../upstream/reader.ts";

// The most issues one run opens. A match past it gets its issue on a later run, since each run
// reads every listed plugin.
export const SITE_ISSUES_MAX = 5;

// The label of every issue this command opens. It also lets a run list the earlier ones.
export const SITE_ISSUE_LABEL = "listed-site";

const API = "https://api.github.com";

// The texts of a record that the match reads, in the order the issue names them.
export const MATCH_FIELDS = ["name", "description", "repoDescription", "repoName"] as const;
export type MatchField = (typeof MATCH_FIELDS)[number];

const FIELD_LABELS: Record<MatchField, string> = {
  name: "Manifest name",
  description: "Manifest description",
  repoDescription: "GitHub description",
  repoName: "Repository name",
};

// A listed plugin whose texts name a listed site, with the texts that name it.
export interface Match {
  record: PluginRecord;
  site: Site;
  fields: { field: MatchField; text: string }[];
}

// The repository name in the URL that GitHub gave the build (`upstream.repoUrl`), which follows a
// rename and keeps GitHub's letter case, as the `listed-site` hold reads it. A record with no
// upstream falls back to the entry's own repoUrl. The name is the URL's second path segment.
function repoNameOf(record: PluginRecord): string {
  const url = record.upstream?.repoUrl ?? record.repoUrl;
  return url.replace(/^[a-z]+:\/\/[^/]+\//i, "").split("/")[1] ?? "";
}

function textsOf(record: PluginRecord): { field: MatchField; text: string }[] {
  const upstream = record.upstream;
  const texts: Record<MatchField, string | undefined> = {
    name: upstream?.name,
    description: upstream?.description,
    repoDescription: upstream?.repoDescription,
    repoName: repoNameOf(record),
  };
  return MATCH_FIELDS.flatMap((field) => (typeof texts[field] === "string" ? [{ field, text: texts[field] }] : []));
}

// Each pair of a record in the data and a site that the record's manifest name, manifest
// description, GitHub description, or repository name names, in the data's order and then the
// sites file's.
export function matchesOf(data: PluginsFile, sites: readonly Site[]): Match[] {
  return data.plugins.flatMap((record) => {
    const texts = textsOf(record);
    return sites.flatMap((site) => {
      const fields = texts.filter(({ text }) => sitesNamedIn(text, [site]).length > 0);
      return fields.length > 0 ? [{ record, site, fields }] : [];
    });
  });
}

function sha256(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

// The line that names one plugin and site in its issue's body. It holds only hex digits and fixed
// words, so no value can write it or end the comment it sits in.
export function markerOf(match: Match): string {
  return `<!-- listed-site ${sha256(match.record.id)} ${sha256(match.site.site)} -->`;
}

export function titleOf(match: Match): string {
  return oneLine(`${match.record.id} names ${match.site.site}, a listed site`);
}

export function bodyOf(match: Match): string {
  const { record, site } = match;
  const page = `${ORIGIN}${BASE}plugins/${encodeURIComponent(record.id)}/`;
  return [
    "The daily build found the name of a site in sites.json in this plugin's texts.",
    "",
    `- Plugin: ${codeSpan(record.id)} <${page}>`,
    `- Repository: ${codeSpan(record.repoUrl)}`,
    `- Version: ${codeSpan(record.upstream?.version?.trim() || "unknown")}`,
    `- Site: ${codeSpan(site.site)}`,
    ...match.fields.map(({ field, text }) => `- ${FIELD_LABELS[field]}: ${codeSpan(text)}`),
    "",
    "A name in these texts does not show that the site is built in. Read the plugin's README and " +
      'settings as "Listed-site issues" in docs/maintaining.md says before acting.',
    "",
    markerOf(match),
  ].join("\n");
}

export interface ReportOptions {
  matches: Match[];
  fetch: Fetch;
  // The repository, as owner/name.
  repo: string;
  token?: string;
  assignee?: string;
}

// The lines to print, `::warning::` lines among them, and the plugin ids it opened issues for.
export interface ReportOutcome {
  lines: string[];
  opened: string[];
}

const nameOf = (match: Match) => `${match.record.id} (${match.site.site})`;

function failureOf(error: unknown): string {
  return oneLine((error as Error).message);
}

// Opens an issue for each match whose marker line no issue labeled SITE_ISSUE_LABEL, open or
// closed, holds, at most SITE_ISSUES_MAX a run. With no match it sends no request. A failed issue
// list or label read opens no issue; a failed label create, a failed issue create, or a created
// issue without the label stops the run's other creates. Each failure gives one warning line,
// and nothing here throws.
export async function reportMatches(options: ReportOptions): Promise<ReportOutcome> {
  const { matches, fetch, repo, token, assignee } = options;
  const outcome: ReportOutcome = { lines: [], opened: [] };
  const warn = (text: string) => outcome.lines.push(oneLine(`::warning::${text}`));
  if (matches.length === 0) return outcome;
  const github = githubClient(fetch, token);
  const repoUrl = `${API}/repos/${repo}`;
  let bodies: unknown[];
  try {
    const issues = await github.pages(`${repoUrl}/issues?labels=${SITE_ISSUE_LABEL}&state=all&per_page=100`);
    bodies = issues.map((issue) => (issue as { body?: unknown } | null)?.body);
  } catch (error) {
    warn(`opened no listed-site issue: cannot list the ${SITE_ISSUE_LABEL} issues: ${failureOf(error)}`);
    return outcome;
  }
  const pending = matches.filter((match) => !bodies.some((body) => holdsMarker(body, markerOf(match))));
  if (pending.length === 0) return outcome;
  try {
    await github.json(`${repoUrl}/labels/${SITE_ISSUE_LABEL}`);
  } catch (error) {
    if (!(error instanceof ReadFailure && error.status === 404)) {
      warn(`opened no listed-site issue: cannot read the ${SITE_ISSUE_LABEL} label: ${failureOf(error)}`);
      return outcome;
    }
    try {
      await github.post(`${repoUrl}/labels`, { name: SITE_ISSUE_LABEL, color: "d93f0b", description: "A listed plugin whose texts name a site in sites.json" });
    } catch (createError) {
      warn(`opened no listed-site issue: cannot create the ${SITE_ISSUE_LABEL} label: ${failureOf(createError)}`);
      return outcome;
    }
  }
  const left = pending.slice(SITE_ISSUES_MAX);
  for (const match of pending.slice(0, SITE_ISSUES_MAX)) {
    const payload = { title: titleOf(match), body: bodyOf(match), labels: [SITE_ISSUE_LABEL], ...(assignee && { assignees: [assignee] }) };
    try {
      const issue = (await github.post(`${repoUrl}/issues`, payload)) as { number?: unknown; labels?: unknown } | null;
      outcome.opened.push(match.record.id);
      outcome.lines.push(oneLine(`opened issue #${String(issue?.number)} for ${nameOf(match)}`));
      // GitHub drops a label it does not let the token set, with no error. Without the label no
      // later run finds the marker, so each run would open the issue again. GitHub matches label
      // names without case, so a label spelled another way counts.
      const named = (label: unknown) => String((label as { name?: unknown } | null)?.name).toLowerCase() === SITE_ISSUE_LABEL;
      if (!(Array.isArray(issue?.labels) && issue.labels.some(named))) {
        warn(`stopped opening listed-site issues: issue #${String(issue?.number)} for ${nameOf(match)} lacks the ${SITE_ISSUE_LABEL} label`);
        return outcome;
      }
    } catch (error) {
      warn(`stopped opening listed-site issues at ${nameOf(match)}: ${failureOf(error)}`);
      return outcome;
    }
  }
  if (left.length > 0) warn(`left ${left.length} listed-site matches for a later run, past the limit of ${SITE_ISSUES_MAX}: ${left.map(nameOf).join(", ")}`);
  return outcome;
}
