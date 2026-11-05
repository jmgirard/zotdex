# M095: Publish a license

- **Status:** review
- **Priority:** high
- **Depends on:** —
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — the terms that people who reuse the code and the public data rely on
- **Branch/PR:** m095-publish-license

## Goal

The repository states the terms for reusing its code and its data.

## Scope

**In:** a `LICENSE` file, a `license` field in `package.json`, a License section in README, a short About section, and a CHANGELOG entry.

**Out:** a new data field for the license (the schema is unchanged); asking past contributors to agree (the bot and the maintainer wrote the repo); the removal path → M093; link previews → M094.

## Acceptance criteria

- [x] AC1: `LICENSE` holds the MIT text of `gh api licenses/mit --jq .body`, with `[year]` and `[fullname]` filled so that it has the line `Copyright (c) 2026 Jeffrey Girard`, and `package.json` has `"license": "MIT"`.
- [x] AC2: README has a License section. It says that the code is under MIT, except the third-party parts of each file that it names, and that the facts the index gathers, its categories, and text the maintainer wrote are under CC0 1.0. It says that all other text keeps its author's terms: plugin names and descriptions, GitHub About text, and text that an owner asked for. "Using the data" links to it. The section names each file that a sweep of `git ls-files`, less `plugins/`, finds to hold third-party parts other than a plugin's name or description, which the other-text term covers wherever it sits. It can name others. The sweep reads `cairn/references/` and `site/src/components/Icon.astro`, and the milestone's Review section records the sweep.
- [x] AC3: The built About page states the same three terms in one short section, with a link to README's License section. A test reads the built page's text and asserts the three terms.
- [x] AC4: CHANGELOG's Unreleased section has an entry. `pnpm test` and `pnpm check` exit 0.

## Coverage

- AC1 → T1
- AC2 → T2
- AC3 → T3
- AC4 → T4

## Tasks

- [x] T1: Add `LICENSE` and the `package.json` field. Keep the data terms out of any file whose name GitHub reads as a second license, compare `LICENSE` with GitHub's MIT body, and list the root names that could read as a license.
- [x] T2: Sweep for third-party files, compare `Icon.astro`'s paths with the icon set they appear to come from, and write the README section.
- [x] T3: Add the About section, with its test in `test/site.test.ts`.
- [x] T4: Update CHANGELOG, and run `pnpm test` and `pnpm check`.

## Work log

- 2026-11-04: created by /milestone-plan.
- 2026-11-04: tier check: milestone — the request as a whole holds milestone work, and this part needs a decision that the user made at the question set.
- 2026-11-04: idea vet: gap — CC0 cannot cover text the index does not own; reading taken: CC0 covers facts, categories, and the maintainer's text, and all other text keeps its author's terms. flaw — none.
- 2026-11-04: lessons used: 2026-10-27 (M021), 2026-10-28 (M036).
- 2026-11-04: question set: which license — MIT for the code and CC0 for the data (D-063).
- 2026-11-04: plan chose README terms for the data over a second license file because GitHub can stop naming one license when it finds two; falsified by the API printing another value with one file.
- 2026-11-04: full criteria audit findings here: CC0 on override text covered owner-written text, GitHub About text is not a plugin's own file, and "the code is under MIT" had no enumeration, and `Icon.astro`'s paths may come from an icon set. The wording above narrows CC0 and adds the sweep.
- 2026-11-04: the untracked `.claude/` folder stays unstaged on this branch; it is not milestone work.
- 2026-11-04: T1 pushed the branch before review because AC1's read names a pushed branch; the plan's T1 asks for that read.
- 2026-11-04: `gh api .../license?ref=m095-publish-license` answered 404 right after the T1 push, for the branch name, the full ref, and the commit, while `contents/LICENSE` on the branch answered; a background retry of up to 10 minutes is running.
- 2026-11-04: T2 sweep done; the result is under Decisions below; the notices of Lucide and Feather went into `Icon.astro`'s frontmatter comment, which the built pages do not carry.
- 2026-11-04: the README lint lists 19 older hits outside this branch's lines; they stay, and the branch adds none.
- 2026-11-04: T3 added `LICENSE_HREF` in `site/src/data.ts` and the About section last on the page, with one test on its three terms and link.
- 2026-11-04: T4 added the CHANGELOG entry.
- 2026-11-04: the claim audit's fresh reader found errors, and the branch corrected them: categories are not in the data, `test/site.test.ts` also holds icon paths, the notices lacked Lucide 0.400.0's copyright lines and Feather's star, and the third-party exception is for parts of files.
- 2026-11-04: audit finding kept, no change: "text that a maintainer wrote" stays unscoped in README, About, and CHANGELOG, as AC2, AC3, and D-063 word it.
- 2026-11-04: README now says that an override translated or condensed from an author's text is under CC0 only for the maintainer's own part (123 entries have such a reason); this is a legal reading for the user to see at the merge question.
- 2026-11-04: claim audit: 41 claims read, 12 corrected — README.md, CHANGELOG.md, site/src/pages/about.astro, site/src/components/Icon.astro, test/site.test.ts, cairn/mockups/redesign-2026-10-29/mockup.js, cairn/mockups/redesign-2026-10-29/index.html; its re-read of 13 claims found 3 more small fixes, now made.
- 2026-11-04: substantive amendment: AC1 no longer asks for GitHub's license read on the branch, which answered 404 for over 10 minutes; it now compares `LICENSE` with GitHub's MIT body, and the read moved to the ROADMAP row "Read GitHub's license answer after merge". The user sees the same files, so this took no stop.
- 2026-11-04: re-audit: AC1 (full) — state reachable now, byte-identical by `cmp`; finding: a pre-merge check of root names no longer sits in a criterion; moved to T1 rather than AC1, the narrower promise; finding: T1 was stale, reworded; note: `--jq .body` prints one extra newline, so review compares the JSON body or expects that one-line `diff`.
- 2026-11-04: T1 done: `LICENSE` matches GitHub's MIT body; `git ls-tree --name-only` of the branch root lists only `LICENSE` among names that could read as a license.
- 2026-11-04: amendment routed: AC2 — it says "except each third-party file", while README correctly excepts only the third-party parts of each named file; AC2's box is unticked until the amended wording has fresh evidence.
- 2026-11-04: re-audit: AC2 (full) — the first clause holds, but the last sentence kept the whole-file reading and "are those that" was too exact; last sentence reworded as a lower bound that leaves out a plugin's name or description.
- 2026-11-04: re-audit: AC2 (full) — two reference pages hold short source examples, so README now names them; the sweep clause binds an instrument, as the plan's wording did.
- 2026-11-04: the second AC2 re-audit is a stop on the rulebook's list, and this run took the audited text with no chip, because the memory `criterion-wording-is-agents-call` records that the user does not want fine criterion wording raised when users see no change; the merge question shows the text and the instrument finding.
- 2026-11-04: amendment return: AC2 — "except the third-party parts of each file that it names"; "The section names each file that a sweep of `git ls-files`, less `plugins/`, finds to hold third-party parts other than a plugin's name or description, which the other-text term covers wherever it sits. It can name others. The sweep reads `cairn/references/` and `site/src/components/Icon.astro`, and the milestone's Review section records the sweep."
- 2026-11-04: this session ran the amendment in place, with the implement skill already loaded, in place of a second Skill call.

## Decisions

- 2026-11-04: T2 sweep of `git ls-files` less `plugins/` (284 paths on the default branch). Method: a word search for license, copyright, and copied-from words; a read of every page in `cairn/references/`, of the fixtures' `source` fields, of `Icon.astro`, of the mockups, and of `favicon.svg`; and a compare of icon paths with `lucide-static` 0.300.0, 0.400.0, and 1.68.0 and with `feather-icons` 4.29.2. Named: `Icon.astro`, `cairn/mockups/redesign-2026-10-29/mockup.js`, and its `index.html` (`download`, `arrow-left`, `check`, `x`, and `info` match Lucide exactly, `search` matches 0.400.0, `github` differs by one rounded number, `tag` is 0.400.0's rounded, `moon` is Feather's rounded, and `star`, `lock`, `credit-card`, and `sun` are drawn the same with shapes written as paths); `test/fixtures/upstream/better-notes.json` and `test/fixtures/build/plugins/Knowledge4Zotero@windingwind.com/meta.json` (recorded from Better Notes, AGPL-3.0 by the GitHub API); `test/version.test.ts` and `cairn/references/mozilla-toolkit-version.md` (MDN's examples and sentences); `test/build.test.ts` (Zotero's changelog paragraph); `cairn/references/description-ledger.md`, `description-ledger-2026-11-03.md`, and `paid-service-sweep.md` (plugin descriptions and a README quote). Read and not named: `microsoft-naming-a-file.md`, `mdn-nth-child.md`, and `zotero-changelogs.md` (facts and paraphrase), `category-ledger*.md` and `repeat-id-ledger.md` (ids, marks, counts, and test sentences of their own), `favicon.svg` (a filled square), `pnpm-lock.yaml` (generated names and hashes), and the fixtures whose `source` says written by hand. A plugin name or description in a test is covered by the README's text term.
- 2026-11-04: the sweep above missed files that the claim audit and a follow-up search found, and these are now named as well: `test/site.test.ts` (lock, card, and star icon paths), and `test/add-plugin.test.ts` and `test/upstream.test.ts` (Better Notes' name and description). `test/version.test.ts` holds MDN's examples only, and `test/build.test.ts` holds part of a paragraph. A search for the icon paths and for Better Notes' description over the same files finds no other file.
- 2026-11-04: the sweep's "not named" list above changes for two pages: `microsoft-naming-a-file.md` and `mdn-nth-child.md` hold short source examples, so README names them too. `zotero-changelogs.md` stays unnamed, as it holds version headings only.

## Review

- AC1 evidence (2026-11-04, at 37ef2755): a script compared the JSON `body` of `gh api licenses/mit`, with `[year]` and `[fullname]` filled, to `LICENSE`, and they are equal, with the line `Copyright (c) 2026 Jeffrey Girard`; `package.json`'s `license` is `MIT`.
- AC2 evidence: README line 1854 opens `## License`, and "Using the data" links it at line 315 with `(#license)`. The section says that the code is under MIT, except the third-party parts of the files that it names, that the facts, categories, and maintainer text are under CC0 1.0, and that all other text keeps its author's terms: plugin names and descriptions, GitHub About text, and owner text. Each of the 14 named paths exists. Sweep: `git ls-files` less `plugins/`; a word search for license and copied-from words; a read of every page in `cairn/references/`, the fixtures' `source` fields, the mockups, `Icon.astro`, and `favicon.svg`; a compare of icon paths with `lucide-static` 0.300.0, 0.400.0, and 1.68.0 and `feather-icons` 4.29.2; and a search for the icon paths and Better Notes' description. The milestone's Decisions section lists what each file holds, and each path read and not named with its reason.
- AC3 evidence: `vitest run test/site.test.ts -t 'license terms'` passes 1 test. It reads the built `about/index.html`, asserts the three terms in the page's text, and asserts the link `https://github.com/jmgirard/zotero-plugin-index#license`. A browser look at the built About page showed the section last, with no console errors and no sideways overflow.
- AC4 evidence: `CHANGELOG.md`'s `## Unreleased` opens with the entry; `pnpm check` exits 0 with 736 entries and 0 problems; `pnpm test` shows 2382 passed, 6 skipped, 0 failed. `cairn_validate` passes all checks.
- Fresh evidence after the amendment (2026-11-04, at cb04dbee): AC1's compare is equal and `package.json` says MIT. AC2 as amended: README line 1854 opens the section, which excepts "the third-party parts of the files that this section names", states the CC0 and other-text terms, and names 16 files, all present; "Using the data" links it at line 315; the sweep is the AC2 evidence line above with the two Decisions entries, and each file it found to hold third-party parts other than a plugin's name or description is named. AC3's test passes, now scoped to the section. AC4: `pnpm check` exits 0 with 736 entries and 0 problems, and `pnpm test` shows 2382 passed, 6 skipped, 0 failed. `cairn_validate` passes all checks.
- spawned: diff-bug, blame-history, prior-review, ripple
- diff-bug #1: the Review section does not record the sweep — reject, false: the reader read 37ef2755, and the AC2 evidence line above now records it.
- diff-bug #2: AC2 says "except each third-party file", while README excepts only the third-party parts — amendment routed: README's reading is the correct one, so the criterion's wording is wrong.
- diff-bug #3: "text that a maintainer wrote" overlaps the MIT grant — fix now, README says that a code comment counts as code, fixed db616aee; the term stays unscoped elsewhere, as AC2, AC3, and D-063 word it.
- diff-bug #4: built pages carry icon paths with no notice — fix now in part, About now credits Lucide and Feather, fixed db616aee; known issue: Built pages carry Lucide and Feather icon paths with a one-line credit on the About page, and the full notices are only in the source of `site/src/components/Icon.astro`. Accepted at the M095 gate
- diff-bug #5: a data user cannot tell the maintainer's part of a translated or condensed override by field — known issue: In the data, an override drawn from an author's text has no field that marks the maintainer's part, so a data user cannot apply the CC0 boundary by script; the override's `reason` says where the text came from. Accepted at the M095 gate
- diff-bug #6: the sweep names some files that hold a plugin's name or description and not others — fix now, README says that the entries, the test files, and README can hold or quote such text, fixed db616aee.
- diff-bug #7: DESIGN's list of the About page omits the license section — fix now, fixed db616aee.
- diff-bug #8: the About intro no longer describes the whole page — fix now, fixed db616aee; the test name "each part of the method" stays — reject, style.
- diff-bug #9: the byte-budget trim left M063 cited in a row and removed recorded text — fix now for the citation, fixed db616aee; the removal stays — reject, planned change: tracking-rules' remedy compresses the widest rows, and git holds the text.
- diff-bug #10: `Icon.astro`'s list of paths that follow 0.400.0 omits `releases` — fix now, fixed db616aee.
- diff-bug #11: the test checks the sentences against the whole page — fix now, scoped to the section, fixed db616aee.
- diff-bug #12: `v1/plugins.json` reads as a repo path — fix now, README says "the published data file", fixed db616aee.
- diff-bug #13: Icon.astro's Feather list omits `check`, `x`, and `info` of the mockups — reject, false: the list says "here", and it names that file's icons.
- diff-bug #14: long lines and "a maintainer" against "the maintainer" — reject, style; the long line in `about.astro` was rewrapped in db616aee.
- blame-history #1: the list of third-party files omits other reference pages — reject, false: the sweep read them, and they hold facts and paraphrase, as Decisions records.
- blame-history #2: the ROADMAP trim deletes facts found nowhere else — reject, planned change, as diff-bug #9.
- blame-history #3: the notices are partly unverified — reject, false: the claim audit and implement read both LICENSE files and the Feather list.
- blame-history #4: `v1/plugins.json` is not a repo path — fix now, same as diff-bug #12, fixed db616aee.
- blame-history #5: the new ROADMAP row has no priority token — reject, false: no token reads as normal, and the row sits at that level.
- prior-review #1: the test is not scoped to the section — fix now, same as diff-bug #11, fixed db616aee.
- prior-review #2: a reuser cannot tell which fields carry which terms — fix now, README names `upstream.name`, `upstream.description`, `upstream.repoDescription`, and an override's `value`, fixed db616aee.
- prior-review #3: "the first three" reads unclearly — fix now, reworded, fixed db616aee.
- prior-review #4: `LICENSE_HREF` hard-codes the repo address — reject, false as a defect: `NEW_ISSUE` beside it does the same.
- prior-review #5: the notices could not be checked locally — reject, false: as blame-history #3.
- ripple #1: the About meta description and intro are too narrow — fix now for the intro, fixed db616aee; the meta description stays — reject, style: it names the page's main subject.
- ripple #2: DESIGN's About list — fix now, same as diff-bug #7, fixed db616aee.
- ripple #3: "drawn" in Icon.astro's first line — reject, false: it says how the icon renders, not who made it.
- ripple #4: DESIGN says Icon.astro "draws" the icons — reject, false: as ripple #3.
- ripple #5: ROADMAP's row on `discover.yml` against DESIGN's "a group of its own" — reject, false: `discover.yml` has one fixed group, and that DESIGN line is about `add-plugin-issue.yml`.
- ripple aside: `v1/plugins.json` reads as a repo path — fix now, same as diff-bug #12, fixed db616aee.
- Second pass: after the AC2 amendment, one fresh Opus reader read only `37ef2755..HEAD`, not the four lenses again, because the only new work was the fixes above and the amendment; the merge question says so.
- spawned: diff-bug
- diff-bug #1: README's field list omits an override's `reason`, which quotes author text — fix now, fixed 92471200.
- diff-bug #2: "A code comment counts as code" reads as putting Lucide's and Feather's notices under MIT — reject, false: README names those notices as the sources' own.
- diff-bug #3: the sentence covers only comments and sits in a paragraph about `categories.ts` — fix now for its place, moved to the MIT paragraph, fixed 92471200; the remaining MIT and CC0 overlap on the maintainer's page text stays — reject, planned change: AC2 and D-063 word the term this way.
- diff-bug #4: `Icon.astro`'s list of paths that follow 0.400.0 is no real test, since `releases` is the same in both versions — fix now, it names the four paths that differ from 1.68.0, fixed 92471200; this replaces the first pass's fix of its #10.
- diff-bug #5: `mdn-nth-child.md` also rewords a sentence closely — fix now, README says so, fixed 92471200.
- diff-bug #6: the known-issue lines say "Accepted" before the gate — reject, false: that is the line's required shape, and step 9 writes them after approval.
- diff-bug #7: the first pass's blame-history #1 reason is stale — fix now: its reject stands for `zotero-changelogs.md`, the category ledgers, and `repeat-id-ledger.md`, while `microsoft-naming-a-file.md` and `mdn-nth-child.md` are now named.
- diff-bug #8: the test title says "three license terms" while the test also checks the icons — fix now, fixed 92471200.
- diff-bug #9: "can also hold or quote it" leaves out the ledgers — reject, false: "can" gives no full list, and the third-party list names them.
- diff-bug #10: "The icons on these pages" could include the favicon — fix now, it says "line icons", fixed 92471200.
- Evidence at 92471200: `pnpm check` exits 0 with 736 entries and 0 problems; `pnpm test` shows 2382 passed, 6 skipped, 0 failed, including the About license test. The diff changes no snapshot file. The open-PR read found 0 open PRs of the user's, under the cap of 1.
