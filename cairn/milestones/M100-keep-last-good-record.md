<!-- Section ownership + write-modes: see tracking-rules.md "Milestone-file
     section ownership". A phase skill never rewrites another phase's section.
     Per-section owners are tagged below. The one size check that can fail is
     cairn_validate's <150 over the plan-owned body. -->
# M100: Keep a plugin's last good record

- **Status:** review   <!-- owner: transitioning skill · mirror-update; cairn/ROADMAP.md is the authority -->
- **Priority:** high   <!-- owner: plan · create/amend-via-gate; high | normal | low -->
- **Depends on:** —   <!-- owner: plan · create/amend-via-gate; M<xx>, M<yy> or — -->
- **Driving RR:** —   <!-- owner: plan · create/amend-via-gate; RR<NN> whose Binding criteria bind this milestone's ACs (binding-criteria check), or — -->
- **Principles touched:** —   <!-- owner: plan · create/amend-via-gate; comma-separated IPn/GPn ids this milestone touches, or — -->
- **Resolves:** —   <!-- owner: plan · create/amend-via-gate; comma-separated GitHub issues the scope absorbs, each `#N closes` (the PR closes it at merge) or `#N partial` (the remainder gets a candidate row), or — ; skill conduct only — no validate check parses it -->
- **Surface tier:** user-facing — visitors and data users see the kept facts, the badge, and the new data field   <!-- owner: plan · create/amend-via-gate; user-facing | internal — <one-clause reason>; skill conduct only — no validate check parses it -->
- **Branch/PR:** m100-keep-last-good-record   <!-- owner: implement (branch) / review (PR URL) · create; a companion checkout the milestone also works in is one further entry per checkout, `companion: <abs-path> <branch>` (implement), its PR URL appended by review — /milestone-review merges companions first, in listed order -->

## Goal
<!-- owner: plan · create; a wrong goal returns to plan, never edited in place -->

A plugin that a build cannot read for a build-level reason keeps its last read facts on the site for up to 7 days, marked as older data.

## Scope
<!-- owner: plan · create/amend-via-gate -->

**In:** `pnpm build --previous <url>` reads the deployed data once after the plugin reads, when at least one record has a build-level failure, and keeps the deployed facts of each such record under the rules below, with a new optional `kept` field. The log and both deploy bars count kept records as failures. A kept record has no start plan item, keeps its start results, and carries none to later builds. The schema, README, CHANGELOG, About page, home legend, footer, plugin page, DESIGN, and a D-entry describe it. `build.yml` passes `--previous`.

**Out:** retrying the GitHub 5xx and slow answers that cut the builds of 2026-11-05 → parked row "Retry build reads GitHub refuses". Keeping `sourceInRepo` on a read record when only the top-level name read fails → parked row "Keep source facts when their read fails". The deploy bars stay as they are: the question set kept "more than half". A plugin with no earlier read facts still shows "Not read".

## Acceptance criteria
<!-- owner: plan · create/amend-via-gate; review reads, never reinterprets.
     Every item opens with its positional label — `ACn:` — the item's
     position counted top-to-bottom, the number Coverage cites; an
     insertion, removal, or reorder renumbers the labels and the Coverage
     lines together.
     Driving RR set → its Binding criteria appear VERBATIM here (binding-
     criteria check), each ingested as a numbered criterion carrying its tag
     — `- [ ] ACn (BCm): <verbatim>` — with its own Coverage line, since
     coverage-complete counts AC checkboxes positionally (M107); departures:
     a "Deviations from RR<NN>" table ends this section. -->

- [x] AC1: With `--previous <url>`, `pnpm build` gives each entry whose read fails with a build-level failure a kept record: the deployed record's `upstream` unchanged (its `sourceInRepo` included) and its `startTests`, the `reports` that this build counts for that `upstream`, this entry's own `overrides` and `paidService`, and `kept` with `readAt` and `failure` (this build's failure name and message), and no top-level `failure`. It keeps a record only when the deployed file's `plugins` list names the entry's id exactly once, that record has the same `repoUrl`, has an `upstream`, and passes the record schema, and its `readAt` is at most 7 days (7 × 86,400,000 ms) before this build's `generatedAt` and not after it. `readAt` is the deployed record's `kept.readAt`, or the deployed file's `generatedAt` for a record with no `kept`. `test/build.test.ts` covers a kept record for `not-read`, for `request-failed`, and for a 5xx failure, a `readAt` of exactly 7 days, and a second keep that holds the first `readAt`.
- [x] AC2: In each of these cases the entry gets the record that the build writes today, with `failure` and no `upstream`: a failure that is not build-level; a deployed record with no `upstream`, with another `repoUrl`, that the record schema rejects, or whose id the deployed list names twice; a `readAt` more than 7 days before `generatedAt`, after it, or that `Date.parse` does not read; and a build with no `--previous`. A failed read of the deployed data (a non-200 answer, a body over 16 MiB, a read past 60 seconds, a body that is not JSON, no `plugins` list, or a `generatedAt` that does not parse) keeps nothing, prints one `::warning::` line that names the cause, and does not change the exit status. A build with no build-level failure does not read the deployed data. `test/build.test.ts` covers each case.
- [x] AC3: A kept record counts as a failure for both deploy bars: `pnpm build` exits 1 when build-level records, kept or not, are more than half of all records, and when every record is kept or has a failure. The log prints one line for each kept record with its id, failure name, and message on one line, and the count of kept records. `test/build.test.ts` covers both bars and the lines.
- [x] AC4: A kept record gets no start plan item. `pnpm add-start-results` leaves a kept record's `startTests` as the build wrote them, and still replaces the `startTests` of a record with no `kept`. `pnpm carry-start-results` carries no result from a deployed record that has `kept`. The tests of these three commands cover each case.
- [x] AC5: `schemas/plugins.v1.schema.json` accepts a record with `upstream` and `kept`, refuses a record with `kept` and `failure`, and refuses `kept` with no `upstream`, and its version stays 1, as D-006 and D-007 allow for a new optional field. The schema's descriptions of `upstream`, `startTests`, and `kept`, README's "Using the data" and "Building the data", the `pnpm build` usage line, and CHANGELOG.md describe the field and the `--previous` option. A test checks the three schema cases.
- [x] AC6: A kept record's home row is the row that the same record with no `kept` builds, plus an "Older data" badge after the name, following any "Archived" badge, and a test compares the two rows' HTML. The home legend names the badge and says that the build of the data could not read the plugin. The plugin page says that the build of the UTC day of the data's `generatedAt` could not read the plugin, gives the failure, and names the UTC day of `readAt`. The About page says when the index keeps facts and that it keeps them for at most 7 days before the build. The footer reads "The data comes from the build of <day>.", where <day> is the UTC day of the data's `generatedAt`. `test/site.test.ts` covers the row, the legend, the plugin page, About, and the footer.
- [x] AC7: `build.yml`'s `pnpm build` step passes `--previous` with the deployed data's address, its time comment names the read, and `test/workflows.test.ts` checks the step. `pnpm test` and `pnpm check` pass.

## Coverage
<!-- owner: plan · create/amend-via-gate; each acceptance criterion → the
     task(s) satisfying it, by positional number (AC/Task counted
     top-to-bottom). Review reads to fence evidence — tracking-rules "AC fencing". -->

- AC1 → T1
- AC2 → T1
- AC3 → T2
- AC4 → T3
- AC5 → T4
- AC6 → T5
- AC7 → T6, T7

## Tasks
<!-- owner: plan (create) / implement (check-off, minor edits); substantive
     change is amend-via-gate. Every item opens with its positional label —
     `Tn:` — the item's position counted top-to-bottom, the number Coverage
     cites; an insertion, removal, or reorder renumbers the labels and the
     Coverage lines together. -->

- [x] T1: Tests first in `test/build.test.ts` for AC1 and AC2. Export the deployed-data read from `src/start-test/carry.ts` (`readPrevious`, 60 s, 16 MiB) or move it to a shared module. Add the keep step to `buildData` in `src/build/build.ts` after the source read (build.ts:260-264) and before `countReports` (build.ts:266), read the deployed data there only when a build-level failure exists, and keep `kept` and `startTests` through the record map at build.ts:267. New fixture fields are optional (lesson M075).
- [x] T2: Tests first for AC3. `src/build/cli.ts`: parse `--previous`, update `USAGE`, print the kept lines with `oneLine` and the kept count, count kept records in `failed` and in both bars (cli.ts:70-90), and print the read warning.
- [x] T3: Tests first for AC4. Guard the `startTests` replacement in `src/start-test/add-results.ts` (around line 139) for kept records, and skip deployed records with `kept` in `carryResults` (`src/start-test/carry.ts`).
- [x] T4: Tests first for AC5. Add `kept` to `schemas/plugins.v1.schema.json` with the `oneOf` and a dependency on `upstream`, update the `upstream` and `startTests` descriptions, README "Using the data" (near line 62 and the start-result text near lines 505-516) and "Building the data" (near line 1511), and add a CHANGELOG entry.
- [x] T5: Tests first for AC6. The badge in `site/src/pages/index.astro` beside `data-archived` (line 169), the legend, the plugin page note in `site/src/pages/plugins/[id]/index.astro`, an About section in `site/src/pages/about.astro` (start-result text near lines 73-78 and the "Not read" text near line 168), and the footer in `site/src/layouts/Base.astro` (line 1082; `test/site.test.ts` pins it near line 2016). Add a kept record to the site fixture and to the three id lists (lesson M061). Check the home row and plugin page in the browser pane at 375 px and desktop in both color schemes (lessons M015, M035).
- [x] T6: Tests first for AC7. `.github/workflows/build.yml`: pass `--previous https://jmgirard.github.io/zotero-plugin-index/v1/plugins.json` to `pnpm build`, and update the time comment (lines 21-28) for the 60-second read. Update `test/workflows.test.ts` (the pinned line near 93). DESIGN.md's build paragraph and Known issues, and D-066 annotating D-011, D-012, D-015, D-023, and D-035.
- [x] T7: Hand checks. Run `buildData` on a saved copy of the deployed data with reads that fail, and check the output against the schema. Then run `build.yml` on the branch, which cannot deploy, and record the build step's time, its kept count, and that the data passes the schema (lesson M087 on reading a job's log).

## Work log
<!-- owner: any skill · append-only; one line per entry; absolute dates.
     EXEMPT from the 150-line cap (D-046): history under D-045, never edited,
     so the cap must never demand a trim here. Wrapped entries get a WARN.
     The rejected-alternative record (/milestone-plan step 4) takes this form:
     `- YYYY-MM-DD: plan gate chose <approach> over <alternative> because
     <reason>; falsified by <evidence class>.` — one per approach choice the
     gate actually weighed, none where it weighed none, and it is the record
     `/milestone-review`'s thrash trigger (b) reads. It lives here rather than
     below so an instantiated file inherits no placeholder to delete.
     A milestone of a feature series also carries the plan's
     `feature series: M<a> -> M<b>[ -> …]` line (tracking-rules "Feature series"). -->

- 2026-11-05: created by /milestone-plan from the parked row "Keep a plugin's last good record", whose condition held: build run 42054337077 deployed 232 of 736 records as build-level failures, 217 of them `not-read`, and run 42044395731 was withheld at 501 of 736.
- 2026-11-05: tier check: milestone — a new data field, new site text, and a change to the build's deploy inputs.
- 2026-11-05: idea vet: gap: the row's "check that the XPI's facts are not stale" names no check; reading taken: the 7-day limit and the badge, since a build-level failure gives no fresh read to check against. Gap: a failed read of the deployed data; reading taken: keep nothing and warn, as `pnpm carry-start-results` does (D-035). Gap: the cut builds' cause, GitHub 5xx and slow answers; reading taken: out of scope, held by "Retry build reads GitHub refuses". No flaw.
- 2026-11-05: lessons used: 2026-11-02 (M075), 2026-10-30 (M061), 2026-10-26 (M015), 2026-10-28 (M035), 2026-11-03 (M087), 2026-10-31 (M066), 2026-11-02 (M082).
- 2026-11-05: question set: deploy bar — keep "more than half"; site mark — an "Older data" badge on the home row and a note on the plugin page; build runs — run `build.yml` on the branch before the merge question and on main after the merge, which deploys — granted.
- 2026-11-05: plan gate chose keeping deployed facts over lowering the deploy bar to a quarter because a lower bar delays every plugin's fresh facts and new plugins for one cut; falsified by visitors who read kept facts as current despite the badge.
- 2026-11-05: plan gate chose reading the deployed data after the plugin reads, only when a build-level failure exists, over a read before them because a read before them spends up to 60 s of the 18-minute read window on every build; falsified by a build whose job passes 30 minutes because of the read.
- 2026-11-05: plan gate chose the keep step inside `buildData` over a separate command after `pnpm build` because the report counts and both deploy bars are decided there; falsified by a kept record whose reports or bar count differ from a read record's.
- 2026-11-05: criteria audit (full) by a fresh Opus reader: 19 findings, all applied: the splice point after the source read and before the report count; a D-entry for D-011, D-015, D-023, and D-035; the failed-read cases, a parse-failing or future `readAt`, a duplicate id, and the exact 7-day edge; the bar wording; `oneLine` for kept lines; no carry from a kept record, so results do not age past one keep; the schema, README, About, and footer texts that the change makes false; the row compared by HTML in place of "sorts and filters"; the branch run moved from AC7 to T7, since one run records an event; the time-budget comment; the pinned workflow line.

- 2026-11-05: T1 done: `src/build/keep.ts` (`keptFacts`, `KEEP_MS`) and the keep step in `buildData` after the source read and before `countReports`; `readPrevious` moved to `src/build/previous.ts`, which `carry.ts` imports and re-exports. Minor amendment: the schema's `kept` definition lands here, not in T4, since the keep step validates each kept record against it; T4 keeps its schema tests and docs. 21 new tests; removing each of four keep rules fails at least one. `pnpm test` 2454 passed, `pnpm check` 0 problems.
- 2026-11-05: T2 done: `pnpm build --previous <url>`; each kept record prints its failure line with `(kept the facts read at <readAt>)` and counts in `failed with`, both bars, and `wrote … with a failed upstream read, K of them with kept facts`; `kept earlier facts: K of N records` and the kept part of the `wrote` line print only with `--previous`, so builds without it print as before. 6 new spawn tests; counting kept records out of `failed` fails 3 of them.
- 2026-11-05: T3 done: `addResults` returns a kept record as it is, and `carryResults` carries nothing from a deployed record with `kept`; the start plan already leaves out a kept record (T1 test). 3 new tests; removing both guards fails 2.
- 2026-11-05: T4 done: schema test of the three `kept` cases and a bad `readAt`; README: the home-row exception, the `kept` paragraph in "Using the data", the start-test case and kept results, `--previous` and its keep rules, the log lines, the usage line, and the daily build's step; the `upstream` and `startTests` schema descriptions (T1); CHANGELOG entry.
- 2026-11-05: T5 done: "Older data" badge on the home row (with the read day as its title) and in the plugin page's h1, the plugin page note with the failure, the read day, and a link to About's new "Older data" section, a legend line, the categories text on About, and the footer "The last build ran on <day>." Minor amendment: the site tests build a separate kept record and its twin instead of adding records to the shared fixture, so lesson M061's three id lists stay as they are. Browser pane: the live data with two kept records at 375 px light and dark and at desktop, no horizontal scroll on the home, plugin, and About pages.
- 2026-11-05: T6 done: `build.yml` runs `pnpm build --plan start-plan.json --previous <deployed data>` and its time comment names the 60-second read; `test/workflows.test.ts` pins the step and that it is the one `pnpm build` step; DESIGN's build paragraph and two Known issues; D-066.
- 2026-11-05: claim audit: 112 claims read, 5 corrected — the footer, plugin page note, and legend said "the last build", which is false after a build that deploys nothing (site/src/layouts/Base.astro, site/src/pages/plugins/[id]/index.astro, site/src/pages/index.astro, README.md, CHANGELOG.md); build.yml's keep comment named no conditions; README's keep rules left out the schema check of the written record (a `readAt` that must end in `Z`); build.ts's plan comment and README's "Once in each build" became false. Not changed: the failure page's own "The last build could not read this plugin" (site/src/pages/plugins/[id]/index.astro, before M100) has the same flaw.
- 2026-11-05: substantive amendment: AC6's footer sentence becomes "The data comes from the build of <day>." in place of "The last build ran on <day>.", the legend and the plugin page name the build of the data in place of the last build, and the badge follows any "Archived" badge; no change to what the user chose at the question set.
- 2026-11-05: re-audit: AC6 (full) — the footer fix left "the last build could not read" in the plugin page note and the legend, false after a build that deploys nothing, and "where Archived sits" was unclear; both applied in the wording above.
- 2026-11-05: re-audit: AC6 (full) — when the data's build and the kept read fall on one UTC day, "the build of <day>" names two builds; met within the cleared wording: the page says "The build that wrote this page, on <day>, could not read this plugin" and "These facts come from an earlier build, on <day>", and the badge title says "Facts from an earlier build, on <day>". This is AC6's second re-audit line, so a further change to its wording goes to the user.
- 2026-11-05: T7 done: `buildData` over all 736 entries with `buildMs: 0` against a saved copy of the deployed data of 2026-11-05 15:22 UTC kept 502 of 502 records with deployed facts, each `upstream` unchanged, 0 schema problems, an empty start plan. Branch run 42110419077 of `build.yml` (granted at the question set) passed with deploy skipped: the build step took 4:51, the run 26:18; 1 build-level failure (`zotero-pdf2md@yyds.dev`, HTTP 500) kept nothing, since the deployed record had no `upstream`; the `plugins-data` artifact passes the schema.
- 2026-11-05: implement complete; status → review.
- 2026-11-05: review: evidence recorded and every criterion ticked; consistency gate: `cairn_validate` all checks passed, the generic profile names no toolchain checks, no principle changed; four-lens review running.
## Decisions
<!-- owner: implement / review · append-only; milestone-local; promote
     cross-cutting ones to cairn/DECISIONS.md.
     EXEMPT from the 150-line cap (D-074) because D-045 makes it history like the work log — dated dispositions, never edited — so the cap must never demand a trim here either.
     Entries carry their rationale; the counterweight `decisions format`
     advisory watches for pasted output, not for entry length (D-075). -->

## Review
<!-- owner: review · exclusive; evidence per criterion, consistency-gate
     results, review findings + triage. EXEMPT from the 150-line cap (M55),
     as are the work log (D-046) and the decisions section (D-074); evidence
     never scrambles plan-owned content. -->

- AC1: evidence — `test/build.test.ts` "buildData with the deployed data": the 5xx keep (deployed `upstream` and `startTests`, this build's reports, `kept` with `readAt` and the failure, no `failure`), the not-read keep of two records, the request-failed keep, the exact-7-days keep and the 1 ms-later refusal, and the second keep holding the first `readAt` all pass; `sourceInRepo` survives ("counts this build's reports…"). A probe (`buildData` over a one-entry tree against the deployed data of 2026-11-05 15:22 UTC with its overrides changed) wrote the entry's own overrides and `paidService`, not the deployed record's.
- AC2: evidence — 7 "keeps nothing when the deployed record …" cases (no upstream, another repoUrl, schema fails, named twice, over 7 days, after generatedAt, readAt that does not parse), the not-build-level case with no deployed read, the no-`--previous` case, and 6 failed-read cases each naming its problem all pass; `pnpm build with --previous` > "warns on one line and exits as before…" passes with exit 0.
- AC3: evidence — `pnpm build with --previous`: "exits 1 when build-level records, kept or not, are more than half" (2 of 4 exits 0, 3 of 5 exits 1), "exits 1 when every record is kept or has a failure", "prints a line for each kept record and the count", and "prints a kept record's failure message on one line" pass.
- AC4: evidence — the 5xx keep test shows a start plan of only the read record; `test/add-start-results.test.ts` "addResults and a kept record" (2 tests) and `test/carry.test.ts` "carries nothing from a record with kept" pass.
- AC5: evidence — `checkOutput` > "passes a record with upstream facts and kept, and reports kept beside a failure or with no upstream" passes and asserts `schemaVersion` const 1; the schema's `upstream`, `startTests`, and `kept` descriptions, README "Using the data" (the `kept` paragraph and the start-test case) and "Building the data" (`--previous` and its rules, the usage line), the `USAGE` line in `src/build/cli.ts`, and CHANGELOG's Unreleased entry describe the field and the option (read 2026-11-05).
- AC6: evidence — `test/site.test.ts` "a kept record" (6 tests: schema, row compared by HTML with its twin plus the badge after any Archived badge, legend, plugin page note, About, footer) and the updated About-sections, legend, and footer tests pass; the browser pane showed the badge, note, About section, legend, and footer at 375 px and desktop in light and dark (T7 work log).
- AC7: evidence — `test/workflows.test.ts` "keeps the deployed data's facts with pnpm build --previous, the one pnpm build step" passes; `build.yml`'s time comment names the 60-second read of the deployed data; `pnpm test` 2471 passed, 6 skipped, exit 0; `pnpm check` 736 entries, 0 problems.
- gate: `cairn_validate.py` exit 0; profile `generic` consistency-gate: none; `cairn_impact` not run, no principle changed.
