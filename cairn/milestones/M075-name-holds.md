# M075: Hold name matches only on evidence of copying

- **Status:** in-progress
- **Priority:** normal
- **Depends on:** —
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — the rule decides which plugins reach the public index
- **Branch/PR:** m075-name-holds

## Goal

A name match holds a bot pull request only for shared code or a far larger, older namesake.

## Scope

**In:** The `name-match` reason in `src/discover/holds.ts`, the reads in `src/discover/discover.ts` that feed it, the text and detail lines in `src/discover/propose.ts`, the schema in `src/discover/handoff.ts`, and `pnpm refresh-holds`. Docs and D-045.

The matched-entry search stays as it is. For each matched entry, the bot reads two tests:

- The shared-code test holds in either of two cases. The two default branches have the same first commit. Or identical files are at least 30% of either repo's counted files. A counted file is a file at the head of the default branch, outside a fixed list of boilerplate paths in `holds.ts`. Two files are identical if their git blob SHAs are equal.
- The namesake test holds if all three facts are true. The entry's repo was created before the new repo. The entry's repo has at least 20 stars. The entry's repo has at least 10 times the new repo's stars.

An entry is unread if any fact that its tests need is not read. A failed request, a missing or malformed field, a tree that GitHub truncated, and a read cut by a time limit each make an entry unread. So does an entry whose `repoUrl` is not on github.com. The bot reads only the entries that `holdDetails` names, and every other matched entry counts as unread.

`name-match` holds if a matched entry passes a test or is unread. The reason keeps its name, so existing Hold lines still parse.

**Out:**
- The owner on home page rows: M076.
- Release of the open held pull requests: a hand step after the merge (T6), as in M074, and not a criterion.
- Name matching itself (`nameKey`, homoglyphs, names in open pull requests): stays in candidate "Close gaps in bot holds and merges".
- Two repos with one add-on id, which `entry-exists` refuses: candidate "Review repeats of a listed add-on id".
- A copy listed before its original, and a compare of XPI files: candidate "Flag copies listed before the original".
- The old `HOLD_TEXT` sentence in bodies of pull requests that are already open: `pnpm refresh-holds` changes only detail lines, as M073 chose.

## Acceptance criteria

- [ ] AC1: `holdReasons` gives `name-match` for a repo with a matched entry if the entry passes the shared-code test or the namesake test, or is unread. With no such entry, it gives no `name-match`. Tests in `test/holds.test.ts` show held and not-held cases at each bound: 30% and just under, measured on each repo's side; 20 stars and 19; 10 times and just under; created earlier, the same time, and later. A second-of-two-entries case and a case with facts split across two entries show that the tests read one entry at a time. Other cases cover a shared first commit, a boilerplate path, a blob repeated within one repo, and a repo with 0 counted files, whose share is 0.
- [ ] AC2: Each cause of an unread entry in Scope gives `name-match` through `draftEntry`. Tests cover each cause on each read: the entry's meta, commits, and tree, and the new repo's commits and tree. Each case has a second, read entry that passes no test. A malformed `repoCreatedAt` or missing `stars` on the new repo also gives `name-match`. A matched entry beyond those that `holdDetails` names also gives `name-match`.
- [ ] AC3: Through `draftEntry`, a repo with a matched entry that passes no test gets no `name-match`. With a clean owner, host, and topic, it gets `holds: []`. A repo with no matched entry, or matched only by an entry of its own owner, sends no request for these tests, shown by a fetch stand-in that records requests.
- [ ] AC4: A bot pull request body with `name-match` states both tests and the unread rule, with the numbers 30%, 20, and 10 times. Its detail lines give the new repo's created day and stars once. For each named entry, they give its created day, stars, whether the first commit is shared, and the larger identical-file share. A fact not read prints as not read. A test takes such an entry from `draftEntry` through handoff schema validation to the body.
- [ ] AC5: `pnpm refresh-holds` writes these same detail lines to a held pull request. A read that fails for these facts prints as not read and does not count the pull request as failed. It changes no Hold line and no label. It sends no request for these facts for a pull request held without `name-match`. A test in `test/refresh-holds.test.ts` shows each of these.
- [ ] AC6: README's `name-match` item and its detail-line item, and DESIGN's hold rule, state the tests and the unread rule. CHANGELOG's Unreleased section has an entry for the rule.
- [ ] AC7: The `verify` slot of `cairn/PROFILE.md` runs clean.

## Coverage

- AC1 → T1
- AC2 → T2
- AC3 → T2
- AC4 → T3
- AC5 → T4
- AC6 → T5
- AC7 → T5

## Tasks

- [x] T1: In `holds.ts`, add the boilerplate list and pure functions for the two tests, and add the evidence to `HoldFacts`. Keep `holdReasons` synchronous. Export `matchedEntries`. Add a github.com flag to `IndexedName` in `indexed()`.
- [x] T2: In `discover.ts`, read the evidence after `ownerCreatedAt` and before `holdReasons`. Read the new repo's first commit and tree once, and each entry's meta, first commit, and tree. Parse `rel="last"` from `github.get`'s `link` for the first commit. Encode owner and repo. Apply a time limit that a test can set. Update existing name-match fixtures and exact-line fixtures in `test/propose.test.ts` and `test/refresh-holds.test.ts`, since they would otherwise pass as unread.
- [x] T3: Add the new `HoldDetails` fields with bounds to `holds.ts` and `handoff.ts`. Write `HOLD_TEXT` and `holdDetailLines` in `propose.ts`.
- [x] T4: Make `refresh-holds.ts` read the evidence and pass it to `holdDetails`.
- [x] T5: Update README, DESIGN, and CHANGELOG. Run the `verify` slot.
- [ ] T6: After the merge, run `pnpm refresh-holds --apply`. Then release each open pull request whose only hold is `name-match` and whose refreshed facts pass no test and show no unread entry and no `moreMatches` count. Set `Hold: none` with `UNHELD_TEXT`, and remove the detail lines and the `hold` label. Read each one first and read it back. The user granted this at the question set.

## Work log

- 2026-11-02: created by /milestone-plan.
- 2026-11-02: tier check: milestone — it changes a hold rule that D-033 records and needs a design decision.
- 2026-11-02: idea vet: flaw: an identical-file test misses a copy that edits every file and reads the repo, not the XPI; the user chose this rule at the question set knowing both. gap: `name-match` now means more than a match; reading taken: keep the name, so Hold lines parse. No fitting reading gives other user-visible behavior.
- 2026-11-02: question set: which rule holds a name match — shared code or a big namesake. Release open pull requests that the rule would not hold — yes.
- 2026-11-02: question set: the user asked whether a fork can be told automatically. On 41 held pairs, GitHub's fork flag was false on all, 2 pairs shared a first commit (39% and 69% identical files), and the next highest share was 14%, read 2026-11-02.
- 2026-11-02: plan gate chose both tests over shared code only, because a plugin written from scratch under a popular name shares no files; falsified by namesake holds that a maintainer always releases.
- 2026-11-02: plan gate chose evidence over first-in order, because in 22 of 40 read pairs the held repo was older; falsified by copies merging under the new rule that a maintainer closes or removes.
- 2026-11-02: split: M075 covers the rule, M076 covers the owner on home rows; the user gave no preference on the owner, so the agent took the recommendation.
- 2026-11-02: collision: D-033 holds every name match; D-045 annotates it. Candidate "Close gaps in bot holds and merges" stays, cross-referenced in Out. Inbox: 0 open issues; 36 open bot pull requests overlap, handled by T6.
- 2026-11-02: lessons used: 2026-10-25 (M001), 2026-10-31 (M070), 2026-11-02 (M074).
- 2026-11-02: criteria audit (full), two passes. First pass ran on the star-only draft; its findings on handoff validation, draft wiring, refresh-holds, non-GitHub entries, read limits, and test axes are taken. Second pass, committed after e38c8aa by the stop hook's order, gave 6 findings on AC1, AC2, AC3, AC5, AC6, and T2/T6; all taken in this amendment. The derived fact `holds: []` narrowed to its clean case.
- 2026-11-02: T1, T2: `matchEvidence` in `holds.ts` does the reads, since `ownerCreatedAt` already reads there; `draftEntry` calls it. An identical-file share rounds down to a whole percent, so the bound compares what the body prints.
- 2026-11-02: T3 to T5: `pluginRepo` sends no `stargazers_count` unless a test sets it, since `test/build.test.ts` compares build output with a fixed file; such a test's name match reads as unread. `pnpm test` 1891 passed, `pnpm check` 0 problems. The other README and CHANGELOG lines that the writing hook flags were there before this milestone and stay.
- 2026-11-02: read-only run of `pnpm refresh-holds` on the 36 open name-match pull requests: no fact unread; the rule keeps 7 held (#238, #289, #485, #545, #552, #555, #592) and leaves 29, as the plan measured.

## Decisions

## Review
