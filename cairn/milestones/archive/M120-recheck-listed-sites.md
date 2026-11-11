# M120: Re-check listed plugins for listed sites

**Status:** done (2026-11-11, PR #895 https://github.com/jmgirard/zotdex/pull/895)

**Goal:** The daily build matches listed plugins against the sites file and opens a GitHub issue for the maintainer for each new match, so a plugin that adds a listed site after it is listed is found.

**Outcome:** `pnpm site-issues --data --sites [--assignee]` (`src/site-issues/`: `matchesOf`, `reportMatches`) matches each record's manifest name and description, GitHub description, and the repository name of `upstream.repoUrl` (else `repoUrl`) with `sitesNamedIn`, and opens one `listed-site` issue per plugin and site whose marker line (hashes of the id and site) no labeled issue, open or closed, holds; at most 5 a run, with a warning naming the rest; it reuses `codeSpan` and `holdsMarker` from the scan issues. Any failed list, label read, label create, or issue create (a 422 included) stops the run with one warning, and it exits 0. A new `site-issues` job in `build.yml` needs only the build job, checks the data digest, holds only `issues: write` and its own concurrency group. `docs/maintaining.md` gains "Listed-site issues"; "Lifting a removal" now needs a release that drops the site, leaves out the lifted removal and one lifted for a wrong reading, searches renamed repos, and deletes each closed issue's marker.

**Decisions:** D-089 (annotates D-084, D-085, D-087).

**Review:** four-lens fan-out in two passes. Pass 1: one defect return (the repo name came from the entry's URL, which misses a GitHub rename), 14 fixed, 10 rejected, 1 Known issue; pass 2: 16 fixed (lift-step docs, GitHub's URL in the body, `.git` names, page-2 test), 13 rejected. Two claim audits corrected 6 claims. Known issues added: no topics read, closed markers after a lift, label-less issues repeating, the 200-character cut. Hygiene: lessons M100, M115, M116 marked used; one lesson captured; lesson 2026-11-05 (M098) evicted by rank.
