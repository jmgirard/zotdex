# M082: Mark plugins that need a paid service

- **Status:** planned
- **Priority:** normal
- **Depends on:** —
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — the data file and the site show a new fact to visitors and data consumers
- **Branch/PR:** —

## Goal

Show on the site when a plugin's main use needs a paid service from its maker, as a fact read by hand with its source, with no change to who is listed.

## Scope

**In:** an optional `paidService` field in `index.json` (`note`, `source`, `read`), which the build copies to the data. A credit card mark on the home row and in the plugin page's h1, a Details fact, a home legend line, and an About section. One read by hand of the entries at a named commit, with its record in `cairn/references/paid-service-sweep.md`, and the field written on each entry that the read marks.

**Out:** a mark for a plugin with a lasting free plan and a paid upgrade, or for one that also works with a third party's key (rejected, D-054). Reading plugins added after the read's commit (candidate row "Read new plugins for paid services"). A command that lists them (same row). A filter on this fact (no row; no one asked). Detecting the fact by a bot, holding, or refusing such a plugin (rejected, D-054).

## Acceptance criteria

- [ ] AC1: `schemas/index.v1.schema.json` gains an optional `paidService` object with exactly three required strings: `note` (1 to 160 characters, at least one of them not whitespace), `source` (matches `^https://\S+$`), and `read` (matches `^\d{4}-\d{2}-\d{2}$`). `pnpm check` accepts an entry with a valid object. Tests in `test/check.test.ts` show that it refuses each of these, naming the failing property: a missing `note`, `source`, or `read`, an empty `note`, a blank `note`, a `note` of 161 characters, a `source` that starts with `http://`, a `read` of `2026-11`, and an extra property.
- [ ] AC2: `pnpm build` writes an entry's `paidService` unchanged on its record in `v1/plugins.json`, on a record with `upstream` and on each of a read failure, a `not-read` record, and a `facts-invalid` record, and writes no such field for an entry without one. `schemas/plugins.v1.schema.json` defines the field as optional with the shape of AC1. `pnpm add-start-results` keeps the field. Tests in `test/build.test.ts` and the add-start-results tests assert each of these.
- [ ] AC3: A record with `paidService`, with `upstream` or with `failure`, shows a credit card mark beside its name on the home row and in the plugin page's h1, with one hidden text for screen readers that reads "Needs a paid service from its maker", and a record without the field shows no mark. The mark sits outside `[data-name]` and `[data-description]`, so the search box does not read its words. The home legend's line for the mark reads the same words. Tests in `test/site.test.ts` assert the mark, its absence, its place outside those elements, and the legend line, and a browser pane check at 375 and 1280 px finds no page wider than the viewport on the home page and on one marked plugin page.
- [ ] AC4: A marked plugin page's Details card holds the fact "Needs a paid service from its maker" with the `note`, a link to the `source`, and the `read` date, on a record with `upstream` and on a record with `failure`; a page without the field holds no such fact. Tests in `test/site.test.ts` assert each.
- [ ] AC5: The About page says that the mark means the plugin's main use stops without paying its maker, or stops after a trial, whether the payment is for credits, a membership, an activation code, or a paid plan. It also says that a lasting free plan with a paid upgrade, a plugin that also works with a third party's key, and a donation get no mark, that a maintainer reads this by hand, that a plugin with no mark can still cost money, that a marked plugin stays listed, and that an author can open an issue to correct it. The About and home page intros say that a maintainer reads the paid service fact by hand and the build reads the others. README and CHANGELOG describe the field, and each says to fetch any saved copy of `schemas/plugins.v1.schema.json` again. A site test asserts the About sentences and the intros; the README and CHANGELOG text is read at review against the code.
- [ ] AC6: `cairn/references/paid-service-sweep.md` names the word list and its matching rule, the list including Chinese terms such as 付费, 会员, 积分, and 激活码, the texts read (the descriptions in a named `plugins.json`, by its `generatedAt`, and each top-level file whose name starts with README, ignoring case, at a recorded default-branch SHA of each repo), the read date, and the commit whose `plugins/` entries it covers. It lists each entry with a hit with a verdict and a one-clause reason, and each entry where a text could not be read, naming the text. A re-run of the word list over those READMEs and that `plugins.json` reports no hit that the file does not list. The entries it marks are exactly the entries with `paidService` at the branch head, compared by a one-time script at review. For each marked entry, `source` answers HTTP 200 to a script or, where a script is blocked, loads in the browser pane, and a review read finds that the page states what `note` says and that this meets AC5's meaning.
- [ ] AC7: `git diff --name-status main...HEAD -- plugins/` lists only `M` lines on `index.json` files, each differing from main only by an added `paidService`, compared by a one-time script at review, and `git diff --stat main...HEAD -- src/discover/` is empty. `pnpm test` and `pnpm check` pass at the branch head.

## Coverage

- AC1 → T1
- AC2 → T2
- AC3 → T3
- AC4 → T3
- AC5 → T5
- AC6 → T4
- AC7 → T4, T5

## Tasks

- [ ] T1: Add `paidService` to `schemas/index.v1.schema.json`, with tests in `test/check.test.ts` for each refusal that AC1 names. `src/text-request/request.ts:154` already keeps other fields of `index.json`; confirm that with a test only if the change could break it.
- [ ] T2: Add the field to `PluginRecord`, `readEntry`, and every record path in `src/build/build.ts` (lines 215, 222, 229, and the map at 241), and to `schemas/plugins.v1.schema.json`. Confirm that `pnpm add-start-results` keeps it, with tests.
- [ ] T3: Add a credit card icon to `Icon.astro` and a `PaidServiceMark.astro` beside `NoSourceMark.astro`. Show it on the home row and in the h1, add the legend line and the Details fact (linked through `safeHref`), and add fixture records by text edit. Add a fixture id to each hand list in `test/site.test.ts`. Check 375 and 1280 px in the browser pane, with a site built from the deployed data.
- [ ] T4: Read the entries at a named commit by AC6's procedure, using login and account words as well as payment words. Write `cairn/references/paid-service-sweep.md` with its Provenance block and `INDEX.md` line, and write `paidService` on each entry that the read marks, with an English `note` that says what is paid. An entry in `plugins/` that the named `plugins.json` lacks is listed as not read for that text. At review, a reader re-reads 20 random verdicts of no mark, and a wrong one is a finding.
- [ ] T5: Write the About section and the intro sentences with site tests, then the README, the changelog entry, and DESIGN's Contract boundary, Data sources, Inclusion bar, and Function Families text. Run `pnpm test` and `pnpm check`.

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

## Decisions

## Review
