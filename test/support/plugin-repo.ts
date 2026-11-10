import type { Responses } from "./fixture-fetch.ts";

// The responses the reader requests for one GitHub repo `owner/repo` whose release XPI
// declares the plugin id `id`, and the owner's account, which the discovery bot reads.
// With `noRelease`, the repo has no release, so the read fails with no-release. The repo
// carries the topic zotero-plugin, and the account is years old, so the entry meets no
// hold reason unless the options say otherwise.
export function pluginRepo(
  fullName: string,
  id: string,
  {
    noRelease = false,
    name = fullName,
    topics = ["zotero-plugin"],
    ownerCreatedAt = "2015-01-01T00:00:00Z",
    updateHost = "raw.githubusercontent.com",
    stars = undefined as number | undefined,
    updateRoute = undefined as string[] | undefined,
    // The manifest description and the GitHub description, left out when unset.
    description = undefined as string | undefined,
    repoDescription = undefined as string | undefined,
  } = {},
): Responses {
  const repoUrl = `https://github.com/${fullName}`;
  const xpiUrl = `${repoUrl}/releases/download/v1.0.0/plugin.xpi`;
  // With `updateRoute`, its first URL is the update_url, each URL redirects to the next, and the last answers.
  const updateUrl = updateRoute?.at(-1) ?? `https://${updateHost}/${fullName}/main/update.json`;
  const namedUrl = updateRoute?.[0] ?? updateUrl;
  const responses: Responses = {
    [`https://api.github.com/repos/${fullName}`]: {
      json: { full_name: fullName, html_url: repoUrl, fork: false, created_at: "2025-01-10T09:00:00Z", open_issues_count: 0, topics, ...(stars !== undefined && { stargazers_count: stars }), ...(repoDescription !== undefined && { description: repoDescription }) },
    },
    [`https://api.github.com/users/${fullName.split("/")[0].toLowerCase()}`]: { json: { created_at: ownerCreatedAt } },
    [`https://api.github.com/repos/${fullName}/releases?per_page=100`]: {
      json: noRelease
        ? []
        : [
            {
              tag_name: "v1.0.0",
              draft: false,
              prerelease: false,
              published_at: "2026-03-01T12:00:00Z",
              assets: [{ name: "plugin.xpi", browser_download_url: xpiUrl }],
            },
          ],
    },
  };
  if (noRelease) return responses;
  responses[xpiUrl] = {
    xpi: {
      "manifest.json": {
        manifest_version: 2,
        name,
        ...(description !== undefined && { description }),
        version: "1.0.0",
        applications: { zotero: { id, update_url: namedUrl, strict_min_version: "7.0", strict_max_version: "8.*" } },
      },
    },
  };
  updateRoute?.slice(0, -1).forEach((url, i) => (responses[url] = { status: 301, headers: { location: updateRoute[i + 1] } }));
  responses[updateUrl] = { json: { addons: { [id]: { updates: [{ version: "1.0.0" }] } } } };
  return responses;
}

// A commit or blob SHA of one repeated hex digit.
export const sha = (digit: string) => digit.repeat(40);

// The first-commit and file answers of a repo, whose head is one commit and whose first
// commit is another, reached by a last-page link.
export function repoGit(fullName: string, { head, first, files }: { head: string; first: string; files: Record<string, string> }): Responses {
  const base = `https://api.github.com/repos/${fullName}`;
  const last = `${base}/commits?per_page=1&page=7`;
  return {
    [`${base}/commits?per_page=1`]: { json: [{ sha: head }], headers: { link: `<${last}>; rel="last"` } },
    [last]: { json: [{ sha: first }] },
    [`${base}/git/trees/${head}?recursive=1`]: { json: { truncated: false, tree: Object.entries(files).map(([path, blob]) => ({ path, type: "blob", sha: blob })) } },
  };
}

// One page of repository search results, as GitHub returns it, for repos given as
// [full name, pushed_at] pairs.
export function searchPage(repos: [string, string][]) {
  return {
    total_count: repos.length,
    incomplete_results: false,
    items: repos.map(([fullName, pushedAt]) => ({
      full_name: fullName,
      html_url: `https://github.com/${fullName}`,
      pushed_at: pushedAt,
      fork: false,
    })),
  };
}
