# M110: Use plain words on plugin pages

- **Status:** review
- **Priority:** normal
- **Depends on:** —
- **Driving RR:** —
- **Principles touched:** —
- **Resolves:** —
- **Surface tier:** user-facing — the text of every plugin page and the home row's Older data tooltip
- **Branch/PR:** m110-plain-plugin-pages

## Goal

A plugin page's text reads in the home page's plain words, as the user
approved it in the "Plugin page (M110)" section of
`cairn/references/plain-words-copy.md` (D-078).

## Scope

**In:** every line of that copy section on the plugin page template
(`site/src/pages/plugins/[id]/index.astro`): the Older data badge title and
note, the failure line, the categories label, the buttons, the install note,
the version card, the Details card with dates in "Month D, YYYY" form, the
Corrections table, and the badge card. Also the shared words in
`site/src/data.ts` (`languagesText`, `upstreamLines`), the home row's Older
data tooltip, and About's two quotes of renamed plugin page labels. The site
tests, `docs/site.md`, DESIGN.md, and one Unreleased CHANGELOG entry follow.

**Out:** the rest of About and the 404 page's text, which M111 holds; the
badge file's text, which D-071 fixes and READMEs show; the home page's other
text, which M109 set.

## Acceptance criteria

- [x] AC1: Each line of the "Plugin page (M110)" section of
  `cairn/references/plain-words-copy.md`, except its first and last, shows
  on a built plugin page as written, with `{…}` and `<date>` filled from the
  record, on one site-test fixture record that shows it (from the shared
  fixtures or the kept-record build in `test/site.test.ts`), as site tests
  show.
- [x] AC2: The "Older data" badge of the kept record in the site test's
  kept-record build carries the copy's badge title on its home row and on
  its plugin page, with the date from its `kept.readAt` written by
  `longDay`, as a site test shows.
- [x] AC3: The built About page names "Source code in the repository's top
  folder", the "Corrections by Zotdex" table, and its "In use" column where
  it named the old labels, as a site test shows.
- [x] AC4: At the branch head, the text outside code comments of each file
  under `site/src/pages/plugins/`, `site/src/data.ts`,
  `site/src/pages/index.astro`, and `docs/site.md`, with line breaks joined
  into spaces, holds none of "Zotero compatibility", "the release the index
  read", "Release read by the index", "Declared range:", "Index categories",
  "Manifest description", "Host of update.json", "Menus and settings in",
  "Unknown (no translations found)", "Upstream value", "Override value",
  "The last build could not read", "The build that wrote this page", "Facts
  from an earlier build", "Source code at the repository's top level", and
  "the index does not review its code"; and the joined text of
  `cairn/DESIGN.md` holds none of the quoted labels "Zotero compatibility",
  "Index categories", "Menus and settings in", and "Unknown (no translations
  found)" outside a sentence that names them as earlier wording; as a search
  of those files shows.
- [x] AC5: In the browser pane at 375 px and 1280 px, the plugin page of
  `filetrans@euclpts.com` (corrections and a paid-service fact), from a site
  built from the deployed data, shows its version card, Details card, and
  Corrections table with the page's `documentElement.scrollWidth` equal to
  its `clientWidth`; `pnpm test` passes; `CHANGELOG.md`'s Unreleased section
  has one entry for the change.

## Coverage

- AC1 → T1, T2, T4
- AC2 → T1, T3, T4
- AC3 → T3, T4
- AC4 → T5
- AC5 → T6

## Tasks

- [x] T1: In `site/src/data.ts`, set `languagesText`'s fallback to "Language
  not listed" and `upstreamLines`' manifest label to "Plugin file:", add an
  Older data title helper that uses `longDay`, and use `longDay` for the
  plugin page's dates.
- [x] T2: In `site/src/pages/plugins/[id]/index.astro`, set every line of
  the copy section that AC1 names.
- [x] T3: In `site/src/pages/index.astro`, set the home row's Older data
  title from the T1 helper; in `site/src/pages/about.astro`, update the two
  quotes of renamed labels (near lines 169 and 209).
- [x] T4: Update `test/site.test.ts` per AC1 to AC3, on the shared fixtures
  and the kept-record build.
- [x] T5: Search the AC4 strings, update `docs/site.md` and DESIGN.md where
  they quote them, and add the CHANGELOG entry.
- [x] T6: Build the site from the deployed data, check AC5 in the browser
  pane, and run `pnpm test`.

## Work log

- 2026-11-07: created by /milestone-plan.
- 2026-11-07: tier check: milestone — a change to the text that every plugin page visitor reads, with the wording a design choice.
- 2026-11-07: idea vet: gap — the wording was open; settled with the user over four rounds into `cairn/references/plain-words-copy.md`; gap — how far About goes; the user chose a short About with the full rules in docs/site.md (M111); no flaw.
- 2026-11-07: collision check: absorbs the candidate "Use plain words on plugin pages and About" with M111, and the parked "Name the build on the failure page" in full, since the failure line now names when this page was updated; D-037's own-grouping label kept as "Zotdex categories"; D-052's top-level meaning kept as "top folder"; D-064's install note sentence replaced by the footer's safety-or-features point (D-078); D-071's badge text unchanged; inbox sweep: 0 open issues, 14 open bot add-plugin pull requests, none overlapping.
- 2026-11-07: lessons used: 2026-10-25 (M001) pnpm via npx; 2026-10-26 (M015) serve the built site for the browser pane; 2026-10-27 (M021) Astro drops the space before a link; 2026-10-28 (M035) download the deployed data for a hand check; 2026-10-28 (M036) end an Edit at a line break; 2026-10-26 (M018) search joined docs text; 2026-10-29 (M048) iframe width check; 2026-11-07 (M109) Astro writes an apostrophe as `&#39;` in inserted text, and dates need UTC.
- 2026-11-07: question set: wording — the user approved the copy file's Plugin page and About sections on 2026-11-07, after asking for before-and-after views, the footer's safety-or-features sentence in place of "doesn't review anyone's code", and a shorter About.
- 2026-11-07: criteria audit (full mode, fresh Opus) returned 15 findings, all taken: AC1 names the kept-record build and one fixture per line with values filled; AC4 searches DESIGN's quoted labels only, exempts earlier-wording notes, and skips code comments; AC5 measures the page, on a deployed record with corrections and a paid fact; the copy's range line says "Supported versions:", the reports rule names the major version, "a 10.0 release", "no known release", and the badge title says "in its latest update"; M111's empty docs criterion was dropped.
- 2026-11-07: plan gate chose two milestones (plugin pages, then About) over one because the two pages ship apart and one would pass the criteria tripwire; falsified by M111 needing to undo M110 text.
- 2026-11-07: implement started on m110-plain-plugin-pages; the untracked `.claude/` folder is unrelated and stays unstaged.
- 2026-11-07: T1 to T4 landed in one commit, since the new words fail the old expectations until the tests change; `keptTitle` in `site/src/data.ts` gives both Older data titles; the unused `day()` helper is gone; `longDay` on a paid fact's `read` relies on the schema's YYYY-MM-DD pattern; new tests cover the version table's headers, the Corrections text and headers, the badge card text, the "Supported versions:" line, and About's three label quotes; `pnpm test` 2515 passed, `pnpm check` 741 entries, 0 problems.
- 2026-11-07: the M109 lesson on `&#39;` holds for inserted text but not for an attribute: a `title={…}` value keeps a raw apostrophe in the built page.
- 2026-11-07: T5: updated `docs/site.md` (languages, categories, links, install note, version card, Details, Corrections, source label) and DESIGN.md's plugin page and About lines; added the CHANGELOG entry; the AC4 joined-text search over 4 files hits only DESIGN's "named … before M109" note; `pnpm test` 2515 passed.
- 2026-11-07: T6: built 743 pages from the deployed `v1/plugins.json`; in the browser pane, `filetrans@euclpts.com` at 375 px and 1280 px shows "Zotero versions", "Details", and "Corrections by Zotdex" with `documentElement.scrollWidth` equal to `clientWidth` (375, 1280); a planted 900 px div made it 900, so the check can fail.
- 2026-11-07: claim audit: 83 claims read, 1 corrected — `site/src/pages/plugins/[id]/index.astro`, `CHANGELOG.md`, `test/site.test.ts`; "Updates come from" became "Checks for updates at", since `updateHost` is the `update_url` host and the update file can download elsewhere; the "couldn't reach" Older data wording stays to match the approved home legend; both at the user's choice, shown old line, problem, and new line per CLAUDE.md.

## Decisions

## Review

- AC1: `pnpm test` at 14444191, 2515 passed, 6 skipped. Each copy line has a passing site test on a fixture record: the kept note (kept-record build), the failure line ("shows the table of %s"), "Zotdex categories" and the buttons ("opens the main content of %s"), the install note, "Zotero versions" and its line under it, the headers ("names the table's columns"), the cells (`expectedRows`, the extra-majors test), "Supported versions:" (the About-link test), the report line and buttons, every Details label and value (the Details list test, the paid, archived, source, repository, prerelease, and languages tests), the Corrections heading, text, headers, and "Plugin file:" lines, the two owner links, and the badge card text.
- AC2: vitest by name at 14444191, passed: "a kept record > shows the row … plus an Older data badge" asserts the home row's badge title "Zotdex couldn't reach this plugin in its latest update, so these facts are from <date>", the date being the fixture `readAt` 2026-11-03 written by `longDay`, and "says on the plugin page that the build …" asserts the same badge in the plugin page's h1.
- AC3: vitest by name at 14444191, passed: "the About page > says which user reports count, …" asserts About's "Corrections by Zotdex" table sentence, its "In use" column sentence, and "Source code in the repository's top folder".
- AC4: a node script (scratchpad `ac4.mjs`) joins each file's lines, drops `//` comments, and searches the 4 files (`site/src/pages/plugins/[id]/index.astro`, `site/src/data.ts`, `site/src/pages/index.astro`, `docs/site.md`) for the 16 strings, and DESIGN's joined text for the 4 quoted labels: at 14444191, 1 hit, DESIGN's "(named "Menus and settings in" before M109)", an earlier-wording sentence the criterion exempts; the same script on main's files finds 28 hits, so it can fail.
- AC5: site rebuilt at 14444191 from the deployed `v1/plugins.json` (743 pages); in the browser pane, `filetrans@euclpts.com` in 375 px and 1280 px iframes shows the version card, Details card, and Corrections table, with `documentElement.scrollWidth` 375 and 1280 equal to `clientWidth` (T6's planted 900 px div showed the check can fail); `pnpm test` 2515 passed (AC1 run); `CHANGELOG.md` Unreleased has one entry for the change, its first bullet.
- Consistency gate: `cairn_validate.py` all checks passed (after rewording one Review line that quoted a long-form date); no principle changed, so no `cairn_impact`; the generic profile names no toolchain checks.
- spawned: diff-bug, blame-history, prior-review, ripple
