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

- [ ] AC1: `LICENSE` holds the MIT text of `gh api licenses/mit --jq .body`, with `[year]` and `[fullname]` filled so that it has the line `Copyright (c) 2026 Jeffrey Girard`, and `package.json` has `"license": "MIT"`.
- [ ] AC2: README has a License section. It says that the code is under MIT, except each third-party file that it names, and that the facts the index gathers, its categories, and text the maintainer wrote are under CC0 1.0. It says that all other text keeps its author's terms: plugin names and descriptions, GitHub About text, and text that an owner asked for. "Using the data" links to it. The named files are those that a sweep of `git ls-files`, less `plugins/`, finds to come from a third party, with `cairn/references/` and `site/src/components/Icon.astro` read in that sweep, and the milestone's Review section records the sweep.
- [ ] AC3: The built About page states the same three terms in one short section, with a link to README's License section. A test reads the built page's text and asserts the three terms.
- [ ] AC4: CHANGELOG's Unreleased section has an entry. `pnpm test` and `pnpm check` exit 0.

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

## Decisions

- 2026-11-04: T2 sweep of `git ls-files` less `plugins/` (284 paths on the default branch). Method: a word search for license, copyright, and copied-from words; a read of every page in `cairn/references/`, of the fixtures' `source` fields, of `Icon.astro`, of the mockups, and of `favicon.svg`; and a compare of icon paths with `lucide-static` 0.300.0, 0.400.0, and 1.68.0 and with `feather-icons` 4.29.2. Named: `Icon.astro`, `cairn/mockups/redesign-2026-10-29/mockup.js`, and its `index.html` (`download`, `arrow-left`, `check`, `x`, and `info` match Lucide exactly, `search` matches 0.400.0, `github` differs by one rounded number, `tag` is 0.400.0's rounded, `moon` is Feather's rounded, and `star`, `lock`, `credit-card`, and `sun` are drawn the same with shapes written as paths); `test/fixtures/upstream/better-notes.json` and `test/fixtures/build/plugins/Knowledge4Zotero@windingwind.com/meta.json` (recorded from Better Notes, AGPL-3.0 by the GitHub API); `test/version.test.ts` and `cairn/references/mozilla-toolkit-version.md` (MDN's examples and sentences); `test/build.test.ts` (Zotero's changelog paragraph); `cairn/references/description-ledger.md`, `description-ledger-2026-11-03.md`, and `paid-service-sweep.md` (plugin descriptions and a README quote). Read and not named: `microsoft-naming-a-file.md`, `mdn-nth-child.md`, and `zotero-changelogs.md` (facts and paraphrase), `category-ledger*.md` and `repeat-id-ledger.md` (ids, marks, counts, and test sentences of their own), `favicon.svg` (a filled square), `pnpm-lock.yaml` (generated names and hashes), and the fixtures whose `source` says written by hand. A plugin name or description in a test is covered by the README's text term.
- 2026-11-04: the sweep above missed files that the claim audit and a follow-up search found, and these are now named as well: `test/site.test.ts` (lock, card, and star icon paths), and `test/add-plugin.test.ts` and `test/upstream.test.ts` (Better Notes' name and description). `test/version.test.ts` holds MDN's examples only, and `test/build.test.ts` holds part of a paragraph. A search for the icon paths and for Better Notes' description over the same files finds no other file.

## Review
