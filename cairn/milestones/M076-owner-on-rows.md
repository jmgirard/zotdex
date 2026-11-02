# M076: Show the owner on home page rows

- **Status:** in-progress
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

- [ ] AC1: In the name cell, a row whose `upstream?.repoUrl ?? record.repoUrl`, as the source link reads it, gives a result from `githubRepo` shows that owner. The owner's element sits outside `[data-name]` and `[data-description]`. A site test shows an upstream record and a failed record.
- [ ] AC2: A row whose repo URL is on another host, or is not a URL, shows no owner. A site test shows both.
- [ ] AC3: A site test shows two records with one display name and different owners, each showing its own owner.
- [ ] AC4: The search box does not match a row on its owner's text alone. The exact name-cell check shows the owner outside both attributes, and the home script test shows no match.
- [ ] AC5: At 375 px wide, with the longest current owner and a 39-letter fixture owner, neither the document nor `.table-card` scrolls sideways. An owner breaks only at a hyphen or is cut with an ellipsis.
- [ ] AC6: README's home page text and DESIGN's home table text state the owner. CHANGELOG's Unreleased section has an entry for it.
- [ ] AC7: The `verify` slot of `cairn/PROFILE.md` runs clean.

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
- [ ] T3: Build the site from the deployed data and read the page in the browser pane at 375 and 1280 px, in both color schemes.
- [ ] T4: Update README, DESIGN, and CHANGELOG. Run the `verify` slot.

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

## Decisions

## Review
