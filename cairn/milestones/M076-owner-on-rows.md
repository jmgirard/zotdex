# M076: Show the owner on home page rows

- **Status:** review
- **Priority:** normal
- **Depends on:** —
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — readers see the owner on the public home page
- **Branch/PR:** m076-owner-on-rows

## Goal

Each home page row with a GitHub repo shows that repo's owner, so plugins of one name can be told apart.

## Scope

**In:** The plugin cell in `site/src/pages/index.astro`, its style in `site/src/layouts/Base.astro`, the site tests, and the docs.

**Out:**
- Searching by owner: the search box keeps reading name and description, as DESIGN states. A user request would plan it.
- The hold rule: M075.
- The owner in `v1/plugins.json`: the data already has `repoUrl`.

## Acceptance criteria

- [x] AC1: In the name cell, a row whose `upstream?.repoUrl ?? record.repoUrl`, as the source link reads it, gives a result from `githubRepo` shows that owner. The owner's element sits outside `[data-name]` and `[data-description]`. A site test shows an upstream record and a failed record.
- [x] AC2: A row whose repo URL is on another host, or is not a URL, shows no owner. A site test shows both.
- [x] AC3: A site test shows two records with one display name and different owners, each showing its own owner.
- [x] AC4: The search box does not match a row on its owner's text alone. The exact name-cell check shows the owner outside both attributes, and the home script test shows no match.
- [x] AC5: At 375 px wide, with the longest current owner and a 39-letter fixture owner, neither the document nor `.table-card` scrolls sideways. An owner breaks only at a hyphen or is cut with an ellipsis.
- [x] AC6: README's home page text and DESIGN's home table text state the owner. CHANGELOG's Unreleased section has an entry for it.
- [x] AC7: The `verify` slot of `cairn/PROFILE.md` runs clean.

## Coverage

- AC1 → T1, T2
- AC2 → T1, T2
- AC3 → T2
- AC4 → T2
- AC5 → T3
- AC6 → T4
- AC7 → T4

## Tasks

- [x] T1: Add the owner element to the name cell in `index.astro`, with `githubRepo` as its source, and style it in `Base.astro`. Write `{" "}` where a line break must stay a space.
- [x] T2: Add the site tests. Update the exact name-cell check in `test/site.test.ts`.
- [x] T3: Build the site from the deployed data and read the page in the browser pane at 375 and 1280 px, in both color schemes.
- [x] T4: Update README, DESIGN, and CHANGELOG. Run the `verify` slot.

## Work log

- 2026-11-02: created by /milestone-plan.
- 2026-11-02: tier check: milestone — split from the M075 plan, whose rule lists more plugins that share a name.
- 2026-11-02: idea vet: none found; 5 names already appear twice in the index, read 2026-11-02.
- 2026-11-02: question set: show the owner — no preference; the agent took the recommendation to show it.
- 2026-11-02: lessons used: 2026-10-27 (M021), 2026-10-28 (M035), 2026-10-29 (M048), 2026-10-29 (M054), 2026-10-30 (M061).
- 2026-11-02: criteria audit (full): 3 findings, on AC1's source, AC4's test stand-in, and AC5's scroll element and long owners; all taken in this amendment after e38c8aa. The first pass found the same source and search facts.
- 2026-11-02: T1, T2 done in one commit, tests first: 16 site tests failed without the code, and `pnpm test` and `pnpm check` pass with it.
- 2026-11-02: choices: the owner is its own line under the name, "By <owner>" as on the plugin page, plain text with no link so each row keeps its tab stops, and no `title`; a block element needs no `{" "}`.
- 2026-11-02: new fixture `same-name-plugin@example.org` shares First Plugin's name, and its upstream URL has a 39-letter owner that differs from its `repoUrl`.
- 2026-11-02: T3 done: site built from the deployed data (671 rows) with 2 rows' owners changed to 39-character ones, one with hyphens; with every row unhidden, document and `.table-card` scrollWidth equal clientWidth at 375 and 1280 px; with `contain` removed at 375 px, `.table-card` is 435 against 337, so the check can fail.
- 2026-11-02: T3 also: every owner stays on one line; at 375 px the 2 planted owners and the real `CentreForDigitalHumanities` are cut with an ellipsis; light and dark seen at both widths with no console error; searching "windingwind" shows 1 of its 7 rows, whose description names it.
- 2026-11-02: T4 done: README, DESIGN, and CHANGELOG state the owner; `pnpm test` and `pnpm check` pass.
- 2026-11-02: the simple-english hook flagged 1 new README line, now fixed, and 3 older README and 8 older CHANGELOG hits; the older lines stay, since this milestone did not write them and several quote program output.
- 2026-11-02: claim audit: 20 claims read, 1 corrected — README.md, CHANGELOG.md, site/src/layouts/Base.astro, test/site.test.ts
- 2026-11-02: correction to the T3 lines: those iframe widths were 371 and 1276 px, since the border took 4 px, so `CentreForDigitalHumanities` was cut only at 371; at a true 375 px no current owner is cut (Review, AC5).

## Decisions

## Review

Evidence read 2026-11-02 at de66952; origin/main is an ancestor of the branch, so no merge was needed.

- AC1: `test/site.test.ts` passes "shows the owner of first-plugin@example.org as example" (upstream record), "… broken-plugin@example.org as example" (failed record), and "shows the name cell of %s", which asserts the exact cell with `<div class="owner" data-owner>` as a sibling of `[data-name]` and `[data-description]`. same-name-plugin shows its upstream owner, not its `repoUrl` owner.
- AC2: the same test passes for `repo-gitlab@example.org` (another host) and `ssh-plugin@example.org` (not a URL): no owner. Read again at d8c8b13.
- AC3: "shows each owner on two rows of one name" passes: both rows display First Plugin, one shows `example`, one the 39-letter owner.
- AC4: the exact name-cell test passes for every fixture id, with the owner outside both attributes. "matches a row on its name but not on its owner's text alone" passes: `?q=first+plugin` shows both rows, `?q=<39-letter owner>` shows none.
- AC5: site built at de66952 (no site source changed since) from the deployed data with 2 owners planted, every one of 671 rows unhidden, in a borderless iframe with a 375 px viewport: document scrollWidth 375 = clientWidth 375, `.table-card` 341 = 341. Tallest owner 19.5 px (one line), `white-space: nowrap`, `text-overflow: ellipsis`. Only the 39-letter owner and the 39-character hyphenated owner are cut; no current owner is. With `contain` removed, the document is 420 against 375 and `.table-card` 435 against 341, so the check can fail. At 1280 px, 1280 = 1280 and 1006 = 1006, nothing cut.
- AC6: README line 16 and DESIGN line 150 state "By <owner>"; CHANGELOG's Unreleased section has the entry.
- AC7: at d8c8b13, `pnpm test`: 1934 passed, 6 skipped, type check clean. `pnpm check`: 671 entries, 0 problems.
- Gate: `cairn_validate.py` all checks passed; the generic profile adds no toolchain checks; no principle changed, so `cairn_impact` is skipped.
- spawned: diff-bug, blame-history, prior-review, ripple
- diff-bug #1: README's "with or without a trailing slash" for home rows has no test — fix now, fixed d8c8b13
- diff-bug #2: a cut owner can hide the difference between two long owners on rows of one name at phone width — reject, planned change: AC5 allows the ellipsis, and the plugin page shows the full owner.
- diff-bug #3: AC5 rests on `contain: inline-size`, seen only in Chromium, and no test covers the CSS — follow-up, new parked row "Close gaps in the home owner line", since no documented or common use is known to reach it.
- diff-bug #4: AC5's evidence was measured at 371 px, since the iframe's border took 4 px — fix now: measured again with no border, in AC5's line above, fixed d8c8b13.
- diff-bug #5: a DESIGN sentence says `contain` cuts the owner, but `overflow`, `text-overflow`, and `white-space` do — fix now, fixed d8c8b13
- diff-bug #6: a DESIGN clause omits that other URLs show no owner — fix now, fixed d8c8b13
- diff-bug #7: the AC3 test's name assertion reads the fixture, not the page — reject, style: the exact name-cell test reads the rendered name of both rows.
- diff-bug #8: the row header's text grows by "By <owner>" for screen readers — reject, planned change: AC1 puts the owner in the name cell, which already holds the description.
- diff-bug #9: an owner search still matches a row whose description names that owner — reject, false: AC4 and the README say the search reads the description.
- diff-bug #10: one generated test title reads "as undefined" — reject, style.
- blame-history #1: the `githubRepo` gaps of "Close small gaps on the site pages" item (8) now reach home rows, so owner `..` shows as "By .." — follow-up, new parked row "Close gaps in the home owner line"; all 671 deployed URLs read 2026-11-02 have the plain form.
- blame-history #2: the README presents the case-sensitive host as the rule — reject, false: it states current behavior, as README's repo line text already does, and the candidate row records the possible change.
- blame-history #3: a short README line and the order of the owner and Archived sentences — reject, style.
- prior-review #1: the owner test leans on next-plugin's upstream URL, which GitHub never yields, against the M061 lesson — fix now: drop that case, since same-name-plugin already shows that the upstream URL comes first, fixed d8c8b13
- prior-review #2: the new search test runs only in `node:vm` — reject, planned change: AC4 names the home script test, and a browser search was also read by hand.
- prior-review #3: the owner sits inside the row header — reject, planned change: as diff-bug #8.
- ripple #1: README and CHANGELOG do not say which URL supplies the owner — reject, false: the row and its source link read one variable, so they cannot differ.
- ripple #2: the fixture's new record could change the 4-category assertion — reject, false: the record matches no category, and that test passes.
