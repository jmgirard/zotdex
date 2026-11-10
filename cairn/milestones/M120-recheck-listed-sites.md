<!-- Section ownership + write-modes: see tracking-rules.md "Milestone-file
     section ownership". A phase skill never rewrites another phase's section.
     Per-section owners are tagged below. The one size check that can fail is
     cairn_validate's <150 over the plan-owned body. -->
# M120: Re-check listed plugins for listed sites

- **Status:** review
- **Priority:** high
- **Depends on:** M119
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — the build opens issues in the public repository
- **Branch/PR:** m120-recheck-listed-sites

## Goal

The daily build matches listed plugins against the sites file and opens
a GitHub issue for the maintainer for each new match, so a plugin that
adds a listed site after it is listed is found.

## Scope

**In:** a `pnpm site-issues` command (`src/site-issues/` and a CLI) and a
`site-issues` job in `.github/workflows/build.yml` that holds `issues:
write` and opens an issue, labeled `listed-site` and assigned to the
repository's owner, for each listed plugin and site that no such issue
names yet; docs, DESIGN, a D-entry annotating D-084, CHANGELOG.

**Out:** removing a matched plugin: the maintainer reads it under M118's
rules, so no row. Matching on topics: the deployed data holds no topics,
and the bot's hold (M119) reads them at intake, so no row.

## Acceptance criteria

- [x] AC1: `pnpm site-issues --data <file> --sites <file> [--assignee
      <login>]` takes as its matches each record whose name, description,
      or repository name in the data matches a name in the sites file, and
      opens one issue for each match whose marker line (plugin id and site)
      no issue labeled `listed-site`, open or closed, holds, at most 5 a
      run, printing one warning line naming each match left past the cap.
      Tests cover no match (no request), a match in each of the three
      fields, a match already reported in an open and in a closed issue,
      exactly 5 and 6 new matches, and the label found and created.
- [x] AC2: A failed issue list or label read opens no issue; a failed label
      create or a failed issue create stops the run's other creates; each
      prints one warning line and exits 0. Tests cover each failure.
- [x] AC3: A `site-issues` job in `build.yml` runs the command on the
      daily build's data with the checked-out sites file, and
      `docs/maintaining.md` says what a maintainer does with such an issue
      under M118's rules, including that a second removal on the fifth
      ground stays.
- [x] AC4: `pnpm test` and `pnpm check` pass.

## Coverage

- AC1 → T1, T4
- AC2 → T1
- AC3 → T2, T4
- AC4 → T3

## Tasks

- [x] T1: Write `src/site-issues/` and its CLI on the shape of
      `src/malware-scan/scan-issues.ts` (D-084); tests per AC1 and AC2.
- [x] T2: Add the `site-issues` job to `.github/workflows/build.yml`;
      write the D-entry; update docs, DESIGN, CHANGELOG.
- [x] T3: Run `pnpm test` and `pnpm check`.
- [x] T4: Fix review return 1 and the other fix-now findings that the
      Review section lists; rerun `pnpm test` and `pnpm check`.

## Work log

- 2026-11-09: created by /milestone-plan, split from M119 at RR01 ingestion (R8's daily re-check), which the user accepted.
- 2026-11-09: tier check: milestone — a new build job that writes to the public repository; planned from RR01 ingestion, which `/milestone-brief` routed.
- 2026-11-09: idea vet: gap — topics are not in the deployed data; taken as out, since M119's hold reads them at intake. flaw — none.
- 2026-11-09: lessons used: 2026-11-07 (M116) a `Build data` run dispatched on a branch runs every job but the deploy.
- 2026-11-10: in-progress; branch m120-recheck-listed-sites cut from main at 40ef504b; `.claude/` left untracked and unstaged.
- 2026-11-10: choice: "description" reads both the manifest description and the GitHub description, and "name" the manifest name; override values are not read, since a maintainer writes them; the repository name comes from `repoUrl` in its own case, so a record with no upstream still matches on it.
- 2026-11-10: choice: the marker is `<!-- listed-site <sha256 id> <sha256 site> -->`, and `codeSpan`, `holdsMarker`, and `oneLine` are reused from the malware scan; per AC2 a 422 on create stops the run too, unlike scan-issues, which skips it; the body lists each matched text in a code span.
- 2026-11-10: T1 done: `src/site-issues/site-issues.ts`, `cli.ts`, `pnpm site-issues`, 30 tests; a planted defect that ignored earlier issues failed the open and closed marker tests; deployed data of 2026-11-09T16:32Z gives 4 matches, all plugins M119 removed, so the first run on current `plugins/` should match none; verify green (2890 passed, 753 entries, 0 problems).
- 2026-11-10: choice: the `site-issues` job needs only the build job (default `if`), runs beside the start tests, and checks the data digest as scan-issues does; its own concurrency group `site-issues`.
- 2026-11-10: choice: the docs close a gap that AC1's never-reopen marker leaves: a maintainer who lifts a listed-site removal deletes the closed issue's marker line, so a plugin that names the site again gets a new issue; recorded in D-089 and DESIGN Known issues.
- 2026-11-10: T2 done: `site-issues` job, 5 workflow tests (2 shared with scan-issues by `test.each`), `docs/maintaining.md` "Listed-site issues" plus lifting and daily-build edits, D-089, DESIGN, CHANGELOG; verify green (2895 passed, 753 entries, 0 problems), cairn_validate passed.
- 2026-11-10: T3 done: `pnpm test` (2895 passed, 6 skipped) and `pnpm check` (753 entries, 0 problems) on 4729bbf5's tree.
- 2026-11-10: delegation: claim audit to a fresh Opus reader over `git diff main...HEAD -- . ':!cairn/'`.
- 2026-11-10: claim audit: 78 claims read, 2 corrected — docs/maintaining.md, src/site-issues/cli.ts (the lift step assumed every listed-site removal has a `listed-site` issue; the exit-1 list left out data with no plugins list and a refused sites file); the re-read found both hold, and its wording note on the lift step was taken.
- 2026-11-10: status review; verify green (2895 passed, 753 entries, 0 problems).
- 2026-11-10: review return 1: diff-bug #1 — `repoNameOf` reads the entry's `repoUrl`, not GitHub's `upstream.repoUrl`, so a repo renamed on GitHub to name a listed site gets no issue and no warning; the fix pass also takes the Review section's other fix-now findings (diff-bug #2, #3, #5, #10, #12; blame-history #1 to #3; ripple #2 to #5; prior-review #1).
- 2026-11-10: in-progress for review return 1; T4 added (minor amendment), Coverage AC1 and AC3 gain T4.
- 2026-11-10: T4 done: `repoNameOf` reads `upstream.repoUrl`, else `repoUrl`, at the second path segment; the rename and no-upstream tests failed on the old rule (2 of 30) and pass now; one 422 create test in place of 422 and 500; ids, span, and the no-plugins-list exit asserted; lift step, cap-warning, label, and item-3 docs, CHANGELOG, and three DESIGN lines fixed; ripple #2 changed to reject; deployed data still gives the same 4 matches; verify green (2895 passed, 753 entries, 0 problems).
- 2026-11-10: claim audit: 35 claims read, 4 corrected — CHANGELOG.md, docs/maintaining.md (a closed issue stays closed while a labeled issue holds the marker, not only until the marker goes; the label changes that reopen; the cap warning prints only past 5 matches; item 3 is written for a second removal, and a wrong reading still lifts it); the re-read found all hold and one "Otherwise" pointing the wrong way, fixed.
- 2026-11-10: status review; verify green (2895 passed, 753 entries, 0 problems).

## Decisions

## Review

- AC1 evidence (2026-11-10, 1cf0c777): `vitest run test/site-issues.test.ts` green; named tests cover no match ("sends no request with no match", "finds no match in texts that name no site"), a match in the name, description, repoDescription, and repoName fields, a marker in an open and in a closed issue (0 creates), exactly 5 (5 creates, no warning) and 6 new matches (5 creates, one warning naming `p5 (Sci-Hub)`), the label found (no label POST) and created on a 404.
- AC2 evidence (2026-11-10, 1cf0c777): tests "opens no issue and warns once when" the issue list fails, the label read answers 500, and the label create fails (only the label POST), and "stops at a create that answers 422/500 and opens no other issue" (1 POST of 2), each asserting exactly one `::warning::` line; `pnpm site-issues` run with one match and a refused connection (`NODE_USE_ENV_PROXY=1 HTTPS_PROXY=http://127.0.0.1:9`) printed one `::warning::opened no listed-site issue: cannot list …` line and exited 0.
- AC3 evidence (2026-11-10, 1cf0c777): `build.yml:328` defines the `site-issues` job, `:360` runs `pnpm site-issues --data dist/v1/plugins.json --sites sites.json --assignee "$ASSIGNEE"` after the data-digest check; 5 `test/workflows.test.ts` tests on the job green; `docs/maintaining.md:657` "Listed-site issues" gives the four steps under M118's rules (`:692`–`:705`) and says that a second removal on that ground stays (`:707`).
- AC4 evidence (2026-11-10, 1cf0c777): `pnpm test` 2895 passed, 6 skipped, 43 files; `pnpm check` 753 entries, 0 problems.
- gate: `cairn_validate.py` all checks passed; no principle changed, so no `cairn_impact`; generic profile adds no toolchain checks.
- spawned: diff-bug, blame-history, prior-review, ripple
- diff-bug #1: the repository name comes from the entry's `repoUrl`, not GitHub's `upstream.repoUrl` (`html_url`), so a repo renamed on GitHub to name a site (5 of 754 records differ, deployed data of 2026-11-09) or a case that differs is missed with no warning — fix now (floor return 1)
- diff-bug #2: the test fixture sets `upstream.repoUrl` equal to `repoUrl`, so no test tells them apart — fix now
- diff-bug #3: `repoNameOf` takes the URL's last path segment, not the second — fix now
- diff-bug #4: plugin code in a start-test job can replace `plugins-data`, so the digest check fails and that day opens no issue — reject, planned change: the plan takes D-084's shape, which accepted this exposure, and the failed check shows on the run
- diff-bug #5: a run that stops at a failed create prints no warning for the matches past the cap, while the docs say a run names each one — fix now (docs: AC2's one warning line per failure stands)
- diff-bug #6: any 422 stops the run, so a match that GitHub always refuses blocks the matches after it each day — reject, planned change: AC2 says a failed issue create stops the run's other creates, and D-089 records it with its falsifier
- diff-bug #7: a matched text longer than 200 characters is cut, so the issue can show a description without the site name; the Site and field lines still name the match — known issue: A `listed-site` issue cuts each matched text to 200 characters, as `codeSpan` does, so a description that names a site past character 200 shows without the name; the issue's Site line and field label still name the match, and its page link leads to the full text (M120 review, D-089). Accepted at the M120 gate
- diff-bug #8: a record without a string `repoUrl` makes `matchesOf` throw past the one-line exit — reject, edge: only data that is not the build's digest-checked output has such a record, and the effect is an error exit
- diff-bug #9: override values and screenshot text are not read — reject, false: no defect; the match reads the plugin's own texts, as D-085 names them, and a maintainer writes overrides
- diff-bug #10: a renamed or deleted `listed-site` label reopens every match, up to 5 a run — fix now (docs name it beside removing the label)
- diff-bug #11: a dispatch on another branch reads that branch's `sites.json` and opens real issues — reject, planned change: the plan puts the job in `build.yml`, whose branch runs run every job but the deploy, as the scan-issues job does
- diff-bug #12: tests: the 422 and 500 create cases run one path, the 6-match case asserts no ids, the hostile-body case does not check the span, and the CLI "no plugins list" exit has no test — fix now (one create case kept, ids and span asserted, CLI case added); the open and closed marker cases stay, since AC1 names both
- blame-history #1: in "Lifting a removal" the earlier-removal search finds the removal being lifted, so "if it finds none" never holds and the marker step never runs — fix now
- blame-history #2: D-089 says the lifting maintainer deletes the marker, while the docs do so only if the search finds none — fix now (with #1)
- blame-history #3: CHANGELOG says a closed issue is not opened again, which holds only while its marker stays — fix now
- ripple #1: `docs/requests.md:409` "A plugin that stays listed has not been checked" names no daily issue — reject, false: the sentence still holds, since the job reads texts, not README or settings
- ripple #2: DESIGN's list of commands that read `sites.json` lacks `site-issues` — reject, false: the sentence names the commands whose sites `listedSites` matches, and `site-issues` calls `sitesNamedIn`, not `listedSites` (settled fix now first, changed on reading the line in the T4 pass)
- ripple #3: DESIGN says `src/check/sites.ts` holds the match the bot uses, without `site-issues` — fix now
- ripple #4: DESIGN's M119 Known issue says the daily re-check finds a plugin, which misses a topics-only name — fix now
- ripple #5: the lift step's "the plugin's texts" does not say which texts — fix now
- ripple #6: DESIGN's "without a report" sentence does not name the daily issues — reject, false: the sentence still holds about who reads the plugin, and the next sentence names the issues
- prior-review #1: the docs say item 3 of the outline offers an appeal only for a wrong reading, while the outline also names a later release — fix now (scoped to the second removal)
- prior-review #2: a 422 stops the run, unlike scan-issues — reject, planned change, as diff-bug #6
- prior-review #3: the repository name is read in the entry's case, not GitHub's — fix now, as diff-bug #1
- prior-review #4: `matchesOf` can throw outside the documented exit — reject, edge, as diff-bug #8
- fix-now lines above (diff-bug #1, #2, #3, #5, #10, #12; blame-history #1 to #3; ripple #3 to #5; prior-review #1, #3): fixed b5b076a1, wording settled e8944268
- pass 2 (after review return 1) AC1 evidence (2026-11-10, e8944268): `vitest run test/site-issues.test.ts` green; the same AC1 cases as pass 1, plus the repository name that GitHub gives after a rename and in its case, and a record with no upstream.
- pass 2 AC2 evidence (2026-11-10, e8944268): the list, label read, label create, and 422 create failures each give one `::warning::` line in tests; `pnpm site-issues` with one match and a refused connection printed one warning and exited 0.
- pass 2 AC3 evidence (2026-11-10, e8944268): `build.yml:328` and `:360` as in pass 1, 5 workflow tests green; `docs/maintaining.md:701` gives the steps, `:716` says that a second removal on that ground stays.
- pass 2 AC4 evidence (2026-11-10, e8944268's code): `pnpm test` 2895 passed, 6 skipped at 09:02; `pnpm check` 753 entries, 0 problems.
- pass 2 gate: `cairn_validate.py` all checks passed; no principle changed; generic profile adds no toolchain checks.
- spawned: diff-bug, blame-history, prior-review, ripple
- diff-bug #1: the earlier-removal search counts a removal that a maintainer lifted for a wrong reading, so a plugin could stay off after one valid removal — fix now
- diff-bug #2: a plugin has one `listed-site` issue per site, and the lift step names one issue's marker — fix now (each closed issue, with a command to find them)
- diff-bug #3: the search matches the current owner/repo, so a renamed repo's earlier removal is missed — fix now (search earlier names too)
- diff-bug #4: CHANGELOG "the repository's owner" reads as the plugin's owner — fix now ("the index's owner")
- diff-bug #5: a no-upstream entry URL ending in `.git` shows `x.git` as the repository name — fix now
- diff-bug #6: a kept record's `upstream.repoUrl` is the earlier read's, so a rename shows late — fix now (the comment says so; the issue is late, not lost)
- diff-bug #7: the body's Repository line shows the entry's URL, not GitHub's — fix now
- diff-bug #8: changing a site's `site` name in `sites.json` reopens every match, and the docs list leaves it out — fix now
- diff-bug #9: a hand run of `pnpm site-issues` beside the job is outside the concurrency group — reject, planned change: the plan takes D-084's shape, whose group covers workflow runs, as for scan-issues
- diff-bug #10: the open and closed marker cases and the 5 and 6 cases share code paths — reject, false: AC1 names each case
- diff-bug #11: the workflow test checks `timeout-minutes` at most 10, not exactly 10 — reject, false: the docs and DESIGN promise at most 10 minutes
- diff-bug #12: the CLI no-match test asserts stdout, not that no request goes out — reject, false: "sends no request with no match" asserts the empty request list on `reportMatches`, and the CLI test runs with no token
- diff-bug #13: the no-upstream `/tree/main` test guards a URL the entry schema may refuse — reject, false: it is pass 1's regression test for the second-segment fix
- blame-history #1: the lift step's "can come back" names no release that drops the site — fix now
- blame-history #2: the search paragraph says it runs before a removal and still counts the lifted removal — fix now
- blame-history #3: "offer an appeal for a wrong reading only" and the second-removal rule leave unclear how a wrong reading lifts — reject, false: `docs/requests.md` "Coming back" lifts any removal whose reading was wrong, and the appeal is how the request comes
- blame-history #4: no command finds the closed `listed-site` issue — fix now (command added); the claim that the step covers removals on other grounds is false, since it sits under "For a listed site"
- blame-history #5: "uses the match of the bot's hold" while the hold also reads topics — fix now ("the match rule")
- blame-history #6: the M117 Known issue gained an M120 sentence that its gate did not see — fix now (moved to M120's own entry, which ends "Accepted at the M120 gate"); the "corrected M120" mark on the M119 entry is the correction rule's form
- blame-history #7: the site-issues concurrency comment lacks scan-issues' note on a replaced waiting run — reject, style
- blame-history #8: a docs line of 97 characters — reject, style (the line is rewritten)
- prior-review #1: no second-page test of the issue list, which M117 added for scan-issues — fix now
- prior-review #2: a 422 stops the run, against M117 — reject, planned change, as pass 1 diff-bug #6
- prior-review #3: the lift step drops the release condition — fix now, as blame-history #1
- prior-review #4: a branch dispatch opens real issues — reject, planned change, as pass 1 diff-bug #11
- ripple #1: `docs/requests.md:424` has no wrong-reading exception for a second removal — reject, false: the same section's last paragraph lifts any removal whose reading was wrong
- ripple #2: the search paragraph says it runs before a removal only — fix now, as blame-history #2
- ripple #3: `docs/requests.md` "has not been checked" next to a closed `listed-site` issue — reject, false: the job reads texts, not README or settings, so the sentence holds
- ripple #4: DESIGN's maintainer-reads sentence does not name the issues — reject, false: the next sentence names them
- pass 2 fix-now lines above: fixed 93829284; verify green (2897 passed, 753 entries, 0 problems), `cairn_validate.py` passed, no snapshot file changed, no open PR of mine (feature cap 1)
