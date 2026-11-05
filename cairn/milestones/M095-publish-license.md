# M095: Publish a license

- **Status:** in-progress
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

- [ ] AC1: `LICENSE` holds the MIT text with the line `Copyright (c) 2026 Jeffrey Girard`, `package.json` has `"license": "MIT"`, and `gh api 'repos/jmgirard/zotero-plugin-index/license?ref=<branch>' --jq .license.spdx_id` prints `MIT` for the milestone branch.
- [ ] AC2: README has a License section. It says that the code is under MIT, except each third-party file that it names, and that the facts the index gathers, its categories, and text the maintainer wrote are under CC0 1.0. It says that all other text keeps its author's terms: plugin names and descriptions, GitHub About text, and text that an owner asked for. "Using the data" links to it. The named files are those that a sweep of `git ls-files`, less `plugins/`, finds to come from a third party, with `cairn/references/` and `site/src/components/Icon.astro` read in that sweep, and the milestone's Review section records the sweep.
- [ ] AC3: The built About page states the same three terms in one short section, with a link to README's License section. A test reads the built page's text and asserts the three terms.
- [ ] AC4: CHANGELOG's Unreleased section has an entry. `pnpm test` and `pnpm check` exit 0.

## Coverage

- AC1 → T1
- AC2 → T2
- AC3 → T3
- AC4 → T4

## Tasks

- [ ] T1: Add `LICENSE` and the `package.json` field. Keep the data terms out of any file whose name GitHub reads as a second license, and read the API on the pushed branch.
- [ ] T2: Sweep for third-party files, compare `Icon.astro`'s paths with the icon set they appear to come from, and write the README section.
- [ ] T3: Add the About section, with its test in `test/site.test.ts`.
- [ ] T4: Update CHANGELOG, and run `pnpm test` and `pnpm check`.

## Work log

- 2026-11-04: created by /milestone-plan.
- 2026-11-04: tier check: milestone — the request as a whole holds milestone work, and this part needs a decision that the user made at the question set.
- 2026-11-04: idea vet: gap — CC0 cannot cover text the index does not own; reading taken: CC0 covers facts, categories, and the maintainer's text, and all other text keeps its author's terms. flaw — none.
- 2026-11-04: lessons used: 2026-10-27 (M021), 2026-10-28 (M036).
- 2026-11-04: question set: which license — MIT for the code and CC0 for the data (D-063).
- 2026-11-04: plan chose README terms for the data over a second license file because GitHub can stop naming one license when it finds two; falsified by the API printing another value with one file.
- 2026-11-04: full criteria audit findings here: CC0 on override text covered owner-written text, GitHub About text is not a plugin's own file, and "the code is under MIT" had no enumeration, and `Icon.astro`'s paths may come from an icon set. The wording above narrows CC0 and adds the sweep.

## Decisions

## Review
