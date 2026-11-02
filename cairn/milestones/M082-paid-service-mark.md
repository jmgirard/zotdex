# M082: Mark plugins that need a paid service

- **Status:** review
- **Priority:** normal
- **Depends on:** —
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — the data file and the site show a new fact to visitors and data consumers
- **Branch/PR:** m082-paid-service-mark

## Goal

Show on the site when a plugin's main use needs a paid service from its maker, as a fact read by hand with its source, with no change to who is listed.

## Scope

**In:** an optional `paidService` field in `index.json` (`note`, `source`, `read`), which the build copies to the data. A credit card mark on the home row and in the plugin page's h1, a Details fact, a home legend line, and an About section. One read by hand of the entries at a named commit, with its record in `cairn/references/paid-service-sweep.md`, and the field written on each entry that the read marks.

**Out:** a mark for a plugin with a lasting free plan and a paid upgrade, or for one that also works with a third party's key (rejected, D-054). Reading plugins added after the read's commit (candidate row "Read new plugins for paid services"). A command that lists them (same row). A filter on this fact (no row; no one asked). Detecting the fact by a bot, holding, or refusing such a plugin (rejected, D-054).

## Acceptance criteria

- [x] AC1: `schemas/index.v1.schema.json` gains an optional `paidService` object with exactly three required strings: `note` (1 to 160 characters, at least one of them not whitespace), `source` (matches `^https://\S+$`), and `read` (matches `^\d{4}-\d{2}-\d{2}$`). `pnpm check` accepts an entry with a valid object. Tests in `test/check.test.ts` show that it refuses each of these, naming the failing property: a missing `note`, `source`, or `read`, an empty `note`, a blank `note`, a `note` of 161 characters, a `source` that starts with `http://`, a `read` of `2026-11`, and an extra property.
- [x] AC2: `pnpm build` writes an entry's `paidService` unchanged on its record in `v1/plugins.json`, on a record with `upstream` and on each of a read failure, a `not-read` record, and a `facts-invalid` record, and writes no such field for an entry without one. `schemas/plugins.v1.schema.json` defines the field as optional with the shape of AC1. `pnpm add-start-results` keeps the field. Tests in `test/build.test.ts` and the add-start-results tests assert each of these.
- [x] AC3: A record with `paidService`, with `upstream` or with `failure`, shows a credit card mark beside its name on the home row and in the plugin page's h1, with one hidden text for screen readers that reads "Needs a paid service from its maker", and a record without the field shows no mark. The mark sits outside `[data-name]` and `[data-description]`, so the search box does not read its words. The home legend's line for the mark reads the same words. Tests in `test/site.test.ts` assert the mark, its absence, its place outside those elements, and the legend line, and a browser pane check at 375 and 1280 px finds no page wider than the viewport on the home page and on one marked plugin page.
- [x] AC4: A marked plugin page's Details card holds the fact "Needs a paid service from its maker" with the `note`, a link to the `source`, and the `read` date, on a record with `upstream` and on a record with `failure`; a page without the field holds no such fact. Tests in `test/site.test.ts` assert each.
- [x] AC5: The About page says that the mark means the plugin's main use stops without paying its maker, or stops after a trial, whether the payment is for credits, a membership, an activation code, or a paid plan. It also says that a lasting free plan with a paid upgrade, a plugin that also works with a third party's key, and a donation get no mark, that a maintainer reads this by hand, that a plugin with no mark can still cost money, that a marked plugin stays listed, and that an author can open an issue to correct it. The About and home page intros say that a maintainer reads the paid service fact by hand and the build reads the others. README and CHANGELOG describe the field, and each says to fetch any saved copy of `schemas/plugins.v1.schema.json` again. A site test asserts the About sentences and the intros; the README and CHANGELOG text is read at review against the code.
- [x] AC6: `cairn/references/paid-service-sweep.md` names the word list and its matching rule, the list including Chinese terms such as 付费, 会员, 积分, and 激活码, the texts read (the descriptions in a named `plugins.json`, by its `generatedAt`, and each top-level file whose name starts with README, ignoring case, at a recorded default-branch SHA of each repo), the read date, and the commit whose `plugins/` entries it covers. It lists each entry with a hit with a verdict and a one-clause reason, and each entry where a text could not be read, naming the text. A re-run of the word list over those READMEs and that `plugins.json` reports no hit that the file does not list. The entries it marks are exactly the entries with `paidService` at the branch head, compared by a one-time script at review. For each marked entry, `source` answers HTTP 200 to a script or, where a script is blocked, loads in the browser pane, and a review read finds that the page states what `note` says and that this meets AC5's meaning.
- [x] AC7: `git diff --name-status main...HEAD -- plugins/` lists only `M` lines on `index.json` files, each differing from main only by an added `paidService`, compared by a one-time script at review, and `git diff --stat main...HEAD -- src/discover/` is empty. `pnpm test` and `pnpm check` pass at the branch head.

## Coverage

- AC1 → T1
- AC2 → T2
- AC3 → T3
- AC4 → T3
- AC5 → T5
- AC6 → T4
- AC7 → T4, T5

## Tasks

- [x] T1: Add `paidService` to `schemas/index.v1.schema.json`, with tests in `test/check.test.ts` for each refusal that AC1 names. `src/text-request/request.ts:154` already keeps other fields of `index.json`; confirm that with a test only if the change could break it.
- [x] T2: Add the field to `PluginRecord`, `readEntry`, and every record path in `src/build/build.ts` (lines 215, 222, 229, and the map at 241), and to `schemas/plugins.v1.schema.json`. Confirm that `pnpm add-start-results` keeps it, with tests.
- [x] T3: Add a credit card icon to `Icon.astro` and a `PaidServiceMark.astro` beside `NoSourceMark.astro`. Show it on the home row and in the h1, add the legend line and the Details fact (linked through `safeHref`), and add the field to two fixture records by text edit.
- [x] T4: Read the entries at a named commit by AC6's procedure, using login and account words as well as payment words. Write `cairn/references/paid-service-sweep.md` with its Provenance block and `INDEX.md` line, and write `paidService` on each entry that the read marks, with an English `note` that says what is paid. An entry in `plugins/` that the named `plugins.json` lacks is listed as not read for that text. Check 375 and 1280 px in the browser pane, with a site built from the deployed data and the new marks. At review, a reader re-reads 20 random verdicts of no mark, and a wrong one is a finding.
- [x] T5: Write the About section and the intro sentences with site tests, then the README, the changelog entry, and DESIGN's Contract boundary, Data sources, Inclusion bar, and Function Families text. Run `pnpm test` and `pnpm check`.

## Work log

- 2026-11-02: created by /milestone-plan from candidate row "Mark plugins that sell a paid service"; the title says "need" after the question set's answer.
- 2026-11-02: tier check: milestone — a new user-visible fact with a schema field and a design choice.
- 2026-11-02: idea vet: gap, the request says "sell" and the row says "needs", and the two give different marks: the question set chose required payment only. Gap, a missing mark can read as free: the About page says a plugin with no mark can still cost money. Gap, a hand-read fact goes stale and misses new plugins: each mark names its source and read date, and a low row holds the next read. No flaw.
- 2026-11-02: lessons used: 2026-11-02 (M081) fixture text edits; 2026-11-02 (M075) optional fields in build tests; 2026-10-30 (M061) hand lists of fixture ids; 2026-10-28 (M035) site check from deployed data; 2026-10-31 (M066) a merge deploys nothing.
- 2026-11-02: inbox sweep: 0 open issues and 36 open bot pull requests, none overlapping; each that merges is new-plugin work for the low row.
- 2026-11-02: collision check: the row is absorbed; D-037, D-052, D-006, and D-007 set the pattern for a shown fact and an optional v1 field; no standing rejection. The M081 question set had limited the row to the maker's own paid service.
- 2026-11-02: criteria audit (full mode, fresh Opus reader): 14 findings on the first pass, each fixed in the wording or moved to a task: exact patterns and blank notes in AC1, the three failure paths in AC2, named words and failure records in AC3, the README and the intros in AC5 with DESIGN in T5, a repeatable read with its domain, non-English words, and a blocked-script fallback in AC6, and name-status plus an index diff in AC7. AC4: none.
- 2026-11-02: criteria audit re-run on AC3 to AC6 after the question set's answer (full mode): AC3, AC4 none; the intro wording and the third-party case fixed in AC5; a named `plugins.json` and a matching rule fixed in AC6; the re-read of 20 no verdicts moved from AC6 to T4, as a property of the check, not of the deliverable.
- 2026-11-02: question set: which plugins get the mark — only required payment, over any paid offer (the agent's recommendation), since a mark then says one strong thing; falsified by users who report a paid upgrade that they wanted marked.
- 2026-11-02: question set: new plugins — read by hand later, over a listing command, since no code is added; falsified by marks falling far behind the new plugins.
- 2026-11-02: plan chose a hand-kept field over bot detection because 197 of 671 listed plugins hit a wide word list and most hits read as false in a sample; falsified by a rule that separates them with few errors.
- 2026-11-02: plan chose a record-level optional v1 data field over a list in the site build because the site builds from the data, and marks must show on failure records too; falsified by a data consumer that a schema refetch breaks.
- 2026-11-02: split: all parts stay in M082; re-reading new plugins goes to the candidate row "Read new plugins for paid services".
- 2026-11-02: T1 done: the index schema gains `paidService`, and 11 check tests failed before the schema change and pass after it; `pnpm test` passes with 2155 tests. No test added for `text-request`, since it edits only `overrides` of the parsed file.
- 2026-11-02: T2 done: the build writes `paidService` on read, read-failure, `not-read`, and `facts-invalid` records; `addResults` keeps it through its spread, as a test shows; a test holds the two schemas' shapes equal.
- 2026-11-02: the T2 commit went in with a type error at `src/build/build.ts:268` because a pipe hid the failed test run, so the T2 line above was early; the next commit fixes it and T2 stands only with that commit's test run.
- 2026-11-02: T3 done: the mark, legend line, and Details fact show with tests, and `pnpm test` exits 0 with 2166 tests. Minor amendment: the browser check moved to T4 so that it sees real marks, and two existing fixture records carry the field, so no hand list of fixture ids changes.
- 2026-11-02: T4 done: 695 entries read at `c8f2b65`, 357 with a word hit, 7 marked and 350 not; three fresh Opus readers read the hits, and the session re-read the 7 marks, the 4 unclear cases (all no mark), and the closest no verdicts. `paid-service-sweep-shas.tsv` is the one file a script wrote, since it holds 695 SHAs. A browser check of the home page and two marked pages at 375 and 1280 px found scrollWidth equal to clientWidth on each.
- 2026-11-02: T4 choice: `source` is the README at `blob/HEAD`, over a SHA permalink, so a reader sees the current text; falsified by a maker whose README moves. A `note` states what the page says; where a README names no payment, the entry gets no mark.
- 2026-11-02: T5 done: the About section, both intros, README, changelog, and DESIGN state the fact, with site tests for the About sentences and the intros. The style hook names older text in README and CHANGELOG; this change leaves that text alone, as outside the milestone.
- 2026-11-02: claim audit: 52 claims read, 3 corrected — `plugins/fanyipaiban@fanyipaiban.com/index.json`, `plugins/filetrans@euclpts.com/index.json`, `plugins/zoteromagic@zoterocn.com/index.json`. The Fanyipaiban note's wording changed; `filetrans` now cites the maker's tutorial, which says the code is bought; `zoteromagic` lost its mark because no public page read says what stops after the trial, so 6 entries are marked, not the 7 of the T4 line.
- 2026-11-02: claim audit finding rejected: the reader called "the build reads the others" too broad because categories and overrides are hand-made. AC5 asks for this sentence, categories are not facts (D-037), and the build reads overrides from each entry. A fourth note finding on Equalang's selection translation changes nothing, since document translation is the plugin's main use.
- 2026-11-02: claim audit re-read: the three corrected claims hold; the `filetrans` tutorial and README share one support contact, so the seller reads as the maker. Ready for review: `pnpm test` exits 0 with 2175 tests, and `pnpm check` reports 695 entries and 0 problems.
- 2026-11-02: step-7 approval: m082-paid-service-mark approved for merge

## Decisions

## Review

Evidence read on 2026-11-02 at `401339c`, level with `origin/main`.

- AC1: `test/check.test.ts` has passing tests for a valid object, a note of 160 characters, and refusals of no note, no source, no read, an empty note, a blank note, a note of 161 characters, an http source, a read of `2026-11`, and an extra property, each asserting the property in the message; the 9 refusal tests and the 2 passes ran in a `pnpm exec vitest run --reporter=verbose` listing.
- AC2: `test/build.test.ts` passes for a read record, a read failure, a `not-read` record, a `facts-invalid` record, and an entry without the field; `test/add-start-results.test.ts` shows `addResults` keeping the field; a test holds both schemas' `paidService` shapes equal.
- AC3: the exact name-cell and head tests in `test/site.test.ts` pin the mark, its absence, and its place outside `[data-name]` and `[data-description]` for every fixture record, one with `upstream` and one with `failure` among them; the exact legend test holds the line; a browser pane check of a site built at the head from the deployed data found scrollWidth equal to clientWidth at 375 and 1280 px on the home page, the About page, and two marked plugin pages.
- AC4: `test/site.test.ts` pins the fact's exact text and link on a read record and a failure record, and its absence through the Details list test and a page test; the browser pane showed the fact on `zotero@equalang.com`.
- AC5: site tests assert each About sentence and both intros; a read of the README and CHANGELOG additions against `src/build/build.ts` and the schemas found the field described and the fetch-again sentence in each.
- AC6: a script took the word list from the note, the SHAs from `paid-service-sweep-shas.tsv`, and the descriptions from the shelf's `plugins-data-2026-11-02.json`, read 846 READMEs at those SHAs again, and found 357 hits, all listed, none unlisted, with 6 + 351 verdicts. Its marked set equals the entries with `paidService`. All 6 sources answer HTTP 200. A fresh Opus reader found that each of the 6 pages states its note and meets AC5's meaning, and that 20 of 20 random no verdicts hold (seed 82).
- AC7: the same script found 6 `M` lines on `index.json` files, each differing from main only by `paidService`, and `git diff --stat main...HEAD -- src/discover/` is empty; `pnpm test` exits 0 with 2175 passed and 6 skipped, and `pnpm check` reports 695 entries and 0 problems.
- Consistency gate: `cairn_validate.py` exits 0; the profile names no toolchain checks; no principle changed.

spawned: diff-bug, blame-history, prior-review, ripple

- diff-bug #1: a marked page has two links named "Source" with different targets — fix now, the fact's link now reads "Source of this fact".
- diff-bug #2: DESIGN's site text names `NoSourceMark.astro` and not the new mark — fix now.
- diff-bug #3: weaker mark checks after the exact name-cell test — fix now, test removed.
- diff-bug #4: a count of marks repeats the exact test — fix now, replaced by a test naming the two marked fixture ids, which also shows the domain is not empty.
- diff-bug #5: a weaker h1 check after the exact head test — fix now, removed.
- diff-bug #6: absence checks that repeat the exact tests — fix now, reduced to one check of the words.
- diff-bug #7: the add-start-results test guards code the diff does not touch — reject, planned change: AC2 asks for it.
- diff-bug #8: eight About rows run one code path — reject, planned change: AC5 asks for each sentence.
- diff-bug #9: "Such a plugin stays listed" reads as the unmarked plugins — fix now.
- diff-bug #10: "Source, read" reads oddly, and a note with no period runs on — fix now for the link text; reject the rest, style: all 6 notes end in a period.
- diff-bug #11: "the build reads the others" is broad — reject, planned change: AC5 asks for this sentence.
- diff-bug #12: the INDEX line is out of order — fix now.
- diff-bug #13: the README's Details text limits facts beyond the id to records the build read — fix now.
- diff-bug #14: DESIGN's "Upstream files are the source of truth" is not annotated — reject, false: that line is a banked interview note, and the Data sources text states the hand-kept fact.
- diff-bug #15: the plain-text fallback is unreachable under the schema pattern — reject, planned change: T3 links through `safeHref`, as the other links do.
- diff-bug #16: the `read` pattern accepts `2026-13-99` — reject, planned change: AC1 names this pattern.
- diff-bug #17: no fixture has both the lock and the card — reject, false: the two conditions are separate, and each has its own tests.
- blame-history #1: an invalid `paidService` stops the build, against D-054's "no hold" — reject, false: D-054's hold means a bot pull request's hold, `pnpm check` refuses such a value before a merge, and an invalid `index.json` has stopped the build since M003.
- blame-history #2: the home intro overclaims — reject, planned change: AC5 asks for this sentence.
- blame-history #3: the About intro contradicts itself — reject, false: its new sentence states the exception to the one before.
- blame-history #4: the `read` pattern is weak — reject, planned change: same as diff-bug #16.
- prior-review #1: the plugin page's mark reaches touch and keyboard users only by tooltip — reject, false: the Details fact on the same page gives the words.
- prior-review #2: confirm that the re-read ended before review — reject, false: the work log records it before `401339c`.
- ripple #1: DESIGN's plugin page head omits the card — fix now.
- ripple #2: the README's plugin page opening omits the marks — fix now.
- ripple #3: the README's home row list omits the card — reject, false: the sentences after it name each mark, as they do for the lock.
- ripple #4: DESIGN's "facts that a reader can check" covers a hand-read fact — reject, false: its source link makes it checkable, which D-054 states.
- ripple #5: the README's record sentence omits `paidService` — fix now.
- ripple #6: the changelog names one of the two changed schemas — fix now.
- fresh reader of T4 #1: Immersive Translate's README gives no price, though the ledger says "paying" — fix now: the maker's pricing page lists Pro as paid, and the ledger now says so.
- fresh reader of T4 #2: Geyi's README names membership tiers and recharge events but no price — reject, false: tiers and recharges show payment to the maker.
- fresh reader of T4 #3: Equalang's selection translation may be free — reject, false: document translation is the main use, and its pricing page lists no free plan.
- fresh reader of T4 #4 and #5: two no-mark reasons are loosely worded — reject, style: the verdicts hold.
- claim audit: its intro finding and its four notes are recorded in the work log.
- Every fix-now line above: fixed `cc7b6cb`. Recheck at that commit: `pnpm test` exits 0 with 2173 passed and 6 skipped, `pnpm check` reports 695 entries and 0 problems, and `cairn_validate.py` exits 0. AC3 and AC4 stay pinned by the exact tests, and the fact's test now pins the new link text. The fixes changed no `plugins/` file, so AC6's and AC7's script results stand.
- Findings: 34, with 15 fixed, 19 rejected, 0 sent to a follow-up. Substantive amendments: 0. Changed snapshot files: 0. No PR is open, so no PR conversation was read.
