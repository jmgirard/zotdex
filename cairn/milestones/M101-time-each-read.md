<!-- Section ownership + write-modes: see tracking-rules.md "Milestone-file
     section ownership". A phase skill never rewrites another phase's section.
     Per-section owners are tagged below. The one size check that can fail is
     cairn_validate's <150 over the plan-owned body. -->
# M101: Time each plugin read in the build log

- **Status:** in-progress   <!-- owner: transitioning skill · mirror-update; cairn/ROADMAP.md is the authority -->
- **Priority:** normal   <!-- owner: plan · create/amend-via-gate; high | normal | low -->
- **Depends on:** —   <!-- owner: plan · create/amend-via-gate; M<xx>, M<yy> or — -->
- **Driving RR:** —   <!-- owner: plan · create/amend-via-gate; RR<NN> whose Binding criteria bind this milestone's ACs (binding-criteria check), or — -->
- **Principles touched:** —   <!-- owner: plan · create/amend-via-gate; comma-separated IPn/GPn ids this milestone touches, or — -->
- **Resolves:** —   <!-- owner: plan · create/amend-via-gate; comma-separated GitHub issues the scope absorbs, each `#N closes` (the PR closes it at merge) or `#N partial` (the remainder gets a candidate row), or — ; skill conduct only — no validate check parses it -->
- **Surface tier:** internal — lines in the build log that the maintainer reads; the data and the site do not change   <!-- owner: plan · create/amend-via-gate; user-facing | internal — <one-clause reason>; skill conduct only — no validate check parses it -->
- **Branch/PR:** m101-time-each-read   <!-- owner: implement (branch) / review (PR URL) · create; a companion checkout the milestone also works in is one further entry per checkout, `companion: <abs-path> <branch>` (implement), its PR URL appended by review — /milestone-review merges companions first, in listed order -->

## Goal
<!-- owner: plan · create; a wrong goal returns to plan, never edited in place -->

Each build log shows how long the plugin reads took, by result and for the slowest reads, so a cut build shows where its time went.

## Scope
<!-- owner: plan · create/amend-via-gate -->

**In:** `buildData` times each plugin read it starts and the whole read phase, outside the data; `pnpm build` prints a total line, one line for each result, and up to the 10 slowest reads; README "Building the data" and CHANGELOG describe them.

**Out:** a retry of 5xx or 429 download answers, and any change to what the build reads, its limits, or its pace → parked row "Retry build reads GitHub refuses", to be planned from these numbers. Timing each request inside a read → no row; the slowest reads name the plugins to look at.

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

- [ ] AC1: `buildData` returns, outside the data, one timing for each plugin read that it started, in id order: the entry id, the milliseconds from the read's start to the end of `readRecord`, and the failure name that `readRecord` returned, or `read`. An entry that the time limit left `not-read` gets no timing. It also returns the milliseconds from the start of the first plugin read to the end of the last, absent when no read starts. `test/build.test.ts` covers a read that a stalled answer holds past a set `readMs`, whose timing is at least `readMs` − 1 and names `request-failed`, and a `not-read` entry with no timing, and its existing test "writes the same file as before the build-level rule" passes unchanged.
- [ ] AC2: `pnpm build` prints the timing lines just before the line of the first failed record, or where that line would be: `plugin reads took <s> s`, then `<result>: <n> reads, <s> s in all` for each result in code-unit order, then up to the 10 slowest reads, slowest first and ties in id order, as `slow read: <id>: <s> s (<result>)`. `<s>` is seconds with one decimal, and a line break in an id becomes a space. A build that starts no plugin read prints none of these lines. A test of the exported function that formats the lines covers the order, the form, the 10-read cap, ties, and the line break, and one `pnpm build` test covers where the lines sit.
- [ ] AC3: README's "Building the data" describes these lines, and CHANGELOG's Unreleased section names them. `pnpm test` and `pnpm check` pass.

## Coverage
<!-- owner: plan · create/amend-via-gate; each acceptance criterion → the
     task(s) satisfying it, by positional number (AC/Task counted
     top-to-bottom). Review reads to fence evidence — tracking-rules "AC fencing". -->

- AC1 → T1
- AC2 → T2
- AC3 → T3, T4

## Tasks
<!-- owner: plan (create) / implement (check-off, minor edits); substantive
     change is amend-via-gate. Every item opens with its positional label —
     `Tn:` — the item's position counted top-to-bottom, the number Coverage
     cites; an insertion, removal, or reorder renumbers the labels and the
     Coverage lines together. -->

- [x] T1: Tests first in `test/build.test.ts` for AC1. In `readEntries` (`src/build/build.ts`, near line 232) take `performance.now()` around `readRecord`, and keep the first start and last end; add `timings` and `readMs` to `BuildResult`. The result name comes from `readRecord`, before the `facts-invalid` check and the keep step.
- [x] T2: Tests first for AC2. Export a formatting function (in `src/build/timing.ts` or `cli.ts`) and call it in `src/build/cli.ts` before the failed-record lines, through `oneLine`.
- [ ] T3: README "Building the data" (the paragraph on what the command prints) and a CHANGELOG entry.
- [ ] T4: Run `build.yml` on the branch, which cannot deploy, and record the new lines' totals from its build log.

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

- 2026-11-05: created by /milestone-plan from the parked row "Retry build reads GitHub refuses", rerun after the first pass stopped on a flaw.
- 2026-11-05: tier check: milestone — new build-log output and a new `buildData` result field.
- 2026-11-05: idea vet: flaw: retrying 5xx answers does not stop a cut build, since the builds of 2026-11-05 left 217 and 441 plugins unread against 17 and 60 failed reads, and slow 504s may have used the time; the question set chose to time each read first and plan any retry from the numbers.
- 2026-11-05: lessons used: 2026-11-02 (M075), 2026-11-03 (M087), 2026-11-02 (M082).
- 2026-11-05: question set: build runs — run `build.yml` on the branch before the merge question and on main after the merge, which deploys — granted.
- 2026-11-05: plan gate chose timing first over a one-time 5xx retry because the logs cannot show whether a retry would help or lengthen a cut build; falsified by a timed build log that shows 504 answers return in under a second.
- 2026-11-05: plan gate chose the timing lines before the failed-record lines over after `build-level failures` because the tests' `summary` slice and last-line checks then stay exact; falsified by a test that reads the lines between `failed with` and `build-level failures` and meets a timing line.
- 2026-11-05: criteria audit (reduced) by a fresh Opus reader: 8 findings, all applied: the unchanged-file test in place of "with and without the timings", the result name from `readRecord`, `readMs` − 1 for an early timer, no total when no read starts, id order, the lines placed outside the `summary` slice, a formatting function tested apart for the cap, a line break as a space, and ties in id order.

- 2026-11-05: T1 done: `readEntries` times `readRecord` with `performance.now()` and keeps the first start and last end; `BuildResult` gains `timings` (`ReadTiming` in the new `src/build/timing.ts`) and `readsMs`. 2 new tests; the fixed-file test passes unchanged. The stall test uses `readMs: 3000`, since 300 ms also cut the Better Notes read.
- 2026-11-05: T2 done: `timingLines` in `src/build/timing.ts`, printed in `src/build/cli.ts` just before the failed-record lines; `test/timing.test.ts` (4 tests) and one `pnpm build` placement test. Minor: the 64 KiB stdout test now compares the two runs without the timing lines and checks their count (12), since the seconds differ between runs.
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
