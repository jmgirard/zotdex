<!-- Section ownership + write-modes: see tracking-rules.md "Milestone-file
     section ownership". A phase skill never rewrites another phase's section.
     Per-section owners are tagged below. The one size check that can fail is
     cairn_validate's <150 over the plan-owned body. -->
# M085: Let an older, larger repo ask for a listed add-on id

- **Status:** in-progress   <!-- owner: transitioning skill · mirror-update; cairn/ROADMAP.md is the authority -->
- **Priority:** high   <!-- owner: plan · create/amend-via-gate; high | normal | low -->
- **Depends on:** —   <!-- owner: plan · create/amend-via-gate; M<xx>, M<yy> or — -->
- **Driving RR:** —   <!-- owner: plan · create/amend-via-gate; RR<NN> whose Binding criteria bind this milestone's ACs (binding-criteria check), or — -->
- **Principles touched:** —   <!-- owner: plan · create/amend-via-gate; comma-separated IPn/GPn ids this milestone touches, or — -->
- **Resolves:** —   <!-- owner: plan · create/amend-via-gate; comma-separated GitHub issues the scope absorbs, each `#N closes` (the PR closes it at merge) or `#N partial` (the remainder gets a candidate row), or — ; skill conduct only — no validate check parses it -->
- **Surface tier:** user-facing — it changes the published entries and the bot's pull requests   <!-- owner: plan · create/amend-via-gate; user-facing | internal — <one-clause reason>; skill conduct only — no validate check parses it -->
- **Branch/PR:** m085-repeat-id-replace   <!-- owner: implement (branch) / review (PR URL) · create; a companion checkout the milestone also works in is one further entry per checkout, `companion: <abs-path> <branch>` (implement), its PR URL appended by review — /milestone-review merges companions first, in listed order -->

## Goal
<!-- owner: plan · create; a wrong goal returns to plan, never edited in place -->

When a repo older and far larger than the repo that lists its add-on id appears, the bot asks the maintainer through a held pull request, and the entries for pdf2zh and Beaver move to their larger repos now.

## Scope
<!-- owner: plan · create/amend-via-gate -->

**In:** a new hold reason `replaces-entry`; a bot pull request that changes only the entry's `meta.json` and shows the facts a maintainer needs; moving `pdf2zh@guaguastandup.com` and `beaver@jlegewie.com` to `guaguastandup/zotero-pdf2zh` and `jlegewie/beaver-zotero`, with a paid-service reading of each; a ledger of the repeated ids that the discover logs show; the docs and the decision entry.

**Out:**
- `zoteroshortdoi@wiernik.org` and `zoteropreview@carter-tod.com` stay as listed, by the maintainer's choice. The bot can open a held pull request for each later, and closing it ends that.
- Repeated ids that fail the test, such as 9 stars against 0, stay refused. Case-variant ids and issue runs also stay refused, and an id that an open pull request adds stays refused until a later run. These go to the row "Flag copies listed before the original" when post-merge hygiene narrows it, beside its point that the file compare reads the repo and not the XPI.
- No automatic replacement, and no merge of a `replaces-entry` pull request by the bot.
- This session starts no build. The site changes at the next daily build, by the maintainer's choice.

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

- [ ] AC1: In a run that is not an issue run, when `draftEntry` reads a repo whose add-on id exactly equals the id of an entry listed from another github.com repo, no open bot pull request adds that id, and the read repo was made before the listed repo, has at least 20 stars, and has at least 10 times the listed repo's stars, `draftEntry` returns a drafted entry whose holds include `replaces-entry`, in place of the `entry-exists` refusal. Tests in `test/discover.test.ts` show this at exactly 20 stars against 2. They show the unchanged `entry-exists` refusal for a repo made later, 19 stars, 9 times the stars, a case-variant id, an id that an open pull request adds, an issue run, a listed repo off github.com, and an unread value of the read repo's stars, the listed repo's stars, or the listed repo's date.
- [ ] AC2: The bot pull request for a drafted entry with the reason `replaces-entry` changes only that entry's `meta.json`, and its head keeps the base branch's `index.json`. `pnpm check` passes on the entry as the pull request's head holds it. The body names the hold reason and the listed repo. For both repos it gives the stars, the date the repo was made, and the date of the newest stable release, with "not read" for a value the bot could not read and "none" for a repo with no stable release. It also names each override and `paidService` value that the kept `index.json` holds. Tests in `test/propose.test.ts` and `test/holds.test.ts` show this.
- [ ] AC3: `pnpm merge-discover` does not merge a bot pull request held for `replaces-entry`. `pnpm refresh-holds` keeps that reason and rewrites its detail lines on a pull request with the `hold` label whose one changed file is a modified `meta.json`, with `replaces-entry` alone and combined with another reason on the `Hold:` line. Tests in `test/merge.test.ts` and `test/refresh-holds.test.ts` show this.
- [ ] AC4: The bot proposes no second pull request for a replacing repo that has an open bot pull request or a bot pull request closed without a merge, as for any other repo. A test in `test/propose.test.ts` shows both.
- [ ] AC5: `plugins/pdf2zh@guaguastandup.com/meta.json` and `plugins/beaver@jlegewie.com/meta.json` name `https://github.com/guaguastandup/zotero-pdf2zh` and `https://github.com/jlegewie/beaver-zotero` as `repoUrl`. Each `meta.json` equals what `pnpm add-plugin --out <empty dir>` writes from a read of that repo on a date and commit that the ledger of AC6 records. `pnpm check` passes. `cairn/references/paid-service-sweep.md` and `paid-service-sweep-shas.tsv` hold a reading of each of the two repos, naming the repo and commit. Each `index.json` has `paidService` exactly when that reading says so by the rule of D-054.
- [ ] AC6: `cairn/references/repeat-id-ledger.md` lists each distinct pair of refused repo and add-on id found by a search of the `entry-exists` messages in the logs of the discover runs that GitHub holds on the date of the read. For each pair it gives both repos' stars and dates made, with "not read" for a repo that cannot be read, whether the pair passes AC1's test, and the maintainer's choice for each pair that passes. It names the date of the read and the runs searched, and it has a line in `cairn/references/INDEX.md`.
- [ ] AC7: `README.md` and `cairn/DESIGN.md` state the new hold reason where they state the other hold reasons, and DESIGN's statements that a repeated id is always refused are corrected. `CHANGELOG.md`'s `## Unreleased` has one entry for the change. `cairn/DECISIONS.md` has an entry that records the choice, annotates D-033, D-045, and D-053, and states the maintainer's question for such a pull request: the listed repo stays when it credits the larger repo and has a newer release, and otherwise the pull request merges.
- [ ] AC8: `pnpm test` and `pnpm check` pass (the `verify` slot of `cairn/PROFILE.md`).

## Coverage
<!-- owner: plan · create/amend-via-gate; each acceptance criterion → the
     task(s) satisfying it, by positional number (AC/Task counted
     top-to-bottom). Review reads to fence evidence — tracking-rules "AC fencing". -->

- AC1 → T1
- AC2 → T2
- AC3 → T3
- AC4 → T2
- AC5 → T4
- AC6 → T5
- AC7 → T6
- AC8 → T7

## Tasks
<!-- owner: plan (create) / implement (check-off, minor edits); substantive
     change is amend-via-gate. Every item opens with its positional label —
     `Tn:` — the item's position counted top-to-bottom, the number Coverage
     cites; an insertion, removal, or reorder renumbers the labels and the
     Coverage lines together. -->

- [x] T1: Add `replaces-entry` to `HOLD_REASONS` and `HOLD_TEXT`, and the test beside the namesake numbers in `src/discover/holds.ts`. In `draftEntry` (`src/discover/discover.ts:345`), read the listed repo's facts when an exact id repeats, and draft or refuse by AC1. The read needs each entry's id and repo, which `IndexedName` may not hold yet. Write the tests first. A test repo needs `stars` and dates, or it reads as unread (LESSONS M075).
- [x] T2: In `src/discover/propose.ts` (near lines 174, 429, and 434), let a `replaces-entry` entry pass the existing-entry skip, write only `meta.json`, and run `pnpm check` on the entry as the head holds it. Add the release dates and the kept `index.json` values to the hold details and body (near lines 564 to 577). Keep `botPulls` (line 208) as the skip source, and test AC4 at `test/propose.test.ts` near line 906.
- [x] T3: Let `src/discover/refresh-holds.ts` (lines 80 to 95) accept a pull request with one modified `meta.json`, and add the tests of AC3. `merge.ts:70` already refuses any `Hold:` line other than `none`, so its test pins that for the new reason.
- [x] T4: Run `pnpm add-plugin --out <empty dir>` for the two repos, copy each `meta.json` over the entry, read each repo for a paid service by D-054, and update the sweep page and its tsv, whose lines name the two forks.
- [x] T5: Write the ledger from the logs of the discover runs that GitHub holds, and add its `INDEX.md` line.
- [x] T6: Update `README.md` (hold reasons near lines 801 to 846), `cairn/DESIGN.md` (hold reasons, and the refusal statements near lines 705 and 758), and `CHANGELOG.md`, and append the decision entry.
- [ ] T7: Run `pnpm test` and `pnpm check` through `npx -y pnpm@12.15.0`, sending the test output to a file and reading its exit code (LESSONS M082).

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

- 2026-11-03: created by /milestone-plan from the rows "Flag copies listed before the original" and "Review repeats of a listed add-on id".
- 2026-11-03: tier check: milestone — new bot behavior and a design choice about who holds an id, not a bug fix that restores documented behavior.
- 2026-11-03: idea vet: gap, the numbers cannot prove which repo is the original, since 2 of the 4 passing pairs are credited continuations; reading taken: a held pull request that a maintainer decides, never a replacement by the bot. gap, "copy" misnames a continuation; reading taken: the code and docs say "listed repo" and "replacing repo". No flaw found.
- 2026-11-03: lessons used: 2026-10-25 (M001), 2026-11-02 (M075), 2026-11-02 (M082, `pnpm test` stops at `tsc`).
- 2026-11-03: collision: D-033, D-045, and D-053 are extended, and AC7's entry annotates them; D-002 keeps one entry per id; M056 and M075 shipped the holds this builds on; no planned or live milestone overlaps.
- 2026-11-03: inbox sweep: 0 open issues and 0 open pull requests, so nothing overlaps.
- 2026-11-03: criteria audit (full mode): an Opus reader returned findings on each of the 8 criteria; all fixed in the wording above. AC1 narrowed to exact ids and non-issue runs and gained the open pull request condition, boundary case, and unread cases. AC2 now checks the head's entry, defines "not read" and "none", and names kept `index.json` values. AC3 names the modified-file shape. AC4 moved to `test/propose.test.ts` and "closed without a merge". AC5 reads through `--out` and ties `paidService` to the reading. AC6 gains the read date and "not read". AC7 gains README, DESIGN's refusal statements, and the maintainer's question. AC8 names both verify commands.
- 2026-11-03: plan gate chose a held replace pull request over a report warning and over no bot change, because a pull request is what the maintainer reads and closing it already ends a proposal; falsified by held replace pull requests that the maintainer closes nearly every time.
- 2026-11-03: plan chose D-045's namesake numbers (20 stars, 10 times, older) over a new threshold, because they sort the 19 pairs read into 4 worth a look, and a false pass costs one closed pull request; falsified by a listed repo that hides a far larger original below these numbers.
- 2026-11-03: question set: which entries move now — `pdf2zh@guaguastandup.com` and `beaver@jlegewie.com` only.
- 2026-11-03: question set: start `Build data` after the merge — no, wait for the daily build.
- 2026-11-03: kept one milestone over the 8-criteria split tripwire, because the 8th is the verify run and the rest ship as one change.
- 2026-11-03: T1 to T3 landed in one commit, since the reason, the pull request, and the refresh share one type; full suite green.
- 2026-11-03: chose the pull request title and commit `Move <id> to <repo>`, and a `noListed` detail for a refresh when no entry lists the id now; also made the ids of a run's handoff count as pending, so only one repo of a run replaces an entry.
- 2026-11-03: T4 moved both entries; each `meta.json` is byte-equal to `pnpm add-plugin --out` output; both READMEs read for a paid service, no mark; the sweep's other 734 tsv lines are unchanged.
- 2026-11-03: correction to the line above: the tsv has 695 entry lines, so the other 693 are unchanged.
- 2026-11-03: T5 and T6 wrote the ledger from all 30 discover runs, the docs, the changelog entry, and D-056; D-056 gives D-053's merge default its exception for `replaces-entry`.

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
