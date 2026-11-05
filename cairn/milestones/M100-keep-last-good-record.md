<!-- Section ownership + write-modes: see tracking-rules.md "Milestone-file
     section ownership". A phase skill never rewrites another phase's section.
     Per-section owners are tagged below. The one size check that can fail is
     cairn_validate's <150 over the plan-owned body. -->
# M100: Keep a plugin's last good record

- **Status:** in-progress   <!-- owner: transitioning skill · mirror-update; cairn/ROADMAP.md is the authority -->
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

- [ ] AC1: With `--previous <url>`, `pnpm build` gives each entry whose read fails with a build-level failure a kept record: the deployed record's `upstream` unchanged (its `sourceInRepo` included) and its `startTests`, the `reports` that this build counts for that `upstream`, this entry's own `overrides` and `paidService`, and `kept` with `readAt` and `failure` (this build's failure name and message), and no top-level `failure`. It keeps a record only when the deployed file's `plugins` list names the entry's id exactly once, that record has the same `repoUrl`, has an `upstream`, and passes the record schema, and its `readAt` is at most 7 days (7 × 86,400,000 ms) before this build's `generatedAt` and not after it. `readAt` is the deployed record's `kept.readAt`, or the deployed file's `generatedAt` for a record with no `kept`. `test/build.test.ts` covers a kept record for `not-read`, for `request-failed`, and for a 5xx failure, a `readAt` of exactly 7 days, and a second keep that holds the first `readAt`.
- [ ] AC2: In each of these cases the entry gets the record that the build writes today, with `failure` and no `upstream`: a failure that is not build-level; a deployed record with no `upstream`, with another `repoUrl`, that the record schema rejects, or whose id the deployed list names twice; a `readAt` more than 7 days before `generatedAt`, after it, or that `Date.parse` does not read; and a build with no `--previous`. A failed read of the deployed data (a non-200 answer, a body over 16 MiB, a read past 60 seconds, a body that is not JSON, no `plugins` list, or a `generatedAt` that does not parse) keeps nothing, prints one `::warning::` line that names the cause, and does not change the exit status. A build with no build-level failure does not read the deployed data. `test/build.test.ts` covers each case.
- [ ] AC3: A kept record counts as a failure for both deploy bars: `pnpm build` exits 1 when build-level records, kept or not, are more than half of all records, and when every record is kept or has a failure. The log prints one line for each kept record with its id, failure name, and message on one line, and the count of kept records. `test/build.test.ts` covers both bars and the lines.
- [ ] AC4: A kept record gets no start plan item. `pnpm add-start-results` leaves a kept record's `startTests` as the build wrote them, and still replaces the `startTests` of a record with no `kept`. `pnpm carry-start-results` carries no result from a deployed record that has `kept`. The tests of these three commands cover each case.
- [ ] AC5: `schemas/plugins.v1.schema.json` accepts a record with `upstream` and `kept`, refuses a record with `kept` and `failure`, and refuses `kept` with no `upstream`, and its version stays 1, as D-006 and D-007 allow for a new optional field. The schema's descriptions of `upstream`, `startTests`, and `kept`, README's "Using the data" and "Building the data", the `pnpm build` usage line, and CHANGELOG.md describe the field and the `--previous` option. A test checks the three schema cases.
- [ ] AC6: A kept record's home row is the row that the same record with no `kept` builds, plus an "Older data" badge after the name where "Archived" sits, and a test compares the two rows' HTML. The home legend names the badge. The plugin page says that the last build could not read the plugin, gives the failure, and names the UTC day of `readAt`. The About page says when the index keeps facts and that it keeps them for at most 7 days before the build. The footer reads "The last build ran on <day>." `test/site.test.ts` covers the row, the legend, the plugin page, About, and the footer.
- [ ] AC7: `build.yml`'s `pnpm build` step passes `--previous` with the deployed data's address, its time comment names the read, and `test/workflows.test.ts` checks the step. `pnpm test` and `pnpm check` pass.

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
- [ ] T2: Tests first for AC3. `src/build/cli.ts`: parse `--previous`, update `USAGE`, print the kept lines with `oneLine` and the kept count, count kept records in `failed` and in both bars (cli.ts:70-90), and print the read warning.
- [ ] T3: Tests first for AC4. Guard the `startTests` replacement in `src/start-test/add-results.ts` (around line 139) for kept records, and skip deployed records with `kept` in `carryResults` (`src/start-test/carry.ts`).
- [ ] T4: Tests first for AC5. Add `kept` to `schemas/plugins.v1.schema.json` with the `oneOf` and a dependency on `upstream`, update the `upstream` and `startTests` descriptions, README "Using the data" (near line 62 and the start-result text near lines 505-516) and "Building the data" (near line 1511), and add a CHANGELOG entry.
- [ ] T5: Tests first for AC6. The badge in `site/src/pages/index.astro` beside `data-archived` (line 169), the legend, the plugin page note in `site/src/pages/plugins/[id]/index.astro`, an About section in `site/src/pages/about.astro` (start-result text near lines 73-78 and the "Not read" text near line 168), and the footer in `site/src/layouts/Base.astro` (line 1082; `test/site.test.ts` pins it near line 2016). Add a kept record to the site fixture and to the three id lists (lesson M061). Check the home row and plugin page in the browser pane at 375 px and desktop in both color schemes (lessons M015, M035).
- [ ] T6: Tests first for AC7. `.github/workflows/build.yml`: pass `--previous https://jmgirard.github.io/zotero-plugin-index/v1/plugins.json` to `pnpm build`, and update the time comment (lines 21-28) for the 60-second read. Update `test/workflows.test.ts` (the pinned line near 93). DESIGN.md's build paragraph and Known issues, and D-066 annotating D-011, D-012, D-015, D-023, and D-035.
- [ ] T7: Hand checks. Run `buildData` on a saved copy of the deployed data with reads that fail, and check the output against the schema. Then run `build.yml` on the branch, which cannot deploy, and record the build step's time, its kept count, and that the data passes the schema (lesson M087 on reading a job's log).

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
